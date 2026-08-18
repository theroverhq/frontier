<script lang="ts">
  import { Card } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
</script>

<section id="ai-soc" class="py-20 bg-background text-foreground">
  <div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
      <div>
        <Badge variant="secondary" class="mb-4 gap-1.5 font-mono">
          <span class="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          AI SOC Memory
        </Badge>
        
        <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
          Give your AI SOC a memory.
        </h2>
        <p class="text-xl mt-4 text-muted-foreground leading-relaxed">
          AI is only as useful as the security context it can reach. Rover gives agents searchable access to years of alerts, logs, identities, network events, cloud activity, and historical investigations.
        </p>
        
        <div class="mt-8 flex flex-col gap-3 font-mono text-sm border-t border-border pt-6 text-muted-foreground">
          <div class="flex justify-between items-center py-1">
            <span>Context Horizon:</span>
            <strong class="text-foreground">12-36 Months Active</strong>
          </div>
          <Separator />
          <div class="flex justify-between items-center py-1">
            <span>Query Execution:</span>
            <strong class="text-foreground">Direct S3 Serverless Search</strong>
          </div>
          <Separator />
          <div class="flex justify-between items-center py-1">
            <span>Evidence Standard:</span>
            <strong class="text-foreground">Source-Level Event Pointers</strong>
          </div>
        </div>
      </div>

      <!-- Interactive AI Investigation Runner -->
      <Card class="bg-muted border border-border shadow-2xl overflow-hidden font-sans">
        <div class="bg-card p-6 border-b border-border">
          <div class="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span>ANALYST REQUEST</span>
            <span class="text-foreground font-bold">ROVER AI ENGINE</span>
          </div>
          <div class="text-foreground font-semibold text-lg">
            "Investigate unusual access by user <span class="text-foreground underline">john@example.com</span>."
          </div>
        </div>

        <div class="p-6 flex flex-col gap-4 font-mono text-sm relative">
          <div class="absolute left-[35px] top-6 bottom-6 w-px bg-border"></div>

          <div class="flex gap-4 relative z-10">
            <span class="text-muted-foreground bg-muted">├─</span>
            <div>
              <strong class="text-foreground">Searches 12 months of authentication data</strong>
              <div class="text-xs text-muted-foreground mt-0.5">Scanned 3.4B events in 0.38s across S3 indices</div>
            </div>
          </div>

          <div class="flex gap-4 relative z-10">
            <span class="text-muted-foreground bg-muted">├─</span>
            <div>
              <strong class="text-foreground">Identifies first-seen IP address</strong>
              <div class="text-xs text-foreground font-mono mt-0.5">198.51.100.42 (Zero historical hits prior to today)</div>
            </div>
          </div>

          <div class="flex gap-4 relative z-10">
            <span class="text-muted-foreground bg-muted">├─</span>
            <div>
              <strong class="text-foreground">Correlates AWS CloudTrail activity</strong>
              <div class="text-xs text-muted-foreground mt-0.5">AssumeRoleWithSAML → IAM Admin privilege escalation</div>
            </div>
          </div>

          <div class="flex gap-4 relative z-10">
            <span class="text-muted-foreground bg-muted">├─</span>
            <div>
              <strong class="text-foreground">Groups affected cloud resources</strong>
              <div class="text-xs text-muted-foreground mt-0.5">prod-db-cluster-01, S3 audit logs export</div>
            </div>
          </div>

          <div class="flex gap-4 relative z-10">
            <span class="text-muted-foreground bg-muted">├─</span>
            <div>
              <strong class="text-foreground">Finds similar historical behavior</strong>
              <div class="text-xs text-muted-foreground mt-0.5">Matches TTP patterns with APT29 credential theft vector</div>
            </div>
          </div>

          <div class="flex gap-4 relative z-10">
            <span class="text-primary bg-muted font-bold">└─</span>
            <div>
              <strong class="text-foreground font-bold">Produces complete investigation timeline & evidence case</strong>
              <div class="text-xs text-foreground mt-0.5">Case #4812 created with 142 source event citations</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>
