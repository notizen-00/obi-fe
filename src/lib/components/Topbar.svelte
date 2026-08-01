<script lang="ts">
  import { goto } from '$app/navigation';
  import { clearAuth } from '$lib/auth';
  import { api } from '$lib/api';
  import AppIcon from './AppIcon.svelte';
  import Brand from './Brand.svelte';

  let { userName = '' }: { userName?: string } = $props();
  let open = $state(false);

  async function logout() {
    try { await api.logout(); } finally {
      clearAuth();
      await goto('/login');
    }
  }
</script>

<header>
  <div class="wrap">
    <Brand />
    <div class="right">

      <div class="connection"><span></span> Terhubung</div>
      <button class="profile" onclick={() => (open = !open)} aria-expanded={open}>
        <span class="avatar">{userName.charAt(0) || 'P'}</span>
        <span><small>Peserta</small><b>{userName || 'Peserta OBI'}</b></span>
        <span class="chev">⌄</span>
      </button>
      {#if open}
        <button class="logout" onclick={logout}><AppIcon name="logout" size={18} /> Keluar dari akun</button>
      {/if}
    </div>
  </div>
</header>

<style>
  header { height: 76px; border-bottom: 1px solid var(--line); background: rgb(255 255 255 / .86); backdrop-filter: blur(14px); position: sticky; top: 0; z-index: 20; }
  .wrap { max-width: 1180px; height: 100%; margin: auto; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; }
  .right { position: relative; display: flex; align-items: center; gap: 1.1rem; }
  .connection { font-size: .75rem; font-weight: 750; color: var(--muted); }
  .connection { display: flex; align-items: center; gap: .45rem; }
  .connection span { width: .5rem; height: .5rem; border-radius: 50%; background: #2ba471; box-shadow: 0 0 0 4px #e1f5ec; }

  .profile { display: flex; align-items: center; gap: .65rem; border: 0; background: transparent; color: var(--navy); text-align: left; padding: .25rem; cursor: pointer; }
  .profile > span:nth-child(2) { display: grid; gap: .16rem; }
  .profile small { font-size: .65rem; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; font-weight: 700; }
  .profile b { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .83rem; }
  .avatar { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 50%; color: white; background: var(--navy); font-family: var(--display); font-weight: 700; }
  .chev { color: var(--muted); }
  .logout { position: absolute; top: 3.2rem; right: 0; width: 190px; display: flex; gap: .6rem; align-items: center; border: 1px solid var(--line); padding: .8rem; background: white; border-radius: .75rem; box-shadow: var(--shadow); cursor: pointer; color: #a33939; }
  @media (max-width: 680px) { .connection, .profile > span:nth-child(2), .chev { display: none; } header { height: 66px; } .right { gap: .4rem; } }
</style>
