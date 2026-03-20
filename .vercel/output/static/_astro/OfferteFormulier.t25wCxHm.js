import{j as e,i as k}from"./utils.BVktzob6.js";import{r as i}from"./index.B02hbnpo.js";const w=[{value:"tuinaanleg",label:"Tuinaanleg"},{value:"onderhoud",label:"Onderhoud"},{value:"bestrating",label:"Bestrating / terras"},{value:"beplanting",label:"Beplanting"},{value:"schutting",label:"Schutting / afscheiding"},{value:"overig",label:"Iets anders"}],S=[{value:"<2500",label:"Minder dan €2.500"},{value:"2500-5000",label:"€2.500 – €5.000"},{value:"5000-10000",label:"€5.000 – €10.000"},{value:"10000-25000",label:"€10.000 – €25.000"},{value:">25000",label:"Meer dan €25.000"}],B=[{value:"asap",label:"Zo snel mogelijk"},{value:"binnen-3-maanden",label:"Binnen 3 maanden"},{value:"geen-haast",label:"Geen haast, ik oriënteer me"}],c=5,A=["Dienst","Tuingrootte","Budget","Planning","Jouw gegevens"],C=()=>{const[s,f]=i.useState(1),[o,b]=i.useState({}),[h,x]=i.useState(!1),[t,m]=i.useState({}),[D,u]=i.useState(!1),[F,p]=i.useState("");function l(n,r){b(a=>({...a,[n]:r})),m(a=>{const d={...a};return delete d[n],d})}function j(){const n={};return s===1&&!o.dienst&&(n.dienst="Kies een dienst"),s===2&&(!o.m2||o.m2<1)&&(n.m2="Vul een geldige tuingrootte in"),s===3&&!o.budget&&(n.budget="Kies een budgetrange"),s===4&&!o.timing&&(n.timing="Kies een startmoment"),s===5&&(o.naam?.trim()||(n.naam="Vul je naam in"),o.email?.includes("@")||(n.email="Vul een geldig e-mailadres in"),o.telefoon?.trim()||(n.telefoon="Vul je telefoonnummer in"),(!o.postcode||!k(o.postcode))&&(n.postcode="Vul een geldige postcode in (bijv. 1234 AB)")),m(n),Object.keys(n).length===0}function v(){j()&&(s<c?f(n=>n+1):N())}async function N(){u(!0),p("");try{const r=await fetch("/submit-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),a=await r.json();if(!r.ok||!a.ok)throw new Error(a.error??"Onbekende fout");x(!0)}catch(n){p(n instanceof Error?n.message:"Verzenden mislukt, probeer opnieuw.")}finally{u(!1)}}const g=(s-1)/(c-1)*100;return h?e.jsxs("div",{className:"of-success",children:[e.jsx("div",{className:"success-icon","aria-hidden":"true",children:"✅"}),e.jsx("h2",{children:"Aanvraag ontvangen!"}),e.jsxs("p",{children:["Bedankt voor je aanvraag. Je ontvangt binnen ",e.jsx("strong",{children:"48 uur"})," maximaal 3 offertes van hoveniers bij jou in de buurt."]}),e.jsxs("p",{children:["We sturen een bevestiging naar ",e.jsx("strong",{children:o.email})]}),e.jsx("a",{href:"/",className:"of-home-btn",children:"← Terug naar home"}),e.jsx("style",{children:z})]}):e.jsxs("div",{className:"of-wrapper",children:[e.jsx("div",{className:"of-progress",children:e.jsx("div",{className:"of-progress-bar",style:{width:`${g}%`},role:"progressbar","aria-valuenow":g,"aria-valuemin":0,"aria-valuemax":100})}),e.jsxs("div",{className:"of-step-info",children:[e.jsxs("span",{className:"of-step-count",children:["Stap ",s," van ",c]}),e.jsx("span",{className:"of-step-label",children:A[s-1]})]}),s===1&&e.jsxs("div",{className:"of-step",children:[e.jsx("h2",{className:"of-title",children:"Wat wil je laten doen?"}),e.jsx("div",{className:"of-options-grid",children:w.map(({value:n,label:r})=>e.jsx("button",{type:"button",className:`of-option-btn ${o.dienst===n?"of-option-btn--selected":""}`,onClick:()=>l("dienst",n),"aria-pressed":o.dienst===n,children:r},n))}),t.dienst&&e.jsx("p",{className:"of-error",children:t.dienst})]}),s===2&&e.jsxs("div",{className:"of-step",children:[e.jsx("h2",{className:"of-title",children:"Hoe groot is je tuin?"}),e.jsxs("div",{className:"of-input-group",children:[e.jsx("input",{id:"m2",type:"number",min:1,max:5e3,placeholder:"bijv. 80",value:o.m2??"",onChange:n=>l("m2",Number(n.target.value)),className:"of-input of-input--lg","aria-label":"Tuingrootte in m²"}),e.jsx("span",{className:"of-input-suffix",children:"m²"})]}),t.m2&&e.jsx("p",{className:"of-error",children:t.m2})]}),s===3&&e.jsxs("div",{className:"of-step",children:[e.jsx("h2",{className:"of-title",children:"Wat is jouw budget?"}),e.jsx("div",{className:"of-budget-list",children:S.map(({value:n,label:r})=>e.jsx("button",{type:"button",className:`of-budget-btn ${o.budget===n?"of-budget-btn--selected":""}`,onClick:()=>l("budget",n),"aria-pressed":o.budget===n,children:r},n))}),t.budget&&e.jsx("p",{className:"of-error",children:t.budget})]}),s===4&&e.jsxs("div",{className:"of-step",children:[e.jsx("h2",{className:"of-title",children:"Wanneer wil je starten?"}),e.jsx("div",{className:"of-budget-list",children:B.map(({value:n,label:r})=>e.jsx("button",{type:"button",className:`of-budget-btn ${o.timing===n?"of-budget-btn--selected":""}`,onClick:()=>l("timing",n),"aria-pressed":o.timing===n,children:r},n))}),t.timing&&e.jsx("p",{className:"of-error",children:t.timing})]}),s===5&&e.jsxs("div",{className:"of-step",children:[e.jsx("h2",{className:"of-title",children:"Jouw gegevens"}),e.jsx("p",{className:"of-hint",children:"Zodat hoveniers contact met je kunnen opnemen."}),e.jsx("div",{className:"of-fields",children:[{id:"naam",label:"Naam",type:"text",placeholder:"Jan de Vries",value:o.naam},{id:"email",label:"E-mailadres",type:"email",placeholder:"jan@voorbeeld.nl",value:o.email},{id:"telefoon",label:"Telefoonnummer",type:"tel",placeholder:"06 12 34 56 78",value:o.telefoon},{id:"postcode",label:"Postcode",type:"text",placeholder:"1234 AB",value:o.postcode}].map(({id:n,label:r,type:a,placeholder:d,value:E})=>e.jsxs("div",{className:"of-field",children:[e.jsx("label",{htmlFor:n,className:"of-label",children:r}),e.jsx("input",{id:n,type:a,placeholder:d,value:E??"",onChange:y=>l(n,y.target.value),className:`of-input ${t[n]?"of-input--error":""}`}),t[n]&&e.jsx("p",{className:"of-error",children:t[n]})]},n))}),e.jsx("p",{className:"of-privacy",children:"🔒 Je gegevens worden alleen gedeeld met max. 3 hoveniers. Geen spam."})]}),e.jsxs("div",{className:"of-nav",children:[s>1&&e.jsx("button",{type:"button",className:"of-back-btn",onClick:()=>f(n=>n-1),children:"← Terug"}),e.jsx("button",{type:"button",className:"of-next-btn",onClick:v,children:s<c?"Volgende →":"Verstuur aanvraag ✓"})]}),e.jsx("style",{children:T})]})},T=`
  .of-wrapper { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 1.5rem; }

  .of-progress {
    height: 4px;
    background: #E5E5E5;
    border-radius: 99px;
    overflow: hidden;
  }

  .of-progress-bar {
    height: 100%;
    background: #5B7553;
    border-radius: 99px;
    transition: width 0.3s ease;
  }

  .of-step-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #6B7280;
  }

  .of-step-label { font-weight: 600; color: #5B7553; }

  .of-step { display: flex; flex-direction: column; gap: 1rem; }

  .of-title { margin: 0; font-size: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif; }
  .of-hint { margin: 0; font-size: 0.875rem; color: #6B7280; }

  .of-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .of-option-btn {
    padding: 0.875rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    color: #2D2D2D;
    transition: all 0.15s;
    text-align: center;
  }

  .of-option-btn:hover { border-color: #5B7553; background: #E8F0E4; }
  .of-option-btn--selected { border-color: #5B7553; background: #E8F0E4; color: #3D5438; }

  .of-input-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .of-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    background: #F5F3EF;
    transition: border-color 0.15s;
  }

  .of-input--lg { font-size: 1.5rem; padding: 1rem 1.25rem; }
  .of-input:focus { outline: none; border-color: #5B7553; background: white; }
  .of-input--error { border-color: #EF4444; }

  .of-input-suffix {
    font-size: 1.25rem;
    font-weight: 700;
    color: #5B7553;
    flex-shrink: 0;
  }

  .of-budget-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .of-budget-btn {
    padding: 0.875rem 1.25rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #2D2D2D;
    text-align: left;
    transition: all 0.15s;
  }

  .of-budget-btn:hover { border-color: #5B7553; background: #E8F0E4; }
  .of-budget-btn--selected { border-color: #5B7553; background: #E8F0E4; color: #3D5438; }

  .of-fields { display: flex; flex-direction: column; gap: 1rem; }
  .of-field  { display: flex; flex-direction: column; gap: 0.375rem; }

  .of-label {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4A4A4A;
  }

  .of-error {
    font-size: 0.8rem;
    color: #EF4444;
    margin: 0;
  }

  .of-privacy {
    font-size: 0.75rem;
    color: #9CA3AF;
    margin: 0;
  }

  .of-nav {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #E5E5E5;
  }

  .of-next-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    background: #C4A96A;
    color: #2D2D2D;
    border: none;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .of-next-btn:hover { background: #A88B4A; }

  .of-back-btn {
    padding: 0.875rem 1rem;
    background: transparent;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    color: #6B7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .of-back-btn:hover { border-color: #5B7553; color: #5B7553; }
`,z=`
  .of-success {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;
    font-family: 'Inter', sans-serif;
  }

  .success-icon { font-size: 3.5rem; }
  .of-success h2 { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
  .of-success p { margin: 0; color: #4A4A4A; max-width: 420px; }

  .of-home-btn {
    display: inline-flex;
    padding: 0.75rem 1.5rem;
    background: #E8F0E4;
    color: #3D5438;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    margin-top: 0.5rem;
    transition: all 0.15s;
  }

  .of-home-btn:hover { background: #d4e4ce; }
`;export{C as default};
