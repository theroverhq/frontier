import test from 'node:test';
import assert from 'node:assert/strict';
import { DAM_PROVIDERS, estimateDam } from '../src/lib/dam-pricing.mjs';
import { createDamTco } from '../src/lib/dam-tco.mjs';

const baseline = { databases: 200, retentionDays: 1095, dailyGB: 667, queriesPerMonth: 1000 };
const estimate = (id, overrides = {}) => estimateDam(id, { ...baseline, ...overrides });
const allIds = [
	'ibm-guardium-dam',
	'imperva-dam',
	'oracle-avdf',
	'datasunrise-dam',
	'aurva-dam',
	'trellix-dam',
	'dynatrace-database'
];
const dynatraceIds = [
	'database-monitoring',
	'log-ingestion',
	'hot-log-retention',
	'investigation-queries',
	'scheduled-detection-queries',
	'dashboard-queries'
];
const close = (actual, expected) => {
	assert.ok(Number.isFinite(actual), `Non-finite invoice: ${actual}`);
	const tolerance = Math.max(1e-6, Math.abs(expected) * Number.EPSILON * 32);
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};
const component = (quote, id) => {
	const found = quote.costBreakdown.find((entry) => entry.id === id);
	assert.ok(found, `Missing vendor fee: ${id}`);
	return found;
};
const amount = (quote, id) => component(quote, id).amount;
const assertLifecycle = (quote) => {
	assert.equal(quote.horizonYears, 3);
	close(quote.total, quote.oneTime + quote.recurringYearly * 3);
	close(quote.firstYear, quote.oneTime + quote.recurringYearly);
	close(quote.yearly * 3, quote.total);
	close(quote.monthly * 36, quote.total);
	close(
		quote.costBreakdown.reduce((sum, fee) => sum + fee.total, 0),
		quote.total
	);
	assert.equal(new Set(quote.costBreakdown.map(({ id }) => id)).size, quote.costBreakdown.length);
	for (const fee of quote.costBreakdown) {
		assert.ok(['annual', 'one_time'].includes(fee.frequency));
		close(fee.total, fee.amount * (fee.frequency === 'annual' ? 3 : 1));
		close(fee.yearly * 3, fee.total);
		close(fee.monthly * 36, fee.total);
	}
};
const usdFromGBP = (gbp) => (gbp * 1.1186) / 0.84698;

// Independent public invoice fixtures at 200 DBs, 667 decimal GB/day, 1,095
// retained days and 1,000 investigations/month. No customer infrastructure,
// staffing, implementation allowance or capture-method ingestion multiplier.
const invoices = {
	'ibm-guardium-dam': { 'license-subscription': 1526400 },
	'imperva-dam': {
		'license-subscription': usdFromGBP(1460895.2),
		'retention-addon': usdFromGBP(224727.2)
	},
	'datasunrise-dam': { 'license-subscription': 2452800 },
	'aurva-dam': { 'license-subscription': 1600000, 'universal-database-connector': 10000 },
	'trellix-dam': { 'license-subscription': 1226600 },
	'oracle-avdf': { licenses: 2400000, support: 528000 },
	'dynatrace-database': {
		'database-monitoring': 192720,
		'log-ingestion': 45347.027480602264,
		'hot-log-retention': 173792.48281940818,
		'investigation-queries': 285686.27312779427,
		'scheduled-detection-queries': 79357.29809105396,
		'dashboard-queries': 661226.749420166
	}
};

test('all seven estimates match vendor invoices and contain only vendor fee components', () => {
	assert.deepEqual(DAM_PROVIDERS.map(({ id }) => id).sort(), [...allIds].sort());
	for (const id of allIds) {
		const quote = estimate(id);
		assert.deepEqual(
			quote.costBreakdown.map(({ id }) => id).sort(),
			Object.keys(invoices[id]).sort()
		);
		for (const [fee, expected] of Object.entries(invoices[id])) {
			close(amount(quote, fee), expected);
			assert.equal(component(quote, fee).frequency, fee === 'licenses' ? 'one_time' : 'annual');
		}
		assert.equal(quote.modeledDailyGB, 667);
		assert.equal(quote.ingestionMultiplier, 1);
		assertLifecycle(quote);
	}
	for (const [id, annual] of [
		['ibm-guardium-dam', 1526400],
		['imperva-dam', 2226188.5955276396],
		['datasunrise-dam', 2452800],
		['aurva-dam', 1610000],
		['trellix-dam', 1226600],
		['dynatrace-database', 1438129.8309390247]
	]) {
		const quote = estimate(id);
		assert.equal(quote.oneTime, 0);
		close(quote.firstYear, annual);
		close(quote.yearly, annual);
		close(quote.monthly, annual / 12);
		close(quote.total, annual * 3);
	}
});

test('Oracle purchases 400 target-processor licenses once and renews support annually', () => {
	const quote = estimate('oracle-avdf');
	assert.equal(component(quote, 'licenses').total, 2400000);
	assert.equal(component(quote, 'support').total, 1584000);
	assert.equal(quote.firstYear, 2928000);
	assert.equal(quote.oneTime, 2400000);
	assert.equal(quote.recurringYearly, 528000);
	assert.equal(quote.total, 3984000);
	assert.equal(quote.yearly, 1328000);
	close(quote.monthly, 3984000 / 36);
});

test('database packs and hours scale independently while Aurva keeps one annual connector', () => {
	for (const databases of [100, 200, 300, 500]) {
		for (const [id, annual] of [
			['ibm-guardium-dam', (databases / 5) * 38160],
			['datasunrise-dam', databases * 1.4 * 8760],
			['aurva-dam', databases * 8000 + 10000]
		])
			close(estimate(id, { databases }).yearly, annual);
		assert.equal(
			amount(estimate('aurva-dam', { databases }), 'universal-database-connector'),
			10000
		);
		const oracle = estimate('oracle-avdf', { databases });
		close(oracle.oneTime, databases * 2 * 6000);
		close(oracle.recurringYearly, databases * 2 * 1320);
	}
});

test('Trellix uses the US lower band and identifies the different NZ reseller above 250 instances', () => {
	for (const [databases, annualUSD] of [
		[100, 613300],
		[200, 1226600],
		[300, (2279775 * 1.1186) / 2.0014],
		[500, (3799625 * 1.1186) / 2.0014]
	]) {
		const quote = estimate('trellix-dam', { databases });
		close(quote.yearly, annualUSD);
		assert.match(JSON.stringify(quote), databases <= 250 ? /SHI/i : /Acquire|NZD|NZ\$/i);
	}
});

test('Imperva applies progressive server bands rather than repricing all servers at the final band', () => {
	// GBP annual invoice: eight-server base, successive additional-server bands,
	// and matching three-year retention add-ons. Values are source arithmetic.
	for (const [databases, baseGBP, retentionGBP] of [
		[100, 812255.2, 124967.2],
		[200, 1460895.2, 224727.2],
		[300, 2109535.2, 324487.2],
		[500, 3406225.6, 523916.8]
	]) {
		const quote = estimate('imperva-dam', { databases });
		close(amount(quote, 'license-subscription'), usdFromGBP(baseGBP));
		close(amount(quote, 'retention-addon'), usdFromGBP(retentionGBP));
	}
	const boundary = estimate('imperva-dam', { databases: 500, retentionDays: 396 });
	close(boundary.yearly, usdFromGBP(3406225.6));
});

test('Imperva distinguishes 13-month, three-year and unlimited retention entitlements', () => {
	const included = estimate('imperva-dam', { retentionDays: 396 });
	assert.deepEqual(
		included.costBreakdown.map(({ id }) => id),
		['license-subscription']
	);
	close(included.yearly, usdFromGBP(1460895.2));
	const extended = estimate('imperva-dam', { retentionDays: 397 });
	close(amount(extended, 'retention-addon'), usdFromGBP(224727.2));
	assert.deepEqual(
		extended.costBreakdown,
		estimate('imperva-dam', { retentionDays: 1095 }).costBreakdown
	);
	const unlimited = estimate('imperva-dam', { retentionDays: 1096 });
	close(amount(unlimited, 'retention-addon'), usdFromGBP(449560));
	assert.deepEqual(
		unlimited.costBreakdown,
		estimate('imperva-dam', { retentionDays: 3650 }).costBreakdown
	);
	for (const quote of [included, extended, unlimited]) assertLifecycle(quote);
});

test('increased data never adds unpriced vendor overages or changes Oracle target CPU licensing', () => {
	for (const id of allIds.filter((id) => id !== 'dynatrace-database')) {
		const reference = estimate(id);
		for (const dailyGB of [0, 1, 667, 1334, 100000]) {
			const quote = estimate(id, { dailyGB, queriesPerMonth: 999999 });
			assert.equal(quote.modeledDailyGB, dailyGB);
			assert.equal(quote.ingestionMultiplier, 1);
			assert.deepEqual(quote.costBreakdown, reference.costBreakdown);
		}
	}
	for (const id of ['imperva-dam', 'aurva-dam'])
		assert.match(JSON.stringify(estimate(id)), /quote|unpriced|not published|not priced/i);
});

test('fixed vendor invoices do not acquire invented retention charges', () => {
	for (const id of allIds.filter((id) => !['imperva-dam', 'dynatrace-database'].includes(id))) {
		const reference = estimate(id);
		for (const retentionDays of [0, 30, 365, 1095, 3650])
			assert.deepEqual(estimate(id, { retentionDays }).costBreakdown, reference.costBreakdown);
	}
});

test('Dynatrace defaults to explicit 1:1 processed bytes and charges only six vendor meters', () => {
	const explicit = estimate('dynatrace-database', {
		dynatraceConfiguration: { processedVolumeRatio: 1 }
	});
	assert.deepEqual(estimate('dynatrace-database').costBreakdown, explicit.costBreakdown);
	assert.deepEqual(
		explicit.costBreakdown.map(({ id }) => id),
		dynatraceIds
	);
	assert.equal(explicit.oneTime, 0);
	close(explicit.yearly, 1438129.8309390247);
	close(amount(explicit, 'log-ingestion'), ((667 * 1e9) / 2 ** 30) * 365 * 0.2);
});

test('Dynatrace volume scales byte meters without scaling database monitoring', () => {
	const reference = estimate('dynatrace-database');
	const double = estimate('dynatrace-database', { dailyGB: 1334 });
	for (const id of dynatraceIds)
		close(amount(double, id), amount(reference, id) * (id === 'database-monitoring' ? 1 : 2));
	const empty = estimate('dynatrace-database', { dailyGB: 0 });
	for (const id of dynatraceIds.filter((id) => id !== 'database-monitoring'))
		assert.equal(amount(empty, id), 0);
	assert.equal(empty.yearly, 192720);
});

test('Dynatrace database count changes monitoring without duplicating fleet-wide scan work', () => {
	const reference = estimate('dynatrace-database');
	for (const databases of [100, 300, 500]) {
		const quote = estimate('dynatrace-database', { databases });
		close(amount(quote, 'database-monitoring'), databases * 0.11 * 8760);
		for (const id of dynatraceIds.filter((id) => id !== 'database-monitoring'))
			close(amount(quote, id), amount(reference, id));
	}
});

test('investigation count changes only investigation charges and defaults independently', () => {
	const none = estimate('dynatrace-database', { queriesPerMonth: 0 });
	const reference = estimate('dynatrace-database');
	const twice = estimate('dynatrace-database', { queriesPerMonth: 2000 });
	assert.equal(amount(none, 'investigation-queries'), 0);
	close(amount(twice, 'investigation-queries'), amount(reference, 'investigation-queries') * 2);
	for (const id of dynatraceIds.filter((id) => id !== 'investigation-queries'))
		close(amount(none, id), amount(twice, id));
	close(estimate('dynatrace-database', { queriesPerMonth: undefined }).total, reference.total);
});

test('Dynatrace retention scales historical meters and caps live queries to available history', () => {
	const short = estimate('dynatrace-database', { retentionDays: 30 });
	const long = estimate('dynatrace-database');
	for (const id of dynatraceIds) {
		const history = ['hot-log-retention', 'investigation-queries'].includes(id);
		close(amount(long, id), amount(short, id) * (history ? 1095 / 30 : 1));
	}
	const minute = estimate('dynatrace-database', { retentionDays: 1 / 1440 });
	close(
		amount(minute, 'scheduled-detection-queries'),
		amount(long, 'scheduled-detection-queries') / 5
	);
	close(amount(minute, 'dashboard-queries'), amount(long, 'dashboard-queries') / 1440);
	const empty = estimate('dynatrace-database', { retentionDays: 0 });
	for (const id of dynatraceIds.filter(
		(id) => !['database-monitoring', 'log-ingestion'].includes(id)
	))
		assert.equal(amount(empty, id), 0);
});

test('processed-byte ratio affects storage and scans without multiplying raw ingestion', () => {
	const raw = estimate('dynatrace-database');
	const enriched = estimate('dynatrace-database', {
		dynatraceConfiguration: { processedVolumeRatio: 2 }
	});
	for (const id of dynatraceIds) {
		const processed = !['database-monitoring', 'log-ingestion'].includes(id);
		close(amount(enriched, id), amount(raw, id) * (processed ? 2 : 1));
	}
});

test('detection and dashboard configuration controls repeated scan charges independently', () => {
	const regular = estimate('dynatrace-database');
	const slower = estimate('dynatrace-database', {
		dynatraceConfiguration: { detectionIntervalMinutes: 2, dashboardRefreshMinutes: 10 }
	});
	for (const id of ['scheduled-detection-queries', 'dashboard-queries'])
		close(amount(slower, id), amount(regular, id) / 2);
	const off = estimate('dynatrace-database', {
		dynatraceConfiguration: { detectionRuleCount: 0, dashboardTiles: 0 }
	});
	assert.equal(amount(off, 'scheduled-detection-queries'), 0);
	assert.equal(amount(off, 'dashboard-queries'), 0);
	for (const id of dynatraceIds.slice(0, 4)) close(amount(off, id), amount(regular, id));
});

test('all selectable database counts, retention choices and extreme volumes reconcile finite invoices', () => {
	for (const id of allIds) {
		for (const databases of [100, 200, 300, 500])
			for (const retentionDays of [30, 90, 365, 1095, 3650])
				assertLifecycle(estimate(id, { databases, retentionDays }));
		assertLifecycle(estimate(id, { dailyGB: 0, retentionDays: 0 }));
		assertLifecycle(estimate(id, { dailyGB: 100000, retentionDays: 3650 }));
	}
});

test('invalid products and workload inputs cannot silently create vendor invoices', () => {
	assert.throws(() => estimate('unknown'), RangeError);
	for (const id of allIds) {
		for (const databases of [0, 101, -1, NaN, Infinity])
			assert.throws(() => estimate(id, { databases }), RangeError);
		for (const retentionDays of [-1, NaN, Infinity])
			assert.throws(() => estimate(id, { retentionDays }), RangeError);
		for (const dailyGB of [-1, NaN, Infinity, undefined])
			assert.throws(() => estimate(id, { dailyGB }), RangeError);
	}
	for (const queriesPerMonth of [-1, NaN, Infinity])
		assert.throws(() => estimate('dynatrace-database', { queriesPerMonth }), RangeError);
});

test('Dynatrace rejects invalid meter settings and customer-infrastructure overrides', () => {
	for (const dynatraceConfiguration of [
		null,
		[],
		'invalid',
		{ activeGateHosts: 0 },
		{ scanFraction: 0.5 },
		{ processedVolumeRatio: 0 },
		{ processedVolumeRatio: Infinity },
		{ detectionRuleCount: -1 },
		{ detectionRuleCount: 0.5 },
		{ detectionIntervalMinutes: 0 },
		{ detectionLookbackMinutes: NaN },
		{ dashboardTiles: -1 },
		{ dashboardRefreshMinutes: 0 },
		{ dashboardHoursPerDay: 25 },
		{ dashboardDaysPerMonth: 32 },
		{ dashboardLookbackDays: -1 }
	])
		assert.throws(() => estimate('dynatrace-database', { dynatraceConfiguration }), RangeError);
});

test('the lifecycle finalizer counts one-time purchases once and annual renewals three times', () => {
	const quote = createDamTco([
		{ id: 'purchase', label: 'Purchase', amount: 300, frequency: 'one_time' },
		{ id: 'renewal', label: 'Renewal', amount: 1200, frequency: 'annual' }
	]);
	assert.equal(quote.oneTime, 300);
	assert.equal(quote.recurringYearly, 1200);
	assert.equal(quote.firstYear, 1500);
	assert.equal(quote.total, 3900);
	assert.equal(component(quote, 'purchase').total, 300);
	assert.equal(component(quote, 'renewal').total, 3600);
	assertLifecycle(quote);
	for (const value of [-1, NaN, Infinity])
		assert.throws(
			() => createDamTco([{ id: 'fee', label: 'Fee', amount: value, frequency: 'annual' }]),
			RangeError
		);
	assert.throws(
		() => createDamTco([{ id: 'fee', label: 'Fee', amount: 1, frequency: 'monthly' }]),
		RangeError
	);
	assert.throws(
		() =>
			createDamTco([
				{ id: 'fee', label: 'One', amount: 1, frequency: 'annual' },
				{ id: 'fee', label: 'Two', amount: 1, frequency: 'one_time' }
			]),
		RangeError
	);
});
