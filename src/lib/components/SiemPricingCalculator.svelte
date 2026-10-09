<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import PricingProviderRow from '$lib/components/PricingProviderRow.svelte';
	import { estimateDataLake } from '$lib/data-lake-pricing.mjs';
	import { estimateQueryLatency } from '$lib/query-latency.mjs';
	import {
		volumeTiers,
		retentionOptions,
		benchmarkData,
		getRoverLatency,
		formatNumber,
		formatVal,
		type ProviderComparison
	} from '$lib/pricing-calculator';
	let { dataLake = false }: { dataLake?: boolean } = $props();

	// Query Intensity Options starting at Standard SOC baseline (1.0x)
	const queryIntensityOptions = [
		{
			id: 'base',
			label: 'Standard SOC',
			factor: 1.0,
			desc: '1.0× query workload. Standard SOC alert triage, daily incident investigations & threat hunting.'
		},
		{
			id: 'hunting',
			label: 'Advanced Hunting',
			factor: 2.5,
			desc: '2.5× query workload. Intensive threat hunting sweeps, IOC retroactive back-testing & deep analytics.'
		},
		{
			id: 'ai',
			label: 'AI Agents SOC',
			factor: 5.0,
			desc: '5.0× query workload. Autonomous AI SOC agents running continuous investigations and historical pivots.'
		},
		{
			id: 'ir',
			label: 'Incident Response',
			factor: 10.0,
			desc: '10.0× query workload. Active breach response, full telemetry forensic sweeps & multi-year lookbacks.'
		}
	];

	// State
	let selectedVolumeIdx = $state(4); // Default: 1 TB/day
	let selectedRetentionIdx = $state(3); // Default: 3 Years
	let selectedQueryIntensityIdx = $state(2); // Default: AI Agents SOC (5x)
	let billingPeriod = $state<'monthly' | 'yearly'>('monthly');
	let activeVolume = $derived(volumeTiers[selectedVolumeIdx]);
	let activeRetention = $derived(retentionOptions[selectedRetentionIdx]);
	let activeQueryIntensity = $derived(queryIntensityOptions[selectedQueryIntensityIdx]);
	// SIEM and SDL keep their existing discrete volume benchmarks.
	let bm = $derived(benchmarkData[volumeTiers[selectedVolumeIdx].gbPerDay]);

	// Retention duration R in years
	const R = $derived(activeRetention.R);
	// Query intensity multiplier Q
	const Q = $derived(activeQueryIntensity.factor);
	// Compare one uncached historical search. Query workload changes monthly count only.
	const latencyWorkload = $derived({
		dailyGB: activeVolume.gbPerDay,
		retentionDays: Math.round(R * 365)
	});
	const totalSearchableTB = $derived(activeVolume.tbPerMonth * R * 12);

	let roverYearly = $derived(bm.rover.yearly1Y);
	let roverCost = $derived(billingPeriod === 'yearly' ? roverYearly : roverYearly / 12);

	// SIEM Retention & Query Scale: Base + R * StorageAdder
	function getSiemCost(baseYearly: number, oneYearHot: number): number {
		const storageAdder = oneYearHot - baseYearly;
		const yr = Math.round(baseYearly + R * storageAdder);
		return billingPeriod === 'yearly' ? yr : Math.round(yr / 12);
	}

	const falconIncludedRetentionDays = 395; // 13-month planning equivalent.

	function getArchiveLatency(providerId: string) {
		const includedDays =
			providerId === 'crowdstrike'
				? falconIncludedRetentionDays
				: providerId === 'datadog'
					? 30
					: null;
		if (includedDays === null) return null;
		const archiveDays = Math.max(0, Math.round(R * 365) - includedDays);
		if (archiveDays === 0) return null;

		// Illustrative linear scan-time model, not measured Falcon/Datadog latency.
		// Match pricing's 1% archive scan and 3:1 compression; workload changes query count only.
		const scannedGB = (activeVolume.gbPerDay * archiveDays * 0.01) / 3;
		// Assumed 0.4–3.5 GB/s, rounded from AWS gzip COUNT(*) examples:
		// 10 x 2.4 GB / 60s and 100 x 0.243 GB / 6.8s. Not a general performance bound.
		// https://aws.amazon.com/blogs/big-data/top-10-performance-tuning-tips-for-amazon-athena/
		const lowerSeconds = Math.max(1, Math.ceil(scannedGB / 3.5));
		const upperSeconds = Math.max(1, Math.ceil(scannedGB / 0.4));
		// Do not imply that a single query can run for days; configured timeouts may be lower.
		// https://docs.aws.amazon.com/athena/latest/ug/service-limits.html
		const maxTimeoutSeconds = 240 * 60;
		const timeoutRisk = upperSeconds > maxTimeoutSeconds;
		const duration = (seconds: number) => {
			const unit = seconds >= 3600 ? 'hr' : seconds >= 60 ? 'min' : 'sec';
			const value = seconds / (unit === 'hr' ? 3600 : unit === 'min' ? 60 : 1);
			return { value: value.toLocaleString('en-US', { maximumFractionDigits: 1 }), unit };
		};
		const lower = duration(lowerSeconds);
		const upper = duration(Math.min(upperSeconds, maxTimeoutSeconds));
		const range =
			lowerSeconds > maxTimeoutSeconds
				? `>${upper.value} ${upper.unit}`
				: `${lower.value}${lower.unit === upper.unit ? '' : ` ${lower.unit}`}–${upper.value}${timeoutRisk ? '+' : ''} ${upper.unit}`;

		return {
			label: `(est. ${range}/query${timeoutRisk ? ' · timeout risk' : ''})`,
			title:
				`Illustrative scan-time estimate, not measured vendor latency. Assumes 1% of the older archive scanned per query (${scannedGB.toLocaleString('en-US', { maximumFractionDigits: 1 })} compressed GB), 3:1 compression and 0.4–3.5 GB/s based on AWS gzip COUNT(*) examples. ` +
				'Excludes queueing and additional query processing; actual latency can fall outside this range. Retaining more data does not slow a query with a fixed time window. ' +
				(timeoutRisk
					? 'Displayed range is limited at the maximum adjustable Athena timeout of 4 hours; queries may time out earlier.'
					: 'Applies only to the modeled external Athena archive, not native SIEM searches.')
		};
	}

	// USD pricing checked 2026-09-29. Fixed calculation assumptions: 1 KB/event,
	// 3:1 compression, 1% of retained data scanned per query, 1,000 GB/hour warehouse
	// throughput. These are sizing assumptions, not measured vendor performance.
	// Annual totals use 365 days; monthly display divides the annual total by 12.
	function tieredCost(volume: number, bands: [number, number][]): number {
		let total = 0;
		let previous = 0;
		for (const [limit, rate] of bands) {
			total += Math.max(0, Math.min(volume, limit) - previous) * rate;
			if (volume <= limit) break;
			previous = limit;
		}
		return total;
	}

	function getProviderCost(provider: string): number {
		const dailyGB = activeVolume.gbPerDay;
		const days = Math.round(R * 365);
		const annualGB = dailyGB * 365;
		const queries = Math.round(activeVolume.totalSearches * Q) * 12;
		const storedGB = (dailyGB * days) / 3;
		// AWS bills binary GB/TB. S3 Standard, US East (N. Virginia).
		// https://aws.amazon.com/s3/pricing/
		const storageAnnual =
			tieredCost((storedGB * 1e9) / 2 ** 30, [
				[50 * 1024, 0.023],
				[500 * 1024, 0.022],
				[Infinity, 0.021]
			]) * 12;
		// https://aws.amazon.com/athena/pricing/ — $5/TB, 10 MB minimum/query.
		const queryAnnual = (rawGB: number) => {
			const scanMB = (rawGB * 1e9 * 0.01) / 3 / 2 ** 20;
			return (Math.max(10, Math.ceil(scanMB)) / 2 ** 20) * 5 * queries;
		};
		let annual = 0;
		if (provider === 'splunk') {
			// Base ingest planning bands, plus an equal ES allowance; not a public tariff.
			// https://siemcostcalculator.com/splunk-pricing
			const baseAnnual: Record<number, number> = {
				10: 16200,
				100: 90000,
				250: 206250,
				500: 400000,
				1000: 725000,
				2000: 1383333.3333333333,
				10000: 6650000,
				100000: 66500000
			};
			// Retention assumption: 90 days included; $0.10/compressed GB/month budget.
			annual = baseAnnual[dailyGB] * 2 + ((dailyGB * Math.max(0, days - 90)) / 3) * 0.1 * 12;
		} else if (provider === 'sentinel') {
			// Azure East US Analytics: PAYG $4.30/GB or daily commitment plus same-rate overage.
			// https://www.microsoft.com/en-us/security/pricing/microsoft-sentinel/
			// https://prices.azure.com/api/retail/prices (Sentinel, eastus)
			const commitments = [
				[100, 296],
				[200, 548],
				[300, 800],
				[400, 1037.33],
				[500, 1265],
				[1000, 2480],
				[2000, 4800],
				[5000, 11550],
				[10000, 22240],
				[25000, 53450],
				[50000, 102600]
			];
			const ingestDaily = Math.min(
				dailyGB * 4.3,
				...commitments.map(([capacity, price]) => (Math.max(dailyGB, capacity) * price) / capacity)
			);
			// First 90 days in Analytics; older retention in the lake, billed at 6:1.
			// Lake: $0.026/compressed GB/month, $0.005/uncompressed GB scanned.
			const lakeGB = dailyGB * Math.max(0, days - 90);
			annual = ingestDaily * 365 + (lakeGB / 6) * 0.026 * 12 + lakeGB * 0.01 * queries * 0.005;
		} else if (provider === 'crowdstrike') {
			// Falcon Next-Gen SIEM AWS PAYG: $0.00595/MB = $5.95/GB of third-party data.
			// Ingest, search and 13-month retention are included; all input is assumed third-party.
			// https://aws.amazon.com/marketplace/pp/prodview-vubjuepxztndi
			annual = annualGB * 5.95;
			// Longer retention uses the existing parallel full-window S3 archive model.
			// Older searches run in Athena; this is not a Falcon extended-retention price.
			// Archive pipeline, requests and native rehydration costs are excluded.
			if (days > falconIncludedRetentionDays) {
				annual += storageAnnual + queryAnnual(dailyGB * (days - falconIncludedRetentionDays));
			}
		} else if (provider === 'datadog') {
			// Annual rates: $0.10/GB ingest + $5/M analyzed events + $2.50/M 30-day indexed events.
			// https://www.datadoghq.com/pricing/list/
			// At 1 KB/event, one GB contains one million events; all logs analyzed/indexed.
			annual = annualGB * (0.1 + 5 + 2.5);
			// Beyond 30 days, budget a parallel full-window S3 archive with Athena searches.
			// This is external archive retention, not Datadog hot indexing or rehydration.
			if (days > 30) annual += storageAnnual + queryAnnual(dailyGB * (days - 30));
		} else if (provider === 'qradar') {
			// $12,074.40/year per 500 EPS + 10,000 FPM unit; no peak/extra-flow allowance.
			// https://aws.amazon.com/marketplace/pp/prodview-b7klpa4c3hz2i
			const eps = (dailyGB * 1e6) / 86400;
			// Storage allowance: $0.10/compressed GB/month; appliance/VM compute excluded.
			annual = Math.ceil(eps / 500) * 12074.4 + storedGB * 0.1 * 12;
		} else if (provider === 'snowflake' || provider === 'databricks') {
			// Aggregate runtime at the fixed throughput above; one-minute budget per query/load.
			const queryHours = queries * Math.max(1 / 60, (storedGB * 0.01) / 1000);
			const loadHours = 365 * Math.max(1 / 60, dailyGB / 1000);
			if (provider === 'snowflake') {
				// AWS US East Standard: $2/credit, Gen1 XS 1 credit/hour, $23/compressed TB/month.
				// https://www.snowflake.com/pricing/pricing-guide/
				annual = (queryHours + loadHours) * 2 + ((storedGB * 1e9) / 2 ** 40) * 23 * 12;
			} else {
				// Serverless SQL $0.70/DBU; fixed sizing allowance of 4 DBU/hour, plus S3.
				// https://www.databricks.com/product/pricing
				annual = (queryHours + loadHours) * 0.7 * 4 + storageAnnual;
			}
		} else if (provider === 'athena') {
			// Security Lake: native AWS logs other than CloudTrail; graduated monthly tiers.
			// https://aws.amazon.com/security-lake/pricing/
			const ingestGiB = ((annualGB / 12) * 1e9) / 2 ** 30;
			const ingestion = tieredCost(ingestGiB, [
				[10 * 1024, 0.25],
				[30 * 1024, 0.15],
				[50 * 1024, 0.075],
				[Infinity, 0.05]
			]);
			annual = (ingestion + ingestGiB * 0.035) * 12 + storageAnnual + queryAnnual(dailyGB * days);
		}
		return billingPeriod === 'yearly' ? annual : annual / 12;
	}

	const additionalDataLakeDefinitions: {
		id: Parameters<typeof estimateDataLake>[0];
		name: string;
		category: string;
		logo: string;
		pricingNote?: string;
	}[] = [
		{
			id: 'cribl',
			name: 'Cribl Lake + Search',
			category: 'Telemetry Data Lake',
			logo: '/assets/vendor-logos/cribl.svg'
		},
		{
			id: 'elastic-security',
			name: 'Elastic Security Serverless',
			category: 'Security Analytics Complete',
			logo: '/assets/vendor-logos/elastic.svg',
			pricingNote:
				'AWS us-east-1 Security Analytics Complete: graduated monthly ingestion and retained-data rates. Assumes billed normalized volume equals input volume. Excludes egress, support upgrades, Agent Builder, workflow, and LLM token charges.'
		},
		{
			id: 'bigquery',
			name: 'Google BigQuery',
			category: 'Data Warehouse & Lake Analytics',
			logo: '/assets/vendor-logos/google-bigquery.svg'
		},
		{
			id: 'fabric',
			name: 'Microsoft Fabric OneLake',
			category: 'Data Lake & Analytics Platform',
			logo: '/assets/vendor-logos/microsoft-fabric.svg'
		}
	];
	const additionalDataLakes = $derived<ProviderComparison[]>(
		additionalDataLakeDefinitions.map((provider) => {
			const estimate = estimateDataLake(provider.id, {
				dailyGB: activeVolume.gbPerDay,
				retentionDays: Math.round(R * 365),
				queriesPerMonth: Math.round(activeVolume.totalSearches * Q)
			});
			const periodFactor = billingPeriod === 'yearly' ? 12 : 1;
			return {
				...provider,
				cost: estimate.monthly * periodFactor
			};
		})
	);

	let allProviders = $derived([
		{
			id: 'splunk',
			name: 'Splunk ES',
			category: 'Traditional SIEM',
			cost: getProviderCost('splunk')
		},
		{
			id: 'sentinel',
			name: 'Microsoft Sentinel',
			category: 'Cloud SIEM',
			cost: getProviderCost('sentinel')
		},
		{
			id: 'crowdstrike',
			name: 'CrowdStrike Falcon Next-Gen SIEM',
			category:
				Math.round(R * 365) > falconIncludedRetentionDays
					? 'Cloud SIEM + S3/Athena archive'
					: 'Cloud SIEM (13-month retention)',
			cost: getProviderCost('crowdstrike')
		},
		{
			id: 'datadog',
			name: 'Datadog Cloud SIEM',
			category:
				Math.round(R * 365) > 30
					? 'Cloud SIEM + S3/Athena archive'
					: 'Cloud SIEM (30-day indexed retention)',
			cost: getProviderCost('datadog')
		},
		{
			id: 'qradar',
			name: 'IBM QRadar',
			category: 'Enterprise SIEM',
			cost: getProviderCost('qradar')
		},
		{
			id: 'opentext',
			name: 'OpenText ArcSight',
			category: 'Enterprise SIEM',
			cost: getSiemCost(bm.opentext.baseYearly, bm.opentext.oneYearHot)
		},
		{
			id: 'snowflake',
			name: 'Snowflake',
			category: 'Security Data Lake',
			cost: getProviderCost('snowflake')
		},
		{
			id: 'databricks',
			name: 'Databricks',
			category: 'Lakehouse',
			cost: getProviderCost('databricks')
		},
		{
			id: 'athena',
			name: 'AWS Security Lake + Athena',
			category: 'Data Lake',
			cost: getProviderCost('athena')
		}
	]);

	const providerList = $derived<ProviderComparison[]>(
		dataLake
			? [
					...allProviders.filter((provider) =>
						['snowflake', 'databricks', 'athena'].includes(provider.id)
					),
					...additionalDataLakes
				]
			: allProviders
	);
</script>

<div class="dark rounded-2xl border border-border bg-card p-4 text-foreground sm:p-8 lg:p-10">
	<div class="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
		<!-- LEFT COLUMN: Controls & Options -->
		<div class="flex flex-col justify-between space-y-3.5">
			<div>
				<Badge
					variant="outline"
					class="rounded-full border-border bg-transparent px-3 py-1 text-overline tracking-normal text-text-muted"
				>
					Interactive Cost Model
				</Badge>
				<h3 class="mt-4 text-heading-3 font-bold tracking-tight text-text-primary">
					Calculate your savings with Rover.
				</h3>
				<p class="mt-3 text-body-sm leading-relaxed text-text-secondary">
					{dataLake
						? 'Data lakes and warehouses charge for storage and query compute.'
						: 'Traditional SIEMs and data warehouses charge for retention and query scans.'} Rover pricing
					is based on daily ingestion volume, with multi-year retention included and queries billed at
					$0.01–$0.10 each.
				</p>
			</div>

			<!-- Control 1: Daily Ingestion Volume -->
			<div class="space-y-2 rounded-xl border border-border bg-background p-4 sm:p-5">
				<div class="flex items-center justify-between">
					<label for="volume-slider-standard" class="text-overline font-semibold text-text-primary">
						Daily Ingestion Volume
					</label>
					<span
						class="rounded-md border border-border bg-card/80 px-3 py-1 text-label-sm font-bold text-text-primary"
					>
						{activeVolume.label}
					</span>
				</div>

				<input
					id="volume-slider-standard"
					type="range"
					min="0"
					max={volumeTiers.length - 1}
					step="1"
					bind:value={selectedVolumeIdx}
					class="volume-slider h-2 w-full cursor-pointer rounded-lg bg-border accent-primary"
				/>

				<div class="relative h-5 text-caption font-medium text-text-muted">
					<span class="absolute left-0">10 GB/d</span>
					<span class="absolute left-[42.86%] hidden -translate-x-1/2 sm:inline">500 GB/d</span>
					<span class="absolute left-[71.43%] hidden -translate-x-1/2 sm:inline">2 TB/d</span>
					<span class="absolute right-0 text-right">100 TB/d</span>
				</div>
				<div class="pt-1 text-caption text-text-muted">
					Telemetry volume: <strong class="font-bold text-text-primary"
						>{activeVolume.tbPerMonth} TB / month</strong
					>
					({dataLake ? activeVolume.desc.replace(' SIEM', '') : activeVolume.desc})
				</div>
			</div>

			<!-- Control 2: Query Workload Factor -->
			<div class="space-y-2 rounded-xl border border-border bg-background p-4 sm:p-5">
				<div class="flex items-center justify-between">
					<span class="text-overline font-semibold text-text-primary">Query Workload Factor</span>
					<span
						class="rounded-md border border-border bg-card/80 px-3 py-1 text-label-sm font-bold text-text-primary"
					>
						{activeQueryIntensity.factor}× Factor
					</span>
				</div>

				<div class="grid grid-cols-2 gap-3">
					{#each queryIntensityOptions as option, idx (option.id)}
						<button
							type="button"
							onclick={() => (selectedQueryIntensityIdx = idx)}
							class="flex min-w-0 flex-col items-start justify-between gap-2 rounded-xl border p-3 transition-all sm:flex-row sm:items-center sm:p-3.5 {selectedQueryIntensityIdx ===
							idx
								? 'border-primary/80 bg-card font-semibold text-foreground shadow-sm'
								: 'border-border bg-card/40 text-text-secondary hover:border-border/80 hover:text-text-primary'}"
						>
							<div class="flex min-w-0 items-center gap-2.5">
								<div
									class="flex h-4 w-4 items-center justify-center rounded-full border {selectedQueryIntensityIdx ===
									idx
										? 'border-primary bg-primary/20'
										: 'border-border'}"
								>
									{#if selectedQueryIntensityIdx === idx}
										<div class="h-2 w-2 rounded-full bg-primary"></div>
									{/if}
								</div>
								<span class="min-w-0 text-label-sm leading-tight font-bold text-text-primary"
									>{option.label}</span
								>
							</div>
							<span
								class="self-end text-caption font-bold sm:self-auto {selectedQueryIntensityIdx ===
								idx
									? 'text-primary'
									: 'text-text-muted'}"
							>
								{option.factor}×
							</span>
						</button>
					{/each}
				</div>

				<p class="text-caption leading-relaxed text-text-muted">
					↳ {activeQueryIntensity.desc}
				</p>

				<div
					class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card/60 p-3 text-caption"
				>
					<span class="text-text-muted">Calculated query workload:</span>
					<span class="font-bold text-text-primary">
						{formatNumber(activeVolume.totalSearches * activeQueryIntensity.factor)} queries / mo
						<span class="font-normal text-text-muted">
							({formatNumber(activeVolume.alertsPerMonth * activeQueryIntensity.factor)} alerts + {formatNumber(
								activeVolume.huntsPerMonth * activeQueryIntensity.factor
							)} hunts)
						</span>
					</span>
				</div>
			</div>

			<!-- Control 3: Retention Period -->
			<div class="space-y-2 rounded-xl border border-border bg-background p-4 sm:p-5">
				<div class="flex items-center justify-between">
					<span class="text-overline font-semibold text-text-primary"
						>Hot Tier Retention Period</span
					>
					<span
						class="rounded-md border border-border bg-card/80 px-3 py-1 text-label-sm font-bold text-text-primary"
					>
						{activeRetention.label}
					</span>
				</div>

				<div class="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-5">
					{#each retentionOptions as ret, idx (ret.label)}
						<button
							type="button"
							onclick={() => (selectedRetentionIdx = idx)}
							class="min-h-11 rounded-lg border px-2 py-2.5 text-center text-button-sm transition-all {selectedRetentionIdx ===
							idx
								? 'border-foreground bg-foreground font-bold text-background shadow-sm'
								: 'border-border bg-card/40 text-text-secondary hover:text-text-primary'}"
						>
							{ret.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Control 4: Billing Term Toggle -->
			<div
				class="flex items-center justify-between rounded-xl border border-border bg-background p-4"
			>
				<span class="text-overline font-semibold text-text-primary">Billing Term</span>
				<div class="flex rounded-lg border border-border bg-card p-1">
					<button
						type="button"
						onclick={() => (billingPeriod = 'monthly')}
						class="min-h-11 rounded-md px-3.5 py-1 text-button-sm transition-all {billingPeriod ===
						'monthly'
							? 'bg-foreground font-bold text-background shadow-sm'
							: 'text-text-muted hover:text-text-primary'}"
					>
						Monthly
					</button>
					<button
						type="button"
						onclick={() => (billingPeriod = 'yearly')}
						class="min-h-11 rounded-md px-3.5 py-1 text-button-sm transition-all {billingPeriod ===
						'yearly'
							? 'bg-foreground font-bold text-background shadow-sm'
							: 'text-text-muted hover:text-text-primary'}"
					>
						Yearly
					</button>
				</div>
			</div>
		</div>

		<!-- RIGHT COLUMN: Provider Cards -->
		<div class="flex flex-col space-y-2.5">
			<div class="hidden items-center justify-between px-1 pb-0.5 sm:flex">
				<span class="text-overline font-semibold text-text-muted">Provider</span>
				<span class="text-overline font-semibold text-text-muted"
					>{`Estimated Pricing (${billingPeriod})`}</span
				>
			</div>

			<!-- ROVER PLATFORM CARD -->
			<div
				class="relative mt-1 mb-6 overflow-hidden rounded-xl border border-border bg-background p-4 shadow-md sm:p-4"
			>
				<div
					class="flex flex-col items-stretch gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
				>
					<div class="flex min-w-0 items-center gap-4">
						<!-- Rover Brand Logo -->
						<img
							src="/rover-logo-64.png"
							alt="Rover Platform"
							class="h-10 w-10 shrink-0 object-contain"
							width="40"
							height="40"
							loading="lazy"
							decoding="async"
						/>

						<div class="max-w-[280px]">
							<div class="flex flex-wrap items-center gap-1.5">
								<span class="text-label-md font-bold text-text-primary">Rover Platform</span>
								<Badge
									class="rounded-full border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary"
								>
									{getRoverLatency(totalSearchableTB)}
								</Badge>
							</div>
						</div>
					</div>

					<div class="shrink-0 self-end text-right min-[420px]:self-auto">
						<div class="flex items-baseline justify-end gap-1">
							<span class="text-heading-3 font-bold text-primary">{formatVal(roverCost)}</span>
							<span class="text-caption font-medium text-text-muted"
								>/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span
							>
						</div>
					</div>
				</div>
			</div>

			<!-- COMPETITOR CARDS WITH EXACT WHITE/TRANSPARENT SVG / PNG ICONS -->
			{#each providerList as provider (provider.name)}
				<PricingProviderRow
					{provider}
					{roverCost}
					{billingPeriod}
					queryLatency={estimateQueryLatency(provider.id, latencyWorkload)}
					archiveLatency={getArchiveLatency(provider.id)}
				/>
			{/each}
		</div>
	</div>
</div>

<style>
	.volume-slider::-webkit-slider-thumb {
		transition:
			transform 0.2s ease,
			filter 0.2s ease;
	}
	.volume-slider::-moz-range-thumb {
		transition:
			transform 0.2s ease,
			filter 0.2s ease;
	}
	@media (hover: hover) {
		.volume-slider:hover::-webkit-slider-thumb {
			transform: scale(1.2);
			filter: brightness(1.15);
		}
		.volume-slider:hover::-moz-range-thumb {
			transform: scale(1.2);
			filter: brightness(1.15);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.volume-slider::-webkit-slider-thumb {
			transition-duration: 0.01ms;
		}
		.volume-slider::-moz-range-thumb {
			transition-duration: 0.01ms;
		}
		.volume-slider:hover::-webkit-slider-thumb {
			transform: none;
		}
		.volume-slider:hover::-moz-range-thumb {
			transform: none;
		}
	}
</style>
