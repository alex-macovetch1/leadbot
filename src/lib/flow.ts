// Conversation flow for the real-estate lead-capture bot.
// Data-driven and bilingual (RO / RU) so steps are easy to add or reorder
// without touching the widget component.

export type Lang = "ro" | "ru";

export type Bilingual = Record<Lang, string>;

export type Option = {
  value: string;
  label: Bilingual;
};

export type Step = {
  id: string;
  // which field on the collected Lead this step fills
  field: keyof Lead | null;
  // what the bot says when it reaches this step
  prompt: Bilingual;
  // "choice" => show option buttons; "text" => free text input; "phone" => text + validation
  kind: "choice" | "text" | "phone";
  options?: Option[];
  placeholder?: Bilingual;
};

export type Lead = {
  lang: Lang;
  deal: string; // cumpărare / închiriere / vânzare
  propertyType: string; // apartament / casă / ...
  zone: string;
  budget: string;
  name: string;
  phone: string;
};

export const UI = {
  title: { ro: "Asistent imobiliar", ru: "Помощник по недвижимости" } as Bilingual,
  online: { ro: "online", ru: "онлайн" } as Bilingual,
  send: { ro: "Trimite", ru: "Отправить" } as Bilingual,
  restart: { ro: "De la început", ru: "Сначала" } as Bilingual,
  openLabel: { ro: "Scrie-ne", ru: "Напишите нам" } as Bilingual,
  thanks: {
    ro: "Mulțumim! Un agent te contactează în cel mai scurt timp. 📞",
    ru: "Спасибо! Агент свяжется с вами в ближайшее время. 📞",
  } as Bilingual,
  phoneError: {
    ro: "Te rog scrie un număr de telefon valid.",
    ru: "Пожалуйста, введите корректный номер телефона.",
  } as Bilingual,
  summaryTitle: { ro: "Rezumatul cererii tale:", ru: "Сводка вашей заявки:" } as Bilingual,
};

// The greeting is shown before the first step.
export const GREETING: Bilingual = {
  ro: "Bună! 👋 Te ajut să găsești imobilul potrivit. Îți pun câteva întrebări scurte.",
  ru: "Здравствуйте! 👋 Помогу подобрать подходящую недвижимость. Задам пару коротких вопросов.",
};

export const STEPS: Step[] = [
  {
    id: "deal",
    field: "deal",
    kind: "choice",
    prompt: { ro: "Ce te interesează?", ru: "Что вас интересует?" },
    options: [
      { value: "cumparare", label: { ro: "Cumpăr", ru: "Купить" } },
      { value: "inchiriere", label: { ro: "Închiriez", ru: "Аренда" } },
      { value: "vanzare", label: { ro: "Vând", ru: "Продать" } },
    ],
  },
  {
    id: "propertyType",
    field: "propertyType",
    kind: "choice",
    prompt: { ro: "Ce tip de imobil?", ru: "Какой тип недвижимости?" },
    options: [
      { value: "apartament", label: { ro: "Apartament", ru: "Квартира" } },
      { value: "casa", label: { ro: "Casă", ru: "Дом" } },
      { value: "comercial", label: { ro: "Comercial", ru: "Коммерция" } },
      { value: "teren", label: { ro: "Teren", ru: "Участок" } },
    ],
  },
  {
    id: "zone",
    field: "zone",
    kind: "text",
    prompt: { ro: "În ce oraș sau zonă?", ru: "В каком городе или районе?" },
    placeholder: { ro: "ex: Chișinău, Botanica", ru: "напр: Кишинёв, Ботаника" },
  },
  {
    id: "budget",
    field: "budget",
    kind: "choice",
    prompt: { ro: "Care e bugetul aproximativ (€)?", ru: "Какой примерный бюджет (€)?" },
    options: [
      { value: "<30000", label: { ro: "sub 30.000", ru: "до 30 000" } },
      { value: "30000-60000", label: { ro: "30–60 mii", ru: "30–60 тыс" } },
      { value: "60000-100000", label: { ro: "60–100 mii", ru: "60–100 тыс" } },
      { value: ">100000", label: { ro: "peste 100.000", ru: "более 100 000" } },
    ],
  },
  {
    id: "name",
    field: "name",
    kind: "text",
    prompt: { ro: "Cum te numești?", ru: "Как вас зовут?" },
    placeholder: { ro: "Numele tău", ru: "Ваше имя" },
  },
  {
    id: "phone",
    field: "phone",
    kind: "phone",
    prompt: {
      ro: "Lasă un număr de telefon și te sunăm.",
      ru: "Оставьте номер телефона, и мы перезвоним.",
    },
    placeholder: { ro: "+373 ...", ru: "+373 ..." },
  },
];

export function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function labelFor(field: keyof Lead, value: string, lang: Lang): string {
  const step = STEPS.find((s) => s.field === field);
  const opt = step?.options?.find((o) => o.value === value);
  return opt ? opt.label[lang] : value;
}
