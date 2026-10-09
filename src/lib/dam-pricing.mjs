/**
 * Published database monitoring license/subscription rates checked 2026-10-09.
 * Count-based scenarios assume one monitored instance/server per selected database.
 * Every provider includes an explicit customer-infrastructure and labor scenario.
 * Three-year totals count one-time purchases once; annual subscriptions recur.
 * The comparison assumes eBPF ingestion is 80% lower for the same activity.
 * Selected ingestion is the reduced baseline; other capture methods use 5x.
 * This is a user-selected scenario assumption, not a measured vendor benchmark.
 * Taxes and negotiated discounts are not modeled.
 */
import {
	createDamTco,
	validateDamWorkload,
	estimateDamCollection,
	estimateDamEgressYearly,
	estimateSelfHostedDam,
	DAM_TCO_ASSUMPTIONS,
	DAM_COLLECTION_BASIS,
	DAM_LABOR_BASIS
} from './dam-tco.mjs';

export { DAM_LIFECYCLE_YEARS, DAM_TCO_RATES, DAM_TCO_ASSUMPTIONS } from './dam-tco.mjs';

export const DAM_PROVIDERS = [
	{
		id: 'ibm-guardium-dam',
		name: 'IBM Guardium Data Protection',
		category: 'Enterprise DAM',
		logo: '/assets/vendor-logos/ibm.svg',
		// Appliance purge setting, not an included hot-storage license allowance.
		retentionDescription: 'Default purge: 60 days',
		retentionSource: 'https://www.ibm.com/docs/en/gdp/12.x?topic=data-configuring-purge',
		source: 'https://aws.amazon.com/marketplace/pp/prodview-iwwxejrcekneg'
	},
	{
		id: 'imperva-dam',
		name: 'Imperva Data 360',
		category: 'Data Security Fabric',
		logo: '/assets/vendor-logos/imperva.svg',
		// Data 360 plan entitlement; extended retention is optional.
		retentionDescription: 'Base retention: 13 months',
		retentionSource: 'https://www.imperva.com/products/plans/',
		source:
			'https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/719953/581820883089188-pricing-document-2024-05-06-1147.pdf'
	},
	{
		id: 'oracle-avdf',
		name: 'Oracle Audit Vault & Database Firewall',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/oracle.png',
		// Default target policy has 12 months online plus a separate 12-month archive.
		retentionDescription: 'Default online retention: 12 months',
		retentionSource:
			'https://docs.oracle.com/en/database/oracle/audit-vault-database-firewall/20/sigau/secured_targets.html',
		source: 'https://www.oracle.com/ma/a/ocom/docs/corporate/pricing/us-public-sector-3904395.pdf'
	},
	{
		id: 'datasunrise-dam',
		name: 'DataSunrise Database Security',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/datasunrise.png',
		// Cleanup is configurable; the public guide does not establish a numeric default.
		retentionSource:
			'https://www.datasunrise.com/guides/how-to/offload-audit-data-to-s3-and-read-it-by-aws-athena/',
		source: 'https://aws.amazon.com/marketplace/pp/prodview-h5srpjexxsnl4'
	},
	{
		id: 'aurva-dam',
		name: 'Aurva DAM',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/aurva.svg',
		// The Razorpay example's 7-day hot tier is not a platform-wide default.
		source: 'https://aws.amazon.com/marketplace/pp/prodview-bbn5hfvvzd6cu'
	},
	{
		id: 'trellix-dam',
		name: 'Trellix Database Security',
		category: 'Database Activity Monitoring',
		logo: '/assets/vendor-logos/trellix.png',
		// Archiving is configurable by alert count/time; no fixed default duration verified.
		retentionSource:
			'https://docs.trellix.com/data-and-email/docs/configure-automatic-alert-archiving',
		source:
			'https://acquire.co.nz/p/miscellaneous/miscellaneous/database-security-11te-1yr-subscription-with-1yr-thrive-dcdece-aa-aa-9979486',
		volumeSource:
			'https://acquire.co.nz/p/miscellaneous/miscellaneous/database-security-11te-1yr-subscription-with-1yr-thrive-dcdece-aa-ba-9979487'
	},
	{
		id: 'dynatrace-database',
		name: 'Dynatrace Database Monitoring',
		logo: '/assets/vendor-logos/dynatrace.png',
		// Performance monitoring plus separately ingested audit logs; not security DAM feature parity.
		category: 'Database monitoring + log analytics (PostgreSQL/MySQL)',
		// Statement records are distinct from Grail metric time-series retention.
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

// ECB 8 October 2026 reference rates: USD 1.1186/EUR, GBP 0.84698/EUR.
// https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
export const DAM_GBP_TO_USD = 1.1186 / 0.84698;

// Same ECB 8 October 2026 reference date: NZD 2.0014/EUR, USD 1.1186/EUR.
export const DAM_NZD_TO_USD = 1.1186 / 2.0014;

// Aurva keeps the eBPF baseline. The other listed competitors use the higher
// ingestion scenario; this does not claim that every component lacks eBPF.
export const DAM_EBPF_INGESTION_REDUCTION_PERCENT = 80;

/**
 * @typedef {'ibm-guardium-dam' | 'imperva-dam' | 'oracle-avdf' | 'datasunrise-dam' | 'aurva-dam' | 'trellix-dam' | 'dynatrace-database'} DamProviderId
 * @typedef {{ processedVolumeRatio: number, detectionRuleCount: number, detectionIntervalMinutes: number, detectionLookbackMinutes: number, dashboardTiles: number, dashboardRefreshMinutes: number, dashboardHoursPerDay: number, dashboardDaysPerMonth: number, dashboardLookbackDays: number }} DynatraceUsageConfiguration
 * @typedef {{ databases: number, retentionDays: number, dailyGB: number, queriesPerMonth?: number, dynatraceConfiguration?: Partial<DynatraceUsageConfiguration> }} DamWorkload
 * @typedef {{ label: string, yearly: number }} DamCostComponent
 */

// Published rates; sizing and labor allowances below are estimator assumptions.
// License/support: https://www.oracle.com/ma/a/ocom/docs/corporate/pricing/us-public-sector-3904395.pdf
// AWS cloud license conversion: https://www.oracle.com/a/ocom/docs/cloud-licensing-070579.pdf
// AVDF eligible program: https://www.oracle.com/us/corporate/pricing/authorized-cloud-environments-3493562.pdf
// Linux c5.2xlarge on-demand, us-east-1: https://aws.amazon.com/ec2/pricing/on-demand/
// gp3 and standard snapshots, us-east-1: https://aws.amazon.com/ebs/pricing/
export const ORACLE_TCO_RATES = {
	licensePerProcessor: 6000,
	annualSupportPerProcessor: 1320,
	appliancePerHour: 0.34,
	gp3PerGiBMonth: 0.08,
	snapshotPerGiBMonth: 0.05,
	regionalTransferPerGB: 0.02
};

// A transparent planning scenario, not a measured Oracle capacity benchmark.
// Each logical DB is assumed to have its own single-node, multithreaded AWS host.
// Oracle Standard Edition socket licensing and shared/multi-node hosts differ.
// Each HA group has two AVS and two out-of-band Database Firewall appliances.
// Local storage/HA: https://docs.oracle.com/en/database/oracle/audit-vault-database-firewall/20/sigig/preinstall.html
// Online retention: https://docs.oracle.com/en/database/oracle/audit-vault-database-firewall/20/sigad/sigma_server.html
export const ORACLE_TCO_ASSUMPTIONS = {
	monitoredVCPUsPerDatabase: 4,
	vCPUsPerLicensedProcessor: 2,
	databasesPerHAGroup: 250,
	dailyGBPerHAGroup: 250,
	repositoryGiBPerHAGroup: 32 * 1024,
	storageHeadroom: 1.25,
	minimumRepositoryGiBPerHAGroup: 371,
	avsBootGiB: 370,
	firewallBootGiB: 220,
	laborPerHour: DAM_TCO_ASSUMPTIONS.laborPerHour,
	deploymentBaseHours: DAM_TCO_ASSUMPTIONS.deploymentBaseHours,
	deploymentHoursPerDatabase: DAM_TCO_ASSUMPTIONS.deploymentHoursPerDatabase,
	deploymentHoursPerHAGroup: DAM_TCO_ASSUMPTIONS.deploymentHoursPerNode * 4,
	monthlyOperationsHoursPer100Databases: DAM_TCO_ASSUMPTIONS.monthlyOperationsHoursPer100Databases,
	monthlyOperationsHoursPerHAGroup: DAM_TCO_ASSUMPTIONS.monthlyOperationsHoursPerNode * 4
};

/** @param {DamWorkload} workload */
function estimateOracleTco({ databases, retentionDays, dailyGB }) {
	const rates = ORACLE_TCO_RATES;
	const assumptions = ORACLE_TCO_ASSUMPTIONS;
	const processors =
		(databases * assumptions.monitoredVCPUsPerDatabase) / assumptions.vCPUsPerLicensedProcessor;
	// Slider GB are decimal bytes; AWS EBS storage is billed in GiB.
	const retainedGiB = (dailyGB * retentionDays * 1e9) / 2 ** 30;
	const plannedRepositoryGiB = retainedGiB * assumptions.storageHeadroom;
	const haGroups = Math.max(
		1,
		Math.ceil(databases / assumptions.databasesPerHAGroup),
		Math.ceil(dailyGB / assumptions.dailyGBPerHAGroup),
		Math.ceil(plannedRepositoryGiB / assumptions.repositoryGiBPerHAGroup)
	);
	// Each added data disk must exceed the AVS's 370 GiB boot disk; allocate whole GiB.
	const repositoryGiB =
		haGroups *
		Math.max(
			assumptions.minimumRepositoryGiBPerHAGroup,
			Math.ceil(plannedRepositoryGiB / haGroups)
		);
	const bootGiB = haGroups * (2 * assumptions.avsBootGiB + 2 * assumptions.firewallBootGiB);
	// Full hot repository on primary + standby, including 25% provisioning headroom.
	// gp3 included IOPS/throughput; no compression discount or paid performance tier.
	const storageYearly = (2 * repositoryGiB + bootGiB) * rates.gp3PerGiBMonth * 12;
	// One full logical backup; free headroom and duplicate HA disks are not backed up twice.
	const backupGiB = retainedGiB + bootGiB / 2;
	// Assume one cross-AZ replication pass over the incoming audit data.
	// https://aws.amazon.com/blogs/networking-and-content-delivery/demystifying-amazon-vpc-peering-charges/
	const backupAndTransferYearly =
		backupGiB * rates.snapshotPerGiBMonth * 12 + dailyGB * 365 * rates.regionalTransferPerGB;
	const deploymentHours =
		assumptions.deploymentBaseHours +
		databases * assumptions.deploymentHoursPerDatabase +
		haGroups * assumptions.deploymentHoursPerHAGroup;
	const operationsHoursPerMonth =
		(databases / 100) * assumptions.monthlyOperationsHoursPer100Databases +
		haGroups * assumptions.monthlyOperationsHoursPerHAGroup;
	/** @type {DamCostComponent[]} */
	const costBreakdown = [
		{ label: 'Licenses', yearly: processors * rates.licensePerProcessor },
		{ label: 'Support', yearly: processors * rates.annualSupportPerProcessor },
		{ label: 'HA compute', yearly: haGroups * 4 * rates.appliancePerHour * 730 * 12 },
		{ label: 'Hot storage', yearly: storageYearly },
		{ label: 'Backups & transfer', yearly: backupAndTransferYearly },
		{ label: 'Deployment', yearly: deploymentHours * assumptions.laborPerHour },
		{ label: 'Operations', yearly: operationsHoursPerMonth * assumptions.laborPerHour * 12 }
	];
	return {
		costBreakdown,
		pricingBasis: `Assumes ${databases} separate 4-vCPU AWS hosts · ${processors} Processor licenses · ${haGroups} HA group${haGroups === 1 ? '' : 's'} · us-east-1`,
		pricingAssumptions:
			'Planning: 250 DBs / 250 GB/day / 32 TiB per HA group; 4 × c5.2xlarge/group. Two hot copies + 25% headroom; one logical backup-storage allowance; one cross-AZ transfer of incoming data. gp3 includes baseline performance; extra IOPS/throughput excluded. Assumes single-node, multithreaded AWS targets; excludes Oracle Standard Edition, existing database hosting, tax and discounts. Steady-state retained capacity; no compression discount. Processor licenses and rollout are purchased once; support and operating costs recur annually. ' +
			DAM_LABOR_BASIS
	};
}

// Dynatrace public USD list rates, verified 2026-10-09.
// https://www.dynatrace.com/pricing/rate-card/
// Log ingestion is raw GiB; retention and queries use uncompressed, processed GiB.
// Instance monitoring includes its default normalized-query capture and Databases app queries.
// The log meters below apply only to additional raw database audit logs and external log searches.
// AWS Linux c7i.xlarge on-demand and gp3: us-east-1, no Savings Plan/free-tier credits.
// c7i.xlarge SKU D8WVCVBE32N227KA, EC2 price-list version 20261008184850.
// https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
// https://aws.amazon.com/ec2/pricing/on-demand/
// https://aws.amazon.com/ebs/pricing/
// https://aws.amazon.com/vpc/pricing/
export const DYNATRACE_TCO_RATES = {
	monitoringPerInstanceHour: 0.11,
	ingestPerGiB: 0.2,
	retainPerGiBDay: 0.0007,
	queryPerGiBScanned: 0.0035,
	activeGatePerHour: 0.1785,
	gp3PerGiBMonth: 0.08,
	publicIPv4PerHour: 0.005
};

// Explicit planning allowances, not vendor requirements or measured query workloads.
// The combined-workload c7i.xlarge profile estimates 900 routed hosts + 1,500 MB/min.
// Use that as a sizing reference for the assumed monitoring/log mix, with one spare node.
// Actual remote-extension capacity and log bursts need deployment-specific validation.
// https://docs.dynatrace.com/docs/ingest-from/dynatrace-activegate/installation/linux/linux-activegate-hardware-and-system-requirements
export const DYNATRACE_TCO_ASSUMPTIONS = {
	defaultQueriesPerMonth: 1000,
	// Enriched audit-log planning scenario; not a universal Dynatrace expansion factor.
	// https://docs.dynatrace.com/docs/license/capabilities/log-analytics
	processedVolumeRatio: 2,
	scanFraction: 0.01,
	// Fleet-wide DQL checks; each query can group its results by database.
	// These are raw-log checks, distinct from included performance-monitoring queries.
	// https://docs.dynatrace.com/docs/analyze-explore-automate/logs/alerting-on-logs
	detectionRuleCount: 20,
	detectionIntervalMinutes: 1,
	detectionLookbackMinutes: 5,
	// One shared log dashboard, during business hours, scanning the last 24 hours.
	// https://docs.dynatrace.com/docs/analyze-explore-automate/logs/lma-use-cases/lma-log-query-dashboard
	dashboardTiles: 12,
	dashboardRefreshMinutes: 5,
	dashboardHoursPerDay: 8,
	dashboardDaysPerMonth: 22,
	dashboardLookbackDays: 1,
	activeGateHosts: 900,
	activeGateMBPerMinute: 1500,
	spareActiveGates: 1,
	activeGateDiskGiB: 50,
	laborPerHour: DAM_TCO_ASSUMPTIONS.laborPerHour,
	deploymentBaseHours: DAM_TCO_ASSUMPTIONS.deploymentBaseHours,
	deploymentHoursPerDatabase: DAM_TCO_ASSUMPTIONS.deploymentHoursPerDatabase,
	deploymentHoursPerActiveGate: DAM_TCO_ASSUMPTIONS.deploymentHoursPerNode,
	monthlyOperationsHoursPer100Databases: DAM_TCO_ASSUMPTIONS.monthlyOperationsHoursPer100Databases,
	monthlyOperationsHoursPerActiveGate: DAM_TCO_ASSUMPTIONS.monthlyOperationsHoursPerNode
};

/** @param {DamWorkload} workload */
function estimateDynatraceTco({
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
	// Model a fully populated hot-retention window, not the cheaper initial fill period.
	// Compression does not reduce Grail's processed-byte storage/query billing.
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
	const activeGates =
		Math.max(
			1,
			Math.ceil(databases / assumptions.activeGateHosts),
			Math.ceil((dailyGB * 1000) / (1440 * assumptions.activeGateMBPerMinute))
		) + assumptions.spareActiveGates;
	const deploymentHours =
		assumptions.deploymentBaseHours +
		databases * assumptions.deploymentHoursPerDatabase +
		activeGates * assumptions.deploymentHoursPerActiveGate;
	const operationsHoursPerMonth =
		(databases / 100) * assumptions.monthlyOperationsHoursPer100Databases +
		activeGates * assumptions.monthlyOperationsHoursPerActiveGate;
	/** @type {DamCostComponent[]} */
	const costBreakdown = [
		{ label: 'Database monitoring', yearly: databases * rates.monitoringPerInstanceHour * 8760 },
		{ label: 'Log ingestion', yearly: dailyGiB * 365 * rates.ingestPerGiB },
		{ label: 'Hot log retention', yearly: retainedGiB * 365 * rates.retainPerGiBDay },
		{
			label: 'Investigation queries',
			// Each external search covers and scans 1% of retained log volume (e.g. its time range).
			// No per-query count charge, compression discount, or mandatory full-history scan.
			yearly:
				queriesPerMonth * 12 * retainedGiB * assumptions.scanFraction * rates.queryPerGiBScanned
		},
		{
			label: 'Scheduled detection queries',
			// The raw-log rule runs once for the fleet, not once per DB over all fleet data.
			// Overlapping lookback windows are re-read and billed on each execution.
			yearly: scheduledChecksPerYear * scheduledGiBPerCheck * rates.queryPerGiBScanned
		},
		{
			label: 'Dashboard queries',
			yearly: dashboardQueriesPerYear * dashboardGiBPerQuery * rates.queryPerGiBScanned
		},
		{ label: 'Collector compute', yearly: activeGates * rates.activeGatePerHour * 8760 },
		{
			label: 'Collector storage',
			yearly: activeGates * assumptions.activeGateDiskGiB * rates.gp3PerGiBMonth * 12
		},
		{ label: 'Network transfer', yearly: estimateDamEgressYearly((dailyGiB * 365) / 12) },
		{ label: 'Public IPv4', yearly: activeGates * rates.publicIPv4PerHour * 8760 },
		{ label: 'Deployment', yearly: deploymentHours * assumptions.laborPerHour },
		{ label: 'Operations', yearly: operationsHoursPerMonth * assumptions.laborPerHour * 12 }
	];
	return {
		costBreakdown,
		pricingBasis: `Assumes ${databases} monitored PostgreSQL/MySQL instances · 730 hours/month · ${dailyGB} GB/day raw audit logs · ${retentionDays} days hot retention · ${queriesPerMonth} investigations/month plus scheduled checks and dashboard refreshes`,
		pricingAssumptions: [
			'Public-list cost scenario, not a vendor quote or a claim of complete security DAM feature parity. Default 5-minute performance-query capture and Databases app searches are included; separate native audit logs use Grail pay-as-you-go ingestion, retention and query rates. GB input is decimal; billing uses GiB.',
			`Enriched-audit planning ratio: processed bytes = ${assumptions.processedVolumeRatio} × raw bytes. This is not a universal vendor default. Only retained/query bytes use this ratio; raw ingestion, outbound traffic and collector ingress are charged once. SaaS hot storage is billed once, without additional S3, HA-storage or backup charges.`,
			`Investigations: ${queriesPerMonth}/month, each scanning a range containing 1% of retained processed bytes. Scheduled DQL monitoring: ${assumptions.detectionRuleCount} fleet-wide rules, every ${assumptions.detectionIntervalMinutes} minute(s), over the last ${assumptions.detectionLookbackMinutes} minute(s). One shared log dashboard: ${assumptions.dashboardTiles} tiles, refreshed every ${assumptions.dashboardRefreshMinutes} minute(s), ${assumptions.dashboardHoursPerDay} hours/day and ${assumptions.dashboardDaysPerMonth} days/month, over the last ${assumptions.dashboardLookbackDays} day(s).`,
			'Query windows are capped at available retention. Repeated scans of overlapping windows are billed per execution. No assumed Grail skip discount; selective queries or metric/event-based alerts can cost less. These are chosen workload assumptions, not mandatory Dynatrace rules. The model does not charge a fleet-wide scan separately for every database.',
			`${activeGates} new c7i.xlarge ActiveGates, including one spare, use the vendor combined-workload sizing reference; its routed-host count is a planning proxy, not a SQL-instance capacity guarantee. Each has 50 GiB gp3 and one public IPv4. Direct public HTTPS; no NAT/PrivateLink or CloudWatch forwarding. Assumes uncompressed outbound logs and the account-wide 100 GiB/month transfer allowance is available; above 500 TiB/month the last transfer band is an estimate requiring an AWS quote.`,
			DAM_LABOR_BASIS,
			'Three-year lifecycle uses one rollout allowance plus recurring annual consumption at fully populated retention, not a new-install retention ramp. Standard support is included; enterprise support, professional services, native audit-plugin licenses, host/full-stack monitoring, AI/workflow add-ons and SaaS exports need separate scope and quotes. Existing database hosting, taxes, growth and negotiated commitment floors/discounts are excluded. A DPS commitment draws down against consumption, not an additional fee.'
		].join(' ')
	};
}

/**
 * Returns a three-year ownership scenario using published software meters.
 * Retention affects live capacity, not the license acquisition cost or billing term.
 * dailyGB is the selected eBPF baseline, before the collection-volume assumption.
 * @param {string} provider
 * @param {DamWorkload} workload
 */
export function estimateDam(
	provider,
	{ databases, retentionDays, dailyGB, queriesPerMonth, dynatraceConfiguration }
) {
	validateDamWorkload({ databases, retentionDays, dailyGB });

	// 80% less means the baseline is 20% of the other methods' volume: 5x, not 1.8x.
	// Apply this to raw volume once; existing processing ratios remain separate.
	const ingestionMultiplier =
		provider === 'aurva-dam' ? 1 : 100 / (100 - DAM_EBPF_INGESTION_REDUCTION_PERCENT);
	const modeledDailyGB = dailyGB * ingestionMultiplier;
	const ingestionAssumption =
		`Comparison assumption: eBPF ingestion is ${DAM_EBPF_INGESTION_REDUCTION_PERCENT}% lower for the same activity, not a measured vendor benchmark. ` +
		`Selected baseline: ${dailyGB} GB/day; modeled raw ingestion: ${modeledDailyGB} GB/day (${ingestionMultiplier}x). ` +
		'Only data-volume costs and capacity sizing use this factor; per-database license rates stay unchanged.';

	let yearly = 0;
	let pricingBasis;
	let compareWithRover = true;
	/** @type {DamCostComponent[] | undefined} */
	let costBreakdown;
	let pricingAssumptions;

	if (provider === 'ibm-guardium-dam') {
		// 12-month Data Protection pack: 5 data sources / 1,500 RU for $38,160.
		// Exclude the separate Vulnerability Assessment product's $5,088 rate.
		yearly = Math.ceil(databases / 5) * 38160;
		pricingBasis = `Assumes ${databases} licensed instances · 300 RU each · annual license`;
	} else if (provider === 'imperva-dam') {
		// Quadris G-Cloud 14, 2024, page 5: annual-prepaid Data 360 eight-server base.
		// Each selected database is modeled as one licensed server. All four options
		// fall in the 92–491 or 492–991 additional-server volume-price bands.
		const addedServers = databases - 8;
		const largerBand = addedServers >= 492;
		let annualGBP = 100245.6 + addedServers * (largerBand ? 5896.8 : 6486.4);
		let retentionLabel = 'base license';
		if (retentionDays > 1095) {
			annualGBP += 30844.8 + addedServers * (largerBand ? 1814.4 : 1996);
			retentionLabel = 'unlimited-retention add-on';
		} else if (retentionDays > 365) {
			annualGBP += 15422.4 + addedServers * (largerBand ? 907.2 : 997.6);
			retentionLabel = '3-year retention add-on';
		}
		yearly = annualGBP * DAM_GBP_TO_USD;
		pricingBasis = `Assumes ${databases} servers · ${retentionLabel} · UK 2024 rate card · £1 = $1.3207 (8 Oct 2026)`;
	} else if (provider === 'oracle-avdf') {
		const tco = estimateOracleTco({ databases, retentionDays, dailyGB: modeledDailyGB });
		pricingBasis = tco.pricingBasis;
		pricingAssumptions = tco.pricingAssumptions;
		costBreakdown = tco.costBreakdown;
	} else if (provider === 'datasunrise-dam') {
		// Software-only Marketplace metering: $1.40/protected database instance/hour.
		yearly = databases * 1.4 * 730 * 12;
		pricingBasis = `${databases} protected instances · $1.40/hour · 730 hours/month`;
	} else if (provider === 'aurva-dam') {
		// AWS Marketplace 12-month contract: AWS/S3/RDS dimension is $8,000/DB.
		// Model one $10,000 Universal Database Connector as an explicit scenario
		// assumption; the listing does not specify a required connector quantity.
		// Azure and data-warehouse dimensions are excluded from this AWS/RDS scenario.
		yearly = databases * 8000 + 10000;
		pricingBasis = `Assumes ${databases} AWS/RDS databases · $8,000/DB/year + one $10,000/year connector`;
	} else if (provider === 'trellix-dam') {
		// Published Acquire NZ retail listings, indexed May 2026, exclude GST.
		// DCDECE-AA-AA: 5–250 instances, NZ$13,837.02 per instance/year.
		// DCDECE-AA-BA: 251–1,000 instances, NZ$7,599.25 per instance/year.
		// Both include a one-year subscription and one year of Thrive Essential.
		// Currency: https://acquire.co.nz/shipping/
		// Instance metric/package: https://www.trellix.com/assets/events/apj-partner-summit-2024/trellix-apj-partner-summit-data.pdf
		// Apply the published band rate to all instances; do not invent volume smoothing.
		// AWS Marketplace's $9,999 dimensions explicitly say "Do Not Use"; exclude them.
		const yearlyNZDPerInstance = databases <= 250 ? 13837.02 : 7599.25;
		yearly = databases * yearlyNZDPerInstance * DAM_NZD_TO_USD;
		pricingBasis = `Assumes ${databases} licensed instances · Acquire NZ annual subscription + Thrive Essential · NZD converted to USD (8 Oct 2026)`;
	} else if (provider === 'dynatrace-database') {
		const tco = estimateDynatraceTco({
			databases,
			retentionDays,
			dailyGB: modeledDailyGB,
			queriesPerMonth,
			dynatraceConfiguration
		});
		pricingBasis = tco.pricingBasis;
		pricingAssumptions = tco.pricingAssumptions;
		costBreakdown = tco.costBreakdown;
	} else {
		throw new RangeError('Unknown DAM provider.');
	}

	/** @type {import('./dam-tco.mjs').DamTcoComponent[]} */
	let components;
	if (costBreakdown) {
		components = costBreakdown.map(({ label, yearly: amount }) => ({
			id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			label,
			amount,
			frequency:
				label === 'Deployment' || (provider === 'oracle-avdf' && label === 'Licenses')
					? 'one_time'
					: 'annual'
		}));
	} else {
		components = [
			{
				id: 'license-subscription',
				label: 'License subscription',
				amount: yearly,
				frequency: 'annual'
			}
		];
		if (provider === 'aurva-dam') {
			const collection = estimateDamCollection(databases, modeledDailyGB);
			components.push(...collection.components);
			pricingAssumptions =
				'Marketplace SaaS scenario: customer collectors and operating effort are additional; vendor backend storage/compute are not charged again. Selected hot retention beyond the contractual allowance requires a vendor quote; the listing does not publish an excess-retention meter. No invented storage surcharge. ' +
				DAM_COLLECTION_BASIS +
				' ' +
				DAM_LABOR_BASIS;
		} else if (
			provider === 'ibm-guardium-dam' ||
			provider === 'imperva-dam' ||
			provider === 'datasunrise-dam' ||
			provider === 'trellix-dam'
		) {
			const infrastructure = estimateSelfHostedDam(provider, {
				databases,
				retentionDays,
				dailyGB: modeledDailyGB
			});
			components.push(...infrastructure.components);
			pricingAssumptions = infrastructure.pricingAssumptions;
		}
	}

	return {
		...createDamTco(components),
		pricingBasis,
		pricingAssumptions: [
			'Three-year ownership scenario; monthly and yearly figures are lifecycle averages. One-time costs are counted once, subscriptions/operations recur annually. Hot-retention duration is independent of the lifecycle. No growth, inflation or negotiated discounts assumed.',
			ingestionAssumption,
			pricingAssumptions
		]
			.filter(Boolean)
			.join(' '),
		ingestionMultiplier,
		modeledDailyGB,
		compareWithRover
	};
}
