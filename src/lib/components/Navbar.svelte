<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import '@fontsource/mitr/400.css';
	import { page } from '$app/stores';

	let scrollY = $state(0);
</script>

<svelte:window bind:scrollY />

<nav
	class="dark sticky top-0 z-50 w-full border-b transition-all duration-300 {scrollY > 20
		? 'bg-background/85 border-white/10 shadow-sm backdrop-blur-md'
		: 'bg-background border-transparent'}"
	aria-label="Main navigation"
>
	<div
		class="container mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 {scrollY >
		20
			? 'h-16'
			: 'h-20'}"
	>
		<a
			href="/"
			class="text-foreground flex items-center gap-2 transition-opacity hover:opacity-90"
			aria-label="Rover home"
		>
			<img src="/rover-logo.png" alt="Rover Logo" class="h-5 w-auto" />
			<span
				class="text-foreground text-2xl leading-none tracking-[0px]"
				style="font-family: 'Mitr', sans-serif;"
			>
				ROVER
			</span>
		</a>

		<div
			class="hidden items-center gap-8 text-[11px] font-bold tracking-widest text-zinc-300 uppercase lg:flex"
			aria-label="Page sections"
		>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#hero-preview"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>SIEM</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#big-idea"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>Search</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#capabilities"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>Analytics</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#architecture"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>Architecture</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#ai-soc"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>AI SOC</a
			>
			<a
				href="/blogs/"
				class="hover:text-primary hover:border-primary border-b pb-0.5 transition-all {$page.url.pathname.startsWith(
					'/blogs'
				)
					? 'text-primary border-primary'
					: 'border-transparent'}">Blogs</a
			>
		</div>

		<div class="flex items-center gap-4">
			<Button
				size="sm"
				href="{$page.url.pathname === '/' ? '' : '/'}#early-access"
				class="bg-primary hover:bg-primary/90 rounded-full px-5 font-sans text-[11px] font-bold tracking-wide text-zinc-950 uppercase"
			>
				Book a Demo
			</Button>

			<!-- Mobile Hamburger Menu -->
			<button
				class="flex items-center justify-center p-1 text-zinc-400 hover:text-white lg:hidden"
				aria-label="Open menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="4" y1="12" x2="20" y2="12"></line>
					<line x1="4" y1="6" x2="20" y2="6"></line>
					<line x1="4" y1="18" x2="20" y2="18"></line>
				</svg>
			</button>
		</div>
	</div>
</nav>
