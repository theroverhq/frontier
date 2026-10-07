import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateDataLake } from '../src/lib/data-lake-pricing.mjs';

const baseline = { dailyGB: 250, retentionDays: 365, queriesPerMonth: 2500 };
const providers = ['cribl', 'elastic-security', 'bigquery', 'fabric'];
const close = (actual, expected) =>
	assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('published-rate baseline includes storage, ingestion, and selected compute', () => {
	close(estimateDataLake('cribl', baseline).monthly, 8812.25);
	close(estimateDataLake('elastic-security', baseline).monthly, 5358.75);
	close(estimateDataLake('fabric', baseline).monthly, 1842.0333333333333);
	const bigquery = estimateDataLake('bigquery', baseline);
	close(bigquery.storage, 1506.1842644405365);
	close(bigquery.compute, 12961.157703399658);
});

test('BigQuery free quotas and minimum per-query billed bytes are respected', () => {
	const small = { dailyGB: 0.001, retentionDays: 30, queriesPerMonth: 1000 };
	assert.equal(estimateDataLake('bigquery', small).monthly, 0);
	// With zero scanned bytes configured, 209,716 queries still each bill 10 MiB.
	const minimum = estimateDataLake('bigquery', {
		...small,
		queriesPerMonth: 209716,
		configuration: { scanFraction: 0 }
	});
	close(minimum.compute, ((209716 * 10) / 1048576 - 1) * 6.25);
});

test('BigQuery older immutable partitions receive long-term logical storage rates', () => {
	const before = estimateDataLake('bigquery', { ...baseline, retentionDays: 90 });
	const after = estimateDataLake('bigquery', { ...baseline, retentionDays: 91 });
	close(after.storage - before.storage, ((250 * 1e9) / 2 ** 30) * 0.016);
});

test('only compressed-storage models receive a compression discount', () => {
	for (const id of providers) {
		const original = estimateDataLake(id, baseline);
		const doubledCompression = estimateDataLake(id, {
			...baseline,
			configuration: { compressionRatio: 6 }
		});
		close(
			doubledCompression.storage,
			['cribl', 'fabric'].includes(id) ? original.storage / 2 : original.storage
		);
		assert.equal(doubledCompression.compute, original.compute);
	}
});

test('query volume changes metered queries, not provisioned capacity or included Security search', () => {
	for (const id of providers) {
		const original = estimateDataLake(id, baseline);
		const moreQueries = estimateDataLake(id, { ...baseline, queriesPerMonth: 25000 });
		if (id === 'bigquery') assert.ok(moreQueries.compute > original.compute);
		else assert.equal(moreQueries.monthly, original.monthly);
	}
});

test('capacity controls alter compute independently of retention', () => {
	const fabric = estimateDataLake('fabric', baseline);
	const fabricF16 = estimateDataLake('fabric', {
		...baseline,
		configuration: { fabricCapacityCUs: 16 }
	});
	close(fabricF16.compute, fabric.compute * 2);
	assert.equal(fabricF16.storage, fabric.storage);
	close(
		estimateDataLake('cribl', { ...baseline, configuration: { criblSearchTier: 0 } }).compute,
		452
	);
});

test('Elastic Security bills ingestion and retained GB, with Complete as the default', () => {
	const complete = estimateDataLake('elastic-security', baseline);
	close(complete.ingestion, 2583.75);
	close(complete.storage, 2775);
	assert.equal(complete.compute, 0);
	const essentials = estimateDataLake('elastic-security', {
		...baseline,
		configuration: { elasticSecurityTier: 'essentials' }
	});
	close(essentials.ingestion, 2153.125);
	close(essentials.storage, 2497.5);
	close(essentials.monthly, 4650.625);
	assert.equal(essentials.compute, 0);
	const currentDefaults = estimateDataLake('elastic-security', {
		dailyGB: 1000,
		retentionDays: 1095,
		queriesPerMonth: 30200
	});
	close(currentDefaults.ingestion, 5855);
	close(currentDefaults.storage, 25320);
	close(currentDefaults.monthly, 31175);
	close(currentDefaults.yearly, 374100);
});

// Independently summed invoices from Elastic's Security AWS us-east-1 price table,
// effective 2025-11-01. Boundary totals protect graduated pricing from becoming
// a retroactive volume discount or applying monthly bands to annual ingestion.
// https://cloud.elastic.co/cloud-pricing-table?productType=serverless&group=serverless-projects&solution=security&provider=aws&region=us-east-1
test('Elastic Security monthly ingestion uses graduated bands at every discount boundary', () => {
	const invoices = {
		complete: [
			[1500, 900, 0.6, 0.39],
			[3000, 1485, 0.39, 0.27],
			[6000, 2295, 0.27, 0.18],
			[15000, 3915, 0.18, 0.126],
			[30000, 5805, 0.126, 0.12],
			[60000, 9405, 0.12, 0.114],
			[150000, 19665, 0.114, 0.111]
		],
		essentials: [
			[1500, 750, 0.5, 0.325],
			[3000, 1237.5, 0.325, 0.225],
			[6000, 1912.5, 0.225, 0.15],
			[15000, 3262.5, 0.15, 0.105],
			[30000, 4837.5, 0.105, 0.1],
			[60000, 7837.5, 0.1, 0.095],
			[150000, 16387.5, 0.095, 0.0925]
		]
	};
	for (const [tier, boundaries] of Object.entries(invoices)) {
		for (const [monthlyGB, expected, previousRate, nextRate] of boundaries) {
			for (const delta of [-1, 0, 1]) {
				const invoice = estimateDataLake('elastic-security', {
					dailyGB: ((monthlyGB + delta) * 12) / 365,
					retentionDays: 0,
					queriesPerMonth: 0,
					configuration: { elasticSecurityTier: tier }
				});
				close(invoice.monthly, expected + delta * (delta < 0 ? previousRate : nextRate));
				close(invoice.yearly, invoice.monthly * 12);
				assert.equal(invoice.storage, 0);
			}
		}
	}
});

test('Elastic Security retention is graduated independently of ingestion and without a free window', () => {
	const invoices = {
		complete: [
			[10000, 400, 0.04, 0.032],
			[20000, 720, 0.032, 0.03],
			[50000, 1620, 0.03, 0.028],
			[100000, 3020, 0.028, 0.026],
			[250000, 6920, 0.026, 0.022],
			[1000000, 23420, 0.022, 0.02],
			[2500000, 53420, 0.02, 0.0188]
		],
		essentials: [
			[10000, 360, 0.036, 0.0288],
			[20000, 648, 0.0288, 0.027],
			[50000, 1458, 0.027, 0.0252],
			[100000, 2718, 0.0252, 0.0234],
			[250000, 6228, 0.0234, 0.0198],
			[1000000, 21078, 0.0198, 0.018],
			[2500000, 48078, 0.018, 0.0169]
		]
	};
	for (const [tier, boundaries] of Object.entries(invoices)) {
		const firstDay = estimateDataLake('elastic-security', {
			dailyGB: 1,
			retentionDays: 1,
			queriesPerMonth: 0,
			configuration: { elasticSecurityTier: tier }
		});
		close(firstDay.storage, tier === 'complete' ? 0.04 : 0.036);
		for (const [retainedGB, expected, previousRate, nextRate] of boundaries) {
			for (const delta of [-1, 0, 1]) {
				const invoice = estimateDataLake('elastic-security', {
					dailyGB: 1,
					retentionDays: retainedGB + delta,
					queriesPerMonth: 0,
					configuration: { elasticSecurityTier: tier }
				});
				close(invoice.storage, expected + delta * (delta < 0 ? previousRate : nextRate));
				close(invoice.ingestion, firstDay.ingestion);
			}
		}
	}
});

test('all supported workload sizes produce finite totals and consistent annual billing', () => {
	for (const id of providers)
		for (const dailyGB of [10, 100, 250, 500, 1000, 2000, 10000, 100000]) {
			for (const retentionDays of [30, 90, 365, 1095, 3650])
				for (const queriesPerMonth of [520, 2500, 540000]) {
					const estimate = estimateDataLake(id, { dailyGB, retentionDays, queriesPerMonth });
					assert.ok(Number.isFinite(estimate.monthly) && estimate.monthly > 0);
					close(estimate.monthly, estimate.ingestion + estimate.storage + estimate.compute);
					close(estimate.yearly, estimate.monthly * 12);
				}
		}
});

test('invalid workloads and capacity selections cannot produce misleading totals', () => {
	assert.throws(() => estimateDataLake('bigquery', { ...baseline, dailyGB: -1 }), RangeError);
	assert.throws(
		() => estimateDataLake('fabric', { ...baseline, configuration: { fabricCapacityCUs: 3 } }),
		RangeError
	);
	assert.throws(
		() => estimateDataLake('cribl', { ...baseline, configuration: { criblSearchTier: 99 } }),
		RangeError
	);
	assert.throws(
		() =>
			estimateDataLake('elastic-security', {
				...baseline,
				configuration: { elasticSecurityTier: 'enterprise' }
			}),
		RangeError
	);
	assert.throws(
		() =>
			estimateDataLake('fabric', { ...baseline, configuration: { compressionRatio: Infinity } }),
		RangeError
	);
});
