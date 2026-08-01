import { h as head, c as attr } from "../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { A as AppIcon } from "../../../chunks/AppIcon.js";
import { B as Brand } from "../../../chunks/Brand.js";
import "../../../chunks/api.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let username = "";
    let password = "";
    let loading = false;
    head("1x05zx6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Masuk — OBI CBT</title>`);
      });
    });
    $$renderer2.push(`<main class="svelte-1x05zx6"><section class="story svelte-1x05zx6" aria-label="Selamat datang"><div class="story-inner svelte-1x05zx6">`);
    Brand($$renderer2, { inverse: true });
    $$renderer2.push(`<!----> <div class="story-copy svelte-1x05zx6"><p class="eyebrow svelte-1x05zx6">Olimpiade Bahasa Indonesia</p> <h1 class="svelte-1x05zx6">Ruang tenang untuk menunjukkan kemampuan terbaikmu.</h1> <p class="lead svelte-1x05zx6">Siapkan diri, fokus pada setiap soal, dan biarkan kami menjaga progres jawabanmu.</p> <div class="quote svelte-1x05zx6"><span class="svelte-1x05zx6">“</span> <p>Bahasa adalah peta sebuah budaya. Ia memberi tahu dari mana kita datang dan ke mana kita menuju.</p></div></div> <div class="ornament svelte-1x05zx6" aria-hidden="true"><i class="svelte-1x05zx6"></i><i class="svelte-1x05zx6"></i><i class="svelte-1x05zx6"></i><i class="svelte-1x05zx6"></i></div> <p class="secure svelte-1x05zx6">`);
    AppIcon($$renderer2, { name: "lock", size: 15 });
    $$renderer2.push(`<!----> Sesi aman &amp; jawaban tersimpan otomatis</p></div></section> <section class="form-side svelte-1x05zx6"><div class="form-wrap svelte-1x05zx6"><div class="mobile-brand svelte-1x05zx6">`);
    Brand($$renderer2, {});
    $$renderer2.push(`<!----></div> <p class="eyebrow">Selamat datang kembali</p> <h2 class="svelte-1x05zx6">Masuk ke akun ujian</h2> <p class="intro svelte-1x05zx6">Gunakan username dan password yang diberikan oleh panitia.</p> <form class="svelte-1x05zx6"><label for="username" class="svelte-1x05zx6">Username</label> <div class="field svelte-1x05zx6">`);
    AppIcon($$renderer2, { name: "user", size: 19 });
    $$renderer2.push(`<!----> <input id="username"${attr("value", username)} autocomplete="username" placeholder="Masukkan username" required="" class="svelte-1x05zx6"/></div> <label for="password" class="svelte-1x05zx6">Password</label> <div class="field svelte-1x05zx6">`);
    AppIcon($$renderer2, { name: "lock", size: 19 });
    $$renderer2.push(`<!----> <input id="password"${attr("value", password)}${attr("type", "password")} autocomplete="current-password" placeholder="Masukkan password" required="" class="svelte-1x05zx6"/> <button class="toggle svelte-1x05zx6" type="button"${attr("aria-label", "Tampilkan password")}>`);
    AppIcon($$renderer2, { name: "eye", size: 19 });
    $$renderer2.push(`<!----></button></div> <a class="forgot svelte-1x05zx6" href="/forgot-password">Lupa username atau password?</a> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button class="primary submit svelte-1x05zx6" type="submit"${attr("disabled", loading, true)}>`);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`Masuk ke CBT `);
      AppIcon($$renderer2, { name: "arrow", size: 18 });
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]--></button></form> <p class="help svelte-1x05zx6">Mengalami kendala masuk? <a href="mailto:panitia@obi.id" class="svelte-1x05zx6">Hubungi panitia</a></p></div></section></main>`);
  });
}
export {
  _page as default
};
