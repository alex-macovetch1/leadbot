"use client";

import { useCallback, useEffect, useState } from "react";

type DemoLead = {
  id: string;
  biz: string;
  lang: string;
  name: string;
  phone: string;
  details: string;
  createdAt: number;
};

const BIZ_LABEL: Record<string, string> = {
  dental: "Clinică dentară",
  imobiliar: "Imobiliare",
  restaurant: "Restaurant",
  alexweb: "alex.web",
};

function ago(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "acum";
  const m = Math.floor(s / 60);
  if (m < 60) return `acum ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `acum ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ieri";
  if (d < 30) return `acum ${d} zile`;
  return new Date(ts).toLocaleDateString("ro-MD", { day: "numeric", month: "short" });
}

/** Local numbers are typed 069…, WhatsApp needs the country code. */
function wa(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.length <= 9 ? "373" + d.replace(/^0/, "") : d}`;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seen, setSeen] = useState<number>(0);

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads?key=${encodeURIComponent(k)}`, { cache: "no-store" });
      if (res.status === 401) {
        setError("Cheie greșită.");
        setUnlocked(false);
        localStorage.removeItem("lb-key");
        return;
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setUnlocked(true);
      localStorage.setItem("lb-key", k);
    } catch {
      setError("Nu am putut încărca lead-urile.");
    } finally {
      setLoading(false);
    }
  }, []);

  // remember the key so the phone doesn't ask every time
  useEffect(() => {
    const saved = localStorage.getItem("lb-key");
    if (saved) {
      setKey(saved);
      load(saved);
    }
    setSeen(Number(localStorage.getItem("lb-seen") || 0));
  }, [load]);

  useEffect(() => {
    if (!unlocked) return;
    const t = setInterval(() => load(key), 15000);
    return () => clearInterval(t);
  }, [unlocked, key, load]);

  // once the list is on screen, everything in it counts as seen
  useEffect(() => {
    if (!unlocked || !leads.length) return;
    const t = setTimeout(() => {
      const newest = leads[0].createdAt;
      localStorage.setItem("lb-seen", String(newest));
      setSeen(newest);
    }, 4000);
    return () => clearTimeout(t);
  }, [unlocked, leads]);

  const fresh = leads.filter((l) => l.createdAt > seen).length;

  if (!unlocked) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f4f4f2] px-5 text-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (key) load(key);
          }}
          className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-[0_24px_60px_-24px_rgba(15,23,42,.3)]"
        >
          <h1 className="text-xl font-bold tracking-[-.02em]">Lead-uri</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">Cererile prinse de asistent.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Cheie de acces"
            autoFocus
            className="mt-5 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] outline-none transition focus:border-slate-900 focus:bg-white"
          />
          <button className="mt-2.5 w-full rounded-full bg-slate-900 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800">
            {loading ? "Se verifică…" : "Intră"}
          </button>
          {error && <p className="mt-3 text-center text-[13px] text-red-500">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f4f4f2] text-slate-900">
      <header className="sticky top-0 z-10 border-b border-black/[.06] bg-[#f4f4f2]/85 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <h1 className="text-[17px] font-bold tracking-[-.02em]">Lead-uri</h1>
            <p className="text-[12.5px] text-slate-500">
              {leads.length} în total
              {fresh > 0 && <span className="ml-1.5 font-semibold text-emerald-600">· {fresh} noi</span>}
            </p>
          </div>
          <button
            onClick={() => load(key)}
            aria-label="Reîncarcă"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-900"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-5">
        {leads.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center text-[13.5px] text-slate-400">
            Încă niciun lead. Deschide asistentul pe pagina principală și lasă un nume și un număr — apare aici în
            câteva secunde.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {leads.map((l) => (
              <li
                key={l.id}
                className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_12px_30px_-18px_rgba(15,23,42,.25)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15.5px] font-semibold tracking-[-.015em]">
                      {l.name || "Fără nume"}
                    </div>
                    <div className="mt-0.5 text-[12px] text-slate-400">
                      {BIZ_LABEL[l.biz] || l.biz} · {l.lang === "ru" ? "rusă" : "română"} · {ago(l.createdAt)}
                    </div>
                  </div>
                  {l.createdAt > seen && (
                    <span className="mt-1 shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-700">
                      nou
                    </span>
                  )}
                </div>

                {l.details && <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">{l.details}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={wa(l.phone)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-slate-800"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42Z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${l.phone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-[13px] font-semibold transition hover:border-slate-900"
                  >
                    {l.phone}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-[11.5px] text-slate-400">Se reîmprospătează singur la 15 secunde.</p>
      </div>
    </main>
  );
}
