<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import AppIcon from '$lib/components/AppIcon.svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import { api } from '$lib/api';
  import { auth } from '$lib/auth';
  import type { Attempt, ExamSummary } from '$lib/types';

  let exams = $state<ExamSummary[]>([]);
  let attempts = $state<Attempt[]>([]);
  let loading = $state(true);
  let error = $state('');
  let userName = $state('');

  onMount(async () => {
    if (!sessionStorage.getItem('obi_access_token')) return goto('/login');
    try {
      const [examData, me] = await Promise.all([api.exams(), api.me()]);
      exams = examData;
      attempts = me.attempts || [];
      userName = me.user.nama;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Gagal memuat daftar ujian.';
    } finally {
      loading = false;
    }
  });

  const mainExams = $derived(exams.filter((exam) => exam.kind === 'main'));
  const tryouts = $derived(exams.filter((exam) => exam.kind === 'tryout'));

  function attemptFor(examId: number) {
    return attempts.find((attempt) => attempt.exam_type_id === examId);
  }

  function actionFor(exam: ExamSummary) {
    const status = attemptFor(exam.id)?.status || 'not_started';
    if (!exam.is_ready) return { label: 'Belum tersedia', disabled: true, route: '' };
    if (status === 'in_progress') return { label: 'Lanjutkan ujian', disabled: false, route: `/exam/${exam.id}` };
    if (status === 'submitted' || status === 'expired') return { label: 'Lihat konfirmasi', disabled: false, route: `/exam/${exam.id}/completed` };
    return { label: 'Lihat detail ujian', disabled: false, route: `/exam/${exam.id}/lobby` };
  }

  function statusFor(exam: ExamSummary) {
    if (!exam.is_ready) return { text: 'Belum tersedia', className: 'unavailable' };
    const status = attemptFor(exam.id)?.status || 'not_started';
    return ({
      not_started: { text: 'Belum dimulai', className: 'new' },
      in_progress: { text: 'Sedang berlangsung', className: 'progress' },
      submitted: { text: 'Sudah dikumpulkan', className: 'done' },
      expired: { text: 'Waktu habis', className: 'expired' }
    } as const)[status];
  }
</script>

<svelte:head><title>Daftar Ujian — OBI CBT</title></svelte:head>
<Topbar {userName} />

<main class="container">
  <section class="welcome">
    <div>
      <p class="eyebrow">Dashboard peserta</p>
      <h1>Selamat datang, {userName ? userName.split(' ')[0] : 'Peserta'}.</h1>
      <p>Pilih ujian yang tersedia dan pastikan kamu membaca seluruh ketentuan sebelum memulai.</p>
    </div>
    <div class="date-card">
      <span>{new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date())}</span>
      <b>{new Date().getDate()}</b>
      <small>{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}</small>
    </div>
  </section>

  {#if loading}
    <div class="loading-grid">{#each [1,2,3] as item}<div class="skeleton"></div>{/each}</div>
  {:else if error}
    <div class="error-box"><AppIcon name="alert" /> <div><b>Daftar ujian belum dapat dimuat</b><p>{error}</p></div><button class="ghost" onclick={() => location.reload()}>Coba lagi</button></div>
  {:else}
    {@render ExamSection('Ujian Utama', 'Ujian resmi yang menentukan hasil akhir peserta.', mainExams)}
    {@render ExamSection('Tryout', 'Latihan untuk mengenal tipe soal dan alur pengerjaan.', tryouts)}
  {/if}

  <aside class="tip">
    <div class="bulb">✦</div>
    <div><b>Sebelum kamu mulai</b><p>Pastikan koneksi internet stabil, perangkat terisi daya, dan kamu berada di tempat yang tenang.</p></div>
    <span>Jawabanmu disimpan otomatis setiap ada perubahan.</span>
  </aside>
</main>

{#snippet ExamSection(title: string, subtitle: string, exams: ExamSummary[])}
  <section class="exam-section">
    <div class="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div><span>{exams.length} ujian</span></div>
    <div class="cards">
      {#each exams as exam}
        {@const status = statusFor(exam)}
        {@const action = actionFor(exam)}
        <article class:muted-card={!exam.is_ready}>
          <div class="card-top">
            <span class="kind">{exam.kind === 'main' ? 'UTAMA' : 'TRYOUT'}</span>
            <span class="status {status.className}"><i></i>{status.text}</span>
          </div>
          <h3>{exam.name}</h3>
          <p class="description">{exam.description}</p>
          <div class="meta">
            <span><AppIcon name="clock" size={17} /><b>{exam.duration_minutes}</b> menit</span>
            <span><AppIcon name="file" size={17} /><b>{exam.question_count}</b> soal</span>
          </div>
          {#if !exam.is_ready}
            <div class="readiness"><span style={`width:${Math.round(exam.ready_questions / exam.question_count * 100)}%`}></span></div>
            <small class="ready-copy">{exam.ready_questions} dari {exam.question_count} soal siap</small>
          {/if}
          <button class={exam.kind === 'main' ? 'primary action' : 'ghost action'} disabled={action.disabled} onclick={() => goto(action.route)}>
            {action.label} {#if !action.disabled}<AppIcon name="arrow" size={18} />{/if}
          </button>
        </article>
      {/each}
    </div>
  </section>
{/snippet}

<style>
  main { padding-top: 3.2rem; padding-bottom: 4rem; }
  .welcome { display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding-bottom: 2.6rem; border-bottom: 1px solid var(--line); }
  h1 { margin-bottom: .65rem; color: var(--navy); font: 400 clamp(2rem, 4vw, 3.1rem)/1.06 var(--display); letter-spacing: -.025em; }
  .welcome > div > p:last-child { max-width: 650px; margin: 0; color: var(--muted); line-height: 1.65; }
  .date-card { flex: 0 0 145px; padding: .9rem 1rem; border-left: 2px solid var(--coral); display: grid; }
  .date-card span { color: var(--coral-dark); font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
  .date-card b { color: var(--navy); font: 400 2.5rem/1 var(--display); }
  .date-card small { margin-top: .2rem; color: var(--muted); }
  .exam-section { margin-top: 3rem; }
  .section-title { display: flex; align-items: end; justify-content: space-between; margin-bottom: 1.15rem; }
  .section-title h2 { margin: 0 0 .35rem; color: var(--navy); font: 400 1.5rem var(--display); }
  .section-title p { margin: 0; color: var(--muted); font-size: .82rem; }
  .section-title > span { color: var(--muted); font-size: .72rem; font-weight: 700; }
  .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.1rem; }
  article { min-height: 310px; padding: 1.45rem; display: flex; flex-direction: column; background: white; border: 1px solid var(--line); border-radius: 1rem; box-shadow: 0 5px 18px rgb(25 36 51 / .035); transition: .2s; }
  article:hover { border-color: #d0cbc2; transform: translateY(-2px); box-shadow: var(--shadow); }
  .muted-card { background: #f5f3ee; box-shadow: none; }
  .card-top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.45rem; }
  .kind { color: var(--navy); font-size: .65rem; font-weight: 850; letter-spacing: .13em; }
  .status { display: flex; align-items: center; gap: .42rem; padding: .35rem .6rem; border-radius: 99px; font-size: .67rem; font-weight: 750; }
  .status i { width: .38rem; height: .38rem; border-radius: 50%; background: currentColor; }
  .new { color: #315b89; background: #edf4fb; }
  .progress { color: #956214; background: #fff2cd; }
  .done { color: #187450; background: #e8f6ef; }
  .expired, .unavailable { color: #74787f; background: #eae9e6; }
  h3 { margin-bottom: .7rem; color: var(--navy); font: 400 1.35rem/1.2 var(--display); }
  .description { min-height: 44px; margin-bottom: 1.4rem; color: var(--muted); font-size: .82rem; line-height: 1.65; }
  .meta { display: flex; gap: 1.4rem; color: var(--muted); font-size: .77rem; }
  .meta span { display: flex; align-items: center; gap: .35rem; }
  .meta b { color: var(--navy); }
  .action { width: 100%; margin-top: auto; }
  .readiness { height: 5px; margin: .9rem 0 .4rem; overflow: hidden; background: #dfdcd6; border-radius: 99px; }
  .readiness span { display: block; height: 100%; background: #99958d; }
  .ready-copy { color: var(--muted); font-size: .67rem; }
  .tip { margin-top: 3.5rem; padding: 1.1rem 1.3rem; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem; background: #eef3f6; border: 1px solid #dfe7ec; border-radius: .85rem; }
  .bulb { width: 2.2rem; height: 2.2rem; display: grid; place-items: center; border-radius: 50%; color: var(--coral); background: white; }
  .tip b { font-family: var(--display); font-weight: 400; color: var(--navy); }
  .tip p { margin: .2rem 0 0; color: var(--muted); font-size: .75rem; }
  .tip > span { color: #52717b; font-size: .7rem; font-weight: 700; }
  .loading-grid { margin-top: 3rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .skeleton { height: 290px; border-radius: 1rem; background: linear-gradient(90deg, #eeeae3, #f8f6f2, #eeeae3); background-size: 200%; animation: shimmer 1.3s infinite; }
  @keyframes shimmer { to { background-position: -200% 0; } }
  .error-box { margin-top: 3rem; padding: 1rem; display: flex; align-items: center; gap: .8rem; border: 1px solid #f1c8c0; background: #fff2ef; border-radius: .8rem; color: #923d31; }
  .error-box p { margin: .2rem 0 0; font-size: .8rem; }.error-box button { margin-left: auto; }
  @media (max-width: 720px) {
    main { padding-top: 2rem; }
    .date-card { display: none; }
    .cards, .loading-grid { grid-template-columns: 1fr; }
    .section-title > span, .tip > span { display: none; }
    .tip { grid-template-columns: auto 1fr; }
  }
</style>
