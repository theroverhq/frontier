<script lang="ts">
	import ComparisonPage from '$lib/components/ComparisonPage.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<ComparisonPage comparison={data.comparison} />
