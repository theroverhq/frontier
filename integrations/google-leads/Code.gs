/**
 * Rover PDF lead capture for a static website.
 *
 * Paste this file into an Apps Script project owned by your Google Workspace
 * account. Select saveLead and click Run once in the editor, then deploy as a web app that executes as
 * you and allows Anyone. The generated spreadsheet stays private.
 *
 * Only doGet and saveLead are callable by web visitors. All setup, notification,
 * and storage helpers end in an underscore to keep them private to the script.
 */

// Optional: comma-separated sales inboxes. Empty defaults to the script owner.
const ROVER_NOTIFICATION_EMAILS = '';
// Optional CC inboxes; Script Properties can override this default (blank disables CC).
const ROVER_NOTIFICATION_CC_EMAILS = 'suyog@roverhq.ai';

const ROVER_LEAD_SETTINGS_ = Object.freeze({
	spreadsheetProperty: 'ROVER_LEAD_SPREADSHEET_ID',
	notificationProperty: 'ROVER_NOTIFICATION_EMAILS',
	notificationCcProperty: 'ROVER_NOTIFICATION_CC_EMAILS',
	leadsSheetName: 'Leads',
	resourcesSheetName: 'Resources',
	namespace: 'rover-lead-capture',
	formVersion: 3,
	notificationBatchSize: 20,
	notificationLeaseMs: 15 * 60 * 1000,
	notificationRetryMs: 30 * 60 * 1000
});

const ROVER_LEAD_HEADERS_ = Object.freeze([
	'requestId',
	'createdAt',
	'resourceId',
	'resourceTitle',
	'pageUrl',
	'name',
	'email',
	'phone',
	'payloadHash',
	'notificationStatus',
	'notificationAttempts',
	'notificationUpdatedAt',
	'notificationNextAttemptAt',
	'notificationError',
	'notifiedAt',
	'notificationPayload',
	'jobTitle',
	'company'
]);

const ROVER_RESOURCE_HEADERS_ = Object.freeze(['resourceId', 'title', 'pdfUrl', 'pageUrl']);

const ROVER_INITIAL_RESOURCE_ = Object.freeze({
	resourceId: 'rover-vs-splunk',
	title: 'Rover vs Splunk Enterprise Security',
	pdfUrl:
		's3://rover-private-resources-613025568726-ap-south-1/comparisons/splunk/Rover-vs-Splunk-Battlecard.pdf',
	pageUrl: 'https://roverhq.ai/resources/comparisons/splunk/'
});

// Initial migration seeds only. Runtime approval comes from the private Resources sheet.
const ROVER_BOOTSTRAP_RESOURCES_ = Object.freeze({
	'rover-vs-splunk': ROVER_INITIAL_RESOURCE_,
	'rover-vs-microsoft-sentinel': Object.freeze({
		resourceId: 'rover-vs-microsoft-sentinel',
		title: 'Rover vs Microsoft Sentinel',
		pdfUrl:
			's3://rover-private-resources-613025568726-ap-south-1/comparisons/microsoft-sentinel/Rover-vs-Microsoft-Sentinel-Battlecard.pdf',
		pageUrl: 'https://roverhq.ai/resources/comparisons/microsoft-sentinel/'
	})
});

// Domain filtering is a policy check, not proof of mailbox ownership or company
// employment. Keep this curated list current as new providers are encountered.
// Custom company domains using Google/Microsoft/Zoho mail are still accepted.
const ROVER_BLOCKED_EMAIL_DOMAINS_ = Object.freeze([
	'gmail.com',
	'googlemail.com',
	'outlook.com',
	'hotmail.com',
	'hotmail.co.uk',
	'hotmail.fr',
	'hotmail.de',
	'hotmail.it',
	'hotmail.es',
	'live.com',
	'live.co.uk',
	'live.in',
	'live.fr',
	'live.de',
	'msn.com',
	'yahoo.com',
	'yahoo.co.uk',
	'yahoo.co.in',
	'yahoo.in',
	'yahoo.fr',
	'yahoo.de',
	'yahoo.it',
	'yahoo.es',
	'yahoo.ca',
	'yahoo.com.au',
	'ymail.com',
	'rocketmail.com',
	'aol.com',
	'aim.com',
	'icloud.com',
	'me.com',
	'mac.com',
	'proton.me',
	'protonmail.com',
	'pm.me',
	'tuta.com',
	'tutanota.com',
	'tutanota.de',
	'tutamail.com',
	'tuta.io',
	'keemail.me',
	'fastmail.com',
	'fastmail.fm',
	'hey.com',
	'mail.com',
	'email.com',
	'gmx.com',
	'gmx.net',
	'gmx.de',
	'zoho.com',
	'zohomail.com',
	'yandex.com',
	'yandex.ru',
	'mail.ru',
	'inbox.ru',
	'list.ru',
	'bk.ru',
	'qq.com',
	'163.com',
	'126.com',
	'rediffmail.com',
	'web.de',
	'mailinator.com',
	'mailinator.net',
	'guerrillamail.com',
	'guerrillamail.net',
	'guerrillamail.org',
	'guerrillamail.biz',
	'guerrillamail.de',
	'guerrillamailblock.com',
	'grr.la',
	'sharklasers.com',
	'spam4.me',
	'tempmail.com',
	'tempmail.net',
	'tempmail.org',
	'temp-mail.org',
	'temp-mail.io',
	'10minutemail.com',
	'10minutemail.net',
	'10minemail.com',
	'yopmail.com',
	'yopmail.fr',
	'yopmail.net',
	'getnada.com',
	'dispostable.com',
	'trashmail.com',
	'trashmail.net',
	'maildrop.cc',
	'dropmail.me',
	'mohmal.com',
	'throwawaymail.com',
	'fakeinbox.com',
	'emailondeck.com',
	'minuteinbox.com',
	'example.com',
	'example.org',
	'example.net'
]);

/** Called by the owner-only editor entry in saveLead. Existing leads are preserved. */
function setupLeadCapture_() {
	return withLeadLock_(function () {
		const properties = PropertiesService.getScriptProperties();
		let spreadsheetId = properties.getProperty(ROVER_LEAD_SETTINGS_.spreadsheetProperty);
		let spreadsheet;

		if (spreadsheetId) {
			spreadsheet = SpreadsheetApp.openById(spreadsheetId);
		} else {
			spreadsheet = SpreadsheetApp.create('Rover resource leads');
			spreadsheetId = spreadsheet.getId();
			properties.setProperty(ROVER_LEAD_SETTINGS_.spreadsheetProperty, spreadsheetId);
		}

		let leads = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.leadsSheetName);
		if (!leads) {
			const firstSheet = spreadsheet.getSheets()[0];
			if (firstSheet && firstSheet.getLastRow() === 0) {
				leads = firstSheet.setName(ROVER_LEAD_SETTINGS_.leadsSheetName);
			} else {
				leads = spreadsheet.insertSheet(ROVER_LEAD_SETTINGS_.leadsSheetName);
			}
		}
		initializeLeadHeaders_(leads);

		let resources = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.resourcesSheetName);
		if (!resources) {
			resources = spreadsheet.insertSheet(ROVER_LEAD_SETTINGS_.resourcesSheetName);
		}
		initializeHeaders_(resources, ROVER_RESOURCE_HEADERS_);
		Object.keys(ROVER_BOOTSTRAP_RESOURCES_).forEach(function (resourceId) {
			const resource = ROVER_BOOTSTRAP_RESOURCES_[resourceId];
			if (!findRequestRow_(resources, resourceId)) {
				writeTextRow_(resources, resources.getLastRow() + 1, [
					resource.resourceId,
					resource.title,
					resource.pdfUrl,
					resource.pageUrl
				]);
			}
		});

		const recipients = notificationRecipients_(
			ROVER_NOTIFICATION_EMAILS ||
				properties.getProperty(ROVER_LEAD_SETTINGS_.notificationProperty) ||
				Session.getEffectiveUser().getEmail()
		);
		properties.setProperty(ROVER_LEAD_SETTINGS_.notificationProperty, recipients.join(','));

		const hasRetryTrigger = ScriptApp.getProjectTriggers().some(function (trigger) {
			return trigger.getHandlerFunction() === 'retryLeadNotifications_';
		});
		if (!hasRetryTrigger) {
			ScriptApp.newTrigger('retryLeadNotifications_').timeBased().everyMinutes(5).create();
		}
		SpreadsheetApp.flush();

		const result = {
			spreadsheetUrl: spreadsheet.getUrl(),
			notificationEmails: recipients.join(', '),
			retryTrigger: 'Every 5 minutes'
		};
		// Setup logs contain configuration only, never visitor submissions.
		console.log(JSON.stringify(result));
		return result;
	});
}

/** Load an invisible HTML bridge for an explicitly allowed website origin. */
function doGet(event) {
	const parameters = event && event.parameter ? event.parameter : {};
	const siteOrigin = allowedSiteOrigin_(parameters.siteOrigin);
	const channel = normalizedRequestId_(parameters.channel);

	if (!siteOrigin || !channel) {
		return HtmlService.createHtmlOutput(
			'<!doctype html><html><head><title>Rover lead capture</title></head>' +
				'<body>Invalid form configuration.</body></html>'
		);
	}

	const configuration = JSON.stringify({
		siteOrigin: siteOrigin,
		channel: channel,
		namespace: ROVER_LEAD_SETTINGS_.namespace,
		formVersion: ROVER_LEAD_SETTINGS_.formVersion
	}).replace(/</g, '\\u003c');

	const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Rover lead capture</title></head>
<body><script>
'use strict';
const configuration = ${configuration};
let busy = false;
function send(message) {
  window.top.postMessage(Object.assign({
    namespace: configuration.namespace,
    channel: configuration.channel,
    formVersion: configuration.formVersion
  }, message), configuration.siteOrigin);
}
window.addEventListener('message', function (event) {
  if (event.source !== window.top || event.origin !== configuration.siteOrigin) return;
  const message = event.data;
  if (!message || typeof message !== 'object' ||
      message.namespace !== configuration.namespace ||
      message.channel !== configuration.channel || message.type !== 'submit') return;
  if (typeof message.requestId !== 'string' || !message.payload ||
      typeof message.payload !== 'object' || Array.isArray(message.payload)) return;
  const requestId = message.requestId;
  if (busy) {
    send({ type: 'result', requestId: requestId, result: {
      ok: false, error: 'A submission is already in progress. Please wait.'
    }});
    return;
  }
  busy = true;
  clearInterval(readyTimer);
  const payload = message.payload;
  google.script.run
    .withSuccessHandler(function (result) {
      busy = false;
      send({ type: 'result', requestId: requestId, result: result });
    })
    .withFailureHandler(function () {
      busy = false;
      send({ type: 'failure', requestId: requestId,
        error: 'We could not save your details. Please try again.' });
    })
    .saveLead({
      requestId: requestId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      jobTitle: payload.jobTitle,
      company: payload.company,
      website: payload.website,
      resourceId: payload.resourceId,
      pageUrl: payload.pageUrl
    });
});
send({ type: 'ready' });
const readyTimer = setInterval(function () { send({ type: 'ready' }); }, 500);
setTimeout(function () { clearInterval(readyTimer); }, 30000);
</script></body></html>`;

	return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
		HtmlService.XFrameOptionsMode.ALLOWALL
	);
}

/** Owner-only editor diagnostic; never saves a lead or calls the signer. */
function checkSentinelResource() {
	const activeEmail = Session.getActiveUser().getEmail();
	if (!activeEmail || activeEmail !== Session.getEffectiveUser().getEmail()) {
		throw new Error('Run this check from the Apps Script editor as the owner.');
	}
	const spreadsheetId = PropertiesService.getScriptProperties().getProperty(ROVER_LEAD_SETTINGS_.spreadsheetProperty);
	if (!spreadsheetId) throw new Error('The lead spreadsheet is not configured.');
	console.log('Configured Sheet: https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit');
	const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
	const sheet = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.resourcesSheetName);
	if (!sheet) throw new Error('The configured Sheet has no Resources tab.');
	const rows = sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), 4).getValues();
	const matchingRows = rows.filter(function (row) {
		return String(row[0]).indexOf('microsoft-sentinel') !== -1;
	});
	console.log('ROVER_SENTINEL_CHECK ' + JSON.stringify({ headers: rows[0], matchingRows: matchingRows }));
	const resource = approvedResource_(spreadsheet, 'rover-vs-microsoft-sentinel');
	console.log('ROVER_SENTINEL_CHECK ' + JSON.stringify({ approved: !!resource, pageUrl: resource ? resource.pageUrl : null }));
}

/** Validate and durably save a submission before disclosing its approved PDF. */
function saveLead(input) {
	// The editor hides function names ending in _. Running saveLead with no
	// arguments provides setup access only to the signed-in deploying owner.
	if (input === undefined) {
		const activeEmail = Session.getActiveUser().getEmail();
		const ownerEmail = Session.getEffectiveUser().getEmail();
		if (!activeEmail || activeEmail !== ownerEmail) {
			throw new Error('Run setup from the Apps Script editor using the owning Workspace account.');
		}
		return setupLeadCapture_();
	}

	const validation = validateLead_(input);
	if (!validation.ok) return validation;

	const lead = validation.lead;
	let saved;
	try {
		saved = withLeadLock_(function () {
			const spreadsheet = configuredSpreadsheet_();
			const sheet = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.leadsSheetName);
			assertHeaders_(sheet, ROVER_LEAD_HEADERS_);
			const resource = approvedResource_(spreadsheet, lead.resourceId);
			if (!resource) {
				return { ok: false, error: 'This comparison is not available.' };
			}
			if (!matchesResourcePage_(lead.pageUrl, resource.pageUrl)) {
				return { ok: false, error: 'Please reload the page and try again.' };
			}

			const fingerprint = leadFingerprint_(lead);
			const existingRow = findRequestRow_(sheet, lead.requestId);
			if (existingRow) {
				const existing = sheet
					.getRange(existingRow, 1, 1, ROVER_LEAD_HEADERS_.length)
					.getValues()[0];
				if (existing[8] !== fingerprint) {
					return {
						ok: false,
						error: 'Your details changed. Please submit the form again.'
					};
				}
				return {
					ok: true,
					resource: resource,
					duplicate: true
				};
			}

			const timestamp = new Date().toISOString();
			writeTextRow_(sheet, sheet.getLastRow() + 1, [
				lead.requestId,
				timestamp,
				resource.resourceId,
				resource.title,
				lead.pageUrl,
				lead.name,
				lead.email,
				lead.phone,
				fingerprint,
				'pending',
				'0',
				timestamp,
				timestamp,
				'',
				'',
				JSON.stringify({
					name: lead.name,
					email: lead.email,
					phone: lead.phone,
					jobTitle: lead.jobTitle,
					company: lead.company
				}),
				lead.jobTitle,
				lead.company
			]);
			SpreadsheetApp.flush();
			return { ok: true, resource: resource, duplicate: false };
		});
	} catch (error) {
		return {
			ok: false,
			error: 'We could not save your details. Please try again.'
		};
	}

	if (saved.ok) {
		// A failed email must never undo a saved lead or prevent the PDF opening.
		// The durable pending row is also retried by the five-minute trigger.
		try {
			notifyLead_(lead.requestId);
		} catch (error) {
			// Leave its persisted pending/sending state for the retry trigger.
		}
	}
	if (!saved.ok) return saved;
	try {
		return {
			ok: true,
			downloadUrl: signedResourceDownload_(saved.resource),
			duplicate: saved.duplicate
		};
	} catch (error) {
		return {
			ok: false,
			error:
				'Your details were saved, but we could not prepare the PDF. Please submit again to retry.'
		};
	}
}

/** Called only after a confirmed save; the shared secret never reaches the browser. */
function signedResourceDownload_(resource) {
	// Editor diagnostics can pass an ID; web submissions pass the already approved row.
	if (typeof resource === 'string')
		resource = approvedResource_(configuredSpreadsheet_(), resource);
	if (!resource || !resource.pdfKey) throw downloadDiagnostic_('unknown_resource', {});
	const properties = PropertiesService.getScriptProperties();
	const endpoint = (properties.getProperty('ROVER_DOWNLOAD_SIGNER_URL') || '').trim();
	const secret = (properties.getProperty('ROVER_DOWNLOAD_SIGNER_SECRET') || '').trim();
	const endpointValid = /^https:\/\/[a-z0-9]+\.lambda-url\.ap-south-1\.on\.aws\/$/.test(endpoint);
	if (!endpointValid || !secret) {
		throw downloadDiagnostic_('configuration', {
			endpointValid: endpointValid,
			secretPresent: Boolean(secret)
		});
	}
	let response;
	try {
		response = UrlFetchApp.fetch(endpoint, {
			method: 'post',
			contentType: 'application/json',
			headers: { Authorization: 'Bearer ' + secret },
			payload: JSON.stringify({ resourceId: resource.resourceId, pdfKey: resource.pdfKey }),
			muteHttpExceptions: true,
			followRedirects: false
		});
	} catch (error) {
		// Classify locally; never log Google's raw error, request headers, or body.
		const message = String((error && error.message) || '');
		const reason = /permission|authorization|authorisation|scope/i.test(message)
			? 'authorization'
			: /timed? ?out|timeout/i.test(message)
				? 'timeout'
				: /dns|resolve|address unavailable/i.test(message)
					? 'network'
					: 'unknown';
		throw downloadDiagnostic_('fetch_failed', { reason: reason });
	}
	const status = response.getResponseCode();
	if (status !== 200) throw downloadDiagnostic_('signer_http', { status: status });
	let result;
	try {
		result = JSON.parse(response.getContentText());
	} catch (error) {
		throw downloadDiagnostic_('invalid_json', {});
	}
	const prefix =
		resource.pdfUrl.replace(
			's3://rover-private-resources-613025568726-ap-south-1/',
			'https://rover-private-resources-613025568726-ap-south-1.s3.ap-south-1.amazonaws.com/'
		) + '?';
	if (
		!result ||
		typeof result.downloadUrl !== 'string' ||
		result.downloadUrl.indexOf(prefix) !== 0
	) {
		throw downloadDiagnostic_('unexpected_url', {});
	}
	return result.downloadUrl;
}

/** Fixed diagnostic codes only: no secret, endpoint, signed URL, or lead data. */
function downloadDiagnostic_(code, details) {
	console.log('ROVER_PDF_DIAGNOSTIC ' + JSON.stringify(Object.assign({ code: code }, details)));
	return new Error('PDF preparation failed: ' + code);
}

/** Private time-trigger handler; retries pending notifications in small batches. */
function retryLeadNotifications_() {
	let requestIds;
	try {
		requestIds = withLeadLock_(function () {
			const spreadsheet = configuredSpreadsheet_();
			const sheet = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.leadsSheetName);
			assertHeaders_(sheet, ROVER_LEAD_HEADERS_);
			if (sheet.getLastRow() < 2) return [];
			const rows = sheet
				.getRange(2, 1, sheet.getLastRow() - 1, ROVER_LEAD_HEADERS_.length)
				.getValues();
			const now = Date.now();
			return rows
				.filter(function (row) {
					return notificationIsDue_(row, now);
				})
				.slice(0, ROVER_LEAD_SETTINGS_.notificationBatchSize)
				.map(function (row) {
					return String(row[0]);
				});
		});
	} catch (error) {
		return;
	}

	requestIds.forEach(function (requestId) {
		try {
			notifyLead_(requestId);
		} catch (error) {
			// Keep unsent records available for the next scheduled retry.
		}
	});
}

function validateLead_(input) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return { ok: false, error: 'Please check your details and try again.' };
	}
	if (typeof input.website === 'string' && input.website.trim()) {
		return { ok: false, error: 'We could not accept this submission.' };
	}

	const requestId = normalizedRequestId_(input.requestId);
	const resourceId = typeof input.resourceId === 'string' ? input.resourceId.trim() : '';
	if (!requestId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resourceId) || resourceId.length > 80) {
		return { ok: false, error: 'Please reload the page and try again.' };
	}

	const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
	const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
	const rawPhone = typeof input.phone === 'string' ? input.phone.trim() : '';
	const phone = rawPhone.replace(/[\s().-]/g, '');
	const rawJobTitle = typeof input.jobTitle === 'string' ? input.jobTitle : '';
	const jobTitle = rawJobTitle.trim().replace(/\s+/g, ' ');
	const rawCompany = typeof input.company === 'string' ? input.company : '';
	const company = rawCompany.trim().replace(/\s+/g, ' ');
	const pageUrl = normalizedPageUrl_(input.pageUrl);
	const fieldErrors = {};

	if (name.length < 2 || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) {
		fieldErrors.name = 'Enter your name (2–100 characters).';
	}
	if (!validEmailAddress_(email)) {
		fieldErrors.email = 'Enter a valid company email address.';
	} else if (!isCompanyEmail_(email)) {
		fieldErrors.email = 'Use your company email, not a personal or temporary address.';
	}
	if (rawPhone.length > 40 || !/^\+?[0-9]{7,15}$/.test(phone) || /^\+?0+$/.test(phone)) {
		fieldErrors.phone = 'Enter a valid phone number, including country code.';
	}
	if (!jobTitle || jobTitle.length > 120 || /[\u0000-\u001f\u007f]/.test(rawJobTitle)) {
		fieldErrors.jobTitle = 'Enter your job title (1–120 characters).';
	}
	if (!company || company.length > 160 || /[\u0000-\u001f\u007f]/.test(rawCompany)) {
		fieldErrors.company = 'Enter your company (1–160 characters).';
	}

	if (Object.keys(fieldErrors).length) {
		return {
			ok: false,
			error: 'Please check the highlighted fields.',
			fieldErrors: fieldErrors
		};
	}
	if (!pageUrl) {
		return { ok: false, error: 'Please reload the page and try again.' };
	}

	return {
		ok: true,
		lead: {
			requestId: requestId,
			resourceId: resourceId,
			name: name,
			email: email,
			phone: phone,
			jobTitle: jobTitle,
			company: company,
			pageUrl: pageUrl
		}
	};
}

function validEmailAddress_(email) {
	if (typeof email !== 'string' || email.length > 254) return false;
	const parts = email.split('@');
	if (parts.length !== 2) return false;
	const local = parts[0];
	const domain = parts[1];
	if (
		!local ||
		local.length > 64 ||
		!/^[a-z0-9.!#$%&'*+\-/=?^_`{|}~]+$/i.test(local) ||
		local.startsWith('.') ||
		local.endsWith('.') ||
		local.indexOf('..') !== -1 ||
		domain.length > 253
	) {
		return false;
	}
	const labels = domain.split('.');
	return (
		labels.length >= 2 &&
		/^[a-z]{2,63}$/i.test(labels[labels.length - 1]) &&
		labels.every(function (label) {
			return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label);
		})
	);
}

function isCompanyEmail_(email) {
	const domain = email.split('@')[1];
	if (/\.(invalid|example|test|localhost)$/.test(domain)) return false;
	return !ROVER_BLOCKED_EMAIL_DOMAINS_.some(function (blocked) {
		return domain === blocked || domain.endsWith('.' + blocked);
	});
}

function normalizedRequestId_(value) {
	if (typeof value !== 'string') return '';
	const normalized = value.trim().toLowerCase();
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
		normalized
	)
		? normalized
		: '';
}

function allowedSiteOrigin_(value) {
	if (typeof value !== 'string') return '';
	if (value === 'https://roverhq.ai' || value === 'https://www.roverhq.ai') {
		return value;
	}
	const match = value.match(/^http:\/\/(localhost|127\.0\.0\.1)(?::([0-9]{1,5}))?$/);
	if (!match || (match[2] && (Number(match[2]) < 1 || Number(match[2]) > 65535))) {
		return '';
	}
	return value;
}

function leadFingerprint_(lead) {
	const serialized = JSON.stringify([
		lead.resourceId,
		lead.name,
		lead.email,
		lead.phone,
		lead.jobTitle,
		lead.company,
		lead.pageUrl
	]);
	return Utilities.computeDigest(
		Utilities.DigestAlgorithm.SHA_256,
		serialized,
		Utilities.Charset.UTF_8
	)
		.map(function (byte) {
			return ('0' + ((byte + 256) % 256).toString(16)).slice(-2);
		})
		.join('');
}

function configuredSpreadsheet_() {
	const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
		ROVER_LEAD_SETTINGS_.spreadsheetProperty
	);
	if (!spreadsheetId)
		throw new Error('Select saveLead and click Run in the editor before deploying.');
	const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
	ensureLeadHeaders_(spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.leadsSheetName));
	return spreadsheet;
}

function initializeLeadHeaders_(sheet) {
	if (sheet.getLastRow() === 0) {
		initializeHeaders_(sheet, ROVER_LEAD_HEADERS_);
	} else {
		ensureLeadHeaders_(sheet);
	}
}

function ensureLeadHeaders_(sheet) {
	if (!sheet || sheet.getLastRow() < 1) {
		throw new Error('Lead capture sheet is not configured.');
	}
	const legacyLength = 16;
	const lastColumn = sheet.getLastColumn();
	if (lastColumn !== legacyLength && lastColumn !== ROVER_LEAD_HEADERS_.length) {
		throw new Error('Sheet column headers were changed. Restore the original headers.');
	}
	const maxColumns = sheet.getMaxColumns();
	const actual = sheet
		.getRange(1, 1, 1, Math.min(maxColumns, ROVER_LEAD_HEADERS_.length))
		.getValues()[0];
	while (actual.length < ROVER_LEAD_HEADERS_.length) actual.push('');
	if (
		!ROVER_LEAD_HEADERS_.slice(0, legacyLength).every(function (header, index) {
			return actual[index] === header;
		})
	) {
		throw new Error('Sheet column headers were changed. Restore the original headers.');
	}
	const appendedHeaders = ROVER_LEAD_HEADERS_.slice(legacyLength);
	if (
		lastColumn === ROVER_LEAD_HEADERS_.length &&
		appendedHeaders.every(function (header, index) {
			return actual[legacyLength + index] === header;
		})
	) {
		return;
	}
	if (
		lastColumn !== legacyLength ||
		!appendedHeaders.every(function (header, index) {
			return actual[legacyLength + index] === '';
		})
	) {
		throw new Error('Sheet column headers were changed. Restore the original headers.');
	}
	// Append to the known legacy schema without rewriting headers or lead data.
	// Every caller holds the script lock, so concurrent submissions cannot race
	// setup or notification retries while this idempotent migration runs.
	if (maxColumns < ROVER_LEAD_HEADERS_.length) {
		sheet.insertColumnsAfter(maxColumns, ROVER_LEAD_HEADERS_.length - maxColumns);
	}
	sheet
		.getRange(1, legacyLength + 1, 1, appendedHeaders.length)
		.setNumberFormat('@')
		.setValues([appendedHeaders])
		.setFontWeight('bold');
	sheet.autoResizeColumns(legacyLength + 1, appendedHeaders.length);
	SpreadsheetApp.flush();
}

function normalizedPageUrl_(value) {
	if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) return '';
	const normalized = value.trim();
	const match = normalized.match(/^((?:https|http):\/\/[^/]+)(\/.*)$/);
	if (
		!match ||
		!allowedSiteOrigin_(match[1]) ||
		!/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]*$/.test(match[2])
	) {
		return '';
	}
	return normalized;
}

function matchesResourcePage_(pageUrl, approvedPageUrl) {
	const path = pageUrl.replace(/^(?:https|http):\/\/[^/]+/, '').replace(/\/$/, '');
	const approvedPath = approvedPageUrl.replace(/^https:\/\/[^/]+/, '').replace(/\/$/, '');
	return path === approvedPath;
}

function initializeHeaders_(sheet, headers) {
	if (sheet.getLastRow() === 0) {
		writeTextRow_(sheet, 1, headers);
		sheet.setFrozenRows(1);
		sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
		sheet.autoResizeColumns(1, headers.length);
	} else {
		assertHeaders_(sheet, headers);
	}
}

function assertHeaders_(sheet, headers) {
	if (!sheet || sheet.getLastRow() < 1) {
		throw new Error('Lead capture sheet is not configured.');
	}
	const actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
	if (
		!headers.every(function (header, index) {
			return actual[index] === header;
		})
	) {
		throw new Error('Sheet column headers were changed. Restore the original headers.');
	}
}

function approvedResource_(spreadsheet, resourceId) {
	function unavailable(reason) {
		console.log('ROVER_RESOURCE_DIAGNOSTIC ' + JSON.stringify({ resourceId: resourceId, reason: reason }));
		return null;
	}
	const sheet = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.resourcesSheetName);
	assertHeaders_(sheet, ROVER_RESOURCE_HEADERS_);
	if (sheet.getLastRow() < 2) return unavailable('empty_resources_sheet');
	const matches = sheet
		.getRange(2, 1, sheet.getLastRow() - 1, ROVER_RESOURCE_HEADERS_.length)
		.getValues()
		.filter(function (row) {
			return String(row[0]).trim() === resourceId;
		});
	if (matches.length !== 1) return unavailable(matches.length ? 'duplicate_resource_rows' : 'missing_resource_row');
	const row = matches[0];
	const title = String(row[1]).trim().replace(/\s+/g, ' ');
	let pdfUrl = String(row[2]).trim();
	// Existing Sheets retain their legacy reference; resolve it to the private object.
	if (
		resourceId === ROVER_INITIAL_RESOURCE_.resourceId &&
		pdfUrl ===
			'https://roverhq.ai/assets/comparisons/splunk/rover-vs-splunk-full-comparison-guide.pdf'
	) {
		pdfUrl = ROVER_INITIAL_RESOURCE_.pdfUrl;
	}
	const pageUrl = String(row[3]).trim();
	const expectedPage = 'https://roverhq.ai/resources/comparisons/' + resourceId.replace(/^rover-vs-/, '') + '/';
	const legacyPage = 'https://roverhq.ai/resources/comparison/' + resourceId + '/';
	const legacySplunkPage =
		resourceId === 'rover-vs-splunk' &&
		pageUrl === 'https://roverhq.ai/resources/comparison/splunk/';

	// Approved links have clean path segments and cannot point to another host,
	// JavaScript URLs, arbitrary redirects, query strings, or parent directories.
	if (!title || title.length > 200) return unavailable('invalid_title');
	if (!/^rover-vs-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resourceId)) return unavailable('invalid_resource_id');
	if (!/^s3:\/\/rover-private-resources-613025568726-ap-south-1\/comparisons\/[a-z0-9]+(?:-[a-z0-9]+)*\/[A-Za-z0-9_-]+\.pdf$/.test(pdfUrl)) return unavailable('invalid_pdf_reference');
	if (pageUrl !== expectedPage && pageUrl !== legacyPage && !legacySplunkPage) return unavailable('invalid_page_url');

	return {
		resourceId: resourceId,
		title: title,
		pdfUrl: pdfUrl,
		pdfKey: pdfUrl.replace('s3://rover-private-resources-613025568726-ap-south-1/', ''),
		pageUrl: pageUrl
	};
}

function findRequestRow_(sheet, requestId) {
	if (sheet.getLastRow() < 2) return 0;
	const match = sheet
		.getRange(2, 1, sheet.getLastRow() - 1, 1)
		.createTextFinder(requestId)
		.matchEntireCell(true)
		.matchCase(true)
		.findNext();
	return match ? match.getRow() : 0;
}

function sheetText_(value) {
	const text = String(value == null ? '' : value);
	// setValues interprets a leading '=' as a formula. Escaping other spreadsheet
	// formula prefixes also protects CSV exports; number formatting preserves +
	// country codes and leading zeroes in phone numbers.
	return /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text;
}

function writeTextRow_(sheet, rowNumber, values) {
	sheet
		.getRange(rowNumber, 1, 1, values.length)
		.setNumberFormat('@')
		.setValues([
			values.map(function (value) {
				return sheetText_(value);
			})
		]);
}

function withLeadLock_(callback) {
	const lock = LockService.getScriptLock();
	if (!lock.tryLock(20000)) throw new Error('Lead capture is busy.');
	try {
		return callback();
	} finally {
		lock.releaseLock();
	}
}

function notificationRecipients_(configured) {
	if (typeof configured !== 'string') {
		throw new Error('Configure a notification inbox before deploying.');
	}
	const recipients = configured
		.split(',')
		.map(function (email) {
			return email.trim().toLowerCase();
		})
		.filter(Boolean);
	if (!recipients.length || recipients.length > 10 || !recipients.every(validEmailAddress_)) {
		throw new Error('Configure 1–10 valid notification inboxes.');
	}
	return recipients.filter(function (email, index) {
		return recipients.indexOf(email) === index;
	});
}

function notificationIsDue_(row, now) {
	const status = String(row[9]);
	if (status === 'sent') return false;
	if (status === 'sending') {
		const updated = Date.parse(String(row[11]));
		return !Number.isFinite(updated) || now - updated >= ROVER_LEAD_SETTINGS_.notificationLeaseMs;
	}
	if (status !== 'pending') return false;
	const nextAttempt = Date.parse(String(row[12]));
	return !Number.isFinite(nextAttempt) || nextAttempt <= now;
}

function notifyLead_(requestId) {
	const claimed = withLeadLock_(function () {
		const spreadsheet = configuredSpreadsheet_();
		const sheet = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.leadsSheetName);
		assertHeaders_(sheet, ROVER_LEAD_HEADERS_);
		const rowNumber = findRequestRow_(sheet, requestId);
		if (!rowNumber) return null;
		const row = sheet.getRange(rowNumber, 1, 1, ROVER_LEAD_HEADERS_.length).getValues()[0];
		const now = Date.now();
		if (!notificationIsDue_(row, now)) return null;

		const recipients = notificationRecipients_(
			PropertiesService.getScriptProperties().getProperty(ROVER_LEAD_SETTINGS_.notificationProperty)
		);
		const storedCc = PropertiesService.getScriptProperties().getProperty(
			ROVER_LEAD_SETTINGS_.notificationCcProperty
		);
		const configuredCc = storedCc === null ? ROVER_NOTIFICATION_CC_EMAILS : storedCc;
		const ccRecipients = configuredCc.trim()
			? notificationRecipients_(configuredCc).filter(function (email) {
					return recipients.indexOf(email) === -1;
				})
			: [];
		if (MailApp.getRemainingDailyQuota() < recipients.length + ccRecipients.length) {
			sheet
				.getRange(rowNumber, 10, 1, 5)
				.setNumberFormat('@')
				.setValues([
					[
						'pending',
						String(row[10] || '0'),
						new Date(now).toISOString(),
						new Date(now + ROVER_LEAD_SETTINGS_.notificationRetryMs).toISOString(),
						'Email quota reached; scheduled for retry.'
					]
				]);
			SpreadsheetApp.flush();
			return null;
		}

		const claimedAt = new Date(now).toISOString();
		const attempts = String((Number(row[10]) || 0) + 1);
		// Preserve normalized text independently of Sheets' handling of the
		// apostrophe used to escape formula prefixes in the visible columns.
		const notificationPayload = JSON.parse(String(row[15]));
		sheet
			.getRange(rowNumber, 10, 1, 5)
			.setNumberFormat('@')
			.setValues([['sending', attempts, claimedAt, '', '']]);
		SpreadsheetApp.flush();
		return {
			requestId: requestId,
			claimedAt: claimedAt,
			attempts: attempts,
			recipients: recipients,
			ccRecipients: ccRecipients,
			row: row,
			payload: notificationPayload,
			spreadsheetUrl: spreadsheet.getUrl()
		};
	});
	if (!claimed) return;

	let notificationError = '';
	try {
		const row = claimed.row;
		MailApp.sendEmail({
			to: claimed.recipients.join(','),
			...(claimed.ccRecipients.length ? { cc: claimed.ccRecipients.join(',') } : {}),
			subject: 'New comparison PDF lead: ' + String(row[3]),
			body: [
				'A visitor requested a Rover comparison PDF.',
				'',
				'Name: ' + String(claimed.payload.name),
				'Company email: ' + String(claimed.payload.email),
				'Phone: ' + String(claimed.payload.phone),
				'Job title: ' + String(claimed.payload.jobTitle || ''),
				'Company: ' + String(claimed.payload.company || ''),
				'Comparison: ' + String(row[3]),
				'Page: ' + String(row[4]),
				'Submitted: ' + String(row[1]),
				'',
				'All leads: ' + claimed.spreadsheetUrl
			].join('\n'),
			replyTo: String(claimed.payload.email),
			name: 'Rover lead capture'
		});
	} catch (error) {
		notificationError = 'Email delivery failed; scheduled for retry.';
	}

	withLeadLock_(function () {
		const spreadsheet = configuredSpreadsheet_();
		const sheet = spreadsheet.getSheetByName(ROVER_LEAD_SETTINGS_.leadsSheetName);
		const rowNumber = findRequestRow_(sheet, requestId);
		if (!rowNumber) return;
		const row = sheet.getRange(rowNumber, 1, 1, ROVER_LEAD_HEADERS_.length).getValues()[0];
		// A stale retry cannot overwrite another worker's completed notification.
		if (row[9] !== 'sending' || row[11] !== claimed.claimedAt) return;
		const now = Date.now();
		const timestamp = new Date(now).toISOString();
		sheet
			.getRange(rowNumber, 10, 1, 6)
			.setNumberFormat('@')
			.setValues([
				[
					notificationError ? 'pending' : 'sent',
					claimed.attempts,
					timestamp,
					notificationError
						? new Date(now + ROVER_LEAD_SETTINGS_.notificationRetryMs).toISOString()
						: '',
					notificationError,
					notificationError ? '' : timestamp
				]
			]);
		SpreadsheetApp.flush();
	});
}
