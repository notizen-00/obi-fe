import { c as attr, e as escape_html } from "./root.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils2.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import "./api.js";
import { B as Brand } from "./Brand.js";
function Topbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { userName = "" } = $$props;
    let open = false;
    $$renderer2.push(`<header class="svelte-h6bux4"><div class="wrap svelte-h6bux4">`);
    Brand($$renderer2, {});
    $$renderer2.push(`<!----> <div class="right svelte-h6bux4"><div class="connection svelte-h6bux4"><span class="svelte-h6bux4"></span> Terhubung</div> <button class="profile svelte-h6bux4"${attr("aria-expanded", open)}><span class="avatar svelte-h6bux4">${escape_html(userName.charAt(0) || "P")}</span> <span class="svelte-h6bux4"><small class="svelte-h6bux4">Peserta</small><b class="svelte-h6bux4">${escape_html(userName || "Peserta OBI")}</b></span> <span class="chev svelte-h6bux4">⌄</span></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></header>`);
  });
}
export {
  Topbar as T
};
