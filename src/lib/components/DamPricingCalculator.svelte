<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import PricingProviderRow from '$lib/components/PricingProviderRow.svelte';
	import { DAM_PROVIDERS, estimateDam } from '$lib/dam-pricing.mjs';
	import {
		volumeTiers as baseVolumeTiers,
		retentionOptions,
		getRoverIngestionYearly,
		getRoverLatency,
		formatVal,
		type ProviderComparison
	} from '$lib/pricing-calculator';

	// Keep the full ingestion scale, including the values selected by DAM database options.
	const damVolumeTiers = baseVolumeTiers.flatMap((tier) => {
		const extraGB = tier.gbPerDay === 100 ? 50 : tier.gbPerDay === 250 ? 150 : null;
		return extraGB === null
			? [tier]
			: [
					{
						...tier,
						label: `${extraGB} GB / day`,
						gbPerDay: extraGB,
						tbPerMonth: (extraGB * 30) / 1000,
						desc: 'Database activity'
					},
					tier
				];
	});

	const databaseOptions = [
		{ label: '1–100', maxDatabases: 100, dailyGB: 50, monthlyAddOn: 10000 },
		{ label: '101–200', maxDatabases: 200, dailyGB: 100, monthlyAddOn: 15000 },
		{ label: '201–300', maxDatabases: 300, dailyGB: 150, monthlyAddOn: 20000 },
		{ label: '300–1000+', maxDatabases: 500, dailyGB: 250, monthlyAddOn: 40000 }
	];

	let selectedRetentionIdx = $state(3); // Default: 3 Years
	let selectedDatabaseIdx = $state(2); // Default: 300 databases
	let damVolumeIdx = $state(
		damVolumeTiers.findIndex((tier) => tier.gbPerDay === databaseOptions[2].dailyGB)
	);
	let billingPeriod = $state<'monthly' | 'yearly'>('monthly');

	function selectDatabase(idx: number) {
		selectedDatabaseIdx = idx;
		damVolumeIdx = damVolumeTiers.findIndex(
			(tier) => tier.gbPerDay === databaseOptions[idx].dailyGB
		);
	}

	let activeDatabaseOption = $derived(databaseOptions[selectedDatabaseIdx]);
	let activeVolume = $derived({ ...damVolumeTiers[damVolumeIdx], desc: 'Database activity' });
	let activeRetention = $derived(retentionOptions[selectedRetentionIdx]);
	const R = $derived(activeRetention.R);
	const totalSearchableTB = $derived(activeVolume.tbPerMonth * R * 12);

	// Database fees are monthly add-ons to the unchanged ingestion subscription.
	let roverIngestionYearly = $derived(getRoverIngestionYearly(activeVolume.gbPerDay));
	let databaseMonthlyAddOn = $derived(activeDatabaseOption.monthlyAddOn);
	let roverYearly = $derived(roverIngestionYearly + databaseMonthlyAddOn * 12);
	let roverCost = $derived(billingPeriod === 'yearly' ? roverYearly : roverYearly / 12);

	const damProviders = $derived<ProviderComparison[]>(
		DAM_PROVIDERS.map((provider) => {
			const estimate = estimateDam(provider.id, {
				databases: activeDatabaseOption.maxDatabases,
				retentionDays: Math.round(R * 365),
				dailyGB: activeVolume.gbPerDay,
				// DAM has no SOC workload selector; use the ingestion tier's standard search count.
				queriesPerMonth: activeVolume.totalSearches
			});
			return {
				...provider,
				...estimate,
				cost: billingPeriod === 'yearly' ? estimate.yearly : estimate.monthly
			};
		})
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
					Rover DAM pricing is based on daily ingestion volume and the number of databases, with
					multi-year retention included and queries billed at $0.01–$0.10 each.
				</p>
			</div>

			<!-- DAM control 1: Number of databases -->
			<div
				data-database-selector
				role="group"
				aria-labelledby="database-count-label"
				class="@container space-y-2 rounded-xl border border-border bg-background p-3 sm:p-4"
			>
				<div class="flex flex-wrap items-center justify-between gap-2">
					<span id="database-count-label" class="text-overline font-semibold text-text-primary">
						No. of Databases
					</span>
					<span
						class="rounded-md border border-border bg-card/80 px-2 py-0.5 text-label-sm font-bold text-text-primary"
					>
						{activeDatabaseOption.label}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					{#each databaseOptions as option, idx (option.maxDatabases)}
						<button
							type="button"
							data-database-count={option.maxDatabases}
							aria-pressed={selectedDatabaseIdx === idx}
							onclick={() => selectDatabase(idx)}
							class="flex min-h-11 min-w-0 flex-col items-stretch gap-1 rounded-lg border px-3 py-2.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none @min-[500px]:flex-row @min-[500px]:items-center @min-[500px]:justify-between @min-[500px]:gap-2 {selectedDatabaseIdx ===
							idx
								? 'border-primary/80 bg-card font-semibold text-foreground shadow-sm'
								: 'border-border bg-card/40 text-text-secondary hover:border-border/80 hover:text-text-primary'}"
						>
							<span class="flex min-w-0 items-center gap-2">
								<span
									aria-hidden="true"
									class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border {selectedDatabaseIdx ===
									idx
										? 'border-primary bg-primary/20'
										: 'border-border'}"
								>
									{#if selectedDatabaseIdx === idx}<span class="h-2 w-2 rounded-full bg-primary"
										></span>{/if}
								</span>
								<span class="min-w-0 text-label-sm leading-tight font-bold text-text-primary"
									>{option.label}</span
								>
							</span>
							<span
								class="shrink-0 self-end text-caption font-bold @min-[500px]:self-auto {selectedDatabaseIdx ===
								idx
									? 'text-primary'
									: 'text-text-muted'}"
							>
								+${option.monthlyAddOn / 1000}K/mo
							</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Daily ingestion follows the database selector on DAM -->
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
					max={damVolumeTiers.length - 1}
					step="1"
					bind:value={damVolumeIdx}
					aria-valuetext={`${activeVolume.gbPerDay} GB per day`}
					class="volume-slider h-2 w-full cursor-pointer rounded-lg bg-border accent-primary"
				/>

				<div class="relative h-5 text-caption font-medium text-text-muted">
					<span class="absolute left-0">10 GB/d</span>

					<span
						class="absolute hidden -translate-x-1/2 sm:inline"
						style:left={`${(damVolumeTiers.findIndex((tier) => tier.gbPerDay === 500) / (damVolumeTiers.length - 1)) * 100}%`}
						>500 GB/d</span
					>
					<span
						class="absolute hidden -translate-x-1/2 sm:inline"
						style:left={`${(damVolumeTiers.findIndex((tier) => tier.gbPerDay === 2000) / (damVolumeTiers.length - 1)) * 100}%`}
						>2 TB/d</span
					>

					<span class="absolute right-0 text-right">100 TB/d</span>
				</div>
				<div class="pt-1 text-caption text-text-muted">
					Telemetry volume: <strong class="font-bold text-text-primary"
						>{activeVolume.tbPerMonth} TB / month</strong
					>
					({activeVolume.desc.replace(' SIEM', '')})
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
		<div class="flex flex-col space-y-2.5 lg:justify-between">
			<div class="hidden items-center justify-between px-1 pb-0.5 sm:flex">
				<span class="text-overline font-semibold text-text-muted">Provider</span>
				<span class="text-overline font-semibold text-text-muted"
					>{`Estimated TCO (${billingPeriod} equivalent)`}</span
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
								<span class="text-label-md font-bold text-text-primary">Rover DAM</span>
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

			<!-- Competitor cards share their presentation with the other calculators. -->
			{#each damProviders as provider (provider.name)}
				<PricingProviderRow {provider} {roverCost} {billingPeriod} databaseMonitoring />
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
