<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { fade } from "svelte/transition";
  
  let hoveredLegacy: string | null = null;
  let hoveredRover: string | null = null;

  const legacySystems = [
    { id: 'siem', name: 'SIEM', role: 'Hot index', dot: 'bg-red-500', borderHover: 'hover:border-red-500/50', bgHover: 'hover:bg-red-500/10' },
    { id: 'search', name: 'Search', role: 'Search cluster', dot: 'bg-orange-500', borderHover: 'hover:border-orange-500/50', bgHover: 'hover:bg-orange-500/10' },
    { id: 'analytics', name: 'Analytics', role: 'Analytics store', dot: 'bg-amber-500', borderHover: 'hover:border-amber-500/50', bgHover: 'hover:bg-amber-500/10' },
    { id: 'lake', name: 'Data Lake', role: 'Cold archive', dot: 'bg-blue-500', borderHover: 'hover:border-blue-500/50', bgHover: 'hover:bg-blue-500/10' },
    { id: 'ai', name: 'AI SOC', role: 'Limited context', dot: 'bg-purple-500', borderHover: 'hover:border-purple-500/50', bgHover: 'hover:bg-purple-500/10' }
  ];

  const roverWorkflows = ['SEARCH', 'ANALYTICS', 'DETECTIONS', 'SIEM', 'AI SOC'];
</script>

<section id="convergence" class="dark bg-background text-foreground relative overflow-hidden pt-24 pb-32">
  <!-- Subtle background glow -->
  <div class="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"></div>

  <div class="relative z-10 container mx-auto max-w-screen-2xl px-4 sm:px-6">
    
    <!-- Header -->
    <div class="mb-24 text-center">
      <Badge variant="outline" class="text-primary border-primary/30 mb-6 font-mono text-xs tracking-widest uppercase">
        CONVERGED SECURITY
      </Badge>
      
      <h2 class="text-foreground text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
        Search. Analytics. SIEM. AI. <span class="text-primary">One platform.</span>
      </h2>
      
      <p class="md:text-2xl text-foreground/70 mx-auto mt-6 max-w-4xl text-xl leading-relaxed">
        Traditional security stacks split telemetry and context across hot SIEM indexes, data lakes, search systems, analytics engines, and AI tools. Rover brings those workflows together around one full-fidelity security history.
      </p>
    </div>

    <!-- Stack Comparison -->
    <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto mb-20 items-stretch">
      
      <!-- LEFT: TODAY -->
      <div class="bg-card/30 border-border/50 rounded-2xl border p-8 lg:p-10 shadow-sm relative overflow-hidden flex flex-col hover:border-border/80 transition-colors">
        <div class="mb-10">
          <span class="text-muted-foreground font-mono text-xs font-bold tracking-widest uppercase mb-3 block">
            TODAY
          </span>
          <h3 class="text-foreground text-2xl font-medium">
            Five systems. Fragmented security context.
          </h3>
        </div>

        <div class="space-y-4 font-mono text-sm relative z-10 flex-grow">
          {#each legacySystems as sys}
            <div 
              class="border-border/50 bg-muted/20 flex items-center justify-between rounded-xl border p-4 transition-all duration-300 {hoveredLegacy === sys.id || hoveredLegacy === null ? 'opacity-100' : 'opacity-40'} {sys.borderHover} {sys.bgHover} cursor-default"
              on:mouseenter={() => hoveredLegacy = sys.id}
              on:mouseleave={() => hoveredLegacy = null}
            >
              <div class="flex items-center gap-3">
                <div class="{sys.dot} h-2 w-2 rounded-full {hoveredLegacy === sys.id ? 'animate-pulse scale-150' : ''} transition-all duration-300"></div>
                <span class="text-foreground font-semibold">{sys.name}</span>
              </div>
              <div class="text-muted-foreground flex items-center gap-3">
                <div class="bg-border/50 hidden h-px w-8 sm:w-16 sm:block"></div>
                <span class="text-right">{sys.role}</span>
              </div>
            </div>
          {/each}
        </div>

        <div class="border-border/50 border-t border-dashed mt-8 pt-6 text-center relative z-10">
          <p class="text-muted-foreground font-mono text-[11px] sm:text-xs tracking-widest uppercase leading-loose">
            Copy · Move · Normalize<br/>
            Rehydrate · Retain Differently
          </p>
        </div>
      </div>

      <!-- RIGHT: WITH ROVER -->
      <div class="bg-card/50 border-border/50 rounded-2xl border p-8 lg:p-10 shadow-sm relative overflow-hidden flex flex-col hover:border-primary/30 transition-colors group">
        <div class="bg-gradient-to-b from-primary/5 to-transparent pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div class="mb-10 relative z-10">
          <span class="text-primary font-mono text-xs font-bold tracking-widest uppercase mb-3 block">
            WITH ROVER
          </span>
          <h3 class="text-foreground text-2xl font-medium">
            One history. Every security workflow.
          </h3>
        </div>

        <div class="flex flex-col items-center justify-between flex-grow relative z-10 w-full mt-4">
          <!-- Workflows -->
          <div class="grid grid-cols-5 gap-1 w-full font-mono text-[9px] font-semibold sm:text-[11px] lg:text-xs">
            {#each roverWorkflows as workflow}
              <div 
                class="flex items-center justify-center rounded border px-0.5 py-2.5 text-center transition-all duration-300 cursor-default {hoveredRover === workflow ? 'border-primary bg-primary/10 text-primary scale-[1.03] shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)] z-10' : 'border-border/50 bg-muted/30 text-foreground z-0'}"
                on:mouseenter={() => hoveredRover = workflow}
                on:mouseleave={() => hoveredRover = null}
              >
                {workflow}
              </div>
            {/each}
          </div>

          <!-- Connecting Architecture Lines -->
          <div class="w-full h-16 sm:h-20 relative z-0">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <!-- Static background bus lines -->
              <path d="M10,0 L10,50 L90,50 L90,0 M30,0 L30,50 M50,0 L50,100 M70,0 L70,50" 
                    fill="none" stroke="currentColor" class="text-border/50" vector-effect="non-scaling-stroke" stroke-width="1.5" />
            
              <!-- Animated hover line -->
              {#if hoveredRover}
                {@const idx = roverWorkflows.indexOf(hoveredRover)}
                {@const x = 10 + (idx * 20)}
                <path 
                  d="M{x},0 L{x},50 L50,50 L50,100" 
                  fill="none" stroke="currentColor" class="text-primary" vector-effect="non-scaling-stroke" stroke-width="3" 
                  transition:fade={{duration: 150}}
                />
              {/if}
            </svg>
            <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-primary transition-all duration-300 {hoveredRover ? 'opacity-100 translate-y-1 scale-110' : 'opacity-50'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bg-card">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>

          <!-- Foundation -->
          <div class="mt-4 w-full relative z-10">
            <div class="border-primary/30 relative w-full overflow-hidden rounded-xl border bg-card p-6 text-center transition-all duration-500 md:p-8 {hoveredRover ? 'border-primary bg-primary/5' : ''}">
              
              <!-- Subtle glow -->
              <div class="bg-primary/5 absolute inset-0 transition-opacity duration-500 {hoveredRover ? 'opacity-100' : 'opacity-0'}"></div>

              <div class="relative z-10">
                <div class="text-primary font-mono text-sm font-bold tracking-widest uppercase mb-3">
                  ONE SECURITY DATA PLANE
                </div>
                <h4 class="text-foreground mb-4 text-xl font-medium md:text-2xl">
                  Full-fidelity security history
                </h4>
                <div class="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-xs">
                  <span>+ Rover Index</span>
                  <span class="bg-primary/50 hidden h-1 w-1 rounded-full sm:block"></span>
                  <span>+ Security context</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Bottom takeaway -->
    <div class="mx-auto mt-12 max-w-4xl text-center">
      <h3 class="text-foreground text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
        One security history. Every workflow.
      </h3>
    </div>
    
  </div>
</section>

