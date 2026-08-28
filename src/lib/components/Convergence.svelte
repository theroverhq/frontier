<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	/* Five systems, five hues — the point of the visual is that they're separate. */
	const legacySystems = [
		{ name: 'SIEM', role: 'Hot index', color: 'var(--destructive)' },
		{ name: 'Search', role: 'Search cluster', color: 'var(--chart-2)' },
		{ name: 'Analytics', role: 'Analytics store', color: 'var(--chart-1)' },
		{ name: 'Archive / Data Lake', role: 'Separate historical store', color: 'var(--chart-3)' },
		{ name: 'AI SOC', role: 'Limited context', color: 'var(--chart-4)' }
	];

	/* Chips are anchored by their left edge and pulled back 50%, so `x` is the
	   centre and doubles as the connector's origin. */
	const workflows = [
		{ label: 'Search', x: 12, top: 8 },
		{ label: 'Analytics', x: 33, top: 52 },
		{ label: 'Detections', x: 53, top: 8 },
		{ label: 'SIEM', x: 73, top: 52 },
		{ label: 'AI SOC', x: 90, top: 8 }
	];

	const CHIPS_H = 110;
	const VIEW_H = CHIPS_H + 26;
	const BUS_Y = VIEW_H * 0.82;

	let fragEl: HTMLDivElement | undefined = $state();
	let planeEl: HTMLDivElement | undefined = $state();

	let rowsIn = $state(false);
	let linesIn = $state(false);
	let chevIn = $state(false);

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			rowsIn = true;
			linesIn = true;
			chevIn = true;
			return;
		}

		let dead = false;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const observers: IntersectionObserver[] = [];

		const once = (el: Element | undefined, cb: () => void) => {
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
				{ threshold: 0.5 }
			);
			io.observe(el);
			observers.push(io);
		};

		once(fragEl, () => (rowsIn = true));
		once(planeEl, () => {
			linesIn = true;
			const id = setTimeout(() => {
				timers.delete(id);
				if (!dead) chevIn = true;
			}, 900);
			timers.add(id);
		});

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			observers.forEach((io) => io.disconnect());
		};
	});
</script>

<section
	id="convergence"
	class="dark bg-background text-foreground relative overflow-hidden pt-28 pb-26"
>
	<!-- Ambient wash, mixed from the theme token -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(700px 320px at 50% 3%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 65%);"
		aria-hidden="true"
	></div>

	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge
				variant="outline"
				class="border-primary/35 bg-primary/5 text-primary px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase"
			>
				Converged Security
			</Badge>
			<h2
				class="mt-6 text-[clamp(2rem,4.6vw,3.375rem)] leading-[1.12] font-bold tracking-[-0.025em]"
			>
				SIEM. AI. <span class="text-primary">One platform.</span>
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Traditional security stacks split telemetry and context across hot SIEM indexes, data lakes,
				search systems, analytics engines, and AI tools. Rover brings those workflows together
				around one full-fidelity security history.
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_1.15fr]">
			<!-- Today: five systems, five stores -->
			<div
				bind:this={fragEl}
				class="border-border bg-card rounded-[18px] border px-4 pt-[30px] pb-[26px] sm:px-7"
			>
				<div class=" text-[11px] font-bold tracking-[0.12em] uppercase">Today</div>
				<h3 class="mt-3 text-[19.5px] font-bold tracking-[-0.015em]">
					Five systems. Fragmented security context.
				</h3>

				<div class="mt-[22px]">
					{#each legacySystems as sys, i (sys.name)}
						<div
							class="border-border bg-foreground/5 mb-3 flex items-center gap-3 rounded-[10px] border px-4 py-[13px] text-sm font-semibold transition-all duration-500 ease-out"
							style="opacity: {rowsIn ? 1 : 0}; transform: translateX({rowsIn
								? 0
								: -14}px); transition-delay: {i * 120}ms;"
						>
							<span
								class="h-[7px] w-[7px] shrink-0 rounded-full"
								style="background: {sys.color}; box-shadow: 0 0 8px color-mix(in oklab, {sys.color} 50%, transparent);"
							></span>
							{sys.name}
							<span
								class="border-border/80 mx-1 flex-1 origin-left border-t border-dashed transition-transform duration-500 ease-out"
								style="transform: scaleX({rowsIn ? 1 : 0}); transition-delay: {250 + i * 120}ms;"
							></span>
							<span class=" text-[11.5px] font-normal whitespace-nowrap">{sys.role}</span>
						</div>
					{/each}
				</div>

				<div
					class="border-border/80 mt-5 border-t border-dashed pt-4 text-center text-[13px] leading-[1.7]"
				>
					Copy · Move · Normalize<br />Rehydrate · Retain Differently
				</div>
			</div>

			<!-- With Rover: every workflow lands on one plane -->
			<div
				bind:this={planeEl}
				class="border-border bg-card rounded-[18px] border px-4 pt-[30px] pb-[26px] sm:px-7"
			>
				<div class="text-primary text-[11px] font-bold tracking-[0.12em] uppercase">With Rover</div>
				<h3 class="mt-3 text-[19.5px] font-bold tracking-[-0.015em]">
					Every workflow runs on the same history.
				</h3>

				<div class="relative pt-1.5">
					<div class="relative" style="height: {CHIPS_H}px;">
						<!-- Each workflow drops to a shared bus, then runs in to the plane. -->
						<div class="pointer-events-none absolute inset-x-0 top-0" aria-hidden="true">
							{#each workflows as flow, i (flow.label)}
								<span
									class="bg-muted-foreground/55 absolute w-px origin-top transition-transform duration-500 ease-out"
									style="left: {flow.x}%; top: {flow.top + 24}px; height: {BUS_Y -
										flow.top -
										24}px; transform: scaleY({linesIn ? 1 : 0}); transition-delay: {200 +
										i * 100}ms;"
								></span>
								<span
									class="bg-muted-foreground/55 absolute h-px transition-transform duration-500 ease-out"
									style="left: {Math.min(flow.x, 50)}%; top: {BUS_Y}px; width: {Math.abs(
										flow.x - 50
									)}%; transform-origin: {flow.x < 50
										? 'left'
										: 'right'}; transform: scaleX({linesIn ? 1 : 0}); transition-delay: {600 +
										i * 100}ms;"
								></span>
							{/each}
						</div>

						{#each workflows as flow (flow.label)}
							<span
								class="bg-foreground text-background absolute -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-[9.5px] font-bold tracking-[0.06em] whitespace-nowrap uppercase shadow-lg sm:px-3.5 sm:py-2 sm:text-[10.5px] sm:tracking-[0.08em]"
								style="left: {flow.x}%; top: {flow.top}px;">{flow.label}</span
							>
						{/each}
					</div>

					<div
						class="bg-primary mx-auto mt-2 mb-3.5 flex h-[34px] w-[34px] items-center justify-center rounded-full shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_35%,transparent)] transition-all duration-500"
						style="opacity: {chevIn ? 1 : 0}; transform: scale({chevIn ? 1 : 0.6});"
					>
						<svg
							viewBox="0 0 24 24"
							class="stroke-primary-foreground h-3.5 w-3.5 fill-none"
							stroke-width="2.6"
							aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg
						>
					</div>

					<div
						class="border-primary/50 bg-primary/5 rounded-[14px] border px-[26px] py-6 text-center shadow-[0_0_34px_-10px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
					>
						<div class="text-primary text-[11px] font-bold tracking-[0.12em] uppercase">
							One Security Data Plane
						</div>
						<h4 class="mt-2.5 text-[21px] font-bold tracking-[-0.015em]">
							Full-fidelity security history
						</h4>
						<p class=" mt-2.5 text-xs">Rover Index&ensp;Security context</p>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-11 text-center text-[21px] font-semibold tracking-[-0.015em]">
			One security history. Every workflow.
		</div>
	</div>
</section>
