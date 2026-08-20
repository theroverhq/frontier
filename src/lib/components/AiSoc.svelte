<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section
	id="ai-soc"
	class="bg-background border-border text-foreground overflow-hidden border-t pt-24 pb-32"
>
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mx-auto mb-24 max-w-4xl text-center">
			<Badge variant="default" class="border-primary/30 mb-8 text-xs tracking-widest uppercase">
				AI SOC WITH MEMORY
			</Badge>
			<h2
				class="text-foreground mb-8 text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				The attack started before the alert did.
			</h2>
			<p class="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
				Security incidents don't begin when the alert fires. Rover gives AI agents years of
				searchable security history to reconstruct the attack, correlate activity across systems,
				and investigate with the same search and analytics available to human analysts.
			</p>
		</div>

		<!-- Cinematic Visual Area 65/35 -->
		<div
			class="border-border/80 dark bg-background text-foreground relative mb-24 flex w-full flex-col overflow-hidden rounded-[2rem] border shadow-2xl lg:flex-row"
		>
			<!-- LEFT: 50% - Evidence Timeline Card -->
			<div
				class="border-border/80 dark bg-background relative flex flex-col items-center border-b p-8 lg:w-[50%] lg:border-r lg:border-b-0 lg:p-12"
			>
				<div class="mx-auto flex w-full max-w-md flex-col justify-center">
					<!-- Top Status Strip -->
					<div class="mb-10 flex w-full items-center">
						<div
							class="border-border bg-background/50 text-muted-foreground flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-[10px] font-bold tracking-widest uppercase md:text-xs"
						>
							<span class="bg-primary h-2 w-2 animate-pulse rounded-full"></span>
							SEARCHED 3 YEARS OF SECURITY HISTORY
						</div>
					</div>

					<!-- Vertical Evidence Trail -->
					<div class="relative flex flex-col pl-4">
						<!-- Vertical connection line -->
						<div class="bg-primary/30 absolute top-6 bottom-10 left-[19px] z-0 w-px"></div>

						<!-- Items -->
						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary ring-background mt-1.5 h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_rgba(204,255,0,0.5)] ring-4"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="bg-card text-muted-foreground inline-flex rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
									>
										DNS
									</div>
									<div class="text-muted-foreground text-[10px] uppercase">11 months ago</div>
								</div>
								<h4 class="text-foreground text-sm font-medium">First DNS beacon observed</h4>
								<p class="text-muted-foreground mt-0.5 text-xs">Earliest related activity</p>
							</div>
						</div>

						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary ring-background mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-4"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="bg-card text-muted-foreground inline-flex rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
									>
										IDENTITY
									</div>
									<div class="text-muted-foreground text-[10px] uppercase">93 days ago</div>
								</div>
								<h4 class="text-foreground text-sm font-medium">Credential changed</h4>
							</div>
						</div>

						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary ring-background mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-4"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="bg-card text-muted-foreground inline-flex rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
									>
										ENDPOINT
									</div>
									<div class="text-muted-foreground text-[10px] uppercase">42 days ago</div>
								</div>
								<h4 class="text-foreground text-sm font-medium">Suspicious process executed</h4>
							</div>
						</div>

						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary ring-background mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-4"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="bg-card text-muted-foreground inline-flex rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
									>
										CLOUD
									</div>
									<div class="text-muted-foreground text-[10px] uppercase">7 days ago</div>
								</div>
								<h4 class="text-foreground text-sm font-medium">New cloud role assumed</h4>
							</div>
						</div>

						<div class="group relative z-10 flex gap-6">
							<div
								class="bg-primary ring-background mt-1.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full shadow-[0_0_12px_rgba(204,255,0,0.8)] ring-4"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="bg-card text-muted-foreground inline-flex rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
									>
										NETWORK
									</div>
									<div class="text-primary text-[10px] font-bold uppercase">Today</div>
								</div>
								<h4 class="text-foreground text-sm font-medium">Alert fires</h4>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- RIGHT: 50% - Investigation Conclusion Card -->
			<div class="bg-background/40 relative flex flex-col justify-center p-8 lg:w-[50%] lg:p-12">
				<div class="mx-auto flex w-full max-w-md flex-col">
					<div>
						<div
							class="text-muted-foreground mb-1 inline-block w-full text-[9px] font-bold tracking-widest uppercase lg:text-[10px]"
						>
							11 Months of Activity Correlated
						</div>
						<div
							class="text-muted-foreground mb-8 pb-3 text-[10px] font-bold tracking-widest uppercase lg:text-xs"
						>
							Rover AI Investigation
						</div>

						<h3 class="text-foreground mb-8 text-3xl leading-tight font-medium lg:text-4xl">
							Related activity traces back<br />
							at least <span class="text-primary font-bold">11 months.</span>
						</h3>

						<div class="border-border bg-card mb-6 rounded-xl border p-6">
							<div
								class="text-muted-foreground mb-6 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase"
							>
								<span class="bg-primary h-1.5 w-1.5 rounded-full"></span> 4 telemetry sources correlated
							</div>

							<div class="space-y-4">
								<div
									class="border-border/50 flex items-center justify-between border-b pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground text-[10px]">01</span>
										<span class="text-muted-foreground">First DNS beacon</span>
									</div>
									<span class="text-muted-foreground text-[10px]">11 mo</span>
								</div>

								<div
									class="border-border/50 flex items-center justify-between border-b pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground text-[10px]">02</span>
										<span class="text-muted-foreground">Credential change</span>
									</div>
									<span class="text-muted-foreground text-[10px]">93 d</span>
								</div>

								<div
									class="border-border/50 flex items-center justify-between border-b pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground text-[10px]">03</span>
										<span class="text-muted-foreground">Process execution</span>
									</div>
									<span class="text-muted-foreground text-[10px]">42 d</span>
								</div>

								<div
									class="border-border/50 flex items-center justify-between border-b pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="text-muted-foreground text-[10px]">04</span>
										<span class="text-muted-foreground">New cloud role</span>
									</div>
									<span class="text-muted-foreground text-[10px]">7 d</span>
								</div>

								<div class="flex items-start justify-between pt-2 text-sm">
									<div class="flex items-start gap-4">
										<span class="text-primary mt-0.5 text-[10px]">05</span>
										<div class="flex flex-col">
											<span class="text-foreground font-medium">Today's alert</span>
											<span class="text-muted-foreground mt-1 text-[11px]"
												>Traced to activity first observed 11 months ago</span
											>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-6">
						<button
							class="group border-border bg-card text-foreground hover:border-border hover:bg-card flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-[9px] font-bold tracking-widest uppercase shadow-sm transition-colors sm:w-auto lg:text-[10px]"
						>
							View Reconstructed Timeline <span
								class="transition-transform group-hover:translate-x-1">&rarr;</span
							>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- 4 Verbs -->
		<div class="mx-auto mb-24 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
			<div class="border-border flex flex-col border-l-2 pl-6">
				<h3 class="text-foreground mb-2 text-xs font-bold tracking-widest uppercase md:text-sm">
					Search
				</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">Years of security history</p>
			</div>
			<div class="border-border flex flex-col border-l-2 pl-6">
				<h3 class="text-foreground mb-2 text-xs font-bold tracking-widest uppercase md:text-sm">
					Correlate
				</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">Across every security source</p>
			</div>
			<div class="border-border flex flex-col border-l-2 pl-6">
				<h3 class="text-foreground mb-2 text-xs font-bold tracking-widest uppercase md:text-sm">
					Reconstruct
				</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">The attack timeline</p>
			</div>
			<div class="border-border flex flex-col border-l-2 pl-6">
				<h3 class="text-foreground mb-2 text-xs font-bold tracking-widest uppercase md:text-sm">
					Explain
				</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">Analyst-ready conclusions</p>
			</div>
		</div>

		<!-- 241 Days stat evidence section -->
		<div
			class="border-border bg-muted mx-auto mb-32 flex w-full max-w-4xl flex-col items-center justify-center rounded-[2rem] border px-8 py-10 text-center shadow-sm"
		>
			<p class="text-foreground mb-2 text-lg md:text-xl">
				<strong class="font-semibold">241 days</strong> — average breach lifecycle to identify and contain.
			</p>
			<p class="text-muted-foreground mb-6 md:text-lg">
				When investigations span months, AI needs more than a short hot-data window.
			</p>
			<p class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
				Source: <a
					href="https://www.ibm.com/think/x-force/2025-cost-of-a-data-breach-navigating-ai"
					target="_blank"
					class="hover:text-foreground underline decoration-zinc-300 underline-offset-4 transition-colors"
					>IBM Cost of a Data Breach 2025</a
				>
			</p>
		</div>

		<!-- Closing Punchline -->
		<div class="pb-20 text-center">
			<h2
				class="flex flex-col gap-2 text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				<span class="text-foreground">Years of security memory.</span>
				<span class="text-primary">Answers in seconds.</span>
			</h2>
		</div>
	</div>
</section>
