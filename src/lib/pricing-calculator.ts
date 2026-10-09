// Dynamic Rover query latency scaling anchored at ~100 TB = 10s.
export function getRoverLatency(tbTotal: number): string {
	if (tbTotal <= 5) return '< 1s instant search';
	if (tbTotal <= 25) return '< 3s instant search';
	if (tbTotal <= 60) return '< 6s instant search';
	if (tbTotal <= 150) return '< 10s instant search';
	if (tbTotal <= 500) return '< 35s instant search';
	if (tbTotal <= 1500) return '< 1.5 min search';
	if (tbTotal <= 5000) return '< 4 min search';
	return '< 12 min search';
}

export const volumeTiers = [
	{
		label: '10 GB / day',
		gbPerDay: 10,
		tbPerMonth: 0.3,
		desc: 'Small Security Posture',
		alertsPerMonth: 450,
		huntsPerMonth: 70,
		totalSearches: 520
	},
	{
		label: '100 GB / day',
		gbPerDay: 100,
		tbPerMonth: 3.0,
		desc: 'Mid-Market Baseline',
		alertsPerMonth: 1250,
		huntsPerMonth: 260,
		totalSearches: 1510
	},
	{
		label: '250 GB / day',
		gbPerDay: 250,
		tbPerMonth: 7.5,
		desc: 'Growing Enterprise',
		alertsPerMonth: 2000,
		huntsPerMonth: 500,
		totalSearches: 2500
	},
	{
		label: '500 GB / day',
		gbPerDay: 500,
		tbPerMonth: 15.0,
		desc: 'Multi-Cloud Enterprise',
		alertsPerMonth: 3200,
		huntsPerMonth: 810,
		totalSearches: 4010
	},
	{
		label: '1 TB / day',
		gbPerDay: 1000,
		tbPerMonth: 30.0,
		desc: 'High-Volume Enterprise SIEM',
		alertsPerMonth: 5000,
		huntsPerMonth: 1040,
		totalSearches: 6040
	},
	{
		label: '2 TB / day',
		gbPerDay: 2000,
		tbPerMonth: 60.0,
		desc: 'Large Enterprise Scale',
		alertsPerMonth: 7500,
		huntsPerMonth: 1560,
		totalSearches: 9060
	},
	{
		label: '10 TB / day',
		gbPerDay: 10000,
		tbPerMonth: 300.0,
		desc: 'Global FinTech / SaaS Platform',
		alertsPerMonth: 15000,
		huntsPerMonth: 4120,
		totalSearches: 19120
	},
	{
		label: '100 TB / day',
		gbPerDay: 100000,
		tbPerMonth: 3000.0,
		desc: 'Hyperscale Fortune 50 Enterprise',
		alertsPerMonth: 40000,
		huntsPerMonth: 14000,
		totalSearches: 54000
	}
];

// Retention duration options in years (R)
export const retentionOptions = [
	{ label: '30 Days', R: 30 / 365 },
	{ label: '90 Days', R: 90 / 365 },
	{ label: '1 Year', R: 1.0 }, // Benchmark baseline
	{ label: '3 Years', R: 3.0 },
	{ label: '10 Years', R: 10.0 }
];

// Rover baseline rates anchored at 250 GB/day = $50k/yr, 500 GB/day = $120k/yr, 1 TB/day = $200k/yr, 2 TB/day = $275k/yr
// ArcSight retains the existing estimates; no public rate was verified.
export interface ProviderBenchmark {
	rover: { yearly1Y: number };
	opentext: { baseYearly: number; oneYearHot: number };
}

export const benchmarkData: Record<number, ProviderBenchmark> = {
	10: {
		rover: { yearly1Y: 10000 },
		opentext: { baseYearly: 16000, oneYearHot: 21500 }
	},
	100: {
		rover: { yearly1Y: 25000 },
		opentext: { baseYearly: 160000, oneYearHot: 215000 }
	},
	250: {
		rover: { yearly1Y: 50000 }, // Exact $50k/yr anchor
		opentext: { baseYearly: 400000, oneYearHot: 538000 }
	},
	500: {
		rover: { yearly1Y: 120000 }, // Exact $120k/yr anchor
		opentext: { baseYearly: 800000, oneYearHot: 1075000 }
	},
	1000: {
		// 1 TB
		rover: { yearly1Y: 200000 }, // Exact $200k/yr anchor
		opentext: { baseYearly: 1600000, oneYearHot: 2150000 }
	},
	2000: {
		// 2 TB
		rover: { yearly1Y: 275000 }, // Exact $275k/yr anchor
		opentext: { baseYearly: 3200000, oneYearHot: 4300000 }
	},
	10000: {
		// 10 TB
		rover: { yearly1Y: 650000 },
		opentext: { baseYearly: 16000000, oneYearHot: 21500000 }
	},
	100000: {
		// 100 TB
		rover: { yearly1Y: 4500000 },
		opentext: { baseYearly: 160000000, oneYearHot: 215000000 }
	}
};

// Interpolate DAM volumes between the existing Rover ingestion price tiers.
export function getRoverIngestionYearly(dailyGB: number): number {
	const upperIdx = volumeTiers.findIndex((tier) => tier.gbPerDay >= dailyGB);
	if (upperIdx <= 0) {
		const tier = volumeTiers[upperIdx === 0 ? 0 : volumeTiers.length - 1];
		return benchmarkData[tier.gbPerDay].rover.yearly1Y;
	}
	const lowerTier = volumeTiers[upperIdx - 1];
	const upperTier = volumeTiers[upperIdx];
	const lowerPrice = benchmarkData[lowerTier.gbPerDay].rover.yearly1Y;
	const upperPrice = benchmarkData[upperTier.gbPerDay].rover.yearly1Y;
	return (
		lowerPrice +
		((dailyGB - lowerTier.gbPerDay) / (upperTier.gbPerDay - lowerTier.gbPerDay)) *
			(upperPrice - lowerPrice)
	);
}

export interface ProviderComparison {
	id: string;
	name: string;
	category: string;
	cost: number;
	logo?: string;
	pricingNote?: string;
	retentionDescription?: string;
	compareWithRover?: boolean;
}

// Compact six-figure values; promote rounded 1,000K to 1M.
export const formatNumber = (val: number) => {
	const rounded = Math.round(val);
	if (rounded >= 999_950) {
		return `${(rounded / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
	}
	if (rounded >= 100_000) {
		return `${(rounded / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
	}
	return rounded.toLocaleString('en-US');
};
export const formatVal = (val: number) => `$${formatNumber(val)}`;
