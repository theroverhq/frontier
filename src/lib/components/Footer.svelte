<script lang="ts">
	import { page } from '$app/stores';
	import '@fontsource/mitr/400.css';

	const home = $derived($page.url.pathname === '/' ? '' : '/');

	const product = [
		{ label: 'Search', hash: '#big-idea' },
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
				<div class=" mt-3.5 text-[13.5px]">
					Cold Storage. <span class="text-primary">Hot Intelligence.</span>
				</div>
				<a
					href="mailto:contactus@roverhq.ai"
					class="text-foreground/85 hover:text-foreground mt-4 flex items-center gap-1.5 text-sm transition-colors"
				>
					<svg
						viewBox="0 0 24 24"
						class="stroke-muted-foreground h-4 w-4 fill-none"
						stroke-width="1.6"
						aria-hidden="true"
					>
						<rect x="3" y="6" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
					</svg>
					contactus@roverhq.ai
				</a>
			</div>

			<div>
				<h5 class=" mb-4 text-[13px] font-semibold">Product</h5>
				{#each product as item (item.label)}
					<a
						href="{home}{item.hash}"
						class="text-foreground/80 hover:text-primary block py-1.5 text-[13.5px] transition-colors"
						>{item.label}</a
					>
				{/each}
			</div>

			<div>
				<h5 class=" mb-4 text-[13px] font-semibold">Company</h5>
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
				<h5 class=" mb-4 text-[13px] font-semibold">Legal</h5>
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
			class="border-border relative z-2 flex flex-wrap items-center justify-between gap-4 border-t pt-5 pb-6 text-[12.5px]"
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
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
					</svg>
				</a>
				<a
					href="https://www.facebook.com/profile.php?id=61593680348655"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Rover on Facebook"
					class="group"
				>
					<svg
						viewBox="0 0 24 24"
						class="fill-muted-foreground group-hover:fill-foreground h-[18px] w-[18px] transition-colors"
						aria-hidden="true"
					>
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-3 7h-1.924c-.615 0-1.076.252-1.076.889v1.111h3l-.239 3h-2.761v8h-3v-8h-2v-3h2v-1.923c0-2.022 1.064-3.077 3.461-3.077h2.539v3z" />
					</svg>
				</a>
				<a
					href="https://www.instagram.com/roverhq.ai/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Rover on Instagram"
					class="group"
				>
					<svg
						viewBox="0 0 24 24"
						class="fill-muted-foreground group-hover:fill-foreground h-[18px] w-[18px] transition-colors"
						aria-hidden="true"
					>
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-7 15.36c-1.855 0-3.36-1.505-3.36-3.36s1.505-3.36 3.36-3.36 3.36 1.505 3.36 3.36-1.505 3.36-3.36 3.36zm4.56-6.41c-.426 0-.771-.345-.771-.771s.345-.771.771-.771.771.345.771.771-.345.771-.771.771zm-4.56 1.01c-1.019 0-1.84.821-1.84 1.84s.821 1.84 1.84 1.84 1.84-.821 1.84-1.84-.821-1.84-1.84-1.84z" />
					</svg>
				</a>
				<a href="#top" onclick={toTop} class="hover:text-foreground transition-colors">
					Back to top
				</a>
			</div>
		</div>
	</div>
</footer>
