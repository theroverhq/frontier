<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import FinalCta from '$lib/components/FinalCta.svelte';
	import ResourceDownloadForm from '$lib/components/ResourceDownloadForm.svelte';

	const title = 'Rover vs. Splunk Enterprise Security';
	const description =
		'Compare Rover and Splunk Enterprise Security across historical investigations, onboarding, detections, AI workflows, and pricing.';
	const canonical = 'https://roverhq.ai/resources/comparison/splunk/';
	const pageImage = '/assets/comparisons/splunk/rover-vs-splunk-page-dark.png?v=2efbd214';
	const pageImageAlt =
		'Rover and Splunk logos connected by a dotted line on a dark background with a green glow.';
	const ogImage = 'https://roverhq.ai/assets/comparisons/splunk/rover-vs-splunk-og.png';
	const imageAlt =
		'Rover and Splunk logos connected by a dotted line on a green gradient background.';
	const sections = [
		{ id: 'historical-investigations', label: 'Historical investigations' },
		{ id: 'onboarding', label: 'Onboarding & operations' },
		{ id: 'investigation-context', label: 'Investigation context' },
		{ id: 'detection-rules', label: 'Detection rules' },
		{ id: 'pricing', label: 'Pricing' },
		{ id: 'at-a-glance', label: 'At a glance' },
		{ id: 'see-rover', label: 'See Rover with your data' },
		{ id: 'download-comparison', label: 'Download the comparison PDF' }
	];
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
	<meta property="og:image:type" content="image/png" />
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
	})}</script>`}
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
						<span class="text-primary">Rover</span> vs. Splunk Enterprise Security
					</h1>
					<p class="mt-7 max-w-3xl text-xl leading-relaxed sm:text-2xl">
						<strong>Keep security history within reach—not just in storage.</strong>
					</p>
					<p class="comparison-intro mt-4 max-w-3xl text-[17.5px] leading-[1.75]">
						Your SIEM should give your team the evidence it needs when an incident unfolds. For
						CISOs, that means balancing investigation depth, detection reliability, deployment
						effort, and the long-term cost of security visibility.
					</p>
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

				<article
					class="comparison-copy mt-8 min-w-0 sm:mt-10"
					aria-label="Rover and Splunk comparison"
				>
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
					<section id="historical-investigations" aria-labelledby="historical-heading">
						<h2 id="historical-heading">
							Investigate further back—without restoring archived logs.
						</h2>
						<p>
							With Rover, your security data and indexes stay in your own object storage. Search
							retained history without restoring archived logs or maintaining always-on search
							clusters.
						</p>
						<p>
							Splunk Enterprise Security also supports historical investigations. Splunk's Federated
							Search can query external data lakes without ingesting that data into Splunk, with
							charges based on the volume scanned. The difference lies in how historical access is
							delivered and priced.
						</p>
						<p class="takeaway">
							<strong>
								Make accessible evidence—not storage duration alone—the measure of your retention
								strategy.
							</strong>
						</p>
					</section>

					<section id="onboarding" aria-labelledby="onboarding-heading">
						<h2 id="onboarding-heading">Get started in hours. Simplify ongoing operations.</h2>
						<p>
							Connect Rover through HTTP ingestion or data already in your object storage. Get
							started in hours, with schema-on-read to reduce upfront data-modeling work and no
							persistent search clusters to provision. Timing depends on data readiness, access
							approvals, and integration scope. Initial setup does not represent a full enterprise
							migration.
						</p>
						<p>
							Splunk ES requires deployment planning, configuration, and experienced administration.
							Splunk Cloud provides a managed platform, while self-managed deployments add
							infrastructure responsibilities. Implementation scope depends on your existing
							environment and deployment model.
						</p>
						<p>
							Evaluate onboarding by the time it takes to establish usable security coverage—not
							simply ingest the first log.
						</p>
					</section>

					<section id="investigation-context" aria-labelledby="investigation-heading">
						<h2 id="investigation-heading">Give every investigation more context.</h2>
						<p>
							Rover connects historical search, entity relationships, and AI-led investigation to
							build evidence-backed cases. Help your team trace related activity, reconstruct attack
							timelines, and understand what happened before an alert.
						</p>
						<p>
							Splunk ES combines risk-based alerting with investigation workflows and AI assistance.
							Its Premier edition adds response automation, user and entity behavior analytics, and
							automated threat analysis. Capabilities vary by edition and availability.
						</p>
						<p>
							Compare investigation quality, analyst effort, and the response workflows your SOC
							needs—not simply the presence of AI.
						</p>
					</section>

					<section id="detection-rules" aria-labelledby="detection-heading">
						<h2 id="detection-heading">Detection rules: focus on coverage, not just rule count.</h2>
						<p>
							Your detection strategy should be driven by risk. The question is not simply how many
							rules you can enable, but how reliably they run as coverage grows.
						</p>
						<p>
							Our <strong>Signal Mesh</strong> engine continuously updates detection state as telemetry
							arrives. A separate, on-demand query engine handles historical investigations, giving continuous
							detection and investigative search distinct execution paths.
						</p>
						<p>
							In Splunk ES, scheduled correlation searches operate within configured
							search-concurrency limits. When demand exceeds available capacity, executions can be
							delayed or skipped, depending on scheduling configuration. Maintaining timely
							detection requires attention to query efficiency, scheduling, and infrastructure
							capacity.
						</p>
						<p class="takeaway">
							<strong
								>Evaluate detection reliability under load—not just the number of enabled rules.</strong
							>
						</p>
					</section>

					<section id="pricing" aria-labelledby="pricing-heading">
						<h2 id="pricing-heading">Understand the annual cost of visibility.</h2>
						<p>
							Our pricing is based on daily ingestion volume, includes multi-year retention, and
							adds
							<strong>$0.01 per query</strong>.
						</p>
						<p>
							Splunk ES pricing is quote-based, with ingest, workload, and activity-based options
							depending on the offering and deployment.
						</p>
						<p>
							For a <strong>1 TB/day deployment</strong>, compare annual costs using the same
							retention period and investigation workload. Include applicable storage,
							implementation, support, and administration costs—not just the subscription.
						</p>
					</section>

					<section id="at-a-glance" aria-labelledby="comparison-table-heading">
						<h2 id="comparison-table-heading">Rover vs. Splunk Enterprise Security: at a glance</h2>
						<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to focus the table region to scroll its columns.) -->
						<div
							class="comparison-table-region border-border mt-6 overflow-x-auto rounded-xl border"
							role="region"
							aria-labelledby="comparison-table-heading"
							tabindex="0"
						>
							<table class="w-full min-w-[42rem] border-collapse text-left text-sm leading-[1.65]">
								<caption class="sr-only">Rover vs. Splunk Enterprise Security: at a glance</caption>
								<thead>
									<tr>
										<th scope="col" class="w-[24%]">Evaluation area</th>
										<th scope="col" class="rover-column w-[38%]">Rover</th>
										<th scope="col" class="w-[38%]">Splunk Enterprise Security</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<th scope="row">Data architecture</th>
										<td class="rover-column"
											>Data and indexes in your object storage, with serverless queries.</td
										>
										<td
											>Built on the Splunk platform, with managed cloud and self-managed deployment
											options.</td
										>
									</tr>
									<tr>
										<th scope="row">Historical investigations</th>
										<td class="rover-column"
											>Search retained history without archive restoration.</td
										>
										<td
											>Historical search, plus federated access to external data lakes priced by
											data scanned.</td
										>
									</tr>
									<tr>
										<th scope="row">Onboarding time</th>
										<td class="rover-column"
											>Initial setup in hours, depending on onboarding scope.</td
										>
										<td
											>Deployment-specific; requires planning, configuration, and experienced
											administration.</td
										>
									</tr>
									<tr>
										<th scope="row">Operational complexity</th>
										<td class="rover-column"
											>No persistent search clusters; reduced upfront schema work.</td
										>
										<td
											>Managed cloud or self-managed infrastructure; administration responsibilities
											vary by deployment.</td
										>
									</tr>
									<tr>
										<th scope="row">Investigation approach</th>
										<td class="rover-column"
											>Historical evidence, entity context, and AI-led investigations.</td
										>
										<td
											>Risk-based alerting and AI-assisted investigations; Premier adds response
											automation and behavioral analytics.</td
										>
									</tr>
									<tr>
										<th scope="row">Detection-rule execution</th>
										<td class="rover-column"
											>Continuous, stateful evaluation through Signal Mesh; a separate engine
											handles investigative queries.</td
										>
										<td
											>Scheduled correlation searches depend on concurrency limits, scheduling
											configuration, and available resources.</td
										>
									</tr>
									<tr>
										<th scope="row">Pricing model</th>
										<td class="rover-column"
											>Daily-ingestion pricing plus <strong>$0.01 per query</strong>, with
											multi-year retention included.</td
										>
										<td>Quote-based, with pricing options that vary by offering and deployment.</td>
									</tr>
									<tr>
										<th scope="row">Annual pricing at 1 TB/day ingestion</th>
										<td class="rover-column"
											><strong>Stays flat at <span class="text-primary">$16,667/mo</span></strong
											></td
										>
										<td><strong>$130,000/mo</strong></td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>

					<section id="see-rover" aria-labelledby="demo-heading">
						<h2 id="demo-heading">See Rover with your own security data.</h2>
						<p>
							Bring a high-volume data source and a historical investigation. Explore onboarding,
							detection workflows, evidence access, and annual pricing with our team.
						</p>
					</section>
				</article>

				<section
					id="download-comparison"
					class="border-border mt-12 scroll-mt-4 border-t pt-12"
					aria-label="Download the detailed comparison"
				>
					<ResourceDownloadForm resourceId="rover-vs-splunk" />
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

	.comparison-copy section {
		scroll-margin-top: 1rem;
	}

	.comparison-copy section + section {
		margin-top: 3rem;
		padding-top: 3rem;
		border-top: 1px solid var(--border);
	}

	.comparison-copy h2 {
		color: var(--foreground);
		font-size: clamp(1.5rem, 2.5vw, 1.875rem);
		line-height: 1.3;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.comparison-copy p {
		margin-top: 1.25rem;
	}

	strong {
		color: var(--foreground);
		font-weight: 600;
	}

	.takeaway {
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
	.comparison-table-region:focus-visible {
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

	th,
	td {
		padding: 1.125rem;
		vertical-align: top;
		border-bottom: 1px solid var(--border);
	}

	thead {
		background: var(--card);
		color: var(--foreground);
	}

	th {
		color: var(--foreground);
		font-weight: 600;
	}

	.rover-column {
		background: color-mix(in oklab, var(--primary) 4%, transparent);
	}

	thead .rover-column {
		color: var(--primary);
	}

	tbody tr:last-child th,
	tbody tr:last-child td {
		border-bottom: none;
	}

	@media (min-width: 1280px) {
		.comparison-layout {
			grid-template-columns: minmax(0, 44rem) 14rem;
		}
	}
</style>
