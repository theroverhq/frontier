import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(path) {
	return readFileSync(join(root, path), "utf8");
}

const index = read("index.html");
const blogTemplate = read("blogs/blogs.json");
const blogs = JSON.parse(read("_site/blogs/blogs.json"));
const sitemap = read("_site/sitemap.xml");
const robots = read("_site/robots.txt");

assert.match(index, /Rover/i);
assert.match(index, /AI-native SIEM/i);
assert.match(index, /S3-native search|S3-backed search/i);
assert.match(blogTemplate, /site\.pages \| where: "layout", "blog"/);
assert.ok(Array.isArray(blogs));
assert.ok(blogs.length >= 5, "blog catalog should expose published articles");

for (const article of blogs) {
	assert.equal(typeof article.title, "string");
	assert.ok(article.title.trim().length > 0, "blog title is required");
	assert.equal(typeof article.url, "string");
	assert.match(article.url, /^.+\.html$/);
	const sitemapPath = `/blogs/${article.url}`;
	assert.match(sitemap, new RegExp(sitemapPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(sitemap, /<loc>https?:\/\/[^<]+\/<\/loc>/);
assert.match(robots, /Sitemap:/);
