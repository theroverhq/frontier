<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section
	id="ai-soc"
	class="bg-background overflow-hidden border-t border-zinc-200 pt-24 text-zinc-900"
>
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mx-auto mb-24 max-w-4xl text-center">
			<Badge
				variant="default"
				class="border-primary/30 mb-8 font-mono text-xs tracking-widest uppercase"
			>
				AI SOC WITH MEMORY
			</Badge>
			<h2
				class="mb-8 text-4xl leading-tight font-medium tracking-tight text-zinc-950 md:text-5xl lg:text-6xl"
			>
				The attack started before the alert did.
			</h2>
			<p class="mx-auto max-w-3xl text-xl leading-relaxed text-zinc-600">
				Security incidents don't begin when the alert fires. Rover gives AI agents years of
				searchable security history to reconstruct the attack, correlate activity across systems,
				and investigate with the same search and analytics available to human analysts.
			</p>
		</div>

		<!-- Cinematic Visual Area 65/35 -->
		<div
			class="relative mb-24 flex w-full flex-col overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-zinc-950 text-zinc-100 shadow-2xl lg:flex-row"
		>
			<!-- LEFT: 50% - Evidence Timeline Card -->
			<div
				class="relative flex flex-col items-center border-b border-zinc-800/80 bg-zinc-950 p-8 lg:w-[50%] lg:border-r lg:border-b-0 lg:p-12"
			>
				<div class="mx-auto flex w-full max-w-md flex-col justify-center">
					<!-- Top Status Strip -->
					<div class="mb-10 flex w-full items-center">
						<div
							class="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase md:text-xs"
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
								class="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_rgba(204,255,0,0.5)] ring-4 ring-zinc-950"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="inline-flex rounded bg-zinc-800 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase"
									>
										DNS
									</div>
									<div class="font-mono text-[10px] text-zinc-500 uppercase">11 months ago</div>
								</div>
								<h4 class="text-sm font-medium text-zinc-100">First DNS beacon observed</h4>
								<p class="mt-0.5 text-xs text-zinc-500">Earliest related activity</p>
							</div>
						</div>

						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-4 ring-zinc-950"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="inline-flex rounded bg-zinc-800 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase"
									>
										IDENTITY
									</div>
									<div class="font-mono text-[10px] text-zinc-500 uppercase">93 days ago</div>
								</div>
								<h4 class="text-sm font-medium text-zinc-100">Credential changed</h4>
							</div>
						</div>

						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-4 ring-zinc-950"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="inline-flex rounded bg-zinc-800 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase"
									>
										ENDPOINT
									</div>
									<div class="font-mono text-[10px] text-zinc-500 uppercase">42 days ago</div>
								</div>
								<h4 class="text-sm font-medium text-zinc-100">Suspicious process executed</h4>
							</div>
						</div>

						<div class="group relative z-10 mb-8 flex gap-6">
							<div
								class="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-4 ring-zinc-950"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="inline-flex rounded bg-zinc-800 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase"
									>
										CLOUD
									</div>
									<div class="font-mono text-[10px] text-zinc-500 uppercase">7 days ago</div>
								</div>
								<h4 class="text-sm font-medium text-zinc-100">New cloud role assumed</h4>
							</div>
						</div>

						<div class="group relative z-10 flex gap-6">
							<div
								class="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full shadow-[0_0_12px_rgba(204,255,0,0.8)] ring-4 ring-zinc-950"
							></div>
							<div class="flex flex-1 flex-col">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="inline-flex rounded bg-zinc-800 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase"
									>
										NETWORK
									</div>
									<div class="text-primary font-mono text-[10px] font-bold uppercase">Today</div>
								</div>
								<h4 class="text-sm font-medium text-zinc-100">Alert fires</h4>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- RIGHT: 50% - Investigation Conclusion Card -->
			<div class="relative flex flex-col justify-center bg-zinc-900/40 p-8 lg:w-[50%] lg:p-12">
				<div class="mx-auto flex w-full max-w-md flex-col">
					<div>
						<div
							class="mb-1 inline-block w-full font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase lg:text-[10px]"
						>
							11 Months of Activity Correlated
						</div>
						<div
							class="mb-8 pb-3 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase lg:text-xs"
						>
							Rover AI Investigation
						</div>

						<h3 class="mb-8 text-3xl leading-tight font-medium text-zinc-100 lg:text-4xl">
							Related activity traces back<br />
							at least <span class="text-primary font-bold">11 months.</span>
						</h3>

						<div class="mb-6 rounded-xl border border-zinc-700 bg-zinc-800 p-6">
							<div
								class="mb-6 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
							>
								<span class="bg-primary h-1.5 w-1.5 rounded-full"></span> 4 telemetry sources correlated
							</div>

							<div class="space-y-4">
								<div
									class="flex items-center justify-between border-b border-zinc-700/50 pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="font-mono text-[10px] text-zinc-500">01</span>
										<span class="text-zinc-300">First DNS beacon</span>
									</div>
									<span class="font-mono text-[10px] text-zinc-500">11 mo</span>
								</div>

								<div
									class="flex items-center justify-between border-b border-zinc-700/50 pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="font-mono text-[10px] text-zinc-500">02</span>
										<span class="text-zinc-300">Credential change</span>
									</div>
									<span class="font-mono text-[10px] text-zinc-500">93 d</span>
								</div>

								<div
									class="flex items-center justify-between border-b border-zinc-700/50 pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="font-mono text-[10px] text-zinc-500">03</span>
										<span class="text-zinc-300">Process execution</span>
									</div>
									<span class="font-mono text-[10px] text-zinc-500">42 d</span>
								</div>

								<div
									class="flex items-center justify-between border-b border-zinc-700/50 pb-4 text-sm"
								>
									<div class="flex items-center gap-4">
										<span class="font-mono text-[10px] text-zinc-500">04</span>
										<span class="text-zinc-300">New cloud role</span>
									</div>
									<span class="font-mono text-[10px] text-zinc-500">7 d</span>
								</div>

								<div class="flex items-start justify-between pt-2 text-sm">
									<div class="flex items-start gap-4">
										<span class="text-primary mt-0.5 font-mono text-[10px]">05</span>
										<div class="flex flex-col">
											<span class="font-medium text-zinc-100">Today's alert</span>
											<span class="mt-1 text-[11px] text-zinc-500"
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
							class="group flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-5 py-3 font-mono text-[9px] font-bold tracking-widest text-zinc-100 uppercase shadow-sm transition-colors hover:border-zinc-500 hover:bg-zinc-700 sm:w-auto lg:text-[10px]"
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
			<div class="flex flex-col border-l-2 border-zinc-200 pl-6">
				<h3
					class="mb-2 font-mono text-xs font-bold tracking-widest text-zinc-900 uppercase md:text-sm"
				>
					Search
				</h3>
				<p class="text-sm leading-relaxed text-zinc-600">Years of security history</p>
			</div>
			<div class="flex flex-col border-l-2 border-zinc-200 pl-6">
				<h3
					class="mb-2 font-mono text-xs font-bold tracking-widest text-zinc-900 uppercase md:text-sm"
				>
					Correlate
				</h3>
				<p class="text-sm leading-relaxed text-zinc-600">Across every security source</p>
			</div>
			<div class="flex flex-col border-l-2 border-zinc-200 pl-6">
				<h3
					class="mb-2 font-mono text-xs font-bold tracking-widest text-zinc-900 uppercase md:text-sm"
				>
					Reconstruct
				</h3>
				<p class="text-sm leading-relaxed text-zinc-600">The attack timeline</p>
			</div>
			<div class="flex flex-col border-l-2 border-zinc-200 pl-6">
				<h3
					class="mb-2 font-mono text-xs font-bold tracking-widest text-zinc-900 uppercase md:text-sm"
				>
					Explain
				</h3>
				<p class="text-sm leading-relaxed text-zinc-600">Analyst-ready conclusions</p>
			</div>
		</div>

		<!-- 241 Days stat evidence section -->
		<div
			class="mx-auto mb-32 flex w-full max-w-4xl flex-col items-center justify-center rounded-[2rem] border border-zinc-200 bg-zinc-50 px-8 py-10 text-center shadow-sm"
		>
			<p class="mb-2 text-lg text-zinc-900 md:text-xl">
				<strong class="font-semibold">241 days</strong> — average breach lifecycle to identify and contain.
			</p>
			<p class="mb-6 text-zinc-600 md:text-lg">
				When investigations span months, AI needs more than a short hot-data window.
			</p>
			<p class="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
				Source: <a
					href="https://www.ibm.com/think/x-force/2025-cost-of-a-data-breach-navigating-ai"
					target="_blank"
					class="underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900"
					>IBM Cost of a Data Breach 2025</a
				>
			</p>
		</div>

		<!-- Closing Punchline -->
		<div class="pb-20 text-center">
			<h2 class="flex flex-col gap-2 text-4xl font-medium tracking-tight md:text-5xl lg:text-7xl">
				<span class="text-zinc-900">Years of security memory.</span>
				<span class="text-primary">Answers in seconds.</span>
			</h2>
		</div>
	</div>
</section>
