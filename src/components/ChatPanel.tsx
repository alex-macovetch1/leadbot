"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { UI, type Lang } from "@/lib/flow";
import type { Bilingual, BilingualList } from "@/lib/businesses";
import type { ChatMsg } from "@/lib/ai";
import type { Listing } from "@/lib/listings";

type Msg = { from: "bot" | "user"; text: string; cards?: Listing[] };

/** Romanian is the guaranteed language; English may be missing on a config. */
const tr = (b: { ro: string; ru: string; en?: string }, l: Lang) => b[l] ?? b.ro;
const trL = (b: { ro: string[]; ru: string[]; en?: string[] }, l: Lang) => b[l] ?? b.ro;

export type WidgetBiz = {
  slug: string;
  title: Bilingual;
  greeting: Bilingual;
  suggestions: BilingualList;
  accent: string;
  // Address the visitor with "dumneavoastră" instead of "tu". Small shops read
  // better on first-name terms; a company with a support desk does not.
  formal?: boolean;
};

/* Drawn, not emoji — Windows does not render flag emoji. */
function Flag({ code }: { code: Lang }) {
  const box = "block h-[13px] w-[18px] overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.12)]";
  if (code === "ro")
    return (<span className={box}><svg viewBox="0 0 3 2" className="h-full w-full"><rect width="1" height="2" fill="#002B7F" /><rect x="1" width="1" height="2" fill="#FCD116" /><rect x="2" width="1" height="2" fill="#CE1126" /></svg></span>);
  if (code === "ru")
    return (<span className={box}><svg viewBox="0 0 3 2" className="h-full w-full"><rect width="3" height="2" fill="#fff" /><rect y=".667" width="3" height=".667" fill="#0039A6" /><rect y="1.333" width="3" height=".667" fill="#D52B1E" /></svg></span>);
  return (<span className={box}><svg viewBox="0 0 60 40" className="h-full w-full"><rect width="60" height="40" fill="#012169" /><path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="9" /><path d="M0 0l60 40M60 0L0 40" stroke="#C8102E" strokeWidth="4" /><path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="14" /><path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="8" /></svg></span>);
}

const LANG_NAME: Record<Lang, string> = { ro: "Română", ru: "Русский", en: "English" };

const COPY = {
  placeholder: { ro: "Scrie un mesaj…", ru: "Напишите сообщение…", en: "Type a message…" },
  hint: { ro: "Sau alege o întrebare", ru: "Или выберите вопрос", en: "Or pick a question" },
  reply: { ro: "răspunde imediat", ru: "отвечает сразу", en: "replies instantly" },
  doneT: { ro: "Te-am notat", ru: "Записали", en: "Got it" },
  doneD: { ro: "Revenim la tine cât de curând.", ru: "Свяжемся с вами в ближайшее время.", en: "We will get back to you shortly." },
};

const COPY_FORMAL = {
  ...COPY,
  placeholder: { ro: "Scrieți un mesaj…", ru: "Напишите сообщение…", en: "Type a message…" },
  hint: { ro: "Sau alegeți o întrebare", ru: "Или выберите вопрос", en: "Or pick a question" },
  doneT: { ro: "Am înregistrat solicitarea", ru: "Заявка зарегистрирована", en: "Request registered" },
  doneD: {
    ro: "Un operator revine cu un răspuns în cel mai scurt timp.",
    ru: "Оператор свяжется с вами в ближайшее время.",
    en: "An operator will get back to you shortly.",
  },
};

export default function ChatPanel({
  biz,
  onClose,
  className = "",
}: {
  biz: WidgetBiz;
  onClose?: () => void;
  className?: string;
}) {
  const T = biz.formal ? COPY_FORMAL : COPY;
  const [lang, setLang] = useState<Lang>("ro");
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: biz.greeting.ro }]);
  const [convo, setConvo] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, done]);

  function reset(to: Lang) {
    setLang(to);
    setMessages([{ from: "bot", text: tr(biz.greeting, to) }]);
    setConvo([]);
    setInput("");
    setLoading(false);
    setDone(false);
  }

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || loading || done) return;

    const nextConvo: ChatMsg[] = [...convo, { role: "user", text }];
    setMessages((m) => [...m, { from: "user", text }]);
    setConvo(nextConvo);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextConvo, biz: biz.slug }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "error");

      const reply: string = data.reply || "…";
      setMessages((m) => [...m, { from: "bot", text: reply, cards: data.matches }]);
      setConvo([...nextConvo, { role: "model", text: reply }]);
      if (data.done) setDone(true);
    } catch {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text:
            lang === "ru"
              ? "Извините, сейчас много обращений — попробуйте ещё раз через минуту."
              : "Scuze, am prea multe cereri chiar acum — mai încercați o dată peste un minut.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }

  const showSuggestions = convo.length === 0 && !loading;
  const vars = { "--a": biz.accent } as CSSProperties;

  return (
    <div style={vars} className={"chat-shell flex flex-col overflow-hidden rounded-[22px] " + className}>
      {/* ── header ── */}
      <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-black/[.07] bg-white/85 px-4 py-3 backdrop-blur-xl">
        <span className="avatar" aria-hidden="true">
          <BotIcon />
          <i className="ring" />
        </span>

        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13.5px] font-semibold tracking-[-.01em] text-slate-900">
            {tr(biz.title, lang)}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {tr(UI.online, lang)} · {T.reply[lang]}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* One flag: the language already chosen. Tapping it restarts in the next one. */}
          <button
            onClick={() => reset(lang === "ro" ? "ru" : lang === "ru" ? "en" : "ro")}
            title={LANG_NAME[lang]}
            aria-label={LANG_NAME[lang]}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-2.5 transition hover:bg-slate-200"
          >
            <Flag code={lang} />
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{lang}</span>
          </button>

          {convo.length > 0 && (
            <button
              onClick={() => reset(lang)}
              aria-label={tr(UI.restart, lang)}
              title={tr(UI.restart, lang)}
              className="icon-btn"
            >
              <RefreshIcon />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} aria-label="close" className="icon-btn">
              <CloseIcon />
            </button>
          )}
        </div>
      </header>

      {/* ── messages ── */}
      <div ref={scrollRef} className="chat-scroll chat-bg relative flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2.5">
          {messages.map((m, i) => {
            const firstOfRun = i === 0 || messages[i - 1].from !== m.from;
            return m.from === "bot" ? (
              <div key={i} className="msg-in">
                <div className={"flex items-end gap-2 " + (firstOfRun ? "" : "pl-[38px]")}>
                  {firstOfRun && (
                    <span className="avatar avatar-sm" aria-hidden="true">
                      <BotIcon />
                    </span>
                  )}
                  <div className="bubble bubble-bot">{m.text}</div>
                </div>
                {m.cards && m.cards.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 pl-[38px]">
                    {m.cards.map((c) => (
                      <ListingCard key={c.id} listing={c} lang={lang} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={i} className="msg-in flex justify-end">
                <div className="bubble bubble-me">{m.text}</div>
              </div>
            );
          })}

          {loading && (
            <div className="msg-in flex items-end gap-2">
              <span className="avatar avatar-sm" aria-hidden="true">
                <BotIcon />
              </span>
              <div className="bubble bubble-bot py-3">
                <span className="typing flex items-center">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="mt-1 flex flex-col items-start gap-1.5 pl-[38px]">
              <p className="chip-in mb-0.5 text-[10.5px] font-medium uppercase tracking-[.12em] text-slate-400">
                {T.hint[lang]}
              </p>
              {trL(biz.suggestions, lang).map((s, i) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="q-chip chip-in"
                  style={{ animationDelay: `${90 + i * 70}ms` }}
                >
                  {s}
                  <ArrowIcon />
                </button>
              ))}
            </div>
          )}

          {done && (
            <div className="msg-in mt-1 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/80 px-3.5 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckIcon />
              </span>
              <div className="leading-snug">
                <div className="text-[13px] font-semibold text-emerald-900">{T.doneT[lang]}</div>
                <div className="text-[12.5px] text-emerald-800/75">{T.doneD[lang]}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── composer ── */}
      <div className="shrink-0 border-t border-black/[.07] bg-white/85 px-3 py-3 backdrop-blur-xl">
        {done ? (
          <button onClick={() => reset(lang)} className="restart-btn">
            <RefreshIcon />
            {tr(UI.restart, lang)}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="composer"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={T.placeholder[lang]}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-4 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
            />
            <button type="submit" aria-label={tr(UI.send, lang)} disabled={loading || !input.trim()} className="send-btn">
              <SendIcon />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function ListingCard({ listing, lang }: { listing: Listing; lang: Lang }) {
  const rooms = lang === "ru" ? "комн." : "cam.";
  const price =
    listing.deal === "rent"
      ? `€${listing.price}/${lang === "ru" ? "мес" : "lună"}`
      : `€${listing.price.toLocaleString("de-DE")}`;
  return (
    <div className="listing">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] font-semibold text-slate-800">{listing.title[lang] ?? listing.title.ro}</div>
        <div className="whitespace-nowrap text-[13px] font-bold" style={{ color: "var(--a)" }}>
          {price}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10.5px] text-slate-500">
        <Tag>{listing.zoneLabel}</Tag>
        <Tag>
          {listing.rooms} {rooms}
        </Tag>
        <Tag>{listing.area} m²</Tag>
        <Tag>et. {listing.floor}</Tag>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2 py-0.5">{children}</span>;
}

/* ---------- icons ---------- */

function BotIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <path d="M9 14h.01M15 14h.01" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 14-7-5 14-2.5-5.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="q-chip-arrow">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  );
}
