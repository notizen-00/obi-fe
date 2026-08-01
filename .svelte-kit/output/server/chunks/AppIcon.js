import { c as attr } from "./root.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function AppIcon($$renderer, $$props) {
  let { name, size = 20 } = $$props;
  const paths = {
    user: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/>',
    school: '<path d="m3 9 9-5 9 5-9 5zM6 12v5l6 3 6-3v-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h4"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    back: '<path d="M19 12H5M10 7l-5 5 5 5"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
    eyeoff: '<path d="m3 3 18 18M10.5 6.2C11 6.1 11.5 6 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.2 2.8M7.6 7.6C4.5 9.2 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.6-.3 3.7-.7"/>',
    logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/>',
    wifi: '<path d="M4 10a12 12 0 0 1 16 0M7 14a7.5 7.5 0 0 1 10 0M10.5 17.5a2.5 2.5 0 0 1 3 0"/><circle cx="12" cy="20" r=".5" fill="currentColor"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M12 3 2.5 20h19zM12 9v4M12 17h.01"/>',
    flag: '<path d="M6 21V4m0 1h10l-2 4 2 4H6"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
  };
  $$renderer.push(`<svg viewBox="0 0 24 24"${attr("width", size)}${attr("height", size)} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${html(paths[name] || paths.file)}</svg>`);
}
export {
  AppIcon as A
};
