<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import HistorySearchCard from '$lib/components/HistorySearchCard.svelte';

	const features = [
		{
			title: 'Full-text + structured search',
			body: 'Find exact events or hunt across arbitrary fields.',
			path: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
		},
		{
			title: 'Analytics in the same query',
			body: 'Filter → group → count → avg → stats without switching systems.',
			path: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'
		},
		{
			title: 'No rehydration',
			body: 'Historical data is already queryable.',
			path: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5M4 12v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V12"/>'
		}
	];
</script>

<section
	id="big-idea"
	class="dark bg-background text-foreground relative overflow-hidden pt-28 pb-32"
>
	<!-- Ambient wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(50% 25% at 50% 17%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 65%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				Search Everything
			</Badge>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				Years of data. <span class="text-primary">Answers in seconds.</span>
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Search and analyze your full security history as if it were hot—without rehydration, moving
				data, or managing search clusters.
			</p>
		</div>

		<div
			class="mt-[76px] grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14"
		>
			<!-- Left: the claim, then what backs it -->
			<div>
				<h3 class="text-[24px] font-bold tracking-[-0.015em]">Years of history. One query.</h3>
				<p class=" mt-3.5 text-[15.5px] leading-[1.7]">
					Search across cloud, identity, endpoint, network, SaaS, and application telemetry with no
					distinction between "hot" and "archived" data.
				</p>

				{#each features as feature (feature.title)}
					<div class="border-border mt-6 flex gap-4 border-t border-dashed pt-[22px]">
						<div
							class="border-primary/30 bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border"
						>
							<svg
								viewBox="0 0 24 24"
								class="stroke-primary h-[17px] w-[17px] fill-none"
								stroke-width="1.7"
								aria-hidden="true">{@html feature.path}</svg
							>
						</div>
						<div>
							<h4 class="text-[15.5px] font-semibold">{feature.title}</h4>
							<p class=" mt-1 text-[13.8px] leading-[1.6]">{feature.body}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Right: the product surface -->
			<HistorySearchCard />
		</div>
	</div>
</section>
