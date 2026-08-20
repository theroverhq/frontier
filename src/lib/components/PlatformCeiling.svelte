<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<section id="platform-ceiling" class="bg-background text-foreground overflow-hidden pt-24 pb-32">
	<div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mx-auto mb-24 max-w-4xl text-center">
			<Badge variant="default" class="border-primary/30 mb-8 text-xs tracking-widest uppercase">
				BEYOND SIEM
			</Badge>
			<h2
				class="text-foreground mb-8 text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
			>
				Security is where Rover starts.
			</h2>
			<p class="text-muted-foreground mx-auto max-w-4xl text-xl leading-relaxed">
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
					class="border-border bg-background ring-border relative flex flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-sm ring-1 transition-all hover:shadow-md"
				>
					<div class="bg-primary absolute top-0 left-0 h-1 w-full"></div>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span
								class="bg-primary h-2 w-2 animate-pulse rounded-full shadow-[0_0_8px_rgba(204,255,0,0.8)]"
							></span>
							<h3 class="text-foreground text-[10px] font-bold tracking-widest uppercase">
								Security
							</h3>
						</div>
					</div>
					<div class="text-foreground text-sm leading-relaxed font-medium">
						SIEM &middot; AI SOC &middot; Detections &middot; Threat Hunting
					</div>
				</div>

				<!-- OBSERVABILITY -->
				<div
					class="border-border bg-muted/50 hover:bg-muted/80/50 flex flex-col justify-between rounded-xl border border-dashed p-6 opacity-100 transition-all"
				>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span class="bg-border h-2 w-2 rounded-full"></span>
							<h3 class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
								Observability
							</h3>
						</div>
					</div>
					<div class="text-muted-foreground text-sm leading-relaxed font-medium">
						Logs &middot; Infrastructure &middot; Troubleshooting
					</div>
				</div>

				<!-- AUDIT + COMPLIANCE -->
				<div
					class="border-border bg-muted/50 hover:bg-muted/80/50 flex flex-col justify-between rounded-xl border border-dashed p-6 opacity-100 transition-all"
				>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span class="bg-border h-2 w-2 rounded-full"></span>
							<h3 class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
								Audit + Compliance
							</h3>
						</div>
					</div>
					<div class="text-muted-foreground text-sm leading-relaxed font-medium">
						Audit Trails &middot; Forensics &middot; Long-term Evidence
					</div>
				</div>

				<!-- MACHINE DATA -->
				<div
					class="border-border bg-muted/50 hover:bg-muted/80/50 flex flex-col justify-between rounded-xl border border-dashed p-6 opacity-100 transition-all"
				>
					<div>
						<div class="mt-1 mb-4 flex items-center gap-2">
							<span class="bg-border h-2 w-2 rounded-full"></span>
							<h3 class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
								Machine Data
							</h3>
						</div>
					</div>
					<div class="text-muted-foreground text-sm leading-relaxed font-medium">
						Events &middot; Telemetry &middot; Operational Analytics
					</div>
				</div>
			</div>

			<!-- Connection diagram lines (Desktop only) -->
			<div class="relative mt-2 mb-2 hidden h-12 flex-col items-center justify-center md:flex">
				<!-- Horizontal bus line in the middle -->
				<div class="bg-border absolute top-1/2 h-px w-[75%]"></div>
				<!-- Drop down lines from each column to the bus -->
				<div class="absolute top-0 flex w-full justify-around px-8">
					<div class="bg-border h-6 w-px"></div>
					<div class="bg-border h-6 w-px"></div>
					<div class="bg-border h-6 w-px"></div>
					<div class="bg-border h-6 w-px"></div>
				</div>
				<!-- Central trunk line from bus to engine -->
				<div class="bg-border absolute top-1/2 h-6 w-px"></div>
			</div>

			<!-- Spacer for Mobile -->
			<div class="h-12 md:hidden"></div>

			<!-- ROVER ENGINE -->
			<div
				class="border-border/80 dark bg-background mx-auto max-w-4xl rounded-[2rem] border p-10 text-center shadow-2xl"
			>
				<h3 class="text-foreground mb-6 text-xs font-bold tracking-widest uppercase md:text-sm">
					Rover Engine
				</h3>
				<div
					class="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold tracking-widest uppercase sm:text-[11px]"
				>
					<span class="text-foreground">Object-native search</span>
					<span class="text-muted-foreground">&bull;</span>
					<span class="text-foreground">Fast analytics</span>
					<span class="text-muted-foreground">&bull;</span>
					<span class="text-foreground">Schema-on-read</span>
					<span class="text-muted-foreground">&bull;</span>
					<span class="text-foreground">Serverless query compute</span>
				</div>
			</div>

			<!-- Closing Statement -->
			<div class="border-border mt-32 border-t pt-24 text-center">
				<h2
					class="flex flex-col gap-2 text-3xl leading-tight font-medium tracking-tight md:text-4xl lg:text-5xl"
				>
					<span class="text-foreground">Built for security.</span>
					<span class="text-muted-foreground"
						>Engineered for <strong class="text-primary font-semibold">machine data.</strong></span
					>
				</h2>
			</div>
		</div>
	</div>
</section>
