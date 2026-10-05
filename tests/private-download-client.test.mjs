import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const objectUrl =
	'https://rover-private-resources-613025568726-ap-south-1.s3.ap-south-1.amazonaws.com/comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf';
const sentinelUrl = objectUrl.replace(
	'comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf',
	'comparisons/microsoft-sentinel/Rover-vs-Microsoft-Sentinel-Battlecard.pdf'
);
const source = readFileSync(
	new URL('../src/lib/forms/google-lead-client.ts', import.meta.url),
	'utf8'
);
const compiled = ts.transpileModule(source + '\nexport { allowedDownloadUrl };', {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const context = vm.createContext({
	exports: {},
	URL,
	Date,
	require: () => ({
		resourceDownloads: { 'rover-vs-splunk': objectUrl, 'rover-vs-microsoft-sentinel': sentinelUrl }
	})
});
vm.runInContext(compiled, context);
const validate = context.exports.allowedDownloadUrl;

function signedUrl(target = objectUrl) {
	const url = new URL(target);
	const date = new Date()
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
	url.search = new URLSearchParams({
		'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
		'X-Amz-Date': date,
		'X-Amz-Expires': '300',
		'X-Amz-SignedHeaders': 'host',
		'X-Amz-Credential': 'temporary-key/scope',
		'X-Amz-Signature': 'a'.repeat(64),
		'X-Amz-Security-Token': 'temporary-role-token'
	}).toString();
	return url;
}

test('client accepts the registered S3 object with a fresh five-minute signed link', () => {
	const url = signedUrl();
	assert.equal(validate(url.href, 'rover-vs-splunk'), url.href);
});

test('client rejects public URLs, other objects/hosts, missing signatures and expired links', () => {
	const invalid = [
		objectUrl,
		'https://roverhq.ai/assets/comparisons/splunk/rover-vs-splunk-full-comparison-guide.pdf'
	];
	for (const mutate of [
		(url) => {
			url.hostname = 'evil.example';
		},
		(url) => {
			url.pathname = '/another.pdf';
		},
		(url) => {
			url.protocol = 'http:';
		},
		(url) => {
			url.username = 'user';
		},
		(url) => {
			url.hash = 'fragment';
		},
		(url) => {
			url.searchParams.delete('X-Amz-Signature');
		},
		(url) => {
			url.searchParams.set('X-Amz-Expires', '301');
		},
		(url) => {
			url.searchParams.set('X-Amz-Expires', '0');
		},
		(url) => {
			url.searchParams.set('X-Amz-Date', '20000101T000000Z');
		},
		(url) => {
			url.searchParams.set('X-Amz-Date', '20990101T000000Z');
		}
	]) {
		const url = signedUrl();
		mutate(url);
		invalid.push(url.href);
	}
	for (const url of invalid) assert.throws(() => validate(url, 'rover-vs-splunk'));
	assert.throws(() => validate(signedUrl().href, 'unknown'));
});

test('Sentinel client accepts its own signed PDF and rejects cross-resource downloads', () => {
	const url = signedUrl(sentinelUrl);
	assert.equal(validate(url.href, 'rover-vs-microsoft-sentinel'), url.href);
	assert.throws(() => validate(signedUrl().href, 'rover-vs-microsoft-sentinel'));
	assert.throws(() => validate(url.href, 'rover-vs-splunk'));
});
