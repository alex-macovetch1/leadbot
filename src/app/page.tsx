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

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <span
            style={{ backgroundColor: accent }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          >
            {biz.name.charAt(0)}
          </span>
          {biz.name}
        </div>
        <span
          style={{ color: accent, borderColor: accent }}
          className="rounded-full border px-3 py-1 text-xs font-medium"
        >
          {biz.category.ro}
        </span>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <section className="py-16 sm:py-24">
          <p style={{ color: accent }} className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Asistent AI pentru captare lead-uri
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {biz.heroTitle.ro}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">{biz.heroSub.ro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span
              style={{ backgroundColor: accent }}
              className="rounded-lg px-5 py-3 text-sm font-medium text-white"
            >
              Apasă „Scrie-ne” din colțul dreapta-jos ↘
            </span>
            <span className="text-sm text-zinc-500">demo live</span>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          <Feature
            title="Bilingv RO / RU"
            body="Clienții vorbitori de rusă și română sunt serviți în limba lor din prima secundă."
          />
          <Feature
            title="Răspunde 24/7"
            body="Preia întrebări și cereri chiar și noaptea sau când nu are cine răspunde la telefon."
          />
          <Feature
            title="Salvează fiecare lead"
            body="Numele și contactul fiecărui client interesat ajung la tine, gata de sunat."
          />
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400 dark:border-zinc-900">
        {biz.name} · asistent AI · demo
      </footer>

      <ChatWidget
        biz={{ slug: biz.slug, title: biz.widgetTitle, greeting: biz.greeting, accent: biz.accent }}
      />
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
