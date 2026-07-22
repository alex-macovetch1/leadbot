"use client";

import { useEffect, useRef, useState } from "react";
import { UI, type Lang } from "@/lib/flow";
import type { Bilingual } from "@/lib/businesses";
import type { ChatMsg } from "@/lib/ai";
import type { Listing } from "@/lib/listings";

type Msg = { from: "bot" | "user"; text: string; cards?: Listing[] };

export type WidgetBiz = {
  slug: string;
  title: Bilingual;
  greeting: Bilingual;
  accent: string;
};

export default function ChatWidget({ biz }: { biz: WidgetBiz }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]); // display
  const [convo, setConvo] = useState<ChatMsg[]>([]); // history sent to the AI (no greeting)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = biz.accent;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function pickLanguage(l: Lang) {
    setLang(l);
    setMessages([{ from: "bot", text: biz.greeting[l] }]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading || done) return;
    const l = lang ?? "ro";

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
            l === "ru"
              ? "Извините, что-то пошло не так. Попробуйте ещё раз."
              : "Scuze, ceva n-a mers. Mai încearcă o dată.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setLang(null);
    setMessages([]);
    setConvo([]);
    setInput("");
    setLoading(false);
    setDone(false);
  }

  const l = lang ?? "ro";

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={UI.openLabel[l]}
          style={{ backgroundColor: accent }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-lg transition hover:brightness-95"
        >
          <ChatIcon />
          <span className="font-medium">{UI.openLabel[l]}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* header */}
          <div
            style={{ backgroundColor: accent }}
            className="flex items-center justify-between px-4 py-3 text-white"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <ChatIcon />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{biz.title[l]}</div>
                <div className="flex items-center gap-1 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {UI.online[l]}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="close" className="rounded p-1 hover:bg-white/15">
              <CloseIcon />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-950">
            {lang === null ? (
              <div className="space-y-3">
                <Bubble from="bot" accent={accent}>
                  Alege limba · Выберите язык
                </Bubble>
                <div className="flex gap-2">
                  <PickBtn onClick={() => pickLanguage("ro")}>🇷🇴 Română</PickBtn>
                  <PickBtn onClick={() => pickLanguage("ru")}>🇷🇺 Русский</PickBtn>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  {m.text && (
                    <Bubble from={m.from} accent={accent}>
                      {m.text}
                    </Bubble>
                  )}
                  {m.cards && m.cards.length > 0 && (
                    <div className="space-y-2">
                      {m.cards.map((c) => (
                        <ListingCard key={c.id} listing={c} lang={l} accent={accent} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm dark:bg-zinc-800">
                  <span className="typing-dots text-zinc-400">•••</span>
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="border-t border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
            {done ? (
              <button
                onClick={restart}
                className="w-full rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {UI.restart[l]}
              </button>
            ) : lang !== null ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex gap-2"
              >
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={l === "ru" ? "Напишите сообщение…" : "Scrie un mesaj…"}
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: accent }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-60"
                >
                  {UI.send[l]}
                </button>
              </form>
            ) : (
              <p className="py-2 text-center text-xs text-zinc-400">{biz.title[l]}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({
  from,
  accent,
  children,
}: {
  from: "bot" | "user";
  accent: string;
  children: React.ReactNode;
}) {
  const isBot = from === "bot";
  return (
    <div className={isBot ? "flex justify-start" : "flex justify-end"}>
      <div
        style={isBot ? undefined : { backgroundColor: accent }}
        className={
          "max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm " +
          (isBot
            ? "rounded-bl-sm bg-white text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
            : "rounded-br-sm text-white")
        }
      >
        {children}
      </div>
    </div>
  );
}

function PickBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
    >
      {children}
    </button>
  );
}

function ListingCard({ listing, lang, accent }: { listing: Listing; lang: Lang; accent: string }) {
  const rooms = lang === "ru" ? "комн." : "cam.";
  const price =
    listing.deal === "rent"
      ? `€${listing.price}/${lang === "ru" ? "мес" : "lună"}`
      : `€${listing.price.toLocaleString("de-DE")}`;
  return (
    <div className="max-w-[90%] rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{listing.title[lang]}</div>
        <div style={{ color: accent }} className="whitespace-nowrap text-sm font-bold">
          {price}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{listing.zoneLabel}</span>
        <span>
          {listing.rooms} {rooms}
        </span>
        <span>{listing.area} m²</span>
        <span>et. {listing.floor}</span>
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
