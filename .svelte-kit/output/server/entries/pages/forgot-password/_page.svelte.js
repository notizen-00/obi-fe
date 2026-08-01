import { h as head, d as attr_class, c as attr, e as escape_html } from "../../../chunks/root.js";
import { A as AppIcon } from "../../../chunks/AppIcon.js";
import { B as Brand } from "../../../chunks/Brand.js";
import "../../../chunks/api.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let nik = "";
    let step = "identify";
    head("1wx4tso", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Pulihkan akun — OBI CBT</title>`);
      });
    });
    $$renderer2.push(`<main class="svelte-1wx4tso"><section class="story svelte-1wx4tso" aria-label="Pemulihan akun"><div class="story-inner svelte-1wx4tso">`);
    Brand($$renderer2, { inverse: true });
    $$renderer2.push(`<!----> <div class="story-copy svelte-1wx4tso"><p class="eyebrow svelte-1wx4tso">Pemulihan akun</p> <h1 class="svelte-1wx4tso">Kembali ke ruang ujianmu dengan aman.</h1> <p class="lead svelte-1wx4tso">Kami akan mencocokkan identitasmu terlebih dahulu sebelum password dapat diperbarui.</p> <ol aria-label="Tahapan pemulihan akun" class="svelte-1wx4tso"><li${attr_class("svelte-1wx4tso", void 0, { "active": step === "identify", "done": step !== "identify" })}><span class="svelte-1wx4tso">1</span><div class="svelte-1wx4tso"><b class="svelte-1wx4tso">Temukan akun</b><small class="svelte-1wx4tso">Masukkan NIK peserta</small></div></li> <li${attr_class("svelte-1wx4tso", void 0, { "active": step === "reset", "done": step === "success" })}><span class="svelte-1wx4tso">2</span><div class="svelte-1wx4tso"><b class="svelte-1wx4tso">Atur password</b><small class="svelte-1wx4tso">Verifikasi email dan password baru</small></div></li></ol></div> <p class="secure svelte-1wx4tso">`);
    AppIcon($$renderer2, { name: "lock", size: 15 });
    $$renderer2.push(`<!----> Data identitasmu dikirim melalui koneksi aman</p></div></section> <section class="form-side svelte-1wx4tso"><div class="form-wrap svelte-1wx4tso"><div class="mobile-brand svelte-1wx4tso">`);
    Brand($$renderer2, {});
    $$renderer2.push(`<!----></div> <a class="back svelte-1wx4tso" href="/login">`);
    AppIcon($$renderer2, { name: "back", size: 17 });
    $$renderer2.push(`<!----> Kembali ke halaman masuk</a> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="eyebrow">Langkah 1 dari 2</p> <h2 class="svelte-1wx4tso">Cari username</h2> <p class="intro svelte-1wx4tso">Masukkan NIK yang terdaftar pada akun ujian aktif.</p> <form class="svelte-1wx4tso"><label for="nik" class="svelte-1wx4tso">NIK peserta</label> <div class="field svelte-1wx4tso">`);
      AppIcon($$renderer2, { name: "user", size: 19 });
      $$renderer2.push(`<!----> <input id="nik"${attr("value", nik)} inputmode="numeric" autocomplete="off" placeholder="16 digit NIK" minlength="16" maxlength="16" required="" class="svelte-1wx4tso"/></div> <p class="hint svelte-1wx4tso">${escape_html(nik.length)}/16 digit</p> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button class="primary submit svelte-1wx4tso" type="submit"${attr("disabled", nik.length !== 16, true)}>`);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`Cek username `);
        AppIcon($$renderer2, { name: "arrow", size: 18 });
        $$renderer2.push(`<!---->`);
      }
      $$renderer2.push(`<!--]--></button></form>`);
    }
    $$renderer2.push(`<!--]--></div></section></main>`);
  });
}
export {
  _page as default
};
