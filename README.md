# LeadBot — chat bot bilingv pentru captare lead-uri

Un asistent de chat **bilingv (română / rusă)** care poartă o conversație scurtă
cu vizitatorul site-ului, îi califică cererea și captează lead-ul — gândit pentru
agenții imobiliare, dar ușor de adaptat oricărui domeniu.

**Demo live:** https://leadbot-imobiliar.vercel.app

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## Ce face

- **Bilingv RO / RU** — vizitatorul își alege limba, botul continuă în ea
- **Califică lead-ul** — întreabă tipul tranzacției (cumpărare / chirie / vânzare),
  tipul de imobil, zona, bugetul, apoi nume și telefon
- **Widget de chat** flotant, se pune pe orice pagină
- **Rezumat automat** al cererii la final, gata de preluat de un agent

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- Fluxul conversației e **data-driven** (`src/lib/flow.ts`) — se adaugă sau se
  reordonează întrebări fără să atingi componenta de UI

## Structura

```
src/
├── app/
│   ├── page.tsx          # landing + widget
│   └── layout.tsx
├── components/
│   └── ChatWidget.tsx    # widget-ul de chat (client component)
└── lib/
    └── flow.ts           # pașii conversației, bilingv, tipat
```

## Rulare locală

```bash
npm install
npm run dev
```

## Pe drum (roadmap)

- [ ] Backend: salvarea lead-urilor într-o bază de date (Supabase / Postgres)
- [ ] Panou de admin cu login pentru a vedea lead-urile
- [ ] Răspunsuri naturale cu AI (peste fluxul fix)
- [ ] Conectare la WhatsApp

---

Construit de [Alexandru Macovetchi](https://github.com/alex-macovetch1) ·
[portofoliu](https://alex-macovetch1.github.io/portofoliu/)
