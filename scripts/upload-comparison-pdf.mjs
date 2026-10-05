import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readComparisons, projectRoot, bucket, region } from './lib/comparisons.mjs';

const [slug, pdfPath] = process.argv.slice(2);
if (!slug || !pdfPath)
	throw Error('Usage: npm run upload:comparison -- rover-vs-name /path/to/Battlecard.pdf');
const comparison = (await readComparisons()).find((page) => page.slug === slug);
if (!comparison) throw Error(`Unknown comparison: ${slug}. Add its Markdown file first.`);
const file = path.resolve(pdfPath);
if (!(await readFile(file)).subarray(0, 5).equals(Buffer.from('%PDF-')))
	throw Error('The source must be a PDF.');
function aws(args) {
	const result = spawnSync('aws', ['--region', region, ...args, '--output', 'json'], {
		encoding: 'utf8'
	});
	if (result.status !== 0) throw Error(result.stderr || 'AWS CLI failed');
	return result.stdout.trim() ? JSON.parse(result.stdout) : {};
}
const account = aws(['sts', 'get-caller-identity']).Account;
if (account !== '613025568726') throw Error('Select the Rover AWS account 613025568726.');
const block = aws([
	's3api',
	'get-public-access-block',
	'--bucket',
	bucket,
	'--expected-bucket-owner',
	account
]).PublicAccessBlockConfiguration;
if (
	!['BlockPublicAcls', 'IgnorePublicAcls', 'BlockPublicPolicy', 'RestrictPublicBuckets'].every(
		(key) => block[key] === true
	)
)
	throw Error('The comparison bucket must block all public access.');
aws([
	's3api',
	'put-object',
	'--bucket',
	bucket,
	'--expected-bucket-owner',
	account,
	'--key',
	comparison.pdfKey,
	'--body',
	file,
	'--content-type',
	'application/pdf',
	'--content-disposition',
	`attachment; filename="${comparison.pdfFile}"`,
	'--cache-control',
	'private, no-store',
	'--server-side-encryption',
	'AES256'
]);
const row = [comparison.resourceId, comparison.title, comparison.pdfUrl, comparison.canonical];
const csv = row.map((value) => '"' + value.replaceAll('"', '""') + '"').join(',') + '\n';
await mkdir(path.join(projectRoot, 'build-resources'), { recursive: true });
const output = path.join(projectRoot, 'build-resources', `${slug}.csv`);
await writeFile(output, csv);
console.log(`Uploaded privately: s3://${bucket}/${comparison.pdfKey}`);
console.log(
	`Add/update this row in the private Resources sheet (resourceId, title, pdfUrl, pageUrl):\n${row.join('\t')}`
);
console.log(`CSV row: ${output}`);
