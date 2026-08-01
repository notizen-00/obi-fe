import { h as head, e as escape_html, a as ensure_array_like } from "../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { T as Topbar } from "../../../chunks/Topbar.js";
import "../../../chunks/api.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let userName = "";
    head("xt3a3", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Daftar Ujian — OBI CBT</title>`);
      });
    });
    Topbar($$renderer2, { userName });
    $$renderer2.push(`<!----> <main class="container svelte-xt3a3"><section class="welcome svelte-xt3a3"><div class="svelte-xt3a3"><p class="eyebrow svelte-xt3a3">Dashboard peserta</p> <h1 class="svelte-xt3a3">Selamat datang, ${escape_html("Peserta")}.</h1> <p class="svelte-xt3a3">Pilih ujian yang tersedia dan pastikan kamu membaca seluruh ketentuan sebelum memulai.</p></div> <div class="date-card svelte-xt3a3"><span class="svelte-xt3a3">${escape_html(new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(/* @__PURE__ */ new Date()))}</span> <b class="svelte-xt3a3">${escape_html((/* @__PURE__ */ new Date()).getDate())}</b> <small class="svelte-xt3a3">${escape_html(new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(/* @__PURE__ */ new Date()))}</small></div></section> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading-grid svelte-xt3a3"><!--[-->`);
      const each_array_1 = ensure_array_like([1, 2, 3]);
      for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
        each_array_1[$$index];
        $$renderer2.push(`<div class="skeleton svelte-xt3a3"></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--> <aside class="tip svelte-xt3a3"><div class="bulb svelte-xt3a3">✦</div> <div><b class="svelte-xt3a3">Sebelum kamu mulai</b><p class="svelte-xt3a3">Pastikan koneksi internet stabil, perangkat terisi daya, dan kamu berada di tempat yang tenang.</p></div> <span class="svelte-xt3a3">Jawabanmu disimpan otomatis setiap ada perubahan.</span></aside></main>`);
  });
}
export {
  _page as default
};
