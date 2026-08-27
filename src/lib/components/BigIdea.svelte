<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	type Tok = { t: string; k: boolean };

	/* Query text, tokenised so keywords can carry the accent colour. */
	const codeLines: Tok[][] = [
		[
			{ t: 'source=okta ', k: false },
			{ t: 'AND', k: true },
			{ t: ' action="login_failed"', k: false }
		],
		[
			{ t: '  stats count ', k: false },
			{ t: 'by', k: true },
			{ t: ' src_ip', k: false }
		],
		[{ t: '  sort -count', k: false }]
	];
	const lineLengths = codeLines.map((l) => l.reduce((n, tok) => n + tok.t.length, 0));

	const features = [
		{
			title: 'Full-text + structured search',
			body: 'Find exact events or hunt across arbitrary fields.',
			path: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
		},
		{
			title: 'Analytics in the same query',
			body: 'Filter → group → count → avg → stats without switching systems.',
			path: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'
		},
		{
			title: 'No rehydration',
			body: 'Historical data is already queryable.',
			path: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5M4 12v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V12"/>'
		}
	];

	const rows = [
		{ ip: '10.4.18.22', count: 12491 },
		{ ip: '18.221.44.11', count: 8104 },
		{ ip: '192.168.1.105', count: 5392 },
		{ ip: '54.21.19.8', count: 2118 }
	];

	/* Ten years of security activity: a broad early campaign, a sharper recent
	   one, and a little jitter so the histogram doesn't read as synthetic. */
	const N = 34;
	const heights = Array.from({ length: N }, (_, i) => {
		const x = i / (N - 1);
		const h =
			0.16 +
			0.66 * Math.exp(-Math.pow((x - 0.34) / 0.14, 2)) +
			0.42 * Math.exp(-Math.pow((x - 0.8) / 0.1, 2)) +
			0.05 * Math.sin(i * 2.7);
		return Math.min(1, Math.max(0.08, h));
	});

	let cardEl: HTMLDivElement | undefined = $state();
	let plotEl: HTMLDivElement | undefined = $state();

	let typed = $state(codeLines.map(() => 0));
	let caretLine = $state(-1);
	let barsIn = $state(false);
	let gridIn = $state(false);
	let flash = $state(false);
	let keysHot = $state(false);
	let scanAt = $state(-1); // 0..1 while a query sweeps, -1 when idle
	let hotIdx = $state(-1);
	let hoverIdx = $state(-1);
	let guideX = $state(0);

	let tb = $state(0); // TB scanned
	let ev = $state(0); // events, millions
	let secs = $state(0);
	let rowCounts = $state(rows.map(() => 0));

	const fmt = (n: number, dec: number, grp = false) =>
		grp
			? Number(n.toFixed(dec)).toLocaleString('en-US', {
					minimumFractionDigits: dec,
					maximumFractionDigits: dec
				})
			: n.toFixed(dec);

	/* Reveal the first n characters of a tokenised line. */
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

	function tip(i: number) {
		const h = heights[i];
		return {
			months: Math.round(6 + h * 24),
			events: (0.4 + h * 3.2).toFixed(1),
			secs: (3.2 + h * 5.2).toFixed(1)
		};
	}

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const touch = matchMedia('(hover: none)').matches;

		const settle = () => {
			typed = lineLengths.slice();
			caretLine = -1;
			barsIn = true;
			gridIn = true;
			tb = 3.8;
			ev = 4.3;
			secs = 5.12;
			rowCounts = rows.map((r) => r.count);
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

		/* Count a value up with an ease-out, matching the query "landing". */
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

		const countAll = (dur: number) => {
			countUp(3.8, dur, (v) => (tb = v));
			countUp(4.3, dur, (v) => (ev = v));
			countUp(5.12, dur, (v) => (secs = v));
			rows.forEach((r, i) =>
				countUp(r.count, dur, (v) => {
					rowCounts[i] = v;
				})
			);
		};

		/* Type each line, then hand off to the next. */
		const typeLine = (li: number, done: () => void) => {
			if (li >= codeLines.length) {
				caretLine = -1;
				done();
				return;
			}
			caretLine = li;
			const len = lineLengths[li];
			const step = () => {
				if (dead) return;
				typed[li] = Math.min(len, typed[li] + 1 + (Math.random() < 0.35 ? 1 : 0));
				if (typed[li] < len) later(step, 22 + Math.random() * 34);
				else later(() => typeLine(li + 1, done), 90);
			};
			step();
		};

		let running = false;
		const simulate = () => {
			if (dead || running || document.hidden || !cardEl) return;
			const r = cardEl.getBoundingClientRect();
			if (r.bottom < 0 || r.top > innerHeight) return;
			running = true;
			keysHot = true;
			const dur = 1500;
			const t0 = performance.now();
			const step = (now: number) => {
				if (dead) return;
				const p = Math.min(1, Math.max(0, (now - t0) / dur));
				const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
				scanAt = e;
				hotIdx = Math.floor(e * (N - 1));
				if (p < 1) {
					requestAnimationFrame(step);
					return;
				}
				scanAt = -1;
				hotIdx = -1;
				keysHot = false;
				countAll(900);
				flash = true;
				later(() => (flash = false), 1100);
				running = false;
			};
			requestAnimationFrame(step);
		};

		let interval: ReturnType<typeof setInterval> | undefined;
		const start = () => {
			typeLine(0, () => {});
			later(() => {
				gridIn = true;
				barsIn = true;
				countAll(1600);
				later(() => {
					flash = true;
					later(() => (flash = false), 900);
				}, 1900);
			}, 350);
			later(simulate, 4200);
			interval = setInterval(simulate, 9000);
		};

		let io: IntersectionObserver | undefined;
		if (cardEl && 'IntersectionObserver' in window) {
			io = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						io?.disconnect();
						start();
					}
				},
				{ threshold: 0.35 }
			);
			io.observe(cardEl);
		} else {
			start();
		}

		if (touch) hoverIdx = -1;

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			if (interval) clearInterval(interval);
			io?.disconnect();
		};
	});
</script>

<section
	id="big-idea"
	class="dark bg-background text-foreground relative overflow-hidden pt-28 pb-32"
>
	<!-- Ambient wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				Search Everything
			</Badge>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				Years of data. <span class="text-primary">Answers in seconds.</span>
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Search and analyze your full security history as if it were hot—without rehydration, moving
				data, or managing search clusters.
			</p>
		</div>

		<div
			class="mt-[76px] grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14"
		>
			<!-- Left: the claim, then what backs it -->
			<div>
				<h3 class="text-[24px] font-bold tracking-[-0.015em]">Years of history. One query.</h3>
				<p class=" mt-3.5 text-[15.5px] leading-[1.7]">
					Search across cloud, identity, endpoint, network, SaaS, and application telemetry with no
					distinction between "hot" and "archived" data.
				</p>

				{#each features as feature (feature.title)}
					<div class="border-border mt-6 flex gap-4 border-t border-dashed pt-[22px]">
						<div
							class="border-primary/30 bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border"
						>
							<svg
								viewBox="0 0 24 24"
								class="stroke-primary h-[17px] w-[17px] fill-none"
								stroke-width="1.7"
								aria-hidden="true">{@html feature.path}</svg
							>
						</div>
						<div>
							<h4 class="text-[15.5px] font-semibold">{feature.title}</h4>
							<p class=" mt-1 text-[13.8px] leading-[1.6]">{feature.body}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Right: the product surface -->
			<div
				bind:this={cardEl}
				class="border-border bg-card relative overflow-hidden rounded-[14px] border shadow-2xl"
			>
				<!-- Search bar -->
				<div class="border-border flex items-center gap-3 border-b px-[18px] py-[15px]">
					<svg
						viewBox="0 0 24 24"
						class="stroke-muted-foreground h-[15px] w-[15px] fill-none"
						stroke-width="1.8"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
					</svg>
					<span class=" text-[13.5px]">Search security data</span>
					<span
						class="border-border bg-muted ml-auto flex items-center gap-[7px] rounded-full border px-3 py-[5px] text-[11.5px]"
					>
						Time: Last 10 years
						<svg
							viewBox="0 0 24 24"
							class="stroke-muted-foreground h-[9px] w-[9px] fill-none"
							stroke-width="2"
							aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
						>
					</span>
				</div>

				<!-- Query -->
				<div class="border-border border-b px-[18px] pt-4 pb-3.5 text-[12.5px] leading-[1.85]">
					{#each codeLines as line, li (li)}
						<div class="flex gap-3.5">
							<span class="/60 w-2.5 shrink-0 text-right select-none"
								>{li + 1}</span
							>
							<span class="whitespace-pre">
								{#each slice(line, typed[li]) as tok, ti (ti)}<span
										class:text-primary={tok.k}
										class="kw"
										class:is-hot={tok.k && keysHot}>{tok.t}</span
									>{/each}{#if caretLine === li}<span
										class="bg-primary ml-px inline-block h-[13px] w-[7px] align-[-2px]"
									></span>{/if}
							</span>
						</div>
					{/each}
				</div>

				<!-- Result meta -->
				<div
					class=" border-border flex flex-wrap items-center gap-3 border-b px-[18px] py-3 text-[11.5px]"
				>
					<span>2016 → 2026</span>
					<span
						class="border-primary/25 bg-primary/10 text-primary/90 rounded-md border px-2.5 py-1"
						>All security data</span
					>
					<span
						class="border-primary/25 bg-primary/10 text-foreground ml-auto flex items-center gap-2 rounded-md border px-2.5 py-[5px] font-semibold transition-shadow duration-300"
						class:is-flash={flash}
					>
						<span class="bg-primary h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--primary)]"
						></span>
						{fmt(tb, 1)} TB bytes · {fmt(ev, 1)}M events · {fmt(secs, 2)} sec
					</span>
				</div>

				<!-- Histogram -->
				<div class="px-[18px] pt-4 pb-2.5">
					<div class="mb-4 flex justify-between">
						<span class="text-[10.5px] font-bold tracking-[0.1em] uppercase">
							Activity over 10 years
						</span>
						<span
							class=" text-[10.5px] font-semibold tracking-[0.1em] uppercase"
							>Log scale</span
						>
					</div>

					<div
						bind:this={plotEl}
						class="border-border relative h-[118px] border-b"
						class:is-focus={hoverIdx >= 0}
						role="img"
						aria-label="Security event volume per quarter across ten years"
					>
						{#each [25, 50, 75] as top (top)}
							<div
								class="bg-border absolute right-0 left-0 h-px transition-opacity duration-700"
								style="top: {top}%; opacity: {gridIn ? 1 : 0};"
							></div>
						{/each}

						<div class="absolute inset-0 flex items-end gap-[3px] px-px">
							{#each heights as h, i (i)}
								<button
									type="button"
									tabindex="-1"
									aria-hidden="true"
									class="bar flex h-full flex-1 cursor-default flex-col-reverse justify-start"
									class:is-hot={hotIdx >= 0 && Math.abs(i - hotIdx) < 2}
									class:is-hover={hoverIdx === i}
									onmouseenter={(e) => {
										hoverIdx = i;
										const el = e.currentTarget;
										guideX = el.offsetLeft + el.offsetWidth / 2;
									}}
									onmouseleave={() => (hoverIdx = -1)}
								>
									<span
										class="bg-muted-foreground/70 seg block w-full"
										style="height: {(h * 100 * 0.58).toFixed(1)}%; transition-delay: {250 +
											i * 28}ms, 0ms;"
										class:is-in={barsIn}
									></span>
									<span
										class="bg-primary seg block w-full"
										style="height: {(h * 100 * 0.27).toFixed(1)}%; transition-delay: {310 +
											i * 28}ms, 0ms;"
										class:is-in={barsIn}
									></span>
									<span
										class="bg-chart-4 seg block w-full rounded-t-[1.5px]"
										style="height: {(h * 100 * 0.15).toFixed(1)}%; transition-delay: {370 +
											i * 28}ms, 0ms;"
										class:is-in={barsIn}
									></span>
								</button>
							{/each}
						</div>

						{#if scanAt >= 0}
							<div
								class="pointer-events-none absolute top-[-6px] bottom-[-1px] w-[1.5px]"
								style="left: {(scanAt * 100).toFixed(
									2
								)}%; background: linear-gradient(180deg, transparent, var(--primary), transparent);"
							></div>
						{/if}

						{#if hoverIdx >= 0}
							<div
								class="bg-primary/35 pointer-events-none absolute top-0 bottom-0 w-px"
								style="left: {guideX}px;"
							></div>
							<div
								class="border-primary/25 bg-muted pointer-events-none absolute z-5 -translate-x-1/2 rounded-lg border px-3 py-2 text-[10.5px] leading-[1.6] whitespace-nowrap shadow-xl"
								style="left: {Math.min(
									Math.max(guideX, 70),
									Math.max(70, (plotEl?.clientWidth ?? 0) - 70)
								)}px; bottom: calc({Math.min(heights[hoverIdx] * 100, 52).toFixed(1)}% + 10px);"
							>
								<b class="text-primary font-semibold">{tip(hoverIdx).months} months searched</b><br
								/>
								{tip(hoverIdx).events}B events · {tip(hoverIdx).secs} sec
							</div>
						{/if}
					</div>

					<div class=" flex justify-between px-0.5 pt-2 pb-1 text-[10px]">
						{#each [2016, 2018, 2020, 2022, 2024, 2026] as year (year)}<span>{year}</span>{/each}
					</div>
				</div>

				<!-- Top talkers -->
				<div class="px-[18px] pt-1.5 pb-4">
					<div
						class=" border-border flex justify-between border-b py-2.5 text-[10px] font-bold tracking-[0.1em] uppercase"
					>
						<span>Source IP</span><span>Count</span>
					</div>
					{#each rows as row, i (row.ip)}
						<div
							class="border-border/60 flex items-center justify-between border-b py-2.5 text-[13px]"
						>
							<span class="flex items-center gap-2.5 text-[12.5px] font-semibold">
								<span class="bg-primary h-1.5 w-1.5 rounded-full shadow-[0_0_7px_var(--primary)]"
								></span>
								{row.ip}
							</span>
							<span class=" text-[12.5px]">{fmt(rowCounts[i], 0, true)}</span>
						</div>
					{/each}
					<div class=" pt-2.5 text-[13px]">…</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Bars grow from the baseline as the result set lands. */
	.seg {
		transform: scaleY(0);
		transform-origin: bottom;
		transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.2, 1);
	}
	.seg.is-in {
		transform: scaleY(1);
	}

	.bar .seg {
		filter: brightness(1);
		transition:
			transform 0.7s cubic-bezier(0.22, 0.61, 0.2, 1),
			filter 0.25s ease;
	}
	.bar.is-hover .seg,
	.bar.is-hot .seg {
		filter: brightness(1.35);
	}
	/* Everything off the hovered column recedes. */
	.is-focus .bar:not(.is-hover):not(.is-hot) .seg {
		filter: brightness(0.55);
	}

	/* Keywords glow while a query is running. */
	.kw {
		transition: text-shadow 0.4s ease;
	}
	.kw.is-hot {
		text-shadow: 0 0 12px color-mix(in oklab, var(--primary) 80%, transparent);
	}

	.is-flash {
		border-color: color-mix(in oklab, var(--primary) 65%, transparent);
		box-shadow: 0 0 18px color-mix(in oklab, var(--primary) 22%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.seg,
		.bar .seg {
			transform: scaleY(1);
			transition-duration: 0.01ms;
			transition-delay: 0ms !important;
		}
		.kw {
			transition-duration: 0.01ms;
		}
	}
</style>
