import{j as e,f as b}from"./utils.BVktzob6.js";import{r as c}from"./index.B02hbnpo.js";const v={tuinaanleg:{min:60,max:130,label:"Tuinaanleg",unit:"m²"},onderhoud:{min:5,max:15,label:"Tuinonderhoud",unit:"m² / maand"},bestrating:{min:40,max:120,label:"Bestrating",unit:"m²"},beplanting:{min:20,max:60,label:"Beplanting",unit:"m²"},schutting:{min:80,max:250,label:"Schutting",unit:"strekkende meter"},overig:{min:50,max:100,label:"Overig",unit:"m²"}},u={basis:{label:"Basis",description:"Functioneel, eenvoudige materialen",multiplier:.8},midden:{label:"Midden",description:"Goede kwaliteit, gangbare materialen",multiplier:1},premium:{label:"Premium",description:"Hoogwaardige materialen en afwerking",multiplier:1.45}};function j(n,i,s){const d=u[s].multiplier,l=i.map(t=>{const r=v[t];return{label:r.label,unit:r.unit,min:Math.round(r.min*n*d),max:Math.round(r.max*n*d)}});return{...l.reduce((t,r)=>({min:t.min+r.min,max:t.max+r.max}),{min:0,max:0}),breakdown:l}}const k=[{value:"bestrating",label:"Bestrating / terras",icon:"⬜"},{value:"beplanting",label:"Beplanting",icon:"🌿"},{value:"tuinaanleg",label:"Tuinaanleg",icon:"🏡"},{value:"schutting",label:"Schutting",icon:"🪵"}],N=()=>{const[n,i]=c.useState(1),[s,d]=c.useState(50),[l,p]=c.useState(["bestrating"]),[t,r]=c.useState("midden"),[m,g]=c.useState(null);function x(a){p(o=>o.includes(a)?o.filter(f=>f!==a):[...o,a])}function h(){const a=j(s,l,t);g(a),i(4)}return e.jsxs("div",{className:"calc-wrapper",children:[e.jsx("div",{className:"calc-progress",role:"progressbar","aria-valuenow":n,"aria-valuemin":1,"aria-valuemax":4,children:[1,2,3].map(a=>e.jsxs("div",{className:`prog-step ${n>=a?"prog-step--done":""} ${n===a?"prog-step--active":""}`,children:[e.jsx("div",{className:"prog-dot",children:n>a?"✓":a}),e.jsx("span",{className:"prog-label",children:["Tuingrootte","Werkzaamheden","Kwaliteit"][a-1]})]},a))}),n===1&&e.jsxs("div",{className:"calc-step",children:[e.jsx("h2",{className:"step-title",children:"Hoe groot is jouw tuin?"}),e.jsxs("div",{className:"m2-display",children:[e.jsx("span",{className:"m2-value",children:s}),e.jsx("span",{className:"m2-unit",children:"m²"})]}),e.jsx("input",{type:"range",min:10,max:500,step:5,value:s,onChange:a=>d(Number(a.target.value)),className:"m2-slider","aria-label":"Tuingrootte in m²"}),e.jsxs("div",{className:"m2-labels",children:[e.jsx("span",{children:"10 m²"}),e.jsx("span",{children:"500 m²"})]}),e.jsx("button",{className:"calc-next-btn",onClick:()=>i(2),children:"Volgende →"})]}),n===2&&e.jsxs("div",{className:"calc-step",children:[e.jsx("h2",{className:"step-title",children:"Wat wil je laten doen?"}),e.jsx("p",{className:"step-hint",children:"Selecteer alles wat van toepassing is."}),e.jsx("div",{className:"services-grid",children:k.map(a=>e.jsxs("button",{type:"button",className:`service-btn ${l.includes(a.value)?"service-btn--selected":""}`,onClick:()=>x(a.value),"aria-pressed":l.includes(a.value),children:[e.jsx("span",{className:"service-icon","aria-hidden":"true",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))}),e.jsxs("div",{className:"calc-nav",children:[e.jsx("button",{className:"calc-back-btn",onClick:()=>i(1),children:"← Terug"}),e.jsx("button",{className:"calc-next-btn",onClick:()=>i(3),disabled:l.length===0,children:"Volgende →"})]})]}),n===3&&e.jsxs("div",{className:"calc-step",children:[e.jsx("h2",{className:"step-title",children:"Welk kwaliteitsniveau?"}),e.jsx("div",{className:"quality-grid",children:Object.entries(u).map(([a,o])=>e.jsxs("button",{type:"button",className:`quality-btn ${t===a?"quality-btn--selected":""}`,onClick:()=>r(a),"aria-pressed":t===a,children:[e.jsx("strong",{children:o.label}),e.jsx("span",{children:o.description})]},a))}),e.jsxs("div",{className:"calc-nav",children:[e.jsx("button",{className:"calc-back-btn",onClick:()=>i(2),children:"← Terug"}),e.jsx("button",{className:"calc-next-btn",onClick:h,children:"Bereken mijn kosten →"})]})]}),n===4&&m&&e.jsxs("div",{className:"calc-result",children:[e.jsx("div",{className:"result-badge",children:"📊 Jouw indicatie"}),e.jsxs("div",{className:"result-total",children:[e.jsx("span",{className:"result-label",children:"Geschatte totaalkosten"}),e.jsx("strong",{className:"result-price",children:b(m.min,m.max)})]}),e.jsx("div",{className:"result-breakdown",children:m.breakdown.map(a=>e.jsxs("div",{className:"breakdown-row",children:[e.jsx("span",{children:a.label}),e.jsx("span",{className:"breakdown-amount",children:b(a.min,a.max)})]},a.label))}),e.jsxs("p",{className:"result-disclaimer",children:["Dit is een vrijblijvende indicatie op basis van gemiddelde markttarieven voor ",s,' m² in kwaliteitsniveau "',u[t].label,'".']}),e.jsx("a",{href:"/offerte",className:"result-cta-btn",children:"📬 Vraag gratis offertes aan op basis van deze berekening"}),e.jsx("button",{className:"calc-back-btn",onClick:()=>i(1),style:{marginTop:"1rem",width:"100%"},children:"Opnieuw berekenen"})]}),e.jsx("style",{children:`
        .calc-wrapper { font-family: 'Inter', sans-serif; }

        .calc-progress {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .prog-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          flex: 1;
        }

        .prog-dot {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: #E5E5E5;
          color: #6B7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .prog-step--done .prog-dot  { background: #5B7553; color: white; }
        .prog-step--active .prog-dot { background: #5B7553; color: white; box-shadow: 0 0 0 4px #E8F0E4; }

        .prog-label {
          font-size: 0.7rem;
          color: #6B7280;
          text-align: center;
          white-space: nowrap;
        }

        .calc-step { display: flex; flex-direction: column; gap: 1.25rem; }

        .step-title { margin: 0; font-size: 1.25rem; }
        .step-hint  { margin: 0; font-size: 0.875rem; color: #6B7280; }

        /* m² slider */
        .m2-display {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          justify-content: center;
          padding: 1.5rem;
          background: #E8F0E4;
          border-radius: 12px;
        }

        .m2-value {
          font-size: 3.5rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #3D5438;
          line-height: 1;
        }

        .m2-unit { font-size: 1.5rem; color: #5B7553; font-weight: 600; }

        .m2-slider {
          width: 100%;
          accent-color: #5B7553;
          cursor: pointer;
          height: 6px;
        }

        .m2-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        /* Services */
        .services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .service-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid #E5E5E5;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.15s;
          text-align: center;
          color: #2D2D2D;
        }

        .service-btn:hover { border-color: #5B7553; background: #E8F0E4; }
        .service-btn--selected { border-color: #5B7553; background: #E8F0E4; color: #3D5438; }

        .service-icon { font-size: 1.5rem; }

        /* Quality */
        .quality-grid { display: flex; flex-direction: column; gap: 0.75rem; }

        .quality-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding: 1rem 1.25rem;
          border: 2px solid #E5E5E5;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .quality-btn strong { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; color: #2D2D2D; }
        .quality-btn span   { font-size: 0.8rem; color: #6B7280; }
        .quality-btn:hover { border-color: #5B7553; background: #E8F0E4; }
        .quality-btn--selected { border-color: #5B7553; background: #E8F0E4; }
        .quality-btn--selected strong { color: #3D5438; }

        /* Navigation */
        .calc-nav {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .calc-next-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
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

        .calc-next-btn:hover:not(:disabled) {
          background: #A88B4A;
          transform: translateY(-1px);
        }

        .calc-next-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .calc-back-btn {
          padding: 0.75rem 1rem;
          background: transparent;
          border: 2px solid #E5E5E5;
          border-radius: 8px;
          color: #6B7280;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .calc-back-btn:hover { border-color: #5B7553; color: #5B7553; }

        /* Result */
        .calc-result { display: flex; flex-direction: column; gap: 1.25rem; }

        .result-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #5B7553;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .result-total {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: #E8F0E4;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .result-label { font-size: 0.875rem; color: #6B7280; }

        .result-price {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #3D5438;
        }

        .result-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          overflow: hidden;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid #E5E5E5;
        }

        .breakdown-row:last-child { border-bottom: none; }
        .breakdown-amount { font-weight: 600; color: #3D5438; }

        .result-disclaimer {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 0;
          line-height: 1.5;
        }

        .result-cta-btn {
          display: block;
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: #C4A96A;
          color: #2D2D2D;
          text-align: center;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          transition: all 0.15s;
        }

        .result-cta-btn:hover {
          background: #A88B4A;
          text-decoration: none;
        }
      `})]})};export{N as default};
