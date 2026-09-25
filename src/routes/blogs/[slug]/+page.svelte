<script lang="ts">
	import type { PageData } from './$types';
	import { ArrowLeft, ArrowRight, BookOpen, Clock, Calendar, ChevronRight } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.blog.title}</title>
	<meta name="description" content={data.blog.description} />
	<link rel="canonical" href="https://roverhq.ai/blogs/{data.blog.slug}/" />

	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://roverhq.ai/blogs/{data.blog.slug}/" />
	<meta property="og:title" content={data.blog.title} />
	<meta property="og:description" content={data.blog.description} />
	<meta property="og:image" content={data.blog.og_image || 'https://roverhq.ai/og-image.jpg'} />
	{#if data.blog.og_image_alt}
		<meta property="og:image:alt" content={data.blog.og_image_alt} />
	{/if}
	<meta property="article:section" content={data.blog.category} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.blog.title} />
	<meta name="twitter:description" content={data.blog.description} />
	<meta name="twitter:image" content={data.blog.og_image || 'https://roverhq.ai/og-image.jpg'} />
	{#if data.blog.og_image_alt}
		<meta name="twitter:image:alt" content={data.blog.og_image_alt} />
	{/if}

	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"headline": ${JSON.stringify(data.blog.card_title)},
		"description": ${JSON.stringify(data.blog.description)},
		"image": [${JSON.stringify(data.blog.og_image || 'https://roverhq.ai/og-image.jpg')}],
		"url": ${JSON.stringify('https://roverhq.ai/blogs/' + data.blog.slug + '/')},
		"articleSection": ${JSON.stringify(data.blog.category)},
		"author": {
			"@type": "Organization",
			"name": "Rover Engineering",
			"url": "https://roverhq.ai"
		},
		"publisher": {
			"@type": "Organization",
			"name": "Rover",
			"logo": {
				"@type": "ImageObject",
				"url": "https://roverhq.ai/rover-logo.png"
			}
		},
		"mainEntityOfPage": {
			"@type": "WebPage",
			"@id": ${JSON.stringify('https://roverhq.ai/blogs/' + data.blog.slug + '/')}
		}
	}
	</script>`}
</svelte:head>

<div class="dark bg-background text-foreground min-h-screen">
	<!-- Breadcrumb Header -->
	<div class="border-border bg-card/60 border-b py-3 backdrop-blur-md">
		<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
			<div class="text-text-secondary flex items-center gap-2 font-sans text-sm">
				<a href="/blogs/" class="hover:text-primary transition-colors">Blogs</a>
				<ChevronRight class="text-text-muted h-3 w-3 shrink-0" />
				<span class="text-primary shrink-0 font-medium">{data.blog.category}</span>
				<ChevronRight class="text-text-muted h-3 w-3 shrink-0" />
				<span class="text-foreground truncate font-medium">{data.blog.card_title}</span>
			</div>
		</div>
	</div>

	<div class="container mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
			<!-- Left Sticky Sidebar -->
			<aside class="order-2 lg:order-1">
				<div
					class="border-border bg-card sticky top-24 rounded-xl border p-5 shadow-lg shadow-black/20 backdrop-blur-md"
				>
					<div class="border-border mb-4 flex items-center justify-between border-b pb-3">
						<span
							class="text-foreground flex items-center gap-2 font-sans text-xs font-bold tracking-wider uppercase"
						>
							<BookOpen class="text-primary h-3.5 w-3.5" />
							Latest Insights
						</span>
						<span
							class="bg-primary/10 border-primary/20 text-primary rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-semibold"
						>
							{data.allBlogs.length} Posts
						</span>
					</div>

					<nav
						class="flex max-h-[calc(100vh-220px)] scrollbar-thin flex-col gap-1.5 overflow-y-auto pr-1 font-sans text-sm"
					>
						{#each data.allBlogs as b (b.slug)}
							{@const isActive = b.slug === data.blog.slug}
							<a
								href="/blogs/{b.slug}/"
								class="group flex flex-col gap-1 rounded-lg px-3 py-2.5 transition-all {isActive
									? 'bg-primary-subtle text-primary border-primary-border/40 border font-semibold shadow-sm'
									: 'text-text-secondary hover:bg-hover hover:text-foreground border border-transparent'}"
							>
								<div
									class="flex flex-wrap items-center justify-between gap-x-2 font-sans text-[11px]"
								>
									<span class={isActive ? 'text-primary font-bold' : 'text-text-muted'}>
										{b.blog_counter}
									</span>
									<span class={isActive ? 'text-primary/90 font-medium' : 'text-text-muted'}
										>{b.category}</span
									>
								</div>
								<span
									class="group-hover:text-primary line-clamp-2 leading-[1.55] transition-colors"
								>
									{b.card_title}
								</span>
							</a>
						{/each}
					</nav>
				</div>
			</aside>

			<!-- Right Content Main Panel -->
			<main class="order-1 w-full max-w-3xl min-w-0 lg:order-2">
				<!-- Header Meta -->
				<header class="border-border mb-10 border-b pb-8">
					<div class="mb-4 flex flex-wrap items-center gap-3">
						<span
							class="bg-primary/15 border-primary/30 text-primary rounded-full border px-3.5 py-1 font-sans text-xs font-semibold"
						>
							{data.blog.blog_counter}
						</span>
						<span
							class="bg-card text-text-secondary border-border rounded-full border px-3.5 py-1 font-sans text-xs font-medium"
						>
							{data.blog.category}
						</span>
					</div>

					<h1
						class="font-heading text-foreground text-[clamp(2.125rem,4.4vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.028em]"
					>
						{data.blog.card_title}
					</h1>

					<div
						class="text-text-secondary border-border/80 mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-4 font-sans text-sm leading-[1.6]"
					>
						<div class="flex items-center gap-2">
							<Calendar class="text-primary h-4 w-4" />
							<span class="text-foreground">Published: {data.blog.published_label}</span>
						</div>
						<div class="flex items-center gap-2">
							<Clock class="text-primary h-4 w-4" />
							<span class="text-foreground">{data.blog.read_time}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="bg-primary h-2 w-2 animate-pulse rounded-full"></span>
							<span class="text-foreground">By: Rover Engineering</span>
						</div>
					</div>
				</header>

				<!-- Article Body -->
				<article class="prose-rover">
					{@html data.blog.html}
				</article>

				<!-- Post Navigation Footer -->
				<footer class="border-border mt-16 border-t pt-8">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#if data.prevBlog}
							<a
								href="/blogs/{data.prevBlog.slug}/"
								class="group border-border bg-card hover:border-primary/50 hover:bg-hover flex flex-col gap-1.5 rounded-xl border p-5 transition-all"
							>
								<span
									class="text-text-muted group-hover:text-primary flex items-center gap-1.5 font-sans text-sm"
								>
									<ArrowLeft class="h-3.5 w-3.5" /> Previous Article
								</span>
								<span
									class="font-heading text-foreground group-hover:text-primary line-clamp-2 text-base leading-[1.3] font-semibold"
								>
									{data.prevBlog.card_title}
								</span>
							</a>
						{:else}
							<div></div>
						{/if}

						{#if data.nextBlog}
							<a
								href="/blogs/{data.nextBlog.slug}/"
								class="group border-border bg-card hover:border-primary/50 hover:bg-hover flex flex-col gap-1.5 rounded-xl border p-5 text-right transition-all"
							>
								<span
									class="text-text-muted group-hover:text-primary flex items-center justify-end gap-1.5 font-sans text-sm"
								>
									Next Article <ArrowRight class="h-3.5 w-3.5" />
								</span>
								<span
									class="font-heading text-foreground group-hover:text-primary line-clamp-2 text-base leading-[1.3] font-semibold"
								>
									{data.nextBlog.card_title}
								</span>
							</a>
						{/if}
					</div>

					<div class="mt-10 text-center">
						<a
							href="/blogs/"
							class="border-border bg-card text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground inline-flex min-h-11 items-center gap-2 rounded-full border px-6 py-2.5 font-sans text-sm font-semibold transition-all"
						>
							← Back to All Blogs
						</a>
					</div>
				</footer>
			</main>
		</div>
	</div>
</div>

<style>
	/* Match the homepage body copy and supporting heading scale. */
	:global(.prose-rover) {
		color: var(--text-primary, #f7f8f4);
		font-family: var(--font-sans, 'Inter Variable', sans-serif);
		font-size: 1rem;
		line-height: 1.72;
		letter-spacing: -0.005em;
	}

	:global(.prose-rover h1) {
		display: none; /* Rendered in header */
	}

	:global(.prose-rover h2) {
		font-family: var(--font-heading, 'Instrument Sans Variable', sans-serif);
		color: var(--text-primary, #f7f8f4);
		font-size: 1.5rem;
		line-height: 1.22;
		font-weight: 700;
		margin-top: 2.5rem;
		margin-bottom: 1.25rem;
		letter-spacing: -0.02em;
	}

	:global(.prose-rover h3) {
		font-family: var(--font-heading, 'Instrument Sans Variable', sans-serif);
		color: var(--text-primary, #f7f8f4);
		font-size: 1.25rem;
		line-height: 1.3;
		font-weight: 700;
		letter-spacing: -0.015em;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	:global(.prose-rover p) {
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
		color: var(--text-primary, #f7f8f4);
	}

	:global(.prose-rover > :first-child) {
		margin-top: 0;
	}

	:global(.prose-rover > :last-child) {
		margin-bottom: 0;
	}

	:global(.prose-rover strong) {
		color: var(--text-primary, #f7f8f4);
		font-weight: 700;
	}

	:global(.prose-rover a) {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 0.15s ease;
	}

	:global(.prose-rover a:hover) {
		color: var(--primary-hover);
	}

	:global(.prose-rover hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 2.5rem 0;
		opacity: 0.8;
	}

	:global(.prose-rover ul) {
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
		padding-left: 1.5rem;
		list-style-type: disc;
	}

	:global(.prose-rover ol) {
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
		padding-left: 1.5rem;
		list-style-type: decimal;
	}

	:global(.prose-rover li) {
		margin-top: 0.6rem;
		margin-bottom: 0.6rem;
		color: var(--text-primary, #f7f8f4);
	}

	:global(.prose-rover li strong) {
		color: var(--primary, #c8f135);
		font-weight: 700;
	}

	:global(.prose-rover img),
	:global(.prose-rover img.article-hero-image) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-xl, 0.75rem);
		margin-top: 2rem;
		margin-bottom: 2rem;
		border: 1px solid var(--border);
		box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.7);
	}

	:global(.prose-rover figure) {
		margin: 2rem 0;
	}

	:global(.prose-rover figure img) {
		display: block;
		margin: 0 auto;
	}

	:global(.prose-rover figcaption) {
		margin-top: 0.75rem;
		color: var(--text-secondary);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* Shadcn Quote & Callout Blocks */
	:global(.prose-rover blockquote),
	:global(.prose-rover .quote-block) {
		background-color: var(--background-surface, #222222);
		border: 1px solid var(--border);
		border-left: 4px solid var(--primary, #c8f135);
		padding: 1.25rem 1.5rem;
		border-radius: var(--radius-md, 0.5rem);
		margin-top: 1.75rem;
		margin-bottom: 1.75rem;
		font-style: italic;
		color: var(--text-primary, #f7f8f4);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	/* Shadcn Grid & Cards in Articles */
	:global(.prose-rover .grid-callout) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
		gap: 1.25rem;
		margin: 2rem 0;
	}

	:global(.prose-rover .card) {
		background-color: var(--card, #222222);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl, 0.75rem);
		padding: 1.5rem;
		color: var(--card-foreground);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	:global(.prose-rover .card-title) {
		font-family: var(--font-heading, 'Instrument Sans Variable', sans-serif);
		font-weight: 700;
		font-size: 1.25rem;
		line-height: 1.3;
		letter-spacing: -0.015em;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Shadcn Scenario Box */
	:global(.prose-rover .scenario-box) {
		background-color: var(--primary-subtle);
		border: 1px solid var(--primary-border);
		border-radius: var(--radius-xl, 0.75rem);
		padding: 1.25rem 1.5rem;
		margin: 1.5rem 0;
	}

	:global(.prose-rover .scenario-title) {
		font-family: var(--font-sans, 'Inter Variable', sans-serif);
		color: var(--primary);
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.8rem;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	/* Shadcn Banner / CTA Box */
	:global(.prose-rover .case-study-box) {
		background-color: var(--primary-subtle);
		border: 1px solid var(--primary-border);
		border-radius: var(--radius-2xl, 1rem);
		padding: 2rem;
		margin-top: 3rem;
		margin-bottom: 2rem;
		color: var(--foreground);
	}

	:global(.prose-rover .case-study-box h3) {
		color: var(--primary);
		margin-top: 0;
		font-size: 1.5rem;
	}

	:global(.prose-rover code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.9em;
		background-color: var(--background-elevated, #2a2a2a);
		color: var(--primary, #c8f135);
		padding: 0.2rem 0.45rem;
		border-radius: 0.25rem;
		border: 1px solid var(--border-subtle, #262626);
	}

	:global(.prose-rover pre) {
		background-color: var(--background-surface, #222222);
		padding: 1.25rem;
		border-radius: var(--radius-lg, 0.5rem);
		overflow-x: auto;
		border: 1px solid var(--border);
		margin-top: 1.75rem;
		margin-bottom: 1.75rem;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	@media (max-width: 640px) {
		:global(.prose-rover blockquote),
		:global(.prose-rover .quote-block),
		:global(.prose-rover .scenario-box),
		:global(.prose-rover .case-study-box) {
			padding: 1rem;
		}

		:global(.prose-rover pre) {
			max-width: 100%;
			padding: 1rem;
			overflow-x: visible;
			white-space: pre-wrap;
			overflow-wrap: anywhere;
			font-size: 0.78rem;
			line-height: 1.55;
		}
	}

	:global(.prose-rover pre code) {
		background-color: transparent;
		padding: 0;
		border: none;
		color: var(--text-primary, #f7f8f4);
	}

	:global(.prose-rover .eyebrow),
	:global(.prose-rover .meta) {
		display: none;
	}
</style>
