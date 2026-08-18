<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<nav class="dark sticky top-0 z-50 bg-background text-foreground" aria-label="Main navigation">
  <div class="container flex h-18 items-center justify-between gap-4 mx-auto max-w-screen-2xl px-4 sm:px-6">
    <a href="/" class="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90" aria-label="Rover home">
      <span class="flex h-9 w-9 items-center justify-center rounded-md bg-foreground font-mono text-sm font-bold text-background shadow-sm">R</span>
      <span class="text-lg font-semibold tracking-tight text-foreground">Rover</span>
    </a>

    <div class="hidden items-center gap-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:flex" aria-label="Page sections">
      <a href="/#search" class="transition-colors hover:text-foreground">Search</a>
      <a href="/#analytics" class="transition-colors hover:text-foreground">Analytics</a>
      <a href="/#architecture" class="transition-colors hover:text-foreground">Architecture</a>
      <a href="/#ai-soc" class="transition-colors hover:text-foreground">AI SOC</a>
      <a href="/blogs/" class="transition-colors hover:text-foreground">Blogs</a>
    </div>

    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" href="/#hero-preview" class="text-xs font-semibold">See Rover in Action</Button>
      <Button size="sm" href="/#early-access" class="text-xs font-semibold">Book a Demo</Button>
    </div>
  </div>
</nav>
