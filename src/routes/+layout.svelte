<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { browser } from "$app/environment";
  import { PUBLIC_GA_MEASUREMENT_ID, PUBLIC_CLARITY_PROJECT_ID } from "$env/static/public";
  
  let { children } = $props();
</script>

<svelte:head>
  <meta property="og:site_name" content="Rover" />
  <meta name="twitter:site" content="@roverhq_ai" />
  <meta name="twitter:creator" content="@roverhq_ai" />
  {#if browser}
    {#if PUBLIC_GA_MEASUREMENT_ID}
      <script async src="https://www.googletagmanager.com/gtag/js?id={PUBLIC_GA_MEASUREMENT_ID}"></script>
      {@html `<script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${PUBLIC_GA_MEASUREMENT_ID}');
      </script>`}
    {/if}
    {#if PUBLIC_CLARITY_PROJECT_ID}
      {@html `<script type="text/javascript">
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${PUBLIC_CLARITY_PROJECT_ID}");
      </script>`}
    {/if}
  {/if}
</svelte:head>

<div class="relative flex min-h-screen flex-col">
  <Navbar />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
