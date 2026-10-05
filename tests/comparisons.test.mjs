import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { parseComparison, readComparisons } from '../scripts/lib/comparisons.mjs';

const content = await readFile(
	new URL('../src/lib/content/comparisons/rover-vs-splunk.md', import.meta.url),
	'utf8'
);

test('migration preserves both canonical pages, section anchors, tables, and private PDF keys', async () => {
	const pages = await readComparisons();
	assert.ok(pages.length >= 2);
	const splunk = pages.find((page) => page.slug === 'rover-vs-splunk');
	const sentinel = pages.find((page) => page.slug === 'rover-vs-microsoft-sentinel');
	assert.equal(splunk.pdfKey, 'comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf');
	assert.equal(
		sentinel.pdfKey,
		'comparisons/microsoft-sentinel/Rover-vs-Microsoft-Sentinel-Battlecard.pdf'
	);
	for (const page of [splunk, sentinel]) {
		assert.equal(page.canonical, `https://roverhq.ai/resources/comparisons/${page.pageSlug}/`);
		assert.equal(page.toc.length, page.slug === 'rover-vs-splunk' ? 7 : 6);
		assert.match(page.html, /id="historical-investigations"/);
		assert.match(page.html, /<table>/);
		assert.match(page.html, /Make accessible evidence/);
		assert.match(page.html, /Evaluate detection reliability under load/);
		assert.equal((page.html.match(/class="takeaway"/g) || []).length, 2);
		assert.match(page.html, /<th scope="row">/);
		assert.match(page.html, /<caption/);
		assert.match(page.images.og, /\?v=[a-f0-9]{8}$/);
		assert.ok(!page.html.includes('ResourceDownloadForm'));
	}
});

test('one new content file describes its route, PDF, images and navigation without code edits', () => {
	const source = content
		.replaceAll('Splunk Enterprise Security', 'New Vendor')
		.replace(/^navLabel:.*$/m, 'navLabel: New Vendor')
		.replace(/^pdfFolder:.*$/m, 'pdfFolder: new-vendor')
		.replace('Rover-vs-Splunk-Battlecard.pdf', 'New-Vendor.pdf');
	const page = parseComparison(source, 'rover-vs-new-vendor');
	assert.equal(page.resourceId, 'rover-vs-new-vendor');
	assert.equal(page.pagePath, '/resources/comparisons/new-vendor/');
	assert.equal(page.pdfKey, 'comparisons/new-vendor/New-Vendor.pdf');
	assert.equal(page.navLabel, 'New Vendor');
});

test('unsafe PDF paths, external images, duplicate anchors and dangerous links fail generation', () => {
	for (const source of [
		content.replace('Rover-vs-Splunk-Battlecard.pdf', '../Secrets.pdf'),
		content.replace(/^pdfFolder:.*$/m, 'pdfFolder: ../outside'),
		content.replace(
			'/assets/comparisons/splunk/rover-vs-splunk-page-dark.png',
			'https://evil.invalid/img.png'
		),
		content + '\n## Duplicate {#historical-investigations}\nText',
		content + '\n[Bad](javascript:alert%281%29)'
	])
		assert.throws(() => parseComparison(source, 'rover-vs-splunk'));
	assert.throws(() => parseComparison(content, '../invalid'));
});

test('raw HTML does not execute and nested heading/list content is supported', () => {
	const page = parseComparison(
		content + '\n<script>alert("unsafe")</script>\n\n### Details\n\n- A list item\n',
		'rover-vs-splunk'
	);
	assert.ok(!page.html.includes('<script'));
	assert.match(page.html, /<h3>/);
	assert.match(page.html, /<ul>/);
});

test('Elastic uses supplied copy, its own route and a private battlecard', async () => {
	const page = (await readComparisons()).find((page) => page.slug === 'rover-vs-elastic-security');
	assert.equal(page.pagePath, '/resources/comparisons/elastic-security/');
	assert.equal(page.pdfKey, 'comparisons/elastic-security/Rover-vs-Elastic-Battlecard.pdf');
	assert.equal(page.toc.length, 6);
	assert.equal((page.html.match(/<th scope="row">/g) || []).length, 8);
	assert.match(page.html, /Elastic Common Schema/);
	assert.match(page.html, /Automatic Import/);
	assert.match(page.html, /Agent Builder/);
	assert.ok(!page.html.includes('Microsoft Sentinel'));
	assert.ok(!page.html.includes('Splunk'));
});
