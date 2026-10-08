<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { comparisons } from '$lib/comparisons';
	import { Badge } from '$lib/components/ui/badge';
</script>

<section
	id="comparisons"
	aria-labelledby="comparisons-heading"
	class="dark relative overflow-hidden bg-background py-16 text-foreground sm:py-20"
>
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge
				variant="outline"
				class="border-primary/35 bg-primary/5 px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] text-primary uppercase"
			>
				Comparison
			</Badge>
			<h2
				id="comparisons-heading"
				class="mt-5 text-[32px] leading-[1.12] font-bold tracking-[-0.025em] sm:text-[40px]"
			>
				See how <span class="text-primary">Rover compares.</span>
			</h2>
		</div>

		<div class="mt-10 grid gap-5 md:grid-cols-3">
			{#each comparisons as comparison (comparison.slug)}
				<a
					href={comparison.pagePath}
					class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					<img
						src={comparison.images.dark}
						alt=""
						width="1440"
						height="900"
						loading="lazy"
						decoding="async"
						class="h-28 w-full border-b border-border object-cover sm:h-32"
					/>
					<div class="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
						<h3 class="text-[20px] leading-[1.3] font-semibold tracking-[-0.015em] sm:text-[22px]">
							{comparison.title}
						</h3>
						<p class="mt-3 text-[14px] leading-[1.65] text-foreground/70">
							{comparison.description}
						</p>
						<span
							class="mt-auto flex items-center justify-between gap-4 pt-6 text-[11px] font-semibold text-primary uppercase"
						>
							Read comparison<ArrowRight
								class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</span>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
