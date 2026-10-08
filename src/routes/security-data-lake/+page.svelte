<script lang="ts">
	import Database from '@lucide/svelte/icons/database';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import Search from '@lucide/svelte/icons/search';
	import History from '@lucide/svelte/icons/rotate-ccw-clock';
	import ServerOff from '@lucide/svelte/icons/server-off';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { Badge } from '$lib/components/ui/badge';
	import Hero from '$lib/components/Hero.svelte';
	import BigIdea from '$lib/components/BigIdea.svelte';
	import FinalCta from '$lib/components/FinalCta.svelte';
	import Economics from '$lib/components/Economics.svelte';
	const title = 'Rover | Security Data Lake in Your Object Storage';
	const description =
		'Retain, search, and analyze security telemetry in customer-owned object storage. Rover Security Data Lake keeps your full history searchable without rehydration or search clusters.';
	const ingestion = [
		{
			icon: CloudUpload,
			title: 'Bring your telemetry.',
			body: 'Receive events through HTTP push and pull, or bring data directly through an object-storage drop.'
		},
		{
			icon: Database,
			title: 'Build the searchable foundation.',
			body: 'Rover builds its index in your object storage. Schema-on-read lets you work with the data you retain.'
		},
		{
			icon: Search,
			title: 'Ask questions across your history.',
			body: 'Run full-text search, field filters, and aggregations across retained security data without restoring archives.'
		}
	];
	const benefits = [
		{
			icon: History,
			title: 'Keep the history you need.',
			body: 'Retain high-volume telemetry for as long as your investigations and audit requirements call for.'
		},
		{
			icon: ServerOff,
			title: 'Separate storage and compute.',
			body: 'Store data in object storage and use serverless query compute, without sizing or maintaining search clusters.'
		},
		{
			icon: LockKeyhole,
			title: 'Keep ownership of your data.',
			body: 'Activity records and indexes stay in your object storage, under your control.'
		}
	];
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': 'https://roverhq.ai/security-data-lake/#software',
		name: 'Rover Security Data Lake',
		url: 'https://roverhq.ai/security-data-lake/',
		applicationCategory: 'SecurityApplication',
		operatingSystem: 'Cloud Native',
		description,
		publisher: { '@id': 'https://roverhq.ai/#organization' }
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="https://roverhq.ai/security-data-lake/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://roverhq.ai/security-data-lake/" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://roverhq.ai/og-image.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://roverhq.ai/og-image.jpg" />
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

<Hero product="security-data-lake" />

<section id="ingestion" class="relative overflow-hidden bg-muted pt-24 pb-28 text-foreground">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
				>From telemetry to intelligence</Badge
			>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				One searchable foundation.<br />All the history you choose to keep.
			</h2>
			<p class="mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Bring high-volume security data into a lake that stays useful—from the first event to years
				of retained activity.
			</p>
		</div>
		<div
			class="dark mt-16 grid overflow-hidden rounded-3xl bg-background text-foreground shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)] md:grid-cols-3"
		>
			{#each ingestion as step, i}<div
					class="border-border px-6 py-10 md:px-9 {i > 0
						? 'border-t md:border-t-0 md:border-l'
						: ''}"
				>
					<div class="flex items-center justify-between">
						<step.icon class="h-6 w-6 text-primary" stroke-width={1.75} /><span
							class="font-mono text-[12px] text-foreground/40">0{i + 1}</span
						>
					</div>
					<h3 class="mt-6 text-[22px] leading-[1.25] font-bold tracking-[-0.015em]">
						{step.title}
					</h3>
					<p class="mt-4 text-[15px] leading-[1.65] text-foreground/70">{step.body}</p>
				</div>{/each}
		</div>
	</div>
</section>

<BigIdea />

<section id="retention" class="relative overflow-hidden bg-background pt-24 pb-28 text-foreground">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
				>Retention & Ownership</Badge
			>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				More history.<br />A foundation you control.
			</h2>
			<p class="mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Keep the telemetry you would otherwise archive or discard. Storage and query compute scale
				independently.
			</p>
		</div>
		<div class="mt-14 grid gap-6 md:grid-cols-3">
			{#each benefits as benefit}<article class="rounded-2xl border border-border bg-card p-7">
					<benefit.icon class="h-6 w-6" stroke-width={1.75} />
					<h3 class="mt-5 text-[20px] leading-[1.25] font-bold">{benefit.title}</h3>
					<p class="mt-4 text-[15px] leading-[1.65] text-muted-foreground">{benefit.body}</p>
				</article>{/each}
		</div>
	</div>
</section>

<section id="use-cases" class="relative overflow-hidden bg-muted pt-24 pb-28 text-foreground">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
				>Put the lake to work</Badge
			>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				A data foundation.<br />More than one way to use it.
			</h2>
			<p class="mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Start with the telemetry you need to keep. Use the same retained history for search,
				analytics, and longer-term context.
			</p>
		</div>
		<div
			class="dark mt-16 overflow-hidden rounded-3xl bg-background text-foreground shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)]"
		>
			<div class="grid md:grid-cols-3">
				<article class="border-border px-6 py-10 md:px-9">
					<p class="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
						High-volume telemetry
					</p>
					<h3 class="mt-4 text-[22px] leading-[1.25] font-bold">Keep what you used to drop.</h3>
					<p class="mt-4 text-[15px] leading-[1.65] text-foreground/70">
						Retain DNS, network flows, cloud audit, and raw endpoint events that are too costly to
						keep in traditional indexed systems.
					</p>
				</article>
				<article class="border-t border-border px-6 py-10 md:border-t-0 md:border-l md:px-9">
					<p class="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
						Historical analysis
					</p>
					<h3 class="mt-4 text-[22px] leading-[1.25] font-bold">Ask questions beyond today.</h3>
					<p class="mt-4 text-[15px] leading-[1.65] text-foreground/70">
						Compare activity over time, investigate older events, and search retained records for
						audits without a separate restore workflow.
					</p>
				</article>
				<article class="border-t border-border px-6 py-10 md:border-t-0 md:border-l md:px-9">
					<p class="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
						Analysts & AI agents
					</p>
					<h3 class="mt-4 text-[22px] leading-[1.25] font-bold">Give questions more context.</h3>
					<p class="mt-4 text-[15px] leading-[1.65] text-foreground/70">
						Make a longer security history available for the queries and analysis that support
						people and AI-driven investigations.
					</p>
				</article>
			</div>
			<div class="grid gap-6 border-t border-border px-6 py-10 md:px-9 lg:grid-cols-2">
				<div>
					<p class="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
						Security Data Lake
					</p>
					<h3 class="mt-3 text-[22px] font-bold">The searchable data foundation.</h3>
					<p class="mt-3 text-[15px] leading-[1.65] text-foreground/70">
						Ingest, retain, search, and analyze telemetry. Build around the data and retention your
						team needs.
					</p>
				</div>
				<div>
					<p class="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">Rover SIEM</p>
					<h3 class="mt-3 text-[22px] font-bold">Security workflows on that foundation.</h3>
					<p class="mt-3 text-[15px] leading-[1.65] text-foreground/70">
						Add continuous detection, threat hunting, and investigation context. Explore the SIEM
						page for those capabilities.
					</p>
					<a
						href="/siem/"
						class="mt-4 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-primary"
						>Explore Rover SIEM<ArrowRight class="h-4 w-4" /></a
					>
				</div>
			</div>
		</div>
	</div>
</section>

<Economics dataLake />

<FinalCta
	badge="Rover Security Data Lake"
	title="Keep the telemetry you need."
	accent="Make the history useful."
	body="Start with the security data that is too expensive to retain in your existing tools. See how Rover keeps it searchable in your own object storage."
	proof={[
		'Customer-owned object storage',
		'Searchable long-term retention',
		'No rehydration',
		'No search clusters'
	]}
/>
