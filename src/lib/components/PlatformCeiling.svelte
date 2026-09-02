<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	const domains = [
		{
			title: 'Security',
			body: 'SIEM · AI SOC · Detections · Threat Hunting',
			active: true
		},
		{ title: 'Observability', body: 'Logs · Infrastructure · Troubleshooting', active: false },
		{
			title: 'Audit + Compliance',
			body: 'Audit Trails · Forensics · Long-term Evidence',
			active: false
		},
		{ title: 'Machine Data', body: 'Events · Telemetry · Operational Analytics', active: false }
	];

	const engineTraits = [
		'Object-native search',
		'Fast analytics',
		'Schema-on-read',
		'Serverless query compute'
	];

	/* Lime is unreadable on a light surface, so darken it toward ink. */
	const LIME_INK = 'color-mix(in oklab, var(--primary) 62%, var(--foreground))';

	const MERGE_H = 70;

	let mergeW = $state(0);
	let cardsEl: HTMLDivElement | undefined = $state();
	let mergeEl: HTMLDivElement | undefined = $state();

	let cardsIn = $state(domains.map(() => false));
	let linesIn = $state(false);
	let barIn = $state(false);

	/* Every domain funnels into the one engine. */
	const mergePaths = $derived.by(() => {
		if (!mergeW) return [];
		const mid = mergeW / 2;
		return [0.125, 0.375, 0.625, 0.875].map((fx) => {
			const x = fx * mergeW;
			const inward = x < mid ? x + 24 : x - 24;
			return `M${x} 0 V${MERGE_H * 0.45} Q${x} ${MERGE_H * 0.7} ${inward} ${MERGE_H * 0.7} H${mid}`;
		});
	});
	const trunkPath = $derived(mergeW ? `M${mergeW / 2} ${MERGE_H * 0.7} V${MERGE_H}` : '');

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			cardsIn = cardsIn.map(() => true);
			linesIn = true;
			barIn = true;
			return;
		}

		let dead = false;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const observers: IntersectionObserver[] = [];

		const later = (fn: () => void, ms: number) => {
			const id = setTimeout(() => {
				timers.delete(id);
				if (!dead) fn();
			}, ms);
			timers.add(id);
		};

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

		once(cardsEl, () => domains.forEach((_, i) => later(() => (cardsIn[i] = true), i * 90)), 0.3);
		once(
			mergeEl,
			() => {
				linesIn = true;
				later(() => (barIn = true), 600);
			},
			0.4
		);

		return () => {
			dead = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			observers.forEach((io) => io.disconnect());
		};
	});
</script>

<section
	id="platform-ceiling"
	class="bg-muted text-foreground relative overflow-hidden pt-24 pb-28"
>
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				Beyond SIEM
			</Badge>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				Security is where Rover starts.
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Rover is powered by a serverless search and analytics engine built for massive event
				streams. The same object-native architecture that makes years of security data searchable
				can extend to observability, audit, and other high-volume machine-data workloads.
			</p>
		</div>

		<div
			bind:this={cardsEl}
			class="relative z-2 mt-15 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4"
		>
			{#each domains as domain, i (domain.title)}
				<article
					class="border-border bg-background relative overflow-hidden rounded-xl border px-[22px] pt-5 pb-[22px] shadow-[0_2px_6px_rgba(0,0,0,0.03),0_16px_36px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_4px_10px_rgba(0,0,0,0.04),0_26px_46px_-16px_rgba(0,0,0,0.13)]"
					style="opacity: {cardsIn[i] ? 1 : 0}; transform: translateY({cardsIn[i] ? 0 : 20}px);"
				>
					{#if domain.active}
						<span class="bg-primary absolute inset-x-0 top-0 h-[3px]" aria-hidden="true"></span>
					{/if}
					<h4 class="border-border flex items-center gap-2.5 border-b pb-3 text-[15.5px] font-bold">
						<i
							class="h-1.5 w-1.5 shrink-0 rounded-full {domain.active
								? 'bg-primary shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_60%,transparent)]'
								: 'bg-muted-foreground/40'}"
						></i>
						{domain.title}
					</h4>
					<p class=" mt-3 text-[13.5px] leading-[1.65]">{domain.body}</p>
				</article>
			{/each}
		</div>

		<!-- Four workloads, one engine -->
		<div
			bind:this={mergeEl}
			bind:clientWidth={mergeW}
			class="relative mx-auto -mt-1.5 hidden lg:block"
			style="height: {MERGE_H}px;"
			aria-hidden="true"
		>
			{#if mergeW}
				<svg class="absolute inset-0 h-full w-full overflow-visible">
					{#each mergePaths as d, i (i)}
						<path
							{d}
							class="merge-line"
							class:is-in={linesIn}
							pathLength="100"
							style="transition-delay: {i * 110}ms;"
						/>
					{/each}
					<path
						d={trunkPath}
						class="merge-line"
						class:is-in={linesIn}
						pathLength="100"
						style="transition-delay: 480ms;"
					/>
				</svg>
			{/if}
		</div>

		<div class="h-10 lg:hidden"></div>

		<div
			class="dark bg-background text-foreground relative mx-auto max-w-[706px] rounded-2xl px-[30px] pt-[27px] pb-[25px] text-center shadow-[0_26px_56px_-20px_rgba(0,0,0,0.35)] transition-all duration-700"
			style="opacity: {barIn ? 1 : 0}; transform: translateY({barIn ? 0 : 20}px);"
		>
			<h3 class="text-[19.5px] font-bold tracking-[-0.01em]">Rover Engine</h3>
			<p class=" mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[13.5px]">
				{#each engineTraits as trait, i (trait)}
					{#if i > 0}
						<i class="/60 not-italic">•</i>
					{/if}
					<span>{trait}</span>
				{/each}
			</p>
		</div>

		<div class="mt-11 text-center text-[20px] font-semibold tracking-[-0.015em]">
			Built for security. <span style="color: {LIME_INK};">Engineered for machine data.</span>
		</div>
	</div>
</section>

<style>
	/* Connectors draw from each workload down into the engine. */
	.merge-line {
		fill: none;
		stroke: color-mix(in oklab, var(--foreground) 20%, transparent);
		stroke-width: 1;
		stroke-dasharray: 100;
		stroke-dashoffset: 100;
		transition: stroke-dashoffset 0.7s ease-in-out;
	}
	.merge-line.is-in {
		stroke-dashoffset: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.merge-line {
			stroke-dashoffset: 0;
			transition-duration: 0.01ms;
		}
	}
</style>
