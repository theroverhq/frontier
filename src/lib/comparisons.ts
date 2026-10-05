import catalog from '$lib/generated/comparisons.json';

export const comparisons = catalog;
export type ComparisonMetadata = (typeof catalog)[number];
export type ComparisonPageData = ComparisonMetadata & { introHtml: string; html: string };
export const resourceDownloads: Record<string, string> = Object.fromEntries(
	catalog.map((comparison) => [comparison.resourceId, comparison.downloadUrl])
);
