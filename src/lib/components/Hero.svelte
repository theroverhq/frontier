<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	const waveText = 'Cold Storage. Hot Intelligence.';

	const sources = ['Cloud', 'Identity', 'Endpoint', 'Network', 'SaaS', 'Logs'];

	const outputs = [
		{ label: 'Instant Search', color: 'var(--chart-1)', spaced: false },
		{ label: 'Live Analytics', color: 'var(--chart-3)', spaced: false },
		{ label: 'Continuous Detections', color: 'var(--destructive)', spaced: true },
		{ label: 'SIEM', color: 'var(--chart-2)', spaced: false },
		{ label: 'AI SOC', color: 'var(--chart-4)', spaced: false }
	];

	const features = [
		'Object-storage economics',
		'Full-fidelity retention',
		'Serverless compute',
		'No search clusters'
	];

	/* Cylinder rows: five recent years, an elided span, then the oldest two. */
	const cylRows = [
		{ y: 132, year: 2026 },
		{ y: 160, year: 2025 },
		{ y: 188, year: 2024 },
		{ y: 216, year: 2023 },
		{ y: 244, year: 2022 },
		{ y: 286, year: 2017 },
		{ y: 314, year: 2016 }
	];

	let heroEl: HTMLElement | undefined = $state();
	let diagramEl: HTMLDivElement | undefined = $state();
	let connSvg: SVGSVGElement | undefined = $state();
	let cylEl: HTMLDivElement | undefined = $state();
	let sqcEl: HTMLDivElement | undefined = $state();
	let spEl: HTMLDivElement | undefined = $state();

	/* Animation state, driven imperatively but rendered declaratively. */
	let srcLit = $state(sources.map(() => false));
	let outLit = $state(outputs.map(() => false));
	let rowLit = $state(cylRows.map(() => false));
	let cylLit = $state(false);
	let focused = $state(false);

	const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	const LINE = 'var(--border)';
	const LINE_LIT = 'color-mix(in oklab, var(--primary) 55%, transparent)';

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const touch = matchMedia('(hover: none)').matches;
		const tablet = matchMedia('(max-width: 1024px)').matches;
		const stops = [initDiagram(reduced, touch, tablet)];
		return () => stops.forEach((stop) => stop());
	});

	/* ------------------------------------------------------------------
	   Architecture diagram — connectors measured from the live layout,
	   with particles travelling source → cold storage → output.
	   ------------------------------------------------------------------ */
	function initDiagram(reduced: boolean, touch: boolean, tablet: boolean) {
		const dia = diagramEl;
		const svg = connSvg;
		const cyl = cylEl;
		const sqc = sqcEl;
		const sp = spEl;
		if (!dia || !svg || !cyl || !sqc || !sp) return () => {};

		const NS = 'http://www.w3.org/2000/svg';
		const cylSvg = cyl.querySelector('svg');
		const srcs = Array.from(dia.querySelectorAll<HTMLElement>('.hd-src'));
		const outs = Array.from(dia.querySelectorAll<HTMLElement>('.hd-out'));
		if (!cylSvg || !srcs.length || !outs.length) return () => {};

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

		let leftPaths: SVGPathElement[] = [];
		let rightPaths: SVGPathElement[] = [];
		let visConns: SVGPathElement[] = [];
		let rightConns: SVGPathElement[] = [];

		const rel = (el: Element) => {
			const base = dia.getBoundingClientRect();
			const r = el.getBoundingClientRect();
			return {
				x: r.left - base.left,
				y: r.top - base.top,
				w: r.width,
				h: r.height,
				cx: r.left - base.left + r.width / 2,
				cy: r.top - base.top + r.height / 2,
				left: r.left - base.left,
				right: r.right - base.left,
				top: r.top - base.top,
				bottom: r.bottom - base.top
			};
		};

		const mkPath = (points: number[][], visible: boolean) => {
			const p = document.createElementNS(NS, 'path');
			p.setAttribute(
				'd',
				points.map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ')
			);
			p.style.fill = 'none';
			if (visible) {
				p.style.stroke = LINE;
				p.style.strokeWidth = '1';
				p.style.transition = 'stroke .35s ease, opacity .35s ease';
			} else {
				p.style.stroke = 'none';
			}
			svg.appendChild(p);
			return p;
		};

		const spawn = (pathEl: SVGPathElement, opts: { dur?: number; size?: number } = {}) =>
			new Promise<void>((resolve) => {
				if (reduced || dead) {
					resolve();
					return;
				}
				const dur = opts.dur ?? 900;
				const size = opts.size ?? 2.2;
				const len = pathEl.getTotalLength();
				const dot = document.createElementNS(NS, 'circle');
				dot.setAttribute('r', String(size));
				dot.style.fill = 'var(--primary)';
				const trail = document.createElementNS(NS, 'circle');
				trail.setAttribute('r', String(size * 1.9));
				trail.style.fill = 'var(--primary)';
				trail.style.opacity = '0.16';
				svg.appendChild(trail);
				svg.appendChild(dot);
				const t0 = performance.now();
				const step = (now: number) => {
					const t = Math.max(0, (now - t0) / dur);
					if (t >= 1 || dead || !pathEl.isConnected) {
						dot.remove();
						trail.remove();
						resolve();
						return;
					}
					const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
					const pt = pathEl.getPointAtLength(e * len);
					const tp = pathEl.getPointAtLength(Math.max(0, e * len - 7));
					dot.setAttribute('cx', String(pt.x));
					dot.setAttribute('cy', String(pt.y));
					trail.setAttribute('cx', String(tp.x));
					trail.setAttribute('cy', String(tp.y));
					const fade = t < 0.12 ? t / 0.12 : t > 0.88 ? (1 - t) / 0.12 : 1;
					dot.style.opacity = (0.95 * fade).toFixed(2);
					requestAnimationFrame(step);
				};
				requestAnimationFrame(step);
			});

		const layout = () => {
			svg.innerHTML = '';
			leftPaths = [];
			rightPaths = [];
			visConns = [];
			rightConns = [];
			if (matchMedia('(max-width: 639px)').matches) {
				sqc.style.display = 'none';
				sp.style.display = 'none';
				return;
			}
			sqc.style.display = '';
			sp.style.display = '';

			/* Cylinder body sits at x 15..235 of a 250x400 viewBox. */
			const cylR = rel(cylSvg);
			const sx = cylR.w / 250;
			const sy = cylR.h / 460;
			const cylLeft = cylR.x + 15 * sx;
			const cylRight = cylR.x + 235 * sx;
			const cylMidY = cylR.y + 210 * sy;

			const srcRs = srcs.map(rel);
			const busX = (srcRs[0].right + cylLeft) / 2;
			srcRs.forEach((r) =>
				visConns.push(
					mkPath(
						[
							[r.right, r.cy],
							[busX, r.cy]
						],
						true
					)
				)
			);
			visConns.push(
				mkPath(
					[
						[busX, srcRs[0].cy],
						[busX, srcRs[srcRs.length - 1].cy]
					],
					true
				)
			);
			visConns.push(
				mkPath(
					[
						[busX, cylMidY],
						[cylLeft, cylMidY]
					],
					true
				)
			);
			srcRs.forEach((r) =>
				leftPaths.push(
					mkPath(
						[
							[r.right, r.cy],
							[busX, r.cy],
							[busX, cylMidY],
							[cylLeft, cylMidY]
						],
						false
					)
				)
			);

			const outRs = outs.map(rel);
			const bus2X = (cylRight + outRs[0].left) / 2;
			outRs.forEach((r) => {
				const pts = [
					[cylRight, cylMidY],
					[bus2X, cylMidY],
					[bus2X, r.cy],
					[r.left, r.cy]
				];
				const c = mkPath(pts, true);
				c.style.opacity = '0';
				rightConns.push(c);
				rightPaths.push(mkPath(pts, false));
			});

			sqc.style.left = `${bus2X}px`;
			sqc.style.top = `${outRs[0].cy - 12}px`;
			sp.style.left = `${bus2X}px`;
			sp.style.top = `${(outRs[3] ? outRs[3].cy : cylMidY) - 14}px`;
		};

		const setConns = (lit: boolean) => {
			visConns.forEach((c) => (c.style.stroke = lit ? LINE_LIT : LINE));
		};
		const flashConn = (el: SVGPathElement | undefined, dur = 600) => {
			if (!el) return;
			el.style.opacity = '0.5';
			later(() => (el.style.opacity = '0'), dur);
		};

		const pulseRow = (i: number) => {
			const k = ((i % rowLit.length) + rowLit.length) % rowLit.length;
			rowLit[k] = true;
			later(() => (rowLit[k] = false), 700);
		};

		let cylTimer: ReturnType<typeof setTimeout> | undefined;
		const litCyl = (ms: number) => {
			cylLit = true;
			if (cylTimer) clearTimeout(cylTimer);
			cylTimer = later(() => (cylLit = false), ms);
		};

		const ingest = (i: number, opts?: { dur?: number }) => {
			const p = leftPaths[i];
			if (!p) return Promise.resolve();
			srcLit[i] = true;
			later(() => (srcLit[i] = false), 500);
			return spawn(p, { dur: 1050, size: 2, ...opts }).then(() => {
				litCyl(900);
				pulseRow(Math.floor(Math.random() * rowLit.length));
			});
		};

		const query = (outIndex?: number, bright = false) => {
			const i = outIndex ?? Math.floor(Math.random() * outs.length);
			const p = rightPaths[i];
			if (!p) return Promise.resolve();
			flashConn(rightConns[i], 700);
			return spawn(p, { dur: 850, size: bright ? 2.6 : 2 }).then(() => {
				outLit[i] = true;
				later(() => (outLit[i] = false), 620);
			});
		};

		let started = false;
		const startIdle = () => {
			if (reduced) return;
			let n = 0;
			const loop = () => {
				later(
					() => {
						n++;
						const roll = Math.random();
						if (document.hidden) {
							/* skip a beat while hidden */
						} else if (roll < 0.55) {
							ingest(Math.floor(Math.random() * srcs.length));
						} else if (roll < 0.85) {
							query();
						} else {
							litCyl(900);
							pulseRow(n);
						}
						loop();
					},
					2400 + Math.random() * 2600
				);
			};
			loop();
		};

		const intro = () => {
			if (started) return;
			started = true;
			if (reduced) return;
			const order = [2, 0, 4, 1, 5, 3];
			order.forEach((i, k) => later(() => ingest(i), 1100 + k * 260));
			later(() => {
				cylLit = true;
				rowLit.forEach((_, i) =>
					later(() => {
						rowLit[i] = true;
						later(() => (rowLit[i] = false), 800);
					}, i * 150)
				);
				later(() => (cylLit = false), 2100);
			}, 2600);
			later(() => {
				query(0, true);
				[1, 2, 3, 4].forEach((i, k) => later(() => query(i), 380 + k * 300));
			}, 4200);
			later(startIdle, 6400);
		};

		layout();
		const onResize = () => layout();
		addEventListener('resize', onResize);

		let io: IntersectionObserver | undefined;
		if ('IntersectionObserver' in window) {
			io = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						intro();
						io?.disconnect();
					}
				},
				{ threshold: 0.35 }
			);
			io.observe(dia);
		} else {
			intro();
		}

		const listeners: Array<[HTMLElement, string, EventListener]> = [];
		const on = (el: HTMLElement, type: string, fn: EventListener) => {
			el.addEventListener(type, fn);
			listeners.push([el, type, fn]);
		};

		if (!touch && !reduced) {
			srcs.forEach((s, i) => {
				on(s, 'mouseenter', () => {
					focused = true;
					srcLit[i] = true;
					cylLit = true;
					setConns(true);
					outs.forEach((_, k) => (outLit[k] = true));
					rightConns.forEach((c) => (c.style.opacity = '0.4'));
					ingest(i, { dur: 800 });
				});
				on(s, 'mouseleave', () => {
					focused = false;
					srcLit[i] = false;
					cylLit = false;
					setConns(false);
					outs.forEach((_, k) => (outLit[k] = false));
					rightConns.forEach((c) => (c.style.opacity = '0'));
				});
			});
			outs.forEach((o, i) => {
				on(o, 'mouseenter', () => {
					focused = true;
					outLit[i] = true;
					cylLit = true;
					srcs.forEach((_, k) => (srcLit[k] = true));
					setConns(true);
					flashConn(rightConns[i], 1200);
					query(i, i === 0);
				});
				on(o, 'mouseleave', () => {
					focused = false;
					outLit[i] = false;
					cylLit = false;
					srcs.forEach((_, k) => (srcLit[k] = false));
					setConns(false);
				});
			});

			/* A few pixels of parallax, never more. */
			if (!tablet && heroEl) {
				const hero = heroEl;
				let px = 0;
				let py = 0;
				let tx = 0;
				let ty = 0;
				let raf: number | null = null;
				const tick = () => {
					px = lerp(px, tx, 0.07);
					py = lerp(py, ty, 0.07);
					dia.style.translate = `${px.toFixed(2)}px ${py.toFixed(2)}px`;
					raf =
						Math.abs(px - tx) > 0.05 || Math.abs(py - ty) > 0.05
							? requestAnimationFrame(tick)
							: null;
				};
				on(hero, 'pointermove', ((e: PointerEvent) => {
					const r = dia.getBoundingClientRect();
					tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 6, -3, 3);
					ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 6, -3, 3);
					if (raf === null) raf = requestAnimationFrame(tick);
				}) as EventListener);
				on(hero, 'pointerleave', () => {
					tx = 0;
					ty = 0;
					if (raf === null) raf = requestAnimationFrame(tick);
				});
			}
		}

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			io?.disconnect();
			removeEventListener('resize', onResize);
			listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
		};
	}
</script>

<header
	bind:this={heroEl}
	id="siem"
	class="dark bg-background text-foreground relative overflow-hidden pt-20 pb-24"
>
	<!-- Ambient lime wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(70% 40% at 68% 25%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 62%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div
			class="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,462px)_minmax(0,1fr)] lg:gap-[46px]"
		>
			<div>
				<Badge variant="secondary" class="gap-1.5 px-3 py-1 font-sans">
					<span class="bg-primary inline-block h-2 w-2 animate-pulse rounded-full"></span>
					SIEM <span class=" opacity-50">•</span>
					Search <span class=" opacity-50">•</span>
					Analytics <span class=" opacity-50">•</span>
					AI SOC
				</Badge>

				<h1
					class="text-foreground mt-6 text-[clamp(2.125rem,4.4vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.028em]"
				>
					<span class="block whitespace-nowrap">The SIEM built for</span>
					<span class="block whitespace-nowrap">infinite retention.</span>
				</h1>

				<p
					class="gradient-text mt-[18px] text-[clamp(1.25rem,2vw,1.5625rem)] font-medium tracking-[-0.012em]"
				>
					{waveText}
				</p>

				<p class=" mt-5 max-w-[470px] text-base leading-[1.72]">
					Rover keeps every security event in low-cost object storage and makes years of data
					searchable in seconds. Run detections and analytics across everything you retain, and give
					analysts and AI agents years of context for every investigation—without search clusters.
				</p>

				<div class="mt-8">
					<Button size="lg" href="#early-access" class="rounded-full uppercase">Book a Demo</Button>
				</div>

				<div class="mt-11 grid grid-cols-1 gap-x-11 gap-y-3 sm:grid-cols-2">
					{#each features as feature (feature)}
						<span class="text-foreground/80 flex items-center gap-2.5 text-[13.5px] font-medium">
							<span class="bg-muted-foreground h-[5px] w-[5px] shrink-0 rounded-full"></span>
							{feature}
						</span>
					{/each}
				</div>
			</div>

			<!-- Right: cold storage → hot intelligence -->
			<div
				bind:this={diagramEl}
				id="hero-preview"
				class="hd-diagram border-border bg-card relative min-h-0 overflow-visible rounded-2xl border px-[30px] pt-12 pb-10 shadow-2xl sm:min-h-[460px]"
				class:is-focus={focused}
				aria-label="Rover architecture: all security data into cold storage, hot intelligence out"
			>
				<svg
					bind:this={connSvg}
					class="pointer-events-none absolute inset-0 z-1 overflow-visible max-sm:hidden"
					aria-hidden="true"
				></svg>

				<div
					class="relative z-2 grid grid-cols-1 items-start gap-x-[18px] gap-y-8 sm:grid-cols-[110px_minmax(0,1fr)_190px] sm:gap-y-0"
				>
					<!-- Sources -->
					<div class="flex flex-col">
						<div
							class="mb-3.5 text-center text-[10.5px] font-bold tracking-[0.11em] whitespace-nowrap uppercase"
						>
							All Security Data
						</div>
						<div class="flex flex-wrap gap-2 sm:block sm:gap-0">
							{#each sources as source, i (source)}
								<div
									class="hd-src border-border bg-background/50 mb-0 flex-1 basis-[40%] rounded-[11px] border px-2 py-2.5 text-center text-[13px] font-medium sm:mb-3 sm:basis-auto"
									class:is-lit={srcLit[i]}
								>
									{source}
								</div>
							{/each}
						</div>
						<div class=" mt-1.5 text-center text-xs italic">Keep everything</div>
					</div>

					<!-- Cold storage -->
					<div class="flex flex-col items-center">
						<div
							bind:this={cylEl}
							class="hd-cyl relative mx-auto w-full max-w-[220px]"
							class:is-lit={cylLit}
						>
							<svg viewBox="0 0 250 460" class="h-auto w-full overflow-visible" aria-hidden="true">
								<defs>
									<radialGradient id="heroCylGlow" cx="50%" cy="45%" r="60%">
										<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.07" />
										<stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
									</radialGradient>
								</defs>
								<path class="fill-background" d="M15 30 v400 a110 26 0 0 0 220 0 v-400 Z" />
								<rect
									class="cyl-glow"
									x="15"
									y="30"
									width="220"
									height="426"
									fill="url(#heroCylGlow)"
								/>
								<ellipse class="cyl-stroke fill-card" cx="125" cy="30" rx="110" ry="26" />
								<path class="cyl-stroke" fill="none" d="M15 30 v400 a110 26 0 0 0 220 0 v-400" />
								<ellipse
									class="cyl-stroke"
									cx="125"
									cy="430"
									rx="110"
									ry="26"
									fill="none"
									opacity="0.7"
								/>
								<text
									class="fill-foreground text-[13px] font-bold tracking-[0.11em]"
									x="125"
									y="34"
									text-anchor="middle">COLD STORAGE</text
								>
								<text class="fill-primary text-[27px] font-bold" x="125" y="98" text-anchor="middle"
									>Rover</text
								>
								{#each cylRows as row, i (row.year)}
									<g class="cyl-row" class:is-lit={rowLit[i]}>
										<text class="cyl-year text-[16px] font-medium" x="42" y={row.y + 4}
											>{row.year}</text
										>
										<line class="cyl-dash" x1="72" y1={row.y} x2="212" y2={row.y} />
									</g>
								{/each}
								<text
									class="fill-foreground text-[16px] font-medium"
									x="125"
									y="360"
									text-anchor="middle">Full-fidelity data</text
								>
								<text
									class="fill-foreground text-[16px] font-medium"
									x="125"
									y="380"
									text-anchor="middle">+ Rover Index</text
								>
								<text
									class="fill-muted-foreground text-[15px]"
									x="125"
									y="430"
									text-anchor="middle"
									dominant-baseline="middle">Object Storage</text
								>
							</svg>
						</div>
					</div>

					<!-- Outputs -->
					<div class="flex flex-col">
						<div class="mb-1 text-center text-[10.5px] font-bold tracking-[0.11em] uppercase">
							Hot Intelligence
						</div>
						<div class=" mb-3.5 text-center text-[11.5px] leading-normal italic">
							Years of context.<br />Answers in seconds.
						</div>
						{#each outputs as output, i (output.label)}
							{#if output.spaced}
								<div class="h-0 sm:h-[34px]" aria-hidden="true"></div>
							{/if}
							<div
								class="hd-out border-border bg-background/50 mb-[11px] flex items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-xs font-medium whitespace-nowrap"
								class:is-lit={outLit[i]}
								style="color: {output.color};"
							>
								<i
									class="h-[7px] w-[7px] shrink-0 rounded-full"
									style="background: currentColor; box-shadow: 0 0 9px currentColor;"
								></i>
								{output.label}
							</div>
						{/each}
					</div>
				</div>

				<!-- Floating mid-column labels, positioned against the measured bus -->
				<div
					bind:this={sqcEl}
					class="text-foreground absolute z-2 -translate-x-1/2 text-center text-[9.5px] leading-[1.75] font-bold tracking-[0.08em] uppercase max-sm:hidden"
					aria-hidden="true"
				>
					Serverless<br />Query<br />Compute
					<small
						class=" mt-2.5 block text-[9px] font-normal tracking-normal whitespace-nowrap normal-case"
					>
						No search clusters.
					</small>
				</div>
				<div
					bind:this={spEl}
					class="text-foreground absolute z-2 -translate-x-1/2 text-center text-[9.5px] leading-[1.75] font-bold tracking-[0.08em] uppercase max-sm:hidden"
					aria-hidden="true"
				>
					Security<br />Platform
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	/* Subheading — the fill itself sweeps between the theme's ink and brand
	   tokens; the glyphs never move. */
	.gradient-text {
		background-image: linear-gradient(
			100deg,
			var(--foreground) 10%,
			var(--primary) 70%,
			var(--foreground) 10%
		);
		background-size: 220% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		animation: gradient-sweep 5s ease-in-out infinite;
	}
	@keyframes gradient-sweep {
		0% {
			background-position: 120% 0;
		}
		100% {
			background-position: -20% 0;
		}
	}

	/* Source and output chips ------------------------------------------- */
	.hd-src,
	.hd-out {
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease,
			opacity 0.35s ease;
	}
	.hd-src:hover,
	.hd-src.is-lit {
		border-color: color-mix(in oklab, var(--primary) 50%, transparent);
		box-shadow: 0 0 16px color-mix(in oklab, var(--primary) 12%, transparent);
	}
	.hd-out.is-lit {
		border-color: currentColor;
		box-shadow: 0 0 16px -3px currentColor;
	}

	/* Hover focus dims everything off the highlighted path --------------- */
	.hd-diagram.is-focus .hd-src:not(.is-lit),
	.hd-diagram.is-focus .hd-out:not(.is-lit) {
		opacity: 0.32;
	}

	/* Cylinder ----------------------------------------------------------- */
	.cyl-stroke {
		stroke: color-mix(in oklab, var(--muted-foreground) 55%, transparent);
		stroke-width: 1.2;
		transition: stroke 0.4s ease;
	}
	.hd-cyl.is-lit .cyl-stroke {
		stroke: color-mix(in oklab, var(--primary) 55%, transparent);
	}
	.cyl-glow {
		opacity: 0;
		transition: opacity 0.8s ease;
	}
	.hd-cyl.is-lit .cyl-glow {
		opacity: 1;
	}
	.cyl-dash {
		stroke: color-mix(in oklab, var(--muted-foreground) 45%, transparent);
		stroke-width: 1;
		stroke-dasharray: 5 6;
		transition: stroke 0.3s ease;
	}
	.cyl-year {
		fill: var(--muted-foreground);
		transition: fill 0.3s ease;
	}
	.cyl-row.is-lit .cyl-dash {
		stroke: color-mix(in oklab, var(--primary) 75%, transparent);
	}
	.cyl-row.is-lit .cyl-year {
		fill: var(--foreground);
	}

	@media (prefers-reduced-motion: reduce) {
		.hd-src,
		.hd-out,
		.cyl-stroke,
		.cyl-glow,
		.cyl-dash,
		.cyl-year {
			transition-duration: 0.01ms;
		}
		.gradient-text {
			animation: none;
			background-position: 50% 0;
		}
	}
</style>
