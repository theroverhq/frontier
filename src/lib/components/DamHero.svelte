<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import DamDashboard from '$lib/components/DamDashboard.svelte';

	let {
		headingTag = 'h1',
		ctaHref = '#get-demo',
		ctaLabel = 'Get Demo'
	}: {
		headingTag?: 'h1' | 'h2';
		ctaHref?: string;
		ctaLabel?: string;
	} = $props();

	const waveText = 'Zero blind spots.';

	const features = [
		'Real-time query monitoring',
		'Privileged user oversight',
		'Sensitive data visibility',
		'Audit-ready reporting'
	];
</script>

<header
	id="database-activity-monitoring"
	data-effects-loop
	class="dark relative overflow-hidden bg-background pt-20 pb-24 text-foreground"
>
	<!-- Ambient lime wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(70% 40% at 68% 25%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 62%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div
			class="grid grid-cols-1 items-center gap-12 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)] xl:gap-9"
		>
			<div>
				<Badge variant="secondary" class="gap-1.5 px-3 py-1 font-sans">
					<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-primary"></span>
					Database Activity Monitoring
				</Badge>

				<svelte:element
					this={headingTag}
					class="mt-6 text-[clamp(2.125rem,4.4vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.028em] text-foreground"
				>
					<span class="block sm:whitespace-nowrap">Every query.</span>
					<span class="block sm:whitespace-nowrap">Every database.</span>
				</svelte:element>

				<p
					class="gradient-text mt-[18px] text-[clamp(1.25rem,2vw,1.5625rem)] font-medium tracking-[-0.012em]"
				>
					{waveText}
				</p>

				<p class=" mt-5 max-w-[470px] text-base leading-[1.72]">
					Rover monitors activity across your databases in real time—who ran which query, from
					where, against which sensitive data. Detect threats as they happen, investigate with full
					history, enforce policy, and produce audit-ready evidence on demand.
				</p>

				<div class="mt-8">
					<Button size="lg" href={ctaHref} class=" rounded-full px-12 uppercase">{ctaLabel}</Button>
				</div>

				<div class="mt-11 grid grid-cols-1 gap-x-11 gap-y-3 sm:grid-cols-2">
					{#each features as feature (feature)}
						<span class="flex items-center gap-2.5 text-[13.5px] font-medium text-foreground/80">
							<span class="h-[5px] w-[5px] shrink-0 rounded-full bg-muted-foreground"></span>
							{feature}
						</span>
					{/each}
				</div>
			</div>

			<!-- Right: a live, explorable preview of the product, lifted by a lime glow -->
			<div class="relative min-w-0">
				<div
					class="pointer-events-none absolute -inset-x-6 -inset-y-10 blur-3xl"
					style="background: radial-gradient(55% 50% at 55% 45%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 72%);"
					aria-hidden="true"
				></div>
				<div id="dam-preview" class="relative">
					<DamDashboard />
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	.gradient-text {
		background-image: linear-gradient(
			100deg,
			var(--foreground) 10%,
			var(--primary) 70%,
			var(--foreground) 10%
		);
		background-size: 220% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		animation: gradient-sweep 5s ease-in-out infinite;
	}
	@keyframes gradient-sweep {
		0% {
			background-position: 120% 0;
		}
		100% {
			background-position: -20% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gradient-text {
			animation: none;
			background-position: 50% 0;
		}
	}
</style>
