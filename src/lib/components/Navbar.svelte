<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<nav class="dark bg-background text-foreground sticky top-0 z-50" aria-label="Main navigation">
	<div
		class="container mx-auto flex h-18 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6"
	>
		<a
			href="/"
			class="text-foreground flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90"
			aria-label="Rover home"
		>
			<img src="/rover-logo.png" alt="Rover Logo" class="h-9 w-auto" />
			<span class="text-foreground text-3xl font-semibold tracking-tight">Rover</span>
		</a>

		<div
			class="text-muted-foreground hidden items-center gap-7 text-xs font-semibold tracking-wider uppercase md:flex"
			aria-label="Page sections"
		>
			<a href="/#search" class="hover:text-foreground transition-colors">Search</a>
			<a href="/#analytics" class="hover:text-foreground transition-colors">Analytics</a>
			<a href="/#architecture" class="hover:text-foreground transition-colors">Architecture</a>
			<a href="/#ai-soc" class="hover:text-foreground transition-colors">AI SOC</a>
			<a href="/blogs/" class="hover:text-foreground transition-colors">Blogs</a>
		</div>

		<div class="flex items-center gap-3">
			<Button variant="outline" size="sm" href="/#hero-preview" class="text-xs font-semibold"
				>See Rover in Action</Button
			>
			<Button size="sm" href="/#early-access" class="text-xs font-semibold">Book a Demo</Button>
		</div>
	</div>
</nav>
