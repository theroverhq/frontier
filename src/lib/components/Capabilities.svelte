<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	type Kind = 'plain' | 'muted' | 'bright' | 'key';
	type Tok = { t: string; k: Kind };

	/* VPC flow query, tokenised so each part can carry its own weight. */
	const vpcLines: Tok[][] = [
		[
			{ t: 'source=', k: 'plain' },
			{ t: 'vpc_flow', k: 'key' }
		],
		[
			{ t: 'where ', k: 'muted' },
			{ t: 'dst_ip="185.220.101.4"', k: 'bright' }
		],
		[
			{ t: 'sort ', k: 'muted' },
			{ t: 'timestamp', k: 'bright' }
		]
	];
	const vpcLengths = vpcLines.map((l) => l.reduce((n, tok) => n + tok.t.length, 0));

	const dnsRows = [
		{ name: 'wz9x.evil.net', ips: 1, dim: false },
		{ name: 'c2.staging.internal', ips: 2, dim: false },
		{ name: 'tunnel-endpoint.xyz', ips: 1, dim: true }
	];

	const aiSteps = [
		'Searched 14 months of process telemetry',
		'Found the same hash on 7 endpoints',
		'Correlated DNS queries from 3 hosts',
		'Found first execution 93 days earlier',
		'Identified related cloud activity'
	];

	const dataLabels = [
		{ label: 'Search', x: 16 },
		{ label: 'Analytics', x: 39 },
		{ label: 'Detect', x: 61 },
		{ label: 'AI SOC', x: 84 }
	];

	let vpcEl: HTMLDivElement | undefined = $state();
	let dnsEl: HTMLDivElement | undefined = $state();
	let aiEl: HTMLDivElement | undefined = $state();
	let stripEl: HTMLDivElement | undefined = $state();

	let typed = $state(vpcLines.map(() => 0));
	let caretLine = $state(-1);
	let resIn = $state(false);
	let months = $state(0);
	let secs = $state(0);
	let dnsIn = $state(false);
	let stepsIn = $state(false);
	let dropsIn = $state(false);
	let barIn = $state(false);

	function slice(line: Tok[], n: number): Tok[] {
		const out: Tok[] = [];
		let left = n;
		for (const tok of line) {
			if (left <= 0) break;
			out.push({ t: tok.t.slice(0, left), k: tok.k });
			left -= tok.t.length;
		}
		return out;
	}

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

		const settle = () => {
			typed = vpcLengths.slice();
			caretLine = -1;
			resIn = true;
			months = 18;
			secs = 7.1;
			dnsIn = true;
			stepsIn = true;
			dropsIn = true;
			barIn = true;
		};

		if (reduced) {
			settle();
			return;
		}

		let dead = false;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const later = (fn: () => void, ms: number) => {
			const id = setTimeout(() => {
				timers.delete(id);
				if (!dead) fn();
			}, ms);
			timers.add(id);
			return id;
		};

		const countUp = (to: number, dur: number, set: (v: number) => void) => {
			const t0 = performance.now();
			const step = (now: number) => {
				if (dead) return;
				const p = Math.min(1, Math.max(0, (now - t0) / dur));
				set(to * (1 - Math.pow(1 - p, 3)));
				if (p < 1) requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		};

		const typeLine = (li: number) => {
			if (li >= vpcLines.length) {
				caretLine = -1;
				resIn = true;
				countUp(18, 1100, (v) => (months = v));
				countUp(7.1, 1100, (v) => (secs = v));
				return;
			}
			caretLine = li;
			const len = vpcLengths[li];
			const step = () => {
				if (dead) return;
				typed[li] = Math.min(len, typed[li] + 1 + (Math.random() < 0.35 ? 1 : 0));
				if (typed[li] < len) later(step, 22 + Math.random() * 34);
				else later(() => typeLine(li + 1), 110);
			};
			step();
		};

		const observers: IntersectionObserver[] = [];
		const once = (el: Element | undefined, cb: () => void, threshold = 0.4) => {
			if (!el) return;
			if (!('IntersectionObserver' in window)) {
				cb();
				return;
			}
			const io = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						io.disconnect();
						cb();
					}
				},
				{ threshold }
			);
			io.observe(el);
			observers.push(io);
		};

		once(vpcEl, () => typeLine(0), 0.5);
		once(dnsEl, () => (dnsIn = true), 0.5);
		once(aiEl, () => (stepsIn = true), 0.45);
		once(
			stripEl,
			() => {
				dropsIn = true;
				later(() => (barIn = true), 300);
			},
			0.35
		);

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			observers.forEach((io) => io.disconnect());
		};
	});
</script>

<section id="capabilities" class="bg-muted text-foreground relative overflow-hidden pt-26 pb-24">
	<!-- Lime-tinted wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(760px 400px at 50% 0%, color-mix(in oklab, var(--primary) 16%, var(--muted)), transparent 70%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				What Your SIEM Can't Afford To Keep
			</Badge>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				Search it. Analyze it.<br />Detect on it.
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Rover makes high-volume security telemetry economically searchable and usable—from network
				flows and DNS to raw endpoint and cloud activity.
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- 01 — SEARCH -->
			<article
				class="border-border bg-background flex flex-col overflow-hidden rounded-[18px] border shadow-[0_2px_6px_rgba(0,0,0,0.03),0_22px_48px_-18px_rgba(0,0,0,0.1)]"
			>
				<div class="flex flex-1 flex-col p-[30px] pb-7">
					<div class="flex gap-2.5 text-[11px] font-bold tracking-[0.1em] uppercase">
						<b class="">01</b> Search · VPC Flow Logs
					</div>
					<h3 class="mt-3.5 text-[22.5px] leading-[1.25] font-bold tracking-[-0.02em]">
						Find the connection everyone else discarded.
					</h3>
					<p class=" mt-3 text-[14.5px] leading-[1.68]">
						Search the telemetry your SIEM made too expensive to keep. Explore massive volumes of
						full-fidelity network flow logs without sampling or archiving.
					</p>

					<div class="mt-[26px] flex flex-1 flex-col justify-end">
						<div
							bind:this={vpcEl}
							class="dark bg-background text-foreground rounded-xl px-[22px] pt-5 pb-4 text-[12.5px]"
						>
							{#each vpcLines as line, li (li)}
								<div class="mb-3 flex min-h-[19px] items-center">
									<span class="bg-primary mr-3 h-[15px] w-0.5 shrink-0 opacity-85"></span>
									<span class="whitespace-pre">
										{#each slice(line, typed[li]) as tok, ti (ti)}<span
												class:text-primary={tok.k === 'key'}
												class:text-muted-foreground={tok.k === 'muted'}
												class:text-foreground={tok.k === 'bright'}
												class:font-semibold={tok.k === 'bright'}>{tok.t}</span
											>{/each}{#if caretLine === li}<span
												class="bg-primary ml-px inline-block h-3 w-[7px] align-[-2px]"
											></span>{/if}
									</span>
								</div>
							{/each}

							<div class="border-border mt-4 mb-3 border-t"></div>

							<div
								class=" flex items-center gap-2.5 text-xs transition-opacity duration-500"
								style="opacity: {resIn ? 1 : 0};"
							>
								<span
									class="bg-primary h-[7px] w-[7px] shrink-0 rounded-full shadow-[0_0_8px_var(--primary)]"
								></span>
								<span>{Math.round(months)} months searched</span>
								<span class="text-muted-foreground/70">· {secs.toFixed(1)} sec</span>
							</div>
						</div>
					</div>
				</div>
				<div
					class="border-border bg-muted/50 border-t px-[30px] py-3.5 text-[11px] font-semibold tracking-[0.09em] uppercase"
				>
					Full-fidelity network flow data, searchable for years.
				</div>
			</article>

			<!-- 02 — ANALYTICS -->
			<article
				class="border-border bg-background flex flex-col overflow-hidden rounded-[18px] border shadow-[0_2px_6px_rgba(0,0,0,0.03),0_22px_48px_-18px_rgba(0,0,0,0.1)]"
			>
				<div class="flex flex-1 flex-col p-[30px] pb-7">
					<div class="flex gap-2.5 text-[11px] font-bold tracking-[0.1em] uppercase">
						<b class="">02</b> Analytics · DNS Logs
					</div>
					<h3 class="mt-3.5 text-[22.5px] leading-[1.25] font-bold tracking-[-0.02em]">
						Find the signal buried in billions of DNS queries.
					</h3>
					<p class=" mt-3 text-[14.5px] leading-[1.68]">
						Aggregate and visualize noisy, high-volume telemetry natively. Filter, group, and
						calculate directly on the data without exporting it.
					</p>

					<div class="mt-[26px] flex flex-1 flex-col justify-end">
						<div class="relative pb-3.5" bind:this={dnsEl}>
							<!-- Query underneath, results lifted over it -->
							<div
								class="dark bg-background h-[118px] overflow-hidden rounded-xl px-[22px] py-5 text-[12.5px]"
							>
								source=<span class="text-primary opacity-60">dns</span> | rare query_name<br />
								&nbsp;&nbsp;over <span class="text-primary opacity-60">12 months</span>
							</div>
							<div
								class="border-border bg-background relative -mt-[74px] ml-[26px] overflow-hidden rounded-xl border shadow-[0_18px_44px_-12px_rgba(0,0,0,0.18)]"
							>
								<div
									class="border-border flex justify-between border-b px-5 py-3 text-[10.5px] font-bold tracking-[0.1em] uppercase"
								>
									<span>Query Name</span><span class="">Distinct IPs</span>
								</div>
								{#each dnsRows as row, i (row.name)}
									<div
										class="border-border/60 flex justify-between border-b px-5 py-3 text-[12.5px] transition-all duration-500 last:border-b-0"
										class:text-muted-foreground={row.dim}
										style="opacity: {dnsIn ? 1 : 0}; transform: translateY({dnsIn
											? 0
											: 10}px); transition-delay: {i * 160}ms;"
									>
										<span>{row.name}</span>
										<b class:font-bold={!row.dim} class:font-medium={row.dim} class="text-[13px]"
											>{row.ips}</b
										>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
				<div
					class="border-border bg-muted/50 border-t px-[30px] py-3.5 text-[11px] font-semibold tracking-[0.09em] uppercase"
				>
					Rare domains observed across the last 12 months.
				</div>
			</article>

			<!-- 03 — DETECT -->
			<article
				class="border-border bg-background flex flex-col overflow-hidden rounded-[18px] border shadow-[0_2px_6px_rgba(0,0,0,0.03),0_22px_48px_-18px_rgba(0,0,0,0.1)]"
			>
				<div class="flex flex-1 flex-col p-[30px] pb-7">
					<div class="flex gap-2.5 text-[11px] font-bold tracking-[0.1em] uppercase">
						<b class="">03</b> Detect · CloudTrail Data Events
					</div>
					<h3 class="mt-3.5 text-[22.5px] leading-[1.25] font-bold tracking-[-0.02em]">
						Detect on the data you used to archive.
					</h3>
					<p class=" mt-3 text-[14.5px] leading-[1.68]">
						Keep object-level cloud activity available for detection and historical investigation
						instead of choosing between coverage and cost.
					</p>

					<div class="det group mt-[26px] flex flex-1 flex-col justify-end">
						<div class="border-border bg-background rounded-xl border px-[22px] py-5">
							<div
								class="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.1em] uppercase"
							>
								<span
									class="bg-destructive h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--destructive)]"
								></span>
								Detection Fired
							</div>
							<h4 class="mt-2.5 text-[19px] font-bold tracking-[-0.015em]">
								S3 Mass Object Retrieval
							</h4>
							<div
								class="border-border bg-muted/40 mt-4 grid grid-cols-2 gap-x-6 rounded-[10px] border px-[18px] py-3.5"
							>
								<div>
									<div class=" text-[10px] font-bold tracking-[0.1em] uppercase">Bucket</div>
									<div class="mt-1.5 truncate text-[12.5px]">prod-customer-data</div>
								</div>
								<div>
									<div class=" text-[10px] font-bold tracking-[0.1em] uppercase">Principal</div>
									<div class="mt-1.5 truncate text-[12.5px]">arn:aws:iam...</div>
								</div>
							</div>
						</div>
						<div
							class="border-border group-hover:border-foreground/20 mt-3.5 flex items-center justify-center gap-2.5 rounded-[10px] border px-[18px] py-3.5 text-[12.5px] transition-all duration-300 group-hover:shadow-[0_8px_22px_-10px_rgba(0,0,0,0.15)]"
						>
							<b class="text-foreground text-[11.5px] font-bold tracking-[0.09em] uppercase"
								>Investigate</b
							>
							<span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
							<span>View all object-level activity</span>
						</div>
					</div>
				</div>
				<div
					class="border-border bg-muted/50 border-t px-[30px] py-3.5 text-[11px] font-semibold tracking-[0.09em] uppercase"
				>
					High-volume telemetry · S3 data events · Unsampled
				</div>
			</article>

			<!-- 04 — AI SOC -->
			<article
				class="border-border bg-background flex flex-col overflow-hidden rounded-[18px] border shadow-[0_2px_6px_rgba(0,0,0,0.03),0_22px_48px_-18px_rgba(0,0,0,0.1)]"
			>
				<div class="flex flex-1 flex-col p-[30px] pb-7">
					<div class="flex gap-2.5 text-[11px] font-bold tracking-[0.1em] uppercase">
						<b class="">04</b> AI SOC · Raw EDR Telemetry
					</div>
					<h3 class="mt-3.5 text-[22.5px] leading-[1.25] font-bold tracking-[-0.02em]">
						Give your AI SOC years of memory.
					</h3>
					<p class=" mt-3 text-[14.5px] leading-[1.68]">
						The agent can investigate data traditional SIEM economics prevented you from
						retaining—correlating years of raw EDR telemetry in seconds.
					</p>

					<div class="mt-[26px] flex flex-1 flex-col justify-end">
						<div
							bind:this={aiEl}
							class="dark bg-background text-foreground group rounded-xl px-6 pt-5 pb-[18px]"
						>
							<div
								class="border-border flex items-center gap-3 border-b pb-4 text-[13.5px] font-medium"
							>
								<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
									<path
										d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2Z"
										class="fill-primary"
									/>
									<path
										d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15Z"
										class="fill-primary"
										opacity="0.7"
									/>
								</svg>
								Investigate this suspicious PowerShell execution.
							</div>

							<div class="pt-2">
								{#each aiSteps as step, i (step)}
									<div
										class=" flex items-center gap-3 py-[7.5px] text-[12.8px] transition-all duration-500"
										style="opacity: {stepsIn ? 1 : 0}; transform: translateX({stepsIn
											? 0
											: -8}px); transition-delay: {i * 280}ms;"
									>
										<svg
											viewBox="0 0 16 16"
											class="stroke-primary h-[13px] w-[13px] shrink-0 fill-none"
											stroke-width="2.4"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"><path d="M2.5 8.5 6 12l7.5-8" /></svg
										>
										{step}
									</div>
								{/each}
							</div>

							<a
								href="#ai-soc"
								class="text-primary mt-2.5 inline-flex items-center gap-2 text-[13px] font-semibold transition-opacity duration-500"
								style="opacity: {stepsIn ? 1 : 0}; transition-delay: {aiSteps.length * 280 +
									200}ms;"
							>
								Build investigation timeline
								<span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
							</a>
						</div>
					</div>
				</div>
				<div
					class="border-border bg-muted/50 border-t px-[30px] py-3.5 text-[11px] font-semibold tracking-[0.09em] uppercase"
				>
					Raw EDR telemetry · Process executions · Process trees
				</div>
			</article>
		</div>

		<!-- Four workflows, one dataset -->
		<div bind:this={stripEl} class="mt-5 text-center">
			<div class="relative mx-auto hidden h-24 max-w-[760px] sm:block">
				{#each dataLabels as item, i (item.label)}
					<span
						class="absolute top-3.5 -translate-x-1/2 text-[10.5px] font-semibold"
						style="left: {item.x}%;">{item.label}</span
					>
					<span
						class="bg-border absolute top-11 bottom-0 w-px origin-top transition-transform duration-700 ease-out"
						style="left: {item.x}%; transform: scaleY({dropsIn ? 1 : 0}); transition-delay: {i *
							120}ms;"
					></span>
				{/each}
			</div>

			<div
				class="dark bg-background text-foreground mx-auto max-w-[706px] rounded-[14px] px-[30px] pt-[23px] pb-[21px] shadow-[0_24px_54px_-18px_rgba(0,0,0,0.35)] transition-all duration-700"
				style="opacity: {barIn ? 1 : 0}; transform: translateY({barIn ? 0 : 26}px);"
			>
				<h4 class="text-primary text-sm font-bold tracking-[0.09em] uppercase">
					One Full-Fidelity Security Dataset
				</h4>
				<p class=" mt-2 text-[11px] font-medium tracking-[0.09em] uppercase">
					Search, analytics, detections, and AI operate on the same full-fidelity security history.
				</p>
			</div>

			<div class="relative mx-auto mt-[26px] h-9 w-px">
				<span class="bg-border absolute inset-0"></span>
				<span
					class="absolute bottom-0 left-1/2 -translate-x-1/2 border-4 border-transparent"
					style="border-top-color: color-mix(in oklab, var(--foreground) 25%, transparent);"
				></span>
			</div>
			<div class="mt-3 text-[10px] font-bold tracking-[0.12em] uppercase">
				How Rover Makes This Possible
			</div>
		</div>
	</div>
</section>
