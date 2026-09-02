<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import BigIdea from '$lib/components/BigIdea.svelte';
	import Capabilities from '$lib/components/Capabilities.svelte';
	import Architecture from '$lib/components/Architecture.svelte';
	import Convergence from '$lib/components/Convergence.svelte';
	import Economics from '$lib/components/Economics.svelte';
	import AiSoc from '$lib/components/AiSoc.svelte';
	import PlatformCeiling from '$lib/components/PlatformCeiling.svelte';
	import EarlyAccess from '$lib/components/EarlyAccess.svelte';
</script>

<svelte:head>
	<title>Rover | SIEM Built for Infinite Retention & Object Storage Search</title>
	<meta
		name="description"
		content="Keep 100% of your security events in object storage and search years of data in seconds. Run detections and AI investigations without search clusters."
	/>
	<meta
		name="keywords"
		content="Security Data Lake, Object Storage SIEM, SIEM cost reduction, object storage search, infinite telemetry retention, object storage security analytics, autonomous SOC triage, detection engineering, threat hunting, OCSF data lake, cloud security telemetry"
	/>

	<link rel="canonical" href="https://roverhq.ai/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://roverhq.ai/" />
	<meta
		property="og:title"
		content="Rover | SIEM Built for Infinite Retention & Object Storage Search"
	/>
	<meta
		property="og:description"
		content="Keep 100% of your security events in object storage. Search petabytes of historical telemetry in seconds and give your SOC full context without hot storage fees."
	/>
	<meta property="og:image" content="https://roverhq.ai/og-image.jpg" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Rover | SIEM Built for Infinite Retention & Object Storage Search"
	/>
	<meta
		name="twitter:description"
		content="Keep 100% of your security events in object storage. Search petabytes of historical telemetry in seconds and give your SOC full context without hot storage fees."
	/>
	<meta name="twitter:image" content="https://roverhq.ai/og-image.jpg" />

	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": "https://roverhq.ai/#organization",
				"name": "Rover",
				"url": "https://roverhq.ai",
				"logo": "https://roverhq.ai/rover-logo.png",
				"sameAs": ["https://x.com/roverhq_ai"],
				"description": "Rover is a SIEM and Security Data Lake platform enabling instant search, continuous detections, and AI context engines over cloud object storage."
			},
			{
				"@type": "WebSite",
				"@id": "https://roverhq.ai/#website",
				"url": "https://roverhq.ai",
				"name": "Rover",
				"description": "Cold Storage. Hot Intelligence. — Search, Analytics & AI over Object Storage",
				"publisher": {
					"@id": "https://roverhq.ai/#organization"
				}
			},
			{
				"@type": "SoftwareApplication",
				"@id": "https://roverhq.ai/#software",
				"name": "Rover SIEM & Security Data Lake",
				"operatingSystem": "Cloud Native",
				"applicationCategory": "SecurityApplication",
				"description": "Keep every security event in object storage. Search and analyze years of data in seconds without search clusters."
			}
		]
	}
	</script>`}
</svelte:head>

<Hero />
<BigIdea />
<!-- <Capabilities /> -->
<Architecture />
<AiSoc />
<!-- <Convergence /> -->
<Economics />
<!-- <PlatformCeiling /> -->
<EarlyAccess />
