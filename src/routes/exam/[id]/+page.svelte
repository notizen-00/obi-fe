<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import AppIcon from '$lib/components/AppIcon.svelte';
  import Brand from '$lib/components/Brand.svelte';
  import { api } from '$lib/api';
  import { formatDuration, getRemaining, getServerOffset, resolveExamEnd } from '$lib/time';
  import { StrictExamGuard } from '$lib/exam-security';
  import type { ActiveExam, Answer, ExamSummary, SaveState, User } from '$lib/types';

  let active = $state<ActiveExam | null>(null);
  let user = $state<User | null>(null);
  let current = $state(0);
  let answers = $state<Record<string, Answer>>({});
  let marked = $state<Set<number>>(new Set());
  let remaining = $state(0);
  let offset = $state(0);
  let examEndsAt = $state('');
  let saveState = $state<SaveState>('idle');
  let lastSaved = $state('');
  let online = $state(true);
  let drawerOpen = $state(false);
  let modalOpen = $state(false);
  let loading = $state(true);
  let error = $state('');
  let submitting = $state(false);
  let securityLocked = $state(false);
  let securityMessage = $state('Aktifkan layar penuh untuk melanjutkan ujian.');
  let saveRunning = false;
  let saveQueued = false;
  let dirty = false;
  let debounceTimer: ReturnType<typeof setTimeout>;
  let retryTimer: ReturnType<typeof setTimeout>;
  let retryCount = 0;
  let timerInterval: ReturnType<typeof setInterval>;
  let periodicInterval: ReturnType<typeof setInterval>;
  let timeUpHandled = false;
  let guard: StrictExamGuard;
  let drawerDialog = $state<HTMLDivElement>();
  const examId = $derived(Number(page.params.id));
  const question = $derived(active?.questions[current]);
  const answeredCount = $derived(Object.keys(answers).length);
  const warning = $derived(remaining <= 180_000 ? 'critical' : remaining <= 600_000 ? 'warning' : '');

  onMount(() => {
    online = navigator.onLine;
    guard = new StrictExamGuard({
      onState: ({ reason, locked }) => {
        securityLocked = locked;
        securityMessage = reason;
        cacheLocal();
        if (dirty) void saveAnswers();
      },
      onBeforeExit: () => {
        cacheLocal();
        if (active && online) void api.save(active.exam.id, { ...answers }, true);
      }
    });
    const handleOnline = () => { online = true; if (dirty) void saveAnswers(); };
    const handleOffline = () => { online = false; if (dirty) saveState = 'offline'; };
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (modalOpen && !submitting) modalOpen = false;
      else if (drawerOpen) closeDrawer();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('keydown', handleKeydown);

    void load();
    timerInterval = setInterval(tick, 1000);
    periodicInterval = setInterval(() => { if (dirty) void saveAnswers(); }, 20_000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(periodicInterval);
      clearTimeout(debounceTimer);
      clearTimeout(retryTimer);
      guard.disable();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  $effect(() => {
    if (!drawerOpen && !modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  });

  async function load() {
    if (!sessionStorage.getItem('obi_access_token')) return goto('/login');
    try {
      const [exams, me] = await Promise.all([api.exams(), api.me()]);
      const exam = exams.find((item) => item.id === examId);
      if (!exam) throw new Error('Ujian tidak ditemukan.');
      user = me.user;
      const attempt = me.attempts?.find((item) => item.exam_type_id === examId);
      if (attempt && ['submitted', 'expired'].includes(attempt.status)) return goto(`/exam/${examId}/completed`);
      active = await api.exam(exam);
      if (active.questions.some((item: any) => 'correct_option' in item)) throw new Error('Respons soal tidak aman dan telah ditolak.');
      answers = { ...active.answers };
      offset = getServerOffset(active.server_time);
      examEndsAt = resolveExamEnd(
        active.server_time,
        active.start_at || attempt?.start_at,
        active.ends_at,
        active.exam.duration_minutes
      );
      remaining = getRemaining(examEndsAt, offset);
      restoreLocal(exam);
      guard.enable();
      saveState = 'idle';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Ruang ujian gagal dimuat.';
    } finally { loading = false; }
  }

  function restoreLocal(exam: ExamSummary) {
    if (!user) return;
    const raw = sessionStorage.getItem(cacheKey(exam.id));
    if (!raw) return;
    try {
      const local = JSON.parse(raw);
      if (local.answers && Object.keys(local.answers).length >= Object.keys(answers).length) {
        answers = local.answers;
        marked = new Set(local.marked || []);
        current = Math.min(local.current || 0, exam.question_count - 1);
        dirty = true;
        saveState = online ? 'dirty' : 'offline';
      }
    } catch { sessionStorage.removeItem(cacheKey(exam.id)); }
  }

  function cacheKey(id: number) {
    return `obi_exam_${user?.id || 'user'}_${id}`;
  }

  function cacheLocal() {
    if (!active) return;
    sessionStorage.setItem(cacheKey(active.exam.id), JSON.stringify({
      answers, marked: [...marked], current, updatedAt: Date.now()
    }));
  }

  function selectAnswer(answer: Answer) {
    if (!question || submitting || remaining <= 0) return;
    answers = { ...answers, [String(question.question_no)]: answer };
    dirty = true;
    saveState = online ? 'dirty' : 'offline';
    cacheLocal();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void saveAnswers(), 1000);
  }

  async function saveAnswers(): Promise<boolean> {
    if (!active || !dirty) return true;
    if (!online) { saveState = 'offline'; return false; }
    if (saveRunning) { saveQueued = true; return true; }
    saveRunning = true;
    dirty = false;
    saveState = 'saving';
    const snapshot = { ...answers };
    try {
      await api.save(active.exam.id, snapshot);
      retryCount = 0;
      lastSaved = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
      saveState = dirty ? 'dirty' : 'saved';
      cacheLocal();
      return true;
    } catch {
      dirty = true;
      saveState = online ? 'error' : 'offline';
      const delays = [2000, 4000, 8000, 15000];
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => void saveAnswers(), delays[Math.min(retryCount++, delays.length - 1)]);
      return false;
    } finally {
      saveRunning = false;
      if (saveQueued || dirty && saveState === 'dirty') {
        saveQueued = false;
        void saveAnswers();
      }
    }
  }

  function tick() {
    if (!active || !examEndsAt) return;
    remaining = getRemaining(examEndsAt, offset);
    if (remaining === 0 && !timeUpHandled) {
      timeUpHandled = true;
      void submitExam(true);
    }
  }

  function goTo(index: number) {
    if (!active || index < 0 || index >= active.questions.length) return;
    current = index;
    drawerOpen = false;
    cacheLocal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openDrawer() {
    drawerOpen = true;
    requestAnimationFrame(() => drawerDialog?.focus());
  }

  function closeDrawer() {
    drawerOpen = false;
  }

  function toggleMarked() {
    const next = new Set(marked);
    if (next.has(current)) next.delete(current); else next.add(current);
    marked = next;
    cacheLocal();
  }

  async function resumeSecureExam() {
    if (submitting) return;
    try {
      await guard.enterFullscreen();
      securityLocked = false;
    } catch (cause) {
      securityMessage = cause instanceof Error ? cause.message : 'Layar penuh gagal diaktifkan.';
    }
  }

  async function submitExam(expired = false) {
    if (!active || submitting) return;
    submitting = true;
    modalOpen = false;
    clearTimeout(debounceTimer);
    try {
      const saved = await saveAnswers();
      if (!saved) throw new Error('Jawaban terakhir belum berhasil disimpan. Periksa koneksi lalu coba kembali.');
      await api.submit(active.exam.id);
      sessionStorage.removeItem(cacheKey(active.exam.id));
      guard.allowExit();
      guard.disable();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      await goto(`/exam/${active.exam.id}/completed?status=${expired ? 'expired' : 'submitted'}`);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Ujian gagal dikumpulkan. Silakan coba lagi.';
      submitting = false;
      if (!expired) modalOpen = true;
    }
  }

  function saveLabel() {
    return {
      idle: 'Semua jawaban tersimpan',
      dirty: 'Belum tersimpan',
      saving: 'Menyimpan…',
      saved: `Tersimpan ${lastSaved}`,
      offline: 'Offline — belum terkirim',
      error: 'Gagal menyimpan — mencoba lagi'
    }[saveState];
  }
</script>

<svelte:head><title>{active?.exam.name || 'Ruang Ujian'} — OBI CBT</title></svelte:head>

{#if loading}<div class="page-loader"><span></span><p>Mengambil soal dan jawabanmu…</p></div>
{:else if error && !active}
  <main class="error-state"><AppIcon name="alert" size={32}/><h1>Ruang ujian belum dapat dibuka</h1><p>{error}</p><button class="ghost" onclick={() => location.reload()}>Coba lagi</button></main>
{:else if active && question}
  <div class="exam-shell" aria-busy={submitting}>
    <header>
      <div class="header-left">
        <Brand inverse compact />
        <span class="divider"></span>
        <div class="exam-name"><small>{active.exam.kind === 'main' ? 'Ujian Utama' : 'Tryout'}</small><b>{active.exam.name}</b></div>
      </div>
      <div class="header-right">
        <div class="sync" class:offline={!online} class:saving={saveState === 'saving'}>
          <AppIcon name={online ? 'wifi' : 'alert'} size={17}/>
          <span><small>{online ? 'Terhubung' : 'Koneksi terputus'}</small><b>{saveLabel()}</b></span>
        </div>
        <div class="timer {warning}">
          <AppIcon name="clock" size={20}/><span><small>Sisa waktu</small><b>{formatDuration(remaining)}</b></span>
        </div>
      </div>
    </header>

    {#if !online}<div class="offline-banner" role="alert"><AppIcon name="alert" size={16}/> Koneksi terputus. Jawaban tetap tersimpan di perangkat dan akan dikirim saat koneksi pulih.</div>{/if}
    <div class="security-banner" role="status">
      <AppIcon name="lock" size={15}/>
      Mode ujian ketat aktif
    </div>

    <main>
      <section class="question-area">
        <div class="progress-row">
          <span>Soal <b>{current + 1}</b> dari {active.questions.length}</span>
          <span>{answeredCount} terjawab</span>
        </div>
        <div class="progress"><span style={`width:${((current + 1) / active.questions.length) * 100}%`}></span></div>

        <article class="question-card">
          <div class="question-head">
            <div><span>PERTANYAAN</span><b>{String(current + 1).padStart(2, '0')}</b></div>
            <button class:marked={marked.has(current)} onclick={toggleMarked}><AppIcon name="flag" size={17}/>{marked.has(current) ? 'Ditandai ragu-ragu' : 'Tandai ragu-ragu'}</button>
          </div>
          {#each question.question_text.split('\n') as paragraph}
            {#if paragraph}
              <p class="question-text">{paragraph}</p>
            {:else}
              <br />
            {/if}
          {/each}

          <fieldset disabled={submitting || remaining <= 0}>
            <legend class="sr-only">Pilihan jawaban</legend>
            {#each ['A','B','C','D','E'] as letter}
              {@const answer = letter as Answer}
              {@const text = question[`option_${letter.toLowerCase()}` as keyof typeof question]}
              <label class:selected={answers[String(question.question_no)] === answer}>
                <input type="radio" name={`question-${question.question_no}`} value={answer} checked={answers[String(question.question_no)] === answer} onchange={() => selectAnswer(answer)} />
                <span class="letter">{letter}</span>
                <span class="answer-text">{text}</span>
                <span class="check"><AppIcon name="check" size={17}/></span>
              </label>
            {/each}
          </fieldset>
        </article>

        <div class="nav-actions">
          <button class="ghost" onclick={() => goTo(current - 1)} disabled={current === 0}><AppIcon name="back" size={18}/> Sebelumnya</button>
          <button class="mobile-grid ghost" onclick={openDrawer} aria-haspopup="dialog" aria-expanded={drawerOpen}><AppIcon name="grid" size={18}/> Nomor soal</button>
          <button class="secondary" onclick={() => goTo(current + 1)} disabled={current === active.questions.length - 1}>Berikutnya <AppIcon name="arrow" size={18}/></button>
        </div>
      </section>

      <aside class="navigator">
        <div class="nav-title"><div><p class="eyebrow">Navigasi soal</p><h2>Daftar Pertanyaan</h2></div><span>{answeredCount}/{active.questions.length}</span></div>
        <div class="legend"><span><i class="answered"></i>Terjawab</span><span><i></i>Belum</span><span><i class="flagged"></i>Ragu</span></div>
        <div class="numbers">
          {#each active.questions as item, index}
            <button class:active={index === current} class:answered={Boolean(answers[String(item.question_no)])} class:flagged={marked.has(index)} onclick={() => goTo(index)} aria-label={`Soal ${index + 1}${answers[String(item.question_no)] ? ', sudah dijawab' : ''}`}>
              {index + 1}{#if marked.has(index)}<i></i>{/if}
            </button>
          {/each}
        </div>
        <div class="summary">
          <div><span style={`--value:${answeredCount / active.questions.length * 360}deg`}></span></div>
          <p><b>{answeredCount} soal terjawab</b><small>{active.questions.length - answeredCount} soal belum dijawab</small></p>
        </div>
        <button class="finish" onclick={() => (modalOpen = true)} disabled={submitting}><AppIcon name="check" size={18}/> Selesai Ujian</button>
        <small class="finish-note">Pastikan semua jawaban sudah sesuai sebelum mengumpulkan.</small>
      </aside>
    </main>
  </div>

  {#if drawerOpen}
    <div class="drawer-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && closeDrawer()} transition:fade={{ duration: 180 }}>
      <div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1" bind:this={drawerDialog} transition:fly={{ y: 480, duration: 240 }}>
        <div class="drawer-handle"></div>
        <div class="drawer-header">
          <div class="nav-title">
            <div><p class="eyebrow">Navigasi soal</p><h2 id="drawer-title">Pilih nomor soal</h2></div>
            <button class="drawer-close" onclick={closeDrawer} aria-label="Tutup navigasi soal"><AppIcon name="close"/></button>
          </div>
          <div class="drawer-progress">
            <span><b>{answeredCount}</b> dari {active.questions.length} terjawab</span>
            <span>{active.questions.length - answeredCount} belum</span>
          </div>
          <div class="progress"><span style={`width:${(answeredCount / active.questions.length) * 100}%`}></span></div>
          <div class="legend"><span><i class="answered"></i>Terjawab</span><span><i></i>Belum</span><span><i class="flagged"></i>Ragu</span></div>
        </div>
        <div class="drawer-content">
          <div class="numbers">
            {#each active.questions as item, index}
              <button class:active={index === current} class:answered={Boolean(answers[String(item.question_no)])} class:flagged={marked.has(index)} onclick={() => goTo(index)} aria-label={`Soal ${index + 1}${answers[String(item.question_no)] ? ', sudah dijawab' : ', belum dijawab'}${marked.has(index) ? ', ditandai ragu-ragu' : ''}`} aria-current={index === current ? 'step' : undefined}>
                {index + 1}{#if marked.has(index)}<i></i>{/if}
              </button>
            {/each}
          </div>
        </div>
        <div class="drawer-footer">
          <button class="finish" onclick={() => { closeDrawer(); modalOpen = true; }}><AppIcon name="check" size={18}/> Selesai Ujian</button>
          <small>Pastikan semua jawaban sudah sesuai sebelum dikumpulkan.</small>
        </div>
      </div>
    </div>
  {/if}

  {#if modalOpen}
    <div class="modal-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && !submitting && (modalOpen = false)}>
      <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="submit-title">
        <button class="modal-close" onclick={() => (modalOpen = false)} disabled={submitting} aria-label="Tutup"><AppIcon name="close"/></button>
        <div class="modal-icon"><AppIcon name="file" size={27}/></div>
        <p class="eyebrow">Konfirmasi akhir</p>
        <h2 id="submit-title">Kumpulkan ujian sekarang?</h2>
        <p>Setelah dikumpulkan, jawaban tidak dapat diubah dan ujian tidak bisa dibuka kembali.</p>
        <div class="modal-stats">
          <div><strong>{answeredCount}</strong><span><b>Terjawab</b><small>dari {active.questions.length} soal</small></span></div>
          <div class:has-empty={answeredCount < active.questions.length}><strong>{active.questions.length - answeredCount}</strong><span><b>Belum dijawab</b><small>perlu diperiksa</small></span></div>
        </div>
        {#if error}<div class="submit-error"><AppIcon name="alert" size={17}/>{error}</div>{/if}
        <div class="modal-actions">
          <button class="ghost" onclick={() => (modalOpen = false)} disabled={submitting}>Periksa kembali</button>
          <button class="primary" onclick={() => submitExam(false)} disabled={submitting}>{submitting ? 'Mengumpulkan…' : 'Ya, kumpulkan ujian'} {#if !submitting}<AppIcon name="arrow" size={17}/>{/if}</button>
        </div>
      </div>
    </div>
  {/if}

  {#if submitting}
    <div class="submit-loading" role="status" aria-live="assertive">
      <div class="submit-loading-card">
        <span class="submit-spinner" aria-hidden="true"></span>
        <h2>Sedang mengumpulkan ujian</h2>
        <p>Jawaban terakhir sedang disimpan dan dikirim ke server. Jangan tutup atau refresh halaman ini.</p>
      </div>
    </div>
  {/if}

  {#if securityLocked && !submitting}
    <div class="security-lock" role="alertdialog" aria-modal="true" aria-labelledby="security-title">
      <div class="security-lock-card">
        <div class="security-lock-icon"><AppIcon name="lock" size={30}/></div>
        <p class="eyebrow">Mode ujian ketat</p>
        <h2 id="security-title">Ujian dikunci sementara</h2>
        <p>{securityMessage}</p>
        <small>Kembali ke halaman ujian dan aktifkan layar penuh untuk melanjutkan.</small>
        <button class="primary" onclick={resumeSecureExam}>Kembali ke layar penuh</button>
      </div>
    </div>
  {/if}
{/if}

<style>
  .exam-shell { min-height: 100vh; background: #f5f4f0; }
  header { min-height: 76px; padding: .8rem max(1.3rem, calc((100vw - 1280px)/2)); display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: white; background: var(--navy); position: sticky; top: 0; z-index: 20; box-shadow: 0 6px 18px rgb(12 26 47 / .15); }
  .header-left, .header-right, .sync, .timer { display: flex; align-items: center; }
  .header-left { gap: 1.1rem; }.divider { width: 1px; height: 32px; background: rgb(255 255 255 / .18); }
  .exam-name { display: grid; gap: .2rem; }.exam-name small, .sync small, .timer small { color: #9fb0c5; font-size: .6rem; text-transform: uppercase; letter-spacing: .07em; }.exam-name b { font-size: .8rem; }
  .header-right { gap: 1rem; }.sync { gap: .55rem; color: #55c893; }.sync span, .timer span { display: grid; gap: .15rem; }.sync b { color: #dbe5ef; font-size: .7rem; font-weight: 500; }.sync.offline { color: #ffb098; }.sync.saving :global(svg) { animation: pulse 1s infinite; }
  @keyframes pulse { 50% { opacity: .4; } }
  .timer { min-width: 150px; justify-content: center; gap: .6rem; padding: .5rem .8rem; color: white; background: rgb(255 255 255 / .08); border: 1px solid rgb(255 255 255 / .12); border-radius: .65rem; }
  .timer b { font: 1.1rem/1 var(--display); letter-spacing: .08em; }.timer.warning { color: #ffd477; }.timer.critical { color: #ff987f; background: rgb(239 119 93 / .12); }
  .offline-banner { padding: .65rem 1rem; display: flex; justify-content: center; align-items: center; gap: .5rem; color: #7a4c05; background: #fff1c1; font-size: .75rem; font-weight: 650; }
  .security-banner { padding: .5rem 1rem; display: flex; justify-content: center; align-items: center; gap: .45rem; color: #276749; background: #e8f6ef; border-bottom: 1px solid #cde9db; font-size: .7rem; font-weight: 750; }
  .security-lock { position: fixed; inset: 0; z-index: 1000; padding: 1rem; display: grid; place-items: center; background: rgb(8 20 38 / .94); backdrop-filter: blur(8px); }
  .security-lock-card { width: min(460px, 100%); padding: 2rem; text-align: center; background: white; border-radius: 1rem; box-shadow: 0 24px 70px rgb(0 0 0 / .35); }
  .security-lock-icon { width: 4.5rem; height: 4.5rem; margin: 0 auto 1rem; display: grid; place-items: center; color: white; background: var(--coral); border-radius: 50%; }
  .security-lock h2 { margin: .4rem 0 .7rem; color: var(--navy); font: 400 1.8rem var(--display); }.security-lock p:not(.eyebrow) { color: var(--muted); line-height: 1.55; }
  .security-lock small { display: block; margin: .65rem 0 1.2rem; color: var(--muted); font-size: .67rem; line-height: 1.5; }.security-lock button { width: 100%; }
  main { max-width: 1280px; margin: auto; padding: 2rem 1.3rem 4rem; display: grid; grid-template-columns: minmax(0, 1fr) 310px; gap: 1.3rem; }
  .progress-row { display: flex; justify-content: space-between; color: var(--muted); font-size: .72rem; }.progress-row b { color: var(--navy); }.progress { height: 4px; margin: .6rem 0 1rem; overflow: hidden; background: #dedbd4; border-radius: 99px; }.progress span { display: block; height: 100%; background: var(--coral); transition: width .3s; }
  .question-card { min-height: 560px; padding: clamp(1.3rem, 3vw, 2.5rem); background: white; border: 1px solid var(--line); border-radius: 1rem; }
  .question-head { padding-bottom: 1.4rem; margin-bottom: 1.8rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
  .question-head > div { display: flex; align-items: center; gap: .65rem; }.question-head > div span { color: var(--muted); font-size: .63rem; font-weight: 800; letter-spacing: .12em; }.question-head > div b { color: var(--coral); font: 1.35rem var(--display); }
  .question-head button { padding: .5rem .7rem; display: flex; align-items: center; gap: .45rem; color: var(--muted); background: transparent; border: 1px solid var(--line); border-radius: .55rem; cursor: pointer; font-size: .7rem; font-weight: 700; }.question-head button.marked { color: #a56b12; background: #fff7dd; border-color: #efd99c; }
  .question-text { margin: 0 0 .55rem; color: #26354a; font: 400 1rem/1.75 Georgia, serif; white-space: pre-wrap; }
  fieldset { margin: 2rem 0 0; padding: 0; display: grid; gap: .65rem; border: 0; }
  fieldset label { min-height: 58px; padding: .68rem .8rem; display: flex; align-items: center; gap: .8rem; color: #3c4858; background: white; border: 1px solid #dfdcd6; border-radius: .7rem; cursor: pointer; transition: .16s; }
  fieldset label:hover { border-color: #b8c0ca; background: #fcfcfa; }
  fieldset label.selected { color: var(--navy); border: 1.5px solid var(--navy); background: #f3f6f9; box-shadow: 0 3px 10px rgb(16 35 63 / .06); }
  fieldset input { position: absolute; opacity: 0; pointer-events: none; }
  .letter { flex: 0 0 2.15rem; height: 2.15rem; display: grid; place-items: center; color: var(--navy); background: #f2f0eb; border-radius: .5rem; font: .9rem var(--display); }
  .selected .letter { color: white; background: var(--navy); }.answer-text { font-size: .82rem; line-height: 1.5; }.check { width: 1.45rem; height: 1.45rem; margin-left: auto; display: grid; place-items: center; color: transparent; border: 1px solid #d5d4d0; border-radius: 50%; }.selected .check { color: white; background: var(--coral); border-color: var(--coral); }
  .nav-actions { margin-top: 1rem; display: flex; justify-content: space-between; }.mobile-grid { display: none; }
  .navigator { align-self: start; position: sticky; top: 96px; padding: 1.35rem; background: white; border: 1px solid var(--line); border-radius: 1rem; }
  .nav-title { display: flex; align-items: start; justify-content: space-between; }.nav-title .eyebrow { margin-bottom: .25rem; }.nav-title h2 { margin: 0; color: var(--navy); font: 400 1.15rem var(--display); }.nav-title > span { padding: .35rem .5rem; color: var(--muted); background: #f2f0eb; border-radius: .45rem; font-size: .65rem; font-weight: 700; }
  .legend { margin: 1rem 0; display: flex; gap: .8rem; color: var(--muted); font-size: .6rem; }.legend span { display: flex; align-items: center; gap: .3rem; }.legend i { width: .55rem; height: .55rem; border: 1px solid #ccc8c0; border-radius: .15rem; }.legend i.answered { background: #e4f4ec; border-color: #35936c; }.legend i.flagged { background: #fff0c6; border-color: #d59b30; }
  .numbers { display: grid; grid-template-columns: repeat(5, 1fr); gap: .45rem; }
  .numbers button { position: relative; aspect-ratio: 1; padding: 0; color: #676e78; background: #faf9f6; border: 1px solid #ddd9d2; border-radius: .48rem; cursor: pointer; font-size: .72rem; font-weight: 700; }
  .numbers button.answered { color: #146746; background: #e9f7f0; border-color: #9ed5bc; }.numbers button.active { color: white; background: var(--navy); border-color: var(--navy); box-shadow: 0 0 0 2px white, 0 0 0 4px var(--navy); }.numbers button i { position: absolute; top: 2px; right: 2px; width: 5px; height: 5px; background: #e5a72e; border-radius: 50%; }
  .summary { margin: 1.3rem 0; padding: 1rem 0; display: flex; align-items: center; gap: .8rem; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .summary > div > span { --value: 0deg; width: 2.6rem; height: 2.6rem; display: block; border-radius: 50%; background: conic-gradient(var(--green) var(--value), #e6e4df 0); position: relative; }.summary > div > span::after { content: ''; position: absolute; inset: 5px; border-radius: 50%; background: white; }
  .summary p { margin: 0; display: grid; gap: .2rem; }.summary b { color: var(--navy); font-size: .72rem; }.summary small { color: var(--muted); font-size: .62rem; }
  .finish { width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: center; gap: .45rem; color: #a14134; background: #fff3ef; border: 1px solid #efb7a9; border-radius: .6rem; cursor: pointer; font-weight: 750; font-size: .78rem; }.finish-note { display: block; margin-top: .6rem; color: var(--muted); font-size: .58rem; text-align: center; line-height: 1.4; }
  .drawer-backdrop, .modal-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; background: rgb(8 20 38 / .62); backdrop-filter: blur(3px); }
  .drawer-backdrop { align-items: end; }
  .drawer { max-height: min(82dvh, 720px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; background: white; border-radius: 1.2rem 1.2rem 0 0; box-shadow: 0 -18px 55px rgb(8 20 38 / .24); outline: none; }
  .drawer-handle { width: 42px; height: 4px; margin: .65rem auto .25rem; background: #d5d2cc; border-radius: 99px; }
  .drawer-header { padding: .65rem 1.2rem 0; border-bottom: 1px solid var(--line); }
  .drawer .nav-title { align-items: center; }
  .drawer-close { width: 2.5rem; height: 2.5rem; display: grid; place-items: center; color: var(--navy); background: #f3f1ec; border: 0; border-radius: 50%; cursor: pointer; }
  .drawer-progress { margin-top: 1rem; display: flex; justify-content: space-between; color: var(--muted); font-size: .7rem; }
  .drawer-progress b { color: var(--navy); }
  .drawer .progress { margin: .5rem 0 .8rem; }
  .drawer .legend { margin: 0 0 .9rem; }
  .drawer-content { min-height: 0; padding: 1rem 1.2rem; overflow-y: auto; overscroll-behavior: contain; }
  .drawer .numbers { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .drawer .numbers button { min-height: 42px; aspect-ratio: auto; }
  .drawer-footer { padding: .85rem 1.2rem max(1rem, env(safe-area-inset-bottom)); background: white; border-top: 1px solid var(--line); box-shadow: 0 -8px 20px rgb(12 26 47 / .06); }
  .drawer-footer small { display: block; margin-top: .5rem; color: var(--muted); font-size: .58rem; text-align: center; }
  .modal-backdrop { place-items: center; padding: 1rem; }.modal { width: min(500px, 100%); padding: 2rem; position: relative; text-align: center; background: white; border-radius: 1rem; box-shadow: 0 25px 80px rgb(0 0 0 / .25); }.modal-close { position: absolute; right: 1rem; top: 1rem; padding: .3rem; color: var(--muted); background: transparent; border: 0; cursor: pointer; }.modal-icon { width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; display: grid; place-items: center; color: var(--coral); background: #fff0eb; border-radius: 50%; }.modal h2 { color: var(--navy); font: 400 1.7rem var(--display); }.modal > p:not(.eyebrow) { max-width: 390px; margin: 0 auto 1.4rem; color: var(--muted); font-size: .8rem; line-height: 1.6; }
  .modal-stats { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }.modal-stats > div { padding: .8rem; display: flex; align-items: center; gap: .7rem; text-align: left; background: #edf7f2; border: 1px solid #d6ecdf; border-radius: .65rem; }.modal-stats > div.has-empty { background: #fff7df; border-color: #f0dda9; }.modal-stats strong { color: var(--green); font: 1.8rem var(--display); }.modal-stats .has-empty strong { color: #a97317; }.modal-stats span { display: grid; }.modal-stats b { color: var(--navy); font-size: .7rem; }.modal-stats small { color: var(--muted); font-size: .6rem; }
  .modal-actions { margin-top: 1.4rem; display: grid; grid-template-columns: 1fr 1.25fr; gap: .6rem; }.submit-error { margin-top: .8rem; padding: .6rem; display: flex; gap: .4rem; color: #9f3f32; background: #fff0ed; border-radius: .5rem; font-size: .7rem; }
  .submit-loading { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: rgb(8 20 38 / .72); backdrop-filter: blur(5px); cursor: wait; }
  .submit-loading-card { width: min(390px, 100%); padding: 2rem; display: grid; justify-items: center; text-align: center; background: white; border-radius: 1rem; box-shadow: 0 25px 80px rgb(0 0 0 / .3); }
  .submit-loading-card h2 { margin: 1rem 0 .5rem; color: var(--navy); font: 400 1.45rem var(--display); }
  .submit-loading-card p { margin: 0; color: var(--muted); font-size: .78rem; line-height: 1.6; }
  .submit-spinner { width: 2.5rem; height: 2.5rem; border: 3px solid #e5e2dc; border-top-color: var(--coral); border-radius: 50%; animation: submit-spin .75s linear infinite; }
  @keyframes submit-spin { to { transform: rotate(360deg); } }  .error-state { min-height: 100vh; display: grid; place-content: center; justify-items: center; text-align: center; }.error-state h1 { font-family: var(--display); }.error-state p { color: var(--muted); }
  @media (max-width: 900px) {
    main { grid-template-columns: 1fr; }.navigator { display: none; }.mobile-grid { display: inline-flex; }.header-right .sync { display: none; }.question-card { min-height: auto; }
  }
  @media (max-width: 600px) {
    header { min-height: 66px; padding: .55rem .8rem; }.exam-name, .divider { display: none; }.timer { min-width: 135px; }.timer b { font-size: 1rem; }
    main { padding: 1rem .8rem 6rem; }.question-card { padding: 1.1rem; }.question-head { margin-bottom: 1.3rem; }.question-head button { font-size: 0; }.question-head button :global(svg) { width: 19px; }
    .question-text { font-size: .94rem; }.answer-text { font-size: .78rem; }.nav-actions { position: fixed; bottom: 0; left: 0; right: 0; z-index: 15; padding: .7rem; gap: .5rem; background: white; border-top: 1px solid var(--line); }.nav-actions button { flex: 1; padding: .65rem .4rem; font-size: .7rem; }
    .drawer { max-height: 88dvh; }.drawer .numbers { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .55rem; }.drawer .numbers button { min-height: 44px; }.modal { padding: 1.5rem 1rem; }.modal-actions { grid-template-columns: 1fr; }.modal-stats { gap: .4rem; }
  }
</style>
