/**
 * Three-year DAM ownership scenarios, separate from vendor license meters.
 * AWS on-demand us-east-1, no discounts. Capacity and labor are planning inputs,
 * not measured product benchmarks or claims of equivalent security coverage.
 */
export const DAM_LIFECYCLE_YEARS = 3;

// Current AWS EC2 price feeds, published 2026-10-08:
// https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/ec2/USD/current/ec2-ondemand-without-sec-sel/US%20East%20%28N.%20Virginia%29/Linux/index.json
// https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/ec2/USD/current/ec2-ondemand-without-sec-sel/US%20East%20%28N.%20Virginia%29/Windows%20with%20SQL%20Std/index.json
// https://aws.amazon.com/ebs/pricing/
// https://aws.amazon.com/vpc/pricing/ https://aws.amazon.com/ec2/pricing/on-demand/
export const DAM_TCO_RATES = {
	collectorPerHour: 0.1785, // Linux c7i.xlarge, 4 vCPU / 8 GiB.
	applicationPerHour: 0.34, // Linux c5.2xlarge, 8 vCPU / 16 GiB.
	guardiumPerHour: 0.384, // Linux m6i.2xlarge, 8 vCPU / 32 GiB.
	repositoryPerHour: 0.504, // Linux r6i.2xlarge, 8 vCPU / 64 GiB.
	sqlRepositoryPerHour: 1.712, // m6i.2xlarge, Windows + SQL Standard included.
	gp3PerGiBMonth: 0.08,
	snapshotPerGiBMonth: 0.05,
	regionalTransferPerGB: 0.02,
	publicIPv4PerHour: 0.005
};

export const DAM_TCO_ASSUMPTIONS = {
	annualEngineerCost: 150000,
	workingHoursPerYear: 2080,
	laborPerHour: 150000 / 2080,
	deploymentBaseHours: 40,
	deploymentHoursPerDatabase: 1,
	deploymentHoursPerNode: 4,
	monthlyOperationsHoursPer100Databases: 20,
	monthlyOperationsHoursPerNode: 1,
	databasesPerProcessingGroup: 250,
	dailyGBPerProcessingGroup: 250,
	repositoryGiBPerGroup: 32 * 1024,
	storageHeadroom: 1.25,
	collectorDiskGiB: 50,
	spareCollectors: 1,
	monthlyFreeEgressGiB: 100
};

/** @typedef {{id: string, label: string, amount: number, frequency: 'annual' | 'one_time'}} DamTcoComponent */

/** @param {{databases: number, retentionDays: number, dailyGB: number}} workload */
export function validateDamWorkload({ databases, retentionDays, dailyGB }) {
	if (![100, 200, 300, 500].includes(databases))
		throw new RangeError('Unsupported database-count option.');
	if (!Number.isFinite(retentionDays) || retentionDays < 0)
		throw new RangeError('Retention must be finite and non-negative.');
	if (!Number.isFinite(dailyGB) || dailyGB < 0)
		throw new RangeError('Daily ingestion must be finite and non-negative.');
}

/**
 * amount is an annual invoice or a one-time purchase. Display values are
 * equivalents of the lifecycle total, not the provider's monthly invoice.
 * @param {DamTcoComponent[]} components
 */
export function createDamTco(components) {
	if (new Set(components.map(({ id }) => id)).size !== components.length)
		throw new RangeError('TCO components must have unique IDs.');
	let recurringYearly = 0;
	let oneTime = 0;
	const costBreakdown = components.map((component) => {
		if (!Number.isFinite(component.amount) || component.amount < 0)
			throw new RangeError('TCO component amounts must be finite and non-negative.');
		if (!['annual', 'one_time'].includes(component.frequency))
			throw new RangeError('Unknown TCO component frequency.');
		if (component.frequency === 'annual') recurringYearly += component.amount;
		else oneTime += component.amount;
		const total = component.amount * (component.frequency === 'annual' ? DAM_LIFECYCLE_YEARS : 1);
		return {
			...component,
			total,
			yearly: total / DAM_LIFECYCLE_YEARS,
			monthly: total / (DAM_LIFECYCLE_YEARS * 12)
		};
	});
	const total = oneTime + recurringYearly * DAM_LIFECYCLE_YEARS;
	return {
		horizonYears: DAM_LIFECYCLE_YEARS,
		recurringYearly,
		oneTime,
		firstYear: oneTime + recurringYearly,
		total,
		yearly: total / DAM_LIFECYCLE_YEARS,
		monthly: total / (DAM_LIFECYCLE_YEARS * 12),
		costBreakdown
	};
}

/** @param {number} databases @param {number} nodes */
export function estimateDamLabor(databases, nodes) {
	const a = DAM_TCO_ASSUMPTIONS;
	return [
		{
			id: 'deployment',
			label: 'Deployment',
			amount:
				(a.deploymentBaseHours +
					databases * a.deploymentHoursPerDatabase +
					nodes * a.deploymentHoursPerNode) *
				a.laborPerHour,
			frequency: /** @type {'one_time'} */ ('one_time')
		},
		{
			id: 'operations',
			label: 'Operations',
			amount:
				((databases / 100) * a.monthlyOperationsHoursPer100Databases +
					nodes * a.monthlyOperationsHoursPerNode) *
				a.laborPerHour *
				12,
			frequency: /** @type {'annual'} */ ('annual')
		}
	];
}

export const DAM_LABOR_BASIS =
	'Labor planning: $150K/year fully loaded, 2,080 working hours/year. Rollout once: 40h + 1h/database + 4h/customer node. Operations: 20h/month per 100 databases + 1h/customer node. These allowances cover audit onboarding, identity/parser mapping, rule/report maintenance, collection checks and upgrades; they are not vendor-required staffing.';

/** @param {number} monthlyGiB */
export function estimateDamEgressYearly(monthlyGiB) {
	let remaining = Math.max(0, monthlyGiB - DAM_TCO_ASSUMPTIONS.monthlyFreeEgressGiB);
	let monthly = 0;
	for (const [bandGiB, rate] of [
		[10 * 1024, 0.09],
		[40 * 1024, 0.085],
		[100 * 1024, 0.07],
		[Infinity, 0.05]
	]) {
		const billed = Math.min(remaining, bandGiB);
		monthly += billed * rate;
		remaining -= billed;
		if (remaining === 0) break;
	}
	// Above 500 TiB/month AWS requires a quote; the final band is an extrapolation.
	return monthly * 12;
}

/** @param {number} databases @param {number} dailyGB */
export function estimateDamCollection(databases, dailyGB) {
	const a = DAM_TCO_ASSUMPTIONS;
	const r = DAM_TCO_RATES;
	const nodes =
		Math.max(
			1,
			Math.ceil(databases / a.databasesPerProcessingGroup),
			Math.ceil(dailyGB / a.dailyGBPerProcessingGroup)
		) + a.spareCollectors;
	/** @type {DamTcoComponent[]} */
	const components = [
		{
			id: 'collector-compute',
			label: 'Collector compute',
			amount: nodes * r.collectorPerHour * 8760,
			frequency: 'annual'
		},
		{
			id: 'collector-storage',
			label: 'Collector storage',
			amount: nodes * a.collectorDiskGiB * r.gp3PerGiBMonth * 12,
			frequency: 'annual'
		},
		{
			id: 'network-transfer',
			label: 'Network transfer',
			amount: estimateDamEgressYearly((dailyGB * 1e9 * 365) / (2 ** 30 * 12)),
			frequency: 'annual'
		},
		{
			id: 'public-ipv4',
			label: 'Public IPv4',
			amount: nodes * r.publicIPv4PerHour * 8760,
			frequency: 'annual'
		},
		...estimateDamLabor(databases, nodes)
	];
	return { components, nodes };
}

export const DAM_COLLECTION_BASIS =
	'Customer forwarding scenario: one c7i.xlarge per 250 databases or 250 raw GB/day, whichever requires more, plus one spare; 50 GiB gp3 and one public IPv4 per node. Capacity is a planning proxy, not a vendor benchmark. Direct public HTTPS without NAT/PrivateLink or a paid cloud-log forwarding chain; no wire compression assumed. One account-wide 100 GiB/month AWS outbound allowance; above 500 TiB/month transfer requires a quote.';

// Customer-hosted audit repositories; support remains in the selected software
// subscription. SQL Server licensing is included in the Trellix backend rate.
// Imperva default: https://github.com/imperva/terraform-aws-dsf-hub/blob/main/variables.tf
// IBM: https://www.ibm.com/support/pages/ibm-guardium-appliance-technical-requirements-122
// Trellix: https://docs.trellix.com/data-and-email/docs/database-security-server-requirements
// DataSunrise: https://www.datasunrise.com/guides/backend-db-postgresql-vs-aurorapostgresql/
const SELF_HOSTED_PROFILES = {
	'ibm-guardium-dam': {
		dataRate: DAM_TCO_RATES.guardiumPerHour,
		bootGiB: 300,
		managementNodes: 2,
		managementRate: DAM_TCO_RATES.guardiumPerHour,
		managementBootGiB: 600
	},
	'imperva-dam': {
		dataRate: DAM_TCO_RATES.repositoryPerHour,
		bootGiB: 100,
		managementNodes: 0,
		managementRate: DAM_TCO_RATES.applicationPerHour,
		managementBootGiB: 100
	},
	'datasunrise-dam': {
		dataRate: DAM_TCO_RATES.repositoryPerHour,
		bootGiB: 100,
		managementNodes: 0,
		managementRate: DAM_TCO_RATES.applicationPerHour,
		managementBootGiB: 100
	},
	'trellix-dam': {
		dataRate: DAM_TCO_RATES.sqlRepositoryPerHour,
		bootGiB: 100,
		managementNodes: 0,
		managementRate: DAM_TCO_RATES.applicationPerHour,
		managementBootGiB: 100
	}
};

/** @param {keyof typeof SELF_HOSTED_PROFILES} provider @param {{databases: number, retentionDays: number, dailyGB: number}} workload */
export function estimateSelfHostedDam(provider, { databases, retentionDays, dailyGB }) {
	const p = SELF_HOSTED_PROFILES[provider];
	const a = DAM_TCO_ASSUMPTIONS;
	const r = DAM_TCO_RATES;
	const retainedGiB = (dailyGB * retentionDays * 1e9) / 2 ** 30;
	const ingressGroups = Math.max(
		1,
		Math.ceil(databases / a.databasesPerProcessingGroup),
		Math.ceil(dailyGB / a.dailyGBPerProcessingGroup)
	);
	const groups = Math.max(
		ingressGroups,
		Math.ceil((retainedGiB * a.storageHeadroom) / a.repositoryGiBPerGroup)
	);
	const dataNodes = groups * 2;
	const managementNodes = provider === 'ibm-guardium-dam' ? p.managementNodes : ingressGroups * 2;
	const nodes = dataNodes + managementNodes;
	const bootGiB = dataNodes * p.bootGiB + managementNodes * p.managementBootGiB;
	const primaryGiB = Math.ceil(retainedGiB * a.storageHeadroom);
	/** @type {DamTcoComponent[]} */
	const components = [
		{
			id: 'ha-compute',
			label: 'HA compute',
			amount: (dataNodes * p.dataRate + managementNodes * p.managementRate) * 8760,
			frequency: 'annual'
		},
		{
			id: 'hot-storage',
			label: 'Hot storage',
			amount: (primaryGiB * 2 + bootGiB) * r.gp3PerGiBMonth * 12,
			frequency: 'annual'
		},
		{
			id: 'backups',
			label: 'Backups',
			amount: (retainedGiB + bootGiB / 2) * r.snapshotPerGiBMonth * 12,
			frequency: 'annual'
		},
		{
			id: 'network-transfer',
			label: 'Network transfer',
			amount: dailyGB * 365 * r.regionalTransferPerGB,
			frequency: 'annual'
		},
		...estimateDamLabor(databases, nodes)
	];
	return {
		components,
		pricingAssumptions:
			`Customer-hosted AWS scenario: ${dataNodes} repository/collector nodes and ${managementNodes} management/gateway nodes. Sizing assumes 250 databases or 250 raw GB/day per processing group, at most 32 TiB of primary repository per group, with two HA nodes. ` +
			'One uncompressed logical audit record retained, 25% disk headroom, two hot copies, one backup copy and one cross-AZ replication pass. No measured product capacity or compression discount assumed. Steady-state retained capacity, not a new-install storage ramp. Existing monitored-database hosting, paid gp3 performance, taxes and contract-specific premium support excluded. ' +
			(provider === 'trellix-dam'
				? 'Backend uses Windows + SQL Server Standard license-inclusive EC2; no duplicate Windows/SQL support fee. '
				: '') +
			(provider === 'datasunrise-dam'
				? 'Backend uses supported self-managed PostgreSQL; no separate database-engine license. '
				: '') +
			DAM_LABOR_BASIS
	};
}
