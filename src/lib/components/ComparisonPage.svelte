<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import FinalCta from '$lib/components/FinalCta.svelte';
	import ResourceDownloadForm from '$lib/components/ResourceDownloadForm.svelte';

	import type { ComparisonPageData } from '$lib/comparisons';
	let { comparison }: { comparison: ComparisonPageData } = $props();
	const title = $derived(comparison.title);
	const description = $derived(comparison.description);
	const canonical = $derived(comparison.canonical);
	const pageImage = $derived(comparison.images.dark);
	const pageImageAlt = $derived(comparison.imageAlt);
	const ogImage = $derived(`https://roverhq.ai${comparison.images.og}`);
	const imageAlt = $derived(comparison.imageAlt);
	const ogType = $derived(
		comparison.images.og.split('?')[0].endsWith('.png')
			? 'image/png'
			: comparison.images.og.split('?')[0].endsWith('.webp')
				? 'image/webp'
				: 'image/jpeg'
	);
	const sections = $derived([
		...comparison.toc,
		{ id: 'download-comparison', label: 'Download the comparison PDF' }
	]);
</script>

<svelte:head>
	<title>{title} | Rover</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:type" content={ogType} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={imageAlt} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={imageAlt} />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: title,
		description,
		url: canonical,
		image: ogImage,
		publisher: {
			'@type': 'Organization',
			name: 'Rover',
			url: 'https://roverhq.ai'
		}
	}).replace(/</g, '\\u003c')}</script>`}
</svelte:head>

{#snippet contentsLinks(desktop: boolean)}
	{#each sections as section (section.id)}
		<a
			href="#{section.id}"
			class="contents-link text-sm {desktop
				? '-ml-px border-l-2 border-transparent py-2 pl-4 leading-[1.55]'
				: 'rounded py-2 leading-relaxed'}"
		>
			{section.label}
		</a>
	{/each}
{/snippet}

<div class="comparison-page dark bg-background text-foreground min-h-screen">
	<div class="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
		<div class="comparison-layout">
			<div class="comparison-column min-w-0">
				<header class="border-border border-b pb-10 sm:pb-12">
					<p class="text-xs font-semibold tracking-[0.1em] text-zinc-300 uppercase">
						Resources <span class="mx-2 text-zinc-500" aria-hidden="true">/</span>
						<span class="text-primary">Comparison</span>
					</p>
					<h1
						class="font-heading mt-5 max-w-4xl text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1] font-bold tracking-[-0.035em]"
					>
						<span class="text-primary">Rover</span> vs. {comparison.competitor}
					</h1>
					<div class="comparison-intro mt-7 max-w-3xl text-[17.5px] leading-[1.75]">
						{@html comparison.introHtml}
					</div>
				</header>

				<details class="mobile-contents border-border mt-6 rounded-lg border xl:hidden">
					<summary
						class="flex min-h-12 cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-semibold"
					>
						On this page <ChevronDown class="h-4 w-4 shrink-0" aria-hidden="true" />
					</summary>
					<nav aria-label="Comparison contents" class="flex flex-col gap-1 px-4 pb-4">
						{@render contentsLinks(false)}
					</nav>
				</details>

				<article class="comparison-copy mt-8 min-w-0 sm:mt-10" aria-label={comparison.title}>
					<img
						src={pageImage}
						alt={pageImageAlt}
						width="1440"
						height="900"
						loading="eager"
						decoding="async"
						fetchpriority="high"
						class="border-border mb-8 h-auto w-full rounded-xl border"
					/>
					{@html comparison.html}
				</article>

				<section
					id="download-comparison"
					class="border-border mt-12 scroll-mt-24 border-t pt-12"
					aria-label="Download the detailed comparison"
				>
					<ResourceDownloadForm resourceId={comparison.resourceId} />
				</section>
			</div>

			<aside class="sticky top-24 hidden min-w-0 self-start xl:block" aria-label="On this page">
				<h2 class="font-sans text-sm font-semibold tracking-normal">On this page</h2>
				<nav
					aria-label="Comparison contents"
					class="border-border mt-4 flex max-h-[calc(100vh-11rem)] flex-col overflow-y-auto border-l pr-2"
				>
					{@render contentsLinks(true)}
				</nav>
			</aside>
		</div>
	</div>
</div>

<FinalCta />

<style>
	.comparison-page {
		--comparison-text: #dde1d9;
		--comparison-muted: #b4baaf;
	}
	.comparison-intro,
	.comparison-copy {
		color: var(--comparison-text);
	}
	.comparison-intro :global(p + p) {
		margin-top: 1rem;
	}
	.comparison-intro :global(p:first-child) {
		color: var(--foreground);
		font-size: 1.5rem;
	}
	.comparison-layout {
		display: grid;
		grid-template-columns: minmax(0, 44rem);
		justify-content: center;
		gap: 4rem;
		align-items: start;
	}
	.comparison-copy {
		font-size: 1.09375rem;
		line-height: 1.8;
		overflow-wrap: break-word;
	}
	.comparison-copy :global(section) {
		scroll-margin-top: 6rem;
	}
	.comparison-copy :global(section + section) {
		margin-top: 3rem;
		padding-top: 3rem;
		border-top: 1px solid var(--border);
	}
	.comparison-copy :global(h2) {
		color: var(--foreground);
		font-size: clamp(1.5rem, 2.5vw, 1.875rem);
		line-height: 1.3;
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	.comparison-copy :global(h3) {
		color: var(--foreground);
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.5rem;
	}
	.comparison-copy :global(p),
	.comparison-copy :global(ul),
	.comparison-copy :global(ol) {
		margin-top: 1.25rem;
	}
	.comparison-copy :global(ul) {
		padding-left: 1.5rem;
		list-style: disc;
	}
	.comparison-copy :global(ol) {
		padding-left: 1.5rem;
		list-style: decimal;
	}
	.comparison-copy :global(strong),
	.comparison-intro :global(strong) {
		color: var(--foreground);
		font-weight: 600;
	}
	.comparison-copy :global(a) {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.comparison-copy :global(.takeaway) {
		border-left: 3px solid var(--primary);
		padding-left: 1.25rem;
	}
	.contents-link {
		color: var(--comparison-muted);
	}
	.contents-link:hover {
		color: var(--primary);
		border-color: var(--primary);
	}
	.contents-link:focus-visible,
	.mobile-contents summary:focus-visible,
	.comparison-copy :global(.comparison-table-region:focus-visible) {
		outline: 2px solid var(--primary);
		outline-offset: 4px;
	}
	.mobile-contents summary {
		list-style: none;
	}
	.mobile-contents summary::-webkit-details-marker {
		display: none;
	}
	.mobile-contents[open] summary :global(svg) {
		transform: rotate(180deg);
	}
	.comparison-copy :global(.comparison-table-region) {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		margin-top: 1.5rem;
	}
	.comparison-copy :global(table) {
		width: 100%;
		min-width: 42rem;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.875rem;
		line-height: 1.65;
	}
	.comparison-copy :global(th),
	.comparison-copy :global(td) {
		padding: 1.125rem;
		vertical-align: top;
		border-bottom: 1px solid var(--border);
	}
	.comparison-copy :global(th) {
		color: var(--foreground);
		font-weight: 600;
	}
	.comparison-copy :global(thead) {
		background: var(--card);
	}
	.comparison-copy :global(th:first-child) {
		width: 24%;
	}
	.comparison-copy :global(td:nth-child(2)),
	.comparison-copy :global(th:nth-child(2)) {
		background: color-mix(in oklab, var(--primary) 4%, transparent);
	}
	.comparison-copy :global(thead th:nth-child(2)) {
		color: var(--primary);
	}
	.comparison-copy :global(tbody tr:last-child th),
	.comparison-copy :global(tbody tr:last-child td) {
		border-bottom: none;
	}
	@media (min-width: 1280px) {
		.comparison-layout {
			grid-template-columns: minmax(0, 44rem) 14rem;
		}
	}
</style>
