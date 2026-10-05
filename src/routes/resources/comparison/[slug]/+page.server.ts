import { error } from '@sveltejs/kit';
import pages from '$lib/server/comparison-pages.json';
import { comparisons } from '$lib/comparisons';
import type { PageServerLoad, EntryGenerator } from './$types';

export const entries: EntryGenerator = () => comparisons.map(({ slug }) => ({ slug }));
export const load: PageServerLoad = ({ params }) => {
	if (!Object.prototype.hasOwnProperty.call(pages, params.slug)) error(404, 'Comparison not found');
	return { comparison: pages[params.slug as keyof typeof pages] };
};
