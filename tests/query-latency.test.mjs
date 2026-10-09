import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateQueryLatency } from '../src/lib/query-latency.mjs';

const providers = [
	'elastic-security',
	'snowflake',
	'databricks',
	'athena',
	'cribl',
	'bigquery',
	'fabric'
];
const defaultWorkload = { dailyGB: 1000, retentionDays: 1095 };
const close = (actual, expected) =>
	assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('three-year Elastic range uses all four object-storage query categories', () => {
	const elastic = estimateQueryLatency('elastic-security', defaultWorkload);
	assert.equal(elastic.retainedGB, 1095000);
	assert.equal(elastic.lowerSeconds, 2);
	assert.equal(elastic.upperSeconds, 3600);
	assert.equal(elastic.label, 'est. 2 sec–1 hr query latency');
	assert.match(elastic.title, /not a measured benchmark/);
	assert.match(elastic.title, /1,095,000 GB retained/);
	assert.match(elastic.title, /1 TB\/day retained for three years/);
	assert.match(elastic.title, /scaled linearly with retained volume/);
	assert.match(elastic.title, /minimum-to-maximum envelope/);
	assert.match(elastic.title, /unchanged assumed effective compute/);
	assert.match(elastic.title, /2-second minimum floor/);
	assert.equal(elastic.scannedGB, undefined);
	assert.deepEqual(elastic.scenarios, {
		needle: { lowerSeconds: 2, upperSeconds: 60 },
		filter: { lowerSeconds: 3, upperSeconds: 90 },
		filteredAggregation: { lowerSeconds: 30, upperSeconds: 300 },
		fullEventMetric: { lowerSeconds: 900, upperSeconds: 3600 }
	});
});

test('one-year Elastic window scales the three-year object-storage reference', () => {
	const oneYear = estimateQueryLatency('elastic-security', {
		dailyGB: 1000,
		retentionDays: 365
	});
	assert.equal(oneYear.retainedGB, 365000);
	assert.equal(oneYear.lowerSeconds, 2);
	assert.equal(oneYear.upperSeconds, 1200);
	assert.equal(oneYear.label, 'est. 2 sec–20 min query latency');
	assert.deepEqual(oneYear.scenarios, {
		needle: { lowerSeconds: 2, upperSeconds: 20 },
		filter: { lowerSeconds: 2, upperSeconds: 30 },
		filteredAggregation: { lowerSeconds: 10, upperSeconds: 100 },
		fullEventMetric: { lowerSeconds: 300, upperSeconds: 1200 }
	});
});

test('Elastic excludes cached scenarios and keeps object-read overhead at small volumes', () => {
	for (const workload of [
		{ dailyGB: 10, retentionDays: 30 },
		defaultWorkload,
		{ dailyGB: 100000, retentionDays: 3650 }
	]) {
		const estimate = estimateQueryLatency('elastic-security', workload);
		assert.equal(estimate.scenarios.recent, undefined);
		assert.equal(estimate.scenarios.targeted, undefined);
		assert.equal(estimate.scenarios.broad, undefined);
		assert.ok(estimate.lowerSeconds >= 2);
		assert.match(estimate.title, /Cached query ranges are excluded/);
		assert.match(
			estimate.title,
			/Cache state and the searched time window cannot be inferred from retention alone/
		);
		assert.match(estimate.title, /fixed time window do not necessarily grow with total retention/);
	}
	const small = estimateQueryLatency('elastic-security', { dailyGB: 10, retentionDays: 30 });
	assert.equal(small.lowerSeconds, 2);
	assert.equal(small.upperSeconds, 2);
	assert.equal(small.label, 'est. 2 sec query latency');
	for (const bounds of Object.values(small.scenarios)) {
		assert.deepEqual(bounds, { lowerSeconds: 2, upperSeconds: 2 });
	}
});

test('warehouse estimates surround the throughput already used by pricing', () => {
	for (const id of ['snowflake', 'databricks']) {
		const estimate = estimateQueryLatency(id, defaultWorkload);
		assert.equal(estimate.scannedGB, 3650);
		// 3,650 GB at the existing 1,000 GB/hour planning rate takes 3.65 hours.
		assert.ok(estimate.lowerSeconds < 3.65 * 3600);
		assert.ok(estimate.upperSeconds > 3.65 * 3600);
		close(estimate.lowerSeconds, 8765);
		close(estimate.upperSeconds, 26310);
		assert.equal(estimate.label, 'est. 2.4–7.4 hr query latency');
	}
});

test('retention and ingestion increase historical bounds without decreasing the object-read floor', () => {
	for (const id of providers) {
		const short = estimateQueryLatency(id, { dailyGB: 1000, retentionDays: 30 });
		const long = estimateQueryLatency(id, defaultWorkload);
		const larger = estimateQueryLatency(id, { dailyGB: 2000, retentionDays: 1095 });
		for (const [before, after] of [
			[short, long],
			[long, larger]
		]) {
			assert.ok(after.retainedGB > before.retainedGB, id);
			if (id !== 'elastic-security') assert.ok(after.scannedGB > before.scannedGB, id);
			if (id === 'elastic-security') {
				assert.ok(after.lowerSeconds >= before.lowerSeconds);
				for (const category of Object.keys(before.scenarios)) {
					assert.ok(
						after.scenarios[category].lowerSeconds >= before.scenarios[category].lowerSeconds
					);
					assert.ok(
						after.scenarios[category].upperSeconds > before.scenarios[category].upperSeconds
					);
				}
			} else {
				assert.ok(after.lowerSeconds > before.lowerSeconds, id);
			}
			assert.ok(after.upperSeconds > before.upperSeconds, id);
		}
		assert.ok(long.lowerSeconds <= long.upperSeconds, id);
	}
});

test('supported profiles expose estimates and scan models retain their volume assumptions', () => {
	for (const id of providers) {
		const estimate = estimateQueryLatency(id, defaultWorkload);
		assert.match(estimate.label, /^est\. /, id);
		assert.match(estimate.label, /query latency/, id);
		assert.equal(estimate.timeoutRisk, false, id);
		if (id !== 'elastic-security') {
			assert.equal(estimate.scannedGB, 3650);
			assert.match(estimate.title, /3:1 compression/, id);
			assert.equal(estimate.scenarios, undefined, id);
		}
		assert.match(estimate.title, /More queries per month do not change this per-query model/, id);
	}
});

test('monthly query count cannot change a single-query estimate', () => {
	for (const id of providers) {
		assert.deepEqual(
			estimateQueryLatency(id, { ...defaultWorkload, queriesPerMonth: 100 }),
			estimateQueryLatency(id, { ...defaultWorkload, queriesPerMonth: 1000000 }),
			id
		);
	}
});

test('unsupported providers and an empty retained window do not receive a badge', () => {
	assert.equal(estimateQueryLatency('unknown', defaultWorkload), null);
	assert.equal(estimateQueryLatency('rover', defaultWorkload), null);
	assert.equal(estimateQueryLatency('__proto__', defaultWorkload), null);
	for (const id of providers) {
		assert.equal(estimateQueryLatency(id, { dailyGB: 0, retentionDays: 1095 }), null);
		assert.equal(estimateQueryLatency(id, { dailyGB: 1000, retentionDays: 0 }), null);
	}
});

test('invalid inputs and retained-volume overflow are rejected', () => {
	for (const invalid of [-1, Infinity, -Infinity, NaN, undefined, '1000']) {
		assert.throws(
			() => estimateQueryLatency('elastic-security', { dailyGB: invalid, retentionDays: 1095 }),
			RangeError
		);
		assert.throws(
			() => estimateQueryLatency('elastic-security', { dailyGB: 1000, retentionDays: invalid }),
			RangeError
		);
	}
	assert.throws(
		() => estimateQueryLatency('elastic-security', { dailyGB: Number.MAX_VALUE, retentionDays: 2 }),
		RangeError
	);
});

test('finite huge Elastic inputs preserve ordered finite bounds', () => {
	const estimate = estimateQueryLatency('elastic-security', {
		dailyGB: Number.MAX_VALUE,
		retentionDays: 1
	});
	assert.ok(Number.isFinite(estimate.lowerSeconds));
	assert.ok(Number.isFinite(estimate.upperSeconds));
	assert.ok(estimate.lowerSeconds <= estimate.upperSeconds);
	for (const bounds of Object.values(estimate.scenarios)) {
		assert.ok(Number.isFinite(bounds.lowerSeconds));
		assert.ok(Number.isFinite(bounds.upperSeconds));
		assert.ok(bounds.lowerSeconds <= bounds.upperSeconds);
	}
});

test('Athena marks the modeled timeout without displaying a days-long query', () => {
	const partialTimeout = estimateQueryLatency('athena', { dailyGB: 2000, retentionDays: 1095 });
	assert.equal(partialTimeout.timeoutRisk, true);
	assert.ok(partialTimeout.lowerSeconds < 14400);
	assert.ok(partialTimeout.upperSeconds > 14400);
	assert.match(partialTimeout.label, /4 hr query latency · timeout risk$/);
	assert.match(partialTimeout.title, /configured limits may be lower/);
	const exceedsTimeout = estimateQueryLatency('athena', {
		dailyGB: 100000,
		retentionDays: 3650
	});
	assert.equal(exceedsTimeout.timeoutRisk, true);
	assert.ok(exceedsTimeout.lowerSeconds > 14400);
	assert.equal(exceedsTimeout.label, 'est. >4 hr query latency · timeout risk');
	assert.doesNotMatch(exceedsTimeout.label, /days?/);
	assert.ok(Number.isFinite(exceedsTimeout.lowerSeconds));
	assert.ok(Number.isFinite(exceedsTimeout.upperSeconds));
});

test('displayed ranges round outward rather than narrowing theoretical bounds', () => {
	const short = estimateQueryLatency('elastic-security', { dailyGB: 1000, retentionDays: 30 });
	assert.equal(short.label, 'est. 2 sec–2 min query latency');
	assert.equal(short.lowerSeconds, 2);
	close(short.upperSeconds, 98.63013698630137);
	assert.ok(short.upperSeconds <= 120);
	const minute = estimateQueryLatency('bigquery', defaultWorkload);
	assert.equal(minute.label, 'est. 3–16 min query latency');
	const mixedUnits = estimateQueryLatency('cribl', defaultWorkload);
	assert.equal(mixedUnits.label, 'est. 30 min–2.1 hr query latency');
});
