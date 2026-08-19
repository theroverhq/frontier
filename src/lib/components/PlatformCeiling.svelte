<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section id="platform-ceiling" class="bg-background overflow-hidden pb-28 text-zinc-900">
	<div class="relative z-10 container mx-auto max-w-screen-xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mx-auto mb-24 max-w-4xl text-center">
			<Badge
				variant="default"
				class=" border-primary/30 mb-8 font-mono text-xs tracking-widest uppercase"
			>
				BEYOND SIEM
			</Badge>
			<h2
				class="mb-8 text-4xl leading-tight font-medium tracking-tight text-zinc-950 md:text-5xl lg:text-6xl"
			>
				Security is where Rover starts.
			</h2>
			<p class="mx-auto max-w-4xl text-xl leading-relaxed text-zinc-600">
				Rover is powered by a serverless search and analytics engine built for massive event
				streams. The same object-native architecture that makes years of security data searchable
				can extend to observability, audit, and other high-volume machine-data workloads.
			</p>
		</div>

		<!-- Platform Ceiling Visual -->
		<div class="mx-auto max-w-5xl">
			<!-- Top row: The 4 expansion areas -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
				<!-- SECURITY -->
				<div
					class="relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md"
				>
					<div class="bg-primary absolute top-0 left-0 h-1 w-full"></div>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span
								class="bg-primary h-2 w-2 animate-pulse rounded-full shadow-[0_0_8px_rgba(204,255,0,0.8)]"
							></span>
							<h3 class="font-mono text-[10px] font-bold tracking-widest text-zinc-900 uppercase">
								Security
							</h3>
						</div>
					</div>
					<div class="text-sm leading-relaxed font-medium text-zinc-900">
						SIEM &middot; AI SOC &middot; Detections &middot; Threat Hunting
					</div>
				</div>

				<!-- OBSERVABILITY -->
				<div
					class="flex flex-col justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 opacity-100 transition-all hover:bg-zinc-100/50"
				>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span class="h-2 w-2 rounded-full bg-zinc-300"></span>
							<h3 class="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
								Observability
							</h3>
						</div>
					</div>
					<div class="text-sm leading-relaxed font-medium text-zinc-700">
						Logs &middot; Infrastructure &middot; Troubleshooting
					</div>
				</div>

				<!-- AUDIT + COMPLIANCE -->
				<div
					class="flex flex-col justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 opacity-100 transition-all hover:bg-zinc-100/50"
				>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span class="h-2 w-2 rounded-full bg-zinc-300"></span>
							<h3 class="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
								Audit + Compliance
							</h3>
						</div>
					</div>
					<div class="text-sm leading-relaxed font-medium text-zinc-700">
						Audit Trails &middot; Forensics &middot; Long-term Evidence
					</div>
				</div>

				<!-- MACHINE DATA -->
				<div
					class="flex flex-col justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 opacity-100 transition-all hover:bg-zinc-100/50"
				>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span class="h-2 w-2 rounded-full bg-zinc-300"></span>
							<h3 class="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
								Machine Data
							</h3>
						</div>
					</div>
					<div class="text-sm leading-relaxed font-medium text-zinc-700">
						Events &middot; Telemetry &middot; Operational Analytics
					</div>
				</div>
			</div>

			<!-- Connection diagram lines (Desktop only) -->
			<div class="relative mt-2 mb-2 hidden h-12 flex-col items-center justify-center md:flex">
				<!-- Horizontal bus line in the middle -->
				<div class="absolute top-1/2 h-px w-[75%] bg-zinc-200"></div>
				<!-- Drop down lines from each column to the bus -->
				<div class="absolute top-0 flex w-full justify-around px-8">
					<div class="h-6 w-px bg-zinc-200"></div>
					<div class="h-6 w-px bg-zinc-200"></div>
					<div class="h-6 w-px bg-zinc-200"></div>
					<div class="h-6 w-px bg-zinc-200"></div>
				</div>
				<!-- Central trunk line from bus to engine -->
				<div class="absolute top-1/2 h-6 w-px bg-zinc-300"></div>
			</div>

			<!-- Spacer for Mobile -->
			<div class="h-12 md:hidden"></div>

			<!-- ROVER ENGINE -->
			<div
				class="mx-auto max-w-4xl rounded-[2rem] border border-zinc-800/80 bg-zinc-950 p-10 text-center shadow-2xl"
			>
				<h3
					class="mb-6 font-mono text-xs font-bold tracking-widest text-zinc-100 uppercase md:text-sm"
				>
					Rover Engine
				</h3>
				<div
					class="flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase sm:text-[11px]"
				>
					<span class="text-zinc-100">Object-native search</span>
					<span class="text-zinc-700">&bull;</span>
					<span class="text-zinc-100">Fast analytics</span>
					<span class="text-zinc-700">&bull;</span>
					<span class="text-zinc-100">Schema-on-read</span>
					<span class="text-zinc-700">&bull;</span>
					<span class="text-zinc-100">Serverless query compute</span>
				</div>
			</div>

			<!-- Closing Statement -->
			<div class="mt-32 border-t border-zinc-200 pt-24 text-center">
				<h2
					class="flex flex-col gap-2 text-4xl leading-tight font-medium tracking-tight md:text-5xl lg:text-6xl"
				>
					<span class="text-zinc-900">Built for security.</span>
					<span class="text-zinc-600">Engineered for <strong class="font-semibold text-primary">machine data.</strong></span>
				</h2>
			</div>
		</div>
	</div>
</section>
