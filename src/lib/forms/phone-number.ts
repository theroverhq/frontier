import {
	getCountries,
	getCountryCallingCode,
	parsePhoneNumberFromString,
	type CountryCode
} from 'libphonenumber-js';

const names = new Intl.DisplayNames(['en'], { type: 'region' });
export const phoneCountries = getCountries()
	.map((code) => ({
		code,
		name: names.of(code) || code,
		callingCode: getCountryCallingCode(code)
	}))
	.sort((a, b) => a.name.localeCompare(b.name, 'en'));

export function searchCountry(value: string, query: string) {
	const normalize = (text: string) =>
		text
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	return normalize(value).includes(normalize(query.trim()));
}

/** Preserve pasted international numbers; remove national trunk prefixes through metadata. */
export function internationalPhone(value: string, country: CountryCode) {
	const input = value.trim();
	if (!/^[+\d\s().-]+$/.test(input)) return '';
	const parsed = parsePhoneNumberFromString(input, { defaultCountry: country, extract: false });
	return parsed?.isPossible() &&
		!/^0+$/.test(parsed.nationalNumber) &&
		/^\+[1-9]\d{6,14}$/.test(parsed.number)
		? parsed.number
		: '';
}

export function pastedPhoneCountry(value: string): CountryCode | undefined {
	return value.trim().startsWith('+')
		? parsePhoneNumberFromString(value, { extract: false })?.country
		: undefined;
}

/** When the user explicitly changes countries, keep the national part of a full number. */
export function nationalPhone(value: string) {
	return value.trim().startsWith('+')
		? parsePhoneNumberFromString(value, { extract: false })?.nationalNumber || value
		: value;
}
