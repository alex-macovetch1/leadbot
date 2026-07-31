// Per-business configuration for the lead-capture bot.
// One deployment serves many demos: the page reads ?b=<slug> and everything —
// branding, greeting, and the AI's system prompt — is generated from the config
// below. To make a demo for a new client, add one entry here and redeploy;
// the demo URL is  /?b=<slug>.

export type Bilingual = { ro: string; ru: string; en?: string };
export type BilingualList = { ro: string[]; ru: string[]; en?: string[] };

// Support bots (biz.support) handle a fixed catalogue of request types instead
// of one open-ended lead. Each topic either resolves in the chat itself or is
// collected in full and handed to a human operator ready to execute.
export type SupportTopic = {
  key: string;
  label: Bilingual;
  // true  => the assistant answers on its own, no operator involved
  // false => the assistant gathers `collect` and passes the request on
  selfServe: boolean;
  collect: string; // English; what the assistant must find out before handing over
};

export type Business = {
  slug: string;
  name: string;                 // shown in header / hero
  category: Bilingual;          // small badge
  heroTitle: Bilingual;
  heroSub: Bilingual;
  widgetTitle: Bilingual;       // chat header
  greeting: Bilingual;          // first bot message
  suggestions: BilingualList;   // starter prompts shown as chips under the greeting
  proof: Bilingual[];           // short trust points shown under the hero
  accent: string;               // brand color (hex)
  // --- AI (English; drives the system prompt) ---
  aiRole: string;               // who the assistant is
  aiInfo: string;               // services / hours / facts it may use
  aiCollect: string;            // what it should find out from the visitor
  search?: boolean;             // real-estate: qualify the visitor, then search the listings
  support?: boolean;            // customer-support desk: route the visitor into one of `topics`
  topics?: SupportTopic[];      // required when support is true
  // Built for one named client rather than as a generic showcase. Hides the
  // demo switcher, the sales CTA and the "small business" footer — a prospect
  // should see a page made for them, not a template with other demos on it.
  clientDemo?: boolean;
  // Address the visitor with "dumneavoastră" rather than "tu" throughout the widget.
  formal?: boolean;
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
  widgetTitle: { ro: "Asistent imobiliar", ru: "Помощник по недвижимости", en: "Property assistant" },
  greeting: {
    ro: "Bună! 👋 Te ajut să găsești imobilul potrivit. Îți pun câteva întrebări scurte.",
    ru: "Здравствуйте! 👋 Помогу подобрать недвижимость. Задам пару коротких вопросов.",
    en: "Hi! 👋 I will help you find the right property. Just a few quick questions.",
  },
  suggestions: {
    ro: ["Caut apartament cu 2 camere", "Vreau să închiriez", "Ce aveți în Botanica?"],
    ru: ["Ищу 2-комнатную квартиру", "Хочу арендовать", "Что есть на Ботанике?"],
    en: ["Looking for a 2-room flat", "I want to rent", "What do you have in Botanica?"],
  },
  proof: [
    { ro: "Caută în ofertă live", ru: "Ищет по базе объектов" },
    { ro: "Califică cererea", ru: "Квалифицирует запрос" },
    { ro: "Salvează lead-ul", ru: "Сохраняет лид" },
  ],
  accent: "#059669",
  aiRole: "a friendly assistant for a real-estate agency in Moldova",
  aiInfo: "The agency handles buying, renting and selling apartments, houses, commercial spaces and land across Moldova.",
  aiCollect: "whether they want to buy/rent/sell, the property type, the city or district, and an approximate budget in euros",
  search: true,
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
  widgetTitle: { ro: "Asistent programări", ru: "Ассистент записи", en: "Booking assistant" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot ajuta cu o programare sau întrebări despre servicii. Cu ce vă pot fi de folos?",
    ru: "Здравствуйте! 👋 Помогу записаться или отвечу на вопросы об услугах. Чем могу помочь?",
    en: "Hello! 👋 I can book you in or answer questions about our treatments. How can I help?",
  },
  suggestions: {
    ro: ["Vreau o programare", "Cât costă un implant?", "Lucrați sâmbăta?"],
    ru: ["Хочу записаться", "Сколько стоит имплант?", "Работаете в субботу?"],
    en: ["I would like an appointment", "How much is an implant?", "Are you open on Saturday?"],
  },
  proof: [
    { ro: "Preia programări", ru: "Принимает записи" },
    { ro: "Răspunde la întrebări", ru: "Отвечает на вопросы" },
    { ro: "Salvează contactul", ru: "Сохраняет контакт" },
  ],
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
  widgetTitle: { ro: "Rezervări", ru: "Бронирование", en: "Reservations" },
  greeting: {
    ro: "Bună! 👋 Doriți o rezervare sau aveți o întrebare despre meniu ori program? Vă ajut cu drag.",
    ru: "Здравствуйте! 👋 Хотите забронировать столик или узнать о меню и часах? С радостью помогу.",
    en: "Hi! 👋 Would you like a table, or something about the menu and opening hours? Happy to help.",
  },
  suggestions: {
    ro: ["Vreau o rezervare", "Aveți meniu pentru copii?", "Care e programul?"],
    ru: ["Хочу забронировать столик", "Есть детское меню?", "Какие часы работы?"],
    en: ["I would like a table", "Do you have a kids menu?", "What are your opening hours?"],
  },
  proof: [
    { ro: "Preia rezervări", ru: "Принимает брони" },
    { ro: "Răspunde despre meniu", ru: "Отвечает о меню" },
    { ro: "Salvează contactul", ru: "Сохраняет контакт" },
  ],
  accent: "#d97706",
  aiRole: "a friendly host assistant for a restaurant in Chișinău",
  aiInfo:
    "The restaurant takes table reservations and answers questions about the menu, hours and events. It is generally open daily for lunch and dinner.",
  aiCollect: "the reservation date and time, and the number of people",
};

const ALEXWEB: Business = {
  slug: "alexweb",
  name: "Alexandru — Web & AI",
  category: { ro: "Site-uri & AI · RO / RU", ru: "Сайты и AI · RO / RU" },
  heroTitle: {
    ro: "Site-uri moderne și asistenți AI pentru afacerea ta.",
    ru: "Современные сайты и AI-ассистенты для вашего бизнеса.",
  },
  heroSub: {
    ro: "Construiesc site-uri la preț fix și instalez chatboturi AI bilingve care prind clienți 24/7 — chiar ca acesta.",
    ru: "Делаю сайты по фиксированной цене и ставлю двуязычных AI-ботов, которые ловят клиентов 24/7 — как этот.",
  },
  widgetTitle: { ro: "Asistentul lui Alexandru", ru: "Ассистент Александра", en: "Alexandru's assistant" },
  greeting: {
    ro: "Bună! 👋 Sunt asistentul lui Alexandru. Vă pot spune cum vă facem un site sau un chatbot AI ca acesta. Cu ce afacere lucrați?",
    ru: "Здравствуйте! 👋 Я ассистент Александра. Расскажу, как сделать вам сайт или AI-бота, как этот. Какой у вас бизнес?",
    en: "Hi! 👋 I am Alexandru's assistant. I can tell you how we build a website or a chatbot like this one. What kind of business do you run?",
  },
  suggestions: {
    ro: ["Vreau un site pentru afacerea mea", "Cât costă un bot ca acesta?", "În cât timp e gata?"],
    ru: ["Хочу сайт для бизнеса", "Сколько стоит такой бот?", "Как быстро будет готово?"],
    en: ["I want a site for my business", "How much is a bot like this?", "How fast can it be ready?"],
  },
  proof: [
    { ro: "Site-uri la preț fix", ru: "Сайты по фикс. цене" },
    { ro: "Boți AI bilingvi", ru: "Двуязычные AI-боты" },
    { ro: "Gata în ~5 zile", ru: "Готово за ~5 дней" },
  ],
  accent: "#1B36FF",
  aiRole:
    "a friendly assistant for Alexandru Macovetchi, a web developer in Moldova who builds modern websites and installs AI chat assistants for local businesses",
  aiInfo:
    "Alexandru builds fixed-price, modern, mobile-friendly websites (usually delivered in about 5 days) and installs bilingual Romanian/Russian AI chat assistants — exactly like the one the visitor is talking to now — that answer questions and capture leads 24/7. His portfolio includes an online store (WASD), an analytics dashboard (Playdex), a fullstack app (Senkai) and this AI chatbot (LeadBot). He works remotely with businesses across Moldova and offers a small monthly care plan for hosting and updates.",
  aiCollect:
    "what kind of business the visitor runs, and whether they want a website, an AI chatbot like this one, or another kind of help",
};

// Courier support desk. The ten topics below are the ones the client's
// Customer Service manager listed as their most frequent requests.
const COURIER: Business = {
  slug: "fancourier",
  name: "FAN Courier Moldova",
  category: { ro: "Curierat · RO / RU", ru: "Курьерская доставка · RO / RU" },
  heroTitle: {
    ro: "Un asistent care preia cererile clienților, non-stop.",
    ru: "Ассистент, который принимает обращения клиентов круглосуточно.",
  },
  heroSub: {
    ro: "Răspunde la întrebările frecvente și pregătește fiecare cerere completă pentru operator — fără ca acesta să mai poarte discuția de colectare a datelor.",
    ru: "Отвечает на частые вопросы и передаёт оператору полностью подготовленную заявку — без сбора данных вручную.",
  },
  widgetTitle: { ro: "Asistent clienți", ru: "Помощник клиентов", en: "Customer assistant" },
  greeting: {
    ro: "Bună ziua! 👋 Sunt asistentul FAN Courier. Vă pot ajuta cu expedierile, livrările sau contul dumneavoastră. Cu ce vă pot fi de folos?",
    ru: "Здравствуйте! 👋 Я ассистент FAN Courier. Помогу с отправлениями, доставкой или вашим аккаунтом. Чем могу помочь?",
    en: "Hello! 👋 I am the FAN Courier assistant. I can help with shipments, deliveries or your account. How can I help?",
  },
  suggestions: {
    ro: ["Când ajunge coletul meu?", "Vreau să schimb adresa de livrare", "Cum trimit un colet?"],
    ru: ["Когда придёт моя посылка?", "Хочу изменить адрес доставки", "Как отправить посылку?"],
    en: ["When will my parcel arrive?", "I want to change the delivery address", "How do I send a parcel?"],
  },
  proof: [
    { ro: "Preia cererea completă", ru: "Собирает заявку целиком" },
    { ro: "Răspunde 24/7", ru: "Отвечает 24/7" },
    { ro: "Română și rusă", ru: "Румынский и русский" },
  ],
  accent: "#12356b",
  aiRole:
    "the customer-support assistant for FAN Courier Moldova, a courier company",
  aiInfo: `FAN Courier Moldova delivers envelopes (up to 1 kg) and parcels (up to 30 kg, max 60x50x30 cm) anywhere in Moldova, normally within 24 hours. It has a central hub in Chișinău plus 10 hubs across the country, around 80 vehicles.
Services: standard domestic delivery, same-day delivery, Saturday delivery, document return, cash-on-delivery (ramburs — the courier collects the money from the buyer and transfers it to the sender within 2-3 working days), road transport to and from Romania and the European Union, worldwide air freight, and FAN Fulfillment (warehousing and shipping for online shops).
Customers are private individuals, companies and — above all — online shops.
The public website is fancourier.md (Romanian, Russian and English) and has AWB tracking and a personal account area ("cabinet personal"). The short phone number is 14455.
Do not invent tariffs, exact delivery dates or the current status of any particular parcel — you do not have access to the tracking system. When a price or a parcel status is needed, take the request and pass it on.`,
  aiCollect:
    "which of the ten support topics they need, and the specific details listed for that topic",
  support: true,
  clientDemo: true,
  formal: true,
  topics: [
    {
      key: "livrare_termen",
      label: { ro: "Timp estimativ de livrare", ru: "Ориентировочный срок доставки" },
      selfServe: false,
      collect: "the AWB number, and a phone number to reply on",
    },
    {
      key: "schimb_telefon",
      label: { ro: "Modificare număr de contact", ru: "Изменение контактного номера" },
      selfServe: false,
      collect: "the AWB number, the current phone number on the shipment, and the new phone number",
    },
    {
      key: "schimb_adresa",
      label: { ro: "Modificare adresă / redirecționare", ru: "Изменение адреса / переадресация" },
      selfServe: false,
      collect: "the AWB number, the new full delivery address (city, street, number), and a contact phone number",
    },
    {
      key: "amanare",
      label: { ro: "Amânare dată livrare", ru: "Перенос даты доставки" },
      selfServe: false,
      collect: "the AWB number, the new preferred delivery date, and a contact phone number",
    },
    {
      key: "expediere",
      label: { ro: "Plasare expediție ocazională", ru: "Разовая отправка" },
      selfServe: true,
      collect:
        "pickup address, delivery address, approximate weight, whether cash-on-delivery (ramburs) is needed and for what amount, plus the sender's name and phone",
    },
    {
      key: "retur",
      label: { ro: "Solicitare retur", ru: "Заявка на возврат" },
      selfServe: false,
      collect: "the AWB number, the reason for the return, and a contact phone number",
    },
    {
      key: "colaborare",
      label: { ro: "Solicitare de colaborare", ru: "Запрос о сотрудничестве" },
      selfServe: true,
      collect:
        "the company name, what they ship and roughly how many parcels a month, the contact person's name, phone and email",
    },
    {
      key: "activare_cont",
      label: { ro: "Activarea contului", ru: "Активация аккаунта" },
      selfServe: false,
      collect: "the company or client name, the email used at registration, and a contact phone number",
    },
    {
      key: "cabinet",
      label: { ro: "Suport acces cabinet personal", ru: "Поддержка по личному кабинету" },
      selfServe: true,
      collect: "what exactly is not working — sign-in, forgotten password, or something inside the account",
    },
    {
      key: "international",
      label: { ro: "Suport livrări internaționale", ru: "Поддержка международных отправлений" },
      selfServe: true,
      collect: "the destination country, what is being shipped, and the approximate weight",
    },
  ],
};

// Demo-uri generice pe domenii, folosite în prospectare: fiecare firmă vede un
// asistent din propriul domeniu, nu unul dintr-altul. Fără nume de client în ele —
// varianta `fancourier` rămâne doar pentru FAN Courier și nu se arată nimănui altcuiva.
const CURIER: Business = {
  slug: "curier",
  name: "Serviciul de curierat",
  category: { ro: "Curierat · RO / RU", ru: "Курьерская доставка · RO / RU" },
  heroTitle: {
    ro: "Răspunde la „unde e coletul meu”, non-stop.",
    ru: "Отвечает на «где моя посылка», круглосуточно.",
  },
  heroSub: {
    ro: "Preia întrebările care se repetă toată ziua și predă operatorului doar cererile care chiar au nevoie de om — deja complete.",
    ru: "Берёт на себя повторяющиеся вопросы и передаёт оператору только те заявки, где нужен человек — уже собранные полностью.",
  },
  widgetTitle: { ro: "Asistent clienți", ru: "Помощник клиентов", en: "Customer assistant" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot ajuta cu expedieri, livrări sau tarife. Cu ce vă pot fi de folos?",
    ru: "Здравствуйте! 👋 Помогу с отправлениями, доставкой или тарифами. Чем могу помочь?",
    en: "Hello! 👋 I can help with shipments, deliveries or rates. How can I help?",
  },
  suggestions: {
    ro: ["Când ajunge coletul?", "Cât costă livrarea?", "Cum schimb adresa?"],
    ru: ["Когда придёт посылка?", "Сколько стоит доставка?", "Как изменить адрес?"],
    en: ["When will it arrive?", "How much is delivery?", "How do I change the address?"],
  },
  proof: [
    { ro: "Răspunde non-stop", ru: "Отвечает круглосуточно" },
    { ro: "Adună datele cererii", ru: "Собирает данные заявки" },
    { ro: "Predă operatorului", ru: "Передаёт оператору" },
  ],
  accent: "#f97316",
  aiRole: "a calm, precise customer-service assistant for a courier company in Moldova",
  aiInfo:
    "The company delivers parcels across Moldova and abroad. Typical topics: where a parcel is, delivery times, tariffs by weight and destination, changing a delivery address, how to send a parcel, working hours.",
  aiCollect:
    "the tracking number if they have one, what exactly they need, and a phone number the operator can call back on",
  formal: true,
};

const SERVICE_AUTO: Business = {
  slug: "service",
  name: "Service auto",
  category: { ro: "Service auto · RO / RU", ru: "Автосервис · RO / RU" },
  heroTitle: {
    ro: "Răspunde clienților cât timp ești sub mașină.",
    ru: "Отвечает клиентам, пока вы под машиной.",
  },
  heroSub: {
    ro: "Spune cât costă, ce se poate face și când e loc liber — apoi notează mașina, problema și telefonul, ca să suni la sigur.",
    ru: "Скажет цену, что можно сделать и когда есть место — затем запишет машину, проблему и телефон, чтобы вы перезвонили наверняка.",
  },
  widgetTitle: { ro: "Programări service", ru: "Запись в сервис", en: "Service booking" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot spune ce lucrări facem, cât costă și când avem loc liber. Ce mașină aveți?",
    ru: "Здравствуйте! 👋 Расскажу, какие работы делаем, сколько стоят и когда есть место. Какая у вас машина?",
    en: "Hello! 👋 I can tell you what we do, what it costs and when we have a slot. What car do you drive?",
  },
  suggestions: {
    ro: ["Cât costă o revizie?", "Aveți loc liber săptămâna asta?", "Faceți diagnoză?"],
    ru: ["Сколько стоит ТО?", "Есть место на этой неделе?", "Делаете диагностику?"],
    en: ["How much is a service?", "Any slot this week?", "Do you do diagnostics?"],
  },
  proof: [
    { ro: "Spune prețul orientativ", ru: "Называет ориентировочную цену" },
    { ro: "Preia programarea", ru: "Принимает запись" },
    { ro: "Notează mașina și problema", ru: "Записывает машину и проблему" },
  ],
  accent: "#dc2626",
  aiRole: "a practical, straight-talking assistant for a car service workshop in Moldova",
  aiInfo:
    "The workshop does servicing, diagnostics, brakes, suspension, engine work and tyre changes. It gives rough price ranges, never firm quotes without seeing the car. Typical hours Monday–Saturday.",
  aiCollect:
    "the car make, model and year, what the problem or the wanted job is, and when it would suit them to come in",
  formal: true,
};

const CAZARE: Business = {
  slug: "cazare",
  name: "Pensiunea",
  category: { ro: "Cazare · RO / RU", ru: "Проживание · RO / RU" },
  heroTitle: {
    ro: "Preia cereri de rezervare și noaptea.",
    ru: "Принимает заявки на бронь даже ночью.",
  },
  heroSub: {
    ro: "Răspunde despre camere, prețuri și ce e inclus, apoi notează datele rezervării — fără comision către platforme.",
    ru: "Отвечает о номерах, ценах и что входит, затем записывает данные брони — без комиссии платформам.",
  },
  widgetTitle: { ro: "Rezervări", ru: "Бронирование", en: "Reservations" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot spune ce camere avem libere, cât costă și ce include. Pentru ce perioadă căutați?",
    ru: "Здравствуйте! 👋 Расскажу, какие номера свободны, сколько стоят и что входит. На какие даты ищете?",
    en: "Hello! 👋 I can tell you what rooms are free, prices and what is included. Which dates are you looking at?",
  },
  suggestions: {
    ro: ["Aveți liber în weekend?", "Cât costă o noapte?", "Se poate cu animale?"],
    ru: ["Есть свободно на выходные?", "Сколько стоит ночь?", "Можно с животными?"],
    en: ["Anything free this weekend?", "How much per night?", "Are pets allowed?"],
  },
  proof: [
    { ro: "Răspunde non-stop", ru: "Отвечает круглосуточно" },
    { ro: "Preia rezervarea", ru: "Принимает бронь" },
    { ro: "Fără comision", ru: "Без комиссии" },
  ],
  accent: "#0d9488",
  aiRole: "a warm, hospitable assistant for a guesthouse in Moldova",
  aiInfo:
    "The guesthouse has rooms for two to six people, breakfast on request, parking, a terrace and an outdoor grill area. Check-in from 14:00, check-out until 12:00. Prices per night depend on the room and season.",
  aiCollect:
    "the arrival and departure dates, how many people, and a phone number for confirming the booking",
  formal: true,
};

const CONSTRUCTII: Business = {
  slug: "constructii",
  name: "Firma de construcții",
  category: { ro: "Construcții · RO / RU", ru: "Строительство · RO / RU" },
  heroTitle: {
    ro: "Preia cereri de ofertă, non-stop.",
    ru: "Принимает заявки на смету, круглосуточно.",
  },
  heroSub: {
    ro: "Află ce lucrare vrea omul, unde și cât de mare — și îți trimite cererea gata pregătită, nu un „sunați-mă”.",
    ru: "Выясняет, какая работа нужна, где и какого объёма — и передаёт вам готовую заявку, а не «перезвоните мне».",
  },
  widgetTitle: { ro: "Cerere de ofertă", ru: "Заявка на смету", en: "Request a quote" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot spune ce lucrări facem și vă pregătesc o cerere de ofertă. Ce aveți de făcut?",
    ru: "Здравствуйте! 👋 Расскажу, какие работы делаем, и подготовлю заявку на смету. Что нужно сделать?",
    en: "Hello! 👋 I can tell you what we do and prepare a quote request. What do you need done?",
  },
  suggestions: {
    ro: ["Cât costă o renovare?", "Faceți și acoperișuri?", "Lucrați în afara Chișinăului?"],
    ru: ["Сколько стоит ремонт?", "Крыши делаете?", "Работаете за пределами Кишинёва?"],
    en: ["How much is a renovation?", "Do you do roofs?", "Do you work outside Chișinău?"],
  },
  proof: [
    { ro: "Află detaliile lucrării", ru: "Выясняет детали работы" },
    { ro: "Pregătește cererea", ru: "Готовит заявку" },
    { ro: "Nu pierde clientul", ru: "Не теряет клиента" },
  ],
  accent: "#ca8a04",
  aiRole: "a competent, no-nonsense assistant for a construction and renovation company in Moldova",
  aiInfo:
    "The company does flat and house renovations, finishing work, roofing, facades and small builds. It never gives firm prices in chat — only rough ranges and the promise of a site visit for an exact quote.",
  aiCollect:
    "what work is needed, the location and approximate size in square metres, when they want it started, and a phone number",
  formal: true,
};

const VETERINAR: Business = {
  slug: "veterinar",
  name: "Clinica veterinară",
  category: { ro: "Veterinar · RO / RU", ru: "Ветеринария · RO / RU" },
  heroTitle: {
    ro: "Răspunde stăpânilor grijulii, non-stop.",
    ru: "Отвечает встревоженным хозяевам круглосуточно.",
  },
  heroSub: {
    ro: "Spune ce servicii sunt, cât costă și când e loc liber — iar în caz de urgență îndrumă omul imediat, fără să aștepte recepția.",
    ru: "Расскажет об услугах, ценах и свободном времени — а при экстренном случае сразу подскажет, не дожидаясь ресепшн.",
  },
  widgetTitle: { ro: "Programări", ru: "Запись на приём", en: "Appointments" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot ajuta cu o programare sau întrebări despre servicii. Ce animăluț aveți?",
    ru: "Здравствуйте! 👋 Помогу записаться или отвечу об услугах. Какой у вас питомец?",
    en: "Hello! 👋 I can book you in or answer questions about our services. What pet do you have?",
  },
  suggestions: {
    ro: ["Vreau o programare", "Cât costă o consultație?", "Ce fac în caz de urgență?"],
    ru: ["Хочу записаться", "Сколько стоит приём?", "Что делать при экстренном случае?"],
    en: ["I want an appointment", "How much is a consultation?", "What about emergencies?"],
  },
  proof: [
    { ro: "Preia programări", ru: "Принимает записи" },
    { ro: "Răspunde la întrebări", ru: "Отвечает на вопросы" },
    { ro: "Îndrumă la urgențe", ru: "Подсказывает при экстренных случаях" },
  ],
  accent: "#16a34a",
  aiRole: "a calm, reassuring reception assistant for a veterinary clinic in Chișinău",
  aiInfo:
    "The clinic offers consultations, vaccinations, sterilisation, dentistry, ultrasound and analyses, for cats and dogs mainly. For emergencies it tells the owner to come in straight away and to call ahead. Typical hours Monday–Saturday.",
  aiCollect:
    "what animal it is and its age, what is worrying them, and when it would suit them to come in",
  formal: true,
};

const FITNESS: Business = {
  slug: "fitness",
  name: "Sala de fitness",
  category: { ro: "Fitness · RO / RU", ru: "Фитнес · RO / RU" },
  heroTitle: {
    ro: "Răspunde despre abonamente, non-stop.",
    ru: "Отвечает про абонементы, круглосуточно.",
  },
  heroSub: {
    ro: "Spune ce abonamente sunt, cât costă și ce include fiecare — apoi notează cine vrea o vizită de probă.",
    ru: "Расскажет про абонементы, цены и что входит — затем запишет тех, кто хочет пробное занятие.",
  },
  widgetTitle: { ro: "Abonamente și antrenamente", ru: "Абонементы и тренировки", en: "Memberships" },
  greeting: {
    ro: "Bună! 👋 Îți pot spune ce abonamente avem, cât costă și ce include fiecare. Ce te interesează?",
    ru: "Привет! 👋 Расскажу про абонементы, цены и что входит. Что вас интересует?",
    en: "Hi! 👋 I can tell you about our memberships, prices and what each includes. What are you after?",
  },
  suggestions: {
    ro: ["Cât costă un abonament?", "Aveți antrenor personal?", "Pot veni la o probă?"],
    ru: ["Сколько стоит абонемент?", "Есть персональный тренер?", "Можно на пробное?"],
    en: ["How much is a membership?", "Do you have personal trainers?", "Can I try a session?"],
  },
  proof: [
    { ro: "Explică abonamentele", ru: "Объясняет абонементы" },
    { ro: "Preia înscrierea", ru: "Принимает запись" },
    { ro: "Răspunde non-stop", ru: "Отвечает круглосуточно" },
  ],
  accent: "#7c3aed",
  aiRole: "an energetic, welcoming assistant for a fitness club in Chișinău",
  aiInfo:
    "The club offers monthly and yearly memberships, group classes, personal training and a trial session. Open early morning to late evening, seven days a week. Prices depend on the membership length and whether classes are included.",
  aiCollect:
    "what they want to train for, whether they have trained before, and a phone number so the club can arrange a trial session",
};

const SCOALA_AUTO: Business = {
  slug: "scoala",
  name: "Școala auto",
  category: { ro: "Școală auto · RO / RU", ru: "Автошкола · RO / RU" },
  heroTitle: {
    ro: "Răspunde la aceleași întrebări despre cursuri.",
    ru: "Отвечает на одни и те же вопросы о курсах.",
  },
  heroSub: {
    ro: "Cât costă, cât durează, ce acte trebuie, când începe grupa următoare — apoi notează cine vrea să se înscrie.",
    ru: "Сколько стоит, сколько длится, какие документы нужны, когда следующая группа — затем записывает желающих.",
  },
  widgetTitle: { ro: "Înscrieri la cursuri", ru: "Запись на курсы", en: "Course sign-up" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot spune cât costă cursul, cât durează și ce acte trebuie. Ce categorie vă interesează?",
    ru: "Здравствуйте! 👋 Расскажу, сколько стоит курс, сколько длится и какие документы нужны. Какая категория вас интересует?",
    en: "Hello! 👋 I can tell you the course price, how long it takes and what documents you need. Which category?",
  },
  suggestions: {
    ro: ["Cât costă cursul?", "Când începe grupa nouă?", "Ce acte îmi trebuie?"],
    ru: ["Сколько стоит курс?", "Когда новая группа?", "Какие документы нужны?"],
    en: ["How much is the course?", "When does the next group start?", "What documents do I need?"],
  },
  proof: [
    { ro: "Explică prețul și durata", ru: "Объясняет цену и сроки" },
    { ro: "Preia înscrierea", ru: "Принимает запись" },
    { ro: "Răspunde non-stop", ru: "Отвечает круглосуточно" },
  ],
  accent: "#0284c7",
  aiRole: "a patient, clear assistant for a driving school in Chișinău",
  aiInfo:
    "The school prepares for categories B and others, with theory classes and driving hours. Typical course length is two to three months. Documents needed: identity card, medical certificate and photos. Groups start regularly through the year.",
  aiCollect:
    "which category they want, whether they have started theory anywhere before, and a phone number for enrolment",
  formal: true,
};

// Parents ask the same six questions — age, groups, schedule, price, location,
// kit — and they ask them in the evening, when nobody is at the pitch.
const FOTBAL: Business = {
  slug: "fotbal",
  name: "Școala de Fotbal",
  category: { ro: "Fotbal pentru copii · RO / RU", ru: "Футбол для детей · RO / RU" },
  heroTitle: {
    ro: "Răspunde părinților seara, când nu e nimeni la teren.",
    ru: "Отвечает родителям вечером, когда никого нет на поле.",
  },
  heroSub: {
    ro: "De la ce vârstă, ce grupe, orar, preț, unde e terenul — apoi notează copilul la o probă și trimite cererea în CRM-ul vostru.",
    ru: "С какого возраста, какие группы, расписание, цена, где поле — затем записывает ребёнка на пробную и отправляет заявку в вашу CRM.",
  },
  widgetTitle: { ro: "Înscriere la fotbal", ru: "Запись в футбольную школу", en: "Football sign-up" },
  greeting: {
    ro: "Bună ziua! 👋 Vă pot spune de la ce vârstă primim copii, ce grupe avem și cum e orarul. Ce vârstă are copilul?",
    ru: "Здравствуйте! 👋 Расскажу, с какого возраста принимаем детей, какие есть группы и расписание. Сколько лет ребёнку?",
    en: "Hello! 👋 I can tell you from what age we take children, our groups and the schedule. How old is your child?",
  },
  suggestions: {
    ro: ["De la ce vârstă primiți?", "Cât costă pe lună?", "Când sunt antrenamentele?"],
    ru: ["С какого возраста берёте?", "Сколько стоит в месяц?", "Когда тренировки?"],
    en: ["From what age do you accept?", "How much per month?", "When are the trainings?"],
  },
  proof: [
    { ro: "Răspunde seara și în weekend", ru: "Отвечает вечером и в выходные" },
    { ro: "Notează copilul la probă", ru: "Записывает ребёнка на пробную" },
    { ro: "Trimite cererea în CRM", ru: "Отправляет заявку в CRM" },
  ],
  accent: "#15803d",
  aiRole:
    "a warm, patient assistant for a children's football school in Chișinău, talking to parents",
  aiInfo:
    "The school takes children from the age of 3. Children are placed in groups by age, so the training matches what a child of that age can actually do. Training sessions run several times a week, in the afternoon and at weekends, so they fit around kindergarten and school. A first trial session lets the child try it before the parents decide anything. Children need sports clothes and football boots; the school advises on what to buy for the smallest ones. Exact prices, the current schedule for each age group and the address of the pitch are confirmed by a coach when they call back.",
  aiCollect:
    "the child's age, whether the child has played football anywhere before, which part of the city is convenient for them, and a phone number so a coach can call back and book the trial session",
  formal: true,
  clientDemo: true,
};

// Cabinet de chirurgie laser. Recepția e deschisă 34 de ore pe săptămână și se
// intră doar cu programare, deci fiecare întrebare devine un telefon. Iar
// jumătate din catalog — proctologie, condiloame, estetică intimă, hiperhidroză
// — sunt lucruri pe care omul nu le întreabă cu voce tare la telefon. Acolo e
// valoarea unui chat, nu în „preia programări".
const LASERMED: Business = {
  slug: "lasermed",
  name: "LaserMed",
  category: { ro: "Chirurgie laser · RO / RU", ru: "Лазерная хирургия · RO / RU" },
  heroTitle: {
    ro: "Răspunde pacienților și când recepția e închisă.",
    ru: "Отвечает пациентам, даже когда ресепшн закрыт.",
  },
  heroSub: {
    ro: "Recepția lucrează 34 de ore pe săptămână. Întrebările vin în celelalte 134 — seara, duminica, și mai ales cele pe care pacientul nu le pune la telefon.",
    ru: "Ресепшн работает 34 часа в неделю. Вопросы приходят в остальные 134 — вечером, в воскресенье, и особенно те, которые пациент не задаёт по телефону.",
  },
  widgetTitle: { ro: "Asistent LaserMed", ru: "Ассистент LaserMed", en: "LaserMed assistant" },
  greeting: {
    ro: "Bună ziua! 👋 Sunt asistentul LaserMed. Vă pot explica procedurile cu laser și vă pot nota pentru o consultație. Ce vă interesează?",
    ru: "Здравствуйте! 👋 Я ассистент LaserMed. Расскажу о лазерных процедурах и запишу вас на консультацию. Что вас интересует?",
    en: "Hello! 👋 I am the LaserMed assistant. I can explain our laser procedures and book you a consultation. What are you interested in?",
  },
  suggestions: {
    ro: ["Vreau să înlătur o aluniță", "Cât durează recuperarea?", "Vreau o programare"],
    ru: ["Хочу удалить родинку", "Сколько длится восстановление?", "Хочу записаться"],
    en: ["I want a mole removed", "How long is the recovery?", "I would like an appointment"],
  },
  proof: [
    { ro: "Notează programări 24/7", ru: "Записывает 24/7" },
    { ro: "Răspunde discret, fără telefon", ru: "Отвечает деликатно, без звонка" },
    { ro: "Română și rusă", ru: "Румынский и русский" },
  ],
  accent: "#1b8fd1",
  aiRole:
    "the reception assistant for LaserMed, a laser surgery and aesthetic medicine office in Chișinău, Moldova",
  aiInfo: `LaserMed is a laser surgery and aesthetic medicine office in Chișinău, str. Cuza Vodă 44A. Consultations and procedures are BY PRIOR APPOINTMENT ONLY. Reception: 022 20 23 73. Urgent cases: 069 02 08 44. Email: info@lasermed.md. Website lasermed.md, in Romanian and Russian.
Working hours: Monday and Thursday 12:00–18:00; Tuesday, Wednesday and Friday 9:00–15:00; Saturday 9:00–13:00; closed on Sunday.
The patient is seen by a surgeon with competence in aesthetic medicine and laser technology.
What is done here, with a fractional CO2 laser and related equipment:
- Laser cosmetology: facial rejuvenation and laser peel, 2D and 3D express rejuvenation, SMOOTH rejuvenation / super-lift, wrinkle remodelling, scar correction, acne and post-acne treatment, stretch marks, freckles, pigment spots, skin resurfacing, laser eyelid rejuvenation, plasmolifting (PRP).
- Laser surgery: removal of benign skin formations, moles (nevi), warts, papillomas, calluses, ingrown toenail correction, haemangiomas, laser blepharoplasty (eyelid correction), laser sclerotherapy of breast cysts, axillary hyperhidrosis (excessive sweating), laser liposuction of the double chin.
- Laser dermatology: genital and perianal condylomas, molluscum contagiosum, onychomycosis (nail fungus), vascular lesions and couperose, PRP for hair loss.
- Proctology: laser treatment of haemorrhoids, anal fissure, haemorrhoidal skin tags, plus a proctologist consultation.
- Phlebology: endovenous laser therapy for veins.
- Intimate aesthetic surgery for women: laser labiaplasty, vaginal rejuvenation, G-spot augmentation, non-surgical clitoroplasty, 3D HIFU intimate SMAS lifting.
- Also: mesotherapy, treatment of excessive sweating, 3D HIFU facial lifting.
Why laser: the removal is completely non-contact and sterile, practically painless, precise and fast, reaches difficult areas, heals without scars, burns or pigmentation, and the patient returns to normal activity right after the procedure.
PRICES: LaserMed does not publish a fixed price list. The price depends on the formation, its size and the number of sessions, and is confirmed by the doctor at the consultation. There are periodic promotions listed on the "Tarife / Promoții" page of the site. NEVER state a price, a discount or a number of sessions yourself.
MEDICAL LIMITS — very important: you are not a doctor. Never diagnose. Never say whether a mole, a formation or a symptom is dangerous, benign or malignant, and never say whether something can or cannot be removed — that is decided at the consultation, after the doctor sees it. If someone describes something that sounds alarming (a mole that changed, bleeds, grows, hurts), do not evaluate it; say calmly that exactly this is what the consultation is for and offer the earliest appointment.
DISCRETION: many of the requests here are intimate or embarrassing — haemorrhoids, condylomas, sweating, intimate aesthetics. Treat every one of them as ordinary medical work: matter-of-fact, warm, no jokes, no surprise, no extra questions about details that are not needed. Reassure them that what they write stays between them and the clinic.`,
  aiCollect:
    "what procedure or problem brings them in, whether they have been to LaserMed before, and which days or hours suit them for a consultation",
  clientDemo: true,
  formal: true,
};

export const BUSINESSES: Record<string, Business> = {
  lasermed: LASERMED,
  fotbal: FOTBAL,
  imobiliar: REALESTATE,
  dental: DENTAL,
  restaurant: RESTAURANT,
  alexweb: ALEXWEB,
  fancourier: COURIER,
  curier: CURIER,
  service: SERVICE_AUTO,
  cazare: CAZARE,
  constructii: CONSTRUCTII,
  veterinar: VETERINAR,
  fitness: FITNESS,
  scoala: SCOALA_AUTO,
};

export const DEFAULT_SLUG = "imobiliar";

export function getBusiness(slug?: string | null): Business {
  if (slug && BUSINESSES[slug]) return BUSINESSES[slug];
  return BUSINESSES[DEFAULT_SLUG];
}
