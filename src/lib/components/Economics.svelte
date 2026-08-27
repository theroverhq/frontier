<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	/* Relative infrastructure cost. A traditional SIEM accrues another tier of
	   cost with every step up in retention; Rover barely moves. */
	const periods = [
		{ label: '30 Days', tiers: 2, siem: 52, rover: 16 },
		{ label: '90 Days', tiers: 3, siem: 78, rover: 18 },
		{ label: '1 Year', tiers: 4, siem: 112, rover: 21 },
		{ label: '3 Years', tiers: 5, siem: 146, rover: 24 },
		{ label: '10 Years', tiers: 6, siem: 182, rover: 28 }
	];

	const GAP = 1.5;

	/* Split a stack's height into `count` equal segments, allowing for gaps. */
	const split = (total: number, count: number) =>
		Array.from({ length: count }, () => (total - (count - 1) * GAP) / count);

	const stacks = periods.map((p, gi) => {
		const siemCount = p.tiers;
		const roverCount = Math.max(2, Math.round(p.tiers / 2));
		return {
			...p,
			gi,
			siemSegs: split(p.siem, siemCount),
			roverSegs: split(p.rover, roverCount)
		};
	});

	/* Stacks read darkest at the top, so shade by distance from the top. */
	const siemShade = (fromTop: number) =>
		['bg-background/65', 'bg-background/45', 'bg-background/30'][fromTop] ?? 'bg-background/[0.18]';
	const roverShade = (fromBottom: number) =>
		['bg-primary-400', 'bg-primary-500', 'bg-primary-600'][fromBottom] ?? 'bg-primary-600';

	const items = [
		{
			k: '01 — Storage',
			title: 'Data + index at object-storage economics.',
			body: 'Full-fidelity telemetry and Rover inverted indexes live in customer object storage—not a separate hot index tier.'
		},
		{
			k: '02 — Compute',
			title: 'Pay for search when you search.',
			body: 'Ephemeral query workers scale up for the query and disappear when the work is done.'
		},
		{
			k: '03 — Retention',
			title: 'Keep history searchable, not archived.',
			body: 'Years of security data remain available to investigations without a rehydration workflow.'
		}
	];

	const proof = ['No Hot Index Tier', 'No Always-On Search Cluster', 'No Rehydration'];

	let plotEl: HTMLDivElement | undefined = $state();
	let barsIn = $state(false);

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			barsIn = true;
			return;
		}
		if (!plotEl || !('IntersectionObserver' in window)) {
			barsIn = true;
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					io.disconnect();
					barsIn = true;
				}
			},
			{ threshold: 0.45 }
		);
		io.observe(plotEl);
		return () => io.disconnect();
	});
</script>

<section id="economics" class="dark bg-background text-foreground relative overflow-hidden pt-26">
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge
				variant="outline"
				class="border-primary/35 bg-primary/5 text-primary px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
			>
				Built For Retention Economics
			</Badge>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				<span class="text-primary">Keep years of data.</span> Not years of infrastructure.
			</h2>
			<p class="text-muted-foreground mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Traditional SIEM economics compound as searchable retention grows. Rover keeps data and
				indexes in object storage and pays for compute only when queries run.
			</p>
		</div>

		<div class="mt-[70px] grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
			<!-- A light card, inverted from the theme's own tokens -->
			<div
				class="bg-foreground text-background rounded-2xl px-4 pt-[30px] pb-[26px] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.5)] sm:px-8"
			>
				<div class="text-center text-[10px] font-bold tracking-[0.13em] uppercase">
					Relative Infrastructure Cost
				</div>
				<div
					class="text-background/40 mt-1.5 text-center text-[9px] font-semibold tracking-[0.13em] uppercase"
				>
					Illustrative Architecture-Based Comparison
				</div>

				<div class="mt-3.5 flex flex-wrap justify-center gap-x-6 gap-y-2">
					<span class="flex items-center gap-[7px] text-[10.5px] font-bold">
						<i class="bg-background/55 h-2 w-2 rounded-full"></i>
						Traditional SIEM — hot index + always-on compute
					</span>
					<span class="flex items-center gap-[7px] text-[10.5px] font-bold">
						<i class="bg-primary h-2 w-2 rounded-full"></i>
						Rover — object storage + on-demand compute
					</span>
				</div>

				<h3 class="mt-[18px] text-center text-[23px] font-bold tracking-[-0.02em]">
					The cost gap widens as retention grows.
				</h3>

				<div
					bind:this={plotEl}
					class="border-background/15 mt-7 flex h-[190px] items-end justify-between border-b px-2"
					role="img"
					aria-label="Relative infrastructure cost by retention window: traditional SIEM rises steeply from 30 days to 10 years while Rover stays nearly flat"
				>
					{#each stacks as group (group.label)}
						<div class="flex h-full items-end gap-[5px] sm:gap-[9px]">
							<!-- Traditional SIEM -->
							<div class="flex w-[22px] flex-col-reverse justify-start sm:w-10">
								{#each group.siemSegs as h, si (si)}
									<span
										class="seg block w-full {siemShade(group.siemSegs.length - 1 - si)} {si ===
										group.siemSegs.length - 1
											? 'rounded-t-[1.5px] sm:rounded-t-[3px]'
											: ''}"
										class:is-in={barsIn}
										style="height: {h.toFixed(
											1
										)}px; margin-top: {GAP}px; transition-delay: {group.gi * 160 + si * 80}ms;"
									></span>
								{/each}
							</div>
							<!-- Rover -->
							<div class="flex w-[22px] flex-col-reverse justify-start sm:w-10">
								{#each group.roverSegs as h, si (si)}
									<span
										class="seg block w-full {roverShade(si)} {si === group.roverSegs.length - 1
											? 'rounded-t-[1.5px] sm:rounded-t-[3px]'
											: ''}"
										class:is-in={barsIn}
										style="height: {h.toFixed(
											1
										)}px; margin-top: {GAP}px; transition-delay: {group.gi * 160 + 70 + si * 80}ms;"
									></span>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<div class="flex justify-between px-2 pt-2.5">
					{#each periods as p (p.label)}
						<span
							class="text-background/50 w-[49px] text-center text-[8px] font-semibold tracking-[0.04em] uppercase sm:w-[89px] sm:text-[9.5px] sm:tracking-[0.1em]"
							>{p.label}</span
						>
					{/each}
				</div>
			</div>

			<div>
				{#each items as item (item.k)}
					<div class="mb-[34px] last:mb-0">
						<div
							class="text-muted-foreground text-[11px] font-semibold tracking-[0.11em] uppercase"
						>
							{item.k}
						</div>
						<h4 class="mt-2.5 text-[20px] font-bold tracking-[-0.015em]">{item.title}</h4>
						<p class="text-muted-foreground mt-2.5 max-w-[400px] text-sm leading-[1.65]">
							{item.body}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<div class="border-border mt-24 border-t pt-22 pb-24 text-center">
			<div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
				{#each proof as claim, i (claim)}
					{#if i > 0}
						<i class="text-muted-foreground/60 not-italic">·</i>
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

<style>
	/* Segments grow from the baseline as the chart comes into view. */
	.seg {
		transform: scaleY(0);
		transform-origin: bottom;
		transition: transform 0.55s cubic-bezier(0.22, 0.61, 0.2, 1);
	}
	.seg.is-in {
		transform: scaleY(1);
	}

	@media (prefers-reduced-motion: reduce) {
		.seg {
			transform: scaleY(1);
			transition-duration: 0.01ms;
			transition-delay: 0ms !important;
		}
	}
</style>
