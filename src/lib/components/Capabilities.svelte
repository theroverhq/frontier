<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section id="capabilities" class="bg-background overflow-hidden text-foreground pt-24 pb-32">
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="mb-15 text-center">
			<Badge variant="default" class="mb-6 border-none font-mono text-xs tracking-widest uppercase"
				>WHAT YOUR SIEM CAN’T AFFORD TO KEEP</Badge
			>

			<h2
				class="mb-6 ] text-foreground text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				Search it. Analyze it.<br />Detect on it.
			</h2>
			<p class="mx-auto max-w-4xl text-xl leading-relaxed text-muted-foreground">
				Rover makes high-volume security telemetry economically searchable and usable—from network
				flows and DNS to raw endpoint and cloud activity.
			</p>
		</div>

		<div class="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
			<!-- 01 SEARCH -->
			<div
				class="flex flex-col rounded-[2rem] border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="flex-none p-10 pb-4">
					<div
						class="mb-5 flex items-center gap-2 text-xs font-bold tracking-widest text-foreground uppercase"
					>
						<span class="font-mono text-muted-foreground">01</span> Search &middot; VPC Flow Logs
					</div>
					<h3 class="mb-3 text-2xl font-semibold tracking-tight text-foreground">
						Find the connection everyone else discarded.
					</h3>
					<p class="pr-6 text-sm leading-relaxed text-muted-foreground">
						Search the telemetry your SIEM made too expensive to keep. Explore massive volumes of
						full-fidelity network flow logs without sampling or archiving.
					</p>
				</div>

				<div class="flex min-h-[260px] flex-1 flex-col justify-end px-10 pt-4 pb-10">
					<div
						class="dark bg-background text-foreground w-full rounded-2xl border border-border/50 p-7 font-mono text-[15px] leading-relaxed shadow-2xl shadow-zinc-900/10"
					>
						<div class="mb-2.5">
							<span class="text-muted-foreground">source=</span><span class="text-primary">vpc_flow</span>
						</div>
						<div class="mb-2.5 pl-4">
							<span class="text-primary">|</span> <span class="text-muted-foreground">where</span> dst_ip="185.220.101.4"
						</div>
						<div class="mb-6 pl-4">
							<span class="text-primary">|</span> <span class="text-muted-foreground">sort</span> timestamp
						</div>
						<div
							class="flex items-center gap-2.5 border-t border-border/80 pt-5 text-sm text-muted-foreground"
						>
							<span class="bg-primary inline-block h-2.5 w-2.5 rounded-full"></span> 18 months searched
							&middot; 7.1 sec
						</div>
					</div>
				</div>

				<div class="mt-auto rounded-b-[2rem] border-t border-border bg-muted px-10 py-5">
					<p class="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
						Full-fidelity network flow data, searchable for years.
					</p>
				</div>
			</div>

			<!-- 02 ANALYTICS -->
			<div
				class="flex flex-col rounded-[2rem] border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="flex-none p-10 pb-4">
					<div
						class="mb-5 flex items-center gap-2 text-xs font-bold tracking-widest text-foreground uppercase"
					>
						<span class="font-mono text-muted-foreground">02</span> Analytics &middot; DNS Logs
					</div>
					<h3 class="mb-3 text-2xl font-semibold tracking-tight text-foreground">
						Find the signal buried in billions of DNS queries.
					</h3>
					<p class="pr-6 text-sm leading-relaxed text-muted-foreground">
						Aggregate and visualize noisy, high-volume telemetry natively. Filter, group, and
						calculate directly on the data without exporting it.
					</p>
				</div>

				<div class="relative flex min-h-[260px] flex-1 flex-col justify-end px-10 pt-4 pb-10">
					<div
						class="dark bg-background text-foreground mb-8 w-full max-w-[85%] rounded-xl border border-border/80 p-6 font-mono text-sm shadow-xl"
					>
						<div class="mb-2">
							<span class="text-muted-foreground">source=</span><span class="text-foreground/90">dns</span>
						</div>
						<div class="mb-2 pl-4">
							<span class="text-primary">|</span> <span class="text-muted-foreground">stats</span> count, distinct(src_ip)
							by query_name
						</div>
						<div class="pl-4">
							<span class="text-primary">|</span> <span class="text-muted-foreground">where</span> count &lt;
							10
						</div>
					</div>

					<div
						class="absolute right-10 bottom-8 left-20 z-10 overflow-hidden rounded-xl border border-border bg-background font-mono text-sm shadow-xl"
					>
						<div
							class="flex justify-between border-b border-border bg-muted/80 px-5 py-3 font-sans text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
						>
							<span>Query Name</span>
							<span>Distinct IPs</span>
						</div>
						<div class="flex justify-between border-b border-border px-5 py-2.5">
							<span class="font-medium text-foreground">wz9x.evil.net</span>
							<span class="font-bold text-foreground">1</span>
						</div>
						<div class="flex justify-between border-b border-border px-5 py-2.5">
							<span class="text-muted-foreground">c2.staging.internal</span>
							<span class="text-muted-foreground">2</span>
						</div>
						<div class="flex justify-between px-5 py-2.5 text-muted-foreground">
							<span>tunnel-endpoint.xyz</span>
							<span>1</span>
						</div>
					</div>
				</div>

				<div class="mt-auto rounded-b-[2rem] border-t border-border bg-muted px-10 py-5">
					<p class="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
						Rare domains observed across the last 12 months.
					</p>
				</div>
			</div>

			<!-- 03 DETECTIONS + SIEM -->
			<div
				class="flex flex-col rounded-[2rem] border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="flex-none p-10 pb-4">
					<div
						class="mb-5 flex items-center gap-2 text-xs font-bold tracking-widest text-foreground uppercase"
					>
						<span class="font-mono text-muted-foreground">03</span> Detect &middot; CloudTrail Data Events
					</div>
					<h3 class="mb-3 text-2xl font-semibold tracking-tight text-foreground">
						Detect on the data you used to archive.
					</h3>
					<p class="pr-6 text-sm leading-relaxed text-muted-foreground">
						Keep object-level cloud activity available for detection and historical investigation
						instead of choosing between coverage and cost.
					</p>
				</div>

				<div class="flex min-h-[260px] flex-1 flex-col justify-end px-10 pt-4 pb-10">
					<div
						class="relative mb-6 w-full rounded-xl border border-border bg-background p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
					>
						<div
							class="absolute -top-3 -right-3 flex items-center gap-2 rounded bg-background px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-md"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span> High Severity
						</div>
						<div class="mb-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
							Detection Fired
						</div>
						<div class="mb-5 text-xl font-semibold text-foreground">S3 Mass Object Retrieval</div>
						<div
							class="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted p-4 font-mono text-sm"
						>
							<div>
								<div
									class="mb-1 font-sans text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
								>
									Bucket
								</div>
								<div class="truncate font-medium text-foreground" title="prod-customer-data">
									prod-customer-data
								</div>
							</div>
							<div>
								<div
									class="mb-1 font-sans text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
								>
									Principal
								</div>
								<div class="truncate font-medium text-foreground" title="arn:aws:iam::123:user/dev">
									arn:aws:iam...
								</div>
							</div>
						</div>
					</div>
					<div
						class="mx-auto flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted py-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border"
					>
						Investigate &rarr; <span class="font-normal text-muted-foreground"
							>View all object-level activity</span
						>
					</div>
				</div>

				<div class="mt-auto rounded-b-[2rem] border-t border-border bg-muted px-10 py-5">
					<p class="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
						High-volume telemetry &middot; S3 Data Events &middot; Unsampled
					</p>
				</div>
			</div>

			<!-- 04 AI SOC -->
			<div
				class="flex flex-col rounded-[2rem] border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="flex-none p-10 pb-4">
					<div
						class="mb-5 flex items-center gap-2 text-xs font-bold tracking-widest text-foreground uppercase"
					>
						<span class="font-mono text-muted-foreground">04</span> AI SOC &middot; Raw EDR Telemetry
					</div>
					<h3 class="mb-3 text-2xl font-semibold tracking-tight text-foreground">
						Give your AI SOC years of memory.
					</h3>
					<p class="pr-6 text-sm leading-relaxed text-muted-foreground">
						The agent can investigate data traditional SIEM economics prevented you from
						retaining—correlating years of raw EDR telemetry in seconds.
					</p>
				</div>

				<div class="flex min-h-[260px] flex-1 flex-col justify-end px-10 pt-4 pb-10">
					<div
						class="dark bg-background text-foreground w-full rounded-xl border border-border/80 p-6 text-sm shadow-xl"
					>
						<div
							class="mb-5 flex items-center gap-3 border-b border-border/80 pb-4 font-medium text-foreground"
						>
							<div
								class="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
									/><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path
										d="M5 18H3"
									/></svg
								>
							</div>
							Investigate this suspicious PowerShell execution.
						</div>
						<div class="mb-6 space-y-4 font-mono text-xs">
							<div class="flex items-start gap-3">
								<span class="text-primary mt-0.5">✓</span>
								<span class="text-muted-foreground">Searched 14 months of process telemetry</span>
							</div>
							<div class="flex items-start gap-3">
								<span class="text-primary mt-0.5">✓</span>
								<span class="text-muted-foreground">Found the same hash on 7 endpoints</span>
							</div>
							<div class="flex items-start gap-3">
								<span class="text-primary mt-0.5">✓</span>
								<span class="text-muted-foreground">Correlated DNS queries from 3 hosts</span>
							</div>
							<div class="flex items-start gap-3">
								<span class="text-primary mt-0.5">✓</span>
								<span class="text-muted-foreground">Found first execution 93 days earlier</span>
							</div>
							<div class="flex items-start gap-3">
								<span class="text-primary mt-0.5">✓</span>
								<span class="text-muted-foreground">Identified related cloud activity</span>
							</div>
						</div>
						<div
							class="text-primary flex w-max cursor-pointer items-center gap-1.5 font-sans text-xs font-semibold transition-colors hover:opacity-80"
						>
							Build investigation timeline &rarr;
						</div>
					</div>
				</div>

				<div class="mt-auto rounded-b-[2rem] border-t border-border bg-muted px-10 py-5">
					<p class="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
						Raw EDR Telemetry &middot; Process Executions &middot; Process Trees
					</p>
				</div>
			</div>
		</div>

		<!-- VISUAL CONNECTION FOUNDATION -->
		<div class="pointer-events-none relative z-0 mt-8 hidden md:block">
			<!-- Vertical lines joining down with annotations -->
			<div class="relative mx-auto flex h-24 w-[90%] justify-between lg:w-[80%]">
				<div class="relative flex w-24 justify-center">
					<div class="h-full w-px bg-gradient-to-b from-transparent via-zinc-300 to-zinc-300"></div>
					<div
						class="bg-background absolute top-1/2 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
					>
						Search
					</div>
				</div>
				<div class="relative flex w-24 justify-center">
					<div class="h-full w-px bg-gradient-to-b from-transparent via-zinc-300 to-zinc-300"></div>
					<div
						class="bg-background absolute top-1/2 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
					>
						Analytics
					</div>
				</div>
				<div class="relative flex w-24 justify-center">
					<div class="h-full w-px bg-gradient-to-b from-transparent via-zinc-300 to-zinc-300"></div>
					<div
						class="bg-background absolute top-1/2 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
					>
						Detect
					</div>
				</div>
				<div class="relative flex w-24 justify-center">
					<div class="h-full w-px bg-gradient-to-b from-transparent via-zinc-300 to-zinc-300"></div>
					<div
						class="bg-background absolute top-1/2 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
					>
						AI SOC
					</div>
				</div>
			</div>

			<!-- Foundation Block -->
			<div
				class="dark bg-background text-foreground relative mx-auto flex w-[94%] flex-col items-center justify-center rounded-2xl border border-border/80 p-8 shadow-2xl lg:w-[85%]"
			>
				<div class="text-primary mb-3 text-sm font-bold tracking-[0.2em] uppercase">
					One Full-Fidelity Security Dataset
				</div>
				<div class="text-sm text-muted-foreground">
					Search, analytics, detections, and AI operate on the same full-fidelity security history.
				</div>
			</div>

			<!-- Transition to Architecture -->
			<div
				class="relative mx-auto flex h-20 w-px bg-gradient-to-b from-zinc-300 to-transparent opacity-80"
			></div>
			<div class="-mt-6 flex justify-center text-muted-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mb-4"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg
				>
			</div>
			<div class="flex justify-center text-center">
				<span class="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
					How Rover Makes This Possible
				</span>
			</div>
		</div>

		<!-- Mobile Foundation -->
		<div class="mt-16 flex flex-col items-center text-center md:hidden">
			<div
				class="dark bg-background text-foreground flex w-full flex-col items-center gap-3 rounded-2xl border border-border/80 px-6 py-8 shadow-xl"
			>
				<span class="text-primary text-[11px] font-bold tracking-[0.15em] uppercase">
					One Full-Fidelity Security Dataset
				</span>
				<span class="text-xs text-muted-foreground">
					Search, analytics, detections, and AI operate on the same full-fidelity security history.
				</span>
			</div>

			<div
				class="relative mx-auto mt-6 flex h-16 w-px bg-gradient-to-b from-zinc-300 to-transparent opacity-80"
			></div>
			<div class="-mt-6 mt-0 flex justify-center text-muted-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mb-4"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg
				>
			</div>
			<div class="flex justify-center text-center">
				<span class="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
					How Rover Makes This Possible
				</span>
			</div>
		</div>
	</div>
</section>
