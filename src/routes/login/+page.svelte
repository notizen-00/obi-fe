<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import AppIcon from '$lib/components/AppIcon.svelte';
  import Brand from '$lib/components/Brand.svelte';
  import { ApiError, api } from '$lib/api';
  import { setAuth } from '$lib/auth';

  let username = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let error = $state('');

  onMount(() => {
    if (sessionStorage.getItem('obi_access_token')) goto('/exams');
  });

  function errorMessage(status: number) {
    return ({
      400: 'Permintaan login tidak valid.',
      401: 'Username atau password salah.',
      403: 'Pembayaran peserta belum lunas.',
      429: 'Terlalu banyak percobaan login. Silakan coba kembali dalam 15 menit.',
      500: 'Server sedang bermasalah. Silakan coba beberapa saat lagi.'
    } as Record<number, string>)[status] || 'Tidak dapat terhubung ke server.';
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (loading) return;
    error = '';
    loading = true;
    try {
      const data = await api.login(username.trim(), password);
      setAuth(data.access_token, data.expires_at, data.user);
      await goto('/exams');
    } catch (cause) {
      error = cause instanceof ApiError ? errorMessage(cause.status) : 'Terjadi kesalahan yang tidak terduga.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Masuk — OBI CBT</title></svelte:head>

<main>
  <section class="story" aria-label="Selamat datang">
    <div class="story-inner">
      <Brand inverse />
      <div class="story-copy">
        <p class="eyebrow">Olimpiade Bahasa Indonesia</p>
        <h1>Ruang tenang untuk menunjukkan kemampuan terbaikmu.</h1>
        <p class="lead">Siapkan diri, fokus pada setiap soal, dan biarkan kami menjaga progres jawabanmu.</p>
        <div class="quote">
          <span>“</span>
          <p>Bahasa adalah peta sebuah budaya. Ia memberi tahu dari mana kita datang dan ke mana kita menuju.</p>
        </div>
      </div>
      <div class="ornament" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <p class="secure"><AppIcon name="lock" size={15} /> Sesi aman & jawaban tersimpan otomatis</p>
    </div>
  </section>

  <section class="form-side">
    <div class="form-wrap">
      <div class="mobile-brand"><Brand /></div>

      <p class="eyebrow">Selamat datang kembali</p>
      <h2>Masuk ke akun ujian</h2>
      <p class="intro">Gunakan username dan password yang diberikan oleh panitia.</p>

      <form onsubmit={submit}>
        <label for="username">Username</label>
        <div class="field">
          <AppIcon name="user" size={19} />
          <input id="username" bind:value={username} autocomplete="username" placeholder="Masukkan username" required />
        </div>

        <label for="password">Password</label>
        <div class="field">
          <AppIcon name="lock" size={19} />
          <input id="password" bind:value={password} type={showPassword ? 'text' : 'password'} autocomplete="current-password" placeholder="Masukkan password" required />
          <button class="toggle" type="button" onclick={() => (showPassword = !showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
            <AppIcon name={showPassword ? 'eyeoff' : 'eye'} size={19} />
          </button>
        </div>

        <a class="forgot" href="/forgot-password">Lupa username atau password?</a>

        {#if error}<div class="error" role="alert"><AppIcon name="alert" size={18} />{error}</div>{/if}

        <button class="primary submit" type="submit" disabled={loading}>
          {#if loading}<span class="spinner"></span>Memverifikasi…{:else}Masuk ke CBT <AppIcon name="arrow" size={18} />{/if}
        </button>
      </form>

      <p class="help">Mengalami kendala masuk? <a href="mailto:panitia@obi.id">Hubungi panitia</a></p>
    </div>
  </section>
</main>

<style>
  main { min-height: 100vh; display: grid; grid-template-columns: minmax(390px, .96fr) 1.04fr; }
  .story { position: relative; overflow: hidden; color: white; background: var(--navy); }
  .story::before { content: ''; position: absolute; width: 520px; height: 520px; left: -230px; bottom: -240px; border: 1px solid rgb(255 255 255 / .08); border-radius: 50%; box-shadow: 0 0 0 70px rgb(255 255 255 / .02), 0 0 0 140px rgb(255 255 255 / .02); }
  .story-inner { position: relative; z-index: 1; min-height: 100%; padding: 3rem clamp(2.5rem, 6vw, 6rem); display: flex; flex-direction: column; }
  .story-copy { max-width: 560px; margin: auto 0; padding: 4rem 0 2rem; }
  .story .eyebrow { color: #f3aa98; }
  h1 { max-width: 540px; margin-bottom: 1.35rem; font: 400 clamp(2.6rem, 4.3vw, 4.4rem)/1.04 var(--display); letter-spacing: -.035em; }
  .lead { max-width: 490px; color: #cbd5e1; font-size: 1.05rem; line-height: 1.75; }
  .quote { max-width: 420px; margin-top: 3.4rem; padding-top: 1.3rem; border-top: 1px solid rgb(255 255 255 / .16); display: flex; gap: .8rem; color: #aebcd0; font: italic .88rem/1.65 Georgia, serif; }
  .quote span { color: var(--coral); font: 2.5rem/1 var(--display); }
  .secure { margin: 0; display: flex; gap: .5rem; align-items: center; color: #9fb0c5; font-size: .72rem; }
  .ornament { position: absolute; right: 4rem; top: 4rem; display: grid; grid-template-columns: repeat(2, 7px); gap: 8px; opacity: .45; }
  .ornament i { width: 7px; height: 7px; border-radius: 50%; background: var(--coral); }
  .form-side { background: var(--paper); display: grid; place-items: center; padding: 2rem; }
  .form-wrap { width: min(430px, 100%); }
  .mobile-brand { display: none; margin-bottom: 3rem; }

  h2 { margin-bottom: .7rem; color: var(--navy); font: 400 2.25rem/1.1 var(--display); letter-spacing: -.02em; }
  .intro { margin-bottom: 2.4rem; color: var(--muted); line-height: 1.6; }
  form { display: grid; }
  label { margin: 0 0 .55rem; color: var(--navy); font-size: .8rem; font-weight: 750; }
  label:not(:first-child) { margin-top: 1.2rem; }
  .field { min-height: 52px; display: flex; align-items: center; gap: .65rem; padding: 0 .85rem; color: #89919d; background: white; border: 1px solid #dcd9d2; border-radius: .7rem; transition: .18s; }
  .field:focus-within { color: var(--navy); border-color: var(--navy); box-shadow: 0 0 0 3px rgb(16 35 63 / .07); }
  input { width: 100%; height: 48px; border: 0; outline: 0; color: var(--navy); background: transparent; }
  input::placeholder { color: #a6abb2; }
  .toggle { display: grid; place-items: center; padding: .45rem; border: 0; background: transparent; color: var(--muted); cursor: pointer; }
  .forgot { justify-self: end; margin-top: .75rem; color: var(--navy); font-size: .78rem; font-weight: 700; text-decoration: none; }
  .forgot:hover { color: var(--coral-dark); text-decoration: underline; }
  .submit { width: 100%; margin-top: 1.55rem; }
  .error { margin-top: 1rem; display: flex; align-items: center; gap: .55rem; padding: .75rem; color: #9c3333; background: #fff0ed; border-radius: .6rem; font-size: .8rem; }
  .spinner { width: 1.05rem; height: 1.05rem; border: 2px solid rgb(255 255 255 / .35); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }

  .help { margin: 2.7rem 0 0; color: var(--muted); text-align: center; font-size: .78rem; }
  .help a { color: var(--navy); font-weight: 700; }
  @media (max-width: 820px) {
    main { grid-template-columns: 1fr; }
    .story { display: none; }
    .form-side { min-height: 100vh; padding: 2rem 1.25rem; }
    .mobile-brand { display: block; }
  }
</style>
