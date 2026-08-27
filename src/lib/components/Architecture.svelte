<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	const ingestBoxes = [
		{ title: 'HTTP Pull', body: 'Rover retrieves telemetry', chip: '' },
		{ title: 'HTTP Push', body: 'Sources stream or batch telemetry to Rover', chip: '' },
		{
			title: 'S3 Drop',
			body: 'Data already lands in customer object storage',
			chip: 'No Pipeline Change'
		}
	];

	const branchLabels = [
		{ x: 17, label: 'Persist Data', note: 'when required' },
		{ x: 50, label: 'Write Index In Place', note: '' },
		{ x: 83, label: 'Update Signal Mesh', note: '' }
	];

	const securityData = ['Cloud Logs', 'DNS', 'VPC Flow', 'EDR', 'Audit Logs'];

	/* An LSM tree compacts many small segments down into fewer large ones. */
	const lsmLevels = [
		{ level: 'L0', segs: [26, 26, 26] },
		{ level: 'L1', segs: [56, 44] },
		{ level: 'L2', segs: [104] }
	];

	const itqCards = [
		{
			cat: 'Stored In Customer Object Storage',
			title: 'Rover Index',
			checks: [
				'Historical search + analytics',
				'Object-storage-native inverted index',
				'Posting-list + numerical-range pruning',
				'Read by ephemeral query workers',
				'No persistent search-node ownership'
			],
			foot: 'Years of data. Read when queried.'
		},
		{
			cat: 'Continuous Detection State',
			title: 'Signal Mesh',
			checks: [
				'Continuous detections',
				'Detection-query state machine',
				'Stateful evaluation as data arrives',
				'Produces signals and alerts'
			],
			foot: 'Continuous state. Evaluated as data arrives.'
		},
		{
			cat: 'Ephemeral · Per Query',
			title: 'Serverless Query Engine',
			checks: [
				'Search + analytics execution',
				'Fans out across serverless workers',
				'Reads only relevant index + data regions',
				'Parallel partial results',
				'Merges results and disappears'
			],
			foot: 'Compute on demand. No search cluster.'
		}
	];

	/* Lime reads poorly as text on a light surface, so darken it toward ink. */
	const LIME_INK = 'color-mix(in oklab, var(--primary) 55%, var(--foreground))';
	const LIME_DIM = 'color-mix(in oklab, var(--primary) 72%, var(--foreground))';

	let panelEl: HTMLDivElement | undefined = $state();
	let overlay: SVGSVGElement | undefined = $state();
	let readerEl: HTMLDivElement | undefined = $state();
	let branchEl: HTMLDivElement | undefined = $state();
	let meshEl: HTMLDivElement | undefined = $state();
	let alertEl: HTMLDivElement | undefined = $state();
	let plannerEl: HTMLDivElement | undefined = $state();
	let cosEl: HTMLDivElement | undefined = $state();
	let mergeEl: HTMLDivElement | undefined = $state();
	let rspEl: HTMLDivElement | undefined = $state();

	let ingestLit = $state([false, false, false]);
	let readerLit = $state(false);
	let oswrapLit = $state(false);
	let lsmIn = $state(false);
	let meshLit = $state(false);
	let alertLit = $state(false);
	let plannerLit = $state(false);
	let cosLit = $state(false);
	let mergeLit = $state(false);
	let rspLit = $state(false);
	let lamOn = $state([false, false, false, false, false]);

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			lsmIn = true;
			return;
		}
		if (!panelEl || !overlay) return;

		const panel = panelEl;
		const svg = overlay;
		const NS = 'http://www.w3.org/2000/svg';

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

		const rel = (el: Element) => {
			const b = panel.getBoundingClientRect();
			const r = el.getBoundingClientRect();
			return {
				cx: r.left - b.left + r.width / 2,
				cy: r.top - b.top + r.height / 2,
				top: r.top - b.top,
				bottom: r.bottom - b.top,
				left: r.left - b.left,
				right: r.right - b.left,
				w: r.width,
				h: r.height
			};
		};

		/* A dot travelling a path, used to show data moving between stages. */
		const trace = (
			points: number[][],
			opts: { dur?: number; size?: number; color?: string } = {}
		) =>
			new Promise<void>((resolve) => {
				if (dead) {
					resolve();
					return;
				}
				const path = document.createElementNS(NS, 'path');
				path.setAttribute(
					'd',
					points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
				);
				path.style.fill = 'none';
				path.style.stroke = 'none';
				svg.appendChild(path);

				const dur = opts.dur ?? 900;
				const len = path.getTotalLength();
				const dot = document.createElementNS(NS, 'circle');
				dot.setAttribute('r', String(opts.size ?? 2.1));
				dot.style.fill = opts.color ?? 'var(--primary)';
				svg.appendChild(dot);

				const t0 = performance.now();
				const step = (now: number) => {
					const t = Math.max(0, (now - t0) / dur);
					if (t >= 1 || dead) {
						dot.remove();
						path.remove();
						resolve();
						return;
					}
					const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
					const pt = path.getPointAtLength(e * len);
					dot.setAttribute('cx', String(pt.x));
					dot.setAttribute('cy', String(pt.y));
					const fade = t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1;
					dot.style.opacity = (0.95 * fade).toFixed(2);
					requestAnimationFrame(step);
				};
				requestAnimationFrame(step);
			});

		/* 01 — sources feed the reader, which fans out three ways. */
		const runIngest = () => {
			const boxes = Array.from(panel.querySelectorAll<HTMLElement>('[data-ingest]'));
			boxes.forEach((box, i) =>
				later(() => {
					ingestLit[i] = true;
					later(() => (ingestLit[i] = false), 900);
					if (!readerEl) return;
					const b = rel(box);
					const r = rel(readerEl);
					trace(
						[
							[b.cx, b.bottom],
							[b.cx, b.bottom + 14],
							[r.cx, r.top - 12],
							[r.cx, r.top]
						],
						{ dur: 950 }
					).then(() => {
						readerLit = true;
						later(() => (readerLit = false), 800);
					});
				}, i * 350)
			);

			later(() => {
				if (!branchEl) return;
				const wrap = rel(branchEl);
				branchLabels.forEach((br, i) =>
					later(() => {
						const x = wrap.left + (br.x / 100) * wrap.w;
						const midX = wrap.left + wrap.w / 2;
						trace(
							[
								[midX, wrap.top],
								[midX, wrap.top + wrap.h * 0.38],
								[x, wrap.top + wrap.h * 0.38],
								[x, wrap.bottom - 34]
							],
							{ dur: 800, size: 1.8 }
						);
					}, i * 220)
				);
			}, 1500);
		};

		/* 03 — a rule enters the mesh, a signal leaves it. */
		const runMesh = () => {
			if (!meshEl || !alertEl) return;
			meshLit = true;
			const m = rel(meshEl);
			trace(
				[
					[m.cx, m.top - 44],
					[m.cx, m.top]
				],
				{ dur: 600 }
			).then(() => {
				if (!alertEl) return;
				const a = rel(alertEl);
				trace(
					[
						[m.cx, m.bottom],
						[m.cx, a.top]
					],
					{ dur: 600, color: 'var(--destructive)' }
				).then(() => {
					alertLit = true;
					later(() => (alertLit = false), 1200);
				});
				later(() => (meshLit = false), 1400);
			});
		};

		/* 04 — plan, fan out to ephemeral workers, merge, deliver. */
		let engineBusy = false;
		const runEngine = () => {
			if (engineBusy || dead || !plannerEl || !cosEl || !mergeEl || !rspEl) return;
			engineBusy = true;
			plannerLit = true;
			const p = rel(plannerEl);
			const c = rel(cosEl);
			trace(
				[
					[p.right, p.cy],
					[c.left, c.cy]
				],
				{ dur: 750, size: 2.4 }
			).then(() => {
				cosLit = true;
				later(() => (plannerLit = false), 500);
				lamOn.forEach((_, i) => later(() => (lamOn[i] = true), 160 + i * 130));
				later(() => {
					cosLit = false;
					mergeLit = true;
					later(() => {
						lamOn.forEach((_, i) => later(() => (lamOn[i] = false), i * 90));
						mergeLit = false;
						if (!mergeEl || !rspEl) {
							engineBusy = false;
							return;
						}
						const m = rel(mergeEl);
						const r = rel(rspEl);
						trace(
							[
								[m.cx, m.bottom],
								[m.cx, m.bottom + 20],
								[r.cx, r.top - 16],
								[r.cx, r.top]
							],
							{ dur: 850, size: 2.4 }
						).then(() => {
							rspLit = true;
							later(() => (rspLit = false), 1300);
							engineBusy = false;
						});
					}, 1100);
				}, 1000);
			});
		};

		const observers: IntersectionObserver[] = [];
		const once = (el: Element | null, cb: () => void) => {
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
				{ threshold: 0.45, rootMargin: '0px 0px -6% 0px' }
			);
			io.observe(el);
			observers.push(io);
		};

		once(panel.querySelector('[data-stage="ingest"]'), runIngest);
		once(panel.querySelector('[data-stage="index"]'), () => {
			oswrapLit = true;
			lsmIn = true;
			later(() => (oswrapLit = false), 1800);
		});
		once(panel.querySelector('[data-stage="mesh"]'), runMesh);
		once(panel.querySelector('[data-stage="engine"]'), runEngine);

		/* Queries keep arriving while the diagram is on screen. */
		const idle = setInterval(() => {
			const r = panel.getBoundingClientRect();
			if (r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5 && !document.hidden)
				runEngine();
		}, 12000);

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			clearInterval(idle);
			observers.forEach((io) => io.disconnect());
		};
	});
</script>

<section id="architecture" class="bg-muted text-foreground relative overflow-hidden pt-24 pb-28">
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<!-- ============ Architecture ============ -->
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				Architecture
			</Badge>
			<div class="mt-4 text-[11px] font-bold tracking-[0.12em] uppercase">
				Persistent data. Stateful detections. Ephemeral queries.
			</div>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				Search is bursty. Detection is continuous.<br />Rover is built for both.
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Rover accepts security telemetry through HTTP pull, HTTP push, or direct S3 drop. It writes
				the Rover Index beside the data in customer-owned Object Storage and updates Signal Mesh—a
				state machine designed for continuous detection queries.
			</p>
		</div>

		<div
			bind:this={panelEl}
			class="dark bg-background text-foreground relative mt-16 overflow-hidden rounded-3xl px-5 pt-11 pb-13 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)] md:px-11"
		>
			<svg
				bind:this={overlay}
				class="pointer-events-none absolute inset-0 z-5 h-full w-full overflow-visible"
				aria-hidden="true"
			></svg>

			<div class="mx-auto max-w-[1120px]">
				<!-- 01 · Ingest -->
				<div class="stage" data-stage="ingest">
					<span class="stage-tag bg-background">01 · Ingest</span>

					<div class="grid grid-cols-1 gap-[18px] md:grid-cols-3">
						{#each ingestBoxes as box, i (box.title)}
							<div class="abox relative" class:is-lit={ingestLit[i]} data-ingest>
								{#if box.chip}
									<span
										class="border-primary/40 bg-primary/10 text-primary absolute -top-2.5 right-3 rounded-[5px] border px-[7px] py-[3px] text-[9px] font-bold tracking-[0.09em] uppercase"
									>
										{box.chip}
									</span>
								{/if}
								<h4 class="text-[16.5px] font-semibold tracking-[-0.01em]">{box.title}</h4>
								<p class=" mt-[7px] text-[12.5px] leading-[1.55]">
									{box.body}
								</p>
							</div>
						{/each}
					</div>

					<div class="aconn">
						<span class="vline h-6"></span>
						<span class="alab">Read / Receive</span>
					</div>

					<div
						bind:this={readerEl}
						class="abox mx-auto max-w-[360px] px-[26px] py-6"
						class:is-lit={readerLit}
					>
						<h4 class="text-[16.5px] font-semibold tracking-[-0.01em]">Rover Reader + Indexer</h4>
						<div class="text-primary mt-2 text-[12.5px] font-semibold">Schema-on-read</div>
						<p class=" mt-2.5 text-[12.5px] leading-[1.55]">
							No upfront schema engineering
						</p>
						<p class=" mt-1 text-[12.5px] leading-[1.55]">
							Go live in hours, not weeks
						</p>
					</div>

					<div bind:this={branchEl} class="relative mt-2 h-[78px]">
						<svg
							class="absolute inset-0 h-full w-full overflow-visible"
							viewBox="0 0 100 78"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							{#each branchLabels as br (br.x)}
								<path
									d="M50 0 V29.6 H{br.x} V44"
									class="branch-line"
									vector-effect="non-scaling-stroke"
								/>
							{/each}
						</svg>
						{#each branchLabels as br (br.x)}
							<span
								class=" absolute bottom-0 -translate-x-1/2 text-center text-[9.5px] leading-[1.6] font-semibold tracking-[0.11em] uppercase"
								style="left: {br.x}%;"
							>
								{br.label}
								{#if br.note}
									<small
										class="/70 block text-[9px] font-normal tracking-[0.04em] normal-case"
										>{br.note}</small
									>
								{/if}
							</span>
						{/each}
					</div>
				</div>

				<!-- 02 · Index In Place -->
				<div class="stage" data-stage="index">
					<span class="stage-tag bg-background">02 · Index In Place</span>

					<div class="aconn mb-2.5"><span class="vline h-[22px]"></span></div>
					<h3 class="text-center text-[23px] font-semibold tracking-[-0.01em]">
						Index where the data lives.
					</h3>
					<p
						class=" mx-auto mt-3 max-w-[420px] text-center text-[13.5px] leading-[1.65]"
					>
						Rover writes its inverted indexes directly alongside security data in customer-owned
						object storage.
					</p>

					<div
						class=" mt-7 text-center text-[9.5px] font-semibold tracking-[0.13em] uppercase"
					>
						Customer-Owned Object Storage
					</div>

					<div
						class="border-border oswrap mx-auto mt-2.5 grid max-w-[480px] grid-cols-1 items-stretch gap-3.5 rounded-[14px] border p-5 sm:grid-cols-[1fr_auto_1fr]"
						class:is-lit={oswrapLit}
					>
						<div class="border-border bg-card rounded-[11px] border px-[18px] py-4">
							<div class="text-[10px] font-bold tracking-[0.11em] uppercase">Security Data</div>
							<ul class="mt-3">
								{#each securityData as item (item)}
									<li
										class=" flex items-center gap-2 py-[3.5px] text-[11.5px]"
									>
										<span class="bg-muted-foreground/60 h-[3px] w-[3px] shrink-0 rounded-full"
										></span>
										{item}
									</li>
								{/each}
							</ul>
						</div>

						<div class=" self-center text-center text-[19px]">+</div>

						<div class="border-border bg-card rounded-[11px] border px-[18px] py-4">
							<div class="text-[10px] font-bold tracking-[0.11em] uppercase">Rover Index</div>
							<div class="mt-3">
								{#each lsmLevels as lvl, li (lvl.level)}
									{#if li > 0}
										<div class="bg-muted-foreground/40 ml-11 h-2.5 w-px"></div>
									{/if}
									<div class="flex items-center gap-2.5 py-[5px]">
										<span class=" w-4 text-[10px]">{lvl.level}</span>
										{#each lvl.segs as w, si (si)}
											<span
												class="bg-primary h-2 origin-left rounded-[2px] transition-transform duration-500 ease-out"
												style="width: {w}px; opacity: {0.9 - si * 0.28}; transform: scaleX({lsmIn
													? 1
													: 0}); transition-delay: {(li * lvl.segs.length + si) * 120}ms;"
											></span>
										{/each}
									</div>
								{/each}
							</div>
							<div class=" mt-3 text-[9.5px] tracking-[0.03em]">
								Object-storage-native LSM
							</div>
						</div>
					</div>
				</div>

				<!-- 03 · Signal Mesh -->
				<div class="stage" data-stage="mesh">
					<span class="stage-tag bg-background">03 · Signal Mesh</span>

					<div class="flex flex-col items-center">
						<span
							class=" text-[10px] font-semibold tracking-[0.13em] uppercase"
						>
							Detection Query / Rule
						</span>
						<div class="aconn">
							<span class="vline h-[22px]"></span>
							<span class="alab text-primary">Stateful · Continuous</span>
						</div>

						<div bind:this={meshEl} class="abox max-w-[360px] p-[26px]" class:is-lit={meshLit}>
							<h4 class="text-primary text-[21px] font-semibold">Signal Mesh</h4>
							<p class=" mt-[7px] text-[12.5px]">Detection state machine</p>
						</div>

						<div class="aconn">
							<span class="alab">Evaluate Continuously</span>
							<span class="vline h-[18px]"></span>
						</div>

						<div
							bind:this={alertEl}
							class="border-destructive/50 bg-destructive/5 text-destructive sig-alert inline-flex rounded-[9px] border px-5 py-2.5 text-[12.5px] font-medium"
							class:is-lit={alertLit}
						>
							Signal / Alert
						</div>
					</div>
				</div>

				<!-- 04 · Serverless Query Engine -->
				<div class="stage" data-stage="engine">
					<span class="stage-tag bg-background">04 · Serverless Query Engine</span>

					<div
						class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,300px)_1fr_minmax(0,340px)]"
					>
						<div class="flex flex-col items-center">
							<div class="s4-klabel">Search Query</div>
							<div class="aconn"><span class="vline h-[22px]"></span></div>
							<div bind:this={plannerEl} class="abox w-full p-[22px]" class:is-lit={plannerLit}>
								<h4 class="text-[16.5px] font-semibold">Query Planner</h4>
							</div>
						</div>

						<div
							class=" flex min-h-[120px] items-center justify-center gap-2.5 self-stretch text-[9.5px] font-semibold tracking-[0.13em] uppercase"
						>
							<span
								class="border-border/80 hidden max-w-[60px] flex-1 border-t border-dashed lg:block"
							></span>
							Fan out
							<span
								class="border-border/80 relative hidden max-w-[60px] flex-1 border-t border-dashed lg:block"
							>
								<span
									class="border-l-muted-foreground absolute -top-[3.5px] -right-px border-[3.5px] border-transparent"
									style="border-left-color: var(--muted-foreground);"
								></span>
							</span>
						</div>

						<div class="flex flex-col items-center">
							<div class="s4-klabel">Persistent · Customer-Owned</div>
							<div bind:this={cosEl} class="abox w-full px-5 pt-[22px] pb-4" class:is-lit={cosLit}>
								<h4 class="text-[16.5px] font-semibold">Customer Object Storage</h4>
								<div
									class=" mt-2 text-[9.5px] font-semibold tracking-[0.13em] uppercase"
								>
									Rover Index
								</div>
							</div>

							<div class="aconn">
								<span class="alab">Read On Demand</span>
								<span class="vline h-4"></span>
							</div>

							<div class="s4-klabel text-primary mb-0.5">Ephemeral · Per Query</div>
							<div class="my-2 flex gap-2.5">
								{#each lamOn as on, i (i)}
									<span class="lam" class:is-on={on}>λ</span>
								{/each}
							</div>

							<div class="aconn">
								<span class="alab text-center">Merge Partial<br />Results</span>
								<span class="vline h-3.5"></span>
							</div>

							<div bind:this={mergeEl} class="abox w-full p-[18px]" class:is-lit={mergeLit}>
								<h4 class="text-[16.5px] font-semibold">Query Planner</h4>
							</div>
						</div>
					</div>
				</div>

				<!-- Outputs -->
				<div class="relative mt-2.5">
					<div class="mb-1.5 flex justify-center gap-16 md:gap-[190px]">
						{#each ['Detection<br>Signals', 'Search + Analytics<br>Results'] as label (label)}
							<div class="flex flex-col items-center">
								<span class="vline h-[30px]"></span>
								<span
									class=" mt-2 text-center text-[9.5px] leading-[1.6] font-semibold tracking-[0.12em] uppercase"
								>
									{@html label}
								</span>
							</div>
						{/each}
					</div>

					<div
						bind:this={rspEl}
						class="border-primary/50 bg-primary/5 rsp-box mx-auto mt-[18px] max-w-[340px] rounded-[13px] border px-[26px] py-[22px] text-center"
						class:is-lit={rspLit}
					>
						<div class="text-primary text-[10.5px] font-bold tracking-[0.12em] uppercase">
							Rover Security Platform
						</div>
						<h4 class="mt-2.5 text-[19px] font-bold tracking-[0.01em]">SIEM · AI SOC</h4>
					</div>
				</div>
			</div>
		</div>

		<!-- ============ Index / Track / Query ============ -->
		<div class="mt-28 text-center">
			<div class="text-[11px] font-bold tracking-[0.12em] uppercase">
				Persistent index · Continuous detection state · Ephemeral query compute
			</div>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				Index the history. Track the present.<br />Query on demand.
			</h2>
		</div>

		<div class="mt-15 grid grid-cols-1 gap-[22px] lg:grid-cols-3">
			{#each itqCards as card, ci (card.title)}
				<article
					class="border-border bg-background flex flex-col overflow-hidden rounded-2xl border shadow-[0_2px_6px_rgba(0,0,0,0.03),0_20px_44px_-18px_rgba(0,0,0,0.09)]"
				>
					<div class="px-[26px] pt-[26px]">
						<div
							class="text-[10px] font-bold tracking-[0.11em] uppercase"
							style="color: {LIME_INK};"
						>
							{card.cat}
						</div>
						<h3 class="mt-2.5 text-[20px] font-bold tracking-[-0.015em]">{card.title}</h3>

						<div class="relative mt-2 h-[172px]">
							{#if ci === 0}
								<!-- Index segments written beside the data -->
								<svg viewBox="0 0 300 160" class="h-full w-full" aria-hidden="true">
									<rect
										x="18"
										y="24"
										width="70"
										height="112"
										rx="12"
										class="fill-primary/10 stroke-primary/30"
									/>
									<g class="stroke-primary/80" stroke-width="1.6" fill="none">
										<path d="M40 62l13-6 13 6-13 6z" /><path d="M40 72l13 6 13-6" /><path
											d="M40 82l13 6 13-6"
										/>
									</g>
									<text x="53" y="112" text-anchor="middle" font-size="9.5" class="fill-foreground"
										>Object storage</text
									>
									<line
										x1="96"
										y1="80"
										x2="146"
										y2="80"
										class="stroke-border"
										stroke-dasharray="3 4"
									/>
									<path d="M146 80l-5-3v6z" class="fill-border" />
									{#each [0.18, 0.32, 0.46, 0.62, 0.8, 1] as strength, si (si)}
										<rect
											x={156 + si * 18}
											y="70"
											width="17"
											height="20"
											style="fill: color-mix(in oklab, var(--primary) {strength *
												100}%, var(--background));"
										/>
									{/each}
									<rect
										x="155"
										y="69"
										width="109"
										height="22"
										rx="3"
										fill="none"
										class="stroke-border"
									/>
									<text x="209" y="108" text-anchor="middle" font-size="9.5" class="fill-foreground"
										>Index segments</text
									>
								</svg>
							{:else if ci === 1}
								<!-- Detection state fanning out to every source -->
								<svg viewBox="0 0 300 160" class="h-full w-full" aria-hidden="true">
									<g class="stroke-border" stroke-dasharray="2 4">
										<line x1="150" y1="76" x2="62" y2="30" /><line
											x1="150"
											y1="76"
											x2="238"
											y2="30"
										/><line x1="150" y1="76" x2="40" y2="88" /><line
											x1="150"
											y1="76"
											x2="260"
											y2="88"
										/><line x1="150" y1="76" x2="70" y2="134" /><line
											x1="150"
											y1="76"
											x2="228"
											y2="134"
										/>
									</g>
									{#each [[62, 30], [238, 30], [40, 88], [260, 88], [70, 134], [228, 134]] as [x, y] (`${x}-${y}`)}
										<g transform="translate({x},{y})">
											<circle r="10" class="fill-background stroke-border" />
											<circle r="3" class="fill-primary" />
										</g>
									{/each}
									<circle cx="150" cy="76" r="30" class="fill-primary" opacity="0.16" />
									<circle cx="150" cy="76" r="19" class="fill-primary" />
									<path
										d="M139 76h6l2.5-7 5 14 2.5-7h6"
										class="stroke-foreground"
										stroke-width="1.8"
										fill="none"
									/>
								</svg>
							{:else}
								<!-- Query fans out to workers, results come back -->
								<svg viewBox="0 0 300 160" class="h-full w-full" aria-hidden="true">
									<rect
										x="18"
										y="52"
										width="54"
										height="54"
										rx="10"
										class="fill-background stroke-border"
									/>
									<circle
										cx="43"
										cy="72"
										r="8"
										fill="none"
										class="stroke-primary/80"
										stroke-width="1.7"
									/>
									<path d="m49 78 5 5" class="stroke-primary/80" stroke-width="1.7" />
									<text x="45" y="97" text-anchor="middle" font-size="9" class="fill-foreground"
										>Query</text
									>
									{#each [30, 57, 84, 111] as wy (wy)}
										<g transform="translate(118,{wy})">
											<rect
												width="66"
												height="17"
												rx="8"
												class="fill-background stroke-primary/30"
											/>
											<g class="fill-muted-foreground">
												<circle cx="16" cy="8.5" r="2" /><circle cx="27" cy="8.5" r="2" /><circle
													cx="38"
													cy="8.5"
													r="2"
												/><circle cx="49" cy="8.5" r="2" />
											</g>
										</g>
									{/each}
									<g class="stroke-border" fill="none">
										<path d="M74 78c16 0 22-39 42-39" /><path d="M74 78c16 0 22-12 42-12" /><path
											d="M74 78c16 0 22 14 42 14"
										/><path d="M74 78c16 0 22 42 42 42" />
										<path d="M186 39c16 0 22 39 42 39" /><path d="M186 66c16 0 22 12 42 12" /><path
											d="M186 92c16 0 22-14 42-14"
										/><path d="M186 119c16 0 22-42 42-42" />
									</g>
									<rect x="230" y="52" width="54" height="54" rx="10" class="fill-primary" />
									<g class="stroke-foreground" stroke-width="1.6" fill="none">
										<path d="M247 68l10-4.5 10 4.5-10 4.5z" /><path d="M247 75.5l10 4.5 10-4.5" />
									</g>
									<text x="257" y="97" text-anchor="middle" font-size="9" class="fill-foreground"
										>Results</text
									>
								</svg>
							{/if}
						</div>
					</div>

					<div class="border-border flex-1 border-t px-[26px] py-[18px]">
						{#each card.checks as check (check)}
							<div class="flex items-start gap-3 py-[6.5px] text-[13px]">
								<svg
									viewBox="0 0 16 16"
									class="mt-[3px] h-[13px] w-[13px] shrink-0 fill-none"
									stroke-width="2.6"
									stroke-linecap="round"
									stroke-linejoin="round"
									style="stroke: {LIME_DIM};"
									aria-hidden="true"><path d="M2.5 8.5 6 12l7.5-8" /></svg
								>
								{check}
							</div>
						{/each}
					</div>

					<div
						class="border-border bg-muted/50  border-t px-[26px] py-3.5 text-[10.5px] font-semibold tracking-[0.09em] uppercase"
					>
						{card.foot}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Stage frames inside the dark panel ------------------------------- */
	.stage {
		position: relative;
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 40px 34px 34px;
		margin-top: 34px;
	}
	.stage:first-of-type {
		margin-top: 0;
	}
	.stage-tag {
		position: absolute;
		top: -8px;
		left: 26px;
		padding: 0 10px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}
	@media (max-width: 900px) {
		.stage {
			padding: 30px 16px 26px;
		}
	}

	/* Boxes light up as data reaches them ------------------------------ */
	.abox {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-align: center;
		padding: 20px 18px;
		transition:
			border-color 0.4s ease,
			box-shadow 0.4s ease;
	}
	.abox.is-lit {
		border-color: color-mix(in oklab, var(--primary) 45%, transparent);
		box-shadow: 0 0 22px -4px color-mix(in oklab, var(--primary) 18%, transparent);
	}
	.oswrap {
		transition:
			border-color 0.4s ease,
			box-shadow 0.4s ease;
	}
	.oswrap.is-lit {
		border-color: color-mix(in oklab, var(--primary) 40%, transparent);
		box-shadow: 0 0 26px -6px color-mix(in oklab, var(--primary) 14%, transparent);
	}
	.sig-alert {
		transition: box-shadow 0.4s ease;
	}
	.sig-alert.is-lit {
		box-shadow: 0 0 20px -2px color-mix(in oklab, var(--destructive) 40%, transparent);
	}
	.rsp-box {
		box-shadow: 0 0 34px -8px color-mix(in oklab, var(--primary) 18%, transparent);
		transition: box-shadow 0.5s ease;
	}
	.rsp-box.is-lit {
		box-shadow: 0 0 48px -6px color-mix(in oklab, var(--primary) 35%, transparent);
	}

	/* Connectors -------------------------------------------------------- */
	.aconn {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}
	.vline {
		width: 1px;
		background: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
		position: relative;
	}
	.vline::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 50%;
		transform: translateX(-50%);
		border: 3.5px solid transparent;
		border-top-color: var(--muted-foreground);
	}
	.alab {
		font-size: 9.5px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		padding: 8px 0;
	}
	.s4-klabel {
		font-size: 9.5px;
		font-weight: 600;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		margin-bottom: 10px;
	}
	.branch-line {
		stroke: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
		stroke-width: 1;
		fill: none;
	}

	/* Ephemeral workers ------------------------------------------------- */
	.lam {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		font-size: 13px;
		background: var(--card);
		transition: all 0.3s ease;
	}
	.lam.is-on {
		border-color: color-mix(in oklab, var(--primary) 70%, transparent);
		color: var(--primary);
		background: color-mix(in oklab, var(--primary) 12%, var(--card));
		box-shadow: 0 0 14px color-mix(in oklab, var(--primary) 25%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.abox,
		.oswrap,
		.sig-alert,
		.rsp-box,
		.lam {
			transition-duration: 0.01ms;
		}
	}
</style>
