import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">L</span>
          LeadBot
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          demo imobiliar · RO / RU
        </span>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <section className="py-16 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Chat bot pentru captare lead-uri
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Transformă vizitatorii site-ului în clienți, automat.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Un asistent de chat bilingv (română și rusă) care pune întrebările
            potrivite, califică cererea și îți salvează fiecare lead — 24/7, fără
            ca cineva să stea pe telefon.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white">
              Apasă „Scrie-ne” din colțul dreapta-jos ↘
            </span>
            <span className="text-sm text-zinc-500">demo live</span>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          <Feature
            title="Bilingv RO / RU"
            body="Vorbitorii de rusă și română sunt serviți în limba lor din prima secundă."
          />
          <Feature
            title="Califică lead-ul"
            body="Buget, zonă, tip de imobil, cumpărare sau chirie — datele de care are nevoie agentul."
          />
          <Feature
            title="Salvează automat"
            body="Fiecare cerere ajunge într-un panou de administrare (în curând), gata de sunat."
          />
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400 dark:border-zinc-900">
        LeadBot · construit cu Next.js · demo
      </footer>

      <ChatWidget />
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
