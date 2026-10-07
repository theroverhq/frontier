/** Public USD rates verified 2026-10-07. These are planning estimates, not quotes. */
export const CRIBL_SEARCH_TIERS = [
	{ name: 'Nano', monthlyUSD: 452 },
	{ name: 'Micro', monthlyUSD: 904 },
	{ name: 'X-Small', monthlyUSD: 1808 },
	{ name: 'Small', monthlyUSD: 3436 },
	{ name: 'Medium', monthlyUSD: 6531 },
	{ name: 'Large', monthlyUSD: 12410 },
	{ name: 'X-Large', monthlyUSD: 23581 }
];
export const FABRIC_CAPACITIES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
// AWS us-east-1, effective 2025-11-01, verified 2026-10-07:
// https://cloud.elastic.co/api/v1/prices/base_prices?product_family=security
// Ingestion bands apply to monthly GB; retention bands to stored GB-month.
const ELASTIC_SECURITY_RATES = {
	complete: {
		ingest: [
			[1500, 0.6],
			[3000, 0.39],
			[6000, 0.27],
			[15000, 0.18],
			[30000, 0.126],
			[60000, 0.12],
			[150000, 0.114],
			[Infinity, 0.111]
		],
		retention: [
			[10000, 0.04],
			[20000, 0.032],
			[50000, 0.03],
			[100000, 0.028],
			[250000, 0.026],
			[1000000, 0.022],
			[2500000, 0.02],
			[Infinity, 0.0188]
		]
	},
	essentials: {
		ingest: [
			[1500, 0.5],
			[3000, 0.325],
			[6000, 0.225],
			[15000, 0.15],
			[30000, 0.105],
			[60000, 0.1],
			[150000, 0.095],
			[Infinity, 0.0925]
		],
		retention: [
			[10000, 0.036],
			[20000, 0.0288],
			[50000, 0.027],
			[100000, 0.0252],
			[250000, 0.0234],
			[1000000, 0.0198],
			[2500000, 0.018],
			[Infinity, 0.0169]
		]
	}
};

/** @param {number} quantity @param {number[][]} bands */
function graduatedCost(quantity, bands) {
	let total = 0;
	let previousLimit = 0;
	for (const [limit, rate] of bands) {
		total += Math.max(0, Math.min(quantity, limit) - previousLimit) * rate;
		if (quantity <= limit) break;
		previousLimit = limit;
	}
	return total;
}

export const DATA_LAKE_DEFAULTS = {
	compressionRatio: 3,
	scanFraction: 0.01,
	criblSearchTier: 4,
	elasticSecurityTier: 'complete',
	fabricCapacityCUs: 8,
	fabricHoursPerMonth: 730
};

/**
 * @typedef {'cribl' | 'elastic-security' | 'bigquery' | 'fabric'} AdditionalLakeId
 * @typedef {typeof DATA_LAKE_DEFAULTS} LakeConfiguration
 * @typedef {{ dailyGB: number, retentionDays: number, queriesPerMonth: number, configuration?: Partial<LakeConfiguration> }} LakeWorkload
 */

/**
 * Steady-state retained volumes; annual prices are twelve monthly estimates.
 * Fixed capacity is deliberately not inferred from query count or ingest volume.
 * @param {AdditionalLakeId} provider
 * @param {LakeWorkload} workload
 */
export function estimateDataLake(provider, workload) {
	const config = { ...DATA_LAKE_DEFAULTS, ...workload.configuration };
	const { dailyGB, retentionDays, queriesPerMonth } = workload;
	for (const value of [dailyGB, retentionDays, queriesPerMonth]) {
		if (!Number.isFinite(value) || value < 0)
			throw new RangeError('Workload must be finite and non-negative.');
	}
	if (
		!Number.isFinite(config.compressionRatio) ||
		!(config.compressionRatio > 0) ||
		!(config.scanFraction >= 0 && config.scanFraction <= 1)
	) {
		throw new RangeError('Invalid compression or scan fraction.');
	}
	if (!Number.isFinite(config.fabricHoursPerMonth) || config.fabricHoursPerMonth < 0)
		throw new RangeError('Capacity must be finite and non-negative.');
	if (config.fabricHoursPerMonth > 730)
		throw new RangeError('Provisioned hours cannot exceed the average month.');
	const retainedRawGB = dailyGB * retentionDays;
	const retainedCompressedGB = retainedRawGB / config.compressionRatio;
	let ingestion = 0;
	let storage = 0;
	let compute = 0;
	let basis = '';

	if (provider === 'cribl') {
		const tier = CRIBL_SEARCH_TIERS[config.criblSearchTier];
		if (!tier) throw new RangeError('Unknown Cribl Search tier.');
		// https://cribl.io/pricing/lake/ — Direct Access $0.10/raw GB,
		// managed Lake $0.05/compressed GB-month. Search is separate.
		// https://cribl.io/pricing/search/ — US federated tier monthly rates.
		ingestion = dailyGB * (365 / 12) * 0.1;
		storage = retainedCompressedGB * 0.05;
		compute = tier.monthlyUSD;
		basis = `US · Direct Access + managed Lake + ${tier.name} Search`;
	} else if (provider === 'elastic-security') {
		const tier = config.elasticSecurityTier;
		if (tier !== 'complete' && tier !== 'essentials')
			throw new RangeError('Unknown Elastic Security tier.');
		const rates = ELASTIC_SECURITY_RATES[tier];
		// Ingest and retained volume are fully enriched, normalized, uncompressed GB.
		// Assume normalized volume equals the input volume (1× expansion).
		// Search compute is included; optional AI executions/tokens and egress are not modeled.
		ingestion = graduatedCost(dailyGB * (365 / 12), rates.ingest);
		storage = graduatedCost(retainedRawGB, rates.retention);
		basis = `AWS us-east-1 · Security Analytics ${tier === 'complete' ? 'Complete' : 'Essentials'} · tiered ingestion + retention; AI add-ons excluded`;
	} else if (provider === 'bigquery') {
		// Iowa us-central1 logical storage: $0.023 active / $0.016 long-term GiB-month.
		// On demand: $6.25/TiB after 1 TiB/month; 10 MiB per query/table minimum.
		// https://cloud.google.com/bigquery/pricing
		// Batch loads into an append-only, daily-partitioned table; logical bytes
		// assumed equal to input bytes. Unmodified partitions age after 90 days.
		const activeGiB = (dailyGB * Math.min(retentionDays, 90) * 1e9) / 2 ** 30;
		const longTermGiB = (dailyGB * Math.max(0, retentionDays - 90) * 1e9) / 2 ** 30;
		// One shared 10 GiB free allowance, applied to active storage first.
		storage =
			Math.max(0, activeGiB - 10) * 0.023 +
			Math.max(0, longTermGiB - Math.max(0, 10 - activeGiB)) * 0.016;
		const scannedMiBPerQuery = Math.max(
			10,
			Math.ceil((retainedRawGB * 1e9 * config.scanFraction) / 2 ** 20)
		);
		const scannedTiBPerMonth = (scannedMiBPerQuery * queriesPerMonth) / 2 ** 20;
		compute = Math.max(0, scannedTiBPerMonth - 1) * 6.25;
		basis = 'Google Cloud Iowa · logical storage + on-demand queries · batch ingestion';
	} else if (provider === 'fabric') {
		if (!FABRIC_CAPACITIES.includes(config.fabricCapacityCUs))
			throw new RangeError('Unknown Fabric capacity.');
		// East US verified Azure Retail Prices API: $0.18/CU-hour + $0.026/GB-month.
		// https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Microsoft%20Fabric%27%20and%20armRegionName%20eq%20%27eastus%27&currencyCode=USD
		// Compressed files in OneLake; no reservation discount or capacity overage.
		storage = retainedCompressedGB * 0.026;
		compute = config.fabricCapacityCUs * config.fabricHoursPerMonth * 0.18;
		basis = `Azure East US · F${config.fabricCapacityCUs} PAYG · ${config.fabricHoursPerMonth} h/mo`;
	} else {
		throw new RangeError('Unknown data lake provider.');
	}
	const monthly = ingestion + storage + compute;
	return { monthly, yearly: monthly * 12, ingestion, storage, compute, basis };
}
