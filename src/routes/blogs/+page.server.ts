import { blogs } from '$lib/data/blogs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	blogs: blogs.map(
		({ slug, title, card_title, description, category, blog_counter, published_label, read_time }) => ({
			slug,
			title,
			card_title,
			description,
			category,
			blog_counter,
			published_label,
			read_time
		})
	)
});
