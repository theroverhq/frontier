<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
</script>

<section id="capabilities" class="py-20 bg-background">
  <div class="container mx-auto max-w-6xl px-4 sm:px-6">
    <div class="max-w-3xl mb-12">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Four Core Pillars</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
        Four things Rover turns your security lake into.
      </h2>
      <p class="text-xl mt-3 text-muted-foreground">
        Instead of dozens of disconnected features, Rover provides four unified capabilities on top of your underlying object storage.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- PANEL 1: SEARCH -->
      <Card class="flex flex-col justify-between min-h-[320px] bg-muted/20 border border-border rounded-3xl hover:border-muted-foreground/30 transition-all shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="font-mono text-xs font-bold uppercase text-foreground">01 / SEARCH</CardTitle>
          <Badge variant="secondary">Years of Data</Badge>
        </CardHeader>
        <CardContent class="mt-4 flex-1">
          <h3 class="text-2xl font-semibold text-foreground">Find the needle across years of data.</h3>
          <p class="text-base mt-3 text-muted-foreground leading-relaxed">
            Full-text search, filters, ranges, regex, fields, and historical investigation across massive datasets without waiting for indexing pipelines.
          </p>
        </CardContent>
        <CardFooter class="pt-4 border-t border-border flex items-center gap-3">
          <span class="text-xs text-foreground font-bold font-mono">Query syntax:</span>
          <code class="bg-background px-2.5 py-1 rounded-md border border-border text-foreground font-mono text-[10px]">fulltext:"unauthorized_access"</code>
        </CardFooter>
      </Card>

      <!-- PANEL 2: ANALYTICS -->
      <Card class="flex flex-col justify-between min-h-[320px] bg-muted/20 border border-border rounded-3xl hover:border-muted-foreground/30 transition-all shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="font-mono text-xs font-bold uppercase text-foreground">02 / ANALYTICS</CardTitle>
          <Badge variant="secondary">In-Place Analytics</Badge>
        </CardHeader>
        <CardContent class="mt-4 flex-1">
          <h3 class="text-2xl font-semibold text-foreground">Ask more than “where is it?”</h3>
          <p class="text-base mt-3 text-muted-foreground leading-relaxed">
            Count, group, correlate, calculate, visualize, and analyze the results directly without moving them into another analytics engine or warehouse.
          </p>
        </CardContent>
        <CardFooter class="pt-4 border-t border-border flex items-center gap-3">
          <span class="text-xs text-foreground font-bold font-mono">Analytics:</span>
          <code class="bg-background px-2.5 py-1 rounded-md border border-border text-foreground font-mono text-[10px]">stats count() by src_ip</code>
        </CardFooter>
      </Card>

      <!-- PANEL 3: SECURITY -->
      <Card class="flex flex-col justify-between min-h-[320px] bg-muted/20 border border-border rounded-3xl hover:border-muted-foreground/30 transition-all shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="font-mono text-xs font-bold uppercase text-foreground">03 / SECURITY</CardTitle>
          <Badge variant="secondary">Full-Lake Detections</Badge>
        </CardHeader>
        <CardContent class="mt-4 flex-1">
          <h3 class="text-2xl font-semibold text-foreground">Detect on everything you keep.</h3>
          <p class="text-base mt-3 text-muted-foreground leading-relaxed">
            SIEM, continuous detections, threat hunting, dashboards, investigations, and long-term forensic analysis across your entire telemetry dataset.
          </p>
        </CardContent>
        <CardFooter class="pt-4 border-t border-border flex items-center gap-3">
          <span class="text-xs text-foreground font-bold font-mono">Security rules:</span>
          <code class="bg-background px-2.5 py-1 rounded-md border border-border text-foreground font-mono text-[10px]">Sigma Rules • Baselines</code>
        </CardFooter>
      </Card>

      <!-- PANEL 4: AI -->
      <Card class="flex flex-col justify-between min-h-[320px] bg-muted/20 border border-border rounded-3xl hover:border-muted-foreground/30 transition-all shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="font-mono text-xs font-bold uppercase text-foreground">04 / AI</CardTitle>
          <Badge variant="secondary">Multi-Year Context</Badge>
        </CardHeader>
        <CardContent class="mt-4 flex-1">
          <h3 class="text-2xl font-semibold text-foreground">Give your SOC a memory.</h3>
          <p class="text-base mt-3 text-muted-foreground leading-relaxed">
            Let analysts and agents investigate against years of searchable security context rather than only today's hot data.
          </p>
        </CardContent>
        <CardFooter class="pt-4 border-t border-border flex items-center gap-3">
          <span class="text-xs text-foreground font-bold font-mono">AI advantage:</span>
          <code class="bg-background px-2.5 py-1 rounded-md border border-border text-foreground font-mono text-[10px]">Agentic Triage</code>
        </CardFooter>
      </Card>
    </div>
  </div>
</section>
