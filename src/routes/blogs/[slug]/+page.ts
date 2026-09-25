import { blogs } from '$lib/data/blogs';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

function addTableOfContents(html: string) {
	const idAttribute = /\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;
	const getId = (tag: string) => {
		const match = tag.match(idAttribute);
		return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
	};
	// Reserve existing IDs throughout the article before generating heading anchors.
	const usedIds = new Set(
		Array.from(html.matchAll(/<[a-z][\w:-]*\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi))
			.map(([tag]) => getId(tag))
			.filter((id): id is string => id !== undefined)
	);
	const tableOfContents: { id: string; html: string }[] = [];
	const listedIds = new Set<string>();
	const content = html.replace(
		/(<h2\b(?:"[^"]*"|'[^']*'|[^'">])*>)([\s\S]*?)(<\/h2\s*>)/gi,
		(heading, openingTag: string, headingHtml: string, closingTag: string) => {
			let id = getId(openingTag);
			if (id === undefined) {
				const base =
					headingHtml
						.replace(/<[^>]*>/g, '')
						.replace(/&(?:#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, '-')
						.normalize('NFKD')
						.toLowerCase()
						.replace(/[\u0300-\u036f]/g, '')
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/^-+|-+$/g, '') || 'section';
				id = base;
				let suffix = 2;
				while (usedIds.has(id)) id = `${base}-${suffix++}`;
				usedIds.add(id);
				heading = `${openingTag.slice(0, -1)} id="${id}">${headingHtml}${closingTag}`;
			}
			// Keep author-supplied IDs intact, without listing duplicate or empty anchors.
			if (id && !listedIds.has(id)) {
				tableOfContents.push({ id, html: headingHtml });
				listedIds.add(id);
			}
			return heading;
		}
	);

	return { html: content, tableOfContents };
}

export const load: PageLoad = ({ params }) => {
	const cleanSlug = params.slug.replace(/\.html$/, '');
	const blog = blogs.find((b) => b.slug === cleanSlug);

	if (!blog) {
		error(404, 'Blog post not found');
	}

	const currentIndex = blogs.findIndex((b) => b.slug === cleanSlug);
	const prevBlog = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;
	const nextBlog = currentIndex > 0 ? blogs[currentIndex - 1] : null;
	const { html, tableOfContents } = addTableOfContents(blog.html);

	return {
		blog: { ...blog, html },
		tableOfContents,
		allBlogs: blogs,
		prevBlog,
		nextBlog
	};
};
