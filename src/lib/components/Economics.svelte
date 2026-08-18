<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
</script>

<section id="economics" class="dark py-20 bg-background text-foreground">
  <div class="container mx-auto max-w-screen-2xl px-4 sm:px-6">
    <div class="max-w-3xl mb-12">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Economic Reality</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
        Stop paying to keep data searchable.
      </h2>
      <p class="text-xl mt-3 text-muted-foreground">
        Legacy SIEM vendors profit on index tax and ingest limits. Rover aligns cost with cloud object storage economics and serverless execution.
      </p>
    </div>

    <!-- Side-by-Side High Contrast Table -->
    <div class="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-1/3 text-foreground font-bold">Capability / Dimension</TableHead>
            <TableHead class="w-1/3 text-foreground font-bold border-l border-border">Traditional SIEM</TableHead>
            <TableHead class="w-1/3 text-primary font-bold border-l border-border">Rover</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="font-medium text-foreground">Storage Architecture</TableCell>
            <TableCell class="text-muted-foreground border-l border-border">Hot SSD / expensive database clusters</TableCell>
            <TableCell class="text-foreground font-medium border-l border-border bg-primary/5">Low-cost native object storage</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium text-foreground">Query Compute</TableCell>
            <TableCell class="text-muted-foreground border-l border-border">Always-on, over-provisioned fleets</TableCell>
            <TableCell class="text-foreground font-medium border-l border-border bg-primary/5">Serverless ephemeral workers on-demand</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium text-foreground">Telemetry Ingestion</TableCell>
            <TableCell class="text-muted-foreground border-l border-border">Ingest caps force log truncation & drop</TableCell>
            <TableCell class="text-foreground font-medium border-l border-border bg-primary/5">Keep 100% full-fidelity event data</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium text-foreground">Active Retention</TableCell>
            <TableCell class="text-muted-foreground border-l border-border">Short (30-90 days max before archive)</TableCell>
            <TableCell class="text-foreground font-medium border-l border-border bg-primary/5">Years of active, searchable retention</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium text-foreground">Historical Investigation</TableCell>
            <TableCell class="text-muted-foreground border-l border-border">Slow, manual archive rehydration</TableCell>
            <TableCell class="text-foreground font-medium border-l border-border bg-primary/5">Direct search across multi-year telemetry</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium text-foreground">Platform Scope</TableCell>
            <TableCell class="text-muted-foreground border-l border-border">Separate tools for search & analytics</TableCell>
            <TableCell class="text-foreground font-medium border-l border-border bg-primary/5">Search + Analytics + SIEM in one lake</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</section>
