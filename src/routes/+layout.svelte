<script lang="ts">
  import { onMount } from 'svelte';
  import { hydrateAuth } from '$lib/auth';
  import '../app.css';

  let { children } = $props();
  onMount(hydrateAuth);
</script>

{@render children()}
