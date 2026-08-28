<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import '@fontsource/mitr/400.css';

	const proof = [
		'Go live in hours',
		'Customer-owned object storage',
		'Schema-on-read',
		'No search clusters'
	];

	const fit = ['Generate TBs/day', 'Need multi-year retention', 'Archive high-volume telemetry'];

	let tailEl: HTMLDivElement | undefined = $state();
	let tailIn = $state(false);

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			tailIn = true;
			return;
		}
		if (!tailEl || !('IntersectionObserver' in window)) {
			tailIn = true;
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					io.disconnect();
					tailIn = true;
				}
			},
			{ threshold: 0.25 }
		);
		io.observe(tailEl);
		return () => io.disconnect();
	});
</script>

<section
	id="early-access"
	class="dark bg-background text-foreground relative overflow-hidden pt-28 pb-24"
>
	<!-- Ambient wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(760px 380px at 50% 8%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 65%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 text-center sm:px-6">
		<Badge
			variant="outline"
			class="border-primary/35 bg-primary/5 text-primary px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
		>
			Rover Early Access
		</Badge>

		<h2 class="mx-auto mt-6 max-w-[760px] leading-[1.12] font-bold tracking-[-0.025em]">
			Bring the data your SIEM<br /><span class="text-primary">can't afford to keep.</span>
		</h2>

		<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
			Join Rover Early Access and make high-volume security telemetry searchable for years—not days.
			Start with DNS, network flows, cloud audit, raw endpoint telemetry, or anything you archive
			today because it's too expensive to index.
		</p>

		<div class="mt-10 flex flex-wrap justify-center gap-3.5">
			<Button size="lg" href="mailto:contactus@roverhq.ai" class="rounded-full">
				Join Early Access
			</Button>
			<Button variant="outline" size="lg" href="#hero-preview" class="rounded-full">
				See Rover in Action
			</Button>
		</div>

		<div bind:this={tailEl}>
			<div
				class="border-border mx-auto mt-14 flex max-w-[820px] flex-wrap items-center justify-center gap-x-3.5 gap-y-2 border-y py-[26px] text-[14.5px] font-semibold transition-all duration-700"
				style="opacity: {tailIn ? 1 : 0}; transform: translateY({tailIn ? 0 : 20}px);"
			>
				{#each proof as claim, i (claim)}
					<span class="flex items-center gap-3.5">
						{#if i > 0}
							<i class="text-primary not-italic">•</i>
						{/if}
						{claim}
					</span>
				{/each}
			</div>

			<div
				class="mt-[38px] transition-all duration-700"
				style="opacity: {tailIn ? 1 : 0}; transform: translateY({tailIn
					? 0
					: 20}px); transition-delay: 120ms;"
			>
				<div class=" text-[13px] font-semibold tracking-[0.05em]">A good fit if you:</div>
				<div class="mt-4 flex flex-wrap justify-center gap-3">
					{#each fit as item (item)}
						<span
							class="border-border bg-card hover:border-primary/40 rounded-lg border px-4 py-[9px] text-[12.5px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
						>
							{item}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
