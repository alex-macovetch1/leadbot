import type { CSSProperties } from "react";
import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";
import ChatWidget from "@/components/ChatWidget";
import { getBusiness, BUSINESSES } from "@/lib/businesses";

const DEMOS = [
  "dental",
  "imobiliar",
  "restaurant",
  "curier",
  "service",
  "cazare",
  "constructii",
  "veterinar",
  "fitness",
  "scoala",
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ b?: string }>;
}) {
  const { b } = await searchParams;
  const biz = getBusiness(b);

  const widgetBiz = {
    slug: biz.slug,
    title: biz.widgetTitle,
    greeting: biz.greeting,
    suggestions: biz.suggestions,
    accent: biz.accent,
    formal: biz.formal,
  };

  return (
    <div style={{ "--a": biz.accent } as CSSProperties} className="lb">
      {/* ── nav ── */}
      <div className="lb-navshell">
        <nav className="lb-nav">
          <span className="lb-brand">
            <i />
            <b>{biz.name}</b>
          </span>

          {!biz.clientDemo && (
            <div className="lb-switch" role="group" aria-label="Alege demonstrația">
              {DEMOS.map((slug) => {
                const d = BUSINESSES[slug];
                return (
                  <Link
                    key={slug}
                    href={`/?b=${slug}`}
                    aria-current={slug === biz.slug ? "true" : undefined}
                    style={{ "--s": d.accent } as CSSProperties}
                  >
                    <i />
                    {d.category.ro.split(" ·")[0]}
                  </Link>
                );
              })}
            </div>
          )}

          {!biz.clientDemo && (
            <a href="#pret" className="lb-btn lb-btn-dark">
              Vreau unul
            </a>
          )}
        </nav>
      </div>

      {/* ── hero ── */}
      <header className="lb-wrap lb-hero" id="top">
        <div className="lb-hero-grid">
          <div>
            <span className="lb-badge">
              <span className="lb-dot" />
              Demonstrație live · scrie-i chiar acum
            </span>
            <h1 className="lb-h1">{biz.heroTitle.ro}</h1>
            <p className="lb-lede">{biz.heroSub.ro}</p>
            <ul className="lb-proof">
              {biz.proof.map((p) => (
                <li key={p.ro}>
                  <Check />
                  {p.ro}
                </li>
              ))}
            </ul>
          </div>

          <div className="lb-panel-wrap">
            <ChatPanel biz={widgetBiz} className="h-[540px] w-full" />
          </div>
        </div>
      </header>

      {/* Everything below the chat is sales material aimed at the owner. On a
          demo built for one named prospect it reads like being pitched at, so
          the page ends with the assistant itself. */}
      {!biz.clientDemo && (
      <>
      {/* ── the payoff: what the owner receives ── */}
      <section className="lb-band">
        <div className="lb-wrap lb-band-grid">
          <div>
            <span className="lb-eyebrow">Partea pe care n-o vede clientul</span>
            <h2 className="lb-h2">
              El termină conversația.
              <br />
              <em>Ție îți sună telefonul.</em>
            </h2>
            <p className="lb-lede lb-lede-dim">
              În secunda în care lasă numele și numărul, primești tot ce a spus — cu un buton de răspuns. Nu
              trebuie să stai pe site și nici să citești conversația.
            </p>
            <div className="lb-band-facts">
              <div>
                <b>2 sec</b>
                <span>de la conversație la telefonul tău</span>
              </div>
              <div>
                <b>24/7</b>
                <span>inclusiv noaptea și în weekend</span>
              </div>
            </div>
          </div>

          <div className="lb-phone" aria-hidden="true">
            <div className="lb-phone-bar">
              <span>21:47</span>
              <span className="lb-phone-notch" />
              <span>▲ ▮</span>
            </div>
            <div className="lb-note">
              <div className="lb-note-head">
                <span className="lb-note-kind">Lead nou</span>
                <div className="lb-note-name">Elena Rusu</div>
                <div className="lb-note-biz">{biz.name}</div>
              </div>
              <dl className="lb-note-rows">
                <div>
                  <dt>Telefon</dt>
                  <dd className="lb-note-tel">069 24 18 06</dd>
                </div>
                <div>
                  <dt>Cere</dt>
                  <dd>{demoRequest(biz.slug)}</dd>
                </div>
                <div>
                  <dt>Primit</dt>
                  <dd>azi, 21:47</dd>
                </div>
              </dl>
              <span className="lb-note-btn">Răspunde pe WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── what it does ── */}
      <section className="lb-wrap lb-sec">
        <div className="lb-head">
          <div>
            <span className="lb-eyebrow">Ce face</span>
            <h2 className="lb-h2">Patru lucruri, în fiecare zi</h2>
          </div>
          <p className="lb-lede">
            Nu e un chat care zice „vă răspundem în curând". Cunoaște oferta, pune întrebările potrivite și
            închide cu un număr de telefon.
          </p>
        </div>

        <div className="lb-cards">
          {FEATURES.map((c, i) => (
            <article key={c.t} className={"lb-card" + (i === 0 ? " lb-card-dark" : "")}>
              <span className="lb-card-ic">{c.i}</span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── install ── */}
      <section className="lb-wrap lb-sec">
        <div className="lb-head">
          <div>
            <span className="lb-eyebrow">Instalare</span>
            <h2 className="lb-h2">Un rând de cod. Atât.</h2>
          </div>
          <p className="lb-lede">
            Se pune pe orice site — WordPress, Tilda, Wix, sau unul scris de mână. Nu-ți schimbă nimic din ce
            ai deja.
          </p>
        </div>

        <div className="lb-code">
          <div className="lb-code-bar">
            <span className="lb-dots">
              <i />
              <i />
              <i />
            </span>
            <span>site-ul tău · înainte de &lt;/body&gt;</span>
          </div>
          <pre>
            <code>
              <span className="tg">&lt;script</span> <span className="at">src</span>=
              <span className="st">&quot;https://leadbot-inky.vercel.app/widget.js&quot;</span>
              {"\n        "}
              <span className="at">data-biz</span>=<span className="st">&quot;{biz.slug}&quot;</span>{" "}
              <span className="at">defer</span>
              <span className="tg">&gt;&lt;/script&gt;</span>
            </code>
          </pre>
        </div>
      </section>
      </>
      )}

      {/* ── cta ── */}
      <section className="lb-wrap lb-sec" id="pret">
        <div className="lb-cta">
          <div className="lb-cta-in">
            {biz.clientDemo ? (
              <>
                <span className="lb-eyebrow">Demonstrație</span>
                <h2 className="lb-h2">Pregătită pentru {biz.name}.</h2>
                <p className="lb-lede lb-lede-dim">
                  Scrieți-i asistentului ca un client obișnuit și vedeți ce ajunge la dumneavoastră.
                </p>
                <div className="lb-cta-acts">
                  <a href="tel:+37369859888" className="lb-btn lb-btn-a">
                    Alexandru Macovetchi · +373 69 859 888
                  </a>
                </div>
              </>
            ) : (
              <>
                <span className="lb-eyebrow">Hai să vorbim</span>
                <h2 className="lb-h2">Vrei unul care să știe afacerea ta?</h2>
                <p className="lb-lede lb-lede-dim">
                  Îl învăț serviciile, prețurile și programul tău. Îl vezi funcționând înainte să plătești
                  ceva.
                </p>
                <div className="lb-cta-acts">
                  <a
                    href="https://wa.me/37369859888"
                    target="_blank"
                    rel="noopener"
                    className="lb-btn lb-btn-a"
                  >
                    <Wa />
                    Scrie-mi pe WhatsApp
                  </a>
                  <a
                    href="https://alex-macovetch1.github.io/portofoliu/"
                    target="_blank"
                    rel="noopener"
                    className="lb-btn lb-btn-g"
                  >
                    Vezi celelalte lucrări
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="lb-wrap lb-foot">
        <span>
          {biz.clientDemo
            ? `Demonstrație pregătită pentru ${biz.name} · Alexandru Macovetchi`
            : "Asistent bilingv pentru afaceri mici · Chișinău, Moldova"}
        </span>
        <span>Demonstrație — ce scrii aici nu ajunge la nicio afacere reală.</span>
      </footer>

      <ChatWidget biz={widgetBiz} appearAfter={700} />
    </div>
  );
}

/** A believable request line per demo, so the notification card reads real.
 *  Every slug needs its own line — a prospect who sees another trade's request
 *  on their own demo stops believing the rest of the page. */
const DEMO_REQUEST: Record<string, string> = {
  imobiliar: "Apartament 2 camere, Botanica, până în 400 €",
  restaurant: "Masă pentru 6 persoane, sâmbătă seara",
  dental: "Curățare profesională, ar veni sâmbătă dimineața",
  veterinar: "Pisică, vaccin anual, ar veni joi după-amiază",
  fitness: "Abonament lunar, vrea să înceapă săptămâna asta",
  scoala: "Categoria B, întreabă când începe grupa nouă",
  fotbal: "Băiat de 4 ani, întreabă de antrenamentul de probă",
  lasermed: "Aluniță pe spate, cere consultație — poate veni sâmbătă dimineața",
  service: "Schimb de ulei și verificat frânele, Logan 2016",
  cazare: "Două nopți pentru 3 persoane, weekendul viitor",
  constructii: "Renovare baie 6 m², cere deviz",
  curier: "Colet 5 kg spre Bălți, ridicare mâine dimineață",
  fancourier: "Colet 5 kg spre Bălți, ridicare mâine dimineață",
  alexweb: "Site de prezentare, 5 pagini, cere ofertă",
};

function demoRequest(slug: string): string {
  return DEMO_REQUEST[slug] ?? DEMO_REQUEST.imobiliar;
}

/* ---------- icons ---------- */
const sv = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.85,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Check() {
  return (
    <svg width="12" height="12" {...sv} strokeWidth={3}>
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="20" height="20" {...sv}>
      <path d="M20.5 12.5a7.5 7.5 0 0 1-10.9 6.7L4 20.5l1.4-5.4A7.5 7.5 0 1 1 20.5 12.5z" />
      <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="20" height="20" {...sv}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="20" height="20" {...sv}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="20" height="20" {...sv}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.3 2.5 3.5 5.7 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.7-3.5-9S9.7 5.5 12 3z" />
    </svg>
  );
}
function Wa() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42Z" />
    </svg>
  );
}

const FEATURES = [
  {
    t: "Răspunde la ce se întreabă mereu",
    d: "Program, prețuri, unde te găsesc, ce servicii ai. Aceleași 20 de întrebări pe care le scrii de mână acum.",
    i: <IconChat />,
  },
  {
    t: "Caută în oferta ta",
    d: "Îl întreabă pe client ce vrea, apoi îi arată exact ce ai potrivit — apartamente, servicii, meniu.",
    i: <IconSearch />,
  },
  {
    t: "Ia numărul de telefon",
    d: "Duce discuția până la nume și număr, firesc, fără formulare care sperie lumea.",
    i: <IconPhone />,
  },
  {
    t: "Vorbește română și rusă",
    d: "Trece dintr-una în alta după cum scrie clientul. Fără să alegi tu ceva.",
    i: <IconGlobe />,
  },
];
