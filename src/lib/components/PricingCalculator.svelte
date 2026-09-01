<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	// Helper function: Round figure to nearest 5 or 10
	function roundToNearest5(val: number): number {
		return Math.round(val / 5) * 5;
	}

	// Helper function: Real-world Search Latency timing for unindexed Data Lakes/Warehouses (Athena/BigQuery)
	// Median query: ~45s-2m (partitioned) vs Deep historical search: ~12-25+ hrs (unpartitioned 300+ TB)
	function getSearchLatency(tbTotal: number): string {
		if (tbTotal <= 5) return '~45s - 2 min query latency';
		if (tbTotal <= 30) return '~2 - 15 min query latency';
		if (tbTotal <= 100) return '~45 min - 2 hr query latency';
		if (tbTotal <= 300) return '~12 - 25+ hr query latency';
		if (tbTotal <= 1000) return '~25 - 48+ hr query latency';
		return '~3 - 7+ days (query timeout)';
	}

	// Volume Tiers & Base SOC Workload Profiles from CUSTOMER_PROFILE_INFRA_COST_ESTIMATE.md
	const volumeTiers = [
		{
			label: '10 GB / day',
			gbPerDay: 10,
			tbPerMonth: 0.3,
			desc: 'Small Security Posture',
			alertsPerMonth: 450,
			huntsPerMonth: 70,
			totalSearches: 520,
			legacyQueryCostMo: 45
		},
		{
			label: '100 GB / day',
			gbPerDay: 100,
			tbPerMonth: 3.0,
			desc: 'Mid-Market Baseline',
			alertsPerMonth: 1250,
			huntsPerMonth: 260,
			totalSearches: 1510,
			legacyQueryCostMo: 1320
		},
		{
			label: '250 GB / day',
			gbPerDay: 250,
			tbPerMonth: 7.5,
			desc: 'Growing Enterprise',
			alertsPerMonth: 2000,
			huntsPerMonth: 500,
			totalSearches: 2500,
			legacyQueryCostMo: 5470
		},
		{
			label: '500 GB / day',
			gbPerDay: 500,
			tbPerMonth: 15.0,
			desc: 'Multi-Cloud Enterprise',
			alertsPerMonth: 3200,
			huntsPerMonth: 810,
			totalSearches: 4010,
			legacyQueryCostMo: 17500
		},
		{
			label: '1 TB / day',
			gbPerDay: 1000,
			tbPerMonth: 30.0,
			desc: 'High-Volume Enterprise SIEM',
			alertsPerMonth: 5000,
			huntsPerMonth: 1040,
			totalSearches: 6040,
			legacyQueryCostMo: 45300
		},
		{
			label: '2 TB / day',
			gbPerDay: 2000,
			tbPerMonth: 60.0,
			desc: 'Large Enterprise Scale',
			alertsPerMonth: 7500,
			huntsPerMonth: 1560,
			totalSearches: 9060,
			legacyQueryCostMo: 135900
		},
		{
			label: '10 TB / day',
			gbPerDay: 10000,
			tbPerMonth: 300.0,
			desc: 'Global FinTech / SaaS Platform',
			alertsPerMonth: 15000,
			huntsPerMonth: 4120,
			totalSearches: 19120,
			legacyQueryCostMo: 1434000
		},
		{
			label: '100 TB / day',
			gbPerDay: 100000,
			tbPerMonth: 3000.0,
			desc: 'Hyperscale Fortune 50 Enterprise',
			alertsPerMonth: 40000,
			huntsPerMonth: 14000,
			totalSearches: 54000,
			legacyQueryCostMo: 8100000
		}
	];

	// Retention duration options in years (R)
	const retentionOptions = [
		{ label: '30 Days', R: 1 / 12 },
		{ label: '90 Days', R: 0.25 },
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
			desc: '5.0× query workload. Autonomous AI SOC agents executing continuous sub-second investigation loops.'
		},
		{
			id: 'ir',
			label: 'Incident Response',
			factor: 10.0,
			desc: '10.0× query workload. Active breach response, full telemetry forensic sweeps & multi-year lookbacks.'
		}
	];

	// Provider Benchmarks from CUSTOMER_PROFILE_INFRA_COST_ESTIMATE.md
	// Rover baseline rates anchored at 250 GB/day = $50k/yr and 500 GB/day = $95k/yr
	interface ProviderBenchmark {
		rover: { monthly1Y: number; yearly1Y: number };
		splunk: { baseYearly: number; oneYearHot: number };
		sentinel: { baseYearly: number; oneYearHot: number };
		crowdstrike: { baseYearly: number; oneYearHot: number };
		snowflake: { baseYearly90d: number; oneYearHot: number };
		databricks: { baseYearly90d: number; oneYearHot: number };
		athena: { baseYearly90d: number; oneYearHot: number };
		bigquery: { baseYearly90d: number; oneYearHot: number };
	}

	const benchmarkData: Record<number, ProviderBenchmark> = {
		10: {
			rover: { monthly1Y: 835, yearly1Y: 10000 },
			splunk: { baseYearly: 10000, oneYearHot: 18200 },
			sentinel: { baseYearly: 19200, oneYearHot: 23200 },
			crowdstrike: { baseYearly: 21400, oneYearHot: 26400 },
			snowflake: { baseYearly90d: 3650, oneYearHot: 3800 },
			databricks: { baseYearly90d: 3050, oneYearHot: 3200 },
			athena: { baseYearly90d: 1100, oneYearHot: 1250 },
			bigquery: { baseYearly90d: 51, oneYearHot: 206 }
		},
		100: {
			rover: { monthly1Y: 2085, yearly1Y: 25000 },
			splunk: { baseYearly: 100000, oneYearHot: 182000 },
			sentinel: { baseYearly: 120000, oneYearHot: 160000 },
			crowdstrike: { baseYearly: 214000, oneYearHot: 264000 },
			snowflake: { baseYearly90d: 36500, oneYearHot: 38000 },
			databricks: { baseYearly90d: 30500, oneYearHot: 32000 },
			athena: { baseYearly90d: 11400, oneYearHot: 12900 },
			bigquery: { baseYearly90d: 1210, oneYearHot: 2760 }
		},
		250: {
			rover: { monthly1Y: 4165, yearly1Y: 50000 }, // Exact $50k/yr anchor
			splunk: { baseYearly: 250000, oneYearHot: 456000 },
			sentinel: { baseYearly: 300000, oneYearHot: 399000 },
			crowdstrike: { baseYearly: 536000, oneYearHot: 659000 },
			snowflake: { baseYearly90d: 91200, oneYearHot: 95000 },
			databricks: { baseYearly90d: 76200, oneYearHot: 80000 },
			athena: { baseYearly90d: 29500, oneYearHot: 33300 },
			bigquery: { baseYearly90d: 4400, oneYearHot: 8290 }
		},
		500: {
			rover: { monthly1Y: 7915, yearly1Y: 95000 }, // Exact $95k/yr anchor
			splunk: { baseYearly: 500000, oneYearHot: 912000 },
			sentinel: { baseYearly: 600000, oneYearHot: 798000 },
			crowdstrike: { baseYearly: 1070000, oneYearHot: 1320000 },
			snowflake: { baseYearly90d: 182000, oneYearHot: 190000 },
			databricks: { baseYearly90d: 152000, oneYearHot: 160000 },
			athena: { baseYearly90d: 62200, oneYearHot: 69800 },
			bigquery: { baseYearly90d: 12700, oneYearHot: 20500 }
		},
		1000: {
			// 1 TB
			rover: { monthly1Y: 14585, yearly1Y: 175000 },
			splunk: { baseYearly: 1000000, oneYearHot: 1820000 },
			sentinel: { baseYearly: 1200000, oneYearHot: 1600000 },
			crowdstrike: { baseYearly: 2140000, oneYearHot: 2640000 },
			snowflake: { baseYearly90d: 365000, oneYearHot: 380000 },
			databricks: { baseYearly90d: 305000, oneYearHot: 320000 },
			athena: { baseYearly90d: 133000, oneYearHot: 148000 },
			bigquery: { baseYearly90d: 36000, oneYearHot: 51500 }
		},
		2000: {
			// 2 TB
			rover: { monthly1Y: 26250, yearly1Y: 315000 },
			splunk: { baseYearly: 2000000, oneYearHot: 3650000 },
			sentinel: { baseYearly: 2400000, oneYearHot: 3190000 },
			crowdstrike: { baseYearly: 4280000, oneYearHot: 5270000 },
			snowflake: { baseYearly90d: 730000, oneYearHot: 760000 },
			databricks: { baseYearly90d: 610000, oneYearHot: 640000 },
			athena: { baseYearly90d: 291000, oneYearHot: 322000 },
			bigquery: { baseYearly90d: 103000, oneYearHot: 134000 }
		},
		10000: {
			// 10 TB
			rover: { monthly1Y: 54165, yearly1Y: 650000 },
			splunk: { baseYearly: 10000000, oneYearHot: 18250000 },
			sentinel: { baseYearly: 12000000, oneYearHot: 15960000 },
			crowdstrike: { baseYearly: 21420000, oneYearHot: 26370000 },
			snowflake: { baseYearly90d: 3650000, oneYearHot: 3800000 },
			databricks: { baseYearly90d: 3050000, oneYearHot: 3200000 },
			athena: { baseYearly90d: 1880000, oneYearHot: 2030000 },
			bigquery: { baseYearly90d: 1030000, oneYearHot: 1190000 }
		},
		100000: {
			// 100 TB
			rover: { monthly1Y: 375000, yearly1Y: 4500000 },
			splunk: { baseYearly: 100000000, oneYearHot: 182500000 },
			sentinel: { baseYearly: 120000000, oneYearHot: 159600000 },
			crowdstrike: { baseYearly: 214200000, oneYearHot: 263700000 },
			snowflake: { baseYearly90d: 36500000, oneYearHot: 38010000 },
			databricks: { baseYearly90d: 30500000, oneYearHot: 32010000 },
			athena: { baseYearly90d: 33440000, oneYearHot: 34950000 },
			bigquery: { baseYearly90d: 28190000, oneYearHot: 29750000 }
		}
	};

	// State
	let selectedVolumeIdx = $state(4); // Default: 1 TB/day
	let selectedRetentionIdx = $state(2); // Default: 1 Year
	let selectedQueryIntensityIdx = $state(0); // Default: Standard SOC (1.0x base)
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

	// Rover Commercial Pricing: Fixed flat rate based ONLY on daily ingestion volume.
	// Retention (multi-year) and Query Workload (unlimited searches) are included with zero cost inflation.
	let roverYearly = $derived(bm.rover.yearly1Y);
	let roverCost = $derived(billingPeriod === 'yearly' ? bm.rover.yearly1Y : bm.rover.monthly1Y);

	// SIEM Retention & Query Scale: Base + R * StorageAdder
	function getSiemCost(baseYearly: number, oneYearHot: number): number {
		const storageAdder = oneYearHot - baseYearly;
		const yr = Math.round(baseYearly + R * storageAdder);
		return billingPeriod === 'yearly' ? yr : Math.round(yr / 12);
	}

	// Data Lake Retention & Query Scale: Base90d + max(0, R - 0.25) * StorageAdder + (Q - 1.0) * QueryTax
	function getLakeCost(base90d: number, oneYearHot: number): number {
		const storageAdderPerYear = (oneYearHot - base90d) / 0.75;
		const baseLakeYr = base90d + Math.max(0, R - 0.25) * storageAdderPerYear;
		// Query tax scales linearly with Query Intensity factor Q beyond 1.0x baseline
		const annualQueryTax = activeVolume.legacyQueryCostMo * 12 * (Q - 1.0);
		const yr = Math.round(baseLakeYr + annualQueryTax);
		return billingPeriod === 'yearly' ? yr : Math.round(yr / 12);
	}

	let providerList = $derived([
		{
			name: 'CrowdStrike LogScale',
			category: 'SIEM / Log Management',
			cost: getSiemCost(bm.crowdstrike.baseYearly, bm.crowdstrike.oneYearHot)
		},
		{
			name: 'Splunk ES',
			category: 'Traditional SIEM',
			cost: getSiemCost(bm.splunk.baseYearly, bm.splunk.oneYearHot)
		},
		{
			name: 'Microsoft Sentinel',
			category: 'Cloud SIEM',
			cost: getSiemCost(bm.sentinel.baseYearly, bm.sentinel.oneYearHot)
		},
		{
			name: 'Snowflake',
			category: 'Security Data Lake',
			cost: getLakeCost(bm.snowflake.baseYearly90d, bm.snowflake.oneYearHot)
		},
		{
			name: 'Databricks',
			category: 'Lakehouse',
			cost: getLakeCost(bm.databricks.baseYearly90d, bm.databricks.oneYearHot)
		},
		{
			name: 'AWS Security Lake + Athena',
			category: 'Data Lake',
			cost: getLakeCost(bm.athena.baseYearly90d, bm.athena.oneYearHot)
		},
		{
			name: 'Google BigQuery',
			category: 'Data Warehouse',
			cost: getLakeCost(bm.bigquery.baseYearly90d, bm.bigquery.oneYearHot)
		}
	]);

	// Formatter
	const formatVal = (val: number) => {
		if (val >= 1000000) {
			return `$${(val / 1000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
		}
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(val);
	};
</script>

<div class="dark border-border bg-card text-foreground rounded-2xl border p-6 sm:p-10">
	<div class="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
		<!-- LEFT COLUMN: Sliders & Axiom-Style Query Intensity Factor -->
		<div class="flex flex-col justify-between space-y-8">
			<div>
				<Badge variant="outline" class="border-border text-text-muted text-overline">
					Interactive Cost Model
				</Badge>
				<h3 class="text-heading-3 mt-4 font-bold tracking-tight">
					Calculate your savings with Rover.
				</h3>
				<p class="text-body-sm text-text-secondary mt-2">
					Traditional SIEMs and Data Warehouses charge steep retention adders and query scan taxes.
					Rover pricing is fixed strictly by daily ingestion volume—multi-year retention and
					unlimited query workloads carry zero cost inflation.
				</p>
			</div>

			<!-- Control 1: Ingestion Volume Slider -->
			<div class="border-border bg-background rounded-xl border p-5">
				<div class="flex items-center justify-between">
					<label for="volume-slider-standard" class="text-overline"> Daily Ingestion Volume </label>
					<span
						class="border-border bg-card text-label-sm text-text-primary rounded-md border px-3 py-1 font-bold"
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
					class="bg-border accent-primary mt-5 h-2 w-full cursor-pointer rounded-lg"
				/>

				<div class="text-caption text-text-muted relative mt-2.5 h-5">
					<span class="absolute left-0">10 GB/d</span>
					<span class="absolute left-[42.86%] -translate-x-1/2">500 GB/d</span>
					<span class="absolute left-[71.43%] -translate-x-1/2">2 TB/d</span>
					<span class="absolute right-0 text-right">100 TB/d</span>
				</div>
				<div class="text-caption mt-3">
					Telemetry volume: <strong class="text-text-primary"
						>{activeVolume.tbPerMonth} TB / month</strong
					>
					({activeVolume.desc})
				</div>
			</div>

			<!-- Control 2: Axiom-Style Query Intensity Selector -->
			<div class="border-border bg-background space-y-4 rounded-xl border p-5">
				<div class="flex items-center justify-between">
					<span class="text-overline">Query Workload Factor</span>
					<span
						class="border-border bg-card text-label-sm text-text-primary rounded-md border px-3 py-1 font-bold"
					>
						{activeQueryIntensity.factor}× Factor
					</span>
				</div>

				<div class="grid grid-cols-2 gap-2.5">
					{#each queryIntensityOptions as option, idx (option.id)}
						<button
							type="button"
							onclick={() => (selectedQueryIntensityIdx = idx)}
							class="flex items-center justify-between rounded-xl border p-3.5 transition-all {selectedQueryIntensityIdx ===
							idx
								? 'border-foreground bg-card text-foreground font-semibold shadow-sm'
								: 'border-border bg-card/40 text-text-secondary hover:border-border/80 hover:text-text-primary'}"
						>
							<div class="flex items-center gap-2.5">
								<div
									class="flex h-4 w-4 items-center justify-center rounded-full border {selectedQueryIntensityIdx ===
									idx
										? 'border-primary'
										: 'border-border'}"
								>
									{#if selectedQueryIntensityIdx === idx}
										<div class="bg-primary h-2.5 w-2.5 rounded-full"></div>
									{/if}
								</div>
								<span class="text-label-sm text-text-primary font-bold">{option.label}</span>
							</div>
							<span
								class="text-caption font-bold {selectedQueryIntensityIdx === idx
									? 'text-primary'
									: 'text-text-muted'}"
							>
								{option.factor}×
							</span>
						</button>
					{/each}
				</div>

				<div class="text-caption space-y-2">
					<p class="text-text-muted leading-relaxed">
						↳ {activeQueryIntensity.desc}
					</p>
					<div
						class="border-border/60 bg-card/60 text-text-muted flex flex-wrap items-center justify-between gap-1 rounded-lg border px-3 py-2"
					>
						<span>Calculated query workload:</span>
						<span class="text-text-primary font-bold">
							{Math.round(
								activeVolume.totalSearches * activeQueryIntensity.factor
							).toLocaleString()} queries / mo
							<span class="text-text-muted font-normal">
								({Math.round(
									activeVolume.alertsPerMonth * activeQueryIntensity.factor
								).toLocaleString()} alerts + {Math.round(
									activeVolume.huntsPerMonth * activeQueryIntensity.factor
								).toLocaleString()} hunts)
							</span>
						</span>
					</div>
				</div>
			</div>

			<!-- Control 3: Retention Window Selector -->
			<div class="border-border bg-background rounded-xl border p-5">
				<div class="flex items-center justify-between">
					<span class="text-overline"> Retention Period </span>
					<span
						class="border-border bg-card text-label-sm text-text-primary rounded-md border px-3 py-1 font-bold"
					>
						{activeRetention.label}
					</span>
				</div>

				<div class="mt-4 grid grid-cols-5 gap-1.5">
					{#each retentionOptions as ret, idx (ret.label)}
						<button
							type="button"
							onclick={() => (selectedRetentionIdx = idx)}
							class="text-button-sm rounded-lg border px-2 py-2 text-center transition-all {selectedRetentionIdx ===
							idx
								? 'border-border bg-foreground text-background font-bold'
								: 'border-border bg-card text-text-secondary hover:text-text-primary'}"
						>
							{ret.label}
						</button>
					{/each}
				</div>
				<div class="text-caption mt-3">
					Total searchable storage: <strong class="text-text-primary"
						>{(activeVolume.tbPerMonth * activeRetention.R * 12).toFixed(1)} TB</strong
					>
				</div>
			</div>

			<!-- Control 4: Monthly vs Yearly Toggle -->
			<div
				class="border-border bg-background flex items-center justify-between rounded-xl border p-4"
			>
				<span class="text-overline">Billing Period</span>
				<div class="border-border bg-card flex rounded-lg border p-1">
					<button
						type="button"
						onclick={() => (billingPeriod = 'monthly')}
						class="text-button-sm rounded-md px-3 py-1 transition-all {billingPeriod === 'monthly'
							? 'bg-foreground text-background font-bold'
							: 'text-text-muted hover:text-text-primary'}"
					>
						Monthly
					</button>
					<button
						type="button"
						onclick={() => (billingPeriod = 'yearly')}
						class="text-button-sm rounded-md px-3 py-1 transition-all {billingPeriod === 'yearly'
							? 'bg-foreground text-background font-bold'
							: 'text-text-muted hover:text-text-primary'}"
					>
						Yearly
					</button>
				</div>
			</div>
		</div>

		<!-- RIGHT COLUMN: Stacked Provider Comparison (Rover on Top) -->
		<div class="flex flex-col space-y-3">
			<div class="flex items-center justify-between px-1 pb-1">
				<span class="text-overline">Provider</span>
				<span class="text-overline">Estimated Pricing ({billingPeriod})</span>
			</div>

			<!-- ROVER (TOP ROW - PRIMARY COLOR FOR TEXT ONLY) -->
			<div class="border-border bg-card rounded-xl border p-5">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div class="flex items-center gap-3">
						<div
							class="border-border bg-background text-button-sm text-text-primary rounded-lg border px-2.5 py-1 font-bold"
						>
							ROVER
						</div>
						<div>
							<div class="flex flex-wrap items-center gap-2">
								<span class="text-label-lg text-text-primary font-bold">Rover Platform</span>
								<Badge
									class="border-primary/40 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold"
								>
									&lt; 5s instant search
								</Badge>
							</div>
							<div class="text-caption">
								Object Storage Native · Flat Multi-Year Retention & Unlimited Queries
							</div>
						</div>
					</div>
					<div class="text-right">
						<!-- Primary color used ONLY for Rover pricing amount -->
						<div class="text-heading-3 text-primary sm:text-heading-2 font-bold">
							{formatVal(roverCost)}
						</div>
						<div class="text-caption text-text-muted">
							/{billingPeriod === 'monthly' ? 'mo' : 'yr'}
						</div>
					</div>
				</div>
			</div>

			<!-- ALL OTHER PROVIDERS (STANDARD MONOCHROME CARDS) -->
			{#each providerList as provider (provider.name)}
				{@const multiplier = (provider.cost / Math.max(1, roverCost)).toFixed(1)}
				{@const totalSearchableTB = activeVolume.tbPerMonth * activeRetention.R * 12}
				<div class="border-border bg-card rounded-xl border p-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="flex flex-wrap items-center gap-2">
								<div class="text-label-md text-text-primary font-bold">{provider.name}</div>
								{#if provider.name.includes('Athena') || provider.name.includes('BigQuery')}
									<Badge
										variant="destructive"
										class="border-destructive/30 bg-destructive/15 text-destructive px-2 py-0.5 text-[10px] font-semibold"
									>
										{getSearchLatency(totalSearchableTB)}
									</Badge>
								{/if}
							</div>
							<div class="text-caption text-text-muted">{provider.category}</div>
						</div>
						<div class="flex items-center gap-4">
							{#if Number(multiplier) > 1.1}
								<span
									class="border-border bg-background text-caption text-text-muted rounded-md border px-2 py-0.5 font-medium"
								>
									{multiplier}x higher
								</span>
							{/if}
							<div class="text-right">
								<div class="text-heading-5 text-text-primary font-bold">
									{formatVal(provider.cost)}
								</div>
								<div class="text-caption text-text-muted">
									/{billingPeriod === 'monthly' ? 'mo' : 'yr'}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
