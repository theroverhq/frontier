/**
 * Illustrative competitor latency model, not a benchmark or a vendor performance guarantee.
 * Most profiles model one uncached, selective historical investigation across
 * the selected retention window. Elastic models four uncached query categories
 * requiring substantial object-storage reads. Monthly query volume is deliberately excluded.
 */
const COMPRESSION_RATIO = 3;
const CANDIDATE_FRACTION = 0.01;
const ATHENA_TIMEOUT_SECONDS = 240 * 60;
const ELASTIC_REFERENCE_RETAINED_GB = 1000 * 1095;
const ELASTIC_OBJECT_READ_FLOOR_SECONDS = 2;

// User-provided theoretical Elastic Security Serverless planning table for
// 1 TB/day retained for three years (1,095,000 GB, approximately 1.1 PB).
// Use only the "Substantial reads from object storage required" column;
// cached query ranges are deliberately excluded. These are not measurements.
const ELASTIC_OBJECT_STORAGE_SCENARIOS = {
	needle: [2, 60],
	filter: [3, 90],
	filteredAggregation: [30, 300],
	fullEventMetric: [900, 3600]
};

// Snowflake/Databricks ranges surround the existing 1,000 compressed GB/hour
// sizing assumption in src/lib/components/PricingCalculator.svelte. They are
// not claims about measured XS warehouse or 4 DBU/hour performance.
const warehouseProfile = {
	indexed: false,
	throughputGBPerSecond: [500 / 3600, 1500 / 3600],
	throughputDescription: '500–1,500 compressed GB/hour of aggregate throughput',
	setupSeconds: [5, 30]
};

const PROFILES = new Map([
	['snowflake', warehouseProfile],
	['databricks', warehouseProfile],
	[
		'athena',
		{
			// Reuse the illustrative range from this calculator's archive model.
			// AWS examples provide context, not bounds for this historical query.
			// https://aws.amazon.com/blogs/big-data/top-10-performance-tuning-tips-for-amazon-athena/
			// https://docs.aws.amazon.com/athena/latest/ug/service-limits.html
			indexed: false,
			throughputGBPerSecond: [0.4, 3.5],
			throughputDescription: '0.4–3.5 compressed GB/s of aggregate throughput',
			setupSeconds: [2, 10]
		}
	],
	[
		'cribl',
		{
			// Medium federated Search is the pricing configuration. Its modeled
			// throughput is an assumption, not an inferred or guaranteed tier limit.
			// https://cribl.io/pricing/search/
			// https://docs.cribl.io/search/
			indexed: false,
			throughputGBPerSecond: [0.5, 2],
			throughputDescription:
				'0.5–2 compressed GB/s of aggregate throughput, assuming Medium federated Search',
			setupSeconds: [3, 15]
		}
	],
	[
		'bigquery',
		{
			// On-demand capacity varies with available slots. The range below is
			// hypothetical capacity for this scenario, not an on-demand guarantee.
			// https://docs.cloud.google.com/bigquery/docs/slots
			indexed: false,
			throughputGBPerSecond: [4, 16],
			throughputDescription:
				'4–16 compressed GB/s of aggregate throughput, assuming on-demand capacity',
			setupSeconds: [2, 10]
		}
	],
	[
		'fabric',
		{
			// F8 is the pricing configuration, not a measured throughput guarantee.
			// https://learn.microsoft.com/en-us/fabric/data-warehouse/guidelines-warehouse-performance
			indexed: false,
			throughputGBPerSecond: [0.5, 2],
			throughputDescription: '0.5–2 compressed GB/s of aggregate throughput, assuming F8 capacity',
			setupSeconds: [2, 10]
		}
	]
]);

/** @param {number} seconds */
function durationUnit(seconds) {
	if (seconds >= 3600) return { divisor: 3600, unit: 'hr', precision: 10 };
	if (seconds >= 60) return { divisor: 60, unit: 'min', precision: 1 };
	if (seconds >= 1) return { divisor: 1, unit: 'sec', precision: 1 };
	return { divisor: 0.001, unit: 'ms', precision: 1 };
}

/** @param {number} seconds @param {'lower' | 'upper'} bound */
function duration(seconds, bound) {
	const { divisor, unit, precision } = durationUnit(seconds);
	const round = bound === 'lower' ? Math.floor : Math.ceil;
	const value = round((seconds / divisor) * precision) / precision;
	return { value: value.toLocaleString('en-US', { maximumFractionDigits: 1 }), unit };
}

/** @param {number} lowerSeconds @param {number} upperSeconds */
function durationRange(lowerSeconds, upperSeconds) {
	const lower = duration(lowerSeconds, 'lower');
	const upper = duration(upperSeconds, 'upper');
	return lower.unit === upper.unit
		? `${lower.value}–${upper.value} ${upper.unit}`
		: `${lower.value} ${lower.unit}–${upper.value} ${upper.unit}`;
}

/** @param {number} quantity */
function formatGB(quantity) {
	return quantity > 0 && quantity < 0.000001
		? quantity.toExponential(3)
		: quantity.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

/**
 * Numeric bounds are the modeled execution time before any query timeout.
 * Only the Athena display is capped at its modeled maximum timeout marker.
 *
 * @param {string} provider
 * @param {{dailyGB: number, retentionDays: number}} workload
 * @returns {{label: string, title: string, lowerSeconds: number, upperSeconds: number, scannedGB?: number, retainedGB: number, timeoutRisk: boolean, scenarios?: Record<string, {lowerSeconds: number, upperSeconds: number}>} | null}
 */
export function estimateQueryLatency(provider, { dailyGB, retentionDays }) {
	for (const value of [dailyGB, retentionDays]) {
		if (!Number.isFinite(value) || value < 0)
			throw new RangeError('Ingestion and retention must be finite and non-negative.');
	}
	const retainedGB = dailyGB * retentionDays;
	if (!Number.isFinite(retainedGB))
		throw new RangeError('Retained data exceeds the supported numeric range.');
	if (retainedGB === 0) return null;
	if (provider === 'elastic-security') {
		const scale = retainedGB / ELASTIC_REFERENCE_RETAINED_GB;
		const scenarios = Object.fromEntries(
			Object.entries(ELASTIC_OBJECT_STORAGE_SCENARIOS).map(([category, [lower, upper]]) => [
				category,
				{
					lowerSeconds: Math.max(ELASTIC_OBJECT_READ_FLOOR_SECONDS, lower * scale),
					upperSeconds: Math.max(ELASTIC_OBJECT_READ_FLOOR_SECONDS, upper * scale)
				}
			])
		);
		const bounds = Object.values(scenarios);
		const lowerSeconds = Math.min(...bounds.map((scenario) => scenario.lowerSeconds));
		const upperSeconds = Math.max(...bounds.map((scenario) => scenario.upperSeconds));
		const minimumDuration = duration(lowerSeconds, 'lower');
		const range =
			lowerSeconds === upperSeconds
				? `${minimumDuration.value} ${minimumDuration.unit}`
				: durationRange(lowerSeconds, upperSeconds);
		return {
			label: `est. ${range} query latency`,
			title:
				`Theoretical Elastic Security Serverless estimate, not a measured benchmark or vendor guarantee. The displayed range is the minimum-to-maximum envelope across four uncached query categories requiring substantial object-storage reads, covering the selected retained history: ${formatGB(retainedGB)} GB retained. ` +
				'Assumes a reference of 1 TB/day retained for three years: 1,095,000 GB (1.095 PB). Reference ranges: indexed needle lookup 2–60 seconds; filtered search 3–90 seconds; filtered aggregation 30–300 seconds; full-event metric aggregation 900–3,600 seconds. ' +
				'Each category is scaled linearly with retained volume at unchanged assumed effective compute, with a 2-second minimum floor for object-read overhead. This is a planning model, not measured throughput or scan volume. ' +
				'Cached query ranges are excluded. Cache state and the searched time window cannot be inferred from retention alone. Queries within a fixed time window do not necessarily grow with total retention. ' +
				'More queries per month do not change this per-query model. Excludes queueing and additional cold-start/autoscaling delays; actual latency may fall outside these assumed ranges.',
			lowerSeconds,
			upperSeconds,
			retainedGB,
			timeoutRisk: false,
			scenarios
		};
	}
	const profile = PROFILES.get(provider);
	if (!profile) return null;
	const scannedGB = (retainedGB * CANDIDATE_FRACTION) / COMPRESSION_RATIO;
	const [slowThroughput, fastThroughput] = profile.throughputGBPerSecond;
	const [minimumSetup, maximumSetup] = profile.setupSeconds;
	const lowerSeconds = minimumSetup + scannedGB / fastThroughput;
	const upperSeconds = maximumSetup + scannedGB / slowThroughput;
	if (![scannedGB, lowerSeconds, upperSeconds].every(Number.isFinite))
		throw new RangeError('Estimated query duration exceeds the supported numeric range.');
	const timeoutRisk = provider === 'athena' && upperSeconds > ATHENA_TIMEOUT_SECONDS;
	const range =
		timeoutRisk && lowerSeconds >= ATHENA_TIMEOUT_SECONDS
			? '>4 hr'
			: durationRange(lowerSeconds, timeoutRisk ? ATHENA_TIMEOUT_SECONDS : upperSeconds);
	const indexAssumption = ' No additional secondary-index or result-cache acceleration is assumed.';
	const timeoutDescription =
		provider === 'athena'
			? ' Athena display uses a modeled 240-minute maximum query timeout; configured limits may be lower. A timeout marker means the modeled work may exceed that limit, not that a query will complete after running longer. https://docs.aws.amazon.com/athena/latest/ug/service-limits.html'
			: '';
	return {
		label: `est. ${range} query latency${timeoutRisk ? ' · timeout risk' : ''}`,
		title:
			`Theoretical estimate, not a measured benchmark or vendor guarantee. One uncached selective historical search across the entire selected retention window: ${formatGB(retainedGB)} GB retained. ` +
			`Assumes source/time/column pruning leaves 1% of retained data as candidates and 3:1 compression.${indexAssumption} ` +
			`Modeled read volume: ${formatGB(scannedGB)} compressed GB. Assumed ${profile.throughputDescription}, plus ${minimumSetup}–${maximumSetup} seconds setup. ` +
			'Excludes queueing, additional cold-start/autoscaling delays, and complex aggregations. More queries per month do not change this per-query model. Retaining more data does not slow a search with a fixed time window; this scenario searches the selected retained history.' +
			timeoutDescription,
		lowerSeconds,
		upperSeconds,
		scannedGB,
		retainedGB,
		timeoutRisk
	};
}
