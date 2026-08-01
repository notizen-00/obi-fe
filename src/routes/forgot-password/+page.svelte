<script lang="ts">
  import AppIcon from '$lib/components/AppIcon.svelte';
  import Brand from '$lib/components/Brand.svelte';
  import { ApiError, api } from '$lib/api';

  let nik = $state('');
  let username = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let step = $state<'identify' | 'reset' | 'success'>('identify');
  let loading = $state(false);
  let error = $state('');

  function cleanNik(value: string) {
    return value.replace(/[^0-9]/g, '').slice(0, 16);
  }

  function apiError(cause: unknown, fallback: string) {
    if (!(cause instanceof ApiError)) return 'Terjadi kesalahan yang tidak terduga.';
    if (cause.status === 0) return 'Tidak dapat terhubung ke server.';
    if (cause.status === 429) return 'Terlalu banyak percobaan. Silakan coba kembali dalam 15 menit.';
    if (cause.status >= 500) return 'Server sedang bermasalah. Silakan coba beberapa saat lagi.';
    return cause.message || fallback;
  }

  async function findUsername(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    nik = cleanNik(nik);
    if (nik.length !== 16) {
      error = 'NIK harus terdiri dari tepat 16 digit.';
      return;
    }

    loading = true;
    try {
      const data = await api.checkUsername(nik);
      username = data.username;
      step = 'reset';
    } catch (cause) {
      error = apiError(cause, 'Akun ujian aktif tidak ditemukan.');
    } finally {
      loading = false;
    }
  }

  async function resetPassword(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    if (password.length < 6) {
      error = 'Password baru minimal enam karakter.';
      return;
    }
    if (password !== confirmPassword) {
      error = 'Konfirmasi password tidak sama.';
      return;
    }

    loading = true;
    try {
      await api.forgotPassword({
        nik,
        username,
        email: email.trim(),
        password,
        confirm_password: confirmPassword
      });
      step = 'success';
    } catch (cause) {
      error = apiError(cause, 'Data akun tidak cocok. Periksa kembali email Anda.');
    } finally {
      loading = false;
    }
  }

  function restart() {
    username = '';
    email = '';
    password = '';
    confirmPassword = '';
    error = '';
    step = 'identify';
  }
</script>

<svelte:head><title>Pulihkan akun — OBI CBT</title></svelte:head>

<main>
  <section class="story" aria-label="Pemulihan akun">
    <div class="story-inner">
      <Brand inverse />
      <div class="story-copy">
        <p class="eyebrow">Pemulihan akun</p>
        <h1>Kembali ke ruang ujianmu dengan aman.</h1>
        <p class="lead">Kami akan mencocokkan identitasmu terlebih dahulu sebelum password dapat diperbarui.</p>
        <ol aria-label="Tahapan pemulihan akun">
          <li class:active={step === 'identify'} class:done={step !== 'identify'}><span>1</span><div><b>Temukan akun</b><small>Masukkan NIK peserta</small></div></li>
          <li class:active={step === 'reset'} class:done={step === 'success'}><span>2</span><div><b>Atur password</b><small>Verifikasi email dan password baru</small></div></li>
        </ol>
      </div>
      <p class="secure"><AppIcon name="lock" size={15} /> Data identitasmu dikirim melalui koneksi aman</p>
    </div>
  </section>

  <section class="form-side">
    <div class="form-wrap">
      <div class="mobile-brand"><Brand /></div>
      <a class="back" href="/login"><AppIcon name="back" size={17} /> Kembali ke halaman masuk</a>

      {#if step === 'identify'}
        <p class="eyebrow">Langkah 1 dari 2</p>
        <h2>Cari username</h2>
        <p class="intro">Masukkan NIK yang terdaftar pada akun ujian aktif.</p>
        <form onsubmit={findUsername}>
          <label for="nik">NIK peserta</label>
          <div class="field">
            <AppIcon name="user" size={19} />
            <input id="nik" value={nik} oninput={(event) => (nik = cleanNik(event.currentTarget.value))} inputmode="numeric" autocomplete="off" placeholder="16 digit NIK" minlength="16" maxlength="16" required />
          </div>
          <p class="hint">{nik.length}/16 digit</p>
          {#if error}<div class="error" role="alert"><AppIcon name="alert" size={18} />{error}</div>{/if}
          <button class="primary submit" type="submit" disabled={loading || nik.length !== 16}>
            {#if loading}<span class="spinner"></span>Mencari akun…{:else}Cek username <AppIcon name="arrow" size={18} />{/if}
          </button>
        </form>
      {:else if step === 'reset'}
        <p class="eyebrow">Langkah 2 dari 2</p>
        <h2>Atur password baru</h2>
        <p class="intro">Username ditemukan. Lengkapi email yang terdaftar untuk melanjutkan.</p>
        <div class="account"><span>Username</span><strong>{username}</strong><button type="button" onclick={restart}>Ganti NIK</button></div>
        <form onsubmit={resetPassword}>
          <label for="email">Email terdaftar</label>
          <div class="field"><span class="at" aria-hidden="true">@</span><input id="email" bind:value={email} type="email" autocomplete="email" placeholder="nama@email.com" required /></div>

          <label for="password">Password baru</label>
          <div class="field">
            <AppIcon name="lock" size={19} />
            <input id="password" bind:value={password} type={showPassword ? 'text' : 'password'} autocomplete="new-password" placeholder="Minimal 6 karakter" minlength="6" required />
            <button class="toggle" type="button" onclick={() => (showPassword = !showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}><AppIcon name={showPassword ? 'eyeoff' : 'eye'} size={19} /></button>
          </div>

          <label for="confirm-password">Konfirmasi password</label>
          <div class="field"><AppIcon name="lock" size={19} /><input id="confirm-password" bind:value={confirmPassword} type={showPassword ? 'text' : 'password'} autocomplete="new-password" placeholder="Ulangi password baru" minlength="6" required /></div>
          {#if error}<div class="error" role="alert"><AppIcon name="alert" size={18} />{error}</div>{/if}
          <button class="primary submit" type="submit" disabled={loading}>
            {#if loading}<span class="spinner"></span>Menyimpan…{:else}Simpan password baru <AppIcon name="arrow" size={18} />{/if}
          </button>
        </form>
      {:else}
        <div class="success-mark"><AppIcon name="check" size={34} /></div>
        <p class="eyebrow">Pemulihan berhasil</p>
        <h2>Password diperbarui</h2>
        <p class="intro">Password akun <strong>{username}</strong> sudah berhasil diubah. Silakan masuk menggunakan password baru.</p>
        <a class="primary login-link" href="/login">Masuk ke CBT <AppIcon name="arrow" size={18} /></a>
      {/if}
    </div>
  </section>
</main>

<style>
  main { min-height: 100vh; display: grid; grid-template-columns: minmax(390px, .96fr) 1.04fr; }
  .story { position: relative; overflow: hidden; color: white; background: var(--navy); }
  .story::before { content: ''; position: absolute; width: 520px; height: 520px; left: -230px; bottom: -240px; border: 1px solid rgb(255 255 255 / .08); border-radius: 50%; box-shadow: 0 0 0 70px rgb(255 255 255 / .02), 0 0 0 140px rgb(255 255 255 / .02); }
  .story-inner { position: relative; z-index: 1; min-height: 100%; padding: 3rem clamp(2.5rem, 6vw, 6rem); display: flex; flex-direction: column; }
  .story-copy { max-width: 570px; margin: auto 0; padding: 4rem 0 2rem; }
  .story .eyebrow { color: #f3aa98; }
  h1 { max-width: 540px; margin-bottom: 1.35rem; font: 400 clamp(2.6rem, 4.3vw, 4.4rem)/1.04 var(--display); letter-spacing: -.035em; }
  .lead { max-width: 490px; color: #cbd5e1; font-size: 1.05rem; line-height: 1.75; }
  ol { margin: 2.7rem 0 0; padding: 0; display: grid; gap: 1rem; list-style: none; }
  li { display: flex; align-items: center; gap: .85rem; color: #8190a5; }
  li > span { width: 2rem; height: 2rem; display: grid; place-items: center; flex: 0 0 auto; border: 1px solid #64748b; border-radius: 50%; font-size: .75rem; font-weight: 800; }
  li div { display: grid; gap: .2rem; }
  li b { font-size: .84rem; }
  li small { font-size: .72rem; }
  li.active, li.done { color: white; }
  li.active > span { border-color: var(--coral); background: var(--coral); }
  li.done > span { border-color: #5fb88e; background: #18845a; }
  .secure { margin: 0; display: flex; align-items: center; gap: .5rem; color: #9fb0c5; font-size: .72rem; }
  .form-side { background: var(--paper); display: grid; place-items: center; padding: 2rem; }
  .form-wrap { width: min(430px, 100%); }
  .mobile-brand { display: none; margin-bottom: 2.5rem; }
  .back { margin-bottom: 3.2rem; display: inline-flex; align-items: center; gap: .4rem; color: var(--muted); font-size: .78rem; font-weight: 700; text-decoration: none; }
  .back:hover { color: var(--navy); }
  h2 { margin-bottom: .7rem; color: var(--navy); font: 400 2.25rem/1.1 var(--display); letter-spacing: -.02em; }
  .intro { margin-bottom: 2.1rem; color: var(--muted); line-height: 1.6; }
  form { display: grid; }
  label { margin: 0 0 .55rem; color: var(--navy); font-size: .8rem; font-weight: 750; }
  label:not(:first-child) { margin-top: 1.2rem; }
  .field { min-height: 52px; display: flex; align-items: center; gap: .65rem; padding: 0 .85rem; color: #89919d; background: white; border: 1px solid #dcd9d2; border-radius: .7rem; transition: .18s; }
  .field:focus-within { color: var(--navy); border-color: var(--navy); box-shadow: 0 0 0 3px rgb(16 35 63 / .07); }
  input { width: 100%; height: 48px; border: 0; outline: 0; color: var(--navy); background: transparent; }
  input::placeholder { color: #a6abb2; }
  .at { font-weight: 800; }
  .hint { margin: .4rem 0 0; color: var(--muted); text-align: right; font-size: .7rem; }
  .toggle { display: grid; place-items: center; padding: .45rem; border: 0; background: transparent; color: var(--muted); cursor: pointer; }
  .submit { width: 100%; margin-top: 1.55rem; }
  .error { margin-top: 1rem; display: flex; align-items: center; gap: .55rem; padding: .75rem; color: #9c3333; background: #fff0ed; border-radius: .6rem; font-size: .8rem; }
  .spinner { width: 1.05rem; height: 1.05rem; border: 2px solid rgb(255 255 255 / .35); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }
  .account { margin-bottom: 1.5rem; padding: .9rem 1rem; display: grid; grid-template-columns: 1fr auto; gap: .2rem .75rem; border: 1px solid #d9e8df; border-radius: .7rem; background: #f1faf5; }
  .account span { color: var(--muted); font-size: .7rem; }
  .account strong { grid-row: 2; color: var(--navy); }
  .account button { grid-column: 2; grid-row: 1 / span 2; align-self: center; padding: .3rem; border: 0; color: var(--green); background: none; font-size: .72rem; font-weight: 750; cursor: pointer; }
  .success-mark { width: 4.5rem; height: 4.5rem; margin-bottom: 1.5rem; display: grid; place-items: center; color: white; background: var(--green); border-radius: 50%; box-shadow: 0 10px 25px rgb(24 132 90 / .22); }
  .login-link { width: 100%; }
  @media (max-width: 820px) {
    main { grid-template-columns: 1fr; }
    .story { display: none; }
    .form-side { min-height: 100vh; padding: 2rem 1.25rem; }
    .mobile-brand { display: block; }
    .back { margin-bottom: 2.5rem; }
  }
</style>
