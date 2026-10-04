<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import '@fontsource/mitr/400.css';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { ChevronDown, ArrowRight } from '@lucide/svelte';
	import { Collapsible, Popover } from 'bits-ui';

	let scrollY = $state(0);
	let mobileMenuOpen = $state(false);
	let resourcesMenuOpen = $state(false);
	let mobileResourcesOpen = $state(false);

	function closeMenu() {
		mobileMenuOpen = false;
		resourcesMenuOpen = false;
		mobileResourcesOpen = false;
	}

	afterNavigate(closeMenu);
</script>

<svelte:window bind:scrollY />

{#snippet resourceLinks()}
	<section aria-label="Comparison">
		<div class="px-3 pt-2 pb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
			Comparison
		</div>
		<a
			href="/resources/comparison/splunk/"
			aria-current={$page.url.pathname === '/resources/comparison/splunk/' ? 'page' : undefined}
			class="hover:text-primary focus-visible:ring-primary flex min-h-11 items-center justify-between gap-8 rounded-lg px-3 text-sm font-semibold tracking-normal text-zinc-200 normal-case transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
			onclick={closeMenu}
		>
			Splunk
			<ArrowRight class="h-4 w-4" aria-hidden="true" />
		</a>
	</section>
{/snippet}

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
			<img
				src="/rover-logo-64.png"
				alt="Rover Logo"
				class="h-5 w-auto"
				width="20"
				height="20"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
			<span
				class="text-foreground text-2xl leading-none tracking-[0px]"
				style="font-family: 'Mitr', sans-serif;"
			>
				ROVER
			</span>
		</a>

		<div
			class="hidden items-center gap-6 text-[11px] font-bold tracking-widest text-zinc-300 uppercase xl:flex 2xl:gap-8"
			aria-label="Page sections"
		>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#hero-preview"
				class="hover:text-primary hover:border-primary flex min-h-11 items-center border-b border-transparent transition-all"
				>SIEM</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#big-idea"
				class="hover:text-primary hover:border-primary flex min-h-11 items-center border-b border-transparent transition-all"
				>Search</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#architecture"
				class="hover:text-primary hover:border-primary flex min-h-11 items-center border-b border-transparent transition-all"
				>Architecture</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#ai-soc"
				class="hover:text-primary hover:border-primary flex min-h-11 items-center border-b border-transparent transition-all"
				>AI Context Engine</a
			>
			<a
				href="{$page.url.pathname === '/' ? '' : '/'}#economics"
				class="hover:text-primary hover:border-primary flex min-h-11 items-center border-b border-transparent transition-all"
				>Pricing</a
			>
			<a
				href="/blogs/"
				class="hover:text-primary hover:border-primary flex min-h-11 items-center border-b transition-all {$page.url.pathname.startsWith(
					'/blogs'
				)
					? 'text-primary border-primary'
					: 'border-transparent'}">Blogs</a
			>
			<Popover.Root bind:open={resourcesMenuOpen}>
				<Popover.Trigger
					openOnHover
					openDelay={100}
					class="hover:text-primary hover:border-primary focus-visible:ring-primary flex min-h-11 items-center gap-1.5 border-b border-transparent uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
				>
					Resources
					<ChevronDown
						class="h-3.5 w-3.5 transition-transform {resourcesMenuOpen ? 'rotate-180' : ''}"
						aria-hidden="true"
					/>
				</Popover.Trigger>
				<Popover.Content
					align="start"
					sideOffset={12}
					trapFocus={false}
					role="dialog"
					aria-label="Resources"
					class="bg-background z-50 w-56 rounded-xl border border-white/10 p-2 shadow-xl outline-none"
				>
					{@render resourceLinks()}
				</Popover.Content>
			</Popover.Root>
		</div>

		<div class="flex items-center gap-2 sm:gap-4">
			<Button
				variant="secondary"
				size="sm"
				href="mailto:contactus@roverhq.ai"
				class="hidden h-11 rounded-full px-4 font-sans text-[11px] font-bold uppercase sm:inline-flex md:px-6 lg:px-8"
			>
				Get Demo
			</Button>
			<Button
				size="sm"
				href="{$page.url.pathname === '/' ? '' : '/'}#get-demo"
				class="bg-primary hover:bg-primary/90 hidden h-11 rounded-full px-4 font-sans text-[11px] font-bold tracking-wide uppercase min-[360px]:inline-flex sm:px-6 lg:px-8"
			>
				Contact Us
			</Button>

			<!-- Mobile Hamburger Menu Toggle -->
			<button
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-1 text-zinc-300 hover:bg-white/10 hover:text-white xl:hidden"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				onclick={() => (mobileMenuOpen ? closeMenu() : (mobileMenuOpen = true))}
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
			class="bg-background/95 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-white/10 px-6 pt-4 pb-8 backdrop-blur-xl xl:hidden"
		>
			<div class="flex flex-col gap-4 text-sm font-bold tracking-widest text-zinc-300 uppercase">
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#hero-preview"
					class="hover:text-primary flex min-h-11 items-center border-b border-white/5 transition-all"
					onclick={closeMenu}>SIEM</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#big-idea"
					class="hover:text-primary flex min-h-11 items-center border-b border-white/5 transition-all"
					onclick={closeMenu}>Search</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#architecture"
					class="hover:text-primary flex min-h-11 items-center border-b border-white/5 transition-all"
					onclick={closeMenu}>Architecture</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#ai-soc"
					class="hover:text-primary flex min-h-11 items-center border-b border-white/5 transition-all"
					onclick={closeMenu}>AI Context Engine</a
				>
				<a
					href="{$page.url.pathname === '/' ? '' : '/'}#economics"
					class="hover:text-primary flex min-h-11 items-center border-b border-white/5 transition-all"
					onclick={closeMenu}>Pricing</a
				>
				<a
					href="/blogs/"
					class="hover:text-primary flex min-h-11 items-center border-b border-white/5 transition-all {$page.url.pathname.startsWith(
						'/blogs'
					)
						? 'text-primary'
						: ''}"
					onclick={closeMenu}>Blogs</a
				>
				<Collapsible.Root bind:open={mobileResourcesOpen}>
					<Collapsible.Trigger
						class="hover:text-primary focus-visible:ring-primary flex min-h-11 w-full items-center justify-between border-b border-white/5 text-left uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
					>
						Resources
						<ChevronDown
							class="h-4 w-4 transition-transform {mobileResourcesOpen ? 'rotate-180' : ''}"
							aria-hidden="true"
						/>
					</Collapsible.Trigger>
					<Collapsible.Content
						hiddenUntilFound={false}
						class="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-2"
					>
						{@render resourceLinks()}
					</Collapsible.Content>
				</Collapsible.Root>
				<div class="mt-4 flex flex-col gap-3 pt-2">
					<Button
						variant="secondary"
						size="lg"
						href="mailto:contactus@roverhq.ai"
						class="h-11 w-full rounded-full font-sans text-xs font-bold uppercase"
						onclick={closeMenu}
					>
						Get Demo
					</Button>
					<Button
						size="lg"
						href="{$page.url.pathname === '/' ? '' : '/'}#get-demo"
						class="bg-primary hover:bg-primary/90 h-11 w-full rounded-full font-sans text-xs font-bold tracking-wide uppercase"
						onclick={closeMenu}
					>
						Contact Us
					</Button>
				</div>
			</div>
		</div>
	{/if}
</nav>
