/**
 * Published vendor license and consumption rates checked 2026-10-10.
 * This comparison estimates vendor fees, not complete deployment TCO.
 * Customer infrastructure, implementation and internal labor are outside scope.
 * All providers receive the same selected daily data volume; capture technology
 * alone does not establish a vendor-specific ingestion-volume conversion.
 * Three-year totals count one-time licenses once and annual fees each year.
 * Taxes and negotiated discounts are not modeled.
 */
import { createDamTco, validateDamWorkload } from './dam-tco.mjs';

export { DAM_LIFECYCLE_YEARS } from './dam-tco.mjs';

export const DAM_PROVIDERS = [
	{
		id: 'ibm-guardium-dam',
		name: 'IBM Guardium Data Protection',
		category: 'Enterprise DAM',
		logo: '/assets/vendor-logos/ibm.svg',
		retentionDescription: 'Default purge: 60 days',
		retentionSource: 'https://www.ibm.com/docs/en/gdp/12.x?topic=data-configuring-purge',
		source: 'https://aws.amazon.com/marketplace/pp/prodview-iwwxejrcekneg'
	},
	{
		id: 'imperva-dam',
		name: 'Imperva Data 360',
		category: 'Data Security Fabric',
		logo: '/assets/vendor-logos/imperva.svg',
		retentionDescription: 'Base retention: 13 months',
		retentionSource: 'https://www.imperva.com/products/plans/',
		licensingSource:
			'https://www.imperva.com/legal/wp-content/uploads/sites/14/2025/04/licensedefinitionsandrules.pdf',
		source:
			'https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/719953/581820883089188-pricing-document-2024-05-06-1147.pdf'
	},
	{
		id: 'oracle-avdf',
		name: 'Oracle Audit Vault & Database Firewall',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/oracle.png',
		retentionDescription: 'Default online retention: 12 months',
		retentionSource:
			'https://docs.oracle.com/en/database/oracle/audit-vault-database-firewall/20/sigau/secured_targets.html',
		licensingSource: 'https://www.oracle.com/a/ocom/docs/cloud-licensing-070579.pdf',
		source: 'https://www.oracle.com/ma/a/ocom/docs/corporate/pricing/us-public-sector-3904395.pdf'
	},
	{
		id: 'datasunrise-dam',
		name: 'DataSunrise Database Security',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/datasunrise.png',
		retentionSource:
			'https://www.datasunrise.com/guides/how-to/offload-audit-data-to-s3-and-read-it-by-aws-athena/',
		source: 'https://aws.amazon.com/marketplace/pp/prodview-h5srpjexxsnl4'
	},
	{
		id: 'aurva-dam',
		name: 'Aurva DAM',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/aurva.svg',
		source: 'https://aws.amazon.com/marketplace/pp/prodview-bbn5hfvvzd6cu'
	},
	{
		id: 'trellix-dam',
		name: 'Trellix Database Security',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/trellix.png',
		retentionSource:
			'https://docs.trellix.com/data-and-email/docs/configure-automatic-alert-archiving',
		source: 'https://www.shi.com/product/47592122/INSTI-DATABASE-SEC-1%3A1TE-5-250',
		volumeSource:
			'https://acquire.co.nz/p/miscellaneous/miscellaneous/database-security-11te-1yr-subscription-with-1yr-thrive-dcdece-aa-ba-9979487'
	},
	{
		id: 'dynatrace-database',
		name: 'Dynatrace Database Monitoring',
		logo: '/assets/vendor-logos/dynatrace.png',
		category: 'Database monitoring + log analytics (PostgreSQL/MySQL)',
		retentionDescription: 'Default statement retention: 35 days',
		retentionSource:
			'https://docs.dynatrace.com/docs/observe/infrastructure-observability/databases/concepts/statements-and-execution-plans',
		source: 'https://www.dynatrace.com/pricing/rate-card/',
		billingSource:
			'https://docs.dynatrace.com/docs/license/capabilities/app-infra-observability/database-monitoring',
		logIngestionSource:
			'https://docs.dynatrace.com/docs/license/capabilities/log-analytics/dps-log-ingest',
		logRetentionSource:
			'https://docs.dynatrace.com/docs/license/capabilities/log-analytics/dps-log-retain',
		logQuerySource:
			'https://docs.dynatrace.com/docs/license/capabilities/log-analytics/dps-log-query'
	}
];

// ECB 8 October 2026: USD 1.1186/EUR, GBP 0.84698/EUR, NZD 2.0014/EUR.
// https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
export const DAM_GBP_TO_USD = 1.1186 / 0.84698;
export const DAM_NZD_TO_USD = 1.1186 / 2.0014;

/**
 * @typedef {'ibm-guardium-dam' | 'imperva-dam' | 'oracle-avdf' | 'datasunrise-dam' | 'aurva-dam' | 'trellix-dam' | 'dynatrace-database'} DamProviderId
 * @typedef {{ processedVolumeRatio: number, detectionRuleCount: number, detectionIntervalMinutes: number, detectionLookbackMinutes: number, dashboardTiles: number, dashboardRefreshMinutes: number, dashboardHoursPerDay: number, dashboardDaysPerMonth: number, dashboardLookbackDays: number }} DynatraceUsageConfiguration
 * @typedef {{ databases: number, retentionDays: number, dailyGB: number, queriesPerMonth?: number, dynatraceConfiguration?: Partial<DynatraceUsageConfiguration> }} DamWorkload
 * @typedef {import('./dam-tco.mjs').DamTcoComponent} DamCostComponent
 */

// Oracle public license/support list and authorized-cloud Processor conversion.
// https://www.oracle.com/ma/a/ocom/docs/corporate/pricing/us-public-sector-3904395.pdf
// https://www.oracle.com/a/ocom/docs/cloud-licensing-070579.pdf
// https://www.oracle.com/us/corporate/pricing/authorized-cloud-environments-3493562.pdf
export const ORACLE_TCO_RATES = {
	licensePerProcessor: 6000,
	annualSupportPerProcessor: 1320
};

// One separate, single-node, multithreaded AWS target per selected database.
// Shared hosts, larger targets and Oracle Standard Edition require different sizing.
export const ORACLE_TCO_ASSUMPTIONS = {
	monitoredVCPUsPerDatabase: 4,
	vCPUsPerLicensedProcessor: 2
};

// Quadris G-Cloud 14 tariff, 2024, page 5. Prices are annual GBP.
// Progressive use of additional-server bands is an explicit conservative assumption;
// the published tariff does not unambiguously establish a 200-server invoice.
export const IMPERVA_TCO_RATES = {
	baseServers: 8,
	baseLicenseGBP: 100245.6,
	baseThreeYearRetentionGBP: 15422.4,
	baseUnlimitedRetentionGBP: 30844.8,
	additionalServerBands: [
		{
			capacity: 6,
			licenseGBP: 9435.2,
			threeYearRetentionGBP: 1451.2,
			unlimitedRetentionGBP: 2903.2
		},
		{
			capacity: 5,
			licenseGBP: 8550.4,
			threeYearRetentionGBP: 1315.2,
			unlimitedRetentionGBP: 2631.2
		},
		{
			capacity: 20,
			licenseGBP: 8019.2,
			threeYearRetentionGBP: 1233.6,
			unlimitedRetentionGBP: 2468
		},
		{
			capacity: 60,
			licenseGBP: 7429.6,
			threeYearRetentionGBP: 1143.2,
			unlimitedRetentionGBP: 2286.4
		},
		{
			capacity: 400,
			licenseGBP: 6486.4,
			threeYearRetentionGBP: 997.6,
			unlimitedRetentionGBP: 1996
		},
		{
			capacity: 500,
			licenseGBP: 5896.8,
			threeYearRetentionGBP: 907.2,
			unlimitedRetentionGBP: 1814.4
		},
		{
			capacity: 1000,
			licenseGBP: 3774.4,
			threeYearRetentionGBP: 580.8,
			unlimitedRetentionGBP: 1160.8
		},
		{
			capacity: 2000,
			licenseGBP: 3066.4,
			threeYearRetentionGBP: 472,
			unlimitedRetentionGBP: 943.2
		},
		{
			capacity: Infinity,
			licenseGBP: 2358.4,
			threeYearRetentionGBP: 363.2,
			unlimitedRetentionGBP: 725.6
		}
	]
};

export const IMPERVA_TCO_ASSUMPTIONS = {
	baseRetentionDays: Math.ceil((365 * 13) / 12),
	threeYearRetentionDays: 1095
};

/** @param {number} databases @param {'licenseGBP' | 'threeYearRetentionGBP' | 'unlimitedRetentionGBP'} rateKey */
function impervaAdditionalServerFees(databases, rateKey) {
	let remaining = Math.max(0, databases - IMPERVA_TCO_RATES.baseServers);
	let annualGBP = 0;
	for (const band of IMPERVA_TCO_RATES.additionalServerBands) {
		const servers = Math.min(remaining, band.capacity);
		annualGBP += servers * band[rateKey];
		remaining -= servers;
		if (remaining === 0) break;
	}
	return annualGBP;
}

// Dynatrace public USD list rates. Ingestion uses raw GiB; retention and external
// log queries use uncompressed processed GiB. Included performance-monitoring
// queries are separate from the additional audit-log workload modeled below.
// https://www.dynatrace.com/pricing/rate-card/
export const DYNATRACE_TCO_RATES = {
	monitoringPerInstanceHour: 0.11,
	ingestPerGiB: 0.2,
	retainPerGiBDay: 0.0007,
	queryPerGiBScanned: 0.0035
};

// Chosen query workload, not vendor-mandated activity or a measured audit workload.
export const DYNATRACE_TCO_ASSUMPTIONS = {
	defaultQueriesPerMonth: 1000,
	processedVolumeRatio: 1,
	scanFraction: 0.01,
	detectionRuleCount: 20,
	detectionIntervalMinutes: 1,
	detectionLookbackMinutes: 5,
	dashboardTiles: 12,
	dashboardRefreshMinutes: 5,
	dashboardHoursPerDay: 8,
	dashboardDaysPerMonth: 22,
	dashboardLookbackDays: 1
};

/** @param {DamWorkload} workload */
function estimateDynatraceFees({
	databases,
	retentionDays,
	dailyGB,
	queriesPerMonth = DYNATRACE_TCO_ASSUMPTIONS.defaultQueriesPerMonth,
	dynatraceConfiguration
}) {
	if (!Number.isFinite(queriesPerMonth) || queriesPerMonth < 0)
		throw new RangeError('Monthly query count must be finite and non-negative.');
	if (dynatraceConfiguration !== undefined) {
		if (
			!dynatraceConfiguration ||
			typeof dynatraceConfiguration !== 'object' ||
			Array.isArray(dynatraceConfiguration)
		)
			throw new RangeError('Dynatrace workload configuration must be an object.');
		const usageKeys = [
			'processedVolumeRatio',
			'detectionRuleCount',
			'detectionIntervalMinutes',
			'detectionLookbackMinutes',
			'dashboardTiles',
			'dashboardRefreshMinutes',
			'dashboardHoursPerDay',
			'dashboardDaysPerMonth',
			'dashboardLookbackDays'
		];
		for (const key of Object.keys(dynatraceConfiguration))
			if (!usageKeys.includes(key)) throw new RangeError('Unsupported Dynatrace workload setting.');
	}
	const rates = DYNATRACE_TCO_RATES;
	const assumptions = { ...DYNATRACE_TCO_ASSUMPTIONS, ...dynatraceConfiguration };
	for (const value of [
		assumptions.processedVolumeRatio,
		assumptions.detectionIntervalMinutes,
		assumptions.dashboardRefreshMinutes
	]) {
		if (!Number.isFinite(value) || value <= 0)
			throw new RangeError(
				'Processed volume ratio and query intervals must be positive and finite.'
			);
	}
	for (const value of [assumptions.detectionRuleCount, assumptions.dashboardTiles]) {
		if (!Number.isInteger(value) || value < 0)
			throw new RangeError('Detection and dashboard counts must be non-negative integers.');
	}
	for (const value of [
		assumptions.detectionLookbackMinutes,
		assumptions.dashboardHoursPerDay,
		assumptions.dashboardDaysPerMonth,
		assumptions.dashboardLookbackDays
	]) {
		if (!Number.isFinite(value) || value < 0)
			throw new RangeError(
				'Query windows and dashboard active time must be finite and non-negative.'
			);
	}
	if (assumptions.dashboardHoursPerDay > 24 || assumptions.dashboardDaysPerMonth > 31)
		throw new RangeError('Dashboard active time exceeds the available hours or days.');

	const dailyGiB = (dailyGB * 1e9) / 2 ** 30;
	const processedDailyGiB = dailyGiB * assumptions.processedVolumeRatio;
	// Fully populated retention window, without a compression or initial-fill discount.
	const retainedGiB = processedDailyGiB * retentionDays;
	const scheduledChecksPerYear =
		(assumptions.detectionRuleCount * 365 * 1440) / assumptions.detectionIntervalMinutes;
	const scheduledGiBPerCheck =
		processedDailyGiB * Math.min(retentionDays, assumptions.detectionLookbackMinutes / 1440);
	const dashboardQueriesPerYear =
		assumptions.dashboardTiles *
		((assumptions.dashboardHoursPerDay * 60) / assumptions.dashboardRefreshMinutes) *
		assumptions.dashboardDaysPerMonth *
		12;
	const dashboardGiBPerQuery =
		processedDailyGiB * Math.min(retentionDays, assumptions.dashboardLookbackDays);
	/** @type {DamCostComponent[]} */
	const components = [
		{
			id: 'database-monitoring',
			label: 'Database monitoring',
			amount: databases * rates.monitoringPerInstanceHour * 8760,
			frequency: 'annual'
		},
		{
			id: 'log-ingestion',
			label: 'Log ingestion',
			amount: dailyGiB * 365 * rates.ingestPerGiB,
			frequency: 'annual'
		},
		{
			id: 'hot-log-retention',
			label: 'Hot log retention',
			amount: retainedGiB * 365 * rates.retainPerGiBDay,
			frequency: 'annual'
		},
		{
			id: 'investigation-queries',
			label: 'Investigation queries',
			amount:
				queriesPerMonth * 12 * retainedGiB * assumptions.scanFraction * rates.queryPerGiBScanned,
			frequency: 'annual'
		},
		{
			id: 'scheduled-detection-queries',
			label: 'Scheduled detection queries',
			amount: scheduledChecksPerYear * scheduledGiBPerCheck * rates.queryPerGiBScanned,
			frequency: 'annual'
		},
		{
			id: 'dashboard-queries',
			label: 'Dashboard queries',
			amount: dashboardQueriesPerYear * dashboardGiBPerQuery * rates.queryPerGiBScanned,
			frequency: 'annual'
		}
	];
	return {
		components,
		pricingBasis: `${databases} PostgreSQL/MySQL instances · 730 hours/month · ${dailyGB} GB/day raw audit logs · ${retentionDays} days hot retention`,
		pricingAssumptions: [
			'Database monitoring includes its default performance-query capture and Databases app searches. Separate native audit logs use additional Grail ingestion, retention and query meters. GB input is decimal; billing uses GiB.',
			`Processed bytes = ${assumptions.processedVolumeRatio} × raw bytes, an explicit planning input. Only retained/query bytes use this ratio; raw ingestion is billed once. Retention uses a fully populated window without a compression discount or a new-install fill ramp.`,
			`Investigations: ${queriesPerMonth}/month, each scanning 1% of retained processed bytes. Scheduled detection: ${assumptions.detectionRuleCount} fleet-wide rules, every ${assumptions.detectionIntervalMinutes} minute(s), over the last ${assumptions.detectionLookbackMinutes} minute(s). Dashboard: ${assumptions.dashboardTiles} tiles, every ${assumptions.dashboardRefreshMinutes} minute(s), ${assumptions.dashboardHoursPerDay} hours/day and ${assumptions.dashboardDaysPerMonth} days/month, over the last ${assumptions.dashboardLookbackDays} day(s).`,
			'Query windows are capped at available retention. Repeated scans are billed per execution; no assumed scan-skipping discount. These chosen queries run across the fleet, not once per database. Standard support is included. A DPS commitment pays for consumption and is not an additional fee.'
		].join(' ')
	};
}

/**
 * Returns vendor fees over a three-year ownership horizon.
 * dailyGB is the same selected audit-data payload for every provider.
 * @param {string} provider
 * @param {DamWorkload} workload
 */
export function estimateDam(
	provider,
	{ databases, retentionDays, dailyGB, queriesPerMonth, dynatraceConfiguration }
) {
	validateDamWorkload({ databases, retentionDays, dailyGB });
	/** @type {DamCostComponent[]} */
	let components = [];
	let pricingBasis;
	let pricingAssumptions;
	let pricingNote;
	let ingestionBilling;
	/** @type {string[]} */
	let quoteLimitations;
	let compareWithRover = true;

	if (provider === 'ibm-guardium-dam') {
		const packs = Math.ceil(databases / 5);
		components = [
			{
				id: 'license-subscription',
				label: 'Data Protection subscription',
				amount: packs * 38160,
				frequency: 'annual'
			}
		];
		pricingBasis = `${packs} annual packs · 5 data sources / 1,500 RU per pack · $38,160/pack`;
		pricingAssumptions =
			'One selected database is assumed to be one licensed data source using 300 Resource Units. Uses the Marketplace 12-month Data Protection dimension; the separate Vulnerability Assessment dimension is excluded. The SaaS listing does not establish that all deployment infrastructure or selected retention is included.';
		pricingNote =
			'Public annual subscription; retention and capacity entitlements require confirmation.';
		ingestionBilling = 'Source/RU subscription; no public per-GB ingestion rate in this SKU.';
		quoteLimitations = [
			'Confirm source/RU classification, throughput capacity and retention/storage entitlement for the selected workload.',
			'Additional vendor capacity, support tiers and professional services are not publicly priced in this scenario.'
		];
	} else if (provider === 'imperva-dam') {
		const licenseGBP =
			IMPERVA_TCO_RATES.baseLicenseGBP + impervaAdditionalServerFees(databases, 'licenseGBP');
		components = [
			{
				id: 'license-subscription',
				label: 'Data 360 subscription',
				amount: licenseGBP * DAM_GBP_TO_USD,
				frequency: 'annual'
			}
		];
		let retentionLabel = '13-month base retention';
		if (retentionDays > IMPERVA_TCO_ASSUMPTIONS.baseRetentionDays) {
			const unlimited = retentionDays > IMPERVA_TCO_ASSUMPTIONS.threeYearRetentionDays;
			const retentionGBP = unlimited
				? IMPERVA_TCO_RATES.baseUnlimitedRetentionGBP +
					impervaAdditionalServerFees(databases, 'unlimitedRetentionGBP')
				: IMPERVA_TCO_RATES.baseThreeYearRetentionGBP +
					impervaAdditionalServerFees(databases, 'threeYearRetentionGBP');
			retentionLabel = unlimited ? 'unlimited-retention add-on' : '3-year retention add-on';
			components.push({
				id: 'retention-addon',
				label: unlimited ? 'Unlimited retention add-on' : '3-year retention add-on',
				amount: retentionGBP * DAM_GBP_TO_USD,
				frequency: 'annual'
			});
		}
		pricingBasis = `${databases} servers · ${retentionLabel} · UK 2024 tariff · £1 = $1.3207 (8 Oct 2026)`;
		pricingAssumptions =
			'Historical Quadris G-Cloud 14 annual-prepaid tariff: eight-server base plus progressive additional-server bands. This is a conservative interpretation of the published tiers, not a confirmed invoice or current 200-server quote. One database is assumed to be one licensed server. The 13-month base is approximated as 396 days; longer selections use the published retention add-on. Contract deployment and retention-tier entitlements require confirmation.';
		pricingNote =
			'2024 tariff with assumed progressive tiers; event/storage overages remain unpriced.';
		ingestionBilling =
			'Server tariff here; contract-specific event and compressed-storage limits may add charges.';
		quoteLimitations = [
			'Obtain a current quote confirming tier interpretation, licensed server count and required hot/searchable retention.',
			'Event and storage charges permitted by the 2025 licensing rules are not quantified by this tariff: https://www.imperva.com/legal/wp-content/uploads/sites/14/2025/04/licensedefinitionsandrules.pdf',
			'Additional vendor support tiers, appliances and professional services require deployment-specific scope.'
		];
	} else if (provider === 'oracle-avdf') {
		const processors =
			(databases * ORACLE_TCO_ASSUMPTIONS.monitoredVCPUsPerDatabase) /
			ORACLE_TCO_ASSUMPTIONS.vCPUsPerLicensedProcessor;
		components = [
			{
				id: 'licenses',
				label: 'Processor licenses',
				amount: processors * ORACLE_TCO_RATES.licensePerProcessor,
				frequency: 'one_time'
			},
			{
				id: 'support',
				label: 'Annual support',
				amount: processors * ORACLE_TCO_RATES.annualSupportPerProcessor,
				frequency: 'annual'
			}
		];
		pricingBasis = `${databases} separate 4-vCPU AWS targets · ${processors} Processor licenses · $6,000 license + $1,320 annual support/Processor`;
		pricingAssumptions =
			'Each database has its own single-node, multithreaded 4-vCPU AWS target, licensed at two vCPUs per Oracle Processor. Processor licenses are purchased once; support is paid in each of the three years. Shared hosts, larger or multi-node targets and Oracle Standard Edition need different licensing calculations. Retention is customer-managed and does not change this software-only Processor fee.';
		pricingNote =
			'One-time Processor licenses plus annual support; database-host sizing is assumed.';
		ingestionBilling = 'Processor licensing; no per-GB ingestion charge in the modeled list price.';
		quoteLimitations = [
			'Validate secured-target Processor counts and cloud/edition licensing eligibility with Oracle.',
			'Additional vendor services, optional products and negotiated support terms are outside the public license/support calculation.'
		];
	} else if (provider === 'datasunrise-dam') {
		components = [
			{
				id: 'license-subscription',
				label: 'Protected-instance software',
				amount: databases * 1.4 * 8760,
				frequency: 'annual'
			}
		];
		pricingBasis = `${databases} protected instances · $1.40/instance/hour · 730 hours/month`;
		pricingAssumptions =
			'Marketplace software meter runs continuously for 8,760 hours/year. One selected database is modeled as one protected database instance. Customer-managed storage and retention do not add a published per-GB software charge to this meter.';
		pricingNote =
			'Public protected-instance hourly software rate; deployment infrastructure is separate.';
		ingestionBilling = 'Protected-instance hours; no per-GB ingestion rate in the modeled SKU.';
		quoteLimitations = [
			'Confirm licensed instance count, HA/standby treatment and throughput capacity for the deployment.',
			'Additional vendor support tiers, optional modules and professional services are not separately priced here.'
		];
	} else if (provider === 'aurva-dam') {
		components = [
			{
				id: 'license-subscription',
				label: 'Database subscription',
				amount: databases * 8000,
				frequency: 'annual'
			},
			{
				id: 'universal-database-connector',
				label: 'Universal Database Connector',
				amount: 10000,
				frequency: 'annual'
			}
		];
		pricingBasis = `${databases} AWS/RDS databases · $8,000/DB/year + one $10,000/year connector`;
		pricingAssumptions =
			'Uses the Marketplace 12-month AWS/S3/RDS database dimension. One Universal Database Connector is an explicit planning assumption; the listing does not establish a mandatory connector quantity. Azure and data-warehouse dimensions are excluded. No retention surcharge is invented where a public rate is unavailable.';
		pricingNote =
			'Annual database fees plus one assumed connector; retained-volume entitlement needs a quote.';
		ingestionBilling =
			'Database and connector contract dimensions; public excess-volume pricing is unavailable.';
		quoteLimitations = [
			'Confirm applicable database dimension and required connector quantity.',
			'Included ingestion, storage, retention, overage charges and additional vendor services are not established by the public listing.'
		];
	} else if (provider === 'trellix-dam') {
		const smallerFleet = databases <= 250;
		const annualPerInstance = smallerFleet ? 6133 : 7599.25 * DAM_NZD_TO_USD;
		components = [
			{
				id: 'license-subscription',
				label: 'Database Security subscription',
				amount: databases * annualPerInstance,
				frequency: 'annual'
			}
		];
		pricingBasis = smallerFleet
			? `${databases} instances · SHI US 5–250 band · $6,133/instance/year`
			: `${databases} instances · Acquire NZ 251–1,000 band · NZ$7,599.25/instance/year · NZD converted to USD (8 Oct 2026)`;
		pricingAssumptions =
			'One selected database is modeled as one licensed instance. Annual subscription includes one year of Thrive Essential. The 100/200 options use SHI US pricing; the 300/500 options use a different reseller, Acquire NZ, converted at the stated exchange rate. The reseller/currency change is not solely a vendor volume discount. AWS Marketplace dimensions marked Do Not Use are excluded.';
		pricingNote = smallerFleet
			? 'SHI US annual subscription with Thrive Essential; licensed instance count is assumed.'
			: 'Acquire NZ annual subscription with Thrive Essential; different reseller and currency.';
		ingestionBilling =
			'Annual licensed instances; no per-GB ingestion rate in the reseller tariff.';
		quoteLimitations = [
			'Confirm instance metric, applicable regional/volume pricing and HA licensing with a reseller.',
			'Retention capacity, additional modules and vendor professional services are not separately priced by these subscription listings.'
		];
	} else if (provider === 'dynatrace-database') {
		const estimate = estimateDynatraceFees({
			databases,
			retentionDays,
			dailyGB,
			queriesPerMonth,
			dynatraceConfiguration
		});
		components = estimate.components;
		pricingBasis = estimate.pricingBasis;
		pricingAssumptions = estimate.pricingAssumptions;
		pricingNote =
			'Database monitoring plus separately metered audit logs; security DAM coverage differs.';
		ingestionBilling =
			'Raw log GiB ingestion plus processed GiB-day retention and GiB-scanned queries.';
		quoteLimitations = [
			'Database observability and audit-log analytics do not establish feature parity with a security DAM product.',
			'Actual processed volume and bytes scanned determine consumption; additional security capabilities, enterprise support and vendor professional services require separate scope.'
		];
		compareWithRover = false;
	} else {
		throw new RangeError('Unknown DAM provider.');
	}

	return {
		...createDamTco(components),
		pricingBasis,
		pricingAssumptions: [
			'Three-year vendor-fee scenario. Monthly and yearly figures are lifecycle averages; one-time purchases are counted once and annual fees recur. The same selected daily data volume is used for all providers. Customer infrastructure, implementation and internal labor are excluded. Public prices are not negotiated quotes, and unpriced vendor charges are identified separately.',
			pricingAssumptions
		].join(' '),
		pricingNote,
		ingestionBilling,
		quoteLimitations,
		ingestionMultiplier: 1,
		modeledDailyGB: dailyGB,
		compareWithRover
	};
}
