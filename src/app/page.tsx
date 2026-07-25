import type { CSSProperties } from "react";
import ChatPanel from "@/components/ChatPanel";
import ChatWidget from "@/components/ChatWidget";
import { getBusiness } from "@/lib/businesses";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ b?: string }>;
}) {
  const { b } = await searchParams;
  const biz = getBusiness(b);
  const accent = biz.accent;

  const widgetBiz = {
    slug: biz.slug,
    title: biz.widgetTitle,
    greeting: biz.greeting,
    suggestions: biz.suggestions,
    accent: biz.accent,
  };

  return (
    <div style={{ "--accent": accent } as CSSProperties} className="relative min-h-screen">
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="aura absolute inset-0" />
        <div className="grid-lines absolute inset-0" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#070910]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 60%, #000))` }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white shadow-lg"
            >
              {biz.name.charAt(0)}
            </span>
            <span className="truncate text-[15px] font-semibold tracking-tight">{biz.name}</span>
          </div>
          <span className="chip hidden shrink-0 px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] sm:block">
            {biz.category.ro}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* hero */}
        <section className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_400px] lg:gap-14 lg:py-20">
          <div className="rise">
            <span className="chip inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="accent-text">Demo live · funcționează acum</span>
            </span>

            <h1 className="gradient-text mt-5 text-[2.1rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {biz.heroTitle.ro}
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[color:var(--muted)] sm:text-lg">
              {biz.heroSub.ro}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {biz.proof.map((p) => (
                <span
                  key={p.ro}
                  className="chip inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] text-[color:var(--muted)]"
                >
                  <CheckIcon />
                  {p.ro}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#chat"
                style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 70%, #000))` }}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 lg:hidden"
              >
                Încearcă asistentul
                <ArrowIcon />
              </a>
              <p className="hidden items-center gap-2 text-sm text-[color:var(--muted)] lg:inline-flex">
                <ArrowRightIcon />
                Scrie-i ceva — răspunde pe loc, în română sau rusă.
              </p>
            </div>
          </div>

          {/* live chat panel */}
          <div id="chat" className="rise scroll-mt-24" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              <div
                aria-hidden
                style={{ background: accent }}
                className="absolute -inset-4 -z-10 rounded-[28px] opacity-15 blur-3xl"
              />
              <ChatPanel biz={widgetBiz} className="panel-glow h-[540px] w-full" />
            </div>
            <p className="mt-3 text-center text-[11.5px] text-[color:var(--muted)]/70">
              Asistentul de mai sus e real — răspunsurile sunt generate în timp real.
            </p>
          </div>
        </section>

        {/* features */}
        <section className="py-8 lg:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ce face pentru afacerea ta
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Feature
              icon={<GlobeIcon />}
              accent={accent}
              title="Bilingv RO / RU"
              body="Clienții vorbitori de română și rusă sunt serviți în limba lor din prima secundă, fără să aștepte pe cineva."
            />
            <Feature
              icon={<ClockIcon />}
              accent={accent}
              title="Răspunde 24/7"
              body="Preia întrebări și cereri și noaptea, în weekend, sau când linia telefonică e ocupată. Nu pierzi niciun client."
            />
            <Feature
              icon={<InboxIcon />}
              accent={accent}
              title="Salvează fiecare lead"
              body="Numele, contactul și ce anume vrea clientul ajung direct la tine — o listă gata de sunat, nu conversații pierdute."
            />
          </div>
        </section>

        {/* how it works */}
        <section className="py-8 lg:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Cum funcționează</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Step
              n="1"
              accent={accent}
              title="Vizitatorul scrie"
              body="Deschide chatul de pe site și întreabă ce-l interesează, în limba lui."
            />
            <Step
              n="2"
              accent={accent}
              title="Asistentul califică"
              body="Răspunde la întrebări și află exact ce vrea clientul — fără formulare lungi."
            />
            <Step
              n="3"
              accent={accent}
              title="Lead-ul ajunge la tine"
              body="Contactul și cererea se salvează automat. Tu doar suni un client deja interesat."
            />
          </div>
        </section>

        {/* cta strip */}
        <section className="py-8 lg:py-14">
          <div
            className="card flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center"
            style={{ borderColor: `color-mix(in oklab, ${accent} 30%, var(--line))` }}
          >
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                Vrei un asistent ca acesta pe site-ul tău?
              </h3>
              <p className="mt-1.5 text-sm text-[color:var(--muted)]">
                Se instalează pe orice site și se configurează pentru afacerea ta.
              </p>
            </div>
            <a
              href="#chat"
              style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 70%, #000))` }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Întreabă asistentul
              <ArrowIcon />
            </a>
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-5 text-center text-[12.5px] text-[color:var(--muted)]/70">
          {biz.name} · asistent AI · demo
        </div>
      </footer>

      {/* floating widget — apare la scroll, ca pe un site real */}
      <ChatWidget biz={widgetBiz} appearAfter={620} className="lg:block" />
    </div>
  );
}

/* ---------- pieces ---------- */

function Feature({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="card p-5">
      <span
        style={{
          color: accent,
          background: `color-mix(in oklab, ${accent} 14%, transparent)`,
          borderColor: `color-mix(in oklab, ${accent} 28%, transparent)`,
        }}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border"
      >
        {icon}
      </span>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--muted)]">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  accent,
}: {
  n: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="card p-5">
      <span
        style={{ color: accent, borderColor: `color-mix(in oklab, ${accent} 35%, transparent)` }}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold"
      >
        {n}
      </span>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--muted)]">{body}</p>
    </div>
  );
}

/* ---------- icons ---------- */

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="accent-text">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accent-text">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M5 5h14l2 8v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4z" />
    </svg>
  );
}
