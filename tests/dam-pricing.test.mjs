import test from 'node:test';
import assert from 'node:assert/strict';
import {
	DAM_PROVIDERS,
	DAM_GBP_TO_USD,
	DAM_NZD_TO_USD,
	DAM_EBPF_INGESTION_REDUCTION_PERCENT,
	DAM_LIFECYCLE_YEARS,
	DAM_TCO_RATES,
	DAM_TCO_ASSUMPTIONS,
	estimateDam
} from '../src/lib/dam-pricing.mjs';
import { createDamTco } from '../src/lib/dam-tco.mjs';

const baseline = { databases: 100, retentionDays: 1095, dailyGB: 50, queriesPerMonth: 1510 };
const close = (actual, expected) => {
	assert.ok(Number.isFinite(actual), `Non-finite invoice: ${actual}`);
	const tolerance = Math.max(1e-6, Math.abs(expected) * Number.EPSILON * 16);
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};
const component = (estimate, id) => {
	const found = estimate.costBreakdown.find((entry) => entry.id === id);
	assert.ok(found, `Missing cost component: ${id}`);
	return found;
};
const amount = (estimate, id) => component(estimate, id).amount;
const estimate = (id, overrides = {}) => estimateDam(id, { ...baseline, ...overrides });
const allIds = DAM_PROVIDERS.map(({ id }) => id);
const assertLifecycle = (quote) => {
	assert.equal(quote.horizonYears, 3);
	close(quote.total, quote.oneTime + quote.recurringYearly * 3);
	close(quote.firstYear, quote.oneTime + quote.recurringYearly);
	close(quote.monthly * 36, quote.total);
	close(quote.yearly * 3, quote.total);
	close(quote.monthly * 12, quote.yearly);
	close(
		quote.costBreakdown.reduce((sum, entry) => sum + entry.total, 0),
		quote.total
	);
	assert.equal(new Set(quote.costBreakdown.map(({ id }) => id)).size, quote.costBreakdown.length);
	for (const entry of quote.costBreakdown) {
		assert.ok(['annual', 'one_time'].includes(entry.frequency));
		close(entry.total, entry.amount * (entry.frequency === 'annual' ? 3 : 1));
		close(entry.yearly * 3, entry.total);
		close(entry.monthly * 36, entry.total);
	}
};

// Independent invoice fixtures: decimal arithmetic from published software prices,
// explicitly sized AWS nodes/disks, and $150K / 2,080h labor; not API snapshots.
// Default non-eBPF raw input is 250 GB/day. Customer repositories have 10 HA
// groups; IBM has 22 m6i nodes; other self-hosted profiles have 20 data + 2 gateways.
// Oracle has 40 appliances. SaaS collectors have 2 nodes.
const defaultInvoices = {
	'ibm-guardium-dam': {
		amounts: {
			'license-subscription': 763200.0,
			'ha-compute': 74004.48,
			'hot-storage': 618791.04,
			backups: 155129.73288059235,
			'network-transfer': 1825.0,
			deployment: 16442.30769230769,
			operations: 36346.153846153844
		},
		oneTime: 16442.30769230769,
		recurringYearly: 1649296.4067267461,
		total: 4964331.527872547
	},
	'imperva-dam': {
		amounts: {
			'license-subscription': 1062095.4988311413,
			'ha-compute': 94257.6,
			'hot-storage': 613991.04,
			backups: 153629.73288059235,
			'network-transfer': 1825.0,
			deployment: 16442.30769230769,
			operations: 36346.153846153844
		},
		oneTime: 16442.30769230769,
		recurringYearly: 1962145.0255578875,
		total: 5902877.38436597
	},
	'datasunrise-dam': {
		amounts: {
			'license-subscription': 1226400.0,
			'ha-compute': 94257.6,
			'hot-storage': 613991.04,
			backups: 153629.73288059235,
			'network-transfer': 1825.0,
			deployment: 16442.30769230769,
			operations: 36346.153846153844
		},
		oneTime: 16442.30769230769,
		recurringYearly: 2126449.526726746,
		total: 6395790.887872546
	},
	'trellix-dam': {
		amounts: {
			'license-subscription': 773363.1743779355,
			'ha-compute': 305899.2,
			'hot-storage': 613991.04,
			backups: 153629.73288059235,
			'network-transfer': 1825.0,
			deployment: 16442.30769230769,
			operations: 36346.153846153844
		},
		oneTime: 16442.30769230769,
		recurringYearly: 1885054.3011046816,
		total: 5671605.211006353
	},
	'aurva-dam': {
		amounts: {
			'license-subscription': 810000.0,
			'collector-compute': 3127.32,
			'collector-storage': 96.0,
			'network-transfer': 1421.6973288059235,
			'public-ipv4': 87.6,
			deployment: 10673.076923076924,
			operations: 19038.46153846154
		},
		oneTime: 10673.076923076924,
		recurringYearly: 833771.0788672675,
		total: 2511986.3135248795
	},
	'oracle-avdf': {
		amounts: {
			licenses: 1200000.0,
			support: 264000.0,
			'ha-compute': 119136.0,
			'hot-storage': 623212.8,
			'backups-transfer': 158334.73288059235,
			deployment: 21634.615384615383,
			operations: 51923.07692307692
		},
		oneTime: 1221634.6153846155,
		recurringYearly: 1216606.6098036692,
		total: 4871454.444795623
	},
	'dynatrace-database': {
		amounts: {
			'database-monitoring': 96360.0,
			'log-ingestion': 16996.636986732483,
			'hot-log-retention': 130279.22250330448,
			'investigation-queries': 323378.0153095722,
			'scheduled-detection-queries': 59488.22945356369,
			'dashboard-queries': 495672.22595214844,
			'collector-compute': 3127.32,
			'collector-storage': 96.0,
			'network-transfer': 7540.486644029617,
			'public-ipv4': 87.6,
			deployment: 10673.076923076924,
			operations: 19038.46153846154
		},
		oneTime: 10673.076923076924,
		recurringYearly: 1152064.1983878124,
		total: 3466865.6720865145
	}
};

const presetInvoices = {
	oracle: [
		[100, 50.0, 1510, 4871454.444795623, 1221634.6153846155],
		[200, 100.0, 1510, 9740024.27420663, 2440384.6153846155],
		[300, 150.0, 1510, 14608594.103617638, 3659134.6153846155],
		[500, 250.0, 1510, 24294166.900901195, 6095480.769230769]
	],
	dynatrace: [
		[100, 50.0, 1510, 3466865.6720865145, 10673.076923076924],
		[200, 100.0, 1510, 6914780.442471173, 17884.615384615383],
		[300, 150.0, 2500, 12270253.208582345, 25096.153846153848],
		[500, 250.0, 2500, 20437006.14353468, 39519.230769230766]
	]
};

test('the lifecycle finalizer counts purchases once and annual invoices three times', () => {
	const quote = createDamTco([
		{ id: 'subscription', label: 'Subscription', amount: 1200, frequency: 'annual' },
		{ id: 'setup', label: 'Setup', amount: 300, frequency: 'one_time' }
	]);
	assert.equal(quote.recurringYearly, 1200);
	assert.equal(quote.oneTime, 300);
	assert.equal(quote.firstYear, 1500);
	assert.equal(quote.total, 3900);
	assert.equal(quote.yearly, 1300);
	close(quote.monthly, 3900 / 36);
	assert.equal(component(quote, 'subscription').total, 3600);
	assert.equal(component(quote, 'setup').total, 300);
	assert.equal(component(quote, 'setup').yearly, 100);
	assertLifecycle(quote);
});

test('invalid component amounts, duplicate fees and unsupported cadence cannot create TCO', () => {
	for (const value of [-1, NaN, Infinity])
		assert.throws(
			() => createDamTco([{ id: 'fee', label: 'Fee', amount: value, frequency: 'annual' }]),
			RangeError
		);
	assert.throws(
		() => createDamTco([{ id: 'fee', label: 'Fee', amount: 10, frequency: 'monthly' }]),
		RangeError
	);
	assert.throws(
		() =>
			createDamTco([
				{ id: 'duplicate', label: 'First', amount: 10, frequency: 'annual' },
				{ id: 'duplicate', label: 'Second', amount: 20, frequency: 'one_time' }
			]),
		RangeError
	);
});

test('all seven competitors match independent three-year default invoices', () => {
	assert.equal(DAM_LIFECYCLE_YEARS, 3);
	assert.equal(allIds.length, 7);
	for (const id of allIds) {
		const quote = estimate(id);
		const invoice = defaultInvoices[id];
		assert.deepEqual(
			quote.costBreakdown.map(({ id }) => id).sort(),
			Object.keys(invoice.amounts).sort()
		);
		for (const [fee, expected] of Object.entries(invoice.amounts)) {
			close(amount(quote, fee), expected);
			assert.equal(
				component(quote, fee).frequency,
				fee === 'deployment' || fee === 'licenses' ? 'one_time' : 'annual'
			);
		}
		close(quote.oneTime, invoice.oneTime);
		close(quote.recurringYearly, invoice.recurringYearly);
		close(quote.total, invoice.total);
		assertLifecycle(quote);
	}
});

test('the salary assumption prices setup hours once and operational hours every year', () => {
	assert.equal(DAM_TCO_ASSUMPTIONS.annualEngineerCost, 150000);
	assert.equal(DAM_TCO_ASSUMPTIONS.workingHoursPerYear, 2080);
	close(DAM_TCO_ASSUMPTIONS.laborPerHour, 150000 / 2080);
	// A 2-node fleet: 148 rollout hours once; 22 hours/month ongoing.
	const quote = estimate('aurva-dam');
	close(amount(quote, 'deployment'), (148 * 150000) / 2080);
	close(component(quote, 'deployment').total, (148 * 150000) / 2080);
	close(amount(quote, 'operations'), (264 * 150000) / 2080);
	close(component(quote, 'operations').total, (792 * 150000) / 2080);
});

test('the 80% assumption scales raw ingestion once while Aurva retains the baseline', () => {
	assert.equal(DAM_EBPF_INGESTION_REDUCTION_PERCENT, 80);
	for (const id of allIds) {
		const quote = estimate(id);
		const reduced = id === 'aurva-dam';
		assert.equal(quote.ingestionMultiplier, reduced ? 1 : 5);
		assert.equal(quote.modeledDailyGB, reduced ? 50 : 250);
		assert.equal(estimate(id, { dailyGB: 0 }).modeledDailyGB, 0);
	}
	// Raw ingestion is 250 GB/day, not 50 GB/day or a twice-scaled 1,250 GB/day.
	close(amount(estimate('dynatrace-database'), 'log-ingestion'), 16996.636986732483);
});

test('IBM and DataSunrise public annual subscription meters remain unchanged by infrastructure', () => {
	for (const [databases, ibm, datasunrise] of [
		[100, 763200, 1226400],
		[200, 1526400, 2452800],
		[300, 2289600, 3679200],
		[500, 3816000, 6132000]
	]) {
		for (const [id, annual] of [
			['ibm-guardium-dam', ibm],
			['datasunrise-dam', datasunrise]
		]) {
			const quote = estimate(id, { databases });
			assert.equal(amount(quote, 'license-subscription'), annual);
			assert.equal(component(quote, 'license-subscription').total, annual * 3);
			assert.ok(quote.recurringYearly > annual);
		}
	}
});

test('Imperva keeps the published volume bands and annual retention add-ons separate from hosting', () => {
	for (const [databases, retentionDays, annualGBP] of [
		[100, 365, 696994.4],
		[100, 1095, 804196],
		[100, 3650, 911471.2],
		[200, 1095, 1552596],
		[300, 1095, 2300996],
		[500, 365, 3001471.2],
		[500, 1095, 3463236],
		[500, 3650, 3925000.8]
	]) {
		const quote = estimate('imperva-dam', { databases, retentionDays });
		close(amount(quote, 'license-subscription') / DAM_GBP_TO_USD, annualGBP);
		close(component(quote, 'license-subscription').total / DAM_GBP_TO_USD, annualGBP * 3);
	}
});

test('Aurva renews its annual database contract and one connector without invented storage fees', () => {
	for (const [databases, annual] of [
		[100, 810000],
		[200, 1610000],
		[300, 2410000],
		[500, 4010000]
	]) {
		const quote = estimate('aurva-dam', { databases });
		assert.equal(amount(quote, 'license-subscription'), annual);
		assert.equal(component(quote, 'license-subscription').frequency, 'annual');
		assert.equal(component(quote, 'license-subscription').total, annual * 3);
		for (const duplicate of ['hot-storage', 'backups', 'object-storage', 'ha-compute'])
			assert.ok(!quote.costBreakdown.some(({ id }) => id === duplicate));
	}
	close(
		estimate('aurva-dam', { retentionDays: 30 }).total,
		estimate('aurva-dam', { retentionDays: 3650 }).total
	);
});

test('Trellix retains the real annual retail quantity-band discount', () => {
	for (const [databases, annualNZD] of [
		[100, 1383702],
		[200, 2767404],
		[300, 2279775],
		[500, 3799625]
	]) {
		const quote = estimate('trellix-dam', { databases });
		close(amount(quote, 'license-subscription') / DAM_NZD_TO_USD, annualNZD);
		close(component(quote, 'license-subscription').total / DAM_NZD_TO_USD, annualNZD * 3);
	}
	assert.ok(
		amount(estimate('trellix-dam', { databases: 300 }), 'license-subscription') <
			amount(estimate('trellix-dam', { databases: 200 }), 'license-subscription')
	);
});

test('Trellix backend compute includes Windows and SQL Standard once', () => {
	assert.equal(DAM_TCO_RATES.sqlRepositoryPerHour, 1.712);
	const quote = estimate('trellix-dam');
	// 20 SQL-inclusive repository nodes plus two Linux management nodes.
	close(amount(quote, 'ha-compute'), (20 * 1.712 + 2 * 0.34) * 8760);
	for (const duplicate of ['sql-license', 'windows-license', 'sql-support'])
		assert.ok(!quote.costBreakdown.some(({ id }) => id === duplicate));
});

test('customer-hosted subscriptions add HA disks, backups and operating effort without scaling licenses', () => {
	for (const id of ['ibm-guardium-dam', 'imperva-dam', 'datasunrise-dam', 'trellix-dam']) {
		const short = estimate(id, { retentionDays: 30 });
		const long = estimate(id, { retentionDays: 3650 });
		assert.ok(amount(long, 'hot-storage') > amount(short, 'hot-storage'));
		assert.ok(amount(long, 'backups') > amount(short, 'backups'));
		assert.ok(long.total > short.total);
		assert.equal(component(long, 'deployment').frequency, 'one_time');
		for (const fee of ['ha-compute', 'hot-storage', 'backups', 'network-transfer', 'operations'])
			assert.equal(component(long, fee).frequency, 'annual');
	}
	for (const id of ['ibm-guardium-dam', 'datasunrise-dam', 'trellix-dam'])
		close(
			amount(estimate(id, { dailyGB: 10, retentionDays: 30 }), 'license-subscription'),
			amount(estimate(id, { dailyGB: 100000, retentionDays: 3650 }), 'license-subscription')
		);
});

test('Oracle counts perpetual licenses and deployment once while support recurs three times', () => {
	for (const [databases, dailyGB, queriesPerMonth, total, oneTime] of presetInvoices.oracle) {
		const quote = estimate('oracle-avdf', { databases, dailyGB, queriesPerMonth });
		close(quote.total, total);
		close(quote.oneTime, oneTime);
		assert.equal(amount(quote, 'licenses'), databases * 12000);
		assert.equal(component(quote, 'licenses').total, databases * 12000);
		assert.equal(component(quote, 'licenses').yearly, databases * 4000);
		assert.equal(amount(quote, 'support'), databases * 2640);
		assert.equal(component(quote, 'support').total, databases * 7920);
		assertLifecycle(quote);
	}
});

test('Oracle appliance size, history and audit throughput cannot multiply target licenses', () => {
	for (const retentionDays of [30, 365, 3650])
		for (const dailyGB of [10, 1000, 100000]) {
			const quote = estimate('oracle-avdf', { retentionDays, dailyGB });
			assert.equal(amount(quote, 'licenses'), 1200000);
			assert.equal(amount(quote, 'support'), 264000);
		}
});

test('Oracle HA storage observes its added-disk floor and mirrored hot copies', () => {
	const small = estimate('oracle-avdf', { databases: 500, retentionDays: 30, dailyGB: 2 });
	assert.match(small.pricingBasis, /2 HA groups/);
	close(amount(small, 'hot-storage'), 3690.24);
	close(amount(small, 'ha-compute'), 23827.2);
	const large = estimate('oracle-avdf');
	close(amount(large, 'hot-storage'), 623212.8);
	close(amount(large, 'backups-transfer'), 158334.73288059235);
});

test('Dynatrace preserves the hourly monitoring subscription inside the complete TCO', () => {
	for (const [databases, annual] of [
		[100, 96360],
		[200, 192720],
		[300, 289080],
		[500, 481800]
	]) {
		const quote = estimate('dynatrace-database', { databases });
		assert.equal(amount(quote, 'database-monitoring'), annual);
		assert.equal(component(quote, 'database-monitoring').total, annual * 3);
	}
	for (const [databases, dailyGB, queriesPerMonth, total, oneTime] of presetInvoices.dynatrace) {
		const quote = estimate('dynatrace-database', { databases, dailyGB, queriesPerMonth });
		close(quote.total, total);
		close(quote.oneTime, oneTime);
		assertLifecycle(quote);
	}
});

test('Dynatrace has one vendor retention meter and no duplicate customer repository', () => {
	const quote = estimate('dynatrace-database');
	close(amount(quote, 'hot-log-retention'), 130279.22250330448);
	for (const duplicate of ['hot-storage', 'backups', 'object-storage', 'ha-compute'])
		assert.ok(!quote.costBreakdown.some(({ id }) => id === duplicate));
});

test('Dynatrace history scales only retained storage and investigation scans', () => {
	const short = estimate('dynatrace-database', { retentionDays: 30 });
	const long = estimate('dynatrace-database');
	for (const entry of short.costBreakdown) {
		const history = ['hot-log-retention', 'investigation-queries'].includes(entry.id);
		close(amount(long, entry.id), entry.amount * (history ? 1095 / 30 : 1));
	}
});

test('Dynatrace investigations charge scan bytes without multiplying automated workload counts', () => {
	const none = estimate('dynatrace-database', { queriesPerMonth: 0 });
	const fewer = estimate('dynatrace-database', { queriesPerMonth: 1000 });
	const more = estimate('dynatrace-database', { queriesPerMonth: 2000 });
	assert.equal(amount(none, 'investigation-queries'), 0);
	close(amount(more, 'investigation-queries'), amount(fewer, 'investigation-queries') * 2);
	close(more.total - none.total, amount(more, 'investigation-queries') * 3);
	close(estimate('dynatrace-database', { queriesPerMonth: undefined }).total, fewer.total);
	for (const id of ['scheduled-detection-queries', 'dashboard-queries'])
		close(amount(none, id), amount(more, id));
});

test('Dynatrace enrichment applies to processed storage and scans but not raw ingestion or networking', () => {
	const raw = estimate('dynatrace-database', {
		dynatraceConfiguration: { processedVolumeRatio: 1 }
	});
	const enriched = estimate('dynatrace-database');
	for (const entry of raw.costBreakdown) {
		const processed = [
			'hot-log-retention',
			'investigation-queries',
			'scheduled-detection-queries',
			'dashboard-queries'
		].includes(entry.id);
		close(amount(enriched, entry.id), entry.amount * (processed ? 2 : 1));
	}
});

test('Dynatrace checks and dashboards scan the fleet once per execution, not once per database', () => {
	const small = estimate('dynatrace-database', { queriesPerMonth: 0 });
	const large = estimate('dynatrace-database', { databases: 500, queriesPerMonth: 0 });
	close(amount(small, 'scheduled-detection-queries'), 59488.22945356369);
	close(amount(small, 'dashboard-queries'), 495672.22595214844);
	for (const id of ['scheduled-detection-queries', 'dashboard-queries'])
		close(amount(small, id), amount(large, id));
	const off = estimate('dynatrace-database', {
		queriesPerMonth: 0,
		dynatraceConfiguration: { detectionRuleCount: 0, dashboardTiles: 0 }
	});
	assert.equal(amount(off, 'scheduled-detection-queries'), 0);
	assert.equal(amount(off, 'dashboard-queries'), 0);
	close(small.total - off.total, 3 * (59488.22945356369 + 495672.22595214844));
});

test('Dynatrace cadence and lookback windows control scans and are capped to available history', () => {
	const regular = estimate('dynatrace-database');
	const slower = estimate('dynatrace-database', {
		dynatraceConfiguration: { detectionIntervalMinutes: 2, dashboardRefreshMinutes: 10 }
	});
	const shorter = estimate('dynatrace-database', {
		dynatraceConfiguration: { detectionLookbackMinutes: 1, dashboardLookbackDays: 0.5 }
	});
	close(
		amount(slower, 'scheduled-detection-queries'),
		amount(regular, 'scheduled-detection-queries') / 2
	);
	close(amount(slower, 'dashboard-queries'), amount(regular, 'dashboard-queries') / 2);
	close(
		amount(shorter, 'scheduled-detection-queries'),
		amount(regular, 'scheduled-detection-queries') / 5
	);
	close(amount(shorter, 'dashboard-queries'), amount(regular, 'dashboard-queries') / 2);
	const empty = estimate('dynatrace-database', { retentionDays: 0 });
	assert.equal(amount(empty, 'scheduled-detection-queries'), 0);
	assert.equal(amount(empty, 'dashboard-queries'), 0);
	const minute = estimate('dynatrace-database', { retentionDays: 1 / 1440 });
	close(
		amount(minute, 'scheduled-detection-queries'),
		amount(regular, 'scheduled-detection-queries') / 5
	);
	close(amount(minute, 'dashboard-queries'), amount(regular, 'dashboard-queries') / 1440);
});

test('Dynatrace forwarding capacity and progressive Internet rates use the scaled raw input', () => {
	const near = estimate('dynatrace-database', { dailyGB: 432 });
	const over = estimate('dynatrace-database', { dailyGB: 432.2 });
	const large = estimate('dynatrace-database', { dailyGB: 100000 });
	close(amount(near, 'collector-compute'), 3127.32);
	close(amount(over, 'collector-compute'), 4690.98);
	close(amount(large, 'collector-compute'), 364332.78);
	close(amount(large, 'network-transfer'), 8544952.893366242);
	const empty = estimate('dynatrace-database', { dailyGB: 0 });
	for (const id of [
		'log-ingestion',
		'hot-log-retention',
		'investigation-queries',
		'scheduled-detection-queries',
		'dashboard-queries',
		'network-transfer'
	])
		assert.equal(amount(empty, id), 0);
	assert.equal(amount(empty, 'database-monitoring'), 96360);
});

test('retention changes data cost but never the three-year ownership horizon or fixed software meters', () => {
	for (const id of allIds)
		for (const retentionDays of [30, 365, 1095, 3650])
			assertLifecycle(estimate(id, { retentionDays }));
	for (const id of ['ibm-guardium-dam', 'datasunrise-dam', 'trellix-dam', 'aurva-dam'])
		close(
			amount(estimate(id, { retentionDays: 30 }), 'license-subscription'),
			amount(estimate(id, { retentionDays: 3650 }), 'license-subscription')
		);
});

test('every supported database/retention choice and extreme volume produces finite reconciled TCO', () => {
	assert.equal(DAM_PROVIDERS.length, 7);
	assert.equal(new Set(DAM_PROVIDERS.map(({ id }) => id)).size, 7);
	assert.ok(!DAM_PROVIDERS.some(({ id }) => id === 'idera-sql-compliance'));
	for (const id of allIds) {
		for (const databases of [100, 200, 300, 500])
			for (const retentionDays of [30, 90, 365, 1095, 3650]) {
				const quote = estimate(id, { databases, retentionDays });
				assert.ok(quote.total > 0);
				assertLifecycle(quote);
			}
		assertLifecycle(estimate(id, { dailyGB: 0, retentionDays: 0 }));
		assertLifecycle(estimate(id, { dailyGB: 100000, retentionDays: 3650 }));
	}
});

test('invalid products, database counts, raw volumes and retention cannot silently produce prices', () => {
	assert.throws(() => estimate('unknown'), RangeError);
	assert.throws(() => estimate('idera-sql-compliance'), RangeError);
	for (const id of allIds) {
		for (const databases of [0, 101, -1, NaN, Infinity])
			assert.throws(() => estimate(id, { databases }), RangeError);
		for (const retentionDays of [-1, NaN, Infinity])
			assert.throws(() => estimate(id, { retentionDays }), RangeError);
		for (const dailyGB of [-1, NaN, Infinity, undefined])
			assert.throws(() => estimate(id, { dailyGB }), RangeError);
	}
});

test('Dynatrace rejects invalid query counts and workload overrides without allowing infrastructure overrides', () => {
	for (const queriesPerMonth of [-1, NaN, Infinity])
		assert.throws(() => estimate('dynatrace-database', { queriesPerMonth }), RangeError);
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
