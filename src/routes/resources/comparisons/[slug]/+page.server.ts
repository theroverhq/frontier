import { error } from '@sveltejs/kit';
import pages from '$lib/server/comparison-pages.json';
import { comparisons } from '$lib/comparisons';
import type { PageServerLoad, EntryGenerator } from './$types';

export const entries: EntryGenerator = () =>
	comparisons.map(({ pageSlug }) => ({ slug: pageSlug }));
export const load: PageServerLoad = ({ params }) => {
	const key = `rover-vs-${params.slug}`;
	if (!Object.prototype.hasOwnProperty.call(pages, key)) error(404, 'Comparison not found');
	return { comparison: pages[key as keyof typeof pages] };
};
