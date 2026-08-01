<script lang="ts">
  let { inverse = false, compact = false } = $props<{ inverse?: boolean; compact?: boolean }>();
</script>

<a class:inverse class:compact href="/exams" aria-label="OBI CBT — Beranda">
  <span class="mark" aria-hidden="true">
    <svg viewBox="0 0 32 32"><path d="M8.5 5.5h10l5 5v16h-15z" /><path d="M18.5 5.5v6h6M12.5 16h7M12.5 20h5" /></svg>
  </span>
  <span class="wordmark"><b>OBI</b><small>Computer Based Test</small></span>
</a>

<style>
  a { display: inline-flex; align-items: center; gap: .68rem; color: var(--navy); text-decoration: none; }
  .mark { display: grid; place-items: center; width: 2.55rem; aspect-ratio: 1; border-radius: .8rem; background: var(--navy); color: white; box-shadow: 0 7px 18px rgb(15 36 66 / .18); }
  svg { width: 1.55rem; fill: white; }
  svg path:last-child { fill: none; stroke: var(--coral); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .wordmark { display: grid; line-height: 1; letter-spacing: -.02em; }
  b { font-family: var(--display); font-size: 1.34rem; letter-spacing: .02em; }
  small { margin-top: .28rem; font-size: .61rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .64; }
  .inverse { color: white; }
  .inverse .mark { background: white; color: var(--navy); }
  .inverse svg { fill: var(--navy); }
  .compact small { display: none; }
  @media (max-width: 600px) { small { display: none; } }
</style>
