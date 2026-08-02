export type StrictExamEventType = 'tab_hidden' | 'fullscreen_exit' | 'page_exit';

export type StrictExamEvent = {
  id: string;
  type: StrictExamEventType;
  occurredAt: string;
};

export type StrictExamState = {
  reason: string;
  locked: boolean;
  event?: StrictExamEvent;
};

type StrictExamGuardOptions = {
  onState: (state: StrictExamState) => void;
  onBeforeExit: () => void;
};

const BLOCKED_KEYS = new Set(['c', 'x', 'v', 'a', 'p', 's', 'u', 'r', 'w', 't', 'n', 'l', 'tab', 'pageup', 'pagedown']);
const BLOCKED_DEVTOOLS_KEYS = new Set(['i', 'j', 'c', 'k']);

export class StrictExamGuard {
  private armed = false;
  private leaving = false;
  private lastViolationAt = 0;
  private lastEventId = '';
  private fullscreenSupported = false;

  constructor(private readonly options: StrictExamGuardOptions) {}

  enable() {
    if (this.armed) return;
    this.armed = true;
    this.fullscreenSupported = Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen);
    window.addEventListener('keydown', this.handleKeydown, { capture: true });
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('pagehide', this.handlePageHide);
    document.addEventListener('visibilitychange', this.handleVisibility);
    if (this.fullscreenSupported) document.addEventListener('fullscreenchange', this.handleFullscreen);
    document.addEventListener('contextmenu', this.blockInteraction);
    document.addEventListener('copy', this.blockInteraction);
    document.addEventListener('cut', this.blockInteraction);
    document.addEventListener('paste', this.blockInteraction);
    document.addEventListener('dragstart', this.blockInteraction);
    document.addEventListener('selectstart', this.blockInteraction);
    document.addEventListener('selectionchange', this.clearSelection);

    if (!this.fullscreenSupported) {
      this.emit('Browser tidak mendukung layar penuh. Ujian dilanjutkan tanpa mode layar penuh.', false);
      return;
    }

    this.emit(
      document.fullscreenElement ? 'Mode ujian ketat aktif.' : 'Aktifkan layar penuh untuk melanjutkan ujian.',
      !document.fullscreenElement
    );
  }

  disable() {
    if (!this.armed) return;
    this.armed = false;
    window.removeEventListener('keydown', this.handleKeydown, { capture: true });
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('pagehide', this.handlePageHide);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    document.removeEventListener('fullscreenchange', this.handleFullscreen);
    document.removeEventListener('contextmenu', this.blockInteraction);
    document.removeEventListener('copy', this.blockInteraction);
    document.removeEventListener('cut', this.blockInteraction);
    document.removeEventListener('paste', this.blockInteraction);
    document.removeEventListener('dragstart', this.blockInteraction);
    document.removeEventListener('selectstart', this.blockInteraction);
    document.removeEventListener('selectionchange', this.clearSelection);
  }

  allowExit() {
    this.leaving = true;
  }

  async enterFullscreen() {
    if (!this.fullscreenSupported) {
      this.emit('Browser tidak mendukung layar penuh. Ujian dilanjutkan tanpa mode layar penuh.', false);
      return;
    }
    await document.documentElement.requestFullscreen();
    this.emit('Mode ujian ketat aktif.', false);
  }

  private readonly handleVisibility = () => {
    if (document.hidden) this.record('Berpindah tab atau menyembunyikan halaman ujian.', 'tab_hidden');
  };

  private readonly handleFullscreen = () => {
    if (!document.fullscreenElement) this.record('Keluar dari mode layar penuh.', 'fullscreen_exit');
  };

  private readonly handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!this.armed || this.leaving) return;
    this.record('Mencoba refresh atau menutup halaman ujian.', 'page_exit', true);
    this.options.onBeforeExit();
    event.preventDefault();
    event.returnValue = '';
  };

  private readonly handlePageHide = () => {
    if (!this.armed || this.leaving) return;
    this.record('Menutup atau meninggalkan halaman ujian.', 'page_exit', true);
    this.options.onBeforeExit();
  };

  private readonly handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const shortcutBlocked =
      event.key === 'F12' ||
      event.key === 'PrintScreen' ||
      event.key === 'F5' ||
      ((event.ctrlKey || event.metaKey) && BLOCKED_KEYS.has(key)) ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && BLOCKED_DEVTOOLS_KEYS.has(key)) ||
      (event.altKey && ['arrowleft', 'arrowright', 'home'].includes(key));

    if (shortcutBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private readonly blockInteraction = (event: Event) => event.preventDefault();

  private readonly clearSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) selection.removeAllRanges();
  };

  private record(reason: string, type: StrictExamEventType, reuseRecentId = false) {
    if (!this.armed || this.leaving) return;
    const now = Date.now();
    const recentIncident = now - this.lastViolationAt < 1500;
    if (recentIncident && !reuseRecentId) return;

    if (!recentIncident || !this.lastEventId) {
      this.lastEventId = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${now}-${Math.random().toString(36).slice(2)}`;
    }
    this.lastViolationAt = now;
    this.emit(reason, true, {
      id: this.lastEventId,
      type,
      occurredAt: new Date(now).toISOString()
    });
  }

  private emit(reason: string, locked: boolean, event?: StrictExamEvent) {
    this.options.onState({ reason, locked, event });
  }
}
