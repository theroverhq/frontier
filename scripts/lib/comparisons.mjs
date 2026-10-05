import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { Marked } from 'marked';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export const bucket = 'rover-private-resources-613025568726-ap-south-1';
export const region = 'ap-south-1';
export const site = 'https://roverhq.ai';
const escape = (text) =>
	String(text).replace(
		/[&<>"']/g,
		(char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
	);
const slugify = (text) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

export function parseComparison(source, slug) {
	if (!/^rover-vs-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
		throw Error(`Invalid comparison slug: ${slug}`);
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) throw Error(`${slug}: YAML frontmatter is required`);
	const metadata = parse(match[1]);
	for (const field of ['title', 'competitor', 'description', 'pdfFile']) {
		if (typeof metadata?.[field] !== 'string' || !metadata[field].trim())
			throw Error(`${slug}: ${field} is required`);
	}
	const pdfFolder = metadata.pdfFolder ?? slug;
	if (
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pdfFolder) ||
		!/^[A-Za-z0-9_-]+\.pdf$/.test(metadata.pdfFile)
	)
		throw Error(`${slug}: unsafe PDF path`);
	const pdfKey = `comparisons/${pdfFolder}/${metadata.pdfFile}`;
	const images = {};
	for (const variant of ['dark', 'light', 'og']) {
		const image = metadata.images?.[variant];
		if (
			typeof image !== 'string' ||
			!/^\/assets\/comparisons\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)$/.test(
				image
			)
		)
			throw Error(`${slug}: ${variant} image must be a local comparison asset`);
		images[variant] = image;
	}
	const toc = [];
	const ids = new Set(['download-comparison']);
	let sectionOpen = false;
	const renderer = {
		html() {
			return '';
		},
		image() {
			throw Error(`${slug}: use the frontmatter image fields`);
		},
		link(token) {
			const url = new URL(token.href, site);
			if (!['https:', 'http:', 'mailto:'].includes(url.protocol))
				throw Error(`${slug}: unsafe link`);
			return `<a href="${escape(token.href)}">${this.parser.parseInline(token.tokens)}</a>`;
		},
		paragraph(token) {
			const highlight = token.tokens.length === 1 && token.tokens[0].type === 'strong';
			return `<p${highlight ? ' class="takeaway"' : ''}>${this.parser.parseInline(token.tokens)}</p>\n`;
		},
		heading(token) {
			if (token.depth > 2)
				return `<h${token.depth}>${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
			if (token.depth !== 2)
				throw Error(`${slug}: use level-two headings for sections; title belongs in frontmatter`);
			const explicit = token.text.match(/\s*\{#([a-z0-9]+(?:-[a-z0-9]+)*)\}\s*$/);
			const title = token.text.replace(/\s*\{#[^}]+\}\s*$/, '');
			const id = explicit?.[1] ?? slugify(title);
			if (!id || ids.has(id)) throw Error(`${slug}: duplicate or invalid heading ID ${id}`);
			ids.add(id);
			toc.push({ id, label: title });
			const prefix = sectionOpen ? '</section>\n' : '';
			sectionOpen = true;
			return `${prefix}<section id="${id}" aria-labelledby="${id}-heading"><h2 id="${id}-heading">${escape(title)}</h2>\n`;
		},
		table(token) {
			const head = token.header
				.map((cell) => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`)
				.join('');
			const rows = token.rows
				.map(
					(row) =>
						`<tr>${row.map((cell, index) => `<${index ? 'td' : 'th scope="row"'}>${this.parser.parseInline(cell.tokens)}</${index ? 'td' : 'th'}>`).join('')}</tr>`
				)
				.join('');
			return `<div class="comparison-table-region" role="region" aria-label="Comparison table" tabindex="0"><table><caption class="sr-only">${escape(metadata.title)}: at a glance</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
		}
	};
	const marked = new Marked({ gfm: true, renderer });
	const body = match[2];
	const firstHeading = body.search(/^## /m);
	if (firstHeading < 0) throw Error(`${slug}: at least one section is required`);
	const introHtml = marked.parse(body.slice(0, firstHeading));
	const html = marked.parse(body.slice(firstHeading)) + (sectionOpen ? '</section>' : '');
	const pageSlug = slug.replace(/^rover-vs-/, '');
	const pagePath = `/resources/comparisons/${pageSlug}/`;
	return {
		slug,
		pageSlug,
		resourceId: slug,
		title: metadata.title,
		competitor: metadata.competitor,
		navLabel: metadata.navLabel || metadata.competitor,
		description: metadata.description,
		pagePath,
		canonical: site + pagePath,
		pdfFile: metadata.pdfFile,
		pdfFolder,
		pdfKey,
		pdfUrl: `s3://${bucket}/${pdfKey}`,
		downloadUrl: `https://${bucket}.s3.${region}.amazonaws.com/${pdfKey}`,
		imageAlt:
			typeof metadata.imageAlt === 'string'
				? metadata.imageAlt
				: `Rover and ${metadata.competitor} comparison.`,
		images,
		toc,
		introHtml,
		html
	};
}

export async function readComparisons(root = projectRoot) {
	const directory = path.join(root, 'src/lib/content/comparisons');
	const files = (await readdir(directory)).filter((file) => file.endsWith('.md')).sort();
	const comparisons = [];
	for (const file of files) {
		const item = parseComparison(
			await readFile(path.join(directory, file), 'utf8'),
			file.slice(0, -3)
		);
		for (const [variant, asset] of Object.entries(item.images)) {
			const data = await readFile(path.join(root, 'static', asset));
			item.images[variant] =
				`${asset}?v=${createHash('sha256').update(data).digest('hex').slice(0, 8)}`;
		}
		comparisons.push(item);
	}
	const keys = new Set();
	for (const item of comparisons) {
		if (keys.has(item.pdfKey)) throw Error('Two comparisons share a PDF key');
		keys.add(item.pdfKey);
	}
	return comparisons;
}
