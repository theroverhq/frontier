<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import Database from '@lucide/svelte/icons/database';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const products = [
		{
			name: 'SIEM',
			icon: ShieldCheck,
			description: 'Search security telemetry, detect threats, and investigate with context.',
			href: '/siem/',
			link: 'Explore SIEM'
		},
		{
			name: 'Security Data Lake',
			icon: CloudUpload,
			description: 'Retain and search years of security data in your object storage.',
			href: '/security-data-lake/',
			link: 'Explore SDL'
		},
		{
			name: 'DAM',
			icon: Database,
			description: 'Monitor database queries, oversee access, and protect sensitive data.',
			href: '/database-activity-monitoring/',
			link: 'Explore DAM'
		}
	];
</script>

<section
	id="product-overview"
	aria-labelledby="product-overview-heading"
	class="dark border-t border-border bg-background py-14 text-foreground sm:py-16"
>
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<h2
				id="product-overview-heading"
				class="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] font-bold tracking-[-0.025em]"
			>
				Explore Rover.
			</h2>
			<p class="mt-4 text-[16px] leading-[1.6] text-foreground/70">
				Choose the product that fits your needs.
			</p>
		</div>
		<div class="mt-9 grid gap-5 md:grid-cols-3">
			{#each products as product (product.href)}
				<a
					href={product.href}
					class="effect-card group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none lg:p-8"
				>
					<div class="flex items-center gap-3">
						<product.icon
							class="h-6 w-6 shrink-0 text-primary"
							stroke-width={1.75}
							aria-hidden="true"
						/>
						<h3 class="text-[22px] leading-[1.25] font-semibold tracking-[-0.015em]">
							{product.name}
						</h3>
					</div>
					<p class="mt-5 text-[15px] leading-[1.65] text-foreground/70">
						{product.description}
					</p>
					<span
						class="mt-auto flex min-h-11 items-center justify-between gap-3 pt-6 text-[12px] font-semibold tracking-wide text-primary uppercase"
					>
						{product.link}
						<ArrowRight
							class="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:translate-x-0 motion-reduce:transition-none"
							aria-hidden="true"
						/>
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>
