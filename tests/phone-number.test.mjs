import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/lib/forms/phone-number.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const exports = {};
new Function('exports', 'require', compiled)(exports, require);
const { internationalPhone, nationalPhone, pastedPhoneCountry, phoneCountries, searchCountry } =
	exports;

test('national numbers include the selected calling code and omit trunk prefixes', () => {
	assert.equal(internationalPhone('98765 43210', 'IN'), '+919876543210');
	assert.equal(internationalPhone('(202) 555-0123', 'US'), '+12025550123');
	assert.equal(internationalPhone('020 7946 0018', 'GB'), '+442079460018');
});
test('international pastes keep their code and identify their country', () => {
	assert.equal(internationalPhone('+44 20 7946 0018', 'US'), '+442079460018');
	assert.equal(pastedPhoneCountry('+44 20 7946 0018'), 'GB');
	assert.equal(pastedPhoneCountry('020 7946 0018'), undefined);
});
test('invalid or incomplete numbers cannot be submitted', () => {
	for (const value of ['', '123', 'call 2025550123', '+', '+12345678901234567890', '0000000000']) {
		assert.equal(internationalPhone(value, 'US'), '', value);
	}
});
test('country search matches names, ISO codes, calling codes, and accents', () => {
	const india = phoneCountries.find((country) => country.code === 'IN');
	const value = `${india.name} ${india.code} +${india.callingCode}`;
	for (const query of ['india', 'IN', '+91', '91']) assert.equal(searchCountry(value, query), true);
	assert.equal(searchCountry('Côte d’Ivoire CI +225', 'cote'), true);
	assert.equal(searchCountry(value, 'Germany'), false);
});
test('every supported phone country has an SVG flag and serialized numbers fit the backend', () => {
	assert.ok(phoneCountries.length > 200);
	for (const country of phoneCountries)
		assert.ok(
			existsSync(
				new URL(`../node_modules/country-flag-icons/3x2/${country.code}.svg`, import.meta.url)
			)
		);
	assert.match(internationalPhone('9876543210', 'IN'), /^\+?[0-9]{7,15}$/);
});

test('explicit country changes preserve the national part without a stale prefix', () => {
	assert.equal(nationalPhone('+44 20 7946 0018'), '2079460018');
	assert.equal(internationalPhone(nationalPhone('+44 20 7946 0018'), 'IN'), '+912079460018');
	assert.equal(nationalPhone('020 7946 0018'), '020 7946 0018');
});
