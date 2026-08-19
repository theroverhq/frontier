<script lang="ts">
  // Architecture Component
</script>

<section id="architecture" class="py-24 bg-background text-foreground">
  <div class="container mx-auto max-w-screen-xl px-4 sm:px-6">
    <!-- Header Section -->
    <div class="max-w-4xl mx-auto text-center mb-16">
      <div class="flex items-center justify-center gap-2 mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Architecture</span>
      </div>
      <h2 class="text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6">
        Object storage is permanent.<br/>Query compute is temporary.
      </h2>
      <p class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        Rover keeps full-fidelity security data and its search index in low-cost object storage. Search and analytics run on ephemeral serverless compute when needed, while continuous detections, SIEM, and AI SOC operate on the same security history.
      </p>
    </div>

    <!-- The Diagram (Large, Dark, Full Width) -->
    <div class="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm mb-16 relative overflow-hidden">
      <!-- Top: Any Security Data -->
      <div class="flex flex-col items-center mb-8">
        <div class="text-sm font-mono text-muted-foreground font-semibold uppercase tracking-widest mb-3">Any Security Data</div>
        <div class="flex flex-wrap justify-center gap-2 max-w-2xl text-center text-muted-foreground text-sm">
          <span>Cloud</span><span class="opacity-50">·</span>
          <span>Identity</span><span class="opacity-50">·</span>
          <span>Endpoint</span><span class="opacity-50">·</span>
          <span>DNS</span><span class="opacity-50">·</span>
          <span>Network</span><span class="opacity-50">·</span>
          <span>SaaS</span><span class="opacity-50">·</span>
          <span>EDR</span><span class="opacity-50">·</span>
          <span>Audit</span><span class="opacity-50">·</span>
          <span>Logs</span>
        </div>
      </div>

      <div class="flex justify-center mb-6">
        <div class="w-px h-8 bg-border relative">
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
        </div>
      </div>

      <!-- Ingest + Index -->
      <div class="flex flex-col items-center mb-6">
        <div class="text-sm font-mono text-foreground font-bold uppercase tracking-widest mb-2">Ingest + Index</div>
        <div class="text-muted-foreground text-sm">No upfront schema project</div>
      </div>

      <div class="flex justify-center mb-8">
        <div class="w-px h-8 bg-border relative">
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
        </div>
      </div>

      <!-- Object Storage Block (Dominant) -->
      <div class="max-w-4xl mx-auto bg-muted/20 border border-border rounded-2xl p-10 md:p-16 text-center relative mb-12 shadow-inner">
        <!-- Annotation -->
        <div class="absolute -right-4 -top-8 md:-right-8 md:-top-10 bg-card border border-border p-4 rounded-xl shadow-lg text-left max-w-[240px] z-10 hidden sm:block">
          <div class="text-sm font-bold text-foreground mb-1">Minimal control-plane state</div>
          <div class="text-xs text-muted-foreground">No persistent ownership of searchable data by query nodes.</div>
        </div>

        <div class="text-sm font-mono text-foreground font-bold uppercase tracking-widest mb-6">Object Storage</div>
        <div class="text-2xl md:text-4xl font-medium text-foreground mb-4">
          Full-fidelity raw data <span class="text-muted-foreground font-light mx-2">+</span> ROVER LSM INDEX
        </div>
        <div class="text-muted-foreground text-lg">Years of security history</div>
      </div>

      <div class="flex justify-center relative h-16 mb-8">
         <!-- Forking arrows -->
         <div class="w-px h-8 bg-border absolute top-0"></div>
         <div class="w-[60%] md:w-[70%] h-px bg-border absolute top-8 border-t"></div>
         
         <div class="w-px h-8 bg-border absolute top-8 left-[20%] md:left-[15%]">
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
         </div>
         <div class="w-px h-8 bg-border absolute top-8 right-[20%] md:right-[15%]">
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
         </div>
      </div>

      <!-- Two Compute Models -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 relative max-w-5xl mx-auto">
        
        <!-- Left: Serverless Query Plane -->
        <div class="flex flex-col items-center text-center">
          <div class="text-sm font-mono text-primary font-bold uppercase tracking-widest mb-6">Serverless Query Compute</div>
          <div class="flex justify-center gap-2 mb-6">
            {#each Array(6) as _, i}
              <div class="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground font-mono text-xs shadow-sm {i === 0 || i === 5 ? 'opacity-50 scale-90' : ''}">λ</div>
            {/each}
          </div>
          <div class="text-sm text-muted-foreground max-w-[240px] mx-auto mb-8">Touches only relevant index/data regions</div>
          
          <div class="flex justify-center w-full relative h-12 mb-4">
             <div class="w-px h-6 bg-border absolute top-0"></div>
             <div class="w-[60%] h-px bg-border absolute top-6 border-t"></div>
             <div class="w-px h-6 bg-border absolute top-6 left-[20%]">
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
             </div>
             <div class="w-px h-6 bg-border absolute top-6 right-[20%]">
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
             </div>
          </div>
          <div class="flex justify-between w-[80%] mx-auto gap-4">
            <div class="flex-1 text-sm font-semibold text-foreground px-4 py-3 border border-border rounded-lg bg-muted/50 shadow-sm">Search</div>
            <div class="flex-1 text-sm font-semibold text-foreground px-4 py-3 border border-border rounded-lg bg-muted/50 shadow-sm">Analytics</div>
          </div>
        </div>

        <!-- Right: Security Platform -->
        <div class="flex flex-col items-center text-center">
          <div class="text-sm font-mono text-foreground font-bold uppercase tracking-widest mb-6">Security Platform</div>
          <div class="w-full max-w-[240px] h-14 bg-card border-2 border-border rounded-lg flex items-center justify-center mb-6 shadow-sm">
             <div class="w-full flex justify-center gap-1.5 px-6">
                <div class="h-1.5 w-full bg-foreground/30 rounded-full"></div>
                <div class="h-1.5 w-full bg-foreground/30 rounded-full"></div>
                <div class="h-1.5 w-full bg-foreground/30 rounded-full"></div>
                <div class="h-1.5 w-full bg-foreground/30 rounded-full"></div>
             </div>
          </div>
          <div class="text-sm text-muted-foreground max-w-[240px] mx-auto mb-8">Continuous security services</div>
          
          <div class="flex justify-center w-full relative h-12 mb-4">
             <div class="w-px h-6 bg-border absolute top-0"></div>
             <div class="w-[80%] h-px bg-border absolute top-6 border-t"></div>
             <div class="w-px h-6 bg-border absolute top-6 left-[10%]">
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
             </div>
             <div class="w-px h-6 bg-border absolute top-6 right-[10%]">
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
             </div>
             <div class="w-px h-6 bg-border absolute top-6 left-1/2 -translate-x-1/2">
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b border-r border-border transform rotate-45"></div>
             </div>
          </div>
          <div class="flex justify-between w-full mx-auto gap-3 px-4">
            <div class="flex-1 text-sm font-semibold text-foreground px-2 sm:px-4 py-3 border border-border rounded-lg bg-muted/50 shadow-sm">Detections</div>
            <div class="flex-1 text-sm font-semibold text-foreground px-2 sm:px-4 py-3 border border-border rounded-lg bg-muted/50 shadow-sm">SIEM</div>
            <div class="flex-1 text-sm font-semibold text-foreground px-2 sm:px-4 py-3 border border-border rounded-lg bg-muted/50 shadow-sm">AI SOC</div>
          </div>
        </div>

      </div>
    </div>

    <!-- 4 Architectural Ideas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
      <!-- 01 -->
      <div class="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between shadow-sm">
        <div>
          <div class="text-xs font-mono text-muted-foreground mb-4">01 · OBJECT-NATIVE</div>
          <h3 class="text-2xl font-semibold text-foreground mb-3">Data and index live together in object storage.</h3>
          <p class="text-muted-foreground text-lg mb-8">
            Full-fidelity telemetry and the Rover LSM index remain on low-cost durable storage instead of requiring a separate hot search tier.
          </p>
        </div>
        <div class="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded self-start">
          Raw Data + Rover Index → Object Storage
        </div>
      </div>

      <!-- 02 -->
      <div class="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between shadow-sm">
        <div>
          <div class="text-xs font-mono text-muted-foreground mb-4">02 · SERVERLESS QUERY PLANE</div>
          <h3 class="text-2xl font-semibold text-foreground mb-3">Compute exists when the query does.</h3>
          <p class="text-muted-foreground text-lg mb-4">
            Search and analytics fan out across ephemeral workers on demand and disappear when the work is complete.
          </p>
          <p class="font-semibold text-foreground mb-8 text-lg">No search clusters.</p>
        </div>
        <div class="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded self-start">
          Query arrives → fan out → answer → scale back
        </div>
      </div>

      <!-- 03 -->
      <div class="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between shadow-sm">
        <div>
          <div class="text-xs font-mono text-muted-foreground mb-4">03 · SCHEMA-ON-READ</div>
          <h3 class="text-2xl font-semibold text-foreground mb-3">Store first. Interpret when you query.</h3>
          <p class="text-muted-foreground text-lg mb-8">
            Rover accepts high-volume security telemetry without requiring a long normalization or schema-engineering project before the data becomes useful.
          </p>
        </div>
        <div class="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded self-start">
          Bring any telemetry · Go live in hours
        </div>
      </div>

      <!-- 04 -->
      <div class="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between shadow-sm">
        <div>
          <div class="text-xs font-mono text-muted-foreground mb-4">04 · TWO PLANES, ONE DATASET</div>
          <h3 class="text-2xl font-semibold text-foreground mb-3">Real-time detection. Historical depth.</h3>
          <p class="text-muted-foreground text-lg mb-8">
            Continuous security services watch incoming activity while investigations and analytics can reach back across everything retained.
          </p>
        </div>
        <div class="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded self-start">
          Detect now · Investigate years
        </div>
      </div>
    </div>

    <!-- Bottom summary -->
    <div class="text-center">
      <h2 class="text-3xl md:text-5xl font-medium tracking-tight text-foreground">
        Persistent data. Ephemeral queries. Continuous security.
      </h2>
    </div>

  </div>
</section>
