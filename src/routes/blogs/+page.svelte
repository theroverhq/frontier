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
	<title>Rover Blog | Agentic SIEM, SecOps, and S3 Search</title>
	<meta
		name="description"
		content="Read Rover research and engineering notes on agentic SIEM architecture, security data lakes, S3-native search, and AI-assisted SecOps."
	/>
</svelte:head>

<div class="dark min-h-screen bg-background text-foreground">
	<!-- Hero Section -->
	<section class="border-b border-border bg-card/40 py-16 lg:py-24">
		<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
			<div class="max-w-3xl">
				<div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
					<span class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
					Rover Engineering Blog
				</div>
				<h1 class="mt-6 font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
					Insights for <span class="text-primary">agentic</span> security teams.
				</h1>
				<p class="mt-4 text-lg text-text-secondary leading-relaxed">
					Architecture notes on Agentic SIEM, S3-native search, retained telemetry, and the operational tradeoffs shaping modern SecOps.
				</p>
			</div>

			<!-- Search & Filter Controls -->
			<div class="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-8">
				<!-- Category Filter Pills -->
				<div class="flex flex-wrap gap-2">
					{#each categories as cat}
						<button
							onclick={() => (selectedCategory = cat)}
							class="rounded-full px-4 py-1.5 text-xs font-mono transition-colors {selectedCategory === cat
								? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20'
								: 'bg-card hover:bg-hover text-text-secondary hover:text-foreground border border-border'}"
						>
							{cat}
						</button>
					{/each}
				</div>

				<!-- Search Input -->
				<div class="relative w-full sm:w-72">
					<Search class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search posts..."
						class="w-full rounded-full border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- Main Posts Grid -->
	<section class="py-16">
		<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
			<div class="mb-8 flex items-center justify-between border-b border-border pb-4">
				<h2 class="font-heading text-xl font-semibold text-foreground">
					Articles <span class="text-sm font-normal text-text-secondary">({filteredBlogs.length})</span>
				</h2>
			</div>

			{#if filteredBlogs.length === 0}
				<div class="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
					No posts found matching your search. Try clearing your filter or query.
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredBlogs as blog, index (blog.slug)}
						<article
							class="group relative flex flex-col justify-between rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
						>
							<div>
								<div class="mb-4 flex items-center justify-between text-xs font-mono">
									<span class="font-semibold text-primary">
										{blog.blog_counter}
										{#if index === 0 && selectedCategory === 'All' && !searchQuery}
											<span class="ml-1 text-[10px] uppercase text-text-muted font-normal">/ Newest</span>
										{/if}
									</span>
									<span class="rounded bg-background border border-border/80 px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
										{blog.category}
									</span>
								</div>

								<h3 class="font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
									<a href="/blogs/{blog.slug}">
										<span class="absolute inset-0"></span>
										{blog.card_title}
									</a>
								</h3>

								<p class="mt-3 text-xs leading-relaxed text-text-secondary line-clamp-3">
									{blog.description}
								</p>
							</div>

							<div class="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-mono text-text-secondary">
								<span>{blog.published_label}</span>
								<span class="flex items-center gap-1 font-semibold text-primary group-hover:underline">
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
