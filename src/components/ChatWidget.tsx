"use client";

import { useEffect, useRef, useState } from "react";
import {
  GREETING,
  STEPS,
  UI,
  isValidPhone,
  labelFor,
  type Lang,
  type Lead,
} from "@/lib/flow";

type Msg = { from: "bot" | "user"; text: string };

const EMPTY_LEAD: Lead = {
  lang: "ro",
  deal: "",
  propertyType: "",
  zone: "",
  budget: "",
  name: "",
  phone: "",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [lead, setLead] = useState<Lead>(EMPTY_LEAD);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const step = lang !== null && stepIdx < STEPS.length ? STEPS[stepIdx] : null;

  // auto-scroll to newest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, done]);

  function pickLanguage(l: Lang) {
    setLang(l);
    setLead({ ...EMPTY_LEAD, lang: l });
    setMessages([
      { from: "bot", text: GREETING[l] },
      { from: "bot", text: STEPS[0].prompt[l] },
    ]);
  }

  function advance(nextLead: Lead) {
    const next = stepIdx + 1;
    setStepIdx(next);
    if (next < STEPS.length) {
      setMessages((m) => [...m, { from: "bot", text: STEPS[next].prompt[nextLead.lang] }]);
    } else {
      finish(nextLead);
    }
  }

  function finish(finalLead: Lead) {
    setDone(true);
    const l = finalLead.lang;
    const summary = [
      UI.summaryTitle[l],
      `• ${labelFor("deal", finalLead.deal, l)} — ${labelFor("propertyType", finalLead.propertyType, l)}`,
      `• ${finalLead.zone}`,
      `• ${labelFor("budget", finalLead.budget, l)} €`,
      `• ${finalLead.name}, ${finalLead.phone}`,
    ].join("\n");
    setMessages((m) => [...m, { from: "bot", text: summary }, { from: "bot", text: UI.thanks[l] }]);
    // Day 2: POST finalLead to /api/leads here.
  }

  function choose(value: string, label: string) {
    if (!step || !step.field) return;
    const nextLead = { ...lead, [step.field]: value } as Lead;
    setLead(nextLead);
    setMessages((m) => [...m, { from: "user", text: label }]);
    advance(nextLead);
  }

  function submitText() {
    if (!step || !step.field) return;
    const value = input.trim();
    if (!value) return;
    if (step.kind === "phone" && !isValidPhone(value)) {
      setError(UI.phoneError[lead.lang]);
      return;
    }
    setError(null);
    const nextLead = { ...lead, [step.field]: value } as Lead;
    setLead(nextLead);
    setMessages((m) => [...m, { from: "user", text: value }]);
    setInput("");
    advance(nextLead);
  }

  function restart() {
    setLang(null);
    setStepIdx(0);
    setMessages([]);
    setInput("");
    setLead(EMPTY_LEAD);
    setDone(false);
    setError(null);
  }

  const l = lang ?? "ro";

  return (
    <>
      {/* Launcher bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={UI.openLabel[l]}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700"
        >
          <ChatIcon />
          <span className="font-medium">{UI.openLabel[l]}</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <ChatIcon />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{UI.title[l]}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {UI.online[l]}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="close" className="rounded p-1 hover:bg-white/15">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-950">
            {/* language picker first */}
            {lang === null ? (
              <div className="space-y-3">
                <Bubble from="bot">
                  Alege limba · Выберите язык
                </Bubble>
                <div className="flex gap-2">
                  <PickBtn onClick={() => pickLanguage("ro")}>🇷🇴 Română</PickBtn>
                  <PickBtn onClick={() => pickLanguage("ru")}>🇷🇺 Русский</PickBtn>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <Bubble key={i} from={m.from}>
                  {m.text}
                </Bubble>
              ))
            )}

            {/* choice options for the current step */}
            {step && step.kind === "choice" && !done && (
              <div className="flex flex-wrap gap-2 pt-1">
                {step.options!.map((o) => (
                  <PickBtn key={o.value} onClick={() => choose(o.value, o.label[l])}>
                    {o.label[l]}
                  </PickBtn>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Footer input */}
          <div className="border-t border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
            {done ? (
              <button
                onClick={restart}
                className="w-full rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {UI.restart[l]}
              </button>
            ) : step && (step.kind === "text" || step.kind === "phone") ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitText();
                }}
                className="flex gap-2"
              >
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={step.placeholder?.[l] ?? ""}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  inputMode={step.kind === "phone" ? "tel" : "text"}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {UI.send[l]}
                </button>
              </form>
            ) : (
              <p className="py-2 text-center text-xs text-zinc-400">
                {lang === null ? "" : UI.title[l]}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ from, children }: { from: "bot" | "user"; children: React.ReactNode }) {
  const isBot = from === "bot";
  return (
    <div className={isBot ? "flex justify-start" : "flex justify-end"}>
      <div
        className={
          "max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm " +
          (isBot
            ? "rounded-bl-sm bg-white text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
            : "rounded-br-sm bg-emerald-600 text-white")
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
      className="rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-zinc-800 dark:text-emerald-300"
    >
      {children}
    </button>
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
