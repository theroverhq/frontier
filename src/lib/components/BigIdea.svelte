<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section
	id="big-idea"
	class="dark bg-background text-foreground relative overflow-hidden pt-8 pb-38"
>
	<!-- Subtle background glow -->
	<div
		class="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
	></div>

	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="mb-16 flex flex-col gap-8 md:flex-row md:items-start lg:gap-16">
			<h2
				class="text-foreground flex-1 text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl"
			>
				Years of data. Answers in seconds.
			</h2>
			<p class="text-foreground/50 flex-1 pt-2 text-lg md:text-xl">
				Search and analyze your full security history as if it were hot—without rehydration, moving
				data, or managing search clusters.
			</p>
		</div>

		<!-- 35/65 Layout -->
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
			<!-- Left: Copy (approx 35% -> col-span-4 out of 12 = 33%) -->
			<div class="flex flex-col space-y-8 lg:col-span-4">
				<div>
					<Badge
						variant="outline"
						class="text-primary border-primary/30 mb-6 font-mono text-xs tracking-widest uppercase"
						>Search Everything</Badge
					>
					<h3 class="text-foreground mb-4 text-2xl font-medium">Years of history. One query.</h3>
					<p class="text-muted-foreground text-base leading-relaxed">
						Search across cloud, identity, endpoint, network, SaaS, and application telemetry with
						no distinction between "hot" and "archived" data.
					</p>
				</div>

				<div class="border-border/50 flex flex-col space-y-6 border-t pt-6">
					<div class="flex flex-col space-y-2">
						<h4 class="text-foreground flex items-center gap-2 font-medium">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-primary h-4 w-4"
								><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg
							>
							Full-text + structured search
						</h4>
						<p class="text-muted-foreground pl-6 text-sm">
							Find exact events or hunt across arbitrary fields.
						</p>
					</div>
					<div class="flex flex-col space-y-2">
						<h4 class="text-foreground flex items-center gap-2 font-medium">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-primary h-4 w-4"
								><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path
									d="M8 17v-3"
								/></svg
							>
							Analytics in the same query
						</h4>
						<p class="text-muted-foreground pl-6 text-sm">
							Filter &rarr; group &rarr; count &rarr; avg &rarr; stats without switching systems.
						</p>
					</div>
					<div class="flex flex-col space-y-2">
						<h4 class="text-foreground flex items-center gap-2 font-medium">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-primary h-4 w-4"
								><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path
									d="M3 12A9 3 0 0 0 21 12"
								/></svg
							>
							No rehydration
						</h4>
						<p class="text-muted-foreground pl-6 text-sm">Historical data is already queryable.</p>
					</div>
				</div>
			</div>

			<!-- Right: UI (approx 65% -> col-span-8 out of 12 = 66%) -->
			<div class="flex w-full flex-col items-center lg:col-span-8">
				<!-- Mock UI Window (Light Theme) -->
				<div
					class="bg-background text-foreground border-border relative flex w-full flex-col overflow-hidden rounded-xl border font-mono shadow-2xl"
					style="--background: #FFFFFF; --foreground: #1A1A1A; --muted: #F3F4F6; --muted-foreground: #606067; --border: rgba(18, 18, 15, 0.15);"
				>
					<!-- Subtle glow in UI -->
					<div
						class="bg-primary/20 pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl"
					></div>

					<!-- Top bar -->
					<div
						class="bg-muted/80 border-border z-10 flex items-center justify-between border-b px-4 py-3"
					>
						<div class="flex items-center gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-muted-foreground h-4 w-4"
								><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg
							>
							<span class="text-muted-foreground font-sans text-sm font-medium"
								>Search security data</span
							>
						</div>
						<div class="flex items-center gap-2">
							<Badge
								variant="outline"
								class="bg-background text-foreground border-border hover:bg-muted flex cursor-pointer items-center gap-1 px-2 py-1 font-mono text-xs transition-colors"
							>
								Time: Last 10 years
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-muted-foreground ml-1 h-3 w-3"><path d="m6 9 6 6 6-6"></path></svg
								>
							</Badge>
						</div>
					</div>

					<!-- Query Editor -->
					<div
						class="bg-background border-border z-10 border-b p-5 text-sm leading-relaxed shadow-sm"
					>
						<div class="flex">
							<span class="text-muted-foreground/40 w-6 pr-2 text-right select-none">1</span>
							<div class="text-foreground">
								source=okta <span class="text-muted-foreground font-semibold">AND</span> action="login_failed"
							</div>
						</div>
						<div class="flex">
							<span class="text-muted-foreground/40 w-6 pr-2 text-right select-none">2</span>
							<div class="text-muted-foreground pl-4">
								<span class="text-muted-foreground/40">|</span>
								<span class="text-foreground">stats count by src_ip</span>
							</div>
						</div>
						<div class="flex">
							<span class="text-muted-foreground/40 w-6 pr-2 text-right select-none">3</span>
							<div class="text-muted-foreground pl-4">
								<span class="text-muted-foreground/40">|</span>
								<span class="text-foreground">sort -count</span>
							</div>
						</div>
					</div>

					<!-- Results Meta -->
					<div
						class="bg-muted/40 border-border z-10 flex items-center justify-between border-b px-5 py-3 text-xs"
					>
						<div class="text-muted-foreground flex items-center gap-4">
							<span>2016 &rarr; 2026</span>
							<span class="text-border/80">|</span>
							<span>All security data</span>
						</div>
						<span
							class="text-foreground bg-primary/20 border-primary/30 flex items-center gap-2 rounded border px-2.5 py-1 font-semibold"
						>
							<span class="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"></span>
							3.8 TB bytes &middot; 4.3M events &middot; 5.12 sec
						</span>
					</div>

					<!-- Fake Chart / Data -->
					<div class="bg-background z-10 flex flex-col gap-8 p-6">
						<!-- Histogram mock -->
						<div>
							<div
								class="text-muted-foreground mb-3 flex items-center justify-between font-sans text-xs font-semibold tracking-wider uppercase"
							>
								<span>Activity Over 10 Years</span>
								<span class="text-muted-foreground/50 text-[10px]">Log Scale</span>
							</div>
							<div
								class="border-border/80 flex h-28 w-full items-end justify-between gap-[2px] border-b pb-1"
							>
								{#each [[6, 2, 2], [8, 3, 2], [10, 4, 3], [9, 4, 3], [12, 5, 3], [10, 5, 3], [15, 6, 4], [22, 8, 5], [30, 12, 8], [25, 10, 7], [35, 15, 10], [40, 16, 12], [45, 18, 12], [48, 20, 14], [35, 15, 12], [32, 14, 10], [25, 10, 8], [22, 9, 7], [18, 8, 6], [18, 6, 5], [12, 5, 3], [10, 4, 2], [8, 3, 2], [5, 2, 1], [8, 3, 2], [10, 4, 2], [15, 6, 4], [20, 8, 5], [25, 10, 7], [30, 12, 8], [25, 10, 7], [22, 9, 6], [20, 8, 5], [18, 7, 5], [12, 5, 3], [10, 4, 2], [8, 3, 1], [5, 2, 1], [3, 1, 1], [2, 1, 0]] as [a, b, c]}
									<div
										class="flex h-full flex-1 cursor-crosshair flex-col justify-end gap-[1px] transition-opacity hover:opacity-80"
									>
										<div class="bg-chart-3 w-full rounded-t-[1px]" style="height: {c}%;"></div>
										<div class="bg-chart-2 w-full" style="height: {b}%;"></div>
										<div class="bg-muted-foreground/80 w-full" style="height: {a}%;"></div>
									</div>
								{/each}
							</div>
							<!-- X-axis Timeline -->
							<div
								class="text-muted-foreground/70 mt-2 flex items-center justify-between px-1 font-sans text-[10px] font-medium"
							>
								<span>2016</span>
								<span>2018</span>
								<span>2020</span>
								<span>2022</span>
								<span>2024</span>
								<span>2026</span>
							</div>
						</div>

						<!-- Table mock -->
						<div class="w-full text-sm">
							<div
								class="text-muted-foreground border-border/80 mb-3 grid grid-cols-12 gap-4 border-b pb-2 font-sans text-xs font-semibold tracking-wider uppercase"
							>
								<div class="col-span-8">Source IP</div>
								<div class="col-span-4 text-right">Count</div>
							</div>
							<div class="flex flex-col gap-1.5">
								<div
									class="text-foreground hover:bg-muted/80 -mx-2 grid grid-cols-12 items-center gap-4 rounded px-2 py-1.5 transition-colors"
								>
									<div class="col-span-8 font-semibold">10.4.18.22</div>
									<div class="col-span-4 text-right">12,491</div>
								</div>
								<div
									class="text-foreground hover:bg-muted/80 -mx-2 grid grid-cols-12 items-center gap-4 rounded px-2 py-1.5 transition-colors"
								>
									<div class="col-span-8 font-semibold">18.221.44.11</div>
									<div class="col-span-4 text-right">8,104</div>
								</div>
								<div
									class="text-foreground hover:bg-muted/80 -mx-2 grid grid-cols-12 items-center gap-4 rounded px-2 py-1.5 transition-colors"
								>
									<div class="col-span-8 font-semibold">192.168.1.105</div>
									<div class="col-span-4 text-right">5,392</div>
								</div>
								<div
									class="text-foreground hover:bg-muted/80 -mx-2 grid grid-cols-12 items-center gap-4 rounded px-2 py-1.5 transition-colors"
								>
									<div class="col-span-8 font-semibold">54.21.19.8</div>
									<div class="col-span-4 text-right">2,118</div>
								</div>
								<div
									class="text-foreground -mx-2 grid grid-cols-12 items-center gap-4 rounded px-2 py-1.5 opacity-50"
								>
									<div class="col-span-8 font-semibold">...</div>
									<div class="col-span-4 text-right"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
