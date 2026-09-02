import { blogs } from '$lib/data/blogs';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const site = 'https://roverhq.ai';
	const currentDate = new Date().toISOString().split('T')[0];

	const pages = [
		{ path: '', priority: '1.0', changefreq: 'weekly' },
		{ path: '/blogs', priority: '0.9', changefreq: 'daily' }
	];

	const blogPages = blogs.map((blog) => ({
		path: `/blogs/${blog.slug}`,
		priority: '0.8',
		changefreq: 'monthly'
	}));

	const allPages = [...pages, ...blogPages];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `  <url>
    <loc>${site}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
