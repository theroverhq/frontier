<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
</script>

<header class="dark bg-background text-foreground py-16 md:py-24">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 xl:grid-cols-[42%_58%]">
			<div>
				<div class="mb-6 flex flex-wrap items-center gap-2">
					<Badge variant="secondary" class="gap-1.5 px-3 py-1 font-mono">
						<span class="bg-primary inline-block h-2 w-2 animate-pulse rounded-full"></span>
						SIEM <span class="text-muted-foreground opacity-50">•</span>
						Search <span class="text-muted-foreground opacity-50">•</span>
						Analytics <span class="text-muted-foreground opacity-50">•</span>
						AI SOC
					</Badge>
				</div>

				<h1
					class="text-foreground text-5xl leading-tight font-medium tracking-tight md:text-6xl lg:text-7xl"
				>
					The SIEM built for <br class="hidden lg:inline" />
					<span class="text-primary">infinite retention.</span>
				</h1>

				<p class="text-foreground mt-4 text-2xl leading-snug font-normal md:text-3xl">
					Cold Storage. Hot Intelligence.
				</p>

				<p class="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
					Rover keeps every security event in low-cost object storage and makes years of data
					searchable in seconds. Run detections and analytics across everything you retain, and give
					analysts and AI agents years of context for every investigation—without search clusters.
				</p>

				<div class="mt-8 flex flex-wrap items-center gap-4">
					<Button size="lg" href="#early-access">Book a Demo</Button>
					<Button variant="outline" size="lg" href="#hero-preview">See Rover in Action</Button>
				</div>

				<div
					class="text-muted-foreground mt-8 flex flex-wrap items-center gap-4 text-sm font-medium"
				>
					<div class="text-foreground flex items-center gap-2">
						<span class="bg-muted-foreground h-1.5 w-1.5 rounded-full"></span> Object-storage economis
					</div>
					<span class="opacity-30">•</span>
					<div class="text-foreground flex items-center gap-2">
						<span class="bg-muted-foreground h-1.5 w-1.5 rounded-full"></span> Full-fidelity retention
					</div>
					<span class="opacity-30">•</span>
					<div class="text-foreground flex items-center gap-2">
						<span class="bg-muted-foreground h-1.5 w-1.5 rounded-full"></span> Serverless compute
					</div>
					<span class="opacity-30">•</span>
					<div class="text-foreground flex items-center gap-2">
						<span class="bg-muted-foreground h-1.5 w-1.5 rounded-full"></span> No search clusters
					</div>
				</div>
			</div>

			<!-- Right Side: Rover Architecture Visual -->
			<div
				id="hero-preview"
				class="border-border relative flex h-[540px] w-full gap-3 overflow-hidden rounded-2xl border bg-[#101010] p-6 font-sans shadow-2xl lg:gap-4 lg:p-8"
				aria-label="Rover Architecture Visualization"
			>
				<!-- Left: All Security Data -->
				<div class="flex h-full w-[25%] flex-col justify-center">
					<div class="text-foreground mb-5 text-center text-xs font-bold tracking-widest uppercase">
						All Security Data
					</div>

					<div class="relative flex flex-col gap-3">
						<!-- Connection bracket -->
						<div
							class="border-border/50 absolute top-[16px] right-[-16px] bottom-[16px] w-4 rounded-r-md border-y border-r"
						></div>
						<div
							class="bg-border/50 pulse-line-in absolute top-1/2 right-[-32px] h-[1px] w-4 -translate-y-1/2"
						></div>

						<!-- Data Sources -->
						{#each ['Cloud', 'Identity', 'Endpoint', 'Network', 'SaaS', 'Logs'] as source}
							<div
								class="bg-card/50 border-border/50 text-foreground flex items-center justify-center rounded-md border px-4 py-2 text-[11px] shadow-sm lg:text-xs"
							>
								{source}
							</div>
						{/each}
					</div>

					<div class="mt-6 text-center">
						<div class="text-muted-foreground text-[11px] italic lg:text-xs">Keep everything.</div>
					</div>
				</div>

				<!-- Center: Cold Storage & Compute -->
				<div class="relative flex h-full w-[50%] flex-col items-center justify-center px-4 lg:px-8">
					<div class="text-foreground mb-5 text-sm font-bold tracking-widest uppercase">
						Cold Storage
					</div>

					<!-- Rover Data Lake -->
					<div
						class="border-border/60 relative flex w-full flex-col items-center rounded-2xl border bg-[#161616] p-6 shadow-2xl"
					>
						<div
							class="text-primary mb-5 flex items-center gap-2 text-xs font-bold tracking-[0.2em]"
						>
							<span class="bg-primary h-1.5 w-1.5 rotate-45 rounded-[1px]"></span>
							ROVER DATA LAKE
							<span class="bg-primary h-1.5 w-1.5 rotate-45 rounded-[1px]"></span>
						</div>

						<!-- Generations of Data -->
						<div class="mb-6 flex w-full max-w-[200px] flex-col gap-2">
							{#each [2026, 2025, 2024, 'gap', 2016] as item, yIdx}
								{#if item === 'gap'}
									<div class="flex items-center gap-3 py-0.5">
										<div class="flex w-8 flex-col items-center gap-[3px]">
											<div class="bg-muted-foreground/40 h-[2px] w-[2px] rounded-full"></div>
											<div class="bg-muted-foreground/40 h-[2px] w-[2px] rounded-full"></div>
											<div class="bg-muted-foreground/40 h-[2px] w-[2px] rounded-full"></div>
										</div>
									</div>
								{:else}
									<div class="flex items-center gap-3">
										<span class="text-muted-foreground/50 w-8 font-mono text-[10px] lg:text-[11px]"
											>{item}</span
										>
										<div class="flex flex-1 gap-[2px]">
											{#each Array(14) as _, bIdx}
												<div
													class="index-dot bg-muted/20 h-1 flex-1 rounded-full"
													style="animation-delay: {(yIdx * 100 + bIdx * 20) % 1000}ms;"
												></div>
											{/each}
										</div>
									</div>
								{/if}
							{/each}
						</div>

						<div class="text-center">
							<div class="text-foreground mb-1.5 text-xs font-medium">
								Full-fidelity data + Rover Index
							</div>
							<div class="text-muted-foreground/60 text-[11px]">Object Storage</div>
						</div>

						<!-- Connector lines -->
						<div
							class="bg-border/50 pulse-line-in absolute top-1/2 left-[-32px] h-[1px] w-8 -translate-y-1/2"
						></div>
						<div
							class="bg-border/50 pulse-line-out absolute top-1/2 right-[-32px] h-[1px] w-8 -translate-y-1/2"
						></div>
						<div
							class="bg-border/50 absolute bottom-[-32px] left-1/2 h-8 w-[1px] -translate-x-1/2"
						></div>
					</div>

					<!-- On Demand Compute -->
					<div class="relative z-10 mt-8 flex w-full flex-col items-center text-center">
						<div class="mb-3 flex h-5 gap-2.5">
							{#each Array(7) as _, i}
								<div
									class="text-primary/80 compute-lambda font-mono text-base leading-none font-bold"
									style="animation-delay: {i * 100}ms;"
								>
									&lambda;
								</div>
							{/each}
						</div>
						<div class="text-foreground text-xs font-bold tracking-widest uppercase">On Demand</div>
						<div class="text-muted-foreground/70 mt-1.5 text-[10px] lg:text-[11px]">
							Compute when needed.<br />No search clusters.
						</div>
					</div>
				</div>

				<!-- Right: Hot Intelligence -->
				<div class="flex h-full w-[25%] flex-col justify-center">
					<div class="text-foreground mb-2 text-center text-sm font-bold tracking-widest uppercase">
						Hot Intelligence
					</div>
					<div class="text-muted-foreground mb-5 text-center text-[10px] italic lg:text-[11px]">
						Years of context.<br />Answers in seconds.
					</div>

					<div class="relative flex w-full flex-col gap-3">
						<!-- Connection bracket -->
						<div
							class="border-border/50 absolute top-[20px] bottom-[20px] left-[-16px] w-4 rounded-l-md border-y border-l"
						></div>

						{#each [{ label: 'Instant Search', delay: 0 }, { label: 'Live Analytics', delay: 100 }, { label: 'Continuous Detections', delay: 200 }, { label: 'SIEM', delay: 300 }, { label: 'AI SOC', delay: 400 }] as item}
							<div
								class="bg-foreground text-background border-border/40 result-item flex items-center rounded-md border px-4 py-2.5 shadow-sm transition-all duration-500"
								style="animation-delay: {item.delay}ms;"
							>
								<span class="bg-background/20 result-dot mr-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
								></span>
								<span
									class="text-background text-[11px] leading-tight font-medium tracking-tight lg:text-xs"
									>{item.label}</span
								>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	/* Animation loop is 8 seconds */
	@keyframes linePulse {
		0%,
		15% {
			background-color: rgba(255, 255, 255, 0.05);
			box-shadow: none;
		}
		20%,
		30% {
			background-color: var(--primary);
			box-shadow: 0 0 10px var(--primary);
		}
		35%,
		100% {
			background-color: rgba(255, 255, 255, 0.05);
			box-shadow: none;
		}
	}
	.pulse-line-in {
		animation: linePulse 8s infinite;
	}

	@keyframes linePulseOut {
		0%,
		35% {
			background-color: rgba(255, 255, 255, 0.05);
			box-shadow: none;
		}
		40%,
		50% {
			background-color: var(--primary);
			box-shadow: 0 0 10px var(--primary);
		}
		55%,
		100% {
			background-color: rgba(255, 255, 255, 0.05);
			box-shadow: none;
		}
	}
	.pulse-line-out {
		animation: linePulseOut 8s infinite;
	}

	@keyframes indexGlow {
		0%,
		20% {
			background-color: rgba(255, 255, 255, 0.05);
			opacity: 0.5;
			box-shadow: none;
		}
		25%,
		35% {
			background-color: var(--primary);
			opacity: 1;
			box-shadow: 0 0 6px var(--primary);
		}
		40%,
		100% {
			background-color: rgba(255, 255, 255, 0.05);
			opacity: 0.5;
			box-shadow: none;
		}
	}
	.index-dot {
		animation: indexGlow 8s infinite;
	}

	@keyframes lambdaSpawn {
		0%,
		28% {
			opacity: 0;
			transform: translateY(10px) scale(0.5);
			color: var(--muted);
			text-shadow: none;
		}
		32%,
		45% {
			opacity: 1;
			transform: translateY(0) scale(1.2);
			color: var(--primary);
			text-shadow: 0 0 12px var(--primary);
		}
		50%,
		100% {
			opacity: 0;
			transform: translateY(-10px) scale(0.5);
		}
	}
	.compute-lambda {
		opacity: 0;
		animation: lambdaSpawn 8s infinite cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes resultHighlight {
		0%,
		45% {
			box-shadow: none;
			transform: translateX(0);
		}
		48%,
		62% {
			box-shadow: 0 4px 15px rgba(200, 241, 53, 0.3);
			transform: translateX(4px);
		}
		65%,
		100% {
			box-shadow: none;
			transform: translateX(0);
		}
	}
	.result-item {
		animation: resultHighlight 8s infinite;
	}

	@keyframes dotGlow {
		0%,
		45% {
			background-color: rgba(26, 26, 26, 0.2);
			box-shadow: none;
		}
		48%,
		62% {
			background-color: var(--primary);
			box-shadow: 0 0 8px var(--primary);
		}
		65%,
		100% {
			background-color: rgba(26, 26, 26, 0.2);
			box-shadow: none;
		}
	}
	.result-dot {
		animation: dotGlow 8s infinite;
	}
</style>
