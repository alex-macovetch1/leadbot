// Sample apartment inventory for the real-estate demo bot.
// The bot asks the visitor what they want, then searchListings() filters this
// list and the chat shows the matches as cards. In a real deployment this would
// come from the agency's database/CRM instead of a static array.

export type Deal = "buy" | "rent";

export type Listing = {
  id: string;
  deal: Deal;            // for sale or for rent
  rooms: number;         // number of rooms
  zone: string;          // Chișinău district (lowercase, ascii-ish for matching)
  zoneLabel: string;     // pretty district name shown to the user
  price: number;         // EUR — total for buy, per month for rent
  area: number;          // m²
  floor: string;         // e.g. "3/9"
  title: { ro: string; ru: string };
};

// deal · rooms · zone · price(EUR) · area
export const LISTINGS: Listing[] = [
  { id: "a1", deal: "rent", rooms: 1, zone: "centru",     zoneLabel: "Centru",     price: 350, area: 42, floor: "4/9",  title: { ro: "Garsonieră modernă, Centru", ru: "Современная студия, Центр" } },
  { id: "a2", deal: "rent", rooms: 2, zone: "centru",     zoneLabel: "Centru",     price: 500, area: 60, floor: "6/10", title: { ro: "2 camere renovate, lângă parc", ru: "2 комнаты с ремонтом, у парка" } },
  { id: "a3", deal: "rent", rooms: 2, zone: "botanica",   zoneLabel: "Botanica",   price: 400, area: 58, floor: "3/9",  title: { ro: "2 camere, bloc nou, Botanica", ru: "2 комнаты, новостройка, Ботаника" } },
  { id: "a4", deal: "rent", rooms: 3, zone: "botanica",   zoneLabel: "Botanica",   price: 550, area: 78, floor: "5/9",  title: { ro: "3 camere spațioase, Botanica", ru: "3 просторные комнаты, Ботаника" } },
  { id: "a5", deal: "rent", rooms: 1, zone: "riscani",    zoneLabel: "Râșcani",    price: 300, area: 40, floor: "2/5",  title: { ro: "1 cameră, aproape de lac", ru: "1 комната, рядом с озером" } },
  { id: "a6", deal: "rent", rooms: 3, zone: "buiucani",   zoneLabel: "Buiucani",   price: 480, area: 75, floor: "7/9",  title: { ro: "3 camere, Buiucani, mobilat", ru: "3 комнаты, Буюканы, с мебелью" } },
  { id: "a7", deal: "buy",  rooms: 1, zone: "ciocana",    zoneLabel: "Ciocana",    price: 42000,  area: 44, floor: "8/10", title: { ro: "1 cameră, bloc nou, Ciocana", ru: "1 комната, новостройка, Чеканы" } },
  { id: "a8", deal: "buy",  rooms: 2, zone: "botanica",   zoneLabel: "Botanica",   price: 58000,  area: 62, floor: "4/9",  title: { ro: "2 camere, dat în exploatare, Botanica", ru: "2 комнаты, сдан, Ботаника" } },
  { id: "a9", deal: "buy",  rooms: 2, zone: "centru",     zoneLabel: "Centru",     price: 72000,  area: 65, floor: "5/7",  title: { ro: "2 camere, Centru, autonomă", ru: "2 комнаты, Центр, автономка" } },
  { id: "a10", deal: "buy", rooms: 3, zone: "telecentru", zoneLabel: "Telecentru", price: 79000,  area: 85, floor: "6/9",  title: { ro: "3 camere, Telecentru, euroreparație", ru: "3 комнаты, Телецентр, евроремонт" } },
  { id: "a11", deal: "buy", rooms: 3, zone: "riscani",    zoneLabel: "Râșcani",    price: 89000,  area: 90, floor: "9/10", title: { ro: "3 camere, Râșcani, vedere spre lac", ru: "3 комнаты, Рышкановка, вид на озеро" } },
  { id: "a12", deal: "buy", rooms: 1, zone: "buiucani",   zoneLabel: "Buiucani",   price: 39000,  area: 41, floor: "3/5",  title: { ro: "1 cameră, Buiucani, preț bun", ru: "1 комната, Буюканы, хорошая цена" } },
];

export type SearchCriteria = {
  deal?: Deal;
  rooms?: number;
  zone?: string;
  budget?: number; // EUR — max the visitor is willing to pay
};

// Filter + rank the inventory against what the visitor asked for.
// We keep it forgiving: rooms may differ by 1, budget allows a small overshoot,
// so the bot always has something to show instead of a dead end.
export function searchListings(c: SearchCriteria, limit = 3): Listing[] {
  const zone = (c.zone || "").toLowerCase().trim();
  const scored = LISTINGS
    .filter((l) => (c.deal ? l.deal === c.deal : true))
    .map((l) => {
      let score = 0;
      if (c.rooms) score += Math.abs(l.rooms - c.rooms) * 3;          // closer room count = better
      if (c.budget) score += l.price > c.budget ? (l.price - c.budget) / (c.deal === "buy" ? 5000 : 50) : 0; // over budget penalised
      if (zone) score += l.zone === zone ? 0 : 4;                     // exact zone preferred
      return { l, score, overBudget: c.budget ? l.price > c.budget * 1.05 : false };
    })
    .sort((a, b) => (a.overBudget === b.overBudget ? 0 : a.overBudget ? 1 : -1)) // within-budget first
    .filter((x) => !x.overBudget)   // drop anything over budget (small 5% grace below)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.l);
  return scored.slice(0, limit);
}
