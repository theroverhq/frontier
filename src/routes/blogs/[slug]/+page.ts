import { blogs } from '$lib/data/blogs';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const cleanSlug = params.slug.replace(/\.html$/, '');
	const blog = blogs.find((b) => b.slug === cleanSlug);

	if (!blog) {
		error(404, 'Blog post not found');
	}

	const currentIndex = blogs.findIndex((b) => b.slug === cleanSlug);
	const prevBlog = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;
	const nextBlog = currentIndex > 0 ? blogs[currentIndex - 1] : null;

	return {
		blog,
		allBlogs: blogs,
		prevBlog,
		nextBlog
	};
};
