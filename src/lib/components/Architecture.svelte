<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section id="architecture" class="bg-background text-foreground overflow-hidden pt-24 pb-32">
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- Header Section -->
		<div class="mb-16 text-center">
			<Badge variant="default" class="mb-6 border-none text-xs tracking-widest uppercase">
				ARCHITECTURE
			</Badge>
			<div class="mb-6 text-xs font-bold tracking-widest uppercase">
				Persistent data. Stateful detections. Ephemeral queries.
			</div>
			<h2
				class="] text-foreground mb-6 text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				Search is bursty. Detection is continuous.<br class="hidden md:block" /> Rover is built for both.
			</h2>
			<div
				class="text-muted-foreground mx-auto max-w-4xl space-y-4 text-lg leading-relaxed md:text-xl"
			>
				<p>
					Rover accepts security telemetry through HTTP pull, HTTP push, or direct S3 drop. It
					writes the Rover Index beside the data in customer-owned Object Storage and updates Signal
					Mesh—a state machine designed for continuous detection queries.
				</p>
			</div>
		</div>

		<!-- Four Horizontal Architecture Lanes -->
		<div
			class="dark bg-background text-foreground border-border/80 relative mb-16 overflow-hidden rounded-[2rem] border p-6 shadow-2xl md:p-10"
		>
			<!-- 01 · INGEST -->
			<div class="border-border/80 bg-background/40 relative mb-5 rounded-2xl border p-5 md:p-8">
				<div
					class="bg-background text-muted-foreground absolute top-0 left-6 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest uppercase md:left-8 md:text-xs"
				>
					01 · Ingest
				</div>

				<div class="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
					<!-- HTTP Pull -->
					<div
						class="border-border bg-card/50 flex flex-col items-center rounded-xl border p-5 text-center shadow-sm"
					>
						<div class="text-foreground mb-2 text-lg font-bold">HTTP Pull</div>
						<div class="text-muted-foreground text-xs">Rover retrieves telemetry</div>
					</div>
					<!-- HTTP Push -->
					<div
						class="border-border bg-card/50 flex flex-col items-center rounded-xl border p-5 text-center shadow-sm"
					>
						<div class="text-foreground mb-2 text-lg font-bold">HTTP Push</div>
						<div class="text-muted-foreground text-xs">
							Sources stream or batch telemetry to Rover
						</div>
					</div>
					<!-- S3 Drop -->
					<div
						class="border-border bg-card/50 relative flex flex-col items-center rounded-xl border p-5 text-center shadow-sm"
					>
						<div
							class="bg-primary/20 border-primary/30 text-primary absolute -top-3 right-4 rounded border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-sm"
						>
							No Pipeline Change
						</div>
						<div class="text-foreground mb-2 text-lg font-bold">S3 Drop</div>
						<div class="text-muted-foreground text-xs">
							Data already lands in customer object storage
						</div>
					</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="relative mb-3 hidden h-10 w-full justify-center md:flex">
						<div
							class="bg-border absolute top-0 left-[16%] h-12 w-px origin-top -rotate-[55deg]"
						></div>
						<div class="bg-border absolute top-0 left-1/2 h-10 w-px -translate-x-1/2">
							<div
								class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
							></div>
						</div>
						<div
							class="bg-border absolute top-0 right-[16%] h-12 w-px origin-top rotate-[55deg]"
						></div>
					</div>
					<div
						class="bg-background/40 text-muted-foreground relative z-10 mb-2 px-2 text-[9px] uppercase"
					>
						Read / Receive
					</div>

					<div
						class="border-border bg-card w-full max-w-lg rounded-xl border p-6 text-center shadow-lg"
					>
						<div class="text-foreground mb-1 text-xl font-bold">Rover Reader + Indexer</div>
						<div class="text-primary mb-1 text-sm font-semibold">Schema-on-read</div>
						<div class="text-muted-foreground text-xs">No upfront schema engineering</div>
						<div class="text-muted-foreground mt-2 text-[10px]">Go live in hours, not weeks</div>
					</div>

					<!-- 3 Split Arrows and Text -->
					<div class="mt-3 flex w-full flex-col items-center">
						<div class="bg-border h-6 w-px"></div>

						<div class="relative w-full">
							<!-- Horizontal Bar connecting centers of cols -->
							<div class="bg-border absolute top-0 right-[16.66%] left-[16.66%] h-px"></div>

							<div class="relative grid w-full grid-cols-3">
								<!-- Left Column -->
								<div class="flex flex-col items-center">
									<div class="bg-border relative h-6 w-px"></div>
									<div
										class="bg-background/40 text-muted-foreground relative z-10 -mt-3 flex flex-col items-center px-2 text-center text-[9px] font-bold tracking-widest uppercase md:text-[10px]"
									>
										<span>Persist Data</span>
										<span
											class="text-muted-foreground mt-1 text-[8px] font-normal tracking-normal normal-case"
											>when required</span
										>
									</div>
								</div>

								<!-- Center Column -->
								<div class="flex flex-col items-center">
									<div class="bg-border relative h-6 w-px">
										<div
											class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
										></div>
									</div>
									<div
										class="bg-background/40 text-muted-foreground relative z-10 -mt-3 px-2 pt-1 text-center text-[9px] font-bold tracking-widest uppercase md:text-[10px]"
									>
										Write Index In Place
									</div>
								</div>

								<!-- Right Column -->
								<div class="flex flex-col items-center">
									<div class="bg-border relative h-6 w-px">
										<div
											class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
										></div>
									</div>
									<div
										class="bg-background/40 text-muted-foreground relative z-10 -mt-3 px-2 pt-1 text-center text-[9px] font-bold tracking-widest uppercase md:text-[10px]"
									>
										Update Signal Mesh
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 02 · INDEX IN PLACE -->
			<div class="border-border/80 bg-background/40 relative mb-5 rounded-2xl border p-5 md:p-8">
				<div
					class="bg-background text-muted-foreground absolute top-0 left-6 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest uppercase md:left-8 md:text-xs"
				>
					02 · Index In Place
				</div>

				<div class="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
					<div class="bg-border relative -mt-5 mb-5 h-6 w-px">
						<div
							class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
						></div>
					</div>

					<h3 class="text-foreground mb-4 text-2xl font-medium tracking-tight md:text-3xl">
						Index where the data lives.
					</h3>

					<p class="text-muted-foreground mb-8 max-w-lg text-sm">
						Rover writes its inverted indexes directly alongside security data in customer-owned
						object storage.
					</p>

					<div class="text-muted-foreground mb-3 text-[10px] tracking-widest uppercase">
						CUSTOMER-OWNED OBJECT STORAGE
					</div>
					<div
						class="border-border bg-card relative w-full rounded-[1.5rem] border p-6 shadow-xl md:p-10"
					>
						<div class="grid grid-cols-1 items-center gap-6 md:grid-cols-7">
							<!-- Security Data -->
							<div
								class="border-border bg-background col-span-1 h-full rounded-xl border p-6 text-left shadow-inner md:col-span-3"
							>
								<div
									class="text-muted-foreground mb-6 text-[10px] font-bold tracking-widest uppercase"
								>
									Security Data
								</div>
								<div class="text-muted-foreground flex flex-col gap-3 text-xs">
									<div class="flex items-center gap-3">
										<div class="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
										Cloud Logs
									</div>
									<div class="flex items-center gap-3">
										<div class="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
										DNS
									</div>
									<div class="flex items-center gap-3">
										<div class="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
										VPC Flow
									</div>
									<div class="flex items-center gap-3">
										<div class="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
										EDR
									</div>
									<div class="flex items-center gap-3">
										<div class="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
										Audit Logs
									</div>
								</div>
							</div>

							<!-- Plus -->
							<div class="text-muted-foreground col-span-1 flex justify-center text-2xl font-bold">
								+
							</div>

							<!-- Rover Index LSM -->
							<div
								class="border-border bg-background relative col-span-1 flex h-full flex-col justify-center overflow-hidden rounded-xl border p-6 text-left shadow-inner md:col-span-3"
							>
								<div
									class="text-muted-foreground mb-6 text-[10px] font-bold tracking-widest uppercase"
								>
									Rover Index
								</div>

								<div class="text-muted-foreground relative z-10 flex flex-col gap-4 text-xs">
									<!-- L0 -->
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground w-4 font-bold">L0</span>
										<div class="flex gap-1.5">
											<div
												class="bg-primary/40 h-2 w-4 rounded-sm shadow-[0_0_8px_rgba(163,230,53,0.2)]"
											></div>
											<div
												class="bg-primary/40 h-2 w-4 rounded-sm shadow-[0_0_8px_rgba(163,230,53,0.2)]"
											></div>
											<div
												class="bg-primary/40 h-2 w-4 rounded-sm shadow-[0_0_8px_rgba(163,230,53,0.2)]"
											></div>
											<div
												class="bg-primary/40 h-2 w-4 rounded-sm shadow-[0_0_8px_rgba(163,230,53,0.2)]"
											></div>
										</div>
									</div>

									<div class="bg-border relative -my-2 ml-[44px] h-3 w-px">
										<div
											class="border-border absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
										></div>
									</div>

									<!-- L1 -->
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground w-4 font-bold">L1</span>
										<div class="flex gap-1.5">
											<div
												class="bg-primary/70 h-2 w-12 rounded-sm shadow-[0_0_12px_rgba(163,230,53,0.3)]"
											></div>
											<div
												class="bg-primary/70 h-2 w-12 rounded-sm shadow-[0_0_12px_rgba(163,230,53,0.3)]"
											></div>
										</div>
									</div>

									<div class="bg-border relative -my-2 ml-[44px] h-3 w-px">
										<div
											class="border-border absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
										></div>
									</div>

									<!-- L2 -->
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground w-4 font-bold">L2</span>
										<div class="flex gap-1.5">
											<div
												class="bg-primary h-2.5 w-[102px] rounded-sm shadow-[0_0_16px_rgba(163,230,53,0.5)]"
											></div>
										</div>
									</div>
								</div>

								<div
									class="text-muted-foreground mt-6 text-[9px] font-bold tracking-widest uppercase"
								>
									Object-storage-native LSM
								</div>
							</div>
						</div>
					</div>

					<div class="text-primary mt-8 text-[11px] font-bold tracking-widest uppercase">
						NO HOT INDEX TIER · NO SEARCH CLUSTER
					</div>
				</div>
			</div>

			<!-- 03 · SIGNAL MESH -->
			<div class="border-border/80 bg-background/40 relative mb-5 rounded-2xl border p-5 md:p-8">
				<div
					class="bg-background text-muted-foreground absolute top-0 left-6 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest uppercase md:left-8 md:text-xs"
				>
					03 · Signal Mesh
				</div>

				<div class="mx-auto flex w-full max-w-md flex-col items-center text-center">
					<div class="text-muted-foreground mb-2 text-[10px] tracking-widest">
						DETECTION QUERY / RULE
					</div>
					<div class="bg-border relative mb-2 h-4 w-px">
						<div
							class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
						></div>
					</div>

					<div class="text-primary mb-2 text-[9px] font-bold tracking-widest uppercase">
						Stateful · Continuous
					</div>
					<div class="border-border bg-card w-full rounded-xl border p-6 shadow-lg">
						<div class="text-primary text-foreground mb-3 text-2xl font-bold">Signal Mesh</div>
						<div class="text-muted-foreground flex flex-col gap-1.5 text-sm">
							<span>Detection state machine</span>
						</div>
					</div>

					<div class="bg-border relative mt-3 h-6 w-px">
						<div
							class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
						></div>
					</div>
					<div
						class="bg-background/40 text-muted-foreground relative z-10 -mt-5 mb-4 px-2 text-[9px] uppercase"
					>
						Evaluate Continuously
					</div>

					<div
						class="rounded-lg border border-red-900/40 bg-red-500/10 px-10 py-3 font-semibold text-red-400 shadow-md"
					>
						Signal / Alert
					</div>
				</div>
			</div>

			<!-- 04 · SERVERLESS QUERY ENGINE -->
			<div class="border-border/80 bg-background/40 relative rounded-2xl border p-5 md:p-8">
				<div
					class="bg-background text-muted-foreground absolute top-0 left-6 -translate-y-1/2 px-2 text-[10px] font-bold tracking-widest uppercase md:left-8 md:text-xs"
				>
					04 · Serverless Query Engine
				</div>

				<div class="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-3">
					<!-- Query Planner Col -->
					<div class="col-span-1 flex flex-col items-center">
						<div class="text-muted-foreground mb-2 text-[10px] tracking-widest">SEARCH QUERY</div>
						<div class="bg-border relative mb-2 h-4 w-px">
							<div
								class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
							></div>
						</div>
						<div
							class="border-border bg-card text-foreground w-full rounded-lg border px-6 py-4 text-center font-semibold shadow-md"
						>
							Query Planner
						</div>
					</div>

					<!-- Fan Out Arrows Col -->
					<div class="col-span-1 hidden flex-col items-center justify-center lg:flex">
						<div class="flex w-full items-center justify-center gap-2">
							<div class="bg-border relative h-px w-16">
								<div
									class="border-border absolute top-1/2 right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rotate-45 transform border-t border-r"
								></div>
							</div>
							<div class="text-muted-foreground text-[10px] tracking-widest uppercase">Fan Out</div>
							<div class="bg-border relative h-px w-16">
								<div
									class="border-border absolute top-1/2 right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rotate-45 transform border-t border-r"
								></div>
							</div>
						</div>
					</div>

					<!-- Mobile Fan Out -->
					<div class="col-span-1 flex justify-center py-1 lg:hidden">
						<div class="bg-border relative h-6 w-px">
							<div
								class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
							></div>
						</div>
					</div>

					<!-- Lambdas & S3 Col -->
					<div class="col-span-1 flex w-full flex-col items-center">
						<!-- Storage Block (Top) -->
						<div class="flex w-full flex-col items-center">
							<div
								class="text-muted-foreground mb-3 text-[9px] font-bold tracking-widest uppercase"
							>
								Persistent · Customer-Owned
							</div>
							<div
								class="border-border bg-background w-full rounded-xl border p-6 text-center shadow-inner"
							>
								<div class="text-foreground mb-1 text-lg font-bold">Customer Object Storage</div>
								<div class="text-muted-foreground text-xs">Rover Index</div>
							</div>
						</div>

						<!-- Arrow UP from Lambdas to Storage -->
						<div class="bg-border relative mt-3 h-6 w-px">
							<div
								class="border-border absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 transform border-t border-l"
							></div>
						</div>
						<div
							class="bg-background/40 text-muted-foreground relative z-10 -mt-5 mb-4 px-2 text-[9px] uppercase"
						>
							Read On Demand
						</div>

						<!-- Lambdas -->
						<div class="text-primary mb-3 text-[9px] font-bold tracking-widest uppercase">
							Ephemeral · Per Query
						</div>
						<div class="flex gap-2.5">
							{#each Array(5) as _, i}
								<div
									class="border-border bg-card text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border text-xs shadow-sm {i ===
										0 || i === 4
										? 'scale-90 opacity-50'
										: ''}"
								>
									λ
								</div>
							{/each}
						</div>

						<!-- Arrow DOWN from Lambdas to Merge -->
						<div class="bg-border relative mt-3 h-6 w-px">
							<div
								class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
							></div>
						</div>
						<div
							class="bg-background/40 text-muted-foreground relative z-10 -mt-5 mb-4 max-w-[120px] px-2 text-center text-[9px] uppercase"
						>
							Merge partial results
						</div>

						<!-- Final Output -->
						<div
							class="border-border bg-card text-foreground w-full rounded-lg border px-6 py-3 text-center font-semibold shadow-md"
						>
							Search + Analytics
						</div>
					</div>
				</div>
			</div>

			<!-- Application Layer -->
			<div class="mt-4 flex w-full justify-center">
				<div class="flex w-full flex-col items-center">
					<div class="mb-3 flex w-full max-w-2xl justify-between px-12 md:px-24">
						<div class="flex flex-1 flex-col items-center">
							<div class="bg-border relative h-6 w-px">
								<div
									class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
								></div>
							</div>
							<div
								class="text-muted-foreground mt-2 text-center text-[9px] tracking-widest uppercase"
							>
								Detection<br />Signals
							</div>
						</div>
						<div class="flex flex-1 flex-col items-center">
							<div class="bg-border relative h-6 w-px">
								<div
									class="border-border absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 transform border-r border-b"
								></div>
							</div>
							<div
								class="text-muted-foreground mt-2 text-center text-[9px] tracking-widest uppercase"
							>
								Search + Analytics<br />Results
							</div>
						</div>
					</div>

					<div
						class="border-primary/30 bg-primary/10 w-full max-w-xl rounded-xl border px-12 py-4 text-center shadow-[0_0_20px_rgba(163,230,53,0.1)]"
					>
						<div class="text-primary mb-2 text-[10px] font-bold tracking-widest uppercase">
							Rover Security Platform
						</div>
						<div class="text-foreground text-xl font-bold tracking-tight">SIEM · AI SOC</div>
					</div>
				</div>
			</div>
		</div>

		<!-- The Three Purpose-Built Structures -->
		<div class="mb-24 grid grid-cols-1 gap-8 md:grid-cols-3">
			<!-- ROVER INDEX -->
			<div
				class="border-border bg-background flex flex-col rounded-[2rem] border shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="border-border flex-none border-b p-8 pb-6 lg:p-10 lg:pb-8">
					<div class="text-primary mb-3 text-[10px] font-bold tracking-widest uppercase">
						Stored in customer object storage
					</div>
					<h3 class="text-foreground text-2xl font-semibold tracking-tight xl:text-3xl">
						Rover Index
					</h3>
				</div>
				<div class="text-muted-foreground flex flex-1 flex-col justify-center p-8 text-sm lg:p-10">
					<ul class="space-y-4">
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Historical search + analytics
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Object-storage-native inverted
							index
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Posting-list + numerical-range
							pruning
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Read by ephemeral query workers
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>No persistent search-node
							ownership
						</li>
					</ul>
				</div>
				<div class="border-border bg-muted mt-auto rounded-b-[2rem] border-t p-6 lg:p-8">
					<p
						class="text-muted-foreground text-[10px] font-bold tracking-wider uppercase xl:text-[11px]"
					>
						Years of data. Read when queried.
					</p>
				</div>
			</div>

			<!-- SIGNAL MESH -->
			<div
				class="border-border bg-background flex flex-col rounded-[2rem] border shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="border-border flex-none border-b p-8 pb-6 lg:p-10 lg:pb-8">
					<div class="text-primary mb-3 text-[10px] font-bold tracking-widest uppercase">
						Continuous detection state
					</div>
					<h3 class="text-foreground text-2xl font-semibold tracking-tight xl:text-3xl">
						Signal Mesh
					</h3>
				</div>
				<div class="text-muted-foreground flex flex-1 flex-col justify-center p-8 text-sm lg:p-10">
					<ul class="space-y-4">
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Continuous detections
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Detection-query state machine
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Stateful evaluation as data
							arrives
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Produces signals and alerts
						</li>
					</ul>
				</div>
				<div class="border-border bg-muted mt-auto rounded-b-[2rem] border-t p-6 lg:p-8">
					<p
						class="text-muted-foreground text-[10px] font-bold tracking-wider uppercase xl:text-[11px]"
					>
						Continuous state. Evaluated as data arrives.
					</p>
				</div>
			</div>

			<!-- SERVERLESS QUERY ENGINE -->
			<div
				class="border-border bg-background flex flex-col rounded-[2rem] border shadow-sm transition-shadow duration-300 hover:shadow-md"
			>
				<div class="border-border flex-none border-b p-8 pb-6 lg:p-10 lg:pb-8">
					<div class="text-primary mb-3 text-[10px] font-bold tracking-widest uppercase">
						Ephemeral · Per Query
					</div>
					<h3 class="text-foreground text-2xl font-semibold tracking-tight xl:text-[26px]">
						Serverless Query Engine
					</h3>
				</div>
				<div class="text-muted-foreground flex flex-1 flex-col justify-center p-8 text-sm lg:p-10">
					<ul class="space-y-4">
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Search + analytics execution
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Fans out across serverless workers
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Reads only relevant index + data
							regions
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Parallel partial results
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary mt-0.5 font-bold">✓</span>Merges results and disappears
						</li>
					</ul>
				</div>
				<div class="border-border bg-muted mt-auto rounded-b-[2rem] border-t p-6 lg:p-8">
					<p
						class="text-muted-foreground text-[10px] font-bold tracking-wider uppercase xl:text-[11px]"
					>
						Compute on demand. No search cluster.
					</p>
				</div>
			</div>
		</div>

		<!-- Bottom summary -->
		<div class="mb-10 text-center">
			<h2
				class="text-foreground mb-6 text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				Index the history. Track the present. Query on demand.
			</h2>
			<div class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase md:text-xs">
				Persistent index · Continuous detection state · Ephemeral query compute
			</div>
		</div>
	</div>
</section>
