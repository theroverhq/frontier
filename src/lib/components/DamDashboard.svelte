<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fly, slide } from 'svelte/transition';
	import {
		Activity,
		ChartNoAxesColumn,
		Database,
		Pause,
		Play,
		Search,
		Server,
		TriangleAlert,
		X as XIcon
	} from '@lucide/svelte';

	/* ------------------------------------------------------------------
	   Illustrative data. Instance names are shared across every card so
	   picking a database highlights its servers, events, and queries.
	   ------------------------------------------------------------------ */
	type Tone = 'grey' | 'white' | 'red';
	type Seg = { label: string; value: number; tone: Tone };

	const toneColor: Record<Tone, string> = {
		grey: 'var(--muted-foreground)',
		white: 'var(--foreground)',
		red: 'var(--security-critical)'
	};

	const health: Seg[] = [
		{ label: 'Healthy', value: 8, tone: 'grey' },
		{ label: 'Warning', value: 3, tone: 'white' },
		{ label: 'Critical', value: 2, tone: 'red' }
	];
	const technologies: [string, number][] = [
		['Oracle', 4],
		['PostgreSQL', 3],
		['Microsoft SQL Server', 2],
		['MySQL', 2],
		['MongoDB', 2]
	];
	const alertSegs: Seg[] = [
		{ label: 'Critical', value: 2, tone: 'red' },
		{ label: 'High', value: 4, tone: 'white' },
		{ label: 'Medium', value: 5, tone: 'grey' }
	];

	type Metric = 'CPU' | 'Memory' | 'Storage';
	const metrics: Metric[] = ['CPU', 'Memory', 'Storage'];
	const usage: Record<Metric, [string, number][]> = {
		CPU: [
			['Oracle-PROD-03', 96],
			['PostgreSQL-PROD-07', 68],
			['MSSQL-PROD-06', 61],
			['MongoDB-PROD-04', 55],
			['MySQL-PROD-02', 43]
		],
		Memory: [
			['MSSQL-PROD-06', 91],
			['Oracle-PROD-03', 82],
			['PostgreSQL-PROD-07', 74],
			['MongoDB-PROD-04', 63],
			['MySQL-PROD-02', 48]
		],
		Storage: [
			['Oracle-PROD-03', 71],
			['MySQL-PROD-02', 66],
			['PostgreSQL-PROD-07', 58],
			['MongoDB-PROD-04', 52],
			['MSSQL-PROD-06', 39]
		]
	};

	/* Alerts over time, one series per severity (values on a 0–12 scale). */
	const series: { tone: Tone; points: number[] }[] = [
		{ tone: 'red', points: [0.4, 1.2, 0.5, 1.4, 0.6, 1.1, 1.3] },
		{ tone: 'white', points: [0.8, 1.6, 2, 2.4, 3.2, 2.4, 3.4] },
		{ tone: 'grey', points: [1.2, 2.4, 1.4, 3, 3.6, 2.8, 4.4] }
	];
	const X = (i: number) => 34 + i * (256 / 6);
	const Y = (v: number) => 118 - v * 8.8;
	const timeAxis: { label: string; i: number; anchor: 'start' | 'middle' | 'end' }[] = [
		{ label: '12:15', i: 0, anchor: 'start' },
		{ label: '12:20', i: 2, anchor: 'middle' },
		{ label: '12:25', i: 4, anchor: 'middle' },
		{ label: '12:30', i: 6, anchor: 'end' }
	];
	const linePath = (pts: number[]) =>
		pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');

	type Cat = 'Queries' | 'Logins' | 'Admin' | 'DDL' | 'Errors' | 'Security';
	type Tab = 'All' | Cat;
	const tabs: Tab[] = ['All', 'Queries', 'Logins', 'Admin', 'DDL', 'Errors', 'Security'];
	type Ev = {
		db: string;
		user: string;
		action: string;
		detail: string;
		note: string;
		cat: Cat;
		red?: boolean;
	};
	type Row = Ev & { id: number; time: string };

	/* The first seven seed the stream; the rest arrive live, then it loops. */
	const pool: Ev[] = [
		{
			db: 'Oracle-PROD-03',
			user: 'APP_USER',
			action: 'SELECT',
			detail: 'SELECT * FROM customer_transactions WHERE region = :r',
			note: '18.4s',
			cat: 'Queries'
		},
		{
			db: 'PostgreSQL-PROD-07',
			user: 'svc_payment',
			action: 'LOGIN FAILED',
			detail: 'Invalid password',
			note: '7 attempts',
			cat: 'Logins',
			red: true
		},
		{
			db: 'Redis-PROD-02',
			user: 'developer01',
			action: 'KEYS *',
			detail: 'Restricted command execution',
			note: '',
			cat: 'Security'
		},
		{
			db: 'MongoDB-PROD-04',
			user: 'report_user',
			action: 'COLLSCAN',
			detail: 'customer_transactions',
			note: '12.7s',
			cat: 'Queries'
		},
		{
			db: 'MSSQL-PROD-06',
			user: 'sa_user',
			action: 'CPU HIGH',
			detail: 'CPU: 94% RAM: 91%',
			note: '',
			cat: 'Errors'
		},
		{
			db: 'MySQL-PROD-02',
			user: 'app_readonly',
			action: 'SELECT',
			detail: 'SELECT balance FROM account_summary',
			note: '2.1s',
			cat: 'Queries'
		},
		{
			db: 'PostgreSQL-PROD-07',
			user: 'dba_ops',
			action: 'GRANT',
			detail: 'GRANT SELECT ON payroll TO analyst_07',
			note: '',
			cat: 'Admin'
		},
		{
			db: 'MSSQL-PROD-06',
			user: 'deploy_bot',
			action: 'ALTER TABLE',
			detail: 'ALTER TABLE orders ADD risk_score INT',
			note: '',
			cat: 'DDL'
		},
		{
			db: 'PostgreSQL-PROD-07',
			user: 'analyst_07',
			action: 'SELECT',
			detail: 'SELECT email FROM customers',
			note: '1,204 rows',
			cat: 'Queries'
		},
		{
			db: 'MySQL-PROD-02',
			user: 'unknown',
			action: 'DROP TABLE',
			detail: 'DROP TABLE audit_log (blocked)',
			note: '',
			cat: 'Security',
			red: true
		},
		{
			db: 'Oracle-PROD-03',
			user: 'etl_job',
			action: 'ORA-01555',
			detail: 'Snapshot too old',
			note: '',
			cat: 'Errors'
		},
		{
			db: 'MongoDB-PROD-04',
			user: 'admin',
			action: 'createUser',
			detail: "createUser({ user: 'svc_tmp' })",
			note: '',
			cat: 'Admin'
		},
		{
			db: 'Oracle-PROD-03',
			user: 'contractor_02',
			action: 'LOGIN',
			detail: 'New client 203.0.113.24',
			note: '',
			cat: 'Logins'
		},
		{
			db: 'Oracle-PROD-03',
			user: 'dba_ops',
			action: 'DROP INDEX',
			detail: 'DROP INDEX idx_txn_region',
			note: '',
			cat: 'DDL'
		}
	];

	const queries = [
		{
			q: 'SELECT /*+ PARALLEL */ txn_id, amount FROM transactions',
			db: 'Oracle-PROD-03',
			impact: 72,
			execs: 2341
		},
		{
			q: 'UPDATE payment_txn SET settled = 1 WHERE batch_id = :b',
			db: 'Oracle-PROD-03',
			impact: 18,
			execs: 721
		},
		{
			q: 'SELECT * FROM customer_orders WHERE created_at > :d',
			db: 'PostgreSQL-PROD-07',
			impact: 12,
			execs: 1102
		},
		{
			q: 'SELECT account_id, sum(amount) FROM ledger GROUP BY 1',
			db: 'MySQL-PROD-02',
			impact: 8,
			execs: 2215
		},
		{ q: "db.collection.find({ status: 'open' })", db: 'MongoDB-PROD-04', impact: 6, execs: 1058 },
		{
			q: 'SELECT o.id, c.name FROM orders o JOIN customers c',
			db: 'PostgreSQL-PROD-07',
			impact: 5,
			execs: 864
		},
		{
			q: 'DELETE FROM session_cache WHERE expires < now()',
			db: 'MySQL-PROD-02',
			impact: 4,
			execs: 1940
		}
	];
	const maxImpact = Math.max(...queries.map((q) => q.impact));

	/* ------------------------------------------------------------------
	   Derived geometry
	   ------------------------------------------------------------------ */
	const C = 2 * Math.PI * 45;
	function arcs(segs: Seg[]) {
		const total = segs.reduce((n, s) => n + s.value, 0);
		let off = 0;
		return segs.map((s) => {
			const len = (s.value / total) * C;
			const arc = {
				...s,
				dash: `${Math.max(len - 2, 0).toFixed(2)} ${C.toFixed(2)}`,
				offset: -off,
				pct: `${s.value} (${Math.round((s.value / total) * 100)}%)`
			};
			off += len;
			return arc;
		});
	}
	const healthArcs = arcs(health);
	const alertArcs = arcs(alertSegs);

	/* ------------------------------------------------------------------
	   State
	   ------------------------------------------------------------------ */
	const MAX_ROWS = 7;
	let clock = 11 * 3600 + 34 * 60 + 21;
	let nextId = 0;
	let nextEv = 0;
	const stamp = (s: number) =>
		[Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
			.map((n) => String(n).padStart(2, '0'))
			.join(':');

	/* Deterministic seed so the prerendered stream matches hydration. */
	const seedTimes = [0, -2, -5, -9, -13, -18, -24];
	let events = $state<Row[]>(
		pool
			.slice(0, MAX_ROWS)
			.map((ev, i) => ({ ...ev, id: nextId++, time: stamp(clock + seedTimes[i]) }))
	);
	nextEv = MAX_ROWS;

	let metric = $state<Metric>('CPU');
	let tab = $state<Tab>('All');
	let term = $state('');
	let openId = $state<number | null>(null);
	let sel = $state<string | null>(null);
	let paused = $state(false);
	let sortBy = $state<'impact' | 'execs'>('impact');
	let healthHot = $state(-1);
	let healthPin = $state(-1);
	let alertHot = $state(-1);
	let alertPin = $state(-1);

	/* Intro: CSS plays on load ('play'); a below-the-fold dashboard waits until seen.
	   'done' retires the entrance animations so nothing can replay them later. */
	let phase = $state<'play' | 'wait' | 'done'>('play');
	/* 0 → 1 drives every count-up; prerendered at 1 so numbers never depend on JS. */
	let p = $state(1);
	const ease = (t: number) => 1 - Math.pow(1 - t, 3);
	const count = (v: number) => Math.round(v * ease(p));
	const fmt = (n: number) => n.toLocaleString('en-US');

	/* Server rows keep one DOM order and slide to their rank, so a metric switch
	   never re-mounts a row (which would restart its CSS animations). */
	const SERVER_ROW = 39;
	const serverNames = usage.CPU.map(([name]) => name);
	const rankOf = $derived(
		Object.fromEntries(usage[metric].map(([name], i) => [name, i])) as Record<string, number>
	);
	const valueOf = $derived(Object.fromEntries(usage[metric]) as Record<string, number>);
	const serverPct: Record<string, Tween<number>> = Object.fromEntries(
		usage.CPU.map(([name, v]) => [name, new Tween(v, { duration: 450, easing: cubicOut })])
	);
	$effect(() => {
		for (const [name, v] of usage[metric]) serverPct[name].target = v;
	});
	const visible = $derived(
		events
			.filter((r) => tab === 'All' || r.cat === tab)
			.filter((r) => !term || Object.values(r).join(' ').toLowerCase().includes(term.toLowerCase()))
			.slice(0, MAX_ROWS)
	);
	const sortedQueries = $derived([...queries].sort((a, b) => b[sortBy] - a[sortBy]));
	const healthFocus = $derived(healthHot >= 0 ? healthHot : healthPin);
	const alertFocus = $derived(alertHot >= 0 ? alertHot : alertPin);

	function pick(db: string) {
		sel = sel === db ? null : db;
	}
	const dim = (db: string) => sel !== null && db !== sel;

	let dashEl: HTMLDivElement | undefined = $state();

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !dashEl) return;

		let dead = false;
		let inView = true;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const later = (fn: () => void, ms: number) => {
			const id = setTimeout(() => {
				timers.delete(id);
				if (!dead) fn();
			}, ms);
			timers.add(id);
		};

		const countUp = () => {
			p = 0;
			later(() => {
				const t0 = performance.now();
				const step = (now: number) => {
					if (dead) return;
					p = Math.min(1, (now - t0) / 1300);
					if (p < 1) requestAnimationFrame(step);
				};
				requestAnimationFrame(step);
			}, 550);
		};

		/* New activity lands every few seconds while the dashboard is on screen. */
		const tick = () => {
			if (!paused && inView && !document.hidden) {
				const ev = pool[nextEv % pool.length];
				nextEv += 1;
				clock += 2 + Math.floor(Math.random() * 5);
				events = [{ ...ev, id: nextId++, time: stamp(clock) }, ...events].slice(0, 40);
			}
			later(tick, 2800 + Math.random() * 1600);
		};

		const startIntro = () => {
			phase = 'play';
			countUp();
			later(() => (phase = 'done'), 3600);
		};

		const below = dashEl.getBoundingClientRect().top > innerHeight;
		if (below) phase = 'wait';
		else startIntro();

		const io = new IntersectionObserver(
			(entries) => {
				inView = entries[0].isIntersecting;
				if (inView && phase === 'wait') startIntro();
			},
			{ threshold: 0.2 }
		);
		io.observe(dashEl);
		later(tick, 4200);

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			io.disconnect();
		};
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') sel = null;
	}}
/>

<div
	bind:this={dashEl}
	data-phase={phase}
	class="dash @container/dash grid grid-cols-12 gap-2.5 p-2.5 text-left"
	class:paused
	role="region"
	aria-label="Interactive preview of the Rover DAM dashboard"
>
	<!-- Database Health Overview -->
	<section
		class="c @container col-span-12 @xl/dash:col-span-6 @2xl/dash:col-span-4"
		style:--d="300ms"
	>
		<header class="ch">
			<span class="ch-title"
				><Database aria-hidden="true" /><span class="truncate">Database Health Overview</span></span
			>
		</header>
		<div class="cb">
			<div class="flex flex-wrap items-center gap-x-5 gap-y-3">
				<div class="donut h-[88px] w-[88px]">
					<svg viewBox="0 0 120 120" aria-hidden="true">
						{#each healthArcs as arc, i (arc.label)}
							<circle
								class="arc"
								cx="60"
								cy="60"
								r="45"
								stroke={toneColor[arc.tone]}
								stroke-dashoffset={arc.offset}
								style:stroke-dasharray={arc.dash}
								style:--d="{300 + i * 180}ms"
								style:opacity={healthFocus < 0 || healthFocus === i ? 1 : 0.25}
								style:stroke-width={healthFocus === i ? 18 : 14}
							/>
						{/each}
					</svg>
					<div class="donut-mid">
						<b class="text-[18px]">{count(13)}</b><span class="text-[11px]">Total</span>
					</div>
				</div>
				<div class="min-w-[130px] flex-1">
					<div class="text-muted-foreground mb-2.5 text-[11px]">By technology</div>
					<ul class="grid gap-1.5 text-[11px]">
						{#each technologies as [name, n] (name)}
							<li class="lg-row">
								<i style:background={toneColor.grey}></i><span class="truncate">{name}</span><em
									>{n}</em
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>
			<ul class="mt-5 grid gap-1 text-[11px]">
				{#each healthArcs as arc, i (arc.label)}
					<li>
						<button
							type="button"
							class="lg-row lg-btn"
							class:pin={healthPin === i}
							aria-pressed={healthPin === i}
							onmouseenter={() => (healthHot = i)}
							onmouseleave={() => (healthHot = -1)}
							onfocus={() => (healthHot = i)}
							onblur={() => (healthHot = -1)}
							onclick={() => (healthPin = healthPin === i ? -1 : i)}
						>
							<i style:background={toneColor[arc.tone]}></i><span>{arc.label}</span><em
								>{arc.pct}</em
							>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Top Servers by Resource Usage -->
	<section
		class="c @container col-span-12 @xl/dash:col-span-6 @2xl/dash:col-span-4"
		style:--d="420ms"
	>
		<header class="ch">
			<span class="ch-title"
				><Server aria-hidden="true" /><span class="truncate"
					>Top Servers<span class="hidden @[17.5rem]:inline">{' '}by Resource Usage</span></span
				></span
			>
		</header>
		<div class="cb">
			<div
				class="bg-background mb-3 flex gap-1.5 rounded-[10px] p-1"
				role="group"
				aria-label="Metric"
			>
				{#each metrics as m (m)}
					<button
						type="button"
						class="seg-btn"
						class:on={metric === m}
						aria-pressed={metric === m}
						onclick={() => (metric = m)}>{m}</button
					>
				{/each}
			</div>
			<ul class="relative" style:height="{serverNames.length * SERVER_ROW - 10}px">
				{#each serverNames as name (name)}
					<li
						class="srv-row"
						class:dim={dim(name)}
						style:transform="translateY({rankOf[name] * SERVER_ROW}px)"
					>
						<button
							type="button"
							class="srv"
							onclick={() => pick(name)}
							aria-pressed={sel === name}
						>
							<span class="flex justify-between text-[11px]">
								<span class="truncate">{name}</span><em
									class="text-muted-foreground font-mono not-italic"
									>{count(serverPct[name].current)}%</em
								>
							</span>
							<span class="trk mt-[5px] block h-[7px]">
								<i
									class="fill shine"
									style:width="{valueOf[name]}%"
									style:--d="{700 + rankOf[name] * 120}ms"
								></i>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Alerts Summary (wider layouts only) -->
	<section class="c @container hidden @2xl/dash:col-span-4 @2xl/dash:block" style:--d="540ms">
		<header class="ch">
			<span class="ch-title"
				><TriangleAlert aria-hidden="true" /><span class="truncate">Alerts Summary</span></span
			>
		</header>
		<div class="cb">
			<div class="flex flex-wrap items-center gap-x-5 gap-y-3">
				<div class="donut h-[70px] w-[70px]">
					<svg viewBox="0 0 120 120" aria-hidden="true">
						{#each alertArcs as arc, i (arc.label)}
							<circle
								class="arc"
								cx="60"
								cy="60"
								r="45"
								stroke={toneColor[arc.tone]}
								stroke-dashoffset={arc.offset}
								style:stroke-dasharray={arc.dash}
								style:--d="{500 + i * 180}ms"
								style:opacity={alertFocus < 0 || alertFocus === i ? 1 : 0.25}
								style:stroke-width={alertFocus === i ? 18 : 14}
							/>
						{/each}
					</svg>
					<div class="donut-mid">
						<b class="text-[15px]">{count(11)}</b><span class="text-[8px]">Total</span>
					</div>
				</div>
				<ul class="grid min-w-[130px] flex-1 gap-1 text-[11px]">
					{#each alertArcs as arc, i (arc.label)}
						<li>
							<button
								type="button"
								class="lg-row lg-btn"
								class:pin={alertPin === i}
								aria-pressed={alertPin === i}
								onmouseenter={() => (alertHot = i)}
								onmouseleave={() => (alertHot = -1)}
								onfocus={() => (alertHot = i)}
								onblur={() => (alertHot = -1)}
								onclick={() => (alertPin = alertPin === i ? -1 : i)}
							>
								<i style:background={toneColor[arc.tone]}></i><span>{arc.label}</span><em
									>{arc.pct}</em
								>
							</button>
						</li>
					{/each}
				</ul>
			</div>
			<svg viewBox="0 0 300 150" class="lc mt-1.5 block h-auto w-full" aria-hidden="true">
				{#each [4, 8, 12] as v (v)}
					<line
						x1="30"
						x2="296"
						y1={Y(v)}
						y2={Y(v)}
						stroke="var(--border)"
						stroke-dasharray="3 5"
					/>
					<text x="0" y={Y(v) + 3}>{v}</text>
				{/each}
				{#each timeAxis as tick (tick.label)}
					<text x={X(tick.i)} y="146" text-anchor={tick.anchor}>{tick.label}</text>
				{/each}
				{#each series as s, j (s.tone)}
					<path
						class="line"
						d={linePath(s.points)}
						pathLength="1"
						stroke={toneColor[s.tone]}
						style:--d="{1000 + j * 250}ms"
						style:opacity={alertFocus < 0 || alertFocus === j ? 1 : 0.15}
					/>
				{/each}
			</svg>
		</div>
	</section>

	<!-- Live Activity Stream -->
	<section class="c @container col-span-12 @2xl/dash:col-span-7" style:--d="660ms">
		<header class="ch">
			<span class="ch-title">
				<Activity aria-hidden="true" /><span class="truncate">Live Activity Stream</span>
				<i class="live bg-primary inline-block h-1.5 w-1.5 rounded-full" aria-hidden="true"></i>
			</span>
			<span class="flex items-center gap-2">
				<label class="search hidden @md:flex">
					<Search aria-hidden="true" />
					<input
						type="search"
						bind:value={term}
						placeholder="Search events"
						aria-label="Search events"
					/>
				</label>
				<button
					type="button"
					class="ctl-btn"
					aria-pressed={paused}
					onclick={() => (paused = !paused)}
					title={paused ? 'Resume the live stream' : 'Pause the live stream'}
				>
					{#if paused}<Play aria-hidden="true" />Resume{:else}<Pause aria-hidden="true" />Pause{/if}
				</button>
			</span>
		</header>

		<div
			class="border-border flex items-center gap-1 border-b px-3"
			role="group"
			aria-label="Event type"
		>
			{#each tabs as t, i (t)}
				<button
					type="button"
					class="tab {i > 3 ? 'hidden @md:inline-block' : ''}"
					class:on={tab === t}
					aria-pressed={tab === t}
					onclick={() => (tab = t)}>{t}</button
				>
			{/each}
			{#if sel}
				<button
					type="button"
					class="chip ml-auto"
					onclick={() => (sel = null)}
					title="Clear the database filter"
					transition:fly={{ x: 8, duration: 200 }}
				>
					<span class="truncate">{sel}</span><XIcon aria-hidden="true" />
				</button>
			{/if}
		</div>

		<div class="relative overflow-hidden">
			{#each visible as row (row.id)}
				<div
					class="item transition-opacity"
					class:dim={dim(row.db)}
					class:open={openId === row.id}
					transition:slide={{ duration: 300 }}
				>
					<button
						type="button"
						class="row"
						aria-expanded={openId === row.id}
						onclick={() => (openId = openId === row.id ? null : row.id)}
					>
						<span class="m">{row.time}</span>
						<b>{row.db}</b>
						<span class="m hidden @lg:block">{row.user}</span>
						<b class:text-security-critical={row.red}>{row.action}</b>
						<span class="m hidden @sm:block">{row.detail}</span>
						<span class="m hidden text-right @2xl:block">{row.note}</span>
					</button>
					{#if openId === row.id}
						<div class="details" transition:slide={{ duration: 220 }}>
							<div>
								<span>Time</span>
								<p>{row.time}</p>
							</div>
							<div>
								<span>Database</span>
								<p>{row.db}</p>
							</div>
							<div>
								<span>User</span>
								<p>{row.user}</p>
							</div>
							<div>
								<span>Action</span>
								<p>{row.action}</p>
							</div>
							<div class="col-span-full">
								<span>Statement</span>
								<p>{row.detail}</p>
							</div>
							{#if row.note}<div>
									<span>Note</span>
									<p>{row.note}</p>
								</div>{/if}
							<div class="col-span-full">
								<button type="button" class="chip" onclick={() => pick(row.db)}>
									{sel === row.db ? 'Show all databases' : `Only ${row.db}`}
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="text-muted-foreground px-3.5 py-3 text-[11px]">No matching events</div>
			{/each}
			<div class="scan" aria-hidden="true"></div>
		</div>
	</section>

	<!-- Top Queries by Impact (wider layouts only) -->
	<section class="c @container hidden @2xl/dash:col-span-5 @2xl/dash:block" style:--d="780ms">
		<header class="ch">
			<span class="ch-title"
				><ChartNoAxesColumn aria-hidden="true" /><span class="truncate">Top Queries by Impact</span
				></span
			>
		</header>
		<div class="qgrid qhead">
			<span>Query</span>
			<span class="hidden @sm:block">Database</span>
			<button
				type="button"
				class="sort"
				class:on={sortBy === 'impact'}
				onclick={() => (sortBy = 'impact')}
			>
				Impact{#if sortBy === 'impact'}
					▾{/if}
			</button>
			<button
				type="button"
				class="sort text-right"
				class:on={sortBy === 'execs'}
				onclick={() => (sortBy = 'execs')}
			>
				Execs{#if sortBy === 'execs'}
					▾{/if}
			</button>
		</div>
		{#each sortedQueries as q, i (q.q)}
			<div animate:flip={{ duration: 400 }} class:dim={dim(q.db)} class="transition-opacity">
				<button type="button" class="qgrid qrow" onclick={() => pick(q.db)} title={q.q}>
					<span class="m text-foreground">{q.q}</span>
					<span class="m hidden @sm:block">{q.db}</span>
					<span class="flex items-center gap-2">
						<span class="trk block h-[5px] min-w-5 flex-1">
							<i
								class="fill shine"
								style:width="{(q.impact / maxImpact) * 100}%"
								style:--d="{1200 + i * 100}ms"
							></i>
						</span>
						<em class="text-muted-foreground w-8 text-right not-italic tabular-nums"
							>{count(q.impact)}%</em
						>
					</span>
					<span class="m text-right tabular-nums">{fmt(count(q.execs))}</span>
				</button>
			</div>
		{/each}
	</section>
</div>

<style>
	/* Frame ---------------------------------------------------------------- */
	.dash {
		position: relative;
		isolation: isolate;
		border: 1px solid color-mix(in oklab, var(--primary) 30%, var(--border));
		border-radius: 22px;
		background: color-mix(in oklab, var(--background) 94%, var(--primary));
		box-shadow: 0 30px 60px rgb(0 0 0 / 0.35);
	}
	/* The breathing glow is a static shadow whose opacity pulses: compositor-only, no repaints. */
	.dash::before {
		content: '';
		position: absolute;
		inset: -1px;
		z-index: -1;
		border-radius: inherit;
		box-shadow: 0 0 60px 0 color-mix(in oklab, var(--primary) 10%, transparent);
		opacity: 0;
		pointer-events: none;
	}
	.dash:not([data-phase='wait'])::before {
		animation: dash-glow 4s ease-in-out infinite;
	}
	@keyframes dash-glow {
		50% {
			opacity: 1;
		}
	}

	/* Cards ---------------------------------------------------------------- */
	.c {
		min-width: 0;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--card);
		transition:
			border-color 0.25s,
			transform 0.25s;
	}
	.c:hover {
		border-color: color-mix(in oklab, var(--primary) 35%, var(--border));
		transform: translateY(-3px);
	}
	.dash[data-phase='play'] .c {
		animation: up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
		animation-delay: var(--d);
	}
	.dash[data-phase='wait'] .c {
		opacity: 0;
	}
	@keyframes up {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
	}

	.ch {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
		font-size: 12.5px;
		font-weight: 600;
	}
	.ch-title {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 10px;
		white-space: nowrap;
	}
	.ch-title :global(svg),
	.ctl-btn :global(svg),
	.search :global(svg),
	.chip :global(svg) {
		width: 14px;
		height: 14px;
		flex: none;
		stroke: var(--muted-foreground);
	}
	.ch-title :global(svg) {
		width: 16px;
		height: 16px;
	}
	.cb {
		padding: 12px 14px;
	}

	/* Legends -------------------------------------------------------------- */
	.lg-row {
		display: grid;
		grid-template-columns: 12px minmax(0, 1fr) auto;
		gap: 8px;
		align-items: center;
		width: 100%;
		text-align: left;
	}
	.lg-row i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.lg-row em {
		font-style: normal;
		font-family: ui-monospace, Menlo, monospace;
		color: var(--muted-foreground);
	}
	.lg-btn {
		border-radius: 6px;
		padding: 2px 4px;
		margin: 0 -4px;
		width: calc(100% + 8px);
		cursor: pointer;
		transition:
			background-color 0.2s,
			transform 0.2s;
	}
	.lg-btn:hover,
	.lg-btn:focus-visible {
		transform: translateX(3px);
		outline: none;
	}
	.lg-btn.pin {
		background: color-mix(in oklab, var(--foreground) 7%, transparent);
	}

	/* Donuts --------------------------------------------------------------- */
	.donut {
		position: relative;
		flex: none;
	}
	.donut svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}
	.arc {
		fill: none;
		transition:
			opacity 0.2s,
			stroke-width 0.2s;
	}
	.dash[data-phase='play'] .arc {
		animation: arc-in 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) both;
		animation-delay: var(--d);
	}
	.dash[data-phase='wait'] .arc {
		stroke-dasharray: 0 283 !important;
	}
	@keyframes arc-in {
		from {
			stroke-dasharray: 0 283;
		}
	}
	.donut-mid {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		text-align: center;
		line-height: 1.15;
	}
	.donut-mid span {
		color: var(--muted-foreground);
	}

	/* Bars ----------------------------------------------------------------- */
	.seg-btn {
		flex: 1;
		border: 1px solid transparent;
		border-radius: 7px;
		padding: 5px;
		font-size: 12px;
		color: var(--muted-foreground);
		cursor: pointer;
		transition: color 0.2s;
	}
	.seg-btn:hover {
		color: var(--foreground);
	}
	.seg-btn.on {
		border-color: var(--border);
		background: var(--background-elevated);
		color: var(--foreground);
	}
	.srv-row {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		transition:
			transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1),
			opacity 0.25s;
	}
	.srv {
		display: block;
		height: 29px;
		width: 100%;
		text-align: left;
		cursor: pointer;
	}
	.srv:hover .fill {
		filter: brightness(1.15);
	}
	.trk {
		border-radius: 4px;
		background: var(--background);
	}
	.fill {
		position: relative;
		display: block;
		height: 100%;
		overflow: hidden;
		border-radius: 4px;
		background: var(--primary);
		transform-origin: left;
		transition:
			width 0.45s cubic-bezier(0.2, 0.7, 0.2, 1),
			filter 0.25s;
	}
	.dash[data-phase='play'] .fill {
		animation: grow 1.3s cubic-bezier(0.2, 0.7, 0.2, 1) both;
		animation-delay: var(--d);
	}
	.dash[data-phase='wait'] .fill {
		transform: scaleX(0);
	}
	@keyframes grow {
		from {
			transform: scaleX(0);
		}
	}
	.shine::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.45), transparent);
		transform: translateX(-100%);
		animation: shine 3.5s 2s infinite;
	}
	@keyframes shine {
		to {
			transform: translateX(100%);
		}
	}

	/* Line chart ----------------------------------------------------------- */
	.lc text {
		font:
			10px ui-monospace,
			Menlo,
			monospace;
		fill: var(--muted-foreground);
	}
	.line {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 1;
		transition: opacity 0.2s;
	}
	.dash[data-phase='play'] .line {
		animation: draw 1.8s cubic-bezier(0.3, 0.6, 0.2, 1) both;
		animation-delay: var(--d);
	}
	.dash[data-phase='wait'] .line {
		stroke-dashoffset: 1;
	}
	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
	}

	/* Activity stream ------------------------------------------------------ */
	.search {
		align-items: center;
		gap: 6px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--background);
		padding: 0 8px;
		transition: border-color 0.2s;
	}
	.search:focus-within {
		border-color: var(--primary);
	}
	.search input {
		width: 96px;
		background: transparent;
		padding: 5px 0;
		font-size: 11px;
		font-weight: 400;
		color: var(--foreground);
		outline: none;
		transition: width 0.25s;
	}
	.search input:focus {
		width: 130px;
	}
	.ctl-btn,
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--background-elevated);
		padding: 5px 9px;
		font-size: 11px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		transition: border-color 0.2s;
	}
	.ctl-btn:hover,
	.chip:hover {
		border-color: var(--primary);
	}
	.chip {
		max-width: 46%;
		color: var(--primary);
	}
	.chip :global(svg) {
		stroke: var(--primary);
	}
	.tab {
		position: relative;
		padding: 10px 8px;
		font-size: 12px;
		color: var(--muted-foreground);
		white-space: nowrap;
		cursor: pointer;
		transition: color 0.2s;
	}
	.tab:hover,
	.tab.on {
		color: var(--foreground);
	}
	.tab.on::after {
		content: '';
		position: absolute;
		right: 8px;
		bottom: -1px;
		left: 8px;
		height: 2px;
		border-radius: 2px;
		background: var(--primary);
		animation: underline 0.3s;
	}
	@keyframes underline {
		from {
			transform: scaleX(0);
		}
	}

	.item {
		border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
	}
	.item:first-child {
		border-top: 0;
	}
	.item.open {
		background: color-mix(in oklab, var(--primary) 4%, var(--card));
	}
	/* Columns drop away as the card narrows instead of scrolling sideways. */
	.row {
		display: grid;
		grid-template-columns: 58px minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 12px;
		align-items: center;
		width: 100%;
		padding: 8px 14px;
		font-size: 11px;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	@container (min-width: 24rem) {
		.row {
			grid-template-columns: 58px minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 1.4fr);
		}
	}
	@container (min-width: 32rem) {
		.row {
			grid-template-columns: 58px minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(
					0,
					1.7fr
				);
		}
	}
	@container (min-width: 42rem) {
		.row {
			grid-template-columns:
				58px minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 1.7fr)
				58px;
		}
	}
	.row:hover {
		background: color-mix(in oklab, var(--primary) 5%, var(--card));
	}
	.row > * {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row b {
		font-weight: 600;
	}
	.m {
		font-family: ui-monospace, Menlo, monospace;
		color: var(--muted-foreground);
	}
	.details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 6px 18px;
		padding: 2px 14px 10px;
		font-size: 11px;
	}
	.details span {
		display: block;
		margin-bottom: 2px;
		font-size: 10px;
		color: var(--muted-foreground);
	}
	.details p {
		margin: 0;
		font-family: ui-monospace, Menlo, monospace;
		overflow-wrap: anywhere;
	}
	/* A full-height layer with a soft glowing band and a faint core line in the middle,
	   moved by transform (no layout). */
	.scan {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				180deg,
				transparent calc(50% - 0.5px),
				color-mix(in oklab, var(--primary) 30%, transparent) 50%,
				transparent calc(50% + 0.5px)
			),
			linear-gradient(
				180deg,
				transparent calc(50% - 24px),
				color-mix(in oklab, var(--primary) 4%, transparent) calc(50% - 10px),
				color-mix(in oklab, var(--primary) 13%, transparent) 50%,
				color-mix(in oklab, var(--primary) 4%, transparent) calc(50% + 10px),
				transparent calc(50% + 24px)
			);
		pointer-events: none;
		will-change: transform;
		animation: scan 5s linear infinite;
	}
	@keyframes scan {
		from {
			transform: translateY(-60%);
		}
		to {
			transform: translateY(60%);
		}
	}
	.live {
		animation: pulse 1.6s infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.25;
		}
	}

	/* Queries table -------------------------------------------------------- */
	.qgrid {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) 52px;
		gap: 12px;
		align-items: center;
		width: 100%;
		padding: 8px 14px;
		font-size: 11px;
		text-align: left;
	}
	@container (min-width: 24rem) {
		.qgrid {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.1fr) minmax(0, 1fr) 52px;
		}
	}
	.qhead {
		border-bottom: 1px solid var(--border);
		font-weight: 600;
	}
	.qrow {
		border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
		cursor: pointer;
		transition: background-color 0.2s;
	}
	.qrow:hover {
		background: color-mix(in oklab, var(--primary) 5%, var(--card));
	}
	.qrow > span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sort {
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		transition: color 0.2s;
	}
	.sort:hover,
	.sort.on {
		color: var(--primary);
	}

	/* Cross-filter, pause, reduced motion ---------------------------------- */
	.dim {
		opacity: 0.28;
	}
	.paused::before,
	.paused .scan,
	.paused .shine::after,
	.paused .live {
		animation-play-state: paused;
	}
	@media (prefers-reduced-motion: reduce) {
		.dash::before,
		.dash .c,
		.dash .arc,
		.dash .fill,
		.dash .line,
		.shine::after,
		.scan,
		.live,
		.tab.on::after {
			animation: none !important;
		}
		.scan {
			display: none;
		}
	}
</style>
