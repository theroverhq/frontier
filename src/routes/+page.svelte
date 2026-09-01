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
	<title
		>Rover | Cold Storage. Hot Intelligence. — Search, Analytics & AI for Your Security Data Lake</title
	>
	<meta
		name="description"
		content="Keep every security event in object storage. Search and analyze years of data in seconds. Run detections across the full dataset and give analysts and AI agents the context to investigate anything—without search clusters."
	/>
	<meta
		name="keywords"
		content="Agentic SIEM, Agentic SecOps, Rover SIEM, S3 SIEM, S3 indices, adaptive detections, signals to cases, security search, SIEM cost reduction, autonomous triage, detection engineering, threat hunting"
	/>

	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content="Rover | Cold Storage. Hot Intelligence. — Search, Analytics & AI for Your Security Data Lake"
	/>
	<meta
		property="og:description"
		content="Keep every security event in object storage. Search and analyze years of data in seconds. Run detections across the full dataset and give analysts and AI agents the context to investigate anything—without search clusters."
	/>
	<meta property="og:image" content="https://roverhq.ai/og-image.jpg" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Rover | Cold Storage. Hot Intelligence. — Search, Analytics & AI for Your Security Data Lake"
	/>
	<meta
		name="twitter:description"
		content="Keep every security event in object storage. Search and analyze years of data in seconds. Run detections across the full dataset and give analysts and AI agents the context to investigate anything—without search clusters."
	/>
	<meta name="twitter:image" content="https://roverhq.ai/og-image.jpg" />
</svelte:head>

<Hero />
<BigIdea />
<!-- <Capabilities /> -->
<Architecture />
<Convergence />
<Economics />
<!-- <AiSoc /> -->
<!-- <PlatformCeiling /> -->
<EarlyAccess />
