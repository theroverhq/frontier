<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import '@fontsource/mitr/400.css';
	import { page } from '$app/stores';

	let scrollY = $state(0);
	let mobileMenuOpen = $state(false);

	function closeMenu() {
		mobileMenuOpen = false;
	}
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
			onclick={closeMenu}
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
				href="{$page.url.pathname === '/' ? '' : '/'}#architecture"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>Architecture</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#economics"
				class="hover:text-primary hover:border-primary border-b border-transparent pb-0.5 transition-all"
				>Pricing</a
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

		<div class="flex items-center gap-2 sm:gap-4">
			<Button
				variant="secondary"
				size="sm"
				href="{$page.url.pathname === '/' ? '' : '/'}#early-access"
				class="hidden rounded-full px-4 font-sans text-[11px] font-bold uppercase sm:inline-flex md:px-6 lg:px-8"
			>
				Get Demo
			</Button>
			<Button
				size="sm"
				href="{$page.url.pathname === '/' ? '' : '/'}#early-access"
				class="bg-primary hover:bg-primary/90 rounded-full px-4 font-sans text-[11px] font-bold tracking-wide uppercase sm:px-6 lg:px-8"
			>
				Contact Us
			</Button>

			<!-- Mobile Hamburger Menu Toggle -->
			<button
				class="flex h-10 w-10 items-center justify-center rounded-lg p-1 text-zinc-300 hover:bg-white/10 hover:text-white lg:hidden"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				{#if mobileMenuOpen}
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
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				{:else}
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
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile Menu Overlay / Drawer -->
	{#if mobileMenuOpen}
		<div
			class="bg-background/95 border-b border-white/10 px-6 pt-4 pb-8 backdrop-blur-xl lg:hidden"
		>
			<div class="flex flex-col gap-4 text-sm font-bold tracking-widest text-zinc-300 uppercase">
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#hero-preview"
					class="hover:text-primary border-b border-white/5 py-2 transition-all"
					onclick={closeMenu}>SIEM</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#big-idea"
					class="hover:text-primary border-b border-white/5 py-2 transition-all"
					onclick={closeMenu}>Search</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#architecture"
					class="hover:text-primary border-b border-white/5 py-2 transition-all"
					onclick={closeMenu}>Architecture</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#economics"
					class="hover:text-primary border-b border-white/5 py-2 transition-all"
					onclick={closeMenu}>Pricing</a
				>
				<a
					href="/blogs/"
					class="hover:text-primary border-b border-white/5 py-2 transition-all {$page.url.pathname.startsWith(
						'/blogs'
					)
						? 'text-primary'
						: ''}"
					onclick={closeMenu}>Blogs</a
				>
				<div class="mt-4 flex flex-col gap-3 pt-2">
					<Button
						variant="secondary"
						size="lg"
						href="{$page.url.pathname === '/' ? '' : '/'}#early-access"
						class="w-full rounded-full font-sans text-xs font-bold uppercase"
						onclick={closeMenu}
					>
						Get Demo
					</Button>
					<Button
						size="lg"
						href="{$page.url.pathname === '/' ? '' : '/'}#early-access"
						class="bg-primary hover:bg-primary/90 w-full rounded-full font-sans text-xs font-bold tracking-wide uppercase"
						onclick={closeMenu}
					>
						Contact Us
					</Button>
				</div>
			</div>
		</div>
	{/if}
</nav>
