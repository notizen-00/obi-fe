<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => goto(sessionStorage.getItem('obi_access_token') ? '/exams' : '/login'));
</script>

<div class="page-loader"><span></span><p>Menyiapkan OBI CBT…</p></div>
