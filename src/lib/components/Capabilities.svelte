<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
</script>

<section id="capabilities" class="bg-background text-foreground py-20">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="mb-12 max-w-3xl">
			<div class="mb-3 flex items-center gap-2">
				<span class="bg-primary h-1.5 w-1.5 rounded-full"></span>
				<span class="text-muted-foreground text-xs font-bold tracking-widest uppercase"
					>Four Core Pillars</span
				>
			</div>
			<h2 class="text-foreground text-4xl font-medium tracking-tight md:text-5xl">
				Four things Rover turns your security lake into.
			</h2>
			<p class="text-muted-foreground mt-3 text-xl">
				Instead of dozens of disconnected features, Rover provides four unified capabilities on top
				of your underlying object storage.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- PANEL 1: SEARCH -->
			<Card
				class="bg-muted/20 hover:border-muted-foreground/30 flex min-h-[320px] flex-col justify-between rounded-3xl shadow-sm transition-all"
			>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-foreground font-mono text-xs font-bold uppercase"
						>01 / SEARCH</CardTitle
					>
					<Badge variant="secondary">Years of Data</Badge>
				</CardHeader>
				<CardContent class="mt-4 flex-1">
					<h3 class="text-foreground text-2xl font-semibold">
						Find the needle across years of data.
					</h3>
					<p class="text-muted-foreground mt-3 text-base leading-relaxed">
						Full-text search, filters, ranges, regex, fields, and historical investigation across
						massive datasets without waiting for indexing pipelines.
					</p>
				</CardContent>
				<CardFooter class="border-border flex items-center gap-3 border-t pt-4">
					<span class="text-foreground font-mono text-xs font-bold">Query syntax:</span>
					<code
						class="bg-background border-border text-foreground rounded-md border px-2.5 py-1 font-mono text-[10px]"
						>fulltext:"unauthorized_access"</code
					>
				</CardFooter>
			</Card>

			<!-- PANEL 2: ANALYTICS -->
			<Card
				class="bg-muted/20 hover:border-muted-foreground/30 flex min-h-[320px] flex-col justify-between rounded-3xl shadow-sm transition-all"
			>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-foreground font-mono text-xs font-bold uppercase"
						>02 / ANALYTICS</CardTitle
					>
					<Badge variant="secondary">In-Place Analytics</Badge>
				</CardHeader>
				<CardContent class="mt-4 flex-1">
					<h3 class="text-foreground text-2xl font-semibold">Ask more than “where is it?”</h3>
					<p class="text-muted-foreground mt-3 text-base leading-relaxed">
						Count, group, correlate, calculate, visualize, and analyze the results directly without
						moving them into another analytics engine or warehouse.
					</p>
				</CardContent>
				<CardFooter class="border-border flex items-center gap-3 border-t pt-4">
					<span class="text-foreground font-mono text-xs font-bold">Analytics:</span>
					<code
						class="bg-background border-border text-foreground rounded-md border px-2.5 py-1 font-mono text-[10px]"
						>stats count() by src_ip</code
					>
				</CardFooter>
			</Card>

			<!-- PANEL 3: SECURITY -->
			<Card
				class="bg-muted/20 hover:border-muted-foreground/30 flex min-h-[320px] flex-col justify-between rounded-3xl shadow-sm transition-all"
			>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-foreground font-mono text-xs font-bold uppercase"
						>03 / SECURITY</CardTitle
					>
					<Badge variant="secondary">Full-Lake Detections</Badge>
				</CardHeader>
				<CardContent class="mt-4 flex-1">
					<h3 class="text-foreground text-2xl font-semibold">Detect on everything you keep.</h3>
					<p class="text-muted-foreground mt-3 text-base leading-relaxed">
						SIEM, continuous detections, threat hunting, dashboards, investigations, and long-term
						forensic analysis across your entire telemetry dataset.
					</p>
				</CardContent>
				<CardFooter class="border-border flex items-center gap-3 border-t pt-4">
					<span class="text-foreground font-mono text-xs font-bold">Security rules:</span>
					<code
						class="bg-background border-border text-foreground rounded-md border px-2.5 py-1 font-mono text-[10px]"
						>Sigma Rules • Baselines</code
					>
				</CardFooter>
			</Card>

			<!-- PANEL 4: AI -->
			<Card
				class="bg-muted/20 hover:border-muted-foreground/30 flex min-h-[320px] flex-col justify-between rounded-3xl shadow-sm transition-all"
			>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-foreground font-mono text-xs font-bold uppercase"
						>04 / AI</CardTitle
					>
					<Badge variant="secondary">Multi-Year Context</Badge>
				</CardHeader>
				<CardContent class="mt-4 flex-1">
					<h3 class="text-foreground text-2xl font-semibold">Give your SOC a memory.</h3>
					<p class="text-muted-foreground mt-3 text-base leading-relaxed">
						Let analysts and agents investigate against years of searchable security context rather
						than only today's hot data.
					</p>
				</CardContent>
				<CardFooter class="border-border flex items-center gap-3 border-t pt-4">
					<span class="text-foreground font-mono text-xs font-bold">AI advantage:</span>
					<code
						class="bg-background border-border text-foreground rounded-md border px-2.5 py-1 font-mono text-[10px]"
						>Agentic Triage</code
					>
				</CardFooter>
			</Card>
		</div>
	</div>
</section>
