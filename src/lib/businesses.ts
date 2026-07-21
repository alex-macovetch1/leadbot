// Per-business configuration for the lead-capture bot.
// One deployment serves many demos: the page reads ?b=<slug> and everything —
// branding, greeting, and the AI's system prompt — is generated from the config
// below. To make a demo for a new client, add one entry here and redeploy;
// the demo URL is  /?b=<slug>.

export type Bilingual = { ro: string; ru: string };

export type Business = {
  slug: string;
  name: string;                 // shown in header / hero
  category: Bilingual;          // small badge
  heroTitle: Bilingual;
  heroSub: Bilingual;
  widgetTitle: Bilingual;       // chat header
  greeting: Bilingual;          // first bot message
  accent: string;               // brand color (hex)
  // --- AI (English; drives the system prompt) ---
  aiRole: string;               // who the assistant is
  aiInfo: string;               // services / hours / facts it may use
  aiCollect: string;            // what it should find out from the visitor
};

const REALESTATE: Business = {
  slug: "imobiliar",
  name: "Agenția Imobiliară",
  category: { ro: "Imobiliare · RO / RU", ru: "Недвижимость · RO / RU" },
  heroTitle: {
    ro: "Transformă vizitatorii site-ului în clienți, automat.",
    ru: "Превращайте посетителей сайта в клиентов автоматически.",
  },
  heroSub: {
    ro: "Un asistent de chat bilingv care pune întrebările potrivite, califică cererea și salvează fiecare lead — 24/7.",
    ru: "Двуязычный чат-ассистент, который задаёт нужные вопросы, квалифицирует запрос и сохраняет каждый лид — 24/7.",
  },
  widgetTitle: { ro: "Asistent imobiliar", ru: "Помощник по недвижимости" },
  greeting: {
    ro: "Bună! 👋 Te ajut să găsești imobilul potrivit. Îți pun câteva întrebări scurte.",
    ru: "Здравствуйте! 👋 Помогу подобрать недвижимость. Задам пару коротких вопросов.",
  },
  accent: "#059669",
  aiRole: "a friendly assistant for a real-estate agency in Moldova",
  aiInfo: "The agency handles buying, renting and selling apartments, houses, commercial spaces and land across Moldova.",
  aiCollect: "whether they want to buy/rent/sell, the property type, the city or district, and an approximate budget in euros",
};

const DENTAL: Business = {
  slug: "dental",
  name: "Clinica Stomatologică",
  category: { ro: "Stomatologie · RO / RU", ru: "Стоматология · RO / RU" },
  heroTitle: {
    ro: "Un asistent care programează pacienți 24/7.",
    ru: "Ассистент, который записывает пациентов 24/7.",
  },
  heroSub: {
    ro: "Răspunde întrebărilor pacienților, preia programări și salvează contactul — chiar și noaptea sau când recepția e ocupată.",
    ru: "Отвечает пациентам, принимает записи и сохраняет контакт — даже ночью или когда ресепшн занят.",
  },
  widgetTitle: { ro: "Asistent programări", ru: "Ассистент записи" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot ajuta cu o programare sau întrebări despre servicii. Cu ce vă pot fi de folos?",
    ru: "Здравствуйте! 👋 Помогу записаться или отвечу на вопросы об услугах. Чем могу помочь?",
  },
  accent: "#0ea5e9",
  aiRole: "a warm, professional reception assistant for a dental clinic in Chișinău",
  aiInfo:
    "The clinic offers consultations, dental cleaning, fillings, implants, teeth whitening, braces/aligners and children's dentistry. Typical hours are Monday–Saturday, 9:00–19:00.",
  aiCollect:
    "what treatment or check-up they are interested in, and roughly when it would suit them to come in",
};

const RESTAURANT: Business = {
  slug: "restaurant",
  name: "Restaurantul",
  category: { ro: "Restaurant · RO / RU", ru: "Ресторан · RO / RU" },
  heroTitle: {
    ro: "Preia rezervări automat, non-stop.",
    ru: "Принимает брони автоматически, круглосуточно.",
  },
  heroSub: {
    ro: "Un asistent care răspunde clienților, preia rezervări de masă și salvează contactul — fără să stea cineva pe telefon.",
    ru: "Ассистент, который отвечает гостям, принимает брони столиков и сохраняет контакт — без звонков.",
  },
  widgetTitle: { ro: "Rezervări", ru: "Бронирование" },
  greeting: {
    ro: "Bună! 👋 Doriți o rezervare sau aveți o întrebare despre meniu ori program? Vă ajut cu drag.",
    ru: "Здравствуйте! 👋 Хотите забронировать столик или узнать о меню и часах? С радостью помогу.",
  },
  accent: "#d97706",
  aiRole: "a friendly host assistant for a restaurant in Chișinău",
  aiInfo:
    "The restaurant takes table reservations and answers questions about the menu, hours and events. It is generally open daily for lunch and dinner.",
  aiCollect: "the reservation date and time, and the number of people",
};

export const BUSINESSES: Record<string, Business> = {
  imobiliar: REALESTATE,
  dental: DENTAL,
  restaurant: RESTAURANT,
};

export const DEFAULT_SLUG = "imobiliar";

export function getBusiness(slug?: string | null): Business {
  if (slug && BUSINESSES[slug]) return BUSINESSES[slug];
  return BUSINESSES[DEFAULT_SLUG];
}
