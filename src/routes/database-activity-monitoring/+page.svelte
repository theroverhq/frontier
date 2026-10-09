<script lang="ts">
	import DamHero from '$lib/components/DamHero.svelte';
	import DamCapabilities from '$lib/components/DamCapabilities.svelte';
	import DamWhyRover from '$lib/components/DamWhyRover.svelte';
	import DamPricing from '$lib/components/DamPricing.svelte';
	import FinalCta from '$lib/components/FinalCta.svelte';
</script>

<svelte:head>
	<title>Rover | Database Activity Monitoring (DAM) for Real-Time Data Security</title>
	<meta
		name="description"
		content="Rover DAM monitors every database query in real time. Track privileged users, protect sensitive data, detect threats, enforce policy, and produce audit-ready compliance reports."
	/>
	<meta
		name="keywords"
		content="Database Activity Monitoring, DAM, database security, privileged user monitoring, sensitive data visibility, database audit, compliance reporting, database threat detection, database forensics, entitlement assessment, identity resolution"
	/>

	<link rel="canonical" href="https://roverhq.ai/database-activity-monitoring/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://roverhq.ai/database-activity-monitoring/" />
	<meta
		property="og:title"
		content="Rover | Database Activity Monitoring (DAM) for Real-Time Data Security"
	/>
	<meta
		property="og:description"
		content="Rover DAM monitors every database query in real time. Track privileged users, protect sensitive data, detect threats, enforce policy, and produce audit-ready compliance reports."
	/>
	<meta property="og:image" content="https://roverhq.ai/assets/og/dam.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Rover — Every query. Every database." />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Rover | Database Activity Monitoring (DAM) for Real-Time Data Security"
	/>
	<meta
		name="twitter:description"
		content="Rover DAM monitors every database query in real time. Track privileged users, protect sensitive data, detect threats, enforce policy, and produce audit-ready compliance reports."
	/>
	<meta name="twitter:image" content="https://roverhq.ai/assets/og/dam.png" />
	<meta name="twitter:image:alt" content="Rover — Every query. Every database." />

	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"@id": "https://roverhq.ai/database-activity-monitoring/#software",
		"name": "Rover Database Activity Monitoring",
		"url": "https://roverhq.ai/database-activity-monitoring/",
		"operatingSystem": "Cloud Native",
		"applicationCategory": "SecurityApplication",
		"description": "Real-time database activity monitoring with privileged user oversight, sensitive data visibility, threat detection, enforcement, and audit-ready compliance reporting.",
		"featureList": [
			"Real-Time Activity Monitoring",
			"Database Activity Alerts",
			"Anomalous Query Detection",
			"Privileged User Monitoring",
			"Sensitive Data Visibility",
			"Compliance and Audit Reporting",
			"Investigation and Forensics",
			"Response and Enforcement",
			"Asset Inventory and Coverage",
			"Identity Resolution",
			"Vulnerability and Entitlement Assessment"
		],
		"publisher": {
			"@id": "https://roverhq.ai/#organization"
		}
	}
	</script>`}
</svelte:head>

<DamHero />
<DamCapabilities />
<DamPricing />
<DamWhyRover />
<FinalCta
	badge="Get Demo"
	badgeHref="#get-demo"
	title="Your data is only as safe"
	accent="as the queries you can see."
	body="Start with the databases that hold your most sensitive data. Rover monitors activity in real time, flags what matters, and keeps the evidence ready for every investigation and audit."
	proof={[
		'Real-time activity monitoring',
		'Identity-aware alerts',
		'Policy enforcement',
		'Audit-ready evidence'
	]}
/>
