"use client";

/* Tabla de cereri — ce vede clientul în timp ce se joacă cu botul.

   Nu e amoCRM și nu pretinde că e: e aceeași formă de lucru (fișe care trec
   prin coloane), ca omul să vadă exact ce ajunge la el și în ce formă. Când
   îi conectăm CRM-ul lui, fișele astea apar acolo, la fel.

   Cererile se reîncarcă singure la 4 secunde, ca fișa să apară sub ochii lui
   cât încă are chatul deschis. Coloana în care stă o fișă se ține în browserul
   lui — poate muta fișele, fără să atingem datele. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Cerere = {
  id: string;
  name: string;
  phone: string;
  details: string;
  lang: string;
  createdAt: number;
};

const COLOANE = [
  { id: "noua", titlu: "Cerere nouă" },
  { id: "contactat", titlu: "Contactat" },
  { id: "proba", titlu: "Probă stabilită" },
  { id: "venit", titlu: "A venit la probă" },
] as const;

const CHEIE_LOCALA = "bord-etape";

function candva(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "chiar acum";
  const m = Math.floor(s / 60);
  if (m < 60) return `acum ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `acum ${h} h`;
  const z = Math.floor(h / 24);
  return z === 1 ? "ieri" : `acum ${z} zile`;
}

/** „Botanica 2021 · copil: Matei, băiat · părinte: Ion" → titlu + rânduri. */
function desparte(details: string) {
  const parti = String(details || "").split(" · ").map((x) => x.trim()).filter(Boolean);
  const titlu = parti[0] || "Cerere";
  const randuri = parti.slice(1).map((p) => {
    const i = p.indexOf(":");
    return i > 0
      ? { eticheta: p.slice(0, i).trim(), valoare: p.slice(i + 1).trim() }
      : { eticheta: "", valoare: p };
  });
  return { titlu, randuri };
}

function wa(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.length <= 9 ? "373" + d.replace(/^0/, "") : d}`;
}

export default function Bord() {
  const [cereri, setCereri] = useState<Cerere[]>([]);
  const [eroare, setEroare] = useState<string | null>(null);
  const [etape, setEtape] = useState<Record<string, string>>({});
  const [noi, setNoi] = useState<Set<string>>(new Set());
  const vazute = useRef<Set<string> | null>(null);

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const biz = params?.get("b") || "tracia";
  const cheie = params?.get("k") || "";

  useEffect(() => {
    try {
      const brut = localStorage.getItem(CHEIE_LOCALA);
      if (brut) setEtape(JSON.parse(brut));
    } catch { /* prima deschidere */ }
  }, []);

  const muta = (id: string, etapa: string) => {
    setEtape((e) => {
      const nou = { ...e, [id]: etapa };
      try { localStorage.setItem(CHEIE_LOCALA, JSON.stringify(nou)); } catch { /* privat */ }
      return nou;
    });
  };

  const incarca = useCallback(async () => {
    try {
      const r = await fetch(`/api/bord?b=${encodeURIComponent(biz)}&k=${encodeURIComponent(cheie)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status === 401 ? "Link fără acces" : `Eroare ${r.status}`);
      const d = await r.json();
      const lista: Cerere[] = d.leads ?? [];
      /* Prima încărcare doar reține ce există; abia cererile care apar după
         aceea se aprind, altfel s-ar aprinde toată tabla la deschidere. */
      if (vazute.current === null) {
        vazute.current = new Set(lista.map((c) => c.id));
      } else {
        const proaspete = lista.filter((c) => !vazute.current!.has(c.id)).map((c) => c.id);
        if (proaspete.length) {
          proaspete.forEach((id) => vazute.current!.add(id));
          setNoi((n) => new Set([...n, ...proaspete]));
          setTimeout(() => setNoi((n) => {
            const x = new Set(n);
            proaspete.forEach((id) => x.delete(id));
            return x;
          }), 6000);
        }
      }
      setCereri(lista);
      setEroare(null);
    } catch (e) {
      setEroare(e instanceof Error ? e.message : "Eroare");
    }
  }, [biz, cheie]);

  useEffect(() => {
    incarca();
    const t = setInterval(incarca, 4000);
    return () => clearInterval(t);
  }, [incarca]);

  const peColoane = useMemo(() => {
    const m: Record<string, Cerere[]> = {};
    COLOANE.forEach((c) => (m[c.id] = []));
    cereri.forEach((c) => (m[etape[c.id] ?? "noua"] ?? m.noua).push(c));
    return m;
  }, [cereri, etape]);

  return (
    <div className="bd">
      <header className="bd-bar">
        <span className="bd-titlu">
          <i />
          Cereri de pe site
        </span>
        <span className="bd-live">{eroare ? eroare : `${cereri.length} ${cereri.length === 1 ? "cerere" : "cereri"} · se actualizează singur`}</span>
      </header>

      <div className="bd-coloane">
        {COLOANE.map((col, iCol) => (
          <section key={col.id} className="bd-col">
            <h2>
              {col.titlu}
              <b>{peColoane[col.id]?.length ?? 0}</b>
            </h2>

            <div className="bd-stiva">
              {(peColoane[col.id] ?? []).map((c) => {
                const { titlu, randuri } = desparte(c.details);
                const urmatoarea = COLOANE[iCol + 1];
                return (
                  <article key={c.id} className={"bd-fisa" + (noi.has(c.id) ? " bd-noua" : "")}>
                    <div className="bd-fisa-sus">
                      <span className="bd-grupa">{titlu}</span>
                      <span className="bd-cand">{candva(c.createdAt)}</span>
                    </div>

                    <dl>
                      {randuri.map((r, i) => (
                        <div key={i}>
                          {r.eticheta && <dt>{r.eticheta}</dt>}
                          <dd>{r.valoare}</dd>
                        </div>
                      ))}
                      {/* botul pune deja părintele în „details" la unele afaceri;
                          îl adăugăm doar când lipsește, ca să nu apară de două ori */}
                      {!randuri.some((r) => /p[ăa]rinte/i.test(r.eticheta)) && (
                        <div>
                          <dt>părinte</dt>
                          <dd>{c.name}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="bd-act">
                      <a href={wa(c.phone)} target="_blank" rel="noopener" className="bd-tel">
                        {c.phone}
                      </a>
                      {urmatoarea && (
                        <button onClick={() => muta(c.id, urmatoarea.id)}>
                          {urmatoarea.titlu} →
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}

              {!(peColoane[col.id] ?? []).length && (
                <p className="bd-gol">
                  {col.id === "noua" ? "Scrieți botului de pe site — cererea apare aici." : "—"}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
