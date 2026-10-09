<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Database from '@lucide/svelte/icons/database';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import History from '@lucide/svelte/icons/rotate-ccw-clock';
	import ServerOff from '@lucide/svelte/icons/server-off';
	import Search from '@lucide/svelte/icons/search';
	import Activity from '@lucide/svelte/icons/activity';
	import Eye from '@lucide/svelte/icons/eye';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';
	import { spotlight, cycleProducts } from '$lib/effects';
	let { data }: { data: PageData } = $props();
	const title = 'Rover | Operational Intelligence for Users and AI Agents';
	const description =
		'Rover brings SIEM, database activity monitoring, and a Security Data Lake to customer-owned object storage.';
	const principles = [
		{
			icon: LockKeyhole,
			title: 'Ownership stays with you.',
			body: 'Your activity records and indexes live in your object storage. Keep control of where your data resides.'
		},
		{
			icon: History,
			title: 'History stays within reach.',
			body: 'Retain events and database activity for as long as you need, with searchable history for your teams.'
		},
		{
			icon: ServerOff,
			title: 'Scale without search clusters.',
			body: 'Separate storage from query compute. Search data where it lives without managing a search cluster.'
		}
	];
	const schema = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': 'https://roverhq.ai/#organization',
				name: 'Rover',
				url: 'https://roverhq.ai/',
				logo: 'https://roverhq.ai/rover-logo.png',
				sameAs: ['https://x.com/roverhq_ai'],
				description
			},
			{
				'@type': 'WebSite',
				'@id': 'https://roverhq.ai/#website',
				name: 'Rover',
				url: 'https://roverhq.ai/',
				description,
				publisher: { '@id': 'https://roverhq.ai/#organization' }
			}
		]
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="https://roverhq.ai/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://roverhq.ai/" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://roverhq.ai/og-image.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://roverhq.ai/og-image.jpg" />
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
<header
	class="home-hero dark relative overflow-hidden bg-background py-20 text-foreground"
	use:spotlight={{ tilt: true }}
>
	<div class="hero-wash" aria-hidden="true"></div>
	<div class="hero-grid" aria-hidden="true"></div>
	<div class="hero-spotlight" aria-hidden="true"></div>
	<div class="relative container mx-auto max-w-screen-2xl px-4 text-center sm:px-6">
		<div
			class="hero-landscape"
			data-effects-loop
			use:cycleProducts
			role="img"
			aria-label="Rover SIEM, Database Activity Monitoring, and Security Data Lake connect to your object storage."
		>
			<svg
				class="landscape-lines landscape-lines-desktop"
				viewBox="0 0 1000 290"
				preserveAspectRatio="none"
				fill="none"
				aria-hidden="true"
				><path id="home-flow-siem" class="flow-line" d="M180 90V140Q180 190 230 190H400" /><path
					id="home-flow-dam"
					class="flow-line"
					d="M820 90V140Q820 190 770 190H600"
				/><path id="home-flow-sdl" class="flow-line" d="M500 90V190" /><path
					d="M0 255Q250 160 500 230T1000 255M0 270Q250 175 500 245T1000 270"
					stroke="var(--primary)"
					stroke-opacity=".09"
				/><path d="M500 190V285" stroke="var(--primary)" stroke-opacity=".3" />
				{#each ['siem', 'sdl', 'dam'] as product, i}
					<circle class="flow-particle" r="3.5" fill="var(--primary)"
						><animateMotion dur="{2.6 + i * 0.4}s" begin="{-i}s" repeatCount="indefinite"
							><mpath href="#home-flow-{product}" /></animateMotion
						></circle
					>
				{/each}</svg
			>
			<svg
				class="landscape-lines landscape-lines-mobile"
				viewBox="0 0 1000 360"
				preserveAspectRatio="none"
				fill="none"
				aria-hidden="true"
			>
				<path id="home-flow-mobile-siem" class="flow-line" d="M180 90H90V220Q90 260 180 260H400" />
				<path id="home-flow-mobile-dam" class="flow-line" d="M820 90H910V220Q910 260 820 260H600" />
				<path id="home-flow-mobile-sdl" class="flow-line" d="M500 180V270" />
				<path d="M500 270V340" stroke="var(--primary)" stroke-opacity=".3" />
				{#each ['siem', 'sdl', 'dam'] as product, i}
					<circle class="flow-particle" r="3.5" fill="var(--primary)"
						><animateMotion dur="{2.6 + i * 0.4}s" begin="{-i}s" repeatCount="indefinite"
							><mpath href="#home-flow-mobile-{product}" /></animateMotion
						></circle
					>
				{/each}
			</svg>
			<div class="landscape-product left">
				<ShieldCheck class="h-6 w-6 text-primary" stroke-width={1.5} />
				<div>
					<span class="text-[15px] font-semibold">Rover SIEM</span><small>Understand threats.</small
					>
				</div>
				<span class="landscape-dot"></span>
			</div>
			<div class="landscape-product middle">
				<CloudUpload class="h-6 w-6 text-primary" stroke-width={1.5} />
				<div>
					<span class="text-[15px] font-semibold">Rover SDL</span><small
						>Search retained history.</small
					>
				</div>
				<span class="landscape-dot"></span>
			</div>
			<div class="landscape-product right">
				<Database class="h-6 w-6 text-primary" stroke-width={1.5} />
				<div>
					<span class="text-[15px] font-semibold">Rover DAM</span><small
						>Control database activity.</small
					>
				</div>
				<span class="landscape-dot"></span>
			</div>
			<div class="landscape-core">
				<img src="/rover-logo-64.png" alt="" width="28" height="28" /><span
					class="text-[13px] font-semibold">Your object storage</span
				><LockKeyhole class="h-4 w-4 text-primary/65" stroke-width={1.5} />
			</div>
		</div>
		<Badge variant="secondary" class="gap-2 px-3 py-1 font-sans"
			><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>Built around your data. Built for
			your control.</Badge
		>
		<h1
			class="mx-auto mt-7 max-w-[900px] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08] font-bold tracking-[-0.035em]"
		>
			Operational intelligence<br /><span class="text-primary">for users and AI agents.</span>
		</h1>
		<p
			data-effects-reveal
			class="mx-auto mt-6 max-w-[660px] text-[17.5px] leading-[1.62] text-foreground/75"
		>
			Connect your data. Understand the patterns. Put intelligence to work.
		</p>
		<div data-effects-reveal class="mt-8 flex flex-wrap justify-center gap-3">
			<Button size="lg" href="#get-demo" class="rounded-full px-10 uppercase">Get Demo</Button
			><Button size="lg" variant="outline" href="#products" class="rounded-full px-8 uppercase"
				>Explore Rover<ArrowRight class="ml-2 h-4 w-4" aria-hidden="true" /></Button
			>
		</div>
	</div>
</header>

<section
	id="perspective"
	class="relative overflow-hidden bg-background pt-24 pb-28 text-foreground"
>
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
				>The Visibility Gap</Badge
			>
			<h2 class="mx-auto mt-6 max-w-[850px] leading-[1.12] font-bold tracking-[-0.025em]">
				Your systems are running.<br />Do you know what's happening?
			</h2>
			<p class="mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				An alert is one view of your environment. A database permission is another. Understanding
				threats and controlling data access each require a closer look.
			</p>
		</div>
		<div class="mt-16 grid gap-6 lg:grid-cols-2">
			<article class="effect-card rounded-2xl border border-border bg-card p-7 sm:p-10">
				<div class="flex items-center gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
					<Search class="h-5 w-5" stroke-width={1.75} />Across your environment
				</div>
				<h3 class="mt-6 text-[26px] leading-[1.2] font-bold tracking-[-0.02em]">
					Which signals matter?
				</h3>
				<p class="mt-4 text-[15.5px] leading-[1.65] text-muted-foreground">
					Cloud, identity, endpoint, and network events tell different parts of the story. Search
					and detection need the context across them—and the history behind them.
				</p>
				<div class="mt-7 flex flex-wrap gap-2 border-t border-border pt-6">
					{#each ['Cloud', 'Identity', 'Endpoint', 'Network'] as source}<span
							class="effect-chip rounded-md bg-muted px-3 py-2 text-[12px] font-medium"
							>{source}</span
						>{/each}
				</div>
			</article>
			<article class="effect-card rounded-2xl border border-border bg-card p-7 sm:p-10">
				<div class="flex items-center gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
					<Eye class="h-5 w-5" stroke-width={1.75} />Inside your databases
				</div>
				<h3 class="mt-6 text-[26px] leading-[1.2] font-bold tracking-[-0.02em]">
					How is your data being used?
				</h3>
				<p class="mt-4 text-[15.5px] leading-[1.65] text-muted-foreground">
					Knowing an account has access leaves questions unanswered. Which queries did it run? What
					sensitive data did it touch? Did the activity follow your policies?
				</p>
				<div class="mt-7 flex flex-wrap gap-2 border-t border-border pt-6">
					{#each ['Users', 'Queries', 'Sensitive data', 'Policies'] as source}<span
							class="effect-chip rounded-md bg-muted px-3 py-2 text-[12px] font-medium"
							>{source}</span
						>{/each}
				</div>
			</article>
		</div>
	</div>
</section>

<section
	id="products"
	class="dark relative overflow-hidden bg-background pt-24 pb-28 text-foreground"
>
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge
				variant="outline"
				class="border-primary/35 bg-primary/5 px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] text-primary uppercase"
				>The Rover Portfolio</Badge
			>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				Different challenges.<br /><span class="text-primary">Purpose-built answers.</span>
			</h2>
			<p class="mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62] text-foreground/70">
				Choose SIEM, Database Activity Monitoring, or Security Data Lake. Each product has a clear
				job. All put your data under your control.
			</p>
		</div>
		<div class="mt-16 grid gap-6 lg:grid-cols-3">
			<article
				id="siem"
				class="portfolio-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
				use:spotlight
			>
				<div class="p-7 sm:p-9 lg:p-6 xl:p-9">
					<div class="flex items-center gap-3">
						<ShieldCheck class="h-6 w-6 text-primary" stroke-width={1.75} />
						<p class="text-[11px] font-bold tracking-[0.12em] uppercase">SIEM</p>
					</div>
					<h3 class="mt-6 text-[28px] leading-[1.2] font-bold tracking-[-0.02em]">
						Turn telemetry into understanding.
					</h3>
					<p class="mt-4 text-[15.5px] leading-[1.65] text-foreground/70">
						Search your full security history, detect threats, and bring context to investigations
						across your environment.
					</p>
				</div>
				<div
					class="product-surface mx-7 rounded-xl border border-border bg-background p-5 sm:mx-9 lg:mx-6 xl:mx-9"
					aria-label="Illustrative SIEM search"
				>
					<div class="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase">
						<span class="flex items-center gap-2"
							><Search class="h-3.5 w-3.5 text-primary" />Security search</span
						><span class="text-foreground/50">Full retained history</span>
					</div>
					<div
						class="mt-4 rounded-lg border border-border bg-card p-3 font-mono text-[11px] leading-relaxed"
					>
						source=identity <span class="text-primary">AND</span> action="login_failed"<br /><span
							class="text-primary">stats</span
						>
						count <span class="text-primary">by</span> src_ip
					</div>
					<div data-effects-loop class="mt-5 flex h-20 items-end gap-1" aria-hidden="true">
						{#each Array.from({ length: 32 }, (_, i) => 12 + ((i * 17 + i * i * 3) % 68)) as height, i}<span
								class="signal-bar flex-1 rounded-t-sm bg-primary/60"
								style="height: {height}%; animation-delay: {i * 35}ms;"
							></span>{/each}
					</div>
					<div
						class="flex justify-between border-t border-border pt-3 text-[10px] text-foreground/50"
					>
						<span>Security telemetry</span><span>Search · Detect · Investigate</span>
					</div>
				</div>
				<div class="mt-auto p-7 sm:p-9 lg:p-6 xl:p-9">
					<a href="/siem/" class="product-link"
						>Explore Rover SIEM<ArrowRight class="h-4 w-4" aria-hidden="true" /></a
					>
				</div>
			</article>
			<article
				id="database-activity-monitoring"
				class="portfolio-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
				use:spotlight
			>
				<div class="p-7 sm:p-9 lg:p-6 xl:p-9">
					<div class="flex items-center gap-3">
						<Database class="h-6 w-6 text-primary" stroke-width={1.75} />
						<p class="text-[11px] font-bold tracking-[0.12em] uppercase">
							Database Activity Monitoring
						</p>
					</div>
					<h3 class="mt-6 text-[28px] leading-[1.2] font-bold tracking-[-0.02em]">
						Put database activity in view.
					</h3>
					<p class="mt-4 text-[15.5px] leading-[1.65] text-foreground/70">
						Monitor queries, oversee privileged access, protect sensitive data, and enforce policy
						across your databases.
					</p>
				</div>
				<div
					class="product-surface mx-7 rounded-xl border border-border bg-background p-5 sm:mx-9 lg:mx-6 xl:mx-9"
					aria-label="Illustrative database monitoring"
				>
					<div class="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase">
						<span class="flex items-center gap-2"
							><Activity class="h-3.5 w-3.5 text-primary" />Database activity</span
						><span class="text-foreground/50">Identity-aware</span>
					</div>
					<div class="mt-4 grid grid-cols-3 gap-2">
						{#each ['Identity', 'Query', 'Policy'] as label}<div
								class="rounded-lg border border-border bg-card px-2 py-3 text-center text-[11px] font-medium"
							>
								{label}
							</div>{/each}
					</div>
					<div class="mt-4 space-y-0 font-mono text-[11px]">
						{#each [{ user: 'app_service', query: 'SELECT', status: 'Monitored' }, { user: 'db_admin', query: 'GRANT', status: 'Review' }, { user: 'reporting', query: 'SELECT', status: 'Monitored' }] as row}<div
								class="grid grid-cols-[1fr_.7fr_.8fr] items-center gap-2 border-b border-border py-3"
							>
								<span class="truncate text-foreground/70">{row.user}</span><span>{row.query}</span
								><span
									class="text-right {row.status === 'Review'
										? 'text-security-critical'
										: 'text-primary/80'}">{row.status}</span
								>
							</div>{/each}
					</div>
					<p class="mt-3 text-[10px] text-foreground/50">Monitor · Control · Comply</p>
				</div>
				<div class="mt-auto p-7 sm:p-9 lg:p-6 xl:p-9">
					<a href="/database-activity-monitoring/" class="product-link"
						>Explore Rover DAM<ArrowRight class="h-4 w-4" aria-hidden="true" /></a
					>
				</div>
			</article>
			<article
				id="security-data-lake"
				class="portfolio-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
				use:spotlight
			>
				<div class="p-7 sm:p-9 lg:p-6 xl:p-9">
					<div class="flex items-center gap-3">
						<CloudUpload class="h-6 w-6 text-primary" stroke-width={1.75} />
						<p class="text-[11px] font-bold tracking-[0.12em] uppercase">Security Data Lake</p>
					</div>
					<h3 class="mt-6 text-[28px] leading-[1.2] font-bold tracking-[-0.02em]">
						Keep every event within reach.
					</h3>
					<p class="mt-4 text-[15.5px] leading-[1.65] text-foreground/70">
						Ingest, retain, and analyze security telemetry in your object storage. Keep years of
						history searchable without restoring archives.
					</p>
				</div>
				<div
					class="product-surface mx-7 rounded-xl border border-border bg-background p-5 sm:mx-9 lg:mx-6 xl:mx-9"
					aria-label="Illustrative Security Data Lake with telemetry and indexes in your object storage"
				>
					<div class="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase">
						<span class="flex items-center gap-2"
							><CloudUpload class="h-3.5 w-3.5 text-primary" />Telemetry lake</span
						><span class="text-foreground/50">Your storage</span>
					</div>
					<div class="mt-4 grid grid-cols-2 gap-2">
						{#each ['Cloud', 'Identity', 'Endpoint', 'Network'] as source}
							<span
								class="rounded-lg border border-border bg-card px-2 py-2 text-center text-[11px] font-medium"
								>{source}</span
							>
						{/each}
					</div>
					<div class="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
						<div class="flex items-center justify-between gap-2">
							<span class="font-mono text-[11px] text-primary">your-bucket/</span>
							<LockKeyhole class="h-3.5 w-3.5 text-primary" />
						</div>
						<div class="mt-2 font-mono text-[11px] leading-[1.8] text-foreground/60">
							<div>├ security-events/</div>
							<div>└ indexes/</div>
						</div>
					</div>
					<p class="mt-3 text-[10px] text-foreground/50">Search · Retain · Analyze</p>
				</div>
				<div class="mt-auto p-7 sm:p-9 lg:p-6 xl:p-9">
					<a href="/security-data-lake/" class="product-link"
						>Explore Security Data Lake<ArrowRight class="h-4 w-4" aria-hidden="true" /></a
					>
				</div>
			</article>
		</div>
	</div>
</section>

<section id="why-rover" class="relative overflow-hidden bg-muted pt-24 pb-28 text-foreground">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
				>Our Approach</Badge
			>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				More capability.<br />Without surrendering control.
			</h2>
			<p class="mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				The architecture behind these products starts with a choice: your data belongs in
				infrastructure you own.
			</p>
		</div>
		<div
			class="dark relative mt-16 overflow-hidden rounded-3xl bg-background text-foreground shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)]"
		>
			<div class="grid items-center gap-8 px-6 py-10 md:px-11 lg:grid-cols-[1fr_1.2fr]">
				<div>
					<p class="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
						Customer-owned object storage
					</p>
					<h3 class="mt-4 text-[28px] leading-[1.2] font-bold tracking-[-0.02em]">
						The foundation is yours.
					</h3>
					<p class="mt-4 max-w-lg text-[15.5px] leading-[1.65] text-foreground/70">
						Security telemetry and database activity stay in your storage. Rover brings search,
						analytics, and monitoring to the data where it lives.
					</p>
				</div>
				<div class="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
					<div class="flex items-center justify-between text-[11px] font-semibold">
						<span>Your object storage</span><LockKeyhole class="h-4 w-4 text-primary" />
					</div>
					<div
						class="mt-5 rounded-xl border border-border bg-card p-5 font-mono text-[12px] leading-[2]"
					>
						<span class="text-primary">your-bucket/</span>
						<div class="pl-4 text-foreground/60">├ security-events/</div>
						<div class="pl-4 text-foreground/60">├ database-activity/</div>
						<div class="pl-4 text-foreground/60">└ indexes/</div>
					</div>
					<p class="mt-4 text-[11px] text-foreground/60">Illustrative storage layout</p>
				</div>
			</div>
			<div class="grid border-t border-border md:grid-cols-3">
				{#each principles as principle, i}<div
						class="effect-tile border-border px-6 py-8 md:px-11 {i > 0
							? 'border-t md:border-t-0 md:border-l'
							: ''}"
					>
						<principle.icon class="h-5 w-5 text-primary" stroke-width={1.75} />
						<h3 class="mt-4 text-[17px] leading-[1.3] font-bold">{principle.title}</h3>
						<p class="mt-2 text-[14px] leading-[1.6] text-foreground/70">{principle.body}</p>
					</div>{/each}
			</div>
		</div>
	</div>
</section>

<section class="bg-background pt-24 pb-28 text-foreground">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<div>
				<p class="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
					Ideas from Rover
				</p>
				<h2 class="mt-4 leading-[1.12] font-bold tracking-[-0.025em]">A closer look.</h2>
			</div>
			<a href="/blogs/" class="inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold"
				>Read our insights<ArrowRight class="h-4 w-4" /></a
			>
		</div>
		<div class="mt-10 grid gap-6 md:grid-cols-2">
			{#each data.blogs as blog}<a
					href="/blogs/{blog.slug}/"
					class="resource-card group flex flex-col rounded-2xl border border-border bg-card p-7 sm:p-9"
					><span class="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
						>{blog.category} · {blog.read_time}</span
					>
					<h3 class="mt-5 text-[24px] leading-[1.25] font-bold tracking-[-0.015em]">
						{blog.card_title}
					</h3>
					<p class="mt-4 text-[15px] leading-[1.65] text-muted-foreground">{blog.description}</p>
					<span
						class="mt-auto flex items-center justify-between pt-8 text-[12px] font-semibold uppercase"
						>Read article<ArrowRight
							class="h-4 w-4 transition-transform group-hover:translate-x-1"
						/></span
					></a
				>{/each}
		</div>
	</div>
</section>

<section
	id="get-demo"
	class="dark relative overflow-hidden bg-background pt-24 pb-28 text-foreground"
>
	<div class="hero-wash" aria-hidden="true"></div>
	<div class="relative container mx-auto max-w-screen-2xl px-4 text-center sm:px-6">
		<Badge
			variant="outline"
			class="border-primary/35 bg-primary/5 px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] text-primary uppercase"
			>Meet Rover</Badge
		>
		<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
			See more. <span class="text-primary">Stay in control.</span>
		</h2>
		<p class="mx-auto mt-5 max-w-[660px] text-[17.5px] leading-[1.62] text-foreground/70">
			Find the right starting point for your team. Explore Rover SIEM, Database Activity Monitoring,
			and Security Data Lake with a personal walkthrough.
		</p>
		<Button size="lg" href="mailto:contactus@roverhq.ai" class="mt-8 rounded-full px-12 uppercase"
			>Get Demo</Button
		>
	</div>
</section>

<style>
	section[id],
	article[id] {
		scroll-margin-top: 6rem;
	}
	.hero-wash {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse at 50% 85%,
			color-mix(in oklab, var(--primary) 8%, transparent),
			transparent 65%
		);
	}
	.hero-grid,
	.hero-spotlight {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.hero-grid {
		background-image:
			linear-gradient(#ffffff08 1px, transparent 1px),
			linear-gradient(90deg, #ffffff08 1px, transparent 1px);
		background-size: 60px 60px;
		mask-image: radial-gradient(55% 55% at 50% 45%, #000, transparent);
	}
	.hero-spotlight {
		background: radial-gradient(
			380px circle at var(--effects-pointer-x, 50%) var(--effects-pointer-y, 40%),
			#c8f13518,
			transparent 60%
		);
	}
	.hero-landscape {
		position: relative;
		height: 260px;
		max-width: 1000px;
		margin: 0 auto 20px;
		transform: perspective(1000px) rotateX(var(--effects-tilt-x, 0deg))
			rotateY(var(--effects-tilt-y, 0deg));
		transition: transform 200ms ease-out;
	}
	.landscape-lines {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.landscape-lines-mobile {
		display: none;
	}
	.flow-line {
		stroke: var(--primary);
		stroke-opacity: 0.4;
		stroke-width: 1.5;
		stroke-dasharray: 6 9;
		animation: flow 1.4s linear infinite;
	}
	.landscape-product {
		position: absolute;
		top: 40px;
		display: flex;
		align-items: center;
		gap: 14px;
		width: 26%;
		padding: 22px;
		text-align: left;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 14px;
		box-shadow: 0 20px 55px #0004;
		transition:
			border-color 300ms,
			box-shadow 300ms,
			translate 300ms,
			scale 300ms;
	}
	.landscape-product.left {
		left: 6%;
		transform: rotate(-3deg);
	}
	.landscape-product.middle {
		left: 50%;
		transform: translateX(-50%);
	}
	.landscape-product.right {
		right: 6%;
		transform: rotate(3deg);
	}
	.landscape-product small {
		display: block;
		margin-top: 5px;
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.landscape-product > div {
		min-width: 0;
	}
	.landscape-dot {
		margin-left: auto;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--primary);
		box-shadow: 0 0 12px var(--primary);
		animation: status-pulse 2s infinite;
	}
	.landscape-core {
		position: absolute;
		top: 167px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 18px 24px;
		white-space: nowrap;
		border: 1px solid color-mix(in oklab, var(--primary) 35%, transparent);
		background: var(--background);
		border-radius: 12px;
		box-shadow: 0 0 55px #c8f1350a;
	}
	.landscape-core::after {
		content: '';
		position: absolute;
		inset: -1px;
		border: 1px solid var(--primary);
		border-radius: inherit;
		pointer-events: none;
		animation: storage-ring 3s infinite;
	}
	.landscape-product:global(.effects-active) {
		border-color: var(--primary);
		box-shadow: 0 0 44px -8px #c8f13570;
	}
	.portfolio-card,
	.resource-card {
		transition:
			border-color 350ms,
			transform 350ms,
			box-shadow 350ms;
	}
	.portfolio-card {
		position: relative;
		isolation: isolate;
	}
	.portfolio-card::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: radial-gradient(
			320px circle at var(--effects-pointer-x, 50%) var(--effects-pointer-y, 0%),
			#c8f13520,
			transparent 60%
		);
		opacity: 0;
		transition: opacity 300ms;
	}
	.portfolio-card:global(.effects-pointer-active)::before {
		opacity: 1;
	}
	.portfolio-card:hover,
	.resource-card:hover {
		border-color: color-mix(in oklab, var(--primary) 45%, var(--border));
	}
	.product-surface {
		min-height: 248px;
	}
	.product-link {
		display: flex;
		min-height: 44px;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		border-top: 1px solid var(--border);
		padding-top: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--primary);
	}
	.product-link:hover {
		text-decoration: underline;
	}
	.product-link :global(svg) {
		transition: transform 300ms;
	}
	.signal-bar {
		animation: signal-wave 2.6s ease-in-out infinite;
		transform-origin: bottom;
		transition: background-color 300ms;
	}
	@keyframes signal-wave {
		50% {
			transform: scaleY(0.7);
		}
	}
	@keyframes status-pulse {
		50% {
			opacity: 0.25;
		}
	}
	@keyframes storage-ring {
		from {
			opacity: 0.8;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(1.28, 1.6);
		}
	}
	@keyframes flow {
		to {
			stroke-dashoffset: -30;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.landscape-product:hover {
			translate: 0 -6px;
			scale: 1.04;
			border-color: var(--primary);
			box-shadow: 0 0 44px -8px #c8f13570;
		}
		.portfolio-card:hover,
		.resource-card:hover {
			transform: translateY(-6px);
			box-shadow: 0 26px 50px -26px #0004;
		}
		.portfolio-card:hover .signal-bar {
			background-color: var(--primary);
		}
		.portfolio-card:hover .product-surface :global(.border-border) {
			border-color: color-mix(in oklab, var(--primary) 40%, var(--border));
		}
		.portfolio-card:hover .product-link :global(svg) {
			transform: translateX(7px);
		}
	}
	@media (max-width: 767px) {
		.hero-landscape {
			height: 360px;
		}
		.landscape-lines-desktop {
			display: none;
		}
		.landscape-lines-mobile {
			display: block;
		}
		.landscape-product {
			top: 35px;
			width: 46%;
			padding: 14px 10px;
			gap: 8px;
		}
		.landscape-product.left {
			left: 1%;
		}
		.landscape-product.right {
			right: 1%;
		}
		.landscape-product.middle {
			top: 135px;
			width: min(68%, 260px);
		}
		.landscape-product small {
			font-size: 9px;
		}
		.landscape-product :global(svg) {
			width: 18px;
			flex-shrink: 0;
		}
		.landscape-product :global(span.text-\[15px\]) {
			font-size: 12px;
		}
		.landscape-dot {
			display: none;
		}
		.landscape-core {
			top: 245px;
			gap: 10px;
			padding: 15px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.flow-line,
		.signal-bar,
		.landscape-dot,
		.landscape-core::after {
			animation: none;
		}
		.flow-particle,
		.landscape-core::after,
		.hero-spotlight,
		.portfolio-card::before {
			display: none;
		}
		.hero-landscape {
			transform: none;
			transition: none;
		}
		.portfolio-card,
		.resource-card,
		.landscape-product {
			transition: none;
		}
		.portfolio-card:hover,
		.resource-card:hover {
			transform: none;
		}
		.landscape-product:hover {
			translate: none;
			scale: none;
		}
		.product-link :global(svg) {
			transition: none;
			transform: none !important;
		}
	}
</style>
