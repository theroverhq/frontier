import { blogs } from '$lib/data/blogs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	blogs: blogs.slice(0, 2).map(({ slug, category, read_time, card_title, description }) => ({
		slug,
		category,
		read_time,
		card_title,
		description
	}))
});
