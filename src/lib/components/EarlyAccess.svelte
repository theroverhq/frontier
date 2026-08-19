<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
</script>

<section
	id="early-access"
	class="dark bg-background text-foreground relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden py-20 sm:py-24"
>
	<div class="relative z-10 container mx-auto max-w-screen-xl px-4 text-center sm:px-6">
		<!-- Main CTA Area -->
		<div class="mx-auto max-w-5xl">
			<!-- Eyebrow -->
			<div class="mb-8 flex justify-center">
				<Badge
					variant="outline"
					class="text-primary border-primary/30 mb-6 font-mono text-xs tracking-widest uppercase"
					>Rover Early Access</Badge
				>
			</div>

			<!-- Headline -->
			<h2 class="text-foreground mb-8 text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl">
				Bring the data your SIEM<br class="hidden sm:block" />
				<span class="text-primary font-bold">can't afford to keep.</span>
			</h2>

			<!-- Supporting Copy -->
			<p class="text-foreground/70 mx-auto mb-14 max-w-3xl text-xl leading-relaxed sm:text-2xl">
				Join Rover Early Access and make high-volume security telemetry searchable for years—not
				days. Start with DNS, network flows, cloud audit, raw endpoint telemetry, or anything you
				archive today because it’s too expensive to index.
			</p>

			<!-- CTA Buttons -->
			<div class="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
				<Button
					size="lg"
					class="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-full rounded-full px-10 text-sm font-semibold tracking-wide sm:w-auto"
				>
					Join Early Access
				</Button>
				<Button
					size="lg"
					variant="outline"
					class="h-14 w-full rounded-full bg-transparent px-10 text-sm font-semibold tracking-wide sm:w-auto"
				>
					See Rover in Action
				</Button>
			</div>
		</div>

		<!-- Compact Proof Rail -->
		<div class="border-border mx-auto mb-16 max-w-4xl border-y py-8">
			<div
				class="text-foreground/60 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 font-mono text-[10px] font-bold tracking-widest uppercase sm:text-xs"
			>
				<span class="text-foreground">Go live in hours</span>
				<span>&bull;</span>
				<span class="text-foreground">Customer-owned object storage</span>
				<span>&bull;</span>
				<span class="text-foreground">Schema-on-read</span>
				<span>&bull;</span>
				<span class="text-foreground">No search clusters</span>
			</div>
		</div>

		<!-- Qualification Block -->
		<div class="mx-auto mb-16 max-w-4xl text-center">
			<p class="text-foreground/80 mb-5 font-mono text-[10px] font-bold tracking-widest uppercase">
				A good fit if you:
			</p>
			<div
				class="text-foreground/90 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 font-mono text-[9px] font-bold tracking-widest uppercase sm:text-[10px]"
			>
				<span class="bg-muted border-border rounded-lg border px-3 py-2"
					>Generate TBs/day</span
				>
				<span class="bg-muted border-border rounded-lg border px-3 py-2"
					>Need multi-year retention</span
				>
				<span class="bg-muted border-border rounded-lg border px-3 py-2"
					>Archive high-volume telemetry</span
				>
			</div>
		</div>

		<!-- Final Brand Callback -->
		<div class="mt-8 flex flex-col items-center opacity-60 transition-opacity hover:opacity-100">
			<div class="text-foreground mb-1 text-2xl font-bold tracking-tight">ROVER</div>
			<h3 class="text-foreground text-lg font-medium tracking-tight md:text-xl">
				Cold Storage. <span class="text-primary">Hot Intelligence.</span>
			</h3>
		</div>
	</div>
</section>
