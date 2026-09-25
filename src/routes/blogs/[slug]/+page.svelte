<script lang="ts">
	import type { PageData } from './$types';
	import { ArrowLeft, ArrowRight, ChevronDown } from '@lucide/svelte';

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

<div class="blog-article dark bg-background text-foreground min-h-screen">
	<div class="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
		<div class="article-layout">
			<div class="article-column min-w-0">
				<a href="/blogs/" class="article-back inline-flex min-h-11 items-center gap-2 text-sm">
					<ArrowLeft class="h-4 w-4" /> All articles
				</a>

				<header class="border-border mt-6 border-b pb-8 sm:mt-8">
					<p class="text-primary text-xs font-semibold tracking-[0.08em] uppercase">
						{data.blog.blog_counter} <span class="mx-2" aria-hidden="true">·</span>
						{data.blog.category}
					</p>
					<h1
						class="font-heading mt-4 text-[clamp(2.125rem,4vw,3.125rem)] leading-[1.12] font-bold tracking-[-0.028em]"
					>
						{data.blog.card_title}
					</h1>
					<div
						class="article-meta mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-relaxed"
					>
						<span>Rover Engineering</span>
						<span>{data.blog.published_label}</span>
						<span>{data.blog.read_time}</span>
					</div>
				</header>

				{#if data.tableOfContents.length > 0}
					<details class="article-mobile-contents border-border mt-6 rounded-lg border xl:hidden">
						<summary
							class="flex min-h-12 cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-semibold"
						>
							On this page <ChevronDown class="h-4 w-4 shrink-0" />
						</summary>
						<nav aria-label="Article contents" class="flex flex-col gap-1 px-4 pb-4">
							{#each data.tableOfContents as heading (heading.id)}
								<a
									class="article-contents-link rounded py-2 text-sm leading-relaxed"
									href="#{heading.id}"
								>
									{@html heading.html}
								</a>
							{/each}
						</nav>
					</details>
				{/if}

				<article class="prose-rover mt-8 sm:mt-10">
					{@html data.blog.html}
				</article>

				<footer class="border-border mt-14 border-t pt-8">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#if data.prevBlog}
							<a
								href="/blogs/{data.prevBlog.slug}/"
								class="article-adjacent border-border bg-card hover:border-primary/50 rounded-xl border p-5 transition-colors"
							>
								<span class="article-meta flex items-center gap-2 text-sm"
									><ArrowLeft class="h-4 w-4" /> Previous article</span
								>
								<span class="font-heading mt-3 block text-lg leading-snug font-semibold"
									>{data.prevBlog.card_title}</span
								>
							</a>
						{/if}
						{#if data.nextBlog}
							<a
								href="/blogs/{data.nextBlog.slug}/"
								class="article-adjacent border-border bg-card hover:border-primary/50 rounded-xl border p-5 transition-colors sm:col-start-2"
							>
								<span class="article-meta flex items-center gap-2 text-sm"
									>Next article <ArrowRight class="h-4 w-4" /></span
								>
								<span class="font-heading mt-3 block text-lg leading-snug font-semibold"
									>{data.nextBlog.card_title}</span
								>
							</a>
						{/if}
					</div>
					<a
						href="/blogs/"
						class="article-back mt-6 inline-flex min-h-11 items-center gap-2 text-sm"
					>
						<ArrowLeft class="h-4 w-4" /> All articles
					</a>
				</footer>
			</div>

			{#if data.tableOfContents.length > 0}
				<aside class="article-contents sticky top-24 hidden min-w-0 self-start xl:block">
					<h2 class="font-sans text-sm font-semibold tracking-normal">On this page</h2>
					<nav
						aria-label="Article contents"
						class="border-border mt-4 flex max-h-[calc(100vh-11rem)] flex-col overflow-y-auto border-l pr-2"
					>
						{#each data.tableOfContents as heading (heading.id)}
							<a
								href="#{heading.id}"
								class="article-contents-link -ml-px border-l-2 border-transparent py-2 pl-4 text-sm leading-[1.55]"
							>
								{@html heading.html}
							</a>
						{/each}
					</nav>
				</aside>
			{/if}
		</div>
	</div>
</div>

<style>
	.blog-article {
		--article-text: #dde1d9;
		--article-muted: #b4baaf;
	}

	.article-layout {
		display: grid;
		grid-template-columns: minmax(0, 44rem);
		justify-content: center;
		gap: 4rem;
		align-items: start;
	}

	.article-back,
	.article-meta,
	.article-contents-link {
		color: var(--article-muted);
	}

	.article-back:hover,
	.article-contents-link:hover {
		color: var(--primary);
	}

	.article-contents-link:hover {
		border-color: var(--primary);
	}

	.article-back:focus-visible,
	.article-contents-link:focus-visible,
	.article-adjacent:focus-visible,
	.article-mobile-contents summary:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 4px;
	}

	.article-mobile-contents summary {
		list-style: none;
	}

	.article-mobile-contents summary::-webkit-details-marker {
		display: none;
	}

	.article-mobile-contents[open] summary :global(svg) {
		transform: rotate(180deg);
	}

	@media (min-width: 1280px) {
		.article-layout {
			grid-template-columns: minmax(0, 44rem) 14rem;
		}
	}

	/* Long-form reading uses the same fonts with a more generous text scale. */
	:global(.prose-rover) {
		color: var(--article-text);
		font-family: var(--font-sans, 'Inter Variable', sans-serif);
		font-size: 1.125rem;
		line-height: 1.8;
		letter-spacing: normal;
		overflow-wrap: break-word;
	}

	:global(.prose-rover h1) {
		display: none; /* Rendered in header */
	}

	:global(.prose-rover h2) {
		font-family: var(--font-heading, 'Instrument Sans Variable', sans-serif);
		color: var(--text-primary, #f7f8f4);
		font-size: 1.75rem;
		line-height: 1.35;
		font-weight: 700;
		margin-top: 3.5rem;
		margin-bottom: 1.25rem;
		scroll-margin-top: 2rem;
		letter-spacing: -0.02em;
	}

	:global(.prose-rover h3) {
		font-family: var(--font-heading, 'Instrument Sans Variable', sans-serif);
		color: var(--text-primary, #f7f8f4);
		font-size: 1.375rem;
		line-height: 1.4;
		font-weight: 600;
		letter-spacing: -0.015em;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
	}

	:global(.prose-rover p) {
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
		color: var(--article-text);
	}

	:global(.prose-rover > :first-child) {
		margin-top: 0;
	}

	:global(.prose-rover > :last-child) {
		margin-bottom: 0;
	}

	:global(.prose-rover strong) {
		color: var(--foreground);
		font-weight: 600;
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
		color: var(--article-text);
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
		box-shadow: none;
	}

	:global(.prose-rover figure) {
		margin: 2.25rem 0 2.75rem;
	}

	:global(.prose-rover figure img) {
		display: block;
		margin: 0 auto;
	}

	:global(.prose-rover figcaption) {
		margin-top: 0.75rem;
		color: var(--article-muted);
		font-size: 0.875rem;
		line-height: 1.65;
	}

	:global(.prose-rover .article-lead) {
		font-size: 1.25rem;
		line-height: 1.65;
		margin-bottom: 2rem;
	}

	:global(.prose-rover .article-takeaway) {
		border-left: 3px solid var(--primary);
		padding-left: 1.25rem;
		margin: 2rem 0;
		font-weight: 500;
		color: var(--foreground);
	}

	:global(.prose-rover .article-formula) {
		margin: 1.5rem 0;
		padding: 1.25rem 1.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		background: var(--card);
		font-weight: 600;
		line-height: 1.65;
	}

	:global(.prose-rover .figure-note) {
		display: block;
	}

	:global(.prose-rover .figure-expand) {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		margin-top: 0.25rem;
		font-weight: 500;
	}

	:global(.prose-rover a:focus-visible) {
		outline: 2px solid var(--primary);
		outline-offset: 4px;
	}

	/* Quote & Callout Blocks */
	:global(.prose-rover blockquote),
	:global(.prose-rover .quote-block) {
		background-color: var(--background-surface, #222222);
		border: 1px solid var(--border);
		border-left: 4px solid var(--primary, #c8f135);
		padding: 1.25rem 1.5rem;
		border-radius: var(--radius-md, 0.5rem);
		margin-top: 1.75rem;
		margin-bottom: 1.75rem;
		font-style: normal;
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
		max-width: 100%;
		font-size: 0.875rem;
		line-height: 1.65;
		white-space: pre;
		overflow-wrap: normal;
		overflow-x: auto;
		border: 1px solid var(--border);
		margin-top: 1.75rem;
		margin-bottom: 1.75rem;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	@media (max-width: 640px) {
		:global(.prose-rover) {
			font-size: 1.0625rem;
			line-height: 1.75;
		}

		:global(.prose-rover .article-lead) {
			font-size: 1.125rem;
		}

		:global(.prose-rover h2) {
			font-size: 1.5rem;
			margin-top: 2.75rem;
		}

		:global(.prose-rover blockquote),
		:global(.prose-rover .quote-block),
		:global(.prose-rover .scenario-box),
		:global(.prose-rover .case-study-box) {
			padding: 1rem;
		}

		:global(.prose-rover pre) {
			max-width: 100%;
			padding: 1rem;
			overflow-x: auto;
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
