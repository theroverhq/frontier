/** Small, dependency-free effects applied after hydration. SSR content stays visible. */
export function pageEffects(root: HTMLElement) {
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const seen = new WeakSet<HTMLElement>();
	const reveals = new Set<HTMLElement>();
	const loops = new Set<HTMLElement>();
	let scanFrame = 0;

	const revealObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('effects-revealed');
				revealObserver.unobserve(entry.target);
				reveals.delete(entry.target as HTMLElement);
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
	);
	const loopObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			entry.target.classList.toggle('effects-in-view', entry.isIntersecting);
		}
	});

	function splitHeading(heading: HTMLElement) {
		// Dynamic article/comparison titles remain under Svelte's sole control.
		if (
			!['/', '/siem/', '/security-data-lake/', '/database-activity-monitoring/'].includes(
				location.pathname
			)
		)
			return;
		const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
		const textNodes: Text[] = [];
		while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
		let index = 0;
		for (const text of textNodes) {
			if (!text.textContent?.trim() || text.parentElement?.closest('svg')) continue;
			const fragment = document.createDocumentFragment();
			for (const part of text.textContent.split(/(\s+)/)) {
				if (!part) continue;
				if (!part.trim()) fragment.append(document.createTextNode(part));
				else {
					const word = document.createElement('span');
					word.className = 'effects-word';
					word.style.setProperty('--word-index', String(index++));
					word.textContent = part;
					fragment.append(word);
				}
			}
			text.replaceWith(fragment);
		}
		if (index) heading.classList.add('effects-words');
	}

	function scan() {
		scanFrame = 0;
		const targets = root.querySelectorAll<HTMLElement>(
			'h1, h2, [data-effects-reveal], [data-slot="badge"], section > .container > .text-center > p, .portfolio-card, .resource-card, .effect-card, .comparison-card, .capability-card, .blog-index article'
		);
		for (const target of targets) {
			if (
				seen.has(target) ||
				target.closest('aside, nav, .prose-rover, .comparison-copy, [data-effects-skip]')
			)
				continue;
			seen.add(target);
			if (!reduced.matches && target.matches('h1, h2')) splitHeading(target);
			target.classList.add('effects-reveal');
			if (reduced.matches) target.classList.add('effects-revealed');
			else {
				reveals.add(target);
				revealObserver.observe(target);
			}
		}
		for (const target of root.querySelectorAll<HTMLElement>('[data-effects-loop]')) {
			if (loops.has(target)) continue;
			loops.add(target);
			loopObserver.observe(target);
		}
		for (const target of loops) {
			if (root.contains(target)) continue;
			loopObserver.unobserve(target);
			loops.delete(target);
		}
		for (const target of reveals) {
			if (root.contains(target)) continue;
			revealObserver.unobserve(target);
			reveals.delete(target);
		}
	}
	function queueScan() {
		if (!scanFrame) scanFrame = requestAnimationFrame(scan);
	}
	function syncMotion() {
		root.classList.toggle('effects-paused', document.hidden || reduced.matches);
		if (reduced.matches) {
			for (const target of root.querySelectorAll('.effects-reveal'))
				target.classList.add('effects-revealed');
			revealObserver.disconnect();
			reveals.clear();
		}
	}
	const changes = new MutationObserver((entries) => {
		// Diagram particles and text playback need no new effect registration.
		if (
			entries.some(
				(entry) =>
					!(entry.target instanceof SVGElement) &&
					[...entry.addedNodes, ...entry.removedNodes].some(
						(node) => node instanceof HTMLElement && !node.classList.contains('effects-word')
					)
			)
		)
			queueScan();
	});
	changes.observe(root, { childList: true, subtree: true });
	reduced.addEventListener('change', syncMotion);
	document.addEventListener('visibilitychange', syncMotion);
	syncMotion();
	scan();
	return {
		destroy() {
			cancelAnimationFrame(scanFrame);
			changes.disconnect();
			revealObserver.disconnect();
			loopObserver.disconnect();
			reduced.removeEventListener('change', syncMotion);
			document.removeEventListener('visibilitychange', syncMotion);
		}
	};
}

export function scrollProgress(node: HTMLElement) {
	let frame = 0;
	function paint() {
		frame = 0;
		const extent = document.documentElement.scrollHeight - innerHeight;
		const progress = extent > 0 ? Math.min(1, Math.max(0, scrollY / extent)) : 0;
		node.style.setProperty('--scroll-progress', String(progress));
	}
	function queuePaint() {
		if (!frame) frame = requestAnimationFrame(paint);
	}
	const resize = new ResizeObserver(queuePaint);
	resize.observe(document.body);
	window.addEventListener('scroll', queuePaint, { passive: true });
	window.addEventListener('resize', queuePaint, { passive: true });
	paint();
	return {
		destroy() {
			cancelAnimationFrame(frame);
			resize.disconnect();
			window.removeEventListener('scroll', queuePaint);
			window.removeEventListener('resize', queuePaint);
		}
	};
}

/** Mouse glow and optional diagram tilt; touch and reduced-motion users get the static design. */
export function spotlight(node: HTMLElement, options: { tilt?: boolean } = {}) {
	const allowed = matchMedia(
		'(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)'
	);
	let frame = 0;
	let pointerX = 0;
	let pointerY = 0;
	function reset() {
		cancelAnimationFrame(frame);
		frame = 0;
		node.classList.remove('effects-pointer-active');
		node.style.removeProperty('--effects-tilt-x');
		node.style.removeProperty('--effects-tilt-y');
	}
	function move(event: PointerEvent) {
		if (!allowed.matches || event.pointerType !== 'mouse') return;
		pointerX = event.clientX;
		pointerY = event.clientY;
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			const bounds = node.getBoundingClientRect();
			const x = pointerX - bounds.left;
			const y = pointerY - bounds.top;
			node.style.setProperty('--effects-pointer-x', `${x}px`);
			node.style.setProperty('--effects-pointer-y', `${y}px`);
			if (options.tilt) {
				node.style.setProperty('--effects-tilt-x', `${-(y / bounds.height - 0.5) * 7}deg`);
				node.style.setProperty('--effects-tilt-y', `${(x / bounds.width - 0.5) * 9}deg`);
			}
			node.classList.add('effects-pointer-active');
		});
	}
	node.addEventListener('pointermove', move, { passive: true });
	node.addEventListener('pointerleave', reset);
	allowed.addEventListener('change', reset);
	return {
		destroy() {
			reset();
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', reset);
			allowed.removeEventListener('change', reset);
		}
	};
}

export function cycleProducts(node: HTMLElement) {
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const cards = Array.from(node.querySelectorAll('.landscape-product'));
	const svgs = Array.from(node.querySelectorAll('svg'));
	let inView = false;
	let index = 0;
	let timer: ReturnType<typeof setInterval> | undefined;
	function sync() {
		const running = inView && !document.hidden && !reduced.matches;
		for (const svg of svgs) running ? svg.unpauseAnimations() : svg.pauseAnimations();
		if (running && !timer) {
			const advance = () => {
				cards.forEach((card, i) =>
					card.classList.toggle('effects-active', i === index % cards.length)
				);
				index++;
			};
			advance();
			timer = setInterval(advance, 1800);
		} else if (!running) {
			clearInterval(timer);
			timer = undefined;
			if (reduced.matches) cards.forEach((card) => card.classList.remove('effects-active'));
		}
	}
	const observer = new IntersectionObserver(([entry]) => {
		inView = entry.isIntersecting;
		sync();
	});
	observer.observe(node);
	reduced.addEventListener('change', sync);
	document.addEventListener('visibilitychange', sync);
	sync();
	return {
		destroy() {
			clearInterval(timer);
			observer.disconnect();
			reduced.removeEventListener('change', sync);
			document.removeEventListener('visibilitychange', sync);
		}
	};
}
