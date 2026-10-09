<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import BigIdea from '$lib/components/BigIdea.svelte';
	import Architecture from '$lib/components/Architecture.svelte';
	import Economics from '$lib/components/Economics.svelte';
	import AiSoc from '$lib/components/AiSoc.svelte';
	import Comparisons from '$lib/components/Comparisons.svelte';
	import FinalCta from '$lib/components/FinalCta.svelte';
</script>

<svelte:head>
	<title>Rover | SIEM Built for Infinite Retention & Object Storage Search</title>
	<meta
		name="description"
		content="Cold storage. Hot intelligence. The SIEM & Security Data Lake built for object storage. Search years of data in seconds without search clusters."
	/>
	<meta
		name="keywords"
		content="Security Data Lake, Object Storage SIEM, SIEM cost reduction, object storage search, infinite telemetry retention, object storage security analytics, autonomous SOC triage, detection engineering, threat hunting, OCSF data lake, cloud security telemetry"
	/>

	<link rel="canonical" href="https://roverhq.ai/siem/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://roverhq.ai/siem/" />
	<meta
		property="og:title"
		content="Rover | SIEM Built for Infinite Retention & Object Storage Search"
	/>
	<meta
		property="og:description"
		content="Cold storage. Hot intelligence. The SIEM & Security Data Lake built for object storage. Search years of data in seconds without search clusters."
	/>
	<meta property="og:image" content="https://roverhq.ai/assets/og/siem.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Rover — The SIEM built for infinite retention. Cold Storage. Hot Intelligence."
	/>

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Rover | SIEM Built for Infinite Retention & Object Storage Search"
	/>
	<meta
		name="twitter:description"
		content="Cold storage. Hot intelligence. The SIEM & Security Data Lake built for object storage. Search years of data in seconds without search clusters."
	/>
	<meta name="twitter:image" content="https://roverhq.ai/assets/og/siem.png" />
	<meta
		name="twitter:image:alt"
		content="Rover — The SIEM built for infinite retention. Cold Storage. Hot Intelligence."
	/>

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': 'https://roverhq.ai/siem/#software',
		name: 'Rover SIEM & Security Data Lake',
		url: 'https://roverhq.ai/siem/',
		operatingSystem: 'Cloud Native',
		applicationCategory: 'SecurityApplication',
		description:
			'Keep every security event in object storage. Search and analyze years of data without search clusters.',
		publisher: { '@id': 'https://roverhq.ai/#organization' }
	})}</script>`}
</svelte:head>

<Hero />
<Economics />
<Architecture />
<AiSoc />
<BigIdea />
<Comparisons />
<FinalCta />
