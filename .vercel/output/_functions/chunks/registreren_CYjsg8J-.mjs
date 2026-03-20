import { c as createComponent } from "./astro-component_bWdH34O0.mjs";
import "piccolore";
import { L as renderTemplate, b7 as renderHead } from "./sequence_DraTSXy1.mjs";
import { r as renderComponent } from "./entrypoint_Bi1_VAU-.mjs";
import { $ as $$InternalUIComponentRenderer } from "./InternalUIComponentRenderer_B7U34OTH.mjs";
const $$SignUp = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SignUp;
  return renderTemplate`${renderComponent($$result, "InternalUIComponentRenderer", $$InternalUIComponentRenderer, { ...Astro2.props, "component": "sign-up" })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/Hovenier/node_modules/@clerk/astro/components/interactive/SignUp.astro", void 0);
const prerender = false;
const $$Registreren = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="nl" data-astro-cid-xuvmmm5r> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Registreren als hovenier — Tuinplatform</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">${renderHead()}</head> <body class="auth-body" data-astro-cid-xuvmmm5r> <div class="auth-wrapper" data-astro-cid-xuvmmm5r> <div class="auth-brand" data-astro-cid-xuvmmm5r> <a href="/" class="auth-logo" data-astro-cid-xuvmmm5r>🌿 Tuinplatform</a> <p data-astro-cid-xuvmmm5r>Registreer jouw hoveniersbedrijf</p> </div> ${renderComponent($$result, "SignUp", $$SignUp, { "signInUrl": "/inloggen", "forceRedirectUrl": "/portal", "data-astro-cid-xuvmmm5r": true })} </div> </body> </html>`;
}, "C:/Users/jeffrey/Desktop/Projecten/Hovenier/src/pages/registreren.astro", void 0);
const $$file = "C:/Users/jeffrey/Desktop/Projecten/Hovenier/src/pages/registreren.astro";
const $$url = "/registreren";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Registreren,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
