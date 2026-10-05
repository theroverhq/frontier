import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readComparisons, projectRoot } from './lib/comparisons.mjs';
const pages = await readComparisons();
const catalog = pages.map(({ html, introHtml, ...metadata }) => metadata);
const outputs = {
	'src/lib/generated/comparisons.json': catalog,
	'src/lib/server/comparison-pages.json': Object.fromEntries(
		pages.map((page) => [page.slug, page])
	),
	'integrations/private-downloads/resources.json': Object.fromEntries(
		pages.map((page) => [page.resourceId, page.pdfKey])
	)
};
for (const [name, data] of Object.entries(outputs)) {
	await mkdir(path.dirname(path.join(projectRoot, name)), { recursive: true });
	await writeFile(path.join(projectRoot, name), JSON.stringify(data, null, 2) + '\n');
}
const csv =
	[
		['resourceId', 'title', 'pdfUrl', 'pageUrl'],
		...pages.map((page) => [page.resourceId, page.title, page.pdfUrl, page.canonical])
	]
		.map((row) => row.map((value) => '"' + value.replaceAll('"', '""') + '"').join(','))
		.join('\n') + '\n';
await writeFile(path.join(projectRoot, 'integrations/google-leads/Resources.csv'), csv);
console.log(`Generated ${pages.length} comparisons and their resource registry.`);
