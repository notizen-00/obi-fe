<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import AppIcon from '$lib/components/AppIcon.svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import { ApiError, api } from '$lib/api';
  import { clearAuth } from '$lib/auth';
  import type { Attempt, ExamSummary, User } from '$lib/types';

  let exam = $state<ExamSummary | null>(null);
  let user = $state<User | null>(null);
  let attempt = $state<Attempt | null>(null);
  let loading = $state(true);
  let surveyDone = $state(false);
  let rating = $state(0);
  let kesan = $state('');
  let saran = $state('');
  let surveyError = $state('');
  let submittingSurvey = $state(false);
  const examId = $derived(Number(page.params.id));
  const status = $derived(page.url.searchParams.get('status') || attempt?.status || 'submitted');

  onMount(async () => {
    if (!sessionStorage.getItem('obi_access_token')) return goto('/login');
    try {
      const [exams, me] = await Promise.all([api.exams(), api.me()]);
      exam = exams.find((item) => item.id === examId) || null;
      user = me.user;
      attempt = me.attempts?.find((item) => item.exam_type_id === examId) || null;
      surveyDone = sessionStorage.getItem(surveyKey(me.user.id)) === 'true';
    } finally { loading = false; }
  });

  function surveyKey(userId: string) {
    return `obi_survey_${userId}_${examId}`;
  }

  async function submitSurvey(event: SubmitEvent) {
    event.preventDefault();
    if (!user || submittingSurvey) return;
    if (!rating) {
      surveyError = 'Pilih rating pelaksanaan ujian.';
      return;
    }
    if (!kesan.trim() || !saran.trim()) {
      surveyError = 'Kesan dan saran wajib diisi.';
      return;
    }
    surveyError = '';
    submittingSurvey = true;
    try {
      await api.survey(examId, rating, kesan.trim(), saran.trim());
      sessionStorage.setItem(surveyKey(user.id), 'true');
      surveyDone = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        sessionStorage.setItem(surveyKey(user.id), 'true');
        surveyDone = true;
      } else {
        surveyError = cause instanceof Error ? cause.message : 'Survey gagal dikirim. Silakan coba kembali.';
      }
    } finally {
      submittingSurvey = false;
    }
  }

  async function logout() {
    try { await api.logout(); } finally { clearAuth(); await goto('/login'); }
  }
</script>

<svelte:head><title>Ujian Selesai — OBI CBT</title></svelte:head>
<Topbar userName={user?.nama || ''} />

{#if loading}<div class="page-loader"><span></span><p>Memeriksa status ujian…</p></div>
{:else if !surveyDone}
  <main class="container survey-page">
    <section class="survey-card">
      <div class="survey-icon"><AppIcon name="file" size={28}/></div>
      <p class="eyebrow">Tahap terakhir</p>
      <h1>Bagaimana pengalaman ujianmu?</h1>
      <p class="lead">Survey ini wajib diisi satu kali sebelum proses ujian dinyatakan selesai.</p>

      <form onsubmit={submitSurvey}>
        <fieldset>
          <legend>Rating pelaksanaan ujian</legend>
          <div class="ratings">
            {#each [1, 2, 3, 4, 5] as value}
              <button type="button" class:selected={rating === value} aria-pressed={rating === value} onclick={() => (rating = value)}>
                <b>{value}</b><small>{value === 1 ? 'Buruk' : value === 5 ? 'Sangat baik' : ''}</small>
              </button>
            {/each}
          </div>
        </fieldset>

        <label for="kesan">Kesan selama mengikuti ujian</label>
        <textarea id="kesan" bind:value={kesan} maxlength="1000" rows="4" placeholder="Ceritakan pengalamanmu selama ujian..." required></textarea>

        <label for="saran">Saran untuk pelaksanaan berikutnya</label>
        <textarea id="saran" bind:value={saran} maxlength="1000" rows="4" placeholder="Tuliskan saran yang dapat membantu kami..." required></textarea>

        {#if surveyError}<div class="survey-error" role="alert"><AppIcon name="alert" size={17}/>{surveyError}</div>{/if}
        <button class="primary survey-submit" type="submit" disabled={submittingSurvey || !rating}>
          {submittingSurvey ? 'Mengirim survey...' : 'Kirim survey dan selesaikan'} {#if !submittingSurvey}<AppIcon name="arrow" size={18}/>{/if}
        </button>
        <small class="one-time"><AppIcon name="lock" size={13}/> Survey hanya dapat dikirim satu kali.</small>
      </form>
    </section>
  </main>
{:else}
  <main class="container">
    <section class="card">
      <div class="success-art" aria-hidden="true">
        <i></i><span><AppIcon name="check" size={42}/></span><i></i>
      </div>
      <p class="eyebrow">{status === 'expired' ? 'Waktu telah berakhir' : 'Ujian telah dikumpulkan'}</p>
      <h1>{status === 'expired' ? 'Waktu ujian selesai.' : 'Kerja bagus, ujianmu selesai.'}</h1>
      <p class="lead">{status === 'expired' ? 'Jawaban terakhir yang tersimpan telah kami terima.' : 'Seluruh jawaban berhasil diterima dan tersimpan di sistem OBI CBT.'}</p>

      <div class="receipt">
        <div><small>Nama ujian</small><b>{exam?.name || 'Ujian OBI'}</b></div>
        <div><small>Status</small><b class="status"><span></span>{status === 'expired' ? 'Waktu habis' : 'Sudah dikumpulkan'}</b></div>
        <div><small>Nama peserta</small><b>{user?.nama || 'Peserta OBI'}</b></div>
        <div><small>Waktu pengumpulan</small><b>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(attempt?.submitted_at ? new Date(attempt.submitted_at) : new Date())} WIB</b></div>
      </div>

      <div class="notice"><AppIcon name="file" size={20}/><p><b>Hasil ujian akan diumumkan oleh panitia.</b><span>Skor tidak ditampilkan pada halaman ini. Pantau informasi resmi dari OBI.</span></p></div>
      <div class="actions">
        <a class="primary" href="/exams">Kembali ke daftar ujian <AppIcon name="arrow" size={18}/></a>
        <button class="ghost" onclick={logout}><AppIcon name="logout" size={18}/> Keluar dari akun</button>
      </div>
      <p class="secure"><AppIcon name="lock" size={13}/> Kamu boleh menutup halaman ini dengan aman.</p>
    </section>
  </main>
{/if}

<style>
  main { min-height: calc(100vh - 76px); padding-top: 3.5rem; padding-bottom: 4rem; display: grid; place-items: start center; }
  .card { width: min(680px, 100%); padding: 2.5rem clamp(1.2rem, 5vw, 3.5rem); text-align: center; background: white; border: 1px solid var(--line); border-radius: 1.2rem; box-shadow: var(--shadow); position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; inset: 0 0 auto; height: 5px; background: linear-gradient(90deg, var(--navy), var(--coral)); }
  .success-art { height: 90px; margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 1.5rem; }
  .success-art span { width: 5rem; height: 5rem; display: grid; place-items: center; color: white; background: var(--green); border-radius: 50%; box-shadow: 0 0 0 11px #e7f5ee, 0 12px 28px rgb(24 132 90 / .18); }
  .success-art i { width: 45px; height: 1px; background: var(--line); position: relative; }.success-art i::after { content: ''; position: absolute; width: 6px; height: 6px; top: -3px; border-radius: 50%; background: var(--coral); }
  .success-art i:first-child::after { left: 0; }.success-art i:last-child::after { right: 0; }
  h1 { margin-bottom: .8rem; color: var(--navy); font: 400 clamp(2rem, 5vw, 2.8rem)/1.08 var(--display); letter-spacing: -.025em; }
  .lead { max-width: 520px; margin: 0 auto 2rem; color: var(--muted); line-height: 1.65; }
  .receipt { display: grid; grid-template-columns: 1fr 1fr; text-align: left; border: 1px solid var(--line); border-radius: .8rem; overflow: hidden; }
  .receipt > div { min-height: 78px; padding: .9rem 1rem; display: grid; gap: .25rem; align-content: center; }.receipt > div:nth-child(odd) { border-right: 1px solid var(--line); }.receipt > div:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
  .receipt small { color: var(--muted); font-size: .64rem; }.receipt b { color: var(--navy); font-size: .76rem; }.status { display: flex; align-items: center; gap: .4rem; color: var(--green) !important; }.status span { width: .42rem; height: .42rem; border-radius: 50%; background: currentColor; }
  .notice { margin: 1.3rem 0; padding: .9rem 1rem; display: flex; align-items: center; gap: .7rem; text-align: left; color: #55707f; background: #eff5f7; border-radius: .7rem; }.notice p { margin: 0; display: grid; gap: .2rem; }.notice b { color: var(--navy); font-size: .75rem; }.notice span { font-size: .68rem; }
  .actions { display: grid; grid-template-columns: 1.2fr 1fr; gap: .7rem; }.secure { margin: 1.2rem 0 0; display: flex; justify-content: center; align-items: center; gap: .35rem; color: var(--muted); font-size: .62rem; }
  .survey-page { padding-top: 2.5rem; }
  .survey-card { width: min(680px, 100%); padding: 2.3rem clamp(1.2rem, 5vw, 3rem); background: white; border: 1px solid var(--line); border-radius: 1.2rem; box-shadow: var(--shadow); }
  .survey-card h1, .survey-card .lead, .survey-card .eyebrow { text-align: center; }
  .survey-icon { width: 4rem; height: 4rem; margin: 0 auto 1rem; display: grid; place-items: center; color: var(--coral); background: #fff0eb; border-radius: 50%; }
  .survey-card form { display: grid; gap: .7rem; }.survey-card fieldset { margin: .4rem 0 1rem; padding: 0; border: 0; }
  .survey-card legend, .survey-card label { margin-bottom: .55rem; color: var(--navy); font-size: .78rem; font-weight: 750; }
  .ratings { display: grid; grid-template-columns: repeat(5, 1fr); gap: .5rem; }
  .ratings button { min-height: 64px; display: grid; place-items: center; align-content: center; gap: .15rem; color: var(--muted); background: #faf9f6; border: 1px solid var(--line); border-radius: .65rem; cursor: pointer; }
  .ratings button b { font: 1.25rem var(--display); }.ratings button small { min-height: .75rem; font-size: .55rem; }
  .ratings button.selected { color: white; background: var(--navy); border-color: var(--navy); box-shadow: 0 0 0 3px rgb(16 35 63 / .1); }
  textarea { width: 100%; resize: vertical; padding: .8rem; color: var(--navy); background: white; border: 1px solid #dcd9d2; border-radius: .7rem; font: inherit; line-height: 1.5; outline: 0; }
  textarea:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgb(16 35 63 / .07); }
  .survey-submit { width: 100%; margin-top: .8rem; }.survey-error { padding: .7rem; display: flex; align-items: center; gap: .5rem; color: #9c3333; background: #fff0ed; border-radius: .6rem; font-size: .75rem; }
  .one-time { display: flex; justify-content: center; align-items: center; gap: .35rem; color: var(--muted); font-size: .62rem; }  @media (max-width: 560px) { main { padding-top: 1rem; }.card { padding-top: 2rem; }.receipt { grid-template-columns: 1fr; }.receipt > div { border-right: 0 !important; border-bottom: 1px solid var(--line); }.actions { grid-template-columns: 1fr; } }
</style>
