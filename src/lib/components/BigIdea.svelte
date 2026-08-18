<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
</script>

<section id="big-idea" class="dark py-20 bg-background text-foreground">
  <div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
    <div class="max-w-3xl mb-12">
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
        Your security data shouldn't have a hot tier and a forgotten tier.
      </h2>
      <p class="text-xl mt-3 text-muted-foreground">
        Legacy SIEM economics force security teams to choose which telemetry they can afford to index. Critical data is truncated into cold storage, creating predictable blind spots where modern adversaries operate unseen.
      </p>
    </div>

    <!-- Comparison Flow Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Traditional SIEM -->
      <Card class="bg-card border border-border rounded-3xl shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="font-mono text-xs uppercase font-semibold text-foreground">Legacy SIEM Lifecycle</CardTitle>
          <Badge variant="secondary" class="font-mono">Retention Walls</Badge>
        </CardHeader>
        <CardContent>
          <div class="flex items-center flex-wrap gap-2 my-4 font-mono text-xs font-semibold">
            <span class="px-3 py-1 rounded bg-destructive/20 text-destructive-foreground border border-destructive/30">Data</span>
            <span class="text-muted-foreground">→</span>
            <span class="px-3 py-1 rounded bg-destructive/20 text-destructive-foreground border border-destructive/30">Expensive Hot Index</span>
            <span class="text-muted-foreground">→</span>
            <span class="px-3 py-1 rounded bg-destructive/20 text-destructive-foreground border border-destructive/30">Archive</span>
          </div>

          <ul class="text-sm text-muted-foreground flex flex-col gap-2.5 list-disc pl-5 mt-6">
            <li>High cost forces sampling and dropping of network & cloud audit logs.</li>
            <li>Historical threat hunting requires slow, painful archive rehydration.</li>
            <li>AI SOC agents cannot query past 30 days to build context.</li>
          </ul>
        </CardContent>
      </Card>

      <!-- Rover -->
      <Card class="bg-card border border-border rounded-3xl shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="font-mono text-xs uppercase font-semibold text-foreground">Rover Object-Native Lifecycle</CardTitle>
          <Badge class="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 font-mono">Infinite Retention</Badge>
        </CardHeader>
        <CardContent>
          <div class="flex items-center flex-wrap gap-2 my-4 font-mono text-xs font-semibold">
            <span class="px-3 py-1 rounded bg-primary/20 text-primary border border-primary/30">Data + Index</span>
            <span class="text-muted-foreground">→</span>
            <span class="px-3 py-1 rounded bg-primary/20 text-primary border border-primary/30">Object Storage</span>
            <span class="text-muted-foreground">→</span>
            <span class="px-3 py-1 rounded bg-primary/20 text-primary border border-primary/30">Search · Analytics · AI</span>
          </div>

          <ul class="text-sm text-foreground flex flex-col gap-2.5 list-disc pl-5 mt-6">
            <li>Keep 100% full-fidelity security telemetry retained in low-cost object storage.</li>
            <li>Search and run analytics directly over years of data without moving it.</li>
            <li>AI agents and human analysts share multi-year searchable security memory.</li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <div class="mt-10 p-6 rounded-3xl bg-card border border-border text-center max-w-4xl mx-auto shadow-sm">
      <p class="text-lg text-foreground font-medium">
        "Keep years of full-fidelity security telemetry in object storage while Rover makes it immediately useful for investigations, detections, analytics, and AI."
      </p>
    </div>
  </div>
</section>
