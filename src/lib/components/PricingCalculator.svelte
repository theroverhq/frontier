<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Database } from '@lucide/svelte';
	import { estimateDataLake } from '$lib/data-lake-pricing.mjs';
	import { estimateQueryLatency } from '$lib/query-latency.mjs';
	let { dataLake = false }: { dataLake?: boolean } = $props();

	// Dynamic Rover query latency scaling anchored at ~100 TB = 10s.
	function getRoverLatency(tbTotal: number): string {
		if (tbTotal <= 5) return '< 1s instant search';
		if (tbTotal <= 25) return '< 3s instant search';
		if (tbTotal <= 60) return '< 6s instant search';
		if (tbTotal <= 150) return '< 10s instant search';
		if (tbTotal <= 500) return '< 35s instant search';
		if (tbTotal <= 1500) return '< 1.5 min search';
		if (tbTotal <= 5000) return '< 4 min search';
		return '< 12 min search';
	}

	const volumeTiers = [
		{
			label: '10 GB / day',
			gbPerDay: 10,
			tbPerMonth: 0.3,
			desc: 'Small Security Posture',
			alertsPerMonth: 450,
			huntsPerMonth: 70,
			totalSearches: 520
		},
		{
			label: '100 GB / day',
			gbPerDay: 100,
			tbPerMonth: 3.0,
			desc: 'Mid-Market Baseline',
			alertsPerMonth: 1250,
			huntsPerMonth: 260,
			totalSearches: 1510
		},
		{
			label: '250 GB / day',
			gbPerDay: 250,
			tbPerMonth: 7.5,
			desc: 'Growing Enterprise',
			alertsPerMonth: 2000,
			huntsPerMonth: 500,
			totalSearches: 2500
		},
		{
			label: '500 GB / day',
			gbPerDay: 500,
			tbPerMonth: 15.0,
			desc: 'Multi-Cloud Enterprise',
			alertsPerMonth: 3200,
			huntsPerMonth: 810,
			totalSearches: 4010
		},
		{
			label: '1 TB / day',
			gbPerDay: 1000,
			tbPerMonth: 30.0,
			desc: 'High-Volume Enterprise SIEM',
			alertsPerMonth: 5000,
			huntsPerMonth: 1040,
			totalSearches: 6040
		},
		{
			label: '2 TB / day',
			gbPerDay: 2000,
			tbPerMonth: 60.0,
			desc: 'Large Enterprise Scale',
			alertsPerMonth: 7500,
			huntsPerMonth: 1560,
			totalSearches: 9060
		},
		{
			label: '10 TB / day',
			gbPerDay: 10000,
			tbPerMonth: 300.0,
			desc: 'Global FinTech / SaaS Platform',
			alertsPerMonth: 15000,
			huntsPerMonth: 4120,
			totalSearches: 19120
		},
		{
			label: '100 TB / day',
			gbPerDay: 100000,
			tbPerMonth: 3000.0,
			desc: 'Hyperscale Fortune 50 Enterprise',
			alertsPerMonth: 40000,
			huntsPerMonth: 14000,
			totalSearches: 54000
		}
	];

	// Retention duration options in years (R)
	const retentionOptions = [
		{ label: '30 Days', R: 30 / 365 },
		{ label: '90 Days', R: 90 / 365 },
		{ label: '1 Year', R: 1.0 }, // Benchmark baseline
		{ label: '3 Years', R: 3.0 },
		{ label: '10 Years', R: 10.0 }
	];

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

	// Rover baseline rates anchored at 250 GB/day = $50k/yr, 500 GB/day = $120k/yr, 1 TB/day = $200k/yr, 2 TB/day = $275k/yr
	// ArcSight retains the existing estimates; no public rate was verified.
	interface ProviderBenchmark {
		rover: { yearly1Y: number };
		opentext: { baseYearly: number; oneYearHot: number };
	}

	const benchmarkData: Record<number, ProviderBenchmark> = {
		10: {
			rover: { yearly1Y: 10000 },
			opentext: { baseYearly: 16000, oneYearHot: 21500 }
		},
		100: {
			rover: { yearly1Y: 25000 },
			opentext: { baseYearly: 160000, oneYearHot: 215000 }
		},
		250: {
			rover: { yearly1Y: 50000 }, // Exact $50k/yr anchor
			opentext: { baseYearly: 400000, oneYearHot: 538000 }
		},
		500: {
			rover: { yearly1Y: 120000 }, // Exact $120k/yr anchor
			opentext: { baseYearly: 800000, oneYearHot: 1075000 }
		},
		1000: {
			// 1 TB
			rover: { yearly1Y: 200000 }, // Exact $200k/yr anchor
			opentext: { baseYearly: 1600000, oneYearHot: 2150000 }
		},
		2000: {
			// 2 TB
			rover: { yearly1Y: 275000 }, // Exact $275k/yr anchor
			opentext: { baseYearly: 3200000, oneYearHot: 4300000 }
		},
		10000: {
			// 10 TB
			rover: { yearly1Y: 650000 },
			opentext: { baseYearly: 16000000, oneYearHot: 21500000 }
		},
		100000: {
			// 100 TB
			rover: { yearly1Y: 4500000 },
			opentext: { baseYearly: 160000000, oneYearHot: 215000000 }
		}
	};

	// State
	let selectedVolumeIdx = $state(4); // Default: 1 TB/day
	let selectedRetentionIdx = $state(3); // Default: 3 Years
	let selectedQueryIntensityIdx = $state(2); // Default: AI Agents SOC (5x)
	let billingPeriod = $state<'monthly' | 'yearly'>('monthly');

	// Active Selections
	let activeVolume = $derived(volumeTiers[selectedVolumeIdx]);
	let activeRetention = $derived(retentionOptions[selectedRetentionIdx]);
	let activeQueryIntensity = $derived(queryIntensityOptions[selectedQueryIntensityIdx]);
	let bm = $derived(benchmarkData[activeVolume.gbPerDay]);

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

	// Rover calculator pricing: ingestion subscription only.
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

	interface ProviderComparison {
		id: string;
		name: string;
		category: string;
		cost: number;
		logo?: string;
		pricingNote?: string;
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

	// Compact six-figure values; promote rounded 1,000K to 1M.
	const formatNumber = (val: number) => {
		const rounded = Math.round(val);
		if (rounded >= 999_950) {
			return `${(rounded / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
		}
		if (rounded >= 100_000) {
			return `${(rounded / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
		}
		return rounded.toLocaleString('en-US');
	};
	const formatVal = (val: number) => `$${formatNumber(val)}`;
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
					$0.01 each.
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
					class="h-2 w-full cursor-pointer rounded-lg bg-border accent-primary"
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
					<span class="text-overline font-semibold text-text-primary">Hot Tier Retention Period</span>
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
					>Estimated Pricing ({billingPeriod})</span
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
				{@const multiplier = (provider.cost / Math.max(1, roverCost)).toFixed(1)}
				{@const archiveLatency = getArchiveLatency(provider.id)}
				{@const queryLatency = estimateQueryLatency(provider.id, latencyWorkload)}
				<div
					class="flex flex-col items-stretch gap-4 rounded-xl border border-border bg-card/60 p-3 transition-all hover:bg-card min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:p-3.5"
				>
					<div class="flex min-w-0 items-center gap-2.5">
						<!-- Direct Competitor SVG / PNG Icon -->
						<div class="flex h-7 w-7 shrink-0 items-center justify-center">
							{#if provider.logo}
								<img
									src={provider.logo}
									alt=""
									width="28"
									height="28"
									class="h-7 w-7 shrink-0 object-contain brightness-0 invert"
								/>
							{:else if provider.id === 'crowdstrike'}
								<!-- CrowdStrike LogScale.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M27.082 23.066C26.5319 23.0117 25.5591 22.8747 24.3384 23.491C23.1201 24.1049 22.6408 24.1332 22.0411 24.0671C22.2158 24.3882 22.5723 24.8297 23.6938 24.91C24.813 24.9879 25.349 25.0233 24.7611 26.4187C24.7752 25.9961 24.6761 25.1815 23.564 25.3255C22.4519 25.4696 22.1922 26.4707 23.3845 26.9689C22.9973 27.0468 22.1756 27.094 21.5877 25.5569C21.1816 25.734 20.5536 26.0882 19.4155 25.2099C19.8122 25.3539 20.3009 25.3633 20.3009 25.3633C19.2904 24.8817 18.327 23.9844 17.7084 23.1392C18.1972 23.5028 18.7379 23.8664 19.2856 23.9349C18.6411 23.1462 17.1465 21.5714 15.319 19.9517C16.4948 20.719 17.9115 21.9326 20.2324 21.6587C22.5534 21.3849 24.1117 20.8536 27.0797 23.066"
										fill="currentColor"
									/>
									<path
										d="M17.1512 22.5179C15.6968 21.8875 15.3851 21.76 13.5127 21.2854C11.6427 20.8108 9.80106 19.8215 8.57092 18.2773C9.43745 18.9125 11.2106 20.1922 13.0287 20.0529C12.7525 19.6491 12.2425 19.3328 11.6333 19.014C12.3227 19.1793 14.4029 19.7105 17.1512 22.5179Z"
										fill="currentColor"
									/>
									<path
										d="M13.9825 17.1324C13.6071 16.0558 12.9295 14.6792 9.72073 12.6298C8.15768 11.598 5.86268 10.3017 2.84045 6.99854C3.05532 7.88867 4.01157 10.2049 8.82351 13.2106C10.4031 14.2896 12.4431 14.9555 13.9849 17.1301"
										fill="currentColor"
									/>
									<path
										d="M14.1809 18.693C13.7866 17.7816 12.9933 16.6129 9.8837 14.9459C8.4505 14.1432 5.99967 12.9059 3.79675 10.5566C3.99745 11.4043 5.01981 13.2672 9.42092 15.5953C10.6393 16.2658 12.7005 16.8962 14.1833 18.693"
										fill="currentColor"
									/>
									<path
										d="M25.9463 21.0966C27.0962 21.2713 27.0371 21.5145 27.0489 21.9348C26.5602 21.4012 25.9463 21.0966 25.9463 21.0966ZM17.1984 13.985C11.1374 12.2495 8.72673 10.0608 6.86145 7.77051C7.71381 10.4079 9.74437 11.3523 11.9142 13.1231C14.0841 14.894 14.2069 15.8455 14.8467 16.8915C16.2705 19.2219 16.4971 19.6068 17.9091 20.6244C19.5737 21.7294 21.5877 20.9809 23.7977 21.328C26.0077 21.6751 27.8328 23.3586 28.2295 24.0055C28.6923 23.1791 27.5873 21.9891 27.2874 21.6893C27.448 20.6079 24.8885 20.1309 23.9181 19.7602C23.7269 19.687 23.257 19.5784 23.6655 18.608C24.2156 17.2669 24.7894 16.1005 17.1984 13.9826"
										fill="currentColor"
									/>
								</svg>
							{:else if provider.id === 'datadog'}
								<!-- Datadog Cloud SIEM PNG -->
								<img
									src="/datadog.png"
									alt="Datadog Cloud SIEM"
									class="h-6 w-6 shrink-0 object-contain"
								/>
							{:else if provider.id === 'splunk'}
								<!-- Splunk ES.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M5.23595 16.9106C5.23595 17.1083 5.19505 17.2886 5.10741 17.4573C5.02561 17.6259 4.90292 17.7655 4.75685 17.8818C4.60494 17.9981 4.42967 18.0912 4.21933 18.1552C4.009 18.2191 3.78698 18.254 3.53575 18.254C3.23777 18.254 2.97486 18.2133 2.74115 18.1319C2.50745 18.0505 2.27374 17.9167 2.04004 17.7306L2.42565 17.1025C2.61261 17.2595 2.78205 17.37 2.92812 17.4456C3.08002 17.5154 3.23193 17.5561 3.38968 17.5561C3.58249 17.5561 3.7344 17.5096 3.85709 17.4049C3.97394 17.3061 4.03237 17.1723 4.03237 17.0036C4.03237 16.9338 4.02068 16.8641 3.99731 16.8001C3.97394 16.7361 3.93889 16.6721 3.88046 16.6082C3.82203 16.5442 3.74608 16.4686 3.64676 16.393C3.54743 16.3174 3.41889 16.2185 3.26114 16.1022C3.13845 16.015 3.0216 15.9335 2.91059 15.8405C2.79374 15.7474 2.69441 15.6544 2.60093 15.5497C2.50745 15.445 2.43149 15.3345 2.37307 15.2066C2.31464 15.0786 2.28543 14.939 2.28543 14.7762C2.28543 14.5901 2.32633 14.4214 2.40228 14.2702C2.47823 14.119 2.58924 13.9852 2.72362 13.8806C2.858 13.7701 3.0216 13.6886 3.20856 13.6305C3.39552 13.5723 3.60002 13.5374 3.82788 13.5374C4.06158 13.5374 4.28944 13.5723 4.50562 13.6305C4.72764 13.6945 4.92629 13.7817 5.11325 13.9038L4.76269 14.468C4.52315 14.2993 4.27192 14.2179 4.00316 14.2179C3.83956 14.2179 3.70518 14.2586 3.60002 14.3458C3.49485 14.4331 3.44227 14.5377 3.44227 14.6599C3.44227 14.7878 3.48901 14.8867 3.58249 14.9856C3.67597 15.0844 3.83372 15.2182 4.06158 15.3927C4.28944 15.5613 4.48225 15.7067 4.63416 15.8347C4.78607 15.9626 4.90292 16.0789 4.99056 16.1894C5.0782 16.2999 5.13662 16.4104 5.17168 16.5267C5.20673 16.6431 5.23595 16.771 5.23595 16.9106ZM10.4885 15.8056C10.4885 16.1603 10.4359 16.486 10.3249 16.7826C10.2138 17.0792 10.0678 17.3351 9.86913 17.562C9.67633 17.783 9.44847 17.9574 9.17971 18.0796C8.91679 18.2017 8.6305 18.2657 8.32084 18.2657C8.18062 18.2657 8.05208 18.254 7.92939 18.2308C7.80669 18.2075 7.69568 18.1668 7.58468 18.1086C7.47367 18.0505 7.3685 17.9807 7.26333 17.8876C7.15816 17.7946 7.04715 17.6841 6.9303 17.5561V20.4001H5.77931V13.6596H6.93615L6.94199 14.3167C7.15232 14.055 7.38018 13.8573 7.62557 13.7352C7.87096 13.613 8.15725 13.5491 8.48444 13.5491C8.78241 13.5491 9.05117 13.6072 9.29072 13.7177C9.53611 13.8282 9.74644 13.9852 9.92172 14.183C10.097 14.3807 10.2372 14.6192 10.3307 14.8925C10.4359 15.1658 10.4826 15.4741 10.4885 15.8056ZM9.22645 15.8521C9.22645 15.3578 9.12712 14.9739 8.92848 14.689C8.72983 14.404 8.45522 14.2644 8.11051 14.2644C7.74827 14.2644 7.45614 14.4156 7.2458 14.718C7.03547 15.0205 6.92446 15.4276 6.92446 15.9452C6.92446 16.4628 7.02963 16.8466 7.23996 17.1316C7.45029 17.4224 7.73658 17.562 8.09882 17.562C8.315 17.562 8.49612 17.5038 8.64219 17.3933C8.78241 17.2828 8.89926 17.1432 8.9869 16.9687C9.07454 16.8001 9.13881 16.614 9.17386 16.4104C9.20892 16.2127 9.22645 16.0266 9.22645 15.8521ZM11.0026 18.1435H12.1945V11.5601H11.0026V18.1435ZM17.2717 18.1493V13.6537H16.0798V16.0731C16.0798 16.2883 16.0681 16.457 16.0506 16.5733C16.0331 16.6896 16.0039 16.7943 15.9571 16.8931C15.7877 17.2653 15.478 17.4515 15.034 17.4515C14.6834 17.4515 14.4381 17.3235 14.2978 17.0734C14.2452 16.9804 14.2044 16.8699 14.181 16.7477C14.1576 16.6256 14.1459 16.4511 14.1459 16.2243V13.6537H12.9716V16.2069C12.9716 16.3813 12.9716 16.5267 12.9774 16.6489C12.9832 16.771 12.9891 16.8757 13.0008 16.9687C13.0125 17.0618 13.03 17.1432 13.0417 17.2188C13.0592 17.2886 13.0826 17.3584 13.1118 17.4282C13.2228 17.7073 13.3981 17.9109 13.6435 18.0563C13.8889 18.2017 14.1868 18.2657 14.5432 18.2657C14.8646 18.2657 15.145 18.2075 15.3846 18.097C15.6241 17.9865 15.8578 17.8062 16.0915 17.5503L16.0974 18.1493H17.2717ZM22.4015 18.1435V15.5962C22.4015 15.4217 22.4015 15.2763 22.3957 15.1542C22.3898 15.0321 22.384 14.9274 22.3723 14.8343C22.3606 14.7471 22.3431 14.6657 22.3256 14.5959C22.3081 14.5261 22.2847 14.4621 22.2613 14.3923C22.1503 14.1248 21.975 13.9155 21.7296 13.7701C21.4842 13.6247 21.1863 13.5491 20.8299 13.5491C20.5085 13.5491 20.2281 13.6072 19.9885 13.7177C19.749 13.8282 19.5153 14.0085 19.2816 14.2644V13.6654H18.0838V18.1493H19.2816V15.73C19.2816 15.5206 19.2874 15.3578 19.3049 15.2415C19.3225 15.1251 19.3517 15.0146 19.3926 14.9158C19.4685 14.7355 19.5912 14.6017 19.749 14.5087C19.9126 14.4156 20.0995 14.3691 20.3274 14.3691C20.678 14.3691 20.9234 14.497 21.0636 14.7471C21.1162 14.8402 21.1571 14.9507 21.1746 15.0728C21.198 15.1949 21.2096 15.3636 21.2096 15.5962V18.161L22.4015 18.1435ZM27.3269 17.8527L25.5156 15.6078L27.0464 13.9736L26.1466 13.5898L24.5516 15.4276H24.4231V11.5601H23.2253V18.1493H24.4231V15.7649L26.2168 18.2424L27.3269 17.8527Z"
										fill="currentColor"
									/>
									<path
										d="M31.96 15.5089V16.2417L28.3551 18.033V17.2421L31.1479 15.8695L28.3551 14.5144V13.7061L31.96 15.5089Z"
										fill="currentColor"
										fill-opacity="0.9"
									/>
								</svg>
							{:else if provider.id === 'sentinel'}
								<!-- Microsoft Sentinel.svg -->
								<svg
									class="h-6 w-6 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M6.44678 6.44727H16.4986V16.499H6.44678V6.44727Z" fill="currentColor" />
									<path d="M17.5012 6.44727H27.553V16.499H17.5012V6.44727Z" fill="currentColor" />
									<path d="M6.44678 17.501H16.4986V27.5528H6.44678V17.501Z" fill="currentColor" />
									<path d="M17.5012 17.501H27.553V27.5528H17.5012V17.501Z" fill="currentColor" />
								</svg>
							{:else if provider.id === 'snowflake'}
								<!-- Snowflake.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M27.8393 15.4249L25.1006 17.0009L27.8393 18.5721C28.0036 18.665 28.1476 18.7899 28.2629 18.9393C28.3782 19.0886 28.4624 19.2596 28.5108 19.442C28.5598 19.6248 28.5724 19.8155 28.5476 20.0031C28.5228 20.1907 28.4611 20.3716 28.3663 20.5354C28.1717 20.8648 27.8557 21.1047 27.4877 21.203C27.1194 21.3007 26.7274 21.2487 26.3972 21.0585L21.494 18.2417C21.1789 18.0621 20.9445 17.7688 20.8389 17.4219C20.7907 17.271 20.7685 17.113 20.7734 16.9547C20.7814 16.7099 20.8514 16.4711 20.9769 16.2608C21.1025 16.0505 21.2794 15.8756 21.4911 15.7524L26.3944 12.9385C26.5582 12.8438 26.7392 12.7823 26.9268 12.7575C27.1145 12.7328 27.3052 12.7452 27.488 12.7941C27.6709 12.8431 27.8423 12.9275 27.9925 13.0427C28.1427 13.1579 28.2687 13.3016 28.3634 13.4655C28.4589 13.6282 28.5211 13.8083 28.5464 13.9953C28.5718 14.1823 28.5597 14.3724 28.511 14.5547C28.4622 14.737 28.3777 14.9078 28.2624 15.0572C28.1471 15.2066 28.0033 15.3315 27.8393 15.4249ZM25.2461 23.0612L20.3457 20.2483C20.0932 20.1014 19.8016 20.0358 19.5105 20.0604C19.1494 20.085 18.8111 20.2462 18.5645 20.5113C18.317 20.7772 18.1792 21.1269 18.1763 21.491V27.1236C18.1762 27.3127 18.2135 27.5 18.286 27.6747C18.3585 27.8494 18.4648 28.0081 18.5988 28.1416C18.7328 28.275 18.8919 28.3807 19.0668 28.4525C19.2418 28.5243 19.4293 28.5608 19.6184 28.5599C20.416 28.5599 21.0605 27.9164 21.0605 27.1236V23.9735L23.805 25.5495C23.9686 25.6447 24.1494 25.7067 24.337 25.7319C24.5246 25.7571 24.7154 25.745 24.8983 25.6963C25.0812 25.6476 25.2527 25.5633 25.403 25.4482C25.5533 25.3331 25.6793 25.1894 25.774 25.0255C25.8688 24.8619 25.9304 24.6812 25.9552 24.4937C25.98 24.3063 25.9675 24.1158 25.9184 23.9331C25.8694 23.7505 25.7847 23.5794 25.6694 23.4296C25.554 23.2798 25.4101 23.1553 25.2461 23.0612ZM19.5914 17.5519L17.5531 19.5768C17.4833 19.6417 17.3929 19.68 17.2978 19.6847H16.6996C16.6046 19.6794 16.5143 19.6413 16.4443 19.5768L14.4069 17.5519C14.3433 17.4827 14.3059 17.3934 14.3009 17.2995V16.7023C14.306 16.6075 14.3434 16.5174 14.4069 16.447L16.4433 14.4221C16.5134 14.3585 16.6032 14.321 16.6976 14.3161H17.2978C17.3927 14.3205 17.483 14.358 17.5531 14.4221L19.5914 16.447C19.6546 16.5176 19.6917 16.6077 19.6964 16.7023V17.2995C19.6909 17.3933 19.6545 17.4823 19.5914 17.5519ZM17.9634 16.9903C17.9569 16.8951 17.9186 16.8049 17.8546 16.7341L17.265 16.1493C17.1943 16.0857 17.1038 16.0483 17.0088 16.0433H16.9857C16.8912 16.0483 16.8014 16.0857 16.7314 16.1493L16.1418 16.7341C16.0796 16.8054 16.0432 16.8957 16.0387 16.9903V17.0134C16.0387 17.0953 16.084 17.208 16.1418 17.2658L16.7314 17.8534C16.7901 17.9112 16.9038 17.9594 16.9857 17.9594H17.0088C17.1038 17.9543 17.1942 17.9169 17.265 17.8534L17.8546 17.2658C17.9183 17.1964 17.9563 17.1074 17.9625 17.0134V16.9903H17.9634ZM8.75032 10.9348L13.6526 13.7516C13.9166 13.9028 14.2094 13.9625 14.4888 13.9394C14.85 13.9144 15.1881 13.7525 15.4357 13.4867C15.6823 13.2217 15.821 12.8701 15.8239 12.5069V6.87434C15.8249 6.08248 15.1795 5.43994 14.3838 5.43994C13.5852 5.43994 12.9407 6.08248 12.9407 6.87531V10.0254L10.1953 8.4465C10.0314 8.3516 9.85046 8.28992 9.66275 8.26499C9.47503 8.24006 9.28425 8.25238 9.1013 8.30122C8.91834 8.35007 8.74681 8.4345 8.5965 8.54968C8.4462 8.66486 8.32006 8.80853 8.22531 8.97248C8.13072 9.13579 8.06928 9.31617 8.04453 9.50326C8.01977 9.69036 8.03218 9.88051 8.08104 10.0628C8.1299 10.2451 8.21425 10.416 8.32927 10.5656C8.44428 10.7152 8.58673 10.8407 8.75032 10.9348ZM19.5105 13.9394C19.7899 13.9625 20.0827 13.9028 20.3448 13.7516L25.2451 10.9358C25.4092 10.8426 25.5531 10.7178 25.6684 10.5684C25.7837 10.419 25.868 10.2482 25.9166 10.0659C26.0156 9.69679 25.9639 9.3035 25.773 8.97248C25.5815 8.64178 25.2665 8.4007 24.8972 8.30224C24.528 8.20378 24.1347 8.25602 23.804 8.44747L21.0605 10.0254V6.87434C21.0605 6.08248 20.416 5.43994 19.6184 5.43994C18.8189 5.43994 18.1763 6.08248 18.1763 6.87531V12.506C18.1764 12.8692 18.3141 13.2189 18.5616 13.4847C18.8092 13.7505 19.1482 13.9126 19.5105 13.9385V13.9394ZM14.4888 20.0604C14.1975 20.0355 13.9056 20.1007 13.6526 20.2473L8.75032 23.0603C8.58627 23.1538 8.44249 23.279 8.32738 23.4287C8.21226 23.5784 8.12812 23.7495 8.07985 23.9321C7.98077 24.301 8.03204 24.6942 8.22242 25.0255C8.41426 25.3558 8.72943 25.5965 9.09865 25.6946C9.46787 25.7927 9.86093 25.7402 10.1914 25.5485L12.9378 23.9725V27.1226C12.9378 27.9174 13.5833 28.559 14.3809 28.559C15.1766 28.559 15.822 27.9164 15.822 27.1236V21.491C15.8211 21.1275 15.6831 20.7776 15.4357 20.5113C15.1892 20.2461 14.8509 20.0849 14.4897 20.0604H14.4888ZM13.1594 17.4209C13.2076 17.2706 13.2288 17.1126 13.2249 16.9547C13.2166 16.7092 13.1459 16.47 13.0193 16.2596C12.8926 16.0492 12.7144 15.8746 12.5015 15.7524L7.60397 12.9395C7.27274 12.7487 6.87936 12.697 6.51007 12.7958C6.14079 12.8946 5.82574 13.1357 5.634 13.4664C5.53895 13.6295 5.47721 13.8099 5.45236 13.997C5.42751 14.1841 5.44004 14.3743 5.48923 14.5566C5.53842 14.7388 5.62329 14.9095 5.73893 15.0587C5.85456 15.2079 5.99865 15.3327 6.16286 15.4258L8.89963 17.0019L6.16286 18.5731C5.99845 18.6659 5.85427 18.7907 5.73879 18.9401C5.62332 19.0895 5.53889 19.2604 5.49046 19.4429C5.44138 19.6257 5.42887 19.8164 5.45367 20.004C5.47846 20.1917 5.54007 20.3726 5.63496 20.5363C5.82955 20.8668 6.14552 21.1066 6.5135 21.2039C6.88149 21.3022 7.27356 21.2502 7.60397 21.0594L12.5034 18.2426C12.8357 18.0548 13.0592 17.7561 13.1623 17.4219L13.1594 17.4209Z"
										fill="currentColor"
									/>
								</svg>
							{:else if provider.id === 'databricks'}
								<!-- Databricks.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.12 11.4647V12.1611L17 18.1804L26.7164 12.7989V14.9749L17 20.3877L6.66781 14.6308L6.12 14.93V19.0943L17 25.0987L26.7164 19.7376V21.8946L17 27.3101L6.66781 21.5519L6.12 21.8511V22.5569L17 28.5599L27.88 22.5569V18.3885L27.3252 18.092L17 23.8489L7.28081 18.4334V16.2873L17 21.643L27.88 15.6399V11.53L27.3252 11.2322L17 16.9904L7.78008 11.8523L17 6.74554L24.5945 10.9534L25.2588 10.5875V10.0136L17 5.43994L6.12 11.4647Z"
										fill="currentColor"
									/>
								</svg>
							{:else if provider.id === 'athena'}
								<!-- AWS.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M11.8234 15.3962C11.8234 15.6913 11.8551 15.9296 11.9104 16.104C11.9737 16.2795 12.0527 16.4709 12.1635 16.6783C12.203 16.7411 12.2188 16.8049 12.2188 16.8607C12.2188 16.9405 12.1714 17.0202 12.0686 17.1L11.5714 17.434C11.5113 17.4777 11.4398 17.5026 11.3658 17.5057C11.2867 17.5057 11.2076 17.4659 11.1295 17.3941C11.0233 17.2789 10.9283 17.1537 10.8458 17.0202C10.7575 16.8673 10.6757 16.7107 10.6007 16.5507C9.98587 17.2824 9.2119 17.6483 8.28077 17.6483C7.6185 17.6483 7.08968 17.4579 6.70319 17.0761C6.31769 16.6932 6.12 16.1848 6.12 15.5478C6.12 14.8718 6.35723 14.3215 6.83762 13.9088C7.319 13.4951 7.95755 13.2877 8.77006 13.2877C9.03892 13.2877 9.3147 13.3116 9.6063 13.3515C9.89888 13.3914 10.1994 13.4552 10.5137 13.527V12.9458C10.5137 12.3406 10.3882 11.9189 10.143 11.6727C9.89098 11.4254 9.46495 11.3068 8.85803 11.3068C8.58127 11.3068 8.29659 11.3377 8.00499 11.4095C7.7134 11.4813 7.42872 11.569 7.15294 11.6806C7.06291 11.721 6.97047 11.7556 6.87617 11.7843C6.83551 11.7975 6.7933 11.8052 6.75063 11.8073C6.63993 11.8073 6.58457 11.7275 6.58457 11.561V11.1712C6.58457 11.0436 6.60039 10.9479 6.63993 10.8921C6.69964 10.8197 6.77552 10.7626 6.86144 10.7256C7.17746 10.5673 7.51086 10.4468 7.85475 10.3667C8.25707 10.2628 8.67109 10.2122 9.08637 10.2161C10.0254 10.2161 10.7114 10.4315 11.1532 10.8612C11.5882 11.2898 11.8076 11.9428 11.8076 12.8181V15.3962H11.8234ZM8.6208 16.6065C8.88077 16.6065 9.14864 16.5586 9.43332 16.4629C9.72268 16.3621 9.98093 16.1868 10.1826 15.9545C10.31 15.8075 10.402 15.6328 10.4514 15.4441C10.4979 15.2537 10.5305 15.0224 10.5305 14.7522V14.4182C10.291 14.3593 10.0485 14.3141 9.80399 14.2826C9.55811 14.2511 9.31051 14.2352 9.06265 14.2348C8.53382 14.2348 8.14733 14.3385 7.88638 14.5538C7.62641 14.7681 7.50088 15.0702 7.50088 15.468C7.50088 15.8418 7.59478 16.121 7.79247 16.3114C7.98127 16.5108 8.25705 16.6065 8.6208 16.6065ZM14.9568 17.4659C14.8145 17.4659 14.7196 17.4419 14.6564 17.3861C14.5931 17.3382 14.5377 17.2266 14.4903 17.0761L12.6369 10.924C12.6009 10.8208 12.577 10.7137 12.5658 10.605C12.5658 10.4773 12.629 10.4056 12.7546 10.4056H13.5285C13.6778 10.4056 13.7806 10.4305 13.8349 10.4853C13.8992 10.5332 13.9466 10.6448 13.9931 10.7964L15.3196 16.0642L16.5502 10.7964C16.5898 10.6369 16.6372 10.5332 16.6995 10.4853C16.7943 10.4267 16.9048 10.3988 17.0158 10.4056H17.6464C17.7967 10.4056 17.8995 10.4305 17.9628 10.4853C18.025 10.5332 18.0814 10.6448 18.112 10.7964L19.3585 16.128L20.7235 10.7964C20.771 10.6369 20.8263 10.5332 20.8817 10.4853C20.9732 10.4267 21.0809 10.3988 21.1891 10.4056H21.9235C22.0491 10.4056 22.1212 10.4704 22.1212 10.605C22.1212 10.6448 22.1123 10.6847 22.1044 10.7326C22.092 10.8006 22.0735 10.8673 22.0491 10.9319L20.1482 17.083C20.1008 17.2425 20.0454 17.3452 19.9822 17.3931C19.8931 17.4507 19.7883 17.4786 19.6827 17.4728H19.0036C18.8553 17.4728 18.7515 17.4489 18.6873 17.3931C18.625 17.3372 18.5697 17.2336 18.539 17.0741L17.3163 11.9418L16.1005 17.0661C16.061 17.2256 16.0145 17.3293 15.9522 17.3851C15.888 17.4409 15.7773 17.4649 15.6359 17.4649L14.9578 17.4659H14.9568ZM25.0945 17.6802C24.6843 17.6802 24.2741 17.6323 23.8797 17.5376C23.4853 17.4419 23.1779 17.3382 22.9723 17.2186C22.8458 17.1478 22.7598 17.0681 22.7281 16.9963C22.6973 16.9259 22.6812 16.8499 22.6807 16.773V16.3672C22.6807 16.2007 22.7439 16.121 22.8616 16.121C22.909 16.121 22.9565 16.129 23.0039 16.1449C23.0514 16.1609 23.1225 16.1928 23.2016 16.2247C23.4695 16.3443 23.7611 16.439 24.0695 16.5028C24.3858 16.5666 24.6922 16.5985 25.0085 16.5985C25.5047 16.5985 25.8922 16.5108 26.1601 16.3353C26.2885 16.2571 26.3941 16.146 26.4661 16.0132C26.5382 15.8805 26.5741 15.7309 26.5703 15.5797C26.5732 15.4772 26.5559 15.3752 26.5194 15.2795C26.4829 15.1839 26.428 15.0965 26.3578 15.0224C26.2154 14.8718 25.9466 14.7362 25.5601 14.6086L24.4164 14.2497C23.8402 14.0673 23.4141 13.7971 23.1542 13.4392C22.8997 13.1089 22.7607 12.7031 22.7588 12.2848C22.7588 11.9508 22.8309 11.6567 22.9723 11.4015C23.1146 11.1473 23.3034 10.924 23.5406 10.7495C23.7779 10.5661 24.0448 10.4305 24.3611 10.3358C24.6774 10.2401 25.0085 10.2002 25.3555 10.2002C25.5284 10.2002 25.7113 10.2082 25.8843 10.2321C26.0652 10.256 26.2303 10.2879 26.3963 10.3198C26.5545 10.3597 26.7047 10.3996 26.8461 10.4464C26.9884 10.4943 27.0991 10.5421 27.1782 10.59C27.2713 10.6373 27.3525 10.7055 27.4154 10.7894C27.4664 10.8668 27.491 10.9588 27.4856 11.0516V11.4254C27.4856 11.5929 27.4223 11.6806 27.3037 11.6806C27.1987 11.6685 27.097 11.636 27.0042 11.5849C26.5275 11.3726 26.0109 11.2668 25.4899 11.2749C25.0401 11.2749 24.6843 11.3457 24.4401 11.4972C24.195 11.6487 24.0695 11.879 24.0695 12.205C24.0695 12.4283 24.1486 12.6198 24.3067 12.7703C24.4649 12.9218 24.7555 13.0734 25.1736 13.2089L26.2945 13.5658C26.8619 13.7493 27.2731 14.0045 27.5172 14.3305C27.7614 14.6565 27.88 15.0303 27.88 15.4441C27.88 15.786 27.8088 16.0971 27.6754 16.3672C27.5351 16.6397 27.3386 16.8786 27.0991 17.0681C26.854 17.2675 26.5624 17.41 26.2233 17.5137C25.8675 17.6244 25.4978 17.6802 25.0945 17.6802Z"
										fill="currentColor"
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M5.8042 19.5047C9.06414 21.2336 13.087 22.2817 17.2458 22.2817C20.0529 22.2817 23.1356 21.7471 25.9736 20.6506C26.3975 20.4744 26.7578 20.9033 26.3426 21.1852C23.8128 22.8938 20.1367 23.8 16.977 23.8C12.5476 23.8 8.55742 22.3028 5.54217 19.8139C5.30423 19.6175 5.51905 19.3497 5.8042 19.5047ZM28.4725 19.3286C28.749 19.6456 28.3954 21.8175 27.042 22.8577C26.8348 23.0197 26.6345 22.9352 26.7269 22.7247L26.8955 22.338C27.226 21.563 27.6681 20.4022 27.3965 20.0878C27.0728 19.7091 25.2579 19.9055 24.4352 19.9971C24.1895 20.0252 24.151 19.828 24.3745 19.68C25.8195 18.7526 28.196 19.0194 28.4725 19.3286Z"
										fill="currentColor"
									/>
								</svg>
							{:else if provider.id === 'qradar'}
								<!-- IBM QRadar.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 34 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M3 7h5v1.6H3V7zm0 2.5h5v1.6H3V9.5zm0 2.5h5v1.6H3V12zm0 2.5h5v1.6H3v-1.6zm0 2.5h5v1.6H3V17zm0 2.5h5v1.6H3v-1.6zm0 2.5h5v1.6H3V22zm0 2.5h5v1.6H3v-1.6zM10 7h9v1.6h-9V7zm0 2.5h3.2v1.6H10V9.5zm5.8 0h3.2v1.6h-3.2V9.5zM10 12h3.2v1.6H10V12zm5.8 0h3.2v1.6h-3.2V12zM10 14.5h9v1.6h-9v-1.6zM10 17h3.2v1.6H10V17zm5.8 0h3.2v1.6h-3.2V17zM10 19.5h3.2v1.6H10v-1.6zm5.8 0h3.2v1.6h-3.2v-1.6zM10 22h3.2v1.6H10V22zm5.8 0h3.2v1.6h-3.2V22zM10 24.5h9v1.6h-9v-1.6zM21 7h2.5v1.6H21V7zm6.5 0h2.5v1.6H27.5V7zM21 9.5h3.2v1.6H21V9.5zm4.8 0h3.2v1.6h-3.2V9.5zM21 12h4v1.6h-4V12zm4 0h4v1.6h-4V12zM21 14.5h2.5v1.6H21v-1.6zm3.25 0h2.5v1.6h-2.5v-1.6zm3.25 0h2.5v1.6h-2.5v-1.6zM21 17h2.5v1.6H21V17zm3.25 0h2.5v1.6h-2.5V17zm3.25 0h2.5v1.6h-2.5V17zM21 19.5h2.5v1.6H21v-1.6zm6.5 0h2.5v1.6h-2.5v-1.6zM21 22h2.5v1.6H21V22zm6.5 0h2.5v1.6h-2.5V22zM21 24.5h2.5v1.6H21v-1.6zm6.5 0h2.5v1.6h-2.5v-1.6z"
										fill="currentColor"
									/>
								</svg>
							{:else if provider.id === 'opentext'}
								<!-- OpenText.svg -->
								<svg
									class="h-7 w-7 shrink-0 text-foreground"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-label="OpenText"
								>
									<path
										d="M3.412 11.809c0 .786-.468 1.637-1.7 1.637-.894 0-1.712-.49-1.712-1.637 0-.946.616-1.68 1.828-1.616 1.297.074 1.584 1.052 1.584 1.616zm-2.307-.596c-.117.17-.159.383-.159.596 0 .478.244.914.765.914.51 0 .755-.404.755-.872 0-.34-.085-.595-.266-.754a.727.727 0 0 0-.553-.17c-.255.01-.414.095-.542.286zm10.63-.67c.095-.095.148-.17.318-.244.149-.063.35-.106.585-.106.191 0 .404.032.563.117.33.17.425.446.425.935v2.126h-.946v-1.754c0-.276-.01-.382-.042-.467-.075-.17-.234-.234-.425-.234-.49 0-.49.382-.49.776v1.68h-.935v-3.105h.946v.277zm-1.393 2.02c-.085.181-.361.883-1.584.883-.946 0-1.605-.564-1.605-1.584 0-.744.383-1.669 1.637-1.669.191 0 .733-.021 1.148.404.415.436.436 1.042.446 1.392H8.1c0 .383.223.776.734.776s.69-.33.807-.542l.702.34zm-.935-1.148c-.022-.127-.043-.308-.181-.435a.66.66 0 0 0-.457-.17.67.67 0 0 0-.478.202c-.128.138-.16.276-.192.414l1.308-.01zm13.977-.5H24v-.637h-.616V9.62h-.936v.648H22.3l-.425.638h.574v1.478c0 .297.01.52.138.701.202.287.553.308.883.308.17 0 .297-.02.488-.053v-.712l-.329.01c-.255 0-.255-.159-.244-.35v-1.371zM14.073 9.62h.935v.648h.967l-.425.638h-.553v1.382c-.01.191-.01.35.245.35l.33-.01v.712c-.203.032-.32.053-.49.053-.318 0-.68-.02-.882-.308-.127-.18-.138-.404-.138-.701V9.619h.01zm4.836 2.944-.18.266c-.171.234-.48.606-1.383.606-.946 0-1.573-.563-1.573-1.584 0-.744.383-1.669 1.637-1.669.191 0 .733-.02 1.148.404.415.436.436 1.042.446 1.393H16.73c-.01.382.191.776.69.776.51 0 .66-.33.777-.542l.712.35zm-.872-1.148c-.021-.127-.042-.308-.18-.435a.66.66 0 0 0-.458-.17.67.67 0 0 0-.478.202c-.127.138-.16.276-.191.414l1.307-.01zm4.071 1.956-1.17-1.626.968-1.467h-1.063l-.457.691-.5-.69h-1.062l1.052 1.466-1.084 1.626h1.063l.563-.86.617.86h1.073zm-17.41-2.827c.085-.138.372-.35.829-.35.776 0 1.329.573 1.329 1.604 0 .638-.234 1.637-1.372 1.637-.403 0-.722-.223-.797-.35v1.296h-.935v-4.114h.946v.277zm.638.361c-.17 0-.351.064-.479.234-.138.16-.19.404-.19.68 0 .362.105.585.222.712a.588.588 0 0 0 .425.192c.457 0 .66-.468.66-.925 0-.383-.117-.786-.5-.872-.053-.01-.096-.02-.138-.02z"
										fill="currentColor"
									/>
								</svg>
							{:else}
								<Database class="h-7 w-7 text-foreground" stroke-width={1.5} aria-hidden="true" />
							{/if}
						</div>

						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<span class="text-label-md font-bold text-text-primary">{provider.name}</span>
								{#if queryLatency}
									<span
										class="rounded-full border border-security-critical/30 bg-security-critical/10 bg-transparent px-2 py-0.5 text-[10px] font-medium text-security-critical/80"
									>
										{queryLatency.label}
									</span>
								{/if}
							</div>
							<div class="mt-0.5 text-caption text-text-muted">
								{provider.category}
								{#if archiveLatency}
									<span class="text-[10px] text-security-critical/80">
										{archiveLatency.label}
									</span>
								{/if}
							</div>
							{#if provider.id === 'athena' || provider.id === 'snowflake' || provider.id === 'databricks'}
								<div class="mt-0.5 text-[10px] leading-tight text-text-muted/80">
									* Fast on time filters · Slow on unindexed log search
								</div>
							{/if}
						</div>
					</div>

					<div class="flex shrink-0 items-center gap-2.5 self-end min-[420px]:self-auto">
						{#if Number(multiplier) > 1.1}
							<span
								class="rounded-md border border-border/80 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-text-muted"
							>
								{multiplier}x higher
							</span>
						{/if}

						<div class="flex items-baseline justify-end gap-1">
							<span class="text-heading-4 font-bold text-text-primary" title={provider.pricingNote}
								>{formatVal(provider.cost)}</span
							>
							<span class="text-caption font-medium text-text-muted"
								>/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span
							>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
