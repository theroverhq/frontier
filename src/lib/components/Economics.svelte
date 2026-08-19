<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section
	id="economics"
	class="dark bg-background text-foreground relative overflow-hidden pt-24 pb-38"
>
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mb-24 text-center">
			<Badge
				variant="outline"
				class="text-primary border-primary/30 mb-6 font-mono text-xs tracking-widest uppercase"
			>
				Built for retention economics
			</Badge>
			<h2 class="text-foreground text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
				Keep years of data. Not years of infrastructure.
			</h2>
			<p class="text-foreground/70 mx-auto mt-6 max-w-4xl text-xl leading-relaxed">
				Traditional SIEM economics compound as searchable retention grows. Rover keeps data and
				indexes in object storage and pays for compute only when queries run.
			</p>
		</div>

		<!-- Content Wrapper -->
		<div
			class="mb-24 grid items-center gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16 xl:grid-cols-[3fr_1fr]"
		>
			<!-- Main Visual -->
			<div
				class="bg-background text-foreground border-border relative w-full overflow-hidden rounded-xl border font-mono shadow-2xl"
				style="--background: #FFFFFF; --foreground: #1A1A1A; --muted: #F3F4F6; --muted-foreground: #606067; --border: rgba(18, 18, 15, 0.15);"
			>
				<div class="relative z-10 flex flex-col items-center p-8 lg:p-12">
					<!-- Top Legend -->
					<div class="mb-12 flex flex-col items-center gap-2">
						<div
							class="text-muted-foreground mb-4 flex flex-col items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase"
						>
							<span>Relative Infrastructure Cost</span>
							<span class="text-[9px] opacity-60">Illustrative architecture-based comparison</span>
						</div>
						<div
							class="flex flex-col items-center gap-4 font-mono text-[10px] font-semibold lg:flex-row lg:gap-6 lg:text-xs"
						>
							<div class="text-muted-foreground flex items-center gap-2 text-center">
								<span class="bg-muted-foreground/70 h-2.5 w-2.5 shrink-0 rounded-sm"></span>
								Traditional SIEM — hot index + always-on compute
							</div>
							<div class="text-foreground flex items-center gap-2 text-center">
								<span class="bg-primary h-2.5 w-2.5 shrink-0 rounded-sm"></span>
								Rover — object storage + on-demand compute
							</div>
						</div>
					</div>

					<!-- Chart Title -->
					<h3 class="mb-16 text-center text-2xl font-medium tracking-tight md:text-3xl">
						The cost gap widens as retention grows.
					</h3>

					<!-- Chart Area -->
					<div
						class="border-border/50 relative mt-4 flex h-64 w-full max-w-4xl items-end justify-between border-b pr-20 pb-4 pl-4 md:pr-32 md:pl-8"
					>
						<!-- Background dashed lines -->
						<div
							class="pointer-events-none absolute top-0 bottom-10 left-0 flex w-full flex-col justify-between opacity-10"
						>
							<div class="border-border w-full border-t border-dashed"></div>
							<div class="border-border w-full border-t border-dashed"></div>
							<div class="border-border w-full border-t border-dashed"></div>
							<div class="border-border w-full border-t border-dashed"></div>
						</div>

						{#each [{ label: '30 DAYS', trad: { h: 25, segments: [20, 30, 25, 25] }, rover: { h: 10, segments: [15, 40, 45] } }, { label: '90 DAYS', trad: { h: 40, segments: [25, 25, 25, 25] }, rover: { h: 12, segments: [20, 35, 45] } }, { label: '1 YEAR', trad: { h: 60, segments: [30, 20, 20, 30] }, rover: { h: 15, segments: [20, 35, 45] } }, { label: '3 YEARS', trad: { h: 80, segments: [35, 15, 20, 30] }, rover: { h: 18, segments: [20, 35, 45] } }, { label: '10 YEARS', trad: { h: 100, segments: [40, 15, 15, 30] }, rover: { h: 25, segments: [25, 35, 40] } }] as item, i}
							<div
								class="group relative z-10 flex h-full w-16 flex-col items-center justify-end md:w-20 lg:w-32"
							>
								<div class="relative flex h-full w-full items-end gap-1.5 pb-8 md:gap-3">
									<!-- Trad -->
									<div
										class="flex w-1/2 flex-col justify-end gap-[1px]"
										style="height: {item.trad.h}%;"
									>
										<div
											class="bg-muted-foreground w-full rounded-t-sm"
											style="height: {item.trad.segments[0]}%"
										></div>
										<div
											class="bg-muted-foreground/70 w-full"
											style="height: {item.trad.segments[1]}%"
										></div>
										<div
											class="bg-muted-foreground/50 w-full"
											style="height: {item.trad.segments[2]}%"
										></div>
										<div
											class="bg-muted-foreground/30 w-full rounded-b-sm"
											style="height: {item.trad.segments[3]}%"
										></div>
									</div>
									<!-- Rover -->
									<div
										class="flex w-1/2 flex-col justify-end gap-[1px]"
										style="height: {item.rover.h}%;"
									>
										<div
											class="bg-primary/40 w-full rounded-t-sm"
											style="height: {item.rover.segments[0]}%"
										></div>
										<div
											class="bg-primary/70 w-full"
											style="height: {item.rover.segments[1]}%"
										></div>
										<div
											class="bg-primary w-full rounded-b-sm"
											style="height: {item.rover.segments[2]}%"
										></div>
									</div>
								</div>

								<div
									class="text-muted-foreground absolute bottom-0 font-mono text-[8px] tracking-widest whitespace-nowrap uppercase md:text-[10px] lg:text-xs"
								>
									{item.label}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- 3 Cards -->
			<div class="flex flex-col gap-10 lg:gap-14">
				<!-- 01 Storage -->
				<div class="flex flex-col space-y-3">
					<div class="text-muted-foreground font-mono text-xs tracking-widest uppercase">
						01 &mdash; STORAGE
					</div>
					<h3 class="text-foreground mb-1 text-xl font-medium md:text-2xl">
						Data + index at object-storage economics.
					</h3>
					<p class="text-muted-foreground text-sm leading-relaxed md:text-base">
						Full-fidelity telemetry and Rover inverted indexes live in customer object storage—not a
						separate hot index tier.
					</p>
				</div>

				<!-- 02 Compute -->
				<div class="flex flex-col space-y-3">
					<div class="text-muted-foreground font-mono text-xs tracking-widest uppercase">
						02 &mdash; COMPUTE
					</div>
					<h3 class="text-foreground mb-1 text-xl font-medium md:text-2xl">
						Pay for search when you search.
					</h3>
					<p class="text-muted-foreground text-sm leading-relaxed md:text-base">
						Ephemeral query workers scale up for the query and disappear when the work is done.
					</p>
				</div>

				<!-- 03 Retention -->
				<div class="flex flex-col space-y-3">
					<div class="text-muted-foreground font-mono text-xs tracking-widest uppercase">
						03 &mdash; RETENTION
					</div>
					<h3 class="text-foreground mb-1 text-xl font-medium md:text-2xl">
						Keep history searchable—not archived.
					</h3>
					<p class="text-muted-foreground text-sm leading-relaxed md:text-base">
						Years of security data remain available to investigations without a rehydration
						workflow.
					</p>
				</div>
			</div>
		</div>

		<!-- Proof strip -->
		<div
			class="border-border/50 text-foreground flex flex-wrap items-center justify-center gap-4 border-t pt-10 pb-20 font-mono text-sm font-bold tracking-widest uppercase"
		>
			<span>No hot index tier</span>
			<span class="text-primary/50">&middot;</span>
			<span>No always-on search cluster</span>
			<span class="text-primary/50">&middot;</span>
			<span>No rehydration</span>
		</div>

		<!-- Closing Line -->
		<div class="pt-16 text-center">
			<h2 class="flex flex-col gap-2 text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl">
				<span class="text-foreground">Retention grows.</span>
				<span class="text-primary">Search infrastructure doesn't.</span>
			</h2>
		</div>
	</div>
</section>
