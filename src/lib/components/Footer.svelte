<script lang="ts">
	import { page } from '$app/stores';
</script>

<footer class="dark bg-background text-foreground border-border border-t">
	<div class="container mx-auto max-w-screen-xl px-4 pt-16 pb-8 sm:px-6">
		<div class="mb-24 grid grid-cols-1 gap-12 md:grid-cols-[55%_15%_15%_15%] md:gap-4">
			<!-- Brand Column -->
			<div class="flex flex-col">
				<div class="text-foreground mb-2 text-2xl font-bold tracking-tight">ROVER</div>
				<div class="text-primary mb-6 font-mono text-[10px] font-bold tracking-widest uppercase">
					Cold Storage. Hot Intelligence.
				</div>
				<a
					href="mailto:contactus@roverhq.ai"
					class="text-foreground/70 hover:text-foreground text-sm transition-colors"
				>
					contactus@roverhq.ai
				</a>
			</div>

			<!-- Product Column -->
			<div class="flex flex-col gap-4">
				<h4 class="text-foreground/50 font-mono text-[10px] font-bold tracking-widest uppercase">
					Product
				</h4>
				<ul class="text-foreground/70 flex flex-col gap-3 text-sm">
					<li><a href="{$page.url.pathname === '/' ? '' : '/'}#big-idea" class="hover:text-foreground transition-colors">Search</a></li>
					<li>
						<a href="{$page.url.pathname === '/' ? '' : '/'}#capabilities" class="hover:text-foreground transition-colors">Analytics</a>
					</li>
					<li>
						<a href="{$page.url.pathname === '/' ? '' : '/'}#architecture" class="hover:text-foreground transition-colors">Architecture</a>
					</li>
					<li><a href="{$page.url.pathname === '/' ? '' : '/'}#ai-soc" class="hover:text-foreground transition-colors">AI SOC</a></li>
				</ul>
			</div>

			<!-- Company Column -->
			<div class="flex flex-col gap-4">
				<h4 class="text-foreground/50 font-mono text-[10px] font-bold tracking-widest uppercase">
					Company
				</h4>
				<ul class="text-foreground/70 flex flex-col gap-3 text-sm">
					<li><a href="/blogs/" class="hover:text-foreground transition-colors">Blogs</a></li>
					<li>
						<a
							href="https://www.linkedin.com/company/rover-hq-ai/"
							target="_blank"
							rel="noopener noreferrer"
							class="hover:text-foreground transition-colors">LinkedIn</a
						>
					</li>
					<li>
						<a href="mailto:contactus@roverhq.ai" class="hover:text-foreground transition-colors"
							>Contact</a
						>
					</li>
				</ul>
			</div>

			<!-- Legal Column -->
			<div class="flex flex-col gap-4">
				<h4 class="text-foreground/50 font-mono text-[10px] font-bold tracking-widest uppercase">
					Legal
				</h4>
				<ul class="text-foreground/70 flex flex-col gap-3 text-sm">
					<li><a href="#" class="hover:text-foreground transition-colors">Privacy</a></li>
					<li><a href="#" class="hover:text-foreground transition-colors">Terms</a></li>
				</ul>
			</div>
		</div>

		<!-- Copyright Row -->
		<div class="border-border text-foreground/40 border-t pt-8 text-xs">
			&copy; 2026 Rover HQ Inc. All rights reserved.
		</div>
	</div>
</footer>
