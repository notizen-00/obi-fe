import { d as attr_class } from "./root.js";
import "./api.js";
function Brand($$renderer, $$props) {
  let { inverse = false, compact = false } = $$props;
  $$renderer.push(`<a href="/exams" aria-label="OBI CBT — Beranda"${attr_class("svelte-1bbj4eh", void 0, { "inverse": inverse, "compact": compact })}><span class="mark svelte-1bbj4eh" aria-hidden="true"><svg viewBox="0 0 32 32" class="svelte-1bbj4eh"><path d="M8.5 5.5h10l5 5v16h-15z" class="svelte-1bbj4eh"></path><path d="M18.5 5.5v6h6M12.5 16h7M12.5 20h5" class="svelte-1bbj4eh"></path></svg></span> <span class="wordmark svelte-1bbj4eh"><b class="svelte-1bbj4eh">OBI</b><small class="svelte-1bbj4eh">Computer Based Test</small></span></a>`);
}
export {
  Brand as B
};
