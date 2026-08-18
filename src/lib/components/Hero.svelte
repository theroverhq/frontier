<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
</script>

<header class="dark py-16 md:py-24 bg-background text-foreground">
  <div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-12 items-center">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant="secondary" class="font-mono gap-1.5 px-3 py-1">
            <span class="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Search <span class="text-muted-foreground opacity-50">•</span>
            Analytics <span class="text-muted-foreground opacity-50">•</span>
            SIEM <span class="text-muted-foreground opacity-50">•</span>
            AI SOC
          </Badge>
        </div>

        <h1 class="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-tight">
          Cold Storage. <br class="hidden sm:inline" />
          <span class="text-foreground">Hot Intelligence.</span>
        </h1>

        <p class="text-2xl md:text-3xl font-normal text-foreground mt-4 leading-snug">
          The search, analytics, and AI platform for your security data lake.
        </p>

        <p class="text-lg mt-5 text-muted-foreground max-w-2xl leading-relaxed">
          Keep every security event in object storage. Search and analyze years of data in seconds. Run detections across the full dataset and give analysts and AI agents the context to investigate anything—without search clusters.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" href="#early-access">Book a Demo</Button>
          <Button variant="outline" size="lg" href="#hero-preview">See Rover in Action</Button>
        </div>

        <div class="mt-8 flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
          <div class="flex items-center gap-2 text-foreground">
            <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span> Your object storage
          </div>
          <span class="opacity-30">•</span>
          <div class="flex items-center gap-2 text-foreground">
            <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span> Full-fidelity retention
          </div>
          <span class="opacity-30">•</span>
          <div class="flex items-center gap-2 text-foreground">
            <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span> Serverless compute
          </div>
          <span class="opacity-30">•</span>
          <div class="flex items-center gap-2 text-foreground">
            <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span> No search clusters
          </div>
        </div>
      </div>

      <!-- Right Side: Rover Cold Storage Query Engine Visual -->
      <div id="hero-preview" class="relative w-full h-[460px] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans" aria-label="Rover Architecture Visualization">
        <div class="h-10 border-b border-border bg-muted/30 px-4 flex items-center justify-between z-10">
          <div class="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span class="text-foreground">How It Works</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-border"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-border"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-border"></span>
            </div>
          </div>
        </div>

        <div class="relative flex-1 p-6 flex flex-col justify-between overflow-hidden">
          <div class="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>
          <div class="absolute left-[40px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent opacity-60"></div>

          <!-- Step 1: Storage -->
          <div class="relative z-10 flex items-center gap-5">
            <div class="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-lg shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
            </div>
            <div class="bg-card border border-border p-4 rounded-xl flex-1 shadow-lg">
              <div class="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">1. Keep Everything</div>
              <div class="text-foreground text-sm font-semibold mb-2.5">100% Data in Object Storage</div>
              <div class="flex gap-2">
                <Badge variant="secondary" class="font-mono text-[10px]">Amazon S3 / GCS</Badge>
                <Badge variant="default" class="bg-primary/10 text-primary hover:bg-primary/20 font-mono text-[10px]">~ $0.02 / GB</Badge>
              </div>
            </div>
          </div>

          <!-- Step 2: Compute -->
          <div class="relative z-10 flex items-center gap-5">
            <div class="w-10 h-10 rounded-full bg-background border border-primary flex items-center justify-center text-primary shadow-[0_0_15px_var(--primary)] shrink-0 opacity-80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div class="bg-background/60 border border-primary/30 p-4 rounded-xl flex-1 backdrop-blur-sm shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <div class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">2. Serverless Engine</div>
                  <div class="text-foreground text-sm font-semibold">Parallel Inverted Index Scan</div>
                </div>
                <Badge variant="secondary" class="font-mono text-[10px]">1,024 Workers</Badge>
              </div>
              <div class="flex gap-1.5 mt-3 opacity-80">
                <div class="h-1.5 flex-1 bg-primary/90 rounded-full animate-pulse"></div>
                <div class="h-1.5 w-6 bg-primary/30 rounded-full"></div>
                <div class="h-1.5 flex-[2] bg-primary/70 rounded-full animate-[pulse_1.5s_infinite]"></div>
                <div class="h-1.5 flex-[1.5] bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]"></div>
                <div class="h-1.5 w-4 bg-border rounded-full"></div>
                <div class="h-1.5 flex-1 bg-primary/50 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Step 3: Result -->
          <div class="relative z-10 flex items-center gap-5">
            <div class="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-lg shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <div class="bg-muted/50 border border-border p-4 rounded-xl flex-1 flex items-center justify-between shadow-lg">
              <div>
                <div class="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">3. Instant Answers</div>
                <div class="text-foreground text-sm font-semibold">Search 2.4 Petabytes of Data</div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-primary font-mono leading-none mb-1">0.42s</div>
                <div class="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>
