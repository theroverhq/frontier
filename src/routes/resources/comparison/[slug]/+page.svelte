<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<meta http-equiv="refresh" content={`0;url=${data.comparison.pagePath}`} />
	<meta name="robots" content="noindex" />
	<link rel="canonical" href={data.comparison.canonical} />
</svelte:head>

<p><a href={data.comparison.pagePath}>Continue to {data.comparison.title}</a></p>
