<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import SiemPricingCalculator from '$lib/components/SiemPricingCalculator.svelte';
	let { dataLake = false }: { dataLake?: boolean } = $props();

	const proof = ['No Hot Index Tier', 'No Always-On Search Cluster', 'No Rehydration'];
</script>

<section
	id="economics"
	class="dark relative overflow-hidden bg-background pt-24 pb-28 text-foreground"
>
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge
				variant="outline"
				class="h-auto max-w-full border-primary/35 bg-primary/5 px-3 py-1 text-center text-[11.5px] leading-snug font-bold tracking-[0.12em] whitespace-normal text-primary uppercase sm:px-4"
			>
				Built For Retention Economics
			</Badge>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				<span class="text-primary">Keep years of data.</span> Not years of infrastructure.
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				{dataLake
					? 'Storage and query costs grow as searchable retention increases.'
					: 'Traditional SIEM economics compound as searchable retention grows.'} Rover keeps data and
				indexes in object storage and pays for compute only when queries run.
			</p>
		</div>

		<div class="my-26">
			<SiemPricingCalculator {dataLake} />
		</div>

		<div class="text-center">
			<div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
				{#each proof as claim, i (claim)}
					{#if i > 0}
						<i class="not-italic">·</i>
					{/if}
					<span class="text-[13px] font-semibold tracking-[0.08em] uppercase">{claim}</span>
				{/each}
			</div>
			<h3 class="mt-[30px] text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
				Retention grows. <span class="text-primary">Search infrastructure doesn't.</span>
			</h3>
		</div>
	</div>
</section>
