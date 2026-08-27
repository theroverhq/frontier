<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	/* Reconstructed attack, oldest first. The reveal runs the other way. */
	const events = [
		{
			src: 'DNS',
			when: '11 months ago',
			title: 'First DNS beacon observed',
			sub: 'Earliest related activity'
		},
		{ src: 'Identity', when: '93 days ago', title: 'Credential changed', sub: '' },
		{ src: 'Endpoint', when: '42 days ago', title: 'Suspicious process executed', sub: '' },
		{ src: 'Cloud', when: '7 days ago', title: 'New cloud role assumed', sub: '' }
	];

	const corrRows = [
		{ n: '01', t: 'First DNS beacon', d: '11 mo' },
		{ n: '02', t: 'Credential change', d: '93 d' },
		{ n: '03', t: 'Process execution', d: '42 d' },
		{ n: '04', t: 'New cloud role', d: '7 d' }
	];

	const steps = [
		{ n: '01', title: 'Search', body: 'Years of security history' },
		{ n: '02', title: 'Correlate', body: 'Across every security source' },
		{ n: '03', title: 'Reconstruct', body: 'The attack timeline' },
		{ n: '04', title: 'Explain', body: 'Analyst-ready conclusions' }
	];

	const BREACH_DAYS = 241;
	const RING_R = 48.4;
	const CIRC = 2 * Math.PI * RING_R;
	const ARC_MAX = 0.56;
	const MARKS = 14;

	const marks = Array.from({ length: MARKS }, (_, i) => {
		const rad = ((-90 + (i / MARKS) * 360) * Math.PI) / 180;
		return {
			cx: 50 + RING_R * Math.cos(rad),
			cy: 50 + RING_R * Math.sin(rad),
			k: i / MARKS
		};
	});

	let attackEl: HTMLDivElement | undefined = $state();
	let breachEl: HTMLDivElement | undefined = $state();

	/* Attack timeline reveal */
	let searchIn = $state(false);
	let corrHeadIn = $state(false);
	let evIn = $state([false, false, false, false, false]);
	let rowIn = $state([false, false, false, false, false]);
	let lineIn = $state(false);
	let headIn = $state(false);
	let glow = $state(false);

	/* Breach counter */
	let progress = $state(0);

	let reduced = false;
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

	function settleAttack() {
		searchIn = true;
		corrHeadIn = true;
		evIn = evIn.map(() => true);
		rowIn = rowIn.map(() => true);
		lineIn = true;
		headIn = true;
	}

	/* The incident is reconstructed backwards: today's alert first, then each
	   earlier trace, until the line reaches eleven months back. */
	function play() {
		if (reduced) {
			settleAttack();
			return;
		}
		timers.forEach((id) => clearTimeout(id));
		timers.clear();
		searchIn = false;
		corrHeadIn = false;
		evIn = evIn.map(() => false);
		rowIn = rowIn.map(() => false);
		lineIn = false;
		headIn = false;
		glow = false;

		later(() => (searchIn = true), 30);
		later(() => (corrHeadIn = true), 160);
		const order = [4, 3, 2, 1, 0];
		order.forEach((idx, step) =>
			later(
				() => {
					evIn[idx] = true;
					rowIn[idx] = true;
				},
				600 + step * 450
			)
		);
		later(() => (lineIn = true), 2700);
		later(() => {
			headIn = true;
			glow = true;
			later(() => (glow = false), 1400);
		}, 3400);
	}

	onMount(() => {
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			settleAttack();
			progress = 1;
			return;
		}

		const observers: IntersectionObserver[] = [];
		const once = (el: Element | undefined, cb: () => void, threshold: number) => {
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

		once(attackEl, play, 0.4);
		once(
			breachEl,
			() => {
				const dur = 2600;
				const t0 = performance.now();
				const step = (now: number) => {
					if (dead) return;
					const p = Math.min(1, Math.max(0, (now - t0) / dur));
					/* ease-in-out */
					progress = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
					if (p < 1) requestAnimationFrame(step);
				};
				requestAnimationFrame(step);
			},
			0.45
		);

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			observers.forEach((io) => io.disconnect());
		};
	});
</script>

<section id="ai-soc" class="bg-muted text-foreground relative overflow-hidden pt-26 pb-28">
	<!-- Lime-tinted wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(760px 400px at 50% 0%, color-mix(in oklab, var(--primary) 16%, var(--muted)), transparent 70%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				AI SOC With Memory
			</Badge>
			<div class="mt-4 text-[11px] font-bold tracking-[0.12em] uppercase">
				Persistent data. Stateful detections. Ephemeral queries.
			</div>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				The attack started before the alert did.
			</h2>
			<p class="text-muted-foreground mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Security incidents don't begin when the alert fires. Rover gives AI agents years of
				searchable security history to reconstruct the attack, correlate activity across systems,
				and investigate with the same search and analytics available to human analysts.
			</p>
		</div>

		<div
			bind:this={attackEl}
			class="dark bg-background text-foreground mt-16 grid grid-cols-1 overflow-hidden rounded-[20px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.4)] lg:grid-cols-2"
		>
			<!-- Evidence, oldest at the top -->
			<div class="border-border border-b px-9 pt-[34px] pb-10 lg:border-r lg:border-b-0">
				<div
					class="border-border bg-card text-muted-foreground rounded-[10px] border px-[18px] py-3.5 text-xs font-semibold tracking-[0.11em] uppercase transition-opacity duration-500"
					style="opacity: {searchIn ? 1 : 0};"
				>
					Searched 3 Years Of Security History
				</div>

				<div class="relative mt-[34px] pl-[26px]">
					<span
						class="bg-muted-foreground/40 absolute top-2 bottom-0 left-[4.5px] w-px origin-bottom transition-transform duration-[900ms] ease-in-out"
						style="transform: scaleY({lineIn ? 1 : 0});"
					></span>

					{#each events as ev, i (ev.title)}
						<div
							class="relative pb-[30px] transition-all duration-500 ease-out"
							style="opacity: {evIn[i] ? 1 : 0}; transform: translateY({evIn[i] ? 0 : 12}px);"
						>
							<span
								class="bg-primary absolute top-1 -left-[26px] h-2.5 w-2.5 rounded-full shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
							></span>
							<div
								class="text-muted-foreground text-[10.5px] font-bold tracking-[0.11em] uppercase"
							>
								{ev.src}<small
									class="text-muted-foreground/80 ml-2.5 text-[11px] font-medium tracking-[0.04em] normal-case"
									>{ev.when}</small
								>
							</div>
							<h4 class="mt-[7px] text-base font-semibold tracking-[-0.01em]">{ev.title}</h4>
							{#if ev.sub}
								<div class="text-muted-foreground/80 mt-[5px] text-[11.5px]">{ev.sub}</div>
							{/if}
						</div>
					{/each}

					<div
						class="relative h-3 transition-opacity duration-500"
						style="opacity: {evIn[4] ? 1 : 0};"
					>
						<span
							class="bg-primary absolute top-0 -left-[26px] h-2.5 w-2.5 rounded-full shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
						></span>
					</div>
				</div>
			</div>

			<!-- What the agent concluded -->
			<div class="flex flex-col px-9 pt-[34px] pb-10">
				<div class="text-muted-foreground text-xs leading-[1.8] font-semibold">
					11 Months of Activity Correlated<br />Rover AI Investigation
				</div>
				<h3
					class="mt-5 text-[clamp(1.5rem,2.4vw,1.9375rem)] leading-[1.28] font-bold tracking-[-0.02em] transition-opacity duration-500"
					style="opacity: {headIn ? 1 : 0};"
				>
					Related activity traces back<br />at least
					<span
						class="text-primary transition-[text-shadow] duration-500"
						style="text-shadow: {glow
							? '0 0 22px color-mix(in oklab, var(--primary) 55%, transparent)'
							: 'none'};">11 months.</span
					>
				</h3>

				<div class="border-border bg-card mt-[26px] rounded-[14px] border px-6 pt-5 pb-2">
					<div
						class="flex items-center gap-2.5 pb-3 text-[11px] font-bold tracking-[0.1em] uppercase transition-opacity duration-500"
						style="opacity: {corrHeadIn ? 1 : 0};"
					>
						<span
							class="bg-primary h-[7px] w-[7px] rounded-full shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
						></span>
						4 Telemetry Sources Correlated
					</div>

					{#each corrRows as row, i (row.n)}
						<div
							class="border-border flex items-baseline gap-3 border-t py-3 text-[13px] transition-all duration-500 ease-out"
							style="opacity: {rowIn[i] ? 1 : 0}; transform: translateY({rowIn[i] ? 0 : 8}px);"
						>
							<span class="text-muted-foreground/70 text-[11.5px]">{row.n}</span>
							<span class="text-muted-foreground">{row.t}</span>
							<span class="text-muted-foreground/80 ml-auto text-xs">{row.d}</span>
						</div>
					{/each}

					<div
						class="border-border border-t py-3 text-[13px] transition-all duration-500 ease-out"
						style="opacity: {rowIn[4] ? 1 : 0}; transform: translateY({rowIn[4] ? 0 : 8}px);"
					>
						<div class="flex items-baseline gap-3">
							<span class="text-muted-foreground/70 text-[11.5px]">05</span>
							<span class="font-semibold">Today's alert</span>
						</div>
						<div class="text-muted-foreground/80 mt-[5px] text-[11px]">
							Traced to activity first observed 11 months ago
						</div>
					</div>
				</div>

				<button
					type="button"
					onclick={play}
					class="border-border bg-card hover:border-primary/40 mt-[22px] self-start rounded-[10px] border px-[22px] py-[13px] text-[11.5px] font-bold tracking-[0.1em] uppercase transition-all duration-300 hover:shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_10%,transparent)]"
				>
					View Reconstructed Timeline
				</button>
			</div>
		</div>

		<!-- ============ Years of security memory ============ -->
		<div class="mt-28 text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				From Months Of Manual Searching
			</Badge>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				Years of security memory.<br />Answers in seconds.
			</h2>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2.5">
			{#each steps as step, i (step.n)}
				<div class="relative flex items-start gap-3.5">
					<div
						class="bg-primary flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full shadow-[0_0_0_6px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
					>
						<svg
							viewBox="0 0 24 24"
							class="stroke-primary-foreground h-4 w-4 fill-none"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							{#if i === 0}
								<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
							{:else if i === 1}
								<rect x="4" y="4" width="5" height="5" rx="1.5" /><rect
									x="15"
									y="4"
									width="5"
									height="5"
									rx="1.5"
								/><rect x="4" y="15" width="5" height="5" rx="1.5" /><rect
									x="15"
									y="15"
									width="5"
									height="5"
									rx="1.5"
								/><path d="M9 6.5h6M9 17.5h6M6.5 9v6M17.5 9v6" />
							{:else if i === 2}
								<path d="M4 17c3-1 4-8 8-8s5 5 8 4" /><circle
									cx="4"
									cy="17"
									r="1.6"
									class="fill-primary-foreground stroke-none"
								/><circle
									cx="12"
									cy="9"
									r="1.6"
									class="fill-primary-foreground stroke-none"
								/><circle cx="20" cy="13" r="1.6" class="fill-primary-foreground stroke-none" />
							{:else}
								<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
								<path d="M9 9h6M9 13h6M9 17h3" />
							{/if}
						</svg>
					</div>
					<div>
						<h4 class="text-[15px] font-semibold">
							<b class="text-muted-foreground mr-1.5 font-semibold">{step.n}</b>{step.title}
						</h4>
						<p class="text-muted-foreground mt-1 text-[11.5px]">{step.body}</p>
					</div>
					{#if i < steps.length - 1}
						<span
							class="border-border absolute top-[19px] left-[calc(100%-26px)] hidden w-14 border-t border-dashed lg:block"
							aria-hidden="true"
						>
							<span
								class="absolute -top-[3.5px] -right-0.5 border-[3.5px] border-transparent"
								style="border-left-color: color-mix(in oklab, var(--foreground) 25%, transparent);"
							></span>
						</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- 241 days -->
		<div bind:this={breachEl} class="relative mx-auto mt-21 max-w-[840px]">
			<div class="relative flex flex-col items-center sm:h-[290px] sm:flex-row">
				<span class="bg-muted-foreground/50 hidden h-[9px] w-[9px] shrink-0 rounded-full sm:block"
				></span>
				<span
					class="text-muted-foreground absolute left-0 hidden text-[13px] font-medium sm:block"
					style="top: calc(50% + 18px);">Day 0</span
				>

				<div class="bg-border relative hidden h-px flex-1 sm:block">
					<div
						class="absolute inset-0 origin-left"
						style="background: linear-gradient(90deg, color-mix(in oklab, var(--foreground) 25%, transparent), var(--primary)); transform: scaleX({progress.toFixed(
							3
						)});"
					></div>
				</div>

				<!-- The stat itself -->
				<div
					class="relative z-3 flex h-[272px] w-[272px] flex-col items-center justify-center rounded-full text-center sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
					style="background: radial-gradient(circle at 50% 42%, color-mix(in oklab, var(--primary) 8%, var(--background)) 0%, color-mix(in oklab, var(--primary) 16%, var(--background)) 100%);"
				>
					<svg
						viewBox="0 0 100 100"
						class="absolute -inset-[5px] h-[calc(100%+10px)] w-[calc(100%+10px)]"
						aria-hidden="true"
					>
						<circle
							cx="50"
							cy="50"
							r={RING_R}
							fill="none"
							stroke="color-mix(in oklab, var(--foreground) 22%, transparent)"
							stroke-width="1"
							stroke-dasharray="0.4 4.63"
							stroke-linecap="round"
						/>
						<circle
							cx="50"
							cy="50"
							r={RING_R}
							fill="none"
							stroke="var(--primary)"
							stroke-width="2.2"
							stroke-dasharray={CIRC}
							stroke-dashoffset={CIRC * (1 - progress * ARC_MAX)}
							stroke-linecap="round"
							transform="rotate(-90 50 50)"
						/>
						{#each marks as mark (mark.k)}
							<circle
								cx={mark.cx}
								cy={mark.cy}
								r="1.7"
								fill={mark.k <= progress * ARC_MAX
									? 'var(--primary)'
									: 'color-mix(in oklab, var(--foreground) 30%, transparent)'}
							/>
						{/each}
					</svg>

					<div
						class="flex items-baseline gap-[5px] text-[56px] leading-none font-bold tracking-[-0.03em]"
					>
						{Math.round(progress * BREACH_DAYS)}<small
							class="text-[17px] font-medium tracking-normal">days</small
						>
					</div>
					<p class="text-muted-foreground mt-3 max-w-[200px] text-[13.5px] leading-[1.55]">
						Average breach lifecycle to
						<mark class="bg-primary text-primary-foreground px-1.5 py-px font-semibold"
							>identify and contain.</mark
						>
					</p>
				</div>

				<span
					class="text-muted-foreground absolute right-0 hidden text-[13px] font-medium sm:block"
					style="top: calc(50% + 18px);">Day 241</span
				>
				<span
					class="bg-primary hidden h-[9px] w-[9px] shrink-0 rounded-full shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_25%,transparent)] sm:block"
				></span>
			</div>

			<div class="text-muted-foreground mt-10 text-center text-sm">
				When investigations span months, AI needs more than a short hot-data window.
			</div>
			<div class="text-muted-foreground/80 mt-11 text-center text-xs">
				Source:
				<a
					href="https://www.ibm.com/think/x-force/2025-cost-of-a-data-breach-navigating-ai"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-foreground underline underline-offset-4 transition-colors"
					>IBM Cost of a Data Breach 2025</a
				>
			</div>
		</div>
	</div>
</section>
