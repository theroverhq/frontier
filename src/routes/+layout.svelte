<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  let { children } = $props();
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
