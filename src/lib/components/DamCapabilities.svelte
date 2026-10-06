<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Activity,
		BellRing,
		Check,
		Database,
		FileCheck,
		FingerprintPattern,
		Radar,
		ScanEye,
		SearchCode,
		ShieldAlert,
		ShieldBan,
		UserCog
	} from '@lucide/svelte';

	/* Group ids double as the DAM navbar anchors. */
	const groups = [
		{
			id: 'discovery',
			step: 'Discover',
			title: "Map every database and what's inside it.",
			body: 'Find every instance, every table holding regulated data, and every account that can reach it.',
			features: [
				{
					icon: Database,
					title: 'Asset Inventory and Coverage',
					body: 'Discover every database instance across on-premises and cloud, and see which ones are monitored and which ones are blind spots.',
					points: [
						'Instance and schema discovery',
						'Unmonitored databases flagged',
						'Engine and version for every instance'
					]
				},
				{
					icon: ScanEye,
					title: 'Sensitive Data Visibility',
					body: 'Classify the tables and columns that hold PII, payment, and health data, then see which accounts query them and how often.',
					points: [
						'Column-level data classification',
						'Access to sensitive tables tracked',
						'Bulk SELECTs and exports flagged'
					]
				},
				{
					icon: ShieldAlert,
					title: 'Vulnerability and Entitlement Assessment',
					body: 'Check database configurations and patch levels, and review who holds which grants, roles, and privileges before an attacker does.',
					points: [
						'Configuration and patch-level checks',
						'Excessive, dormant, and orphaned grants',
						'Least-privilege role recommendations'
					]
				}
			]
		},
		{
			id: 'monitoring',
			step: 'Monitor',
			title: 'Capture every statement as it runs.',
			body: 'SQL-level visibility: the statement, the account that ran it, the client it came from, and the objects it touched.',
			features: [
				{
					icon: Activity,
					title: 'Real-Time Activity Monitoring',
					body: 'Record every SELECT, INSERT, UPDATE, DELETE, and schema change as it executes, with the account, client application, and tables involved.',
					points: [
						'DML, DDL, and DCL statements',
						'Logins, logouts, and failed connections',
						'Table- and column-level detail'
					]
				},
				{
					icon: UserCog,
					title: 'Privileged User Monitoring',
					body: 'Watch what DBAs, sysadmins, and service accounts do with elevated rights, from schema changes and grants to direct table access outside the application.',
					points: [
						'DBA and superuser sessions recorded',
						'GRANT, REVOKE, and role changes',
						'After-hours and break-glass access'
					]
				},
				{
					icon: FingerprintPattern,
					title: 'Identity Resolution',
					body: 'Applications connect through shared and pooled accounts. Rover traces each statement back to the real end user or service behind the connection.',
					points: [
						'End users behind pooled connections',
						'Shared and generic accounts unmasked',
						'Database accounts mapped to directory identities'
					]
				}
			]
		},
		{
			id: 'detection',
			step: 'Detect',
			title: "Spot the query that shouldn't have run.",
			body: 'Rules and behavioral baselines built around how databases are actually used, and misused.',
			features: [
				{
					icon: BellRing,
					title: 'Database Activity Alerts',
					body: 'Alert on the database events that matter: privilege grants, schema changes on sensitive tables, failed logins, and access from outside approved applications.',
					points: [
						'Policies per database, table, or account',
						'Alerts on grants, DDL, and failed logins',
						'Full SQL statement on every alert'
					]
				},
				{
					icon: Radar,
					title: 'Anomalous Query Detection',
					body: "Learn each account's normal query patterns and flag the outliers: SQL injection, mass reads of sensitive tables, and unusual data volumes.",
					points: [
						'Query-pattern baselines per account',
						'SQL injection and malformed queries',
						'Mass reads and data exfiltration'
					]
				}
			]
		},
		{
			id: 'investigation',
			step: 'Investigate',
			title: 'Know exactly who touched which data.',
			body: 'Every statement is kept and searchable, so an investigation starts from the exact SQL, not a guess.',
			features: [
				{
					icon: SearchCode,
					title: 'Investigation and Forensics',
					body: 'Reconstruct any incident from the statement-level record: which account ran which query, against which tables, when, and how many rows came back.',
					points: [
						'Search the full statement history',
						'Session-by-session query timelines',
						'Scope which tables and columns were exposed'
					]
				}
			]
		},
		{
			id: 'response',
			step: 'Respond',
			title: 'Stop risky queries before data leaves.',
			body: 'Enforce database policy in real time, not at the next audit.',
			features: [
				{
					icon: ShieldBan,
					title: 'Response and Enforcement',
					body: 'When a statement breaks policy, Rover can alert, block the query, or terminate the session, and contain the account behind it.',
					points: [
						'Block queries or terminate sessions',
						'Policy actions per database, table, or account',
						'Contain compromised database accounts'
					]
				}
			]
		},
		{
			id: 'compliance',
			step: 'Prove',
			title: 'Prove who accessed what.',
			body: 'A statement-level record of who accessed regulated data and who changed permissions, ready whenever auditors ask.',
			features: [
				{
					icon: FileCheck,
					title: 'Compliance and Audit Reporting',
					body: 'Generate reports on privileged activity, access to sensitive data, and permission changes, backed by the full statement-level audit trail.',
					points: [
						'Privileged-activity and data-access reports',
						'Permission-change and grant history',
						'Scheduled audit report delivery'
					]
				}
			]
		}
	];

	const num = (i: number) => String(i + 1).padStart(2, '0');

	let groupEls: HTMLDivElement[] = $state([]);
	/* Visible by default so prerendered content never depends on JS. */
	let shown = $state(groups.map(() => true));

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (!('IntersectionObserver' in window)) return;

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const i = groupEls.indexOf(entry.target as HTMLDivElement);
					if (i >= 0) shown[i] = true;
					io.unobserve(entry.target);
				}
			},
			{ threshold: 0.15 }
		);
		/* Only groups still below the fold get the reveal. */
		groupEls.forEach((el, i) => {
			if (el.getBoundingClientRect().top > innerHeight) {
				shown[i] = false;
				io.observe(el);
			}
		});
		return () => io.disconnect();
	});
</script>

<!-- overflow-clip (not hidden) so the sticky group headings still stick -->
<section id="capabilities" class="bg-muted text-foreground relative overflow-clip pt-24 pb-28">
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				Capabilities
			</Badge>
			<div class="mt-4 text-[11px] font-bold tracking-[0.12em] uppercase">
				Every database. Every account. Every statement.
			</div>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				See, control, and prove every query.
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Rover DAM watches the SQL itself: which account ran it, which tables and columns it touched,
				how much data came back, and whether it should have been allowed at all.
			</p>
		</div>

		<div
			class="dark bg-background text-foreground relative mt-16 overflow-clip rounded-3xl px-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)] md:px-11"
		>
			<!-- Ambient wash, mixed from the theme token -->
			<div
				class="pointer-events-none absolute inset-0"
				style="background: radial-gradient(60% 30% at 50% 0%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 70%);"
				aria-hidden="true"
			></div>

			<div class="relative">
				{#each groups as group, gi (group.id)}
					<div
						bind:this={groupEls[gi]}
						id={group.id}
						class="border-border grid grid-cols-1 gap-8 border-t py-12 first:border-t-0 md:py-14 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-14"
					>
						<div class="lg:sticky lg:top-28 lg:self-start">
							<div class="text-primary text-[11px] font-bold tracking-[0.12em] uppercase">
								{num(gi)} · {group.step}
							</div>
							<h3
								class="mt-3 text-[clamp(1.5rem,2.4vw,1.875rem)] leading-[1.2] font-bold tracking-[-0.02em]"
							>
								{group.title}
							</h3>
							<p class="text-foreground/70 mt-3 text-[15.5px] leading-[1.65]">{group.body}</p>
						</div>
						<div class="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
							{#each group.features as feature, fi (feature.title)}
								{@const wide =
									group.features.length === 1 || (group.features.length === 3 && fi === 2)}
								<div
									class="transition-all duration-700 ease-out {wide ? 'sm:col-span-2' : ''}"
									style="opacity: {shown[gi] ? 1 : 0}; transform: translateY({shown[gi]
										? 0
										: 16}px); transition-delay: {shown[gi] ? fi * 90 : 0}ms;"
								>
									<article
										class="border-border bg-card hover:border-primary/50 h-full rounded-2xl border p-6 transition-colors {wide
											? 'md:grid md:grid-cols-2 md:items-center'
											: 'flex flex-col'}"
									>
										<div class={wide ? 'md:pr-10' : ''}>
											<span
												class="border-primary/25 bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl border"
											>
												<feature.icon class="h-5 w-5" stroke-width={1.75} aria-hidden="true" />
											</span>
											<h4 class="mt-5 text-[18px] leading-[1.3] font-bold tracking-[-0.015em]">
												{feature.title}
											</h4>
											<p
												class="text-foreground/70 mt-2 mb-5 text-[14.5px] leading-[1.6] {wide
													? 'md:mb-0'
													: ''}"
											>
												{feature.body}
											</p>
										</div>
										<ul
											class="border-border space-y-2 border-t pt-4 {wide
												? 'md:border-t-0 md:border-l md:pt-0 md:pl-[33px]'
												: 'mt-auto'}"
										>
											{#each feature.points as point (point)}
												<li class="flex items-start gap-2.5 text-[13.5px] font-medium">
													<Check class="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
													{point}
												</li>
											{/each}
										</ul>
									</article>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
