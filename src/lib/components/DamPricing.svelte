<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import DamPricingCalculator from '$lib/components/DamPricingCalculator.svelte';
</script>

<section
	id="pricing"
	class="dark relative overflow-hidden bg-background pt-24 pb-28 text-foreground"
>
	<span id="economics" class="absolute top-0" aria-hidden="true"></span>
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge
				href="#pricing"
				variant="outline"
				class="h-auto max-w-full border-primary/35 bg-primary/5 px-3 py-1 text-center text-[11.5px] leading-snug font-bold tracking-[0.12em] whitespace-normal text-primary uppercase sm:px-4"
			>
				Pricing
			</Badge>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				Price your <span class="text-primary">database monitoring.</span>
			</h2>
		</div>
		<div class="mt-16">
			<DamPricingCalculator />
		</div>
	</div>
</section>
