<script lang="ts">
	import { comparisons } from '$lib/comparisons';
	import { Button } from '$lib/components/ui/button';
	import '@fontsource/mitr/400.css';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { scrollProgress } from '$lib/effects';

	type DesktopMenu = 'products' | 'resources';
	let scrollY = $state(0);
	let mobileMenuOpen = $state(false);
	let activeMenu = $state<DesktopMenu | null>(null);
	let mobilePlatformOpen = $state(false);
	let mobileResourcesOpen = $state(false);
	let navElement: HTMLElement | undefined = $state();
	let productsGroup: HTMLDivElement | undefined = $state();
	let resourcesGroup: HTMLDivElement | undefined = $state();
	let mobileToggle: HTMLButtonElement | undefined = $state();
	let menuPinned = false;
	let hoveredMenu: DesktopMenu | null = null;
	let suppressedHover: DesktopMenu | null = null;
	let openTimer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const onDam = $derived($page.url.pathname.startsWith('/database-activity-monitoring/'));
	const onSiem = $derived($page.url.pathname === '/siem/');
	const onLake = $derived($page.url.pathname === '/security-data-lake/');
	const globalSections = [{ label: 'Our approach', hash: '#why-rover' }];

	/* Same-page anchors stay bare so the browser scrolls instead of navigating. */
	function sectionHref(path: string, hash: string) {
		return $page.url.pathname === path ? hash : `${path}${hash}`;
	}

	const platforms = $derived([
		{
			label: 'Security Data Lake',
			note: 'Search & retention in your storage',
			href: sectionHref('/security-data-lake/', '#security-data-lake'),
			current: onLake
		},
		{
			label: 'SIEM',
			note: 'Security data lake & search',
			href: sectionHref('/siem/', '#siem'),
			current: onSiem
		},
		{
			label: 'DAM',
			note: 'Database activity monitoring',
			href: onDam ? '#database-activity-monitoring' : '/database-activity-monitoring/',
			current: onDam
		}
	]);

	function clearTimers() {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
		openTimer = undefined;
		closeTimer = undefined;
	}

	function menuGroup(menu: DesktopMenu) {
		return menu === 'products' ? productsGroup : resourcesGroup;
	}

	function closeDesktop(suppressHover = false) {
		clearTimers();
		if (suppressHover) suppressedHover = hoveredMenu;
		activeMenu = null;
		menuPinned = false;
	}

	function closeMenu() {
		closeDesktop();
		mobileMenuOpen = false;
		mobilePlatformOpen = false;
		mobileResourcesOpen = false;
	}

	async function openDesktop(menu: DesktopMenu, pinned = false) {
		clearTimers();
		activeMenu = menu;
		menuPinned = pinned;
		await tick();
		if (activeMenu !== menu) return;
		const group = menuGroup(menu);
		const scrollArea = group?.querySelector<HTMLDivElement>('[data-menu-panel] > div');
		if (scrollArea) scrollArea.scrollTop = 0;
		if (pinned && menuPinned) {
			group?.querySelector<HTMLAnchorElement>('[data-menu-panel] a')?.focus();
		}
	}

	function toggleDesktop(menu: DesktopMenu) {
		// A click pins a hover-open dropdown; a second click closes it.
		if (activeMenu === menu && menuPinned) closeDesktop(true);
		else void openDesktop(menu, true);
	}

	function enterMenu(menu: DesktopMenu, event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		hoveredMenu = menu;
		clearTimeout(closeTimer);
		if (activeMenu === menu || suppressedHover === menu) return;
		clearTimeout(openTimer);
		openTimer = setTimeout(() => {
			if (hoveredMenu === menu) void openDesktop(menu);
		}, 100);
	}

	function leaveMenu(menu: DesktopMenu, event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		if (hoveredMenu === menu) hoveredMenu = null;
		if (suppressedHover === menu) suppressedHover = null;
		clearTimeout(openTimer);
		if (activeMenu !== menu || menuPinned || menuGroup(menu)?.contains(document.activeElement))
			return;
		// The panel's transparent bridge covers the gap; this grace period also allows diagonal travel.
		closeTimer = setTimeout(() => {
			if (activeMenu === menu && !menuPinned && hoveredMenu !== menu) closeDesktop();
		}, 300);
	}

	function focusInMenu(menu: DesktopMenu, event: FocusEvent) {
		if (activeMenu !== menu) return;
		clearTimeout(closeTimer);
		if (event.target instanceof HTMLAnchorElement) menuPinned = true;
	}

	function focusOutMenu(menu: DesktopMenu, event: FocusEvent) {
		if (event.relatedTarget instanceof Node && menuGroup(menu)?.contains(event.relatedTarget))
			return;
		if (activeMenu === menu) closeDesktop();
	}

	function outsidePointer(event: PointerEvent) {
		if (!(event.target instanceof Node)) return;
		if (activeMenu && !menuGroup(activeMenu)?.contains(event.target)) closeDesktop();
		if (mobileMenuOpen && !navElement?.contains(event.target)) closeMenu();
	}

	function escapeMenu(event: KeyboardEvent) {
		if (event.key !== 'Escape' || event.defaultPrevented) return;
		if (activeMenu) {
			const group = menuGroup(activeMenu);
			const restoreFocus = group?.contains(document.activeElement);
			closeDesktop(true);
			if (restoreFocus) {
				event.preventDefault();
				group
					?.querySelector<HTMLButtonElement>('[data-menu-trigger]')
					?.focus({ preventScroll: true });
			}
		} else if (mobileMenuOpen) {
			event.preventDefault();
			closeMenu();
			mobileToggle?.focus({ preventScroll: true });
		}
	}

	onMount(() => {
		const desktop = matchMedia('(min-width: 1280px)');
		desktop.addEventListener('change', closeMenu);
		return () => {
			clearTimers();
			desktop.removeEventListener('change', closeMenu);
		};
	});

	afterNavigate(closeMenu);
</script>

<svelte:window bind:scrollY />
<svelte:document onpointerdown={outsidePointer} onkeydown={escapeMenu} />

{#snippet platformLinks()}
	<section aria-label="Products">
		<div class="px-3 pt-2 pb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
			Products
		</div>
		{#each platforms as platform (platform.label)}
			<a
				href={platform.href}
				aria-current={platform.current ? 'page' : undefined}
				class="flex min-h-11 items-center justify-between gap-6 rounded-lg px-3 py-2 tracking-normal normal-case transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none {platform.current
					? 'text-primary'
					: 'text-zinc-200'}"
				onclick={closeMenu}
			>
				<span class="flex flex-col gap-0.5">
					<span class="text-sm font-semibold">{platform.label}</span>
					<span class="text-xs font-medium text-zinc-400">{platform.note}</span>
				</span>
			</a>
		{/each}
	</section>
{/snippet}

{#snippet resourceLinks()}
	<section aria-label="Comparison">
		<div class="px-3 pt-2 pb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
			Comparison
		</div>
		{#each comparisons as comparison (comparison.slug)}
			<a
				href={comparison.pagePath}
				aria-current={$page.url.pathname === comparison.pagePath ? 'page' : undefined}
				class="flex min-h-11 items-center justify-between gap-8 rounded-lg px-3 text-sm font-semibold tracking-normal text-zinc-200 normal-case transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
				onclick={closeMenu}
			>
				{comparison.navLabel}
			</a>
		{/each}
	</section>
{/snippet}

<div class="sticky top-0 z-50">
	<div class="nav-scroll-progress" use:scrollProgress aria-hidden="true"></div>
	<nav
		bind:this={navElement}
		class="dark w-full border-b transition-all duration-300 {scrollY > 20
			? 'border-white/10 bg-background/85 shadow-sm backdrop-blur-[18px] backdrop-saturate-[1.4]'
			: 'border-transparent bg-background'}"
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
				class="flex items-center gap-2 text-foreground transition-opacity hover:opacity-90"
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
					class="text-2xl leading-none tracking-[0px] text-foreground"
					style="font-family: 'Mitr', sans-serif;"
				>
					ROVER
				</span>
			</a>

			<div
				class="nav-effect-links hidden items-center gap-6 text-[11px] font-bold tracking-widest text-zinc-300 uppercase xl:flex 2xl:gap-8"
				aria-label="Site links"
			>
				<a
					href="/"
					aria-current={$page.url.pathname === '/' ? 'page' : undefined}
					class="flex min-h-11 items-center border-b transition-all hover:border-primary hover:text-primary {$page
						.url.pathname === '/'
						? 'border-primary text-primary'
						: 'border-transparent'}"
					onclick={closeMenu}>Home</a
				>
				<div
					bind:this={productsGroup}
					role="group"
					class="relative"
					onpointerenter={(event) => enterMenu('products', event)}
					onpointerleave={(event) => leaveMenu('products', event)}
					onfocusin={(event) => focusInMenu('products', event)}
					onfocusout={(event) => focusOutMenu('products', event)}
				>
					<button
						type="button"
						data-menu-trigger="products"
						aria-expanded={activeMenu === 'products'}
						aria-controls="main-nav-products"
						onclick={() => toggleDesktop('products')}
						class="flex min-h-11 items-center gap-1.5 border-b border-transparent uppercase transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
					>
						Products
					</button>
					<div
						id="main-nav-products"
						class:nav-dropdown={activeMenu === 'products'}
						data-menu-panel
						hidden={activeMenu !== 'products'}
						aria-label="Products"
						class="absolute top-[calc(100%+12px)] left-0 z-50 w-64 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
					>
						<div
							class="max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border border-white/10 bg-background p-2 shadow-xl outline-none"
						>
							{@render platformLinks()}
						</div>
					</div>
				</div>
				{#each globalSections as section (section.hash)}
					<a
						href={sectionHref('/', section.hash)}
						class="flex min-h-11 items-center border-b border-transparent transition-all hover:border-primary hover:text-primary"
						>{section.label}</a
					>
				{/each}
				<a
					href="/blogs/"
					class="flex min-h-11 items-center border-b transition-all hover:border-primary hover:text-primary {$page.url.pathname.startsWith(
						'/blogs'
					)
						? 'border-primary text-primary'
						: 'border-transparent'}">Blogs</a
				>
				<div
					bind:this={resourcesGroup}
					role="group"
					class="relative"
					onpointerenter={(event) => enterMenu('resources', event)}
					onpointerleave={(event) => leaveMenu('resources', event)}
					onfocusin={(event) => focusInMenu('resources', event)}
					onfocusout={(event) => focusOutMenu('resources', event)}
				>
					<button
						type="button"
						data-menu-trigger="resources"
						aria-expanded={activeMenu === 'resources'}
						aria-controls="main-nav-resources"
						onclick={() => toggleDesktop('resources')}
						class="flex min-h-11 items-center gap-1.5 border-b border-transparent uppercase transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
					>
						Resources
					</button>
					<div
						id="main-nav-resources"
						class:nav-dropdown={activeMenu === 'resources'}
						data-menu-panel
						hidden={activeMenu !== 'resources'}
						aria-label="Resources"
						class="absolute top-[calc(100%+12px)] left-0 z-50 w-56 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
					>
						<div
							class="max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border border-white/10 bg-background p-2 shadow-xl outline-none"
						>
							{@render resourceLinks()}
						</div>
					</div>
				</div>
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
					href={sectionHref('/', '#get-demo')}
					class="hidden h-11 rounded-full bg-primary px-4 font-sans text-[11px] font-bold tracking-wide uppercase hover:bg-primary/90 min-[360px]:inline-flex sm:px-6 lg:px-8"
				>
					Contact Us
				</Button>

				<!-- Mobile Hamburger Menu Toggle -->
				<button
					bind:this={mobileToggle}
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-1 text-zinc-300 hover:bg-white/10 hover:text-white xl:hidden"
					aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={mobileMenuOpen}
					aria-controls="mobile-nav-drawer"
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
		<div
			id="mobile-nav-drawer"
			hidden={!mobileMenuOpen}
			class="overflow-y-auto border-b border-white/10 bg-background/95 px-6 pt-4 pb-8 backdrop-blur-xl xl:hidden"
			style:max-height="calc(100dvh - 5rem)"
		>
			<div class="flex flex-col gap-4 text-sm font-bold tracking-widest text-zinc-300 uppercase">
				<a
					href="/"
					aria-current={$page.url.pathname === '/' ? 'page' : undefined}
					class="flex min-h-11 items-center border-b border-white/5 transition-all hover:text-primary {$page
						.url.pathname === '/'
						? 'text-primary'
						: ''}"
					onclick={closeMenu}>Home</a
				>
				<div>
					<button
						type="button"
						data-mobile-section="products"
						aria-expanded={mobilePlatformOpen}
						aria-controls="mobile-nav-products"
						onclick={() => (mobilePlatformOpen = !mobilePlatformOpen)}
						class="flex min-h-11 w-full items-center justify-between border-b border-white/5 text-left uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
					>
						Products
					</button>
					<div
						id="mobile-nav-products"
						hidden={!mobilePlatformOpen}
						class="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-2"
					>
						{@render platformLinks()}
					</div>
				</div>
				{#each globalSections as section (section.hash)}
					<a
						href={sectionHref('/', section.hash)}
						class="flex min-h-11 items-center border-b border-white/5 transition-all hover:text-primary"
						onclick={closeMenu}>{section.label}</a
					>
				{/each}
				<a
					href="/blogs/"
					class="flex min-h-11 items-center border-b border-white/5 transition-all hover:text-primary {$page.url.pathname.startsWith(
						'/blogs'
					)
						? 'text-primary'
						: ''}"
					onclick={closeMenu}>Blogs</a
				>
				<div>
					<button
						type="button"
						data-mobile-section="resources"
						aria-expanded={mobileResourcesOpen}
						aria-controls="mobile-nav-resources"
						onclick={() => (mobileResourcesOpen = !mobileResourcesOpen)}
						class="flex min-h-11 w-full items-center justify-between border-b border-white/5 text-left uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
					>
						Resources
					</button>
					<div
						id="mobile-nav-resources"
						hidden={!mobileResourcesOpen}
						class="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-2"
					>
						{@render resourceLinks()}
					</div>
				</div>
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
						href={sectionHref('/', '#get-demo')}
						class="h-11 w-full rounded-full bg-primary font-sans text-xs font-bold tracking-wide uppercase hover:bg-primary/90"
						onclick={closeMenu}
					>
						Contact Us
					</Button>
				</div>
			</div>
		</div>
	</nav>
</div>

<style>
	.nav-scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		z-index: 90;
		pointer-events: none;
		background: var(--primary);
		transform: scaleX(var(--scroll-progress, 0));
		transform-origin: left;
	}
	.nav-effect-links > a,
	.nav-effect-links :global([data-menu-trigger]) {
		position: relative;
	}
	.nav-effect-links > a::after,
	.nav-effect-links :global([data-menu-trigger])::after {
		content: '';
		position: absolute;
		inset: auto 0 -1px;
		height: 2px;
		background: var(--primary);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 300ms;
	}
	.nav-effect-links > a:hover::after,
	.nav-effect-links :global([data-menu-trigger]:hover)::after,
	.nav-effect-links :global([data-menu-trigger]:focus-visible)::after {
		transform: scaleX(1);
	}
	.nav-dropdown > div {
		animation: dropdown-enter 250ms ease-out both;
		backdrop-filter: blur(16px);
	}
	@keyframes dropdown-enter {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.nav-dropdown > div {
			animation: none;
		}
		.nav-effect-links > a::after,
		.nav-effect-links :global([data-menu-trigger])::after {
			transition: none;
		}
	}
</style>
