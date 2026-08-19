<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import '@fontsource/mitr/400.css';
	import { page } from '$app/stores';

	let scrollY = 0;
</script>

<svelte:window bind:scrollY />

<nav
	class="dark sticky top-0 z-50 w-full transition-all duration-300 border-b {scrollY > 20
		? 'bg-background/85 backdrop-blur-md border-white/10 shadow-sm'
		: 'bg-background border-transparent'}"
	aria-label="Main navigation"
>
	<div
		class="container mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-300 {scrollY >
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
				class="text-foreground text-2xl leading-none tracking-widest"
				style="font-family: 'Mitr', sans-serif;"
			>
				ROVER
			</span>
		</a>

		<div
			class="hidden lg:flex items-center gap-8 font-mono text-[11px] font-bold tracking-widest uppercase text-zinc-300"
			aria-label="Page sections"
		>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#hero-preview"
				class="border-b border-transparent transition-all hover:text-primary hover:border-primary pb-0.5"
				>SIEM</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#big-idea"
				class="border-b border-transparent transition-all hover:text-primary hover:border-primary pb-0.5"
				>Search</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#capabilities"
				class="border-b border-transparent transition-all hover:text-primary hover:border-primary pb-0.5"
				>Analytics</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#ai-soc"
				class="border-b border-transparent transition-all hover:text-primary hover:border-primary pb-0.5"
				>AI SOC</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#architecture"
				class="border-b border-transparent transition-all hover:text-primary hover:border-primary pb-0.5"
				>Architecture</a
			>
			<a
				href="/blogs/"
				class="border-b transition-all hover:text-primary hover:border-primary pb-0.5 {$page.url.pathname.startsWith('/blogs') ? 'text-primary border-primary' : 'border-transparent'}"
				>Blogs</a
			>
		</div>

		<div class="flex items-center gap-4">
			<Button
				variant="ghost"
				size="sm"
				href="{$page.url.pathname === '/' ? '' : '/'}#hero-preview"
				class="hidden md:flex text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
			>
				See Rover in Action
			</Button>
			<Button
				size="sm"
				href="{$page.url.pathname === '/' ? '' : '/'}#early-access"
				class="bg-primary text-zinc-950 hover:bg-primary/90 text-[11px] font-bold tracking-wide rounded-full px-5 uppercase font-mono"
			>
				Book a Demo
			</Button>

			<!-- Mobile Hamburger Menu -->
			<button class="flex items-center justify-center p-1 text-zinc-400 hover:text-white lg:hidden">
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
