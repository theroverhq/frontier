<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { fade } from 'svelte/transition';

	let hoveredLegacy: string | null = null;
	let hoveredRover: string | null = null;

	const legacySystems = [
		{
			id: 'siem',
			name: 'SIEM',
			role: 'Hot index',
			dot: 'bg-red-500',
			borderHover: 'hover:border-red-500/50',
			bgHover: 'hover:bg-red-500/10'
		},
		{
			id: 'search',
			name: 'Search',
			role: 'Search cluster',
			dot: 'bg-orange-500',
			borderHover: 'hover:border-orange-500/50',
			bgHover: 'hover:bg-orange-500/10'
		},
		{
			id: 'analytics',
			name: 'Analytics',
			role: 'Analytics store',
			dot: 'bg-amber-500',
			borderHover: 'hover:border-amber-500/50',
			bgHover: 'hover:bg-amber-500/10'
		},
		{
			id: 'lake',
			name: 'Archive / Data Lake',
			role: 'Separate historical store',
			dot: 'bg-blue-500',
			borderHover: 'hover:border-blue-500/50',
			bgHover: 'hover:bg-blue-500/10'
		},
		{
			id: 'ai',
			name: 'AI SOC',
			role: 'Limited context',
			dot: 'bg-purple-500',
			borderHover: 'hover:border-purple-500/50',
			bgHover: 'hover:bg-purple-500/10'
		}
	];

	const roverWorkflows = ['SEARCH', 'ANALYTICS', 'DETECTIONS', 'SIEM', 'AI SOC'];
</script>

<section
	id="convergence"
	class="dark bg-background text-foreground relative overflow-hidden pt-24 pb-32"
>
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mb-24 text-center">
			<Badge
				variant="outline"
				class="text-primary border-primary/30 mb-6 text-xs tracking-widest uppercase"
			>
				CONVERGED SECURITY
			</Badge>

			<h2
				class="text-foreground text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				Search. Analytics. SIEM. AI. <span class="text-primary">One platform.</span>
			</h2>

			<p class="text-foreground/70 mx-auto mt-6 max-w-4xl text-xl leading-relaxed md:text-2xl">
				Traditional security stacks split telemetry and context across hot SIEM indexes, data lakes,
				search systems, analytics engines, and AI tools. Rover brings those workflows together
				around one full-fidelity security history.
			</p>
		</div>

		<!-- Stack Comparison -->
		<div class="mx-auto mb-20 grid max-w-6xl items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
			<!-- LEFT: TODAY -->
			<div
				class="bg-card/30 border-border/50 hover:border-border/80 relative flex flex-col overflow-hidden rounded-2xl border p-8 shadow-sm transition-colors lg:p-10"
			>
				<div class="mb-10">
					<span
						class="text-muted-foreground mb-3 block text-xs font-bold tracking-widest uppercase"
					>
						TODAY
					</span>
					<h3 class="text-foreground text-2xl font-medium">
						Five systems. Fragmented security context.
					</h3>
				</div>

				<div class="relative z-10 flex-grow space-y-4 text-sm">
					{#each legacySystems as sys}
						<div
							class="border-border/50 bg-muted/20 flex items-center justify-between rounded-xl border p-4 transition-all duration-300 {hoveredLegacy ===
								sys.id || hoveredLegacy === null
								? 'opacity-100'
								: 'opacity-40'} {sys.borderHover} {sys.bgHover} cursor-default"
							on:mouseenter={() => (hoveredLegacy = sys.id)}
							on:mouseleave={() => (hoveredLegacy = null)}
						>
							<div class="flex items-center gap-3">
								<div
									class="{sys.dot} h-2 w-2 rounded-full {hoveredLegacy === sys.id
										? 'scale-150 animate-pulse'
										: ''} transition-all duration-300"
								></div>
								<span class="text-foreground font-semibold">{sys.name}</span>
							</div>
							<div class="text-muted-foreground flex items-center gap-3">
								<div class="bg-border/50 hidden h-px w-4 sm:block sm:w-8"></div>
								<span class="text-right">{sys.role}</span>
							</div>
						</div>
					{/each}
				</div>

				<div class="border-border/50 relative z-10 mt-8 border-t border-dashed pt-6 text-center">
					<p
						class="text-muted-foreground text-xs leading-loose tracking-widest uppercase sm:text-xs"
					>
						Copy · Move · Normalize<br />
						Rehydrate · Retain Differently
					</p>
				</div>
			</div>

			<!-- RIGHT: WITH ROVER -->
			<div
				class="bg-card/50 border-border/50 hover:border-primary/30 group relative flex flex-col overflow-hidden rounded-2xl border p-8 shadow-sm transition-colors lg:p-10"
			>
				<div
					class="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
				></div>

				<div class="relative z-10 mb-10">
					<span class="text-primary mb-3 block text-xs font-bold tracking-widest uppercase">
						WITH ROVER
					</span>
					<h3 class="text-foreground text-2xl font-medium">
						Every workflow runs on the same history.
					</h3>
				</div>

				<div class="relative z-10 mt-4 flex w-full flex-grow flex-col items-center justify-between">
					<!-- Workflows -->
					<div class="grid w-full grid-cols-5 gap-1 text-xs font-semibold sm:text-sm lg:text-sm">
						{#each roverWorkflows as workflow}
							<div
								class="flex cursor-default items-center justify-center rounded border px-1 py-2 text-center transition-all duration-300 {hoveredRover ===
								workflow
									? 'border-primary bg-primary/10 text-primary shadow-primary/20 z-10 scale-105 shadow-md'
									: 'border-border/50 bg-muted/30 text-foreground z-0'}"
								on:mouseenter={() => (hoveredRover = workflow)}
								on:mouseleave={() => (hoveredRover = null)}
							>
								{workflow}
							</div>
						{/each}
					</div>

					<!-- Connecting Architecture Lines -->
					<div class="relative z-0 h-16 w-full sm:h-20">
						<svg
							class="h-full w-full overflow-visible"
							viewBox="0 0 100 100"
							preserveAspectRatio="none"
						>
							<!-- Static background bus lines -->
							<path
								d="M10,0 L10,50 L90,50 L90,0 M30,0 L30,50 M50,0 L50,100 M70,0 L70,50"
								fill="none"
								stroke="currentColor"
								class="text-border"
								vector-effect="non-scaling-stroke"
								stroke-width="2"
							/>

							<!-- Animated hover line -->
							{#if hoveredRover}
								{@const idx = roverWorkflows.indexOf(hoveredRover)}
								{@const x = 10 + idx * 20}
								<path
									d="M{x},0 L{x},50 L50,50 L50,100"
									fill="none"
									stroke="currentColor"
									class="text-primary"
									vector-effect="non-scaling-stroke"
									stroke-width="3"
									transition:fade={{ duration: 150 }}
								/>
							{/if}
						</svg>
						<div
							class="text-primary absolute -bottom-3 left-1/2 -translate-x-1/2 transition-all duration-300 {hoveredRover
								? 'translate-y-1 scale-110 opacity-100'
								: 'opacity-80'}"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="bg-card"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
					</div>

					<!-- Foundation -->
					<div class="relative z-10 mt-4 w-full">
						<div
							class="border-primary/30 bg-card relative w-full overflow-hidden rounded-xl border p-6 text-center transition-all duration-500 md:p-8 {hoveredRover
								? 'border-primary bg-primary/5'
								: ''}"
						>
							<!-- Subtle glow -->
							<div
								class="bg-primary/5 absolute inset-0 transition-opacity duration-500 {hoveredRover
									? 'opacity-100'
									: 'opacity-0'}"
							></div>

							<div class="relative z-10">
								<div class="text-primary mb-3 text-sm font-bold tracking-widest uppercase">
									ONE SECURITY DATA PLANE
								</div>
								<h4 class="text-foreground mb-4 text-xl font-medium md:text-2xl">
									Full-fidelity security history
								</h4>
								<div
									class="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs"
								>
									<span>Rover Index</span>
									<span class="bg-primary/50 hidden h-1 w-1 rounded-full sm:block"></span>
									<span>Security context</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom takeaway -->
		<div class="mx-auto mt-12 max-w-4xl text-center">
			<h3 class="text-foreground text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
				One security history. Every workflow.
			</h3>
		</div>
	</div>
</section>
