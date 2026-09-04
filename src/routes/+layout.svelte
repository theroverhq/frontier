<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { onMount } from "svelte";
  import { PUBLIC_GA_MEASUREMENT_ID, PUBLIC_CLARITY_PROJECT_ID } from "$env/static/public";
  
  let { children } = $props();

  onMount(() => {
    const injectScripts = () => {
      // Inject Google Analytics after hydration & initial paint
      if (PUBLIC_GA_MEASUREMENT_ID) {
        const gaScript = document.createElement("script");
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);

        const gaConfig = document.createElement("script");
        gaConfig.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${PUBLIC_GA_MEASUREMENT_ID}');
        `;
        document.head.appendChild(gaConfig);
      }

      // Inject Microsoft Clarity after hydration & initial paint
      if (PUBLIC_CLARITY_PROJECT_ID) {
        const clarityConfig = document.createElement("script");
        clarityConfig.type = "text/javascript";
        clarityConfig.innerHTML = `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${PUBLIC_CLARITY_PROJECT_ID}");
        `;
        document.head.appendChild(clarityConfig);
      }
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(injectScripts, { timeout: 3000 });
    } else {
      setTimeout(injectScripts, 1500);
    }
  });
</script>

<svelte:head>
  <meta property="og:site_name" content="Rover" />
  <meta name="twitter:site" content="@roverhq_ai" />
  <meta name="twitter:creator" content="@roverhq_ai" />
</svelte:head>

<div class="relative flex min-h-screen flex-col">
  <Navbar />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
