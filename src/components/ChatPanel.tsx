"use client";

import { useEffect, useRef, useState } from "react";
import { UI, type Lang } from "@/lib/flow";
import type { Bilingual, BilingualList } from "@/lib/businesses";
import type { ChatMsg } from "@/lib/ai";
import type { Listing } from "@/lib/listings";

type Msg = { from: "bot" | "user"; text: string; cards?: Listing[] };

export type WidgetBiz = {
  slug: string;
  title: Bilingual;
  greeting: Bilingual;
  suggestions: BilingualList;
  accent: string;
};

const COPY = {
  placeholder: { ro: "Scrie un mesaj…", ru: "Напишите сообщение…" },
  hint: { ro: "Întreabă-mă, de exemplu:", ru: "Спросите меня, например:" },
  poweredBy: { ro: "asistent AI", ru: "AI-ассистент" },
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
  const [lang, setLang] = useState<Lang>("ro");
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: biz.greeting.ro }]);
  const [convo, setConvo] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const accent = biz.accent;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function reset(to: Lang) {
    setLang(to);
    setMessages([{ from: "bot", text: biz.greeting[to] }]);
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
              ? "Извините, что-то пошло не так. Попробуйте ещё раз."
              : "Scuze, ceva n-a mers. Mai încearcă o dată.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }

  const showSuggestions = convo.length === 0 && !loading;

  return (
    <div className={"flex flex-col overflow-hidden rounded-2xl bg-white text-slate-900 " + className}>
      {/* header */}
      <div
        style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 72%, #000))` }}
        className="flex shrink-0 items-center justify-between gap-2 px-3.5 py-3 text-white"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25">
            <BotIcon />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold">{biz.title[lang]}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/85">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {UI.online[lang]}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* language switch */}
          <div className="flex overflow-hidden rounded-lg bg-black/15 p-0.5 text-[11px] font-semibold ring-1 ring-white/15">
            {(["ro", "ru"] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => code !== lang && reset(code)}
                aria-pressed={lang === code}
                className={
                  "rounded-md px-2 py-1 uppercase transition " +
                  (lang === code ? "bg-white/90 text-slate-900" : "text-white/70 hover:text-white")
                }
              >
                {code}
              </button>
            ))}
          </div>

          {convo.length > 0 && (
            <button
              onClick={() => reset(lang)}
              aria-label={UI.restart[lang]}
              title={UI.restart[lang]}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <RefreshIcon />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="close"
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3.5 py-4">
        {messages.map((m, i) =>
          m.from === "bot" ? (
            <div key={i} className="space-y-2">
              <Row accent={accent}>
                <Bubble>{m.text}</Bubble>
              </Row>
              {m.cards && m.cards.length > 0 && (
                <div className="ml-10 space-y-2">
                  {m.cards.map((c) => (
                    <ListingCard key={c.id} listing={c} lang={lang} accent={accent} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div key={i} className="msg-in flex justify-end">
              <div
                style={{ backgroundColor: accent }}
                className="max-w-[82%] whitespace-pre-line rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white shadow-sm"
              >
                {m.text}
              </div>
            </div>
          )
        )}

        {loading && (
          <Row accent={accent}>
            <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-200/70">
              <span className="typing flex items-center">
                <i />
                <i />
                <i />
              </span>
            </div>
          </Row>
        )}

        {showSuggestions && (
          <div className="msg-in ml-10 space-y-2 pt-1">
            <p className="text-[11px] font-medium text-slate-400">{COPY.hint[lang]}</p>
            <div className="flex flex-col items-start gap-1.5">
              {biz.suggestions[lang].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    color: accent,
                    borderColor: `color-mix(in oklab, ${accent} 32%, #e2e8f0)`,
                  }}
                  className="rounded-full border bg-white px-3.5 py-1.5 text-left text-xs font-medium shadow-sm transition hover:-translate-y-px hover:shadow"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2.5">
        {done ? (
          <button
            onClick={() => reset(lang)}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            {UI.restart[lang]}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={COPY.placeholder[lang]}
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label={UI.send[lang]}
              disabled={loading || !input.trim()}
              style={{ backgroundColor: accent }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition hover:brightness-110 disabled:opacity-40"
            >
              <SendIcon />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function Row({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="msg-in flex items-end gap-2">
      <span
        style={{ backgroundColor: accent }}
        className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
      >
        <BotIcon />
      </span>
      {children}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[82%] whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-200/70">
      {children}
    </div>
  );
}

function ListingCard({
  listing,
  lang,
  accent,
}: {
  listing: Listing;
  lang: Lang;
  accent: string;
}) {
  const rooms = lang === "ru" ? "комн." : "cam.";
  const price =
    listing.deal === "rent"
      ? `€${listing.price}/${lang === "ru" ? "мес" : "lună"}`
      : `€${listing.price.toLocaleString("de-DE")}`;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] font-semibold text-slate-800">{listing.title[lang]}</div>
        <div style={{ color: accent }} className="whitespace-nowrap text-[13px] font-bold">
          {price}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-500">
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
  return <span className="rounded-md bg-slate-100 px-1.5 py-0.5">{children}</span>;
}

/* ---------- icons ---------- */

function BotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <path d="M9 14h.01M15 14h.01" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 14-7-5 14-2.5-5.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
