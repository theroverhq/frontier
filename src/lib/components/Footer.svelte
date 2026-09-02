<script lang="ts">
	import { page } from '$app/stores';
	import '@fontsource/mitr/400.css';

	const home = $derived($page.url.pathname === '/' ? '' : '/');

	const product = [
		{ label: 'SIEM', hash: '#hero-preview' },
		{ label: 'Search', hash: '#big-idea' },
		{ label: 'Architecture', hash: '#architecture' },
		{ label: 'AI Context Engine', hash: '#ai-soc' },
		{ label: 'Pricing', hash: '#economics' }
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
						<mask id="instagram-mask">
							<rect width="24" height="24" fill="white" />
							<path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" fill="black" transform="translate(1.5, 1.5) scale(0.875)" />
						</mask>
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5z" mask="url(#instagram-mask)" />
					</svg>
				</a>
				<a
					href="https://x.com/roverhq_ai"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Rover on X"
					class="group"
				>
					<svg
						viewBox="0 0 24 24"
						class="fill-muted-foreground group-hover:fill-foreground h-[18px] w-[18px] transition-colors"
						aria-hidden="true"
					>
						<mask id="x-mask">
							<rect width="24" height="24" fill="white" />
							<path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" fill="black" transform="translate(4.5, 4.5) scale(0.625)" />
						</mask>
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5z" mask="url(#x-mask)" />
					</svg>
				</a>
				<a href="#top" onclick={toTop} class="hover:text-foreground transition-colors">
					Back to top
				</a>
			</div>
		</div>
	</div>
</footer>
