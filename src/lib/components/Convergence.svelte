<script lang="ts">
  import { Card } from "$lib/components/ui/card";
</script>

<section id="convergence" class="dark py-20 bg-background text-foreground">
  <div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
    <div class="max-w-3xl mb-12">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Convergence</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
        One lake. More than SIEM.
      </h2>
      <p class="text-xl mt-3 text-muted-foreground">
        Start with SIEM. Expand into security analytics, threat hunting, compliance, AI investigations, and machine-data search—all on the same underlying data.
      </p>
    </div>

    <!-- Convergence Diagram Card -->
    <Card class="p-10 flex flex-col items-center justify-center text-center bg-muted/20 border-border rounded-3xl shadow-sm">
      <div class="font-mono text-sm font-bold text-muted-foreground tracking-widest uppercase mb-8">
        ROVER PLATFORM ARCHITECTURE
      </div>

      <!-- Top Row -->
      <div class="flex flex-wrap justify-center gap-8 font-mono text-sm font-semibold mb-6">
        <span class="px-4 py-2 rounded-lg bg-card border border-border text-foreground shadow-sm">Search</span>
        <span class="px-4 py-2 rounded-lg bg-card border border-border text-foreground shadow-sm">Analytics</span>
        <span class="px-4 py-2 rounded-lg bg-card border border-border text-foreground shadow-sm">AI</span>
      </div>

      <div class="text-muted-foreground text-sm font-mono mb-4">\ &nbsp; &nbsp; &nbsp; &nbsp; | &nbsp; &nbsp; &nbsp; &nbsp; /</div>

      <!-- Core Layer -->
      <div class="px-8 py-3 rounded-xl bg-muted border border-border font-mono text-base font-bold text-foreground mb-4 shadow-sm">
        ───── SECURITY CORE ─────
      </div>

      <div class="text-muted-foreground text-sm font-mono mb-4">/ &nbsp; &nbsp; &nbsp; &nbsp; | &nbsp; &nbsp; &nbsp; &nbsp; \</div>

      <!-- Security Jobs -->
      <div class="flex flex-wrap justify-center gap-8 font-mono text-sm font-semibold mb-8">
        <span class="px-4 py-2 rounded-lg bg-card border border-border text-foreground shadow-sm">SIEM</span>
        <span class="px-4 py-2 rounded-lg bg-card border border-border text-foreground shadow-sm">Detections</span>
        <span class="px-4 py-2 rounded-lg bg-card border border-border text-foreground shadow-sm">Threat Hunting</span>
      </div>

      <div class="w-full max-w-md h-px bg-border my-2"></div>

      <!-- Bottom Lake -->
      <div class="mt-4 px-10 py-3 rounded-xl bg-card border border-border font-mono text-sm font-semibold text-foreground shadow-sm">
        Unified Security Data Lake (Object Storage)
      </div>
    </Card>
  </div>
</section>
