<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Badge } from "$lib/components/ui/badge";
</script>

<section id="early-access" class="py-16 bg-background">
  <div class="container mx-auto max-w-6xl px-4 sm:px-6">
    <div class="p-10 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 bg-card text-card-foreground rounded-3xl border border-border shadow-2xl">
      <div class="max-w-xl">
        <Badge variant="secondary" class="mb-3 font-mono gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          Request Demo
        </Badge>
        
        <h2 class="text-4xl md:text-5xl font-medium tracking-tight text-foreground mt-2">
          See Rover on your security data lake.
        </h2>
        <p class="text-xl mt-4 text-muted-foreground">
          Schedule a demonstration to test serverless search, analytics, and AI investigations directly against your object storage.
        </p>
      </div>
      
      <div class="w-full lg:w-auto">
        <form action="https://formspree.io/f/xgopbprl" method="POST" class="flex flex-col sm:flex-row gap-3">
          <Input 
            type="email" 
            name="email" 
            placeholder="security@company.com" 
            aria-label="Email address" 
            required 
            class="bg-muted w-full sm:w-72" 
          />
          <Button type="submit" size="lg">Book a Demo</Button>
        </form>
      </div>
    </div>
  </div>
</section>
