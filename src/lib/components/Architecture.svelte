<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
</script>

<section id="architecture" class="py-20 bg-muted/30 rounded-3xl my-8 border border-border shadow-sm">
  <div class="container mx-auto max-w-6xl px-4 sm:px-6">
    <div class="max-w-3xl mb-12">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Architecture Proof</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
        No search cluster. By design.
      </h2>
      <p class="text-xl mt-3 text-muted-foreground">
        Rover separates index storage from query execution, utilizing serverless ephemeral workers that fan out on demand directly against object storage.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
      <!-- Architecture Diagram Visual -->
      <div class="bg-card rounded-3xl border border-border p-8 shadow-sm flex flex-col items-center">
        <div class="text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wider mb-4">Telemetry Ingestion & Indexing</div>

        <div class="flex flex-wrap justify-center gap-3">
          <span class="px-3 py-1.5 rounded-md bg-muted text-foreground border border-border text-xs font-mono">CloudTrail</span>
          <span class="px-3 py-1.5 rounded-md bg-muted text-foreground border border-border text-xs font-mono">EDR</span>
          <span class="px-3 py-1.5 rounded-md bg-muted text-foreground border border-border text-xs font-mono">Okta</span>
          <span class="px-3 py-1.5 rounded-md bg-muted text-foreground border border-border text-xs font-mono">Network</span>
        </div>

        <div class="text-muted-foreground text-xl font-bold font-mono my-4">↓</div>

        <div class="w-full bg-muted border border-border rounded-xl p-6 text-center shadow-inner flex flex-col gap-2">
          <span class="font-mono text-xs font-bold text-foreground uppercase tracking-widest">OBJECT STORAGE</span>
          <span class="text-foreground font-semibold text-lg">Raw Data + Rover Index</span>
          <span class="text-xs text-muted-foreground font-mono">AWS S3 • Google Cloud Storage • Azure Blob</span>
        </div>

        <div class="text-muted-foreground text-xl font-bold font-mono my-4">↓</div>

        <div class="text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wider mb-4">Ephemeral Compute Layer</div>
        <div class="flex justify-center gap-3">
          {#each Array(5) as _}
            <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground font-mono shadow-sm">λ</div>
          {/each}
        </div>

        <div class="text-muted-foreground text-xl font-bold font-mono my-4">↓</div>

        <div class="flex flex-wrap justify-center gap-3">
          <span class="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-semibold shadow-sm">Search</span>
          <span class="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-semibold shadow-sm">Analytics</span>
          <span class="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-semibold shadow-sm">Detections</span>
          <span class="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-semibold shadow-sm">AI</span>
        </div>
      </div>

      <!-- 4 Architecture Pillars -->
      <div class="flex flex-col gap-5">
        <Card class="bg-card border border-border shadow-sm">
          <CardContent class="p-6">
            <h3 class="text-xl font-semibold text-foreground">Object-native</h3>
            <p class="text-sm mt-2 text-muted-foreground">Data and indexes live in low-cost object storage, eliminating mandatory search cluster storage taxes.</p>
          </CardContent>
        </Card>
        <Card class="bg-card border border-border shadow-sm">
          <CardContent class="p-6">
            <h3 class="text-xl font-semibold text-foreground">Serverless</h3>
            <p class="text-sm mt-2 text-muted-foreground">Query compute appears when work arrives instead of requiring an always-running, over-provisioned search fleet.</p>
          </CardContent>
        </Card>
        <Card class="bg-card border border-border shadow-sm">
          <CardContent class="p-6">
            <h3 class="text-xl font-semibold text-foreground">Massively parallel</h3>
            <p class="text-sm mt-2 text-muted-foreground">Large investigations across years of telemetry fan out instantaneously across thousands of ephemeral workers.</p>
          </CardContent>
        </Card>
        <Card class="bg-card border border-border shadow-sm">
          <CardContent class="p-6">
            <h3 class="text-xl font-semibold text-foreground">Built for retention</h3>
            <p class="text-sm mt-2 text-muted-foreground">Historical data remains part of the working active dataset rather than becoming an inaccessible cold zip archive.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</section>
