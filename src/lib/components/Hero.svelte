<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
</script>

<header class="dark bg-background text-foreground py-16 md:py-24">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_520px]">
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

			<!-- Right Side: Rover Cold Storage Query Engine Visual -->
			<div
				id="hero-preview"
				class="bg-card border-border relative flex h-[460px] w-full flex-col overflow-hidden rounded-2xl border font-sans shadow-2xl"
				aria-label="Rover Architecture Visualization"
			>
				<div
					class="border-border bg-muted/30 z-10 flex h-10 items-center justify-between border-b px-4"
				>
					<div
						class="text-muted-foreground flex items-center gap-3 text-xs font-bold tracking-widest uppercase"
					>
						<span class="text-foreground">How It Works</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="flex gap-1.5">
							<span class="bg-border h-2.5 w-2.5 rounded-full"></span>
							<span class="bg-border h-2.5 w-2.5 rounded-full"></span>
							<span class="bg-border h-2.5 w-2.5 rounded-full"></span>
						</div>
					</div>
				</div>

				<div class="relative flex flex-1 flex-col justify-between overflow-hidden p-6">
					<div
						class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"
					></div>
					<div
						class="via-primary absolute top-12 bottom-12 left-[40px] w-0.5 bg-gradient-to-b from-transparent to-transparent opacity-60"
					></div>

					<!-- Step 1: Storage -->
					<div class="relative z-10 flex items-center gap-5">
						<div
							class="bg-muted border-border text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-lg"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
								/></svg
							>
						</div>
						<div class="bg-card border-border flex-1 rounded-xl border p-4 shadow-lg">
							<div
								class="text-muted-foreground mb-1.5 text-[10px] font-bold tracking-widest uppercase"
							>
								1. Keep Everything
							</div>
							<div class="text-foreground mb-2.5 text-sm font-semibold">
								100% Data in Object Storage
							</div>
							<div class="flex gap-2">
								<Badge variant="secondary" class="font-mono text-[10px]">Amazon S3 / GCS</Badge>
								<Badge
									variant="default"
									class="bg-primary/10 text-primary hover:bg-primary/20 font-mono text-[10px]"
									>~ $0.02 / GB</Badge
								>
							</div>
						</div>
					</div>

					<!-- Step 2: Compute -->
					<div class="relative z-10 flex items-center gap-5">
						<div
							class="bg-background border-primary text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full border opacity-80 shadow-[0_0_15px_var(--primary)]"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/></svg
							>
						</div>
						<div
							class="bg-background/60 border-primary/30 flex-1 rounded-xl border p-4 shadow-sm backdrop-blur-sm"
						>
							<div class="mb-2 flex items-center justify-between">
								<div>
									<div class="text-primary mb-1.5 text-[10px] font-bold tracking-widest uppercase">
										2. Serverless Engine
									</div>
									<div class="text-foreground text-sm font-semibold">
										Parallel Inverted Index Scan
									</div>
								</div>
								<Badge variant="secondary" class="font-mono text-[10px]">1,024 Workers</Badge>
							</div>
							<div class="mt-3 flex gap-1.5 opacity-80">
								<div class="bg-primary/90 h-1.5 flex-1 animate-pulse rounded-full"></div>
								<div class="bg-primary/30 h-1.5 w-6 rounded-full"></div>
								<div
									class="bg-primary/70 h-1.5 flex-[2] animate-[pulse_1.5s_infinite] rounded-full"
								></div>
								<div
									class="bg-primary h-1.5 flex-[1.5] animate-pulse rounded-full shadow-[0_0_8px_var(--primary)]"
								></div>
								<div class="bg-border h-1.5 w-4 rounded-full"></div>
								<div class="bg-primary/50 h-1.5 flex-1 rounded-full"></div>
							</div>
						</div>
					</div>

					<!-- Step 3: Result -->
					<div class="relative z-10 flex items-center gap-5">
						<div
							class="bg-muted border-border text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-lg"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/></svg
							>
						</div>
						<div
							class="bg-muted/50 border-border flex flex-1 items-center justify-between rounded-xl border p-4 shadow-lg"
						>
							<div>
								<div
									class="text-muted-foreground mb-1.5 text-[10px] font-bold tracking-widest uppercase"
								>
									3. Instant Answers
								</div>
								<div class="text-foreground text-sm font-semibold">
									Search 2.4 Petabytes of Data
								</div>
							</div>
							<div class="text-right">
								<div class="text-primary mb-1 font-mono text-3xl leading-none font-bold">0.42s</div>
								<div class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
									Latency
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</header>
