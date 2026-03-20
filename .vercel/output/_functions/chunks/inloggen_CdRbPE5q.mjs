import { c as createComponent } from "./astro-component_bWdH34O0.mjs";
import "piccolore";
import { L as renderTemplate, b7 as renderHead } from "./sequence_DraTSXy1.mjs";
import { r as renderComponent } from "./entrypoint_Bi1_VAU-.mjs";
import { $ as $$InternalUIComponentRenderer } from "./InternalUIComponentRenderer_B7U34OTH.mjs";
const $$SignIn = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SignIn;
  return renderTemplate`${renderComponent($$result, "InternalUIComponentRenderer", $$InternalUIComponentRenderer, { ...Astro2.props, "component": "sign-in" })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/Hovenier/node_modules/@clerk/astro/components/interactive/SignIn.astro", void 0);
const prerender = false;
const $$Inloggen = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="nl" data-astro-cid-zme7qzia> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Inloggen — Tuinplatform Hovenier Portal</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">${renderHead()}</head> <body class="auth-body" data-astro-cid-zme7qzia> <div class="auth-wrapper" data-astro-cid-zme7qzia> <div class="auth-brand" data-astro-cid-zme7qzia> <a href="/" class="auth-logo" data-astro-cid-zme7qzia>🌿 Tuinplatform</a> <p data-astro-cid-zme7qzia>Hovenier Portal — beheer jouw leads</p> </div> ${renderComponent($$result, "SignIn", $$SignIn, { "signUpUrl": "/registreren", "forceRedirectUrl": "/portal", "data-astro-cid-zme7qzia": true })} </div> </body> </html>`;
}, "C:/Users/jeffrey/Desktop/Projecten/Hovenier/src/pages/inloggen.astro", void 0);
const $$file = "C:/Users/jeffrey/Desktop/Projecten/Hovenier/src/pages/inloggen.astro";
const $$url = "/inloggen";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Inloggen,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
