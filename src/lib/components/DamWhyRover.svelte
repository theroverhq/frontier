<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import HistorySearchCard from '$lib/components/HistorySearchCard.svelte';
	import FileClock from '@lucide/svelte/icons/file-clock';
	import InfinityIcon from '@lucide/svelte/icons/infinity';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import ServerOff from '@lucide/svelte/icons/server-off';
	import Zap from '@lucide/svelte/icons/zap';

	const extras = [
		{
			icon: Zap,
			title: 'Years searchable in seconds',
			body: 'Investigate across your full history without restoring archives first.'
		},
		{
			icon: ServerOff,
			title: 'No search clusters',
			body: "Serverless compute runs when you query, so there's nothing to size, patch, or babysit."
		},
		{
			icon: FileClock,
			title: 'Long audit windows, covered',
			body: 'Multi-year evidence for audits and investigations, without a separate archive project.'
		}
	];
</script>

<section id="why-rover" class="relative overflow-hidden bg-background pt-24 pb-28 text-foreground">
	<div class="relative container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div class="text-center">
			<Badge class="px-4 py-1 text-[11.5px] font-bold tracking-[0.12em] uppercase">
				Why Rover Database Activity Monitoring
			</Badge>
			<div class="mt-4 text-[11px] font-bold tracking-[0.12em] uppercase">
				Customer-owned object storage
			</div>
			<h2 class="mt-6 leading-[1.12] font-bold tracking-[-0.025em]">
				Keep every query.<br class="hidden sm:block" /> Keep it in your object storage.
			</h2>
			<p class=" mx-auto mt-5 max-w-[720px] text-[17.5px] leading-[1.62]">
				Rover stores database activity in your own object storage, not ours, and keeps it searchable
				for as long as you choose to keep it.
			</p>
		</div>

		<div
			class="dark relative mt-16 overflow-hidden rounded-3xl bg-background text-foreground shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)]"
		>
			<!-- Ambient wash, mixed from the theme token -->
			<div
				class="pointer-events-none absolute inset-0"
				style="background: radial-gradient(60% 45% at 50% 0%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 70%);"
				aria-hidden="true"
			></div>

			<!-- Infinite retention: the same ten-year search as the SIEM page -->
			<div
				class="relative grid grid-cols-1 items-center gap-10 border-b border-border px-5 py-10 md:px-11 md:py-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14"
			>
				<HistorySearchCard />

				<div>
					<div class="flex items-center gap-3">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
						>
							<InfinityIcon class="h-5 w-5" stroke-width={1.75} aria-hidden="true" />
						</span>
						<h3
							class="text-[clamp(1.375rem,2.2vw,1.625rem)] leading-[1.2] font-bold tracking-[-0.02em]"
						>
							Infinite retention
						</h3>
					</div>
					<p class="mt-4 text-[15.5px] leading-[1.65] text-foreground/70">
						Keep every query, login, and permission change for as long as you need. Years of
						database activity stay searchable, with no archiving, no rehydration, and nothing aging
						out.
					</p>
				</div>
			</div>

			<!-- Your data never leaves your object storage: copy left, bucket right (bucket first when stacked) -->
			<div
				class="relative grid grid-cols-1 items-center gap-10 px-5 py-10 md:px-11 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14"
			>
				<div
					class="owned-storage rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-5 lg:order-2"
					data-effects-loop
					aria-hidden="true"
				>
					<div
						class="flex items-center justify-between text-[10.5px] font-bold tracking-[0.11em] uppercase"
					>
						<span>Your object storage</span>
						<span class="flex items-center gap-1.5 text-primary">
							<LockKeyhole class="h-3.5 w-3.5" />
							Stays here
						</span>
					</div>
					<div
						class="mt-3.5 overflow-x-auto rounded-xl border border-border bg-card px-4 py-3 font-mono text-[12px] leading-[1.9]"
					>
						<div>your-bucket/rover-dam/</div>
						<div class="pl-4 text-muted-foreground">├ activity/2016/01/…</div>
						<div class="pl-4 text-muted-foreground">├ activity/2026/10/…</div>
						<div class="pl-4 text-muted-foreground">└ index/…</div>
					</div>
					<div class="mt-3.5 flex items-center gap-2 text-[11.5px]">
						<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
						Rover queries it in place. Nothing is copied out.
					</div>
				</div>

				<div class="lg:order-1">
					<div class="flex items-center gap-3">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
						>
							<LockKeyhole class="h-5 w-5" stroke-width={1.75} aria-hidden="true" />
						</span>
						<h3
							class="text-[clamp(1.375rem,2.2vw,1.625rem)] leading-[1.2] font-bold tracking-[-0.02em]"
						>
							Your data never leaves your object storage
						</h3>
					</div>
					<p class="mt-4 text-[15.5px] leading-[1.65] text-foreground/70">
						Activity records and indexes live in your own object storage. Rover queries them in
						place, so ownership, access, and residency of every record stay with you.
					</p>
				</div>
			</div>

			<!-- Supporting points -->
			<div class="relative grid grid-cols-1 border-t border-border md:grid-cols-3">
				{#each extras as item, i (item.title)}
					<div
						class="supporting-point border-border px-5 py-8 md:px-11 {i > 0
							? 'border-t md:border-t-0 md:border-l'
							: ''}"
					>
						<item.icon class="h-5 w-5 text-primary" stroke-width={1.75} aria-hidden="true" />
						<h3 class="mt-4 text-[17px] leading-[1.3] font-bold tracking-[-0.01em]">
							{item.title}
						</h3>
						<p class="mt-1.5 text-[14px] leading-[1.6] text-foreground/70">{item.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.owned-storage {
		position: relative;
	}
	.owned-storage::after {
		content: '';
		position: absolute;
		inset: -1px;
		border: 1px solid color-mix(in oklab, var(--primary) 55%, transparent);
		border-radius: inherit;
		opacity: 0;
		pointer-events: none;
		animation: storage-ring 3s ease-out infinite;
	}
	@keyframes storage-ring {
		from {
			opacity: 0.65;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(1.08, 1.16);
		}
	}
	.supporting-point {
		transition: background-color 0.3s ease;
	}
	.supporting-point:hover {
		background-color: color-mix(in oklab, var(--primary) 4%, var(--background));
	}
	@media (prefers-reduced-motion: reduce) {
		.owned-storage::after {
			animation: none;
		}
		.supporting-point {
			transition-duration: 0.01ms;
		}
	}
</style>
