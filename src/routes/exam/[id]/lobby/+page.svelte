<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import AppIcon from '$lib/components/AppIcon.svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import { api } from '$lib/api';
  import type { ExamSummary, User } from '$lib/types';

  let exam = $state<ExamSummary | null>(null);
  let user = $state<User | null>(null);
  let loading = $state(true);
  let starting = $state(false);
  let rulesOpen = $state(false);
  let rulesAccepted = $state(false);
  let error = $state('');
  const examId = $derived(Number(page.params.id));

  onMount(async () => {
    if (!sessionStorage.getItem('obi_access_token')) return goto('/login');
    try {
      const [exams, me] = await Promise.all([api.exams(), api.me()]);
      exam = exams.find((item) => item.id === examId) || null;
      user = me.user;
      if (!exam) error = 'Ujian tidak ditemukan.';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Gagal memuat informasi ujian.';
    } finally { loading = false; }
  });

  function openRules() {
    error = '';
    rulesAccepted = false;
    rulesOpen = true;
  }

  function closeRules() {
    if (starting) return;
    rulesOpen = false;
    rulesAccepted = false;
  }

  async function start() {
    if (!exam || starting || !rulesAccepted) return;
    starting = true;
    error = '';
    try {
      if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
        throw new Error('Browser ini tidak mendukung mode layar penuh yang diwajibkan untuk ujian. Gunakan browser terbaru.');
      }
      await document.documentElement.requestFullscreen();
      rulesOpen = false;
      await api.start(exam.id, exam.kind);
      await goto(`/exam/${exam.id}`);
    } catch (cause) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      error = cause instanceof Error ? cause.message : 'Ujian belum dapat dimulai.';
      starting = false;
    }
  }
</script>

<svelte:head><title>Persiapan Ujian — OBI CBT</title></svelte:head>
<Topbar userName={user?.nama || ''} />

{#if loading}<div class="page-loader"><span></span><p>Menyiapkan ruang ujian…</p></div>
{:else if error && !exam}
  <main class="state"><AppIcon name="alert" size={30}/><h1>Ujian tidak tersedia</h1><p>{error}</p><a class="ghost" href="/exams">Kembali ke daftar ujian</a></main>
{:else if exam && user}
  <main class="container">
    <a class="back" href="/exams"><AppIcon name="back" size={17}/> Kembali ke daftar ujian</a>
    <section class="hero">
      <div>
        <span class="kind">{exam.kind === 'main' ? 'Ujian Utama' : 'Tryout'}</span>
        <h1>{exam.name}</h1>
        <p>{exam.description}</p>
      </div>
      <div class="ready"><span><AppIcon name="check" size={22}/></span><div><b>Ujian siap dimulai</b><small>Semua soal telah tersedia</small></div></div>
    </section>

    <div class="layout">
      <section class="details">
        <p class="eyebrow">Informasi ujian</p>
        <h2>Kenali ujianmu sebelum memulai</h2>
        <div class="info-grid">
          <div><AppIcon name="user" size={22}/><span><small>Nama peserta</small><b>{user.nama}</b></span></div>
          <div><AppIcon name="school" size={22}/><span><small>Asal sekolah</small><b>{user.sekolah}</b></span></div>
          <div><AppIcon name="clock" size={22}/><span><small>Durasi ujian</small><b>{exam.duration_minutes} menit</b></span></div>
          <div><AppIcon name="file" size={22}/><span><small>Jumlah soal</small><b>{exam.question_count} soal pilihan ganda</b></span></div>
        </div>
        <div class="rules">
          <h3>Ketentuan pengerjaan</h3>
          <ol>
            <li><span>01</span><p>Timer dimulai setelah tombol <b>“Mulai ujian”</b> ditekan.</p></li>
            <li><span>02</span><p>Jawaban tersimpan otomatis. Pastikan indikator menunjukkan <b>“Tersimpan”</b>.</p></li>
            <li><span>03</span><p>Gunakan fitur <b>“Tandai ragu-ragu”</b> untuk soal yang ingin ditinjau lagi.</p></li>
            <li><span>04</span><p>Ujian wajib dikerjakan dalam <b>mode layar penuh</b>. Pindah tab atau keluar dari layar penuh akan mengunci ujian sampai peserta kembali.</p></li>
            <li><span>05</span><p>Refresh, menutup halaman, copy-paste, klik kanan, dan shortcut navigasi dibatasi selama ujian.</p></li>
          </ol>
        </div>
      </section>
      <aside>
        <div class="clock-visual"><AppIcon name="clock" size={30}/></div>
        <p class="eyebrow">Siap mengerjakan?</p>
        <h2>Waktumu akan berjalan selama</h2>
        <strong>{exam.duration_minutes}<small>menit</small></strong>
        <p>Pastikan koneksi internet stabil dan jangan menutup halaman ujian.</p>
        {#if error}<div class="error" role="alert">{error}</div>{/if}
        <button class="primary" onclick={openRules} disabled={starting}>Mulai ujian <AppIcon name="arrow" size={18}/></button>
        <small class="note"><AppIcon name="lock" size={13}/> Dengan memulai, kamu menyetujui ketentuan ujian.</small>
      </aside>
    </div>
  </main>
{/if}

{#if rulesOpen && exam}
  <div class="rules-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && closeRules()}>
    <div class="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" aria-describedby="rules-description">
      <button class="rules-close" onclick={closeRules} disabled={starting} aria-label="Tutup aturan ujian"><AppIcon name="close" size={18}/></button>
      <div class="rules-icon"><AppIcon name="lock" size={25}/></div>
      <p class="eyebrow">Persetujuan peserta</p>
      <h2 id="rules-title">Aturan dan larangan ujian</h2>
      <p id="rules-description" class="rules-lead">Baca seluruh ketentuan sebelum memulai <b>{exam.name}</b>. Timer berjalan setelah kamu menyetujui aturan berikut.</p>

      <div class="rules-sections">
        <div>
          <h3><span>01</span> Aturan pengerjaan</h3>
          <ul>
            <li>Kerjakan ujian dalam mode layar penuh sampai selesai.</li>
            <li>Pastikan koneksi internet dan daya perangkat stabil.</li>
            <li>Periksa indikator penyimpanan sebelum berpindah soal.</li>
            <li>Kumpulkan ujian hanya setelah seluruh jawaban diperiksa.</li>
          </ul>
        </div>
        <div class="prohibited">
          <h3><span>02</span> Larangan selama ujian</h3>
          <ul>
            <li>Dilarang membuka atau berpindah ke tab, window, dan aplikasi lain.</li>
            <li>Dilarang refresh, menutup halaman, atau keluar dari layar penuh.</li>
            <li>Dilarang copy-paste, klik kanan, mencetak, atau mengambil konten soal.</li>
            <li>Dilarang membuka DevTools atau mencoba memanipulasi sistem ujian.</li>
          </ul>
        </div>
      </div>

      <label class="rules-consent">
        <input type="checkbox" bind:checked={rulesAccepted} disabled={starting} />
        <span>Saya sudah membaca, memahami, dan bersedia mematuhi seluruh aturan ujian.</span>
      </label>

      {#if error}<div class="rules-error" role="alert"><AppIcon name="alert" size={17}/>{error}</div>{/if}
      <div class="rules-actions">
        <button class="ghost" onclick={closeRules} disabled={starting}>Batal</button>
        <button class="primary" onclick={start} disabled={!rulesAccepted || starting}>
          {starting ? 'Menyiapkan soal…' : 'Saya mengerti, mulai ujian'}
          {#if !starting}<AppIcon name="arrow" size={18}/>{/if}
        </button>
      </div>
      <small class="rules-note"><AppIcon name="clock" size={13}/> Durasi ujian: {exam.duration_minutes} menit</small>
    </div>
  </div>
{/if}

<style>
  main.container { padding-top: 2.2rem; padding-bottom: 4rem; }
  .back { display: inline-flex; align-items: center; gap: .4rem; color: var(--muted); font-size: .75rem; font-weight: 700; text-decoration: none; }
  .hero { margin-top: 1.5rem; padding: 2.2rem 2.4rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; color: white; background: var(--navy); border-radius: 1.15rem; overflow: hidden; position: relative; }
  .hero::after { content: ''; position: absolute; right: -80px; width: 260px; height: 260px; border-radius: 50%; border: 1px solid rgb(255 255 255 / .08); box-shadow: 0 0 0 45px rgb(255 255 255 / .025); }
  .hero > * { position: relative; z-index: 1; }
  .kind { color: #f5a18d; font-size: .68rem; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }
  .hero h1 { margin: .55rem 0 .5rem; font: 400 clamp(1.8rem, 3vw, 2.65rem)/1.1 var(--display); }
  .hero p { max-width: 600px; margin: 0; color: #bfcbd9; font-size: .85rem; }
  .ready { display: flex; align-items: center; gap: .7rem; padding: .8rem 1rem; background: rgb(255 255 255 / .08); border: 1px solid rgb(255 255 255 / .1); border-radius: .8rem; }
  .ready > span { width: 2.2rem; height: 2.2rem; display: grid; place-items: center; color: #56c994; background: rgb(86 201 148 / .12); border-radius: 50%; }
  .ready div { display: grid; gap: .2rem; white-space: nowrap; }.ready b { font-size: .78rem; }.ready small { color: #aebed1; font-size: .65rem; }
  .layout { margin-top: 1.5rem; display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 1.4rem; }
  .details, aside { padding: 2rem; background: white; border: 1px solid var(--line); border-radius: 1rem; }
  .details h2 { margin-bottom: 1.5rem; color: var(--navy); font: 400 1.55rem var(--display); }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--line); border-radius: .8rem; overflow: hidden; }
  .info-grid > div { min-height: 90px; padding: 1rem 1.15rem; display: flex; align-items: center; gap: .85rem; color: var(--coral-dark); }
  .info-grid > div:nth-child(odd) { border-right: 1px solid var(--line); }.info-grid > div:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
  .info-grid span { display: grid; gap: .25rem; }.info-grid small { color: var(--muted); font-size: .65rem; }.info-grid b { color: var(--navy); font-size: .82rem; }
  .rules { margin-top: 2rem; padding-top: 1.7rem; border-top: 1px solid var(--line); }
  .rules h3 { margin-bottom: 1rem; color: var(--navy); font: 400 1.1rem var(--display); }
  ol { margin: 0; padding: 0; display: grid; gap: .8rem; list-style: none; }
  li { display: flex; align-items: center; gap: .9rem; }
  li > span { color: var(--coral-dark); font: .8rem var(--display); }
  li p { margin: 0; color: var(--muted); font-size: .77rem; line-height: 1.55; }li b { color: var(--navy); }
  aside { text-align: center; box-shadow: var(--shadow); }
  .clock-visual { width: 4.5rem; height: 4.5rem; margin: .5rem auto 1.3rem; display: grid; place-items: center; color: var(--coral); background: #fff0eb; border-radius: 50%; box-shadow: 0 0 0 9px #fff8f5; }
  aside h2 { margin-bottom: .8rem; color: var(--navy); font: 400 1.18rem var(--display); }
  aside strong { display: flex; align-items: baseline; justify-content: center; gap: .4rem; color: var(--navy); font: 400 3.6rem/1 var(--display); }
  aside strong small { color: var(--muted); font: 500 .85rem Inter, ui-sans-serif, system-ui, sans-serif; }
  aside > p:not(.eyebrow) { margin: 1.2rem 0 1.5rem; color: var(--muted); font-size: .76rem; line-height: 1.6; }
  aside button { width: 100%; }.note { margin-top: .9rem; display: flex; align-items: center; justify-content: center; gap: .35rem; color: #8a9098; font-size: .62rem; }
  .error { margin-bottom: .8rem; padding: .6rem; color: #9a3939; background: #fff0ed; border-radius: .5rem; font-size: .72rem; }
  .rules-backdrop { position: fixed; inset: 0; z-index: 100; padding: 1rem; display: grid; place-items: center; overflow-y: auto; background: rgb(8 20 38 / .82); backdrop-filter: blur(7px); }
  .rules-modal { width: min(720px, 100%); max-height: calc(100vh - 2rem); padding: clamp(1.3rem, 4vw, 2rem); overflow-y: auto; background: white; border-radius: 1.1rem; box-shadow: 0 28px 80px rgb(0 0 0 / .35); position: relative; }
  .rules-close { width: 2.2rem; height: 2.2rem; display: grid; place-items: center; color: var(--muted); background: #f5f4f0; border: 0; border-radius: 50%; cursor: pointer; position: absolute; top: 1rem; right: 1rem; }
  .rules-icon { width: 3.7rem; height: 3.7rem; margin-bottom: 1rem; display: grid; place-items: center; color: white; background: var(--navy); border-radius: 50%; }
  .rules-modal h2 { margin: .35rem 0 .65rem; color: var(--navy); font: 400 clamp(1.55rem, 4vw, 2rem)/1.15 var(--display); }.rules-lead { margin: 0; color: var(--muted); font-size: .8rem; line-height: 1.65; }.rules-lead b { color: var(--navy); }
  .rules-sections { margin: 1.4rem 0; display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }.rules-sections > div { padding: 1rem; background: #f7f8f8; border: 1px solid #e2e7e9; border-radius: .8rem; }.rules-sections .prohibited { background: #fff6f3; border-color: #f1d8d1; }
  .rules-sections h3 { margin: 0 0 .75rem; display: flex; align-items: center; gap: .45rem; color: var(--navy); font-size: .78rem; }.rules-sections h3 span { color: var(--coral-dark); font: .75rem var(--display); }
  .rules-sections ul { margin: 0; padding-left: 1.05rem; display: grid; gap: .5rem; }.rules-sections li { display: list-item; color: #596570; font-size: .7rem; line-height: 1.5; }.rules-sections li::marker { color: var(--coral); }
  .rules-consent { padding: .85rem; display: flex; align-items: flex-start; gap: .7rem; color: var(--navy); background: #edf5f2; border: 1px solid #cfe3da; border-radius: .7rem; font-size: .74rem; font-weight: 650; line-height: 1.5; cursor: pointer; }.rules-consent input { width: 1rem; height: 1rem; margin-top: .1rem; accent-color: var(--navy); flex: 0 0 auto; }
  .rules-error { margin-top: .8rem; padding: .7rem; display: flex; align-items: center; gap: .5rem; color: #943b32; background: #fff0ed; border-radius: .6rem; font-size: .72rem; }
  .rules-actions { margin-top: 1rem; display: grid; grid-template-columns: .7fr 1.5fr; gap: .7rem; }.rules-actions button { width: 100%; }.rules-note { margin-top: .8rem; display: flex; justify-content: center; align-items: center; gap: .35rem; color: var(--muted); font-size: .62rem; }
  .state { min-height: 70vh; display: grid; place-content: center; justify-items: center; text-align: center; }.state h1 { font-family: var(--display); }.state p { color: var(--muted); }
  @media (max-width: 800px) { .layout { grid-template-columns: 1fr; }.ready { display: none; } aside { order: -1; }.hero { padding: 1.6rem; } }
  @media (max-width: 560px) { .info-grid { grid-template-columns: 1fr; }.info-grid > div { border-right: 0 !important; border-bottom: 1px solid var(--line); }.details, aside { padding: 1.25rem; }.rules-sections { grid-template-columns: 1fr; }.rules-actions { grid-template-columns: 1fr; } }
</style>
