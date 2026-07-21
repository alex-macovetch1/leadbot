"use client";

import { useEffect, useState } from "react";

type StoredLead = {
  id: string;
  createdAt: number;
  lang: string;
  deal: string;
  propertyType: string;
  zone: string;
  budget: string;
  name: string;
  phone: string;
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(k: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads?key=${encodeURIComponent(k)}`);
      if (res.status === 401) {
        setError("Cheie greșită.");
        setSubmitted(false);
        return;
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setSubmitted(true);
    } catch {
      setError("Nu am putut încărca lead-urile.");
    } finally {
      setLoading(false);
    }
  }

  // auto-refresh every 10s once unlocked
  useEffect(() => {
    if (!submitted) return;
    const t = setInterval(() => load(key), 10000);
    return () => clearInterval(t);
  }, [submitted, key]);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">Lead-uri — panou admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Cererile prinse de bot, cele mai noi primele.</p>

        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (key) load(key);
            }}
            className="mt-6 flex max-w-sm gap-2"
          >
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Cheie de acces"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Intră
            </button>
          </form>
        ) : (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-3 text-sm text-zinc-500">
              <span>{leads.length} lead-uri</span>
              <button onClick={() => load(key)} className="rounded-md bg-zinc-200 px-3 py-1 text-xs font-medium hover:bg-zinc-300 dark:bg-zinc-800">
                {loading ? "..." : "Reîncarcă"}
              </button>
            </div>
            {leads.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-400 dark:border-zinc-700">
                Încă niciun lead. Deschide botul pe pagina principală și completează o cerere.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                    <tr>
                      <th className="px-3 py-2">Nume</th>
                      <th className="px-3 py-2">Telefon</th>
                      <th className="px-3 py-2">Cerere</th>
                      <th className="px-3 py-2">Zonă</th>
                      <th className="px-3 py-2">Buget €</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-t border-zinc-100 dark:border-zinc-800">
                        <td className="px-3 py-2 font-medium">{l.name}</td>
                        <td className="px-3 py-2">
                          <a href={`tel:${l.phone}`} className="text-emerald-600 hover:underline">{l.phone}</a>
                        </td>
                        <td className="px-3 py-2">{l.deal} · {l.propertyType}</td>
                        <td className="px-3 py-2">{l.zone}</td>
                        <td className="px-3 py-2">{l.budget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
