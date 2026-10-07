<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import '@fontsource/mitr/400.css';

	/* Defaults are the SIEM copy; other platform pages pass their own. */
	let {
		badge = 'Rover Security Data Platform',
		title = 'Bring the data your SIEM',
		accent = "can't afford to keep.",
		body = "Make high-volume security telemetry searchable for years—not days. Start with DNS, network flows, cloud audit, raw endpoint telemetry, or anything you archive today because it's too expensive to index.",
		proof = [
			'Go live in hours',
			'Customer-owned object storage',
			'Schema-on-read',
			'No search clusters'
		]
	}: {
		badge?: string;
		title?: string;
		accent?: string;
		body?: string;
		proof?: string[];
	} = $props();

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
	id="get-demo"
	class="dark relative overflow-hidden bg-background pt-28 pb-24 text-foreground"
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
			class="border-primary/35 bg-primary/5 px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] text-primary uppercase"
		>
			{badge}
		</Badge>

		<h2 class="mx-auto mt-6 max-w-[760px] leading-[1.12] font-bold tracking-[-0.025em]">
			{title}<br /><span class="text-primary">{accent}</span>
		</h2>

		<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
			{body}
		</p>

		<div class="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
			<Button size="lg" href="mailto:contactus@roverhq.ai" class="rounded-full px-8"
				>Get Demo</Button
			>
			<a
				href="mailto:contactus@roverhq.ai"
				class="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground/90 transition-all hover:border-primary/40 hover:text-primary"
			>
				<svg
					viewBox="0 0 24 24"
					class="h-4 w-4 fill-none stroke-muted-foreground"
					stroke-width="1.6"
					aria-hidden="true"
				>
					<rect x="3" y="6" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
				</svg>
				contactus@roverhq.ai
			</a>
		</div>

		<div bind:this={tailEl}>
			<div
				class="mx-auto mt-14 flex max-w-[820px] flex-wrap items-center justify-center gap-x-3.5 gap-y-2 border-y border-border py-[26px] text-[14.5px] font-semibold transition-all duration-700"
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
		</div>
	</div>
</section>
