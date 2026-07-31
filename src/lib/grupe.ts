/* ------------------------------------------------------------------
   Grupele școlii și locurile libere din ele.

   Structura e a lor, nu una inventată de noi: în amoCRM lead-ul se
   numește „Botanica 2021" — adică LOCAȚIE + ANUL DE NAȘTERE. Așa își
   împart ei copiii, deci așa citim și noi.

   Sursa e foaia de calcul pe care o ține deja clubul: o publică din
   Google Sheets („File → Share → Publish to web → CSV") și ne dă linkul.
   Nu cerem acces la contul lor și nu-i mutăm din unealta pe care o
   folosesc — antrenorul scrie mai departe în tabel, botul citește.

   Coloane așteptate (prima linie = antet, în orice ordine):
     locatie, an, zile, ora, locuri_libere

   Fără link configurat mergem pe grupele demonstrative de mai jos, ca
   demonstrația să funcționeze înainte să existe tabelul clientului.
------------------------------------------------------------------ */

export type Grupa = {
  locatie: string;
  an: number;          // anul de naștere al copiilor din grupă
  zile: string;
  ora: string;
  locuriLibere: number;
};

/** Anul curent — din el se scade vârsta spusă de părinte. */
export const ANUL = new Date().getFullYear();

/* Grupe demonstrative pe cele 6 filiale reale, cât timp nu e legat tabelul. */
const DEMO: Grupa[] = [
  { locatie: "CHIȘINĂU. Botanica", an: 2022, zile: "Marți, Joi", ora: "17:00", locuriLibere: 5 },
  { locatie: "CHIȘINĂU. Botanica", an: 2021, zile: "Marți, Joi", ora: "18:00", locuriLibere: 2 },
  { locatie: "CHIȘINĂU. Botanica", an: 2019, zile: "Luni, Miercuri", ora: "18:00", locuriLibere: 0 },
  { locatie: "CHIȘINĂU. Botanica", an: 2017, zile: "Luni, Miercuri", ora: "19:00", locuriLibere: 4 },
  { locatie: "CHIȘINĂU. Telecentru", an: 2021, zile: "Luni, Miercuri", ora: "17:30", locuriLibere: 6 },
  { locatie: "CHIȘINĂU. Telecentru", an: 2018, zile: "Marți, Joi", ora: "18:30", locuriLibere: 3 },
  { locatie: "CHIȘINĂU. Buiucani", an: 2020, zile: "Marți, Joi", ora: "17:30", locuriLibere: 1 },
  { locatie: "CHIȘINĂU. Buiucani", an: 2016, zile: "Luni, Miercuri", ora: "19:00", locuriLibere: 7 },
  { locatie: "BĂLȚI", an: 2021, zile: "Marți, Joi", ora: "17:00", locuriLibere: 8 },
  { locatie: "BĂLȚI", an: 2018, zile: "Luni, Miercuri", ora: "18:00", locuriLibere: 0 },
  { locatie: "HÎNCEȘTI", an: 2020, zile: "Marți, Joi", ora: "17:30", locuriLibere: 4 },
  { locatie: "ANENII NOI", an: 2019, zile: "Luni, Miercuri", ora: "17:30", locuriLibere: 5 },
];

const CSV = process.env.GRUPE_CSV || "";
const VIATA = 60_000; // o citire pe minut ajunge; tabelul se schimbă rar

let cache: { cand: number; grupe: Grupa[] } | null = null;

/** Împarte o linie de CSV respectând ghilimelele. */
function celule(linie: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inGhilimele = false;
  for (let i = 0; i < linie.length; i++) {
    const c = linie[i];
    if (c === '"') {
      if (inGhilimele && linie[i + 1] === '"') { cur += '"'; i++; }
      else inGhilimele = !inGhilimele;
    } else if (c === "," && !inGhilimele) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

const numar = (v: string, implicit = 0) => {
  const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : implicit;
};

function dinCsv(text: string): Grupa[] {
  const linii = text.split(/\r?\n/).filter((l) => l.trim());
  if (linii.length < 2) return [];
  const antet = celule(linii[0]).map((h) => h.toLowerCase().replace(/[^a-z_]/g, ""));
  const idx = (...nume: string[]) => antet.findIndex((h) => nume.some((n) => h.includes(n)));

  const iLoc = idx("locatie", "filiala", "sector", "loc");
  const iAn = idx("an", "year", "nastere");
  const iZile = idx("zile", "days");
  const iOra = idx("ora", "time");
  const iLibere = idx("libere", "locuri", "free");

  return linii.slice(1).map((l) => {
    const c = celule(l);
    const ia = (i: number) => (i >= 0 ? c[i] ?? "" : "");
    return {
      locatie: ia(iLoc),
      an: numar(ia(iAn)),
      zile: ia(iZile),
      ora: ia(iOra),
      locuriLibere: numar(ia(iLibere), 0),
    };
  }).filter((g) => g.locatie && g.an > 2000);
}

export async function grupe(): Promise<Grupa[]> {
  if (cache && Date.now() - cache.cand < VIATA) return cache.grupe;
  if (!CSV) return DEMO;
  try {
    const r = await fetch(CSV, { signal: AbortSignal.timeout(6000), cache: "no-store" });
    if (!r.ok) throw new Error(`sheets ${r.status}`);
    const g = dinCsv(await r.text());
    if (!g.length) throw new Error("tabel gol");
    cache = { cand: Date.now(), grupe: g };
    return g;
  } catch (e) {
    /* Un tabel căzut nu are voie să oprească discuția: mergem pe ultima
       citire bună, iar dacă nu există niciuna, pe grupele demonstrative. */
    console.error("grupe: nu s-a putut citi tabelul —", e instanceof Error ? e.message : e);
    return cache?.grupe ?? DEMO;
  }
}

/** Grupele scrise pentru prompt, cu locurile libere la zi. */
export async function grupeText(): Promise<string> {
  const g = await grupe();
  const linii = g.map((x) => {
    const locuri = x.locuriLibere > 0 ? `${x.locuriLibere} locuri libere` : "COMPLETĂ, fără locuri";
    const varsta = ANUL - x.an;
    return `- ${x.locatie} · anul ${x.an} (copii de ~${varsta} ani) · ${x.zile} ${x.ora} · ${locuri}`;
  });
  return `GROUPS AND FREE PLACES RIGHT NOW (live from the club's own spreadsheet — this is the only truth about availability). The current year is ${ANUL}, so a child who is N years old was born in ${ANUL} - N:
${linii.join("\n")}`;
}
