import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(
	new URL('../integrations/google-leads/Code.gs', import.meta.url),
	'utf8'
);
const pdfUrl =
	'https://rover-private-resources-613025568726-ap-south-1.s3.ap-south-1.amazonaws.com/comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf?X-Amz-Signature=test';
const pageUrl = 'https://roverhq.ai/resources/comparison/splunk/';
const plain = (value) => JSON.parse(JSON.stringify(value));

/** In-memory Apps Script services: no account, spreadsheet, mail, or network access. */
function fixture() {
	const state = {
		now: Date.parse('2026-10-01T08:00:00Z'),
		activeEmail: '',
		logs: [],
		properties: new Map(),
		signerCalls: [],
		signerFailure: false,
		spreadsheets: new Map(),
		triggers: [],
		writes: [],
		columnInsertions: [],
		mailAttempts: [],
		mails: [],
		quota: 1500,
		mailFailure: false,
		leadWriteFailure: false,
		stripLeadingQuote: false,
		lockUnavailable: false,
		locked: false,
		locks: 0,
		releases: 0,
		flushes: 0
	};

	class Range {
		constructor(sheet, row, column, rowCount = 1, columnCount = 1) {
			assert.ok(column >= 1 && columnCount >= 1, 'range columns must be positive');
			assert.ok(column + columnCount - 1 <= sheet.maxColumns, 'range must fit existing columns');
			Object.assign(this, { sheet, row, column, rowCount, columnCount });
		}
		getValues() {
			return Array.from({ length: this.rowCount }, (_, r) =>
				Array.from(
					{ length: this.columnCount },
					(_, c) => this.sheet.rows[this.row + r - 1]?.[this.column + c - 1] ?? ''
				)
			);
		}
		setNumberFormat(format) {
			this.numberFormat = format;
			return this;
		}
		setFontWeight() {
			return this;
		}
		setValues(values) {
			assert.equal(values.length, this.rowCount, 'range row count');
			for (const row of values) assert.equal(row.length, this.columnCount, 'range column count');
			if (state.leadWriteFailure && this.sheet.name === 'Leads' && this.row >= 2) {
				throw new Error('Mock spreadsheet write failed');
			}
			state.writes.push({
				sheet: this.sheet.name,
				row: this.row,
				column: this.column,
				format: this.numberFormat,
				values: plain(values)
			});
			values.forEach((row, r) => {
				const target = (this.sheet.rows[this.row + r - 1] ??= []);
				row.forEach((value, c) => {
					target[this.column + c - 1] =
						state.stripLeadingQuote && typeof value === 'string' && value.startsWith("'")
							? value.slice(1)
							: value;
				});
			});
			return this;
		}
		createTextFinder(value) {
			const range = this;
			return {
				matchEntireCell() {
					return this;
				},
				matchCase() {
					return this;
				},
				findNext() {
					const index = range.getValues().findIndex((row) => row.includes(value));
					return index < 0 ? null : { getRow: () => range.row + index };
				}
			};
		}
	}

	class Sheet {
		constructor(name) {
			this.name = name;
			this.rows = [];
			this.maxColumns = 26;
		}
		setName(name) {
			this.name = name;
			return this;
		}
		getLastRow() {
			return this.rows.length;
		}
		getLastColumn() {
			return this.rows.reduce(
				(last, row) =>
					Math.max(last, row.findLastIndex((value) => value !== '' && value != null) + 1),
				0
			);
		}
		getMaxColumns() {
			return this.maxColumns;
		}
		insertColumnsAfter(position, count) {
			assert.ok(position >= 1 && position <= this.maxColumns, 'insertion position must exist');
			assert.ok(count >= 1, 'inserted column count must be positive');
			assert.equal(position, this.maxColumns, 'migration must expand at the end of the sheet');
			state.columnInsertions.push({ sheet: this.name, position, count });
			this.maxColumns += count;
			return this;
		}
		getRange(...args) {
			return new Range(this, ...args);
		}
		setFrozenRows(count) {
			this.frozenRows = count;
		}
		autoResizeColumns() {}
	}

	class Spreadsheet {
		constructor(id, title) {
			Object.assign(this, { id, title, sheets: [new Sheet('Sheet1')] });
		}
		getId() {
			return this.id;
		}
		getUrl() {
			return `https://docs.google.com/spreadsheets/d/${this.id}/edit`;
		}
		getSheets() {
			return this.sheets;
		}
		getSheetByName(name) {
			return this.sheets.find((sheet) => sheet.name === name) ?? null;
		}
		insertSheet(name) {
			const sheet = new Sheet(name);
			this.sheets.push(sheet);
			return sheet;
		}
	}

	class Clock extends Date {
		constructor(...args) {
			super(...(args.length ? args : [state.now]));
		}
		static now() {
			return state.now;
		}
	}

	const context = vm.createContext({
		Date: Clock,
		console: { log: (message) => state.logs.push(message) },
		PropertiesService: {
			getScriptProperties: () => ({
				getProperty: (key) => state.properties.get(key) ?? null,
				setProperty: (key, value) => state.properties.set(key, value)
			})
		},
		SpreadsheetApp: {
			create(title) {
				const spreadsheet = new Spreadsheet(`private-sheet-${state.spreadsheets.size + 1}`, title);
				state.spreadsheets.set(spreadsheet.id, spreadsheet);
				return spreadsheet;
			},
			openById(id) {
				const spreadsheet = state.spreadsheets.get(id);
				if (!spreadsheet) throw new Error('Unknown spreadsheet');
				return spreadsheet;
			},
			flush() {
				state.flushes += 1;
			}
		},
		Session: {
			getActiveUser: () => ({ getEmail: () => state.activeEmail }),
			getEffectiveUser: () => ({ getEmail: () => 'owner@roverhq.ai' })
		},
		LockService: {
			getScriptLock: () => ({
				tryLock() {
					if (state.lockUnavailable) return false;
					assert.equal(state.locked, false, 'a lock must not be acquired twice');
					state.locked = true;
					state.locks += 1;
					return true;
				},
				releaseLock() {
					assert.equal(state.locked, true);
					state.locked = false;
					state.releases += 1;
				}
			})
		},
		ScriptApp: {
			getProjectTriggers: () => state.triggers,
			newTrigger(handler) {
				return {
					timeBased() {
						return this;
					},
					everyMinutes(minutes) {
						this.minutes = minutes;
						return this;
					},
					create() {
						const trigger = { getHandlerFunction: () => handler, minutes: this.minutes };
						state.triggers.push(trigger);
						return trigger;
					}
				};
			}
		},
		MailApp: {
			getRemainingDailyQuota: () => state.quota,
			sendEmail(message) {
				assert.equal(state.locked, false, 'mail must be sent outside the storage lock');
				const sheet = state.spreadsheets.values().next().value.getSheetByName('Leads');
				assert.ok(sheet.rows.length > 1, 'mail must follow a persisted lead');
				assert.ok(state.flushes > 1, 'save must be flushed before notification delivery');
				state.mailAttempts.push(plain(message));
				if (state.mailFailure) throw new Error('Mock email delivery failed');
				state.mails.push(plain(message));
			}
		},
		Utilities: {
			DigestAlgorithm: { SHA_256: 'sha256' },
			Charset: { UTF_8: 'utf8' },
			computeDigest: (algorithm, value, charset) =>
				Array.from(createHash(algorithm).update(value, charset).digest(), (byte) =>
					byte > 127 ? byte - 256 : byte
				)
		},
		UrlFetchApp: {
			fetch(endpoint, options) {
				assert.equal(state.locked, false, 'signing happens outside the storage lock');
				const sheet = state.spreadsheets.values().next().value.getSheetByName('Leads');
				assert.ok(sheet.rows.length > 1, 'signing must follow a persisted lead');
				assert.equal(options.headers.Authorization, 'Bearer test-backend-secret');
				assert.equal(options.followRedirects, false);
				state.signerCalls.push(JSON.parse(options.payload));
				return {
					getResponseCode: () => (state.signerFailure ? 503 : 200),
					getContentText: () => JSON.stringify({ downloadUrl: pdfUrl })
				};
			}
		},
		HtmlService: {
			XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
			createHtmlOutput: (html) => ({
				html,
				setXFrameOptionsMode(mode) {
					this.frameMode = mode;
					return this;
				}
			})
		}
	});
	vm.runInContext(source, context, { filename: 'Code.gs' });
	return {
		state,
		context,
		setup: () => {
			const result = plain(context.setupLeadCapture_());
			state.properties.set(
				'ROVER_DOWNLOAD_SIGNER_URL',
				'https://example.lambda-url.ap-south-1.on.aws/'
			);
			state.properties.set('ROVER_DOWNLOAD_SIGNER_SECRET', 'test-backend-secret');
			return result;
		},
		save: (input) => plain(context.saveLead(input)),
		retry: () => context.retryLeadNotifications_(),
		leads: () => state.spreadsheets.values().next().value.getSheetByName('Leads'),
		resources: () => state.spreadsheets.values().next().value.getSheetByName('Resources')
	};
}

function lead(changes = {}) {
	return {
		requestId: randomUUID(),
		resourceId: 'rover-vs-splunk',
		name: 'Asha Sharma',
		jobTitle: 'Security Lead',
		company: 'Acme Security',
		email: 'asha@acme.co.in',
		phone: '+91 (98765) 43210',
		website: '',
		pageUrl,
		...changes
	};
}

function assertRejected(f, input, field) {
	const result = f.save(input);
	assert.equal(result.ok, false);
	assert.equal(result.downloadUrl, undefined);
	if (field) {
		assert.ok(
			result.fieldErrors?.[field],
			`expected an error for ${field}: ${JSON.stringify(input[field])}`
		);
	}
	assert.equal(f.leads().rows.length, 1, 'rejected submissions must not create leads');
	assert.equal(f.state.mailAttempts.length, 0, 'rejected submissions must not send mail');
	return result;
}

function installLegacyLead(f, { pending = false } = {}) {
	const existing = {
		requestId: randomUUID(),
		resourceId: 'rover-vs-splunk',
		name: 'Legacy Person',
		email: 'legacy@acme.ai',
		phone: '+12025550123'
	};
	const createdAt = new Date(f.state.now - 60 * 60 * 1000).toISOString();
	const payload = JSON.stringify({
		name: existing.name,
		email: existing.email,
		phone: existing.phone
	});
	const hash = createHash('sha256')
		.update(JSON.stringify([existing.resourceId, existing.name, existing.email, existing.phone]))
		.digest('hex');
	const row = [
		existing.requestId,
		createdAt,
		existing.resourceId,
		f.resources().rows[1][1],
		pageUrl,
		existing.name,
		existing.email,
		`'${existing.phone}`,
		hash,
		pending ? 'pending' : 'sent',
		'1',
		createdAt,
		pending ? new Date(f.state.now - 1).toISOString() : '',
		pending ? 'Email notification will retry.' : '',
		pending ? '' : createdAt,
		payload
	];
	f.leads().rows = [f.leads().rows[0].slice(0, 16), row];
	return plain(row);
}

test('the owner can initialize capture by running saveLead without editor arguments', () => {
	const f = fixture();
	f.state.activeEmail = 'owner@roverhq.ai';
	const setup = f.save();
	assert.match(setup.spreadsheetUrl, /^https:\/\/docs\.google\.com\/spreadsheets\/d\//);
	assert.equal(setup.notificationEmails, 'owner@roverhq.ai');
	assert.deepEqual(JSON.parse(f.state.logs[0]), setup);
	assert.equal(f.state.spreadsheets.size, 1);
	assert.equal(f.state.triggers.length, 1);
	assert.equal(f.state.mailAttempts.length, 0);
	assert.deepEqual(f.save(), setup, 'editor initialization must remain idempotent');
	assert.equal(f.state.spreadsheets.size, 1);
	assert.equal(f.state.triggers.length, 1);
});

test('anonymous and non-owner no-argument calls cannot initialize capture', () => {
	for (const activeEmail of ['', 'colleague@roverhq.ai', 'visitor@acme.ai']) {
		const f = fixture();
		f.state.activeEmail = activeEmail;
		assert.throws(() => f.save(), /owning Workspace account/);
		assert.equal(f.state.spreadsheets.size, 0);
		assert.equal(f.state.triggers.length, 0);
		assert.equal(f.state.properties.size, 0);
		assert.equal(f.state.mailAttempts.length, 0);
	}
});

test('owner calls with form arguments use validation and never trigger setup', () => {
	const f = fixture();
	f.state.activeEmail = 'owner@roverhq.ai';
	for (const input of [null, {}, [], lead()]) {
		assert.equal(f.save(input).ok, false);
		assert.equal(f.state.spreadsheets.size, 0);
		assert.equal(f.state.triggers.length, 0);
		assert.equal(f.state.mailAttempts.length, 0);
	}
	f.setup();
	assert.equal(f.save(lead()).ok, true, 'normal owner form submissions must still save');
});

test('setup creates one private spreadsheet, owner notifications, and one retry trigger', () => {
	const f = fixture();
	const first = f.setup();
	assert.equal(f.state.spreadsheets.size, 1);
	assert.match(first.spreadsheetUrl, /^https:\/\/docs\.google\.com\/spreadsheets\/d\//);
	assert.equal(first.notificationEmails, 'owner@roverhq.ai');
	assert.equal(f.state.triggers.length, 1);
	assert.equal(f.state.triggers[0].getHandlerFunction(), 'retryLeadNotifications_');
	assert.equal(f.state.triggers[0].minutes, 5);
	assert.equal(f.leads().frozenRows, 1);
	assert.equal(f.resources().rows.length, 2);
	assert.equal(
		f.resources().rows[1][2],
		's3://rover-private-resources-613025568726-ap-south-1/comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf'
	);
	const input = lead();
	assert.equal(f.save(input).ok, true);
	assert.deepEqual(f.setup(), first);
	assert.equal(f.state.spreadsheets.size, 1);
	assert.equal(f.state.triggers.length, 1);
	assert.equal(f.leads().rows.length, 2, 'setup must preserve existing submissions');
	assert.equal(f.resources().rows.length, 2, 'setup must not duplicate seeded resources');
	assert.equal(f.state.locks, f.state.releases);
});

test('saving into the deployed legacy sheet appends headers without changing existing leads', () => {
	const f = fixture();
	f.setup();
	const headers = plain(f.leads().rows[0]);
	assert.equal(headers.length, 18);
	assert.deepEqual(headers.slice(16), ['jobTitle', 'company']);
	const legacy = installLegacyLead(f);
	const previousWrites = f.state.writes.length;
	assert.equal(f.save(lead()).ok, true);
	assert.deepEqual(f.leads().rows[0], headers);
	assert.deepEqual(f.leads().rows[1], legacy, 'existing 16-column records must remain untouched');
	assert.equal(f.leads().rows.length, 3);
	assert.equal(f.state.mails.length, 1, 'only the newly submitted lead should notify');
	assert.deepEqual(
		f.state.writes
			.slice(previousWrites)
			.filter((entry) => entry.sheet === 'Leads' && entry.row === 1),
		[
			{
				sheet: 'Leads',
				row: 1,
				column: 17,
				format: '@',
				values: [['jobTitle', 'company']]
			}
		],
		'migration must append exactly the two new labels'
	);
	f.setup();
	f.retry();
	assert.deepEqual(f.leads().rows[1], legacy);
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.state.spreadsheets.size, 1);
	assert.equal(f.state.triggers.length, 1);
	assert.equal(
		f.state.writes
			.slice(previousWrites)
			.filter((entry) => entry.sheet === 'Leads' && entry.row === 1).length,
		1,
		'migration must not repeat after setup or retry'
	);
});

test('legacy queued notifications survive automatic migration and still send their original details', () => {
	const f = fixture();
	f.setup();
	const headers = plain(f.leads().rows[0]);
	const legacy = installLegacyLead(f, { pending: true });
	f.retry();
	assert.deepEqual(f.leads().rows[0], headers);
	assert.deepEqual(f.leads().rows[1].slice(0, 9), legacy.slice(0, 9));
	assert.equal(
		f.leads().rows[1][15],
		legacy[15],
		'the original notification JSON must be preserved'
	);
	assert.equal(f.leads().rows[1][9], 'sent');
	assert.equal(f.leads().rows[1][10], '2');
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.state.mails[0].replyTo, 'legacy@acme.ai');
	assert.ok(f.state.mails[0].body.includes('Name: Legacy Person\n'));
	assert.ok(f.state.mails[0].body.includes('Phone: +12025550123\n'));
	assert.doesNotMatch(f.state.mails[0].body, /undefined|null/);
	f.retry();
	assert.equal(f.state.mails.length, 1, 'a migrated queued lead must notify only once');
});

test('a legacy sheet trimmed to exactly 16 columns expands safely for the new fields', () => {
	const f = fixture();
	f.setup();
	const headers = plain(f.leads().rows[0]);
	const legacy = installLegacyLead(f);
	f.leads().maxColumns = 16;
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.leads().maxColumns, 18);
	assert.deepEqual(f.state.columnInsertions, [{ sheet: 'Leads', position: 16, count: 2 }]);
	assert.deepEqual(f.leads().rows[0], headers);
	assert.deepEqual(f.leads().rows[1], legacy);
	f.setup();
	assert.equal(f.state.columnInsertions.length, 1, 'repeated setup must not insert more columns');
});

test('unknown or partially modified sheet schemas fail without saves, notifications, or migration writes', () => {
	const alterations = [
		(sheet) => {
			sheet.rows[0] = sheet.rows[0].slice(0, 16);
			sheet.rows[0][0] = 'changed-legacy-header';
			sheet.maxColumns = 16;
		},
		(sheet) => {
			sheet.rows[0][0] = 'changed-header';
		},
		(sheet) => {
			sheet.rows[0][16] = 'unexpected';
		},
		(sheet) => {
			sheet.rows[0][18] = 'unexpected-extra-column';
		},
		(sheet) => {
			sheet.rows[0] = sheet.rows[0].slice(0, 17);
		},
		(sheet) => {
			sheet.rows[0] = sheet.rows[0].slice(0, 16);
			sheet.rows[1][16] = 'unrecognized legacy data';
		},
		(sheet) => {
			sheet.rows[1][18] = 'unrecognized extra data';
		}
	];
	for (const alter of alterations) {
		const f = fixture();
		f.setup();
		installLegacyLead(f, { pending: true });
		// Start from the current header schema, then corrupt it deliberately.
		f.leads().rows[0].push('jobTitle', 'company');
		alter(f.leads());
		const beforeRows = structuredClone(f.leads().rows);
		const beforeWrites = f.state.writes.length;
		const beforeProperties = Array.from(f.state.properties.entries());
		const beforeInsertions = plain(f.state.columnInsertions);
		assert.equal(f.save(lead()).ok, false);
		assert.throws(() => f.setup(), /headers|columns|schema/i);
		f.retry();
		assert.deepEqual(f.leads().rows, beforeRows);
		assert.equal(f.state.writes.length, beforeWrites, 'invalid schemas must never be rewritten');
		assert.equal(f.state.mailAttempts.length, 0);
		assert.deepEqual(f.state.columnInsertions, beforeInsertions);
		assert.deepEqual(Array.from(f.state.properties.entries()), beforeProperties);
	}
});

test('notification recipient configuration survives setup and is deduplicated', () => {
	const f = fixture();
	f.state.properties.set(
		'ROVER_NOTIFICATION_EMAILS',
		'Sales@roverhq.ai,sales@roverhq.ai,team@roverhq.ai'
	);
	assert.equal(f.setup().notificationEmails, 'sales@roverhq.ai, team@roverhq.ai');
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.state.mails[0].to, 'sales@roverhq.ai,team@roverhq.ai');
});

test('only doGet and saveLead are publicly callable; setup and helpers stay private', () => {
	const f = fixture();
	const functionNames = Object.keys(f.context).filter(
		(name) => name !== 'Date' && typeof f.context[name] === 'function'
	);
	assert.deepEqual(functionNames.filter((name) => !name.endsWith('_')).sort(), [
		'doGet',
		'saveLead'
	]);
	assert.ok(functionNames.includes('setupLeadCapture_'));
	assert.ok(functionNames.includes('retryLeadNotifications_'));
});

test('accepted lead is saved before mail and returns the registry PDF', () => {
	const f = fixture();
	f.setup();
	const input = lead({
		name: '  Asha   Sharma ',
		jobTitle: '  Security   Lead ',
		company: ' Acme   Security ',
		email: 'ASHA@ACME.CO.IN',
		pageUrl: '  https://www.roverhq.ai/resources/comparison/splunk  '
	});
	const result = f.save(input);
	assert.deepEqual(result, { ok: true, downloadUrl: pdfUrl, duplicate: false });
	const row = f.leads().rows[1];
	assert.equal(row[0], input.requestId);
	assert.equal(row[1], new Date(f.state.now).toISOString());
	assert.equal(
		row[4],
		'https://www.roverhq.ai/resources/comparison/splunk',
		'page metadata must preserve the validated actual source URL'
	);
	assert.equal(row[5], 'Asha Sharma');
	assert.equal(row[6], 'asha@acme.co.in');
	assert.equal(row[16], 'Security Lead');
	assert.equal(row[17], 'Acme Security');
	assert.deepEqual(JSON.parse(row[15]), {
		name: 'Asha Sharma',
		jobTitle: 'Security Lead',
		company: 'Acme Security',
		email: 'asha@acme.co.in',
		phone: '+919876543210'
	});
	assert.equal(row[9], 'sent');
	assert.equal(row[10], '1');
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.state.mails[0].to, 'owner@roverhq.ai');
	assert.equal(f.state.mails[0].replyTo, 'asha@acme.co.in');
	assert.match(f.state.mails[0].body, /Asha Sharma/);
	assert.match(f.state.mails[0].body, /Job title: Security Lead\n/);
	assert.match(f.state.mails[0].body, /Company: Acme Security\n/);
	assert.ok(f.state.mails[0].body.includes(`Page: ${row[4]}\n`));
	assert.match(f.state.mails[0].body, /Rover vs Splunk/);
	assert.match(f.state.mails[0].body, /\+919876543210/);
	assert.match(f.state.mails[0].body, /All leads: https:\/\/docs\.google\.com\/spreadsheets\/d\//);
	assert.equal(f.state.locks, f.state.releases);
});

test('personal, disposable, reserved, and provider-subdomain emails are rejected', () => {
	const f = fixture();
	f.setup();
	for (const email of [
		'lead@gmail.com',
		'lead@GMAIL.COM',
		'lead@department.gmail.com',
		'lead@outlook.com',
		'lead@yahoo.co.in',
		'lead@proton.me',
		'lead@mailinator.com',
		'lead@team.mailinator.com',
		'lead@10minutemail.com',
		'lead@example.com',
		'lead@acme.test'
	]) {
		assertRejected(f, lead({ email }), 'email');
	}
});

test('custom company domains and provider names inside company domains remain accepted', () => {
	const f = fixture();
	f.setup();
	for (const email of [
		'lead@roverhq.ai',
		'lead@acme.co.in',
		'lead@notgmail.com',
		'lead@gmail.acme.ai'
	]) {
		assert.equal(f.save(lead({ email })).ok, true, email);
	}
	assert.equal(f.leads().rows.length, 5);
});

test('malformed email addresses never create a lead', () => {
	const f = fixture();
	f.setup();
	for (const email of [
		'',
		'lead',
		'lead@acme',
		'lead@@acme.ai',
		'.lead@acme.ai',
		'lead.@acme.ai',
		'le..ad@acme.ai',
		'lead name@acme.ai',
		'lead@-acme.ai',
		'lead@acme-.ai',
		'lead@acme..ai',
		'lead@acme.ai\r\nBcc:another@acme.ai',
		`${'x'.repeat(65)}@acme.ai`
	]) {
		assertRejected(f, lead({ email }), 'email');
	}
});

test('invalid names and phone numbers are rejected with field errors', () => {
	const f = fixture();
	f.setup();
	for (const name of ['', 'A', 'x'.repeat(101), 'Asha\u0000Sharma', null]) {
		assertRejected(f, lead({ name }), 'name');
	}
	for (const phone of [
		'',
		'123456',
		'1234567890123456',
		'00000000',
		'+00000000',
		'98abc543210',
		null
	]) {
		assertRejected(f, lead({ phone }), 'phone');
	}
});

test('job title and company are required, normalized, and length limited', () => {
	const f = fixture();
	f.setup();
	for (const [field, limit] of [
		['jobTitle', 120],
		['company', 160]
	]) {
		for (const value of ['', '   ', null, undefined, {}, 'x'.repeat(limit + 1)]) {
			assertRejected(f, lead({ [field]: value }), field);
		}
		for (const control of ['\u0000', '\n', '\r', '\t', '\u001f', '\u007f']) {
			assertRejected(f, lead({ [field]: `Security${control}Team` }), field);
		}
	}
	for (const input of [
		lead({ jobTitle: 'X', company: 'Y' }),
		lead({ jobTitle: 'x'.repeat(120), company: 'y'.repeat(160) })
	]) {
		assert.equal(f.save(input).ok, true, 'valid boundary lengths must remain accepted');
	}
});

test('the actual source URL must be clean, allowed, and match the requested resource path', () => {
	const f = fixture();
	f.setup();
	for (const value of [
		'',
		'   ',
		null,
		undefined,
		'https://evil.invalid/resources/comparison/splunk/',
		'https://roverhq.ai.evil.invalid/resources/comparison/splunk/',
		'http://roverhq.ai/resources/comparison/splunk/',
		'https://user@roverhq.ai/resources/comparison/splunk/',
		'https://roverhq.ai/resources/comparison/splunk/?campaign=test',
		'https://roverhq.ai/resources/comparison/splunk/#download-comparison',
		'https://roverhq.ai/resources/comparison/other/',
		'https://roverhq.ai/resources/comparison/../splunk/',
		'https://roverhq.ai/resources/comparison/%73plunk/',
		'https://roverhq.ai/resources//comparison/splunk/',
		'https://roverhq.ai/resources/comparison/splunk/extra/',
		'https://roverhq.ai/resources/comparison/splunk/\n',
		'http://localhost:0/resources/comparison/splunk/',
		'http://127.0.0.1:65536/resources/comparison/splunk/'
	]) {
		assertRejected(f, lead({ pageUrl: value }));
	}
	for (const value of [
		pageUrl,
		'https://www.roverhq.ai/resources/comparison/splunk/',
		'https://roverhq.ai/resources/comparison/splunk',
		'http://localhost:5173/resources/comparison/splunk/',
		'http://127.0.0.1:5180/resources/comparison/splunk/'
	]) {
		assert.equal(f.save(lead({ pageUrl: value })).ok, true, value);
		assert.equal(f.leads().rows.at(-1)[4], value);
		assert.ok(f.state.mails.at(-1).body.includes(`Page: ${value}\n`));
	}
});

test('honeypots, missing identifiers, invalid payloads, and unknown resources cannot save', () => {
	const f = fixture();
	f.setup();
	for (const input of [
		null,
		[],
		{},
		lead({ website: 'https://spam.invalid' }),
		lead({ requestId: 'not-a-uuid' }),
		lead({ requestId: '' }),
		lead({ resourceId: '../splunk' }),
		lead({ resourceId: 'unconfigured-comparison' })
	]) {
		assertRejected(f, input);
	}
});

test('resource registry rejects external, ambiguous, and traversal PDF links', () => {
	for (const url of [
		'https://evil.invalid/guide.pdf',
		'javascript:alert(1)',
		'https://roverhq.ai/assets/../guide.pdf',
		'https://roverhq.ai/assets/guide.pdf?redirect=https://evil.invalid',
		'https://roverhq.ai/assets/guide.pdf#fragment'
	]) {
		const f = fixture();
		f.setup();
		f.resources().rows[1][2] = url;
		assertRejected(f, lead());
	}
	const f = fixture();
	f.setup();
	f.resources().rows.push([...f.resources().rows[1]]);
	assertRejected(f, lead());
});

test('failed spreadsheet write returns no PDF and sends no notification', () => {
	const f = fixture();
	f.setup();
	f.state.leadWriteFailure = true;
	assertRejected(f, lead());
	assert.equal(f.state.locked, false);
	assert.equal(f.state.locks, f.state.releases);
});

test('missing setup, unavailable locks, or altered headers return failure without sending mail', () => {
	const unconfigured = fixture();
	assert.equal(unconfigured.save(lead()).ok, false);
	assert.equal(unconfigured.state.mailAttempts.length, 0);
	const busy = fixture();
	busy.setup();
	busy.state.lockUnavailable = true;
	assertRejected(busy, lead());
	const changed = fixture();
	changed.setup();
	changed.leads().rows[0][0] = 'changed-header';
	assertRejected(changed, lead());
});

test('email failure preserves saved lead and retry eventually marks notification sent', () => {
	const f = fixture();
	f.setup();
	f.state.mailFailure = true;
	const input = lead();
	assert.equal(f.save(input).downloadUrl, pdfUrl);
	assert.equal(f.leads().rows.length, 2);
	assert.equal(f.leads().rows[1][9], 'pending');
	assert.equal(f.leads().rows[1][10], '1');
	assert.match(f.leads().rows[1][13], /retry/i);
	assert.equal(f.state.mails.length, 0);
	f.retry();
	assert.equal(f.state.mailAttempts.length, 1, 'retry must respect its next-attempt timestamp');
	f.state.mailFailure = false;
	f.state.now += 31 * 60 * 1000;
	f.retry();
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.leads().rows[1][9], 'sent');
	assert.equal(f.leads().rows[1][10], '2');
	assert.equal(f.leads().rows[1][13], '');
	assert.ok(f.leads().rows[1][14]);
	f.retry();
	assert.equal(f.state.mails.length, 1, 'completed notifications must not send again');
});

test('email quota exhaustion keeps a durable pending notification for a later retry', () => {
	const f = fixture();
	f.setup();
	f.state.quota = 0;
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.leads().rows[1][9], 'pending');
	assert.match(f.leads().rows[1][13], /quota/i);
	assert.equal(f.state.mailAttempts.length, 0);
	f.state.quota = 1500;
	f.state.now += 31 * 60 * 1000;
	f.retry();
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.leads().rows[1][9], 'sent');
});

test('retrying an identical request ID creates no second lead or email', () => {
	const f = fixture();
	f.setup();
	const input = lead();
	assert.equal(f.save(input).duplicate, false);
	const duplicate = f.save({
		...input,
		name: '  Asha   Sharma ',
		jobTitle: '  Security   Lead ',
		company: '  Acme   Security ',
		email: 'ASHA@ACME.CO.IN',
		phone: '+919876543210'
	});
	assert.deepEqual(duplicate, { ok: true, downloadUrl: pdfUrl, duplicate: true });
	assert.equal(f.leads().rows.length, 2);
	assert.equal(f.state.mails.length, 1);
});

test('an existing request ID cannot be reused for modified details or another resource', () => {
	const f = fixture();
	f.setup();
	const input = lead();
	assert.equal(f.save(input).ok, true);
	for (const changes of [
		{ name: 'Another Person' },
		{ jobTitle: 'Security Director' },
		{ company: 'Another Company' },
		{ email: 'another@acme.ai' },
		{ phone: '+12025550123' },
		{ pageUrl: 'https://www.roverhq.ai/resources/comparison/splunk/' }
	]) {
		const result = f.save({ ...input, ...changes });
		assert.equal(result.ok, false);
		assert.equal(result.downloadUrl, undefined);
	}
	f.resources().rows.push([
		'rover-vs-other',
		'Rover vs Other',
		'https://roverhq.ai/assets/other.pdf',
		'https://roverhq.ai/resources/comparison/other/'
	]);
	assert.equal(
		f.save({
			...input,
			resourceId: 'rover-vs-other',
			pageUrl: 'https://roverhq.ai/resources/comparison/other/'
		}).ok,
		false
	);
	assert.equal(f.leads().rows.length, 2);
	assert.equal(f.state.mails.length, 1);
});

test('spreadsheet formula inputs are escaped and phone country codes/zeroes stay text', () => {
	const f = fixture();
	f.setup();
	for (const [name, phone] of [
		['=IMPORTXML("https://evil.invalid", "//x")', '+12025550123'],
		['+SUM(1,1)', '0123456789'],
		['-SUM(1,1)', '0987654321'],
		['@SUM(1,1)', '+919876543210']
	]) {
		assert.equal(f.save(lead({ name, phone })).ok, true);
		const write = f.state.writes.findLast(
			(entry) => entry.sheet === 'Leads' && entry.column === 1 && entry.row >= 2
		);
		assert.equal(write.format, '@');
		assert.equal(write.values[0][5], `'${name}`);
		assert.equal(write.values[0][7], phone.startsWith('+') ? `'${phone}` : phone);
	}
	for (const value of ['=SUM(1,1)', '+SUM(1,1)', '-SUM(1,1)', '@SUM(1,1)']) {
		assert.equal(f.save(lead({ jobTitle: value, company: value })).ok, true);
		const write = f.state.writes.findLast(
			(entry) => entry.sheet === 'Leads' && entry.column === 1 && entry.row >= 2
		);
		assert.equal(write.format, '@');
		assert.equal(write.values[0][16], `'${value}`);
		assert.equal(write.values[0][17], `'${value}`);
		assert.ok(f.state.mails.at(-1).body.includes(`Job title: ${value}\n`));
		assert.ok(f.state.mails.at(-1).body.includes(`Company: ${value}\n`));
	}
});

test('alerts preserve original details whether Sheets retains or strips apostrophe escapes', () => {
	for (const stripLeadingQuote of [false, true]) {
		const f = fixture();
		f.state.stripLeadingQuote = stripLeadingQuote;
		f.setup();
		for (const name of ["'Asha Sharma", '=SUM(1,1)']) {
			const input = lead({
				name,
				jobTitle: name,
				company: name,
				email: "'=alice@acme.ai",
				phone: '+12025550123'
			});
			assert.equal(f.save(input).ok, true);
			const mail = f.state.mails.at(-1);
			assert.equal(mail.replyTo, input.email);
			assert.ok(mail.body.includes(`Name: ${name}\n`));
			assert.ok(mail.body.includes(`Job title: ${name}\n`));
			assert.ok(mail.body.includes(`Company: ${name}\n`));
			assert.ok(mail.body.includes(`Company email: ${input.email}\n`));
			assert.ok(mail.body.includes(`Phone: ${input.phone}\n`));
			assert.ok(
				mail.body.includes('All leads: https://docs.google.com/spreadsheets/d/private-sheet-1/edit')
			);
		}
	}
});

test('bridge rejects origins outside Rover/local development and invalid channel IDs', () => {
	const f = fixture();
	for (const siteOrigin of [
		'https://evil.invalid',
		'https://roverhq.ai.evil.invalid',
		'https://roverhq.ai/path',
		'http://roverhq.ai',
		'null',
		'http://localhost:0',
		'http://localhost:65536'
	]) {
		const output = f.context.doGet({ parameter: { siteOrigin, channel: randomUUID() } });
		assert.equal(output.frameMode, undefined);
		assert.doesNotMatch(output.html, /google\.script\.run/);
	}
	for (const siteOrigin of [
		'https://roverhq.ai',
		'https://www.roverhq.ai',
		'http://localhost:5173',
		'http://127.0.0.1:5180'
	]) {
		const output = f.context.doGet({ parameter: { siteOrigin, channel: randomUUID() } });
		assert.equal(output.frameMode, 'ALLOWALL');
		assert.match(output.html, /google\.script\.run/);
	}
	assert.equal(
		f.context.doGet({ parameter: { siteOrigin: 'https://roverhq.ai', channel: 'bad-id' } })
			.frameMode,
		undefined
	);
});

test('bridge accepts only the configured top window and correlates result to request ID', () => {
	const f = fixture();
	const channel = randomUUID();
	const output = f.context.doGet({ parameter: { siteOrigin: 'https://roverhq.ai', channel } });
	const script = output.html.match(/<script>([\s\S]*?)<\/script>/)[1];
	const sent = [];
	const calls = [];
	const top = { postMessage: (message, origin) => sent.push({ message: plain(message), origin }) };
	let receive;
	let success;
	let failure;
	const runner = {
		withSuccessHandler(handler) {
			success = handler;
			return this;
		},
		withFailureHandler(handler) {
			failure = handler;
			return this;
		},
		saveLead(input) {
			calls.push(plain(input));
		}
	};
	vm.runInNewContext(script, {
		window: { top, addEventListener: (_, handler) => (receive = handler) },
		google: { script: { run: runner } },
		setInterval: () => 1,
		clearInterval() {},
		setTimeout() {}
	});
	assert.equal(sent[0].message.type, 'ready');
	assert.equal(sent[0].message.formVersion, 3);
	assert.equal(sent[0].message.channel, channel);
	assert.equal(sent[0].origin, 'https://roverhq.ai');
	const input = lead();
	const data = {
		namespace: 'rover-lead-capture',
		channel,
		type: 'submit',
		requestId: input.requestId,
		payload: input
	};
	for (const event of [
		{ source: {}, origin: 'https://roverhq.ai', data },
		{ source: top, origin: 'https://evil.invalid', data },
		{ source: top, origin: 'https://roverhq.ai', data: { ...data, channel: randomUUID() } },
		{ source: top, origin: 'https://roverhq.ai', data: { ...data, namespace: 'unrelated' } }
	])
		receive(event);
	assert.equal(calls.length, 0);
	receive({ source: top, origin: 'https://roverhq.ai', data });
	assert.equal(calls.length, 1);
	assert.equal(calls[0].requestId, input.requestId);
	assert.equal(calls[0].resourceId, 'rover-vs-splunk');
	assert.equal(calls[0].jobTitle, input.jobTitle);
	assert.equal(calls[0].company, input.company);
	assert.equal(calls[0].pageUrl, input.pageUrl);
	receive({ source: top, origin: 'https://roverhq.ai', data });
	assert.equal(calls.length, 1, 'busy bridge must not start another server call');
	success({ ok: true, downloadUrl: pdfUrl });
	assert.equal(sent.at(-1).message.type, 'result');
	assert.equal(sent.at(-1).message.formVersion, 3);
	assert.equal(sent.at(-1).message.requestId, input.requestId);
	assert.equal(sent.at(-1).message.result.downloadUrl, pdfUrl);
	assert.equal(sent.at(-1).origin, 'https://roverhq.ai');
	receive({ source: top, origin: 'https://roverhq.ai', data });
	failure(new Error('Sensitive internal error'));
	assert.equal(sent.at(-1).message.type, 'failure');
	assert.equal(sent.at(-1).message.formVersion, 3);
	assert.equal(sent.at(-1).message.requestId, input.requestId);
	assert.doesNotMatch(JSON.stringify(sent.at(-1)), /Sensitive internal error/);
});

test('signer failure preserves the lead and retry signs without saving a second row', () => {
	const f = fixture();
	f.setup();
	f.state.signerFailure = true;
	const input = lead();
	const result = f.save(input);
	assert.equal(result.ok, false);
	assert.match(result.error, /details were saved/);
	assert.equal(result.downloadUrl, undefined);
	assert.equal(f.leads().rows.length, 2);
	f.state.signerFailure = false;
	assert.deepEqual(f.save(input), { ok: true, downloadUrl: pdfUrl, duplicate: true });
	assert.equal(f.leads().rows.length, 2);
	assert.equal(f.state.signerCalls.length, 2);
});

test('rejected submissions never call the S3 signer', () => {
	const f = fixture();
	f.setup();
	assert.equal(f.save(lead({ email: 'user@gmail.com' })).ok, false);
	f.state.leadWriteFailure = true;
	assert.equal(f.save(lead()).ok, false);
	assert.equal(f.state.signerCalls.length, 0);
});

test('legacy Splunk registry resolves to private S3 without returning the public PDF URL', () => {
	const f = fixture();
	f.setup();
	f.resources().rows[1][2] =
		'https://roverhq.ai/assets/comparisons/splunk/rover-vs-splunk-full-comparison-guide.pdf';
	assert.equal(f.save(lead()).downloadUrl, pdfUrl);
});

test('CC recipients are normalized and deduplicated without changing the primary recipient', () => {
	const f = fixture();
	f.setup();
	f.state.properties.set(
		'ROVER_NOTIFICATION_CC_EMAILS',
		'Team@roverhq.ai,team@roverhq.ai,owner@roverhq.ai'
	);
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.state.mails[0].to, 'owner@roverhq.ai');
	assert.equal(f.state.mails[0].cc, 'team@roverhq.ai');
	f.setup();
	assert.equal(
		f.state.properties.get('ROVER_NOTIFICATION_CC_EMAILS'),
		'Team@roverhq.ai,team@roverhq.ai,owner@roverhq.ai'
	);
});

test('CC recipients count toward quota and pending notifications retry with CC', () => {
	const f = fixture();
	f.setup();
	f.state.properties.set('ROVER_NOTIFICATION_CC_EMAILS', 'team@roverhq.ai');
	f.state.quota = 1;
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.state.mails.length, 0);
	assert.equal(f.leads().rows[1][9], 'pending');
	f.state.quota = 2;
	f.state.now += 31 * 60 * 1000;
	f.retry();
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.state.mails[0].cc, 'team@roverhq.ai');
	assert.equal(f.leads().rows[1][9], 'sent');
});

test('blank CC disables the default and malformed CC never sends mail', () => {
	const f = fixture();
	f.setup();
	f.state.properties.set('ROVER_NOTIFICATION_CC_EMAILS', '');
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.state.mails[0].cc, undefined);
	f.state.properties.set('ROVER_NOTIFICATION_CC_EMAILS', 'invalid-address');
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.state.mails.length, 1);
	assert.equal(f.leads().rows[2][9], 'pending');
});

test('default notifications CC suyog without requiring another setup run', () => {
	const f = fixture();
	f.setup();
	assert.equal(f.state.properties.has('ROVER_NOTIFICATION_CC_EMAILS'), false);
	assert.equal(f.save(lead()).ok, true);
	assert.equal(f.state.mails[0].to, 'owner@roverhq.ai');
	assert.equal(f.state.mails[0].cc, 'suyog@roverhq.ai');
});
