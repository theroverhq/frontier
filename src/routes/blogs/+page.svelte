<script lang="ts">
	import { blogs, type BlogPost } from '$lib/data/blogs';
	import { Search } from '@lucide/svelte';

	let searchQuery = $state('');
	let selectedCategory = $state('All');

	const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category)))];

	const filteredBlogs = $derived(
		blogs.filter((blog) => {
			const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
			const matchesSearch =
				searchQuery.trim() === '' ||
				blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				blog.card_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				blog.description.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);
</script>

<svelte:head>
	<title>Rover Blog | Security Data Lakes & Object Storage Search</title>
	<meta
		name="description"
		content="Engineering research and architecture notes on object storage log search, SIEM cost optimization, multi-year telemetry retention, and AI SOC automation."
	/>
	<meta
		name="keywords"
		content="Rover Blog, Security Data Lake, Object Storage SIEM, SIEM cost reduction, telemetry retention, SOC automation, detection engineering, threat hunting"
	/>
	<link rel="canonical" href="https://roverhq.ai/blogs/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://roverhq.ai/blogs/" />
	<meta property="og:title" content="Rover Blog | Security Data Lakes & Object Storage Search" />
	<meta
		property="og:description"
		content="Engineering research and architecture notes on object storage log search, SIEM cost optimization, multi-year telemetry retention, and AI SOC automation."
	/>
	<meta property="og:image" content="https://roverhq.ai/og-image.jpg" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Rover Blog | Security Data Lakes & Object Storage Search" />
	<meta
		name="twitter:description"
		content="Engineering research and architecture notes on object storage log search, SIEM cost optimization, multi-year telemetry retention, and AI SOC automation."
	/>
	<meta name="twitter:image" content="https://roverhq.ai/og-image.jpg" />

	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "Blog",
		"name": "Rover Blog | Security Data Lakes & Object Storage Search",
		"description": "Engineering research and architecture notes on object storage log search, SIEM cost optimization, multi-year telemetry retention, and AI SOC automation.",
		"url": "https://roverhq.ai/blogs/",
		"publisher": {
			"@type": "Organization",
			"name": "Rover",
			"logo": "https://roverhq.ai/rover-logo.png"
		}
	}
	</script>`}
</svelte:head>

<div class="dark bg-background text-foreground min-h-screen">
	<!-- Hero Section -->
	<section class="border-border bg-card/40 border-b py-16 lg:py-24">
		<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
			<div class="max-w-3xl">
				<div
					class="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-xs font-semibold tracking-wider uppercase"
				>
					<span class="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"></span>
					Rover Engineering Blog
				</div>
				<h1
					class="font-heading text-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
				>
					Insights for <span class="text-primary">modern</span> security teams.
				</h1>
				<p class="text-text-secondary mt-4 text-lg leading-relaxed">
					Architecture notes on Security Data Lakes, Object Storage-native search, retained
					telemetry, and the operational tradeoffs shaping modern SecOps.
				</p>
			</div>

			<!-- Search & Filter Controls -->
			<div
				class="border-border mt-12 flex flex-col gap-6 border-t pt-8 xl:flex-row xl:items-start xl:justify-between"
			>
				<!-- Category Filter Pills -->
				<div class="flex flex-wrap gap-2">
					{#each categories as cat}
						<button
							onclick={() => (selectedCategory = cat)}
							aria-pressed={selectedCategory === cat}
							class="min-h-11 rounded-full px-4 py-2 font-mono text-xs transition-colors {selectedCategory ===
							cat
								? 'bg-primary text-primary-foreground shadow-primary/20 font-semibold shadow-sm'
								: 'bg-card hover:bg-hover text-foreground/85 hover:text-foreground border-border border'}"
						>
							{cat}
						</button>
					{/each}
				</div>

				<!-- Search Input -->
				<div class="relative w-full xl:w-72 xl:shrink-0">
					<label for="blog-search" class="sr-only">Search blog posts</label>
					<Search class="text-text-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
					<input
						id="blog-search"
						type="text"
						bind:value={searchQuery}
						placeholder="Search posts..."
						class="border-border bg-card text-foreground placeholder:text-foreground/70 focus:border-primary focus:ring-primary h-11 w-full rounded-full border py-2 pr-4 pl-10 text-base focus:ring-1 focus:outline-none xl:text-sm"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- Main Posts Grid -->
	<section class="py-16">
		<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
			<div class="border-border mb-8 flex items-center justify-between border-b pb-4">
				<h2 class="font-heading text-foreground text-xl font-semibold">
					Articles <span class="text-text-secondary text-sm font-normal"
						>({filteredBlogs.length})</span
					>
				</h2>
			</div>

			{#if filteredBlogs.length === 0}
				<div
					class="border-border text-text-secondary rounded-xl border border-dashed p-12 text-center"
				>
					No posts found matching your search. Try clearing your filter or query.
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredBlogs as blog, index (blog.slug)}
						<article
							class="group border-border bg-card/80 hover:border-primary/50 hover:bg-card hover:shadow-primary/5 relative flex flex-col justify-between rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
						>
							<div>
								<div class="mb-4 flex items-center justify-between font-mono text-xs">
									<span class="text-primary font-semibold">
										{blog.blog_counter}
										{#if index === 0 && selectedCategory === 'All' && !searchQuery}
											<span class="text-text-muted ml-1 text-[10px] font-normal uppercase"
												>/ Newest</span
											>
										{/if}
									</span>
									<span
										class="bg-background border-border/80 text-text-secondary rounded border px-2.5 py-0.5 text-[11px] font-medium"
									>
										{blog.category}
									</span>
								</div>

								<h3
									class="font-heading text-foreground group-hover:text-primary text-lg leading-snug font-semibold transition-colors"
								>
									<a href="/blogs/{blog.slug}/">
										<span class="absolute inset-0"></span>
										{blog.card_title}
									</a>
								</h3>

								<p class="text-text-secondary mt-3 line-clamp-3 text-xs leading-relaxed">
									{blog.description}
								</p>
							</div>

							<div
								class="border-border/60 text-text-secondary mt-6 flex items-center justify-between border-t pt-4 font-mono text-xs"
							>
								<span>{blog.published_label}</span>
								<span
									class="text-primary flex items-center gap-1 font-semibold group-hover:underline"
								>
									Read article →
								</span>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>
