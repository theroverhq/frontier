<script lang="ts">
	import { page } from '$app/stores';
	import '@fontsource/mitr/400.css';

	const home = $derived($page.url.pathname === '/' ? '' : '/');

	const product = [
		{ label: 'Search', hash: '#big-idea' },
		{ label: 'Analytics', hash: '#capabilities' },
		{ label: 'Architecture', hash: '#architecture' },
		{ label: 'AI SOC', hash: '#ai-soc' }
	];

	function toTop(event: MouseEvent) {
		event.preventDefault();
		const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
		window.scrollTo({ top: 0, behavior });
	}
</script>

<footer class="dark bg-background text-foreground border-border relative overflow-hidden border-t">
	<div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
		<div
			class="relative z-2 grid grid-cols-1 gap-10 pt-16 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
		>
			<!-- Brand -->
			<div>
				<a
					href="{home}/"
					class="flex items-center gap-2 transition-opacity hover:opacity-90"
					aria-label="Rover home"
				>
					<img src="/rover-logo.png" alt="" class="h-5 w-auto" />
					<span
						class="text-2xl leading-none tracking-widest"
						style="font-family: 'Mitr', sans-serif;">ROVER</span
					>
				</a>
				<div class="text-muted-foreground mt-3.5 text-[13.5px]">
					Cold Storage. <span class="text-primary">Hot Intelligence.</span>
				</div>
				<a
					href="mailto:contactus@roverhq.ai"
					class="text-foreground/85 hover:text-foreground mt-4 flex items-center gap-2.5 text-sm transition-colors"
				>
					<svg
						viewBox="0 0 24 24"
						class="stroke-muted-foreground h-4 w-4 fill-none"
						stroke-width="1.6"
						aria-hidden="true"
					>
						<rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
					</svg>
					contactus@roverhq.ai
				</a>
			</div>

			<div>
				<h5 class="text-muted-foreground mb-4 text-[13px] font-semibold">Product</h5>
				{#each product as item (item.label)}
					<a
						href="{home}{item.hash}"
						class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
						>{item.label}</a
					>
				{/each}
			</div>

			<div>
				<h5 class="text-muted-foreground mb-4 text-[13px] font-semibold">Company</h5>
				<a
					href="/blogs/"
					class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
					>Blogs</a
				>
				<a
					href="mailto:contactus@roverhq.ai"
					class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
					>Contact</a
				>
				<a
					href="mailto:contactus@roverhq.ai?subject=Careers%20at%20Rover"
					class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
					>Career</a
				>
			</div>

			<div>
				<h5 class="text-muted-foreground mb-4 text-[13px] font-semibold">Legal</h5>
				<a
					href="/privacy/"
					class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
					>Privacy</a
				>
				<a
					href="/terms/"
					class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
					>Terms</a
				>
			</div>
		</div>

		<!-- Oversized wordmark, sunk just above the base colour -->
		<div
			class="pointer-events-none absolute bottom-[-11%] left-1/2 z-1 max-w-screen -translate-x-1/2 overflow-hidden text-[clamp(90px,21vw,300px)] leading-[0.8] font-bold tracking-[0.02em] whitespace-nowrap select-none"
			style="color: color-mix(in oklab, var(--foreground) 5%, var(--background));"
			aria-hidden="true"
		>
			ROVER
		</div>

		<div
			class="border-border text-muted-foreground relative z-2 flex flex-wrap items-center justify-between gap-4 border-t pt-5 pb-6 text-[12.5px]"
		>
			<span>&copy; 2026 Rover HQ Inc. All rights reserved.</span>
			<div class="flex items-center gap-5">
				<a
					href="https://www.linkedin.com/company/rover-hq-ai/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Rover on LinkedIn"
					class="group"
				>
					<svg
						viewBox="0 0 24 24"
						class="fill-muted-foreground group-hover:fill-foreground h-[18px] w-[18px] transition-colors"
						aria-hidden="true"
					>
						<path
							d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8.16h4.56V23H.22V8.16Zm7.32 0h4.37v2.02h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7v8.2h-4.55v-7.27c0-1.73-.03-3.96-2.41-3.96-2.42 0-2.79 1.89-2.79 3.84V23H7.54V8.16Z"
						/>
					</svg>
				</a>
				<a href="#top" onclick={toTop} class="hover:text-foreground transition-colors">
					Back to top
				</a>
			</div>
		</div>
	</div>
</footer>
