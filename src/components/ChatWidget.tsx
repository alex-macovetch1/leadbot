"use client";

import { useEffect, useRef, useState } from "react";
import ChatPanel, { type WidgetBiz } from "./ChatPanel";
import { UI } from "@/lib/flow";

export type { WidgetBiz };

export default function ChatWidget({
  biz,
  className = "",
  appearAfter = 0,
  autoOpenAfter = 0,
}: {
  biz: WidgetBiz;
  className?: string;
  /** show the floating button only after this many pixels of scroll */
  appearAfter?: number;
  /** open the chat by itself after this many ms, as a real site widget does */
  autoOpenAfter?: number;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(appearAfter === 0);
  const accent = biz.accent;
  // Odată ce omul a atins butonul, nu-i mai deschidem noi nimic peste el.
  const atins = useRef(false);
  const deschide = (v: boolean) => {
    atins.current = true;
    setOpen(v);
  };

  useEffect(() => {
    if (appearAfter === 0) return;
    const onScroll = () => setVisible(window.scrollY > appearAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [appearAfter]);

  useEffect(() => {
    if (!autoOpenAfter) return;
    const t = setTimeout(() => {
      if (!atins.current) setOpen(true);
    }, autoOpenAfter);
    return () => clearTimeout(t);
  }, [autoOpenAfter]);

  return (
    <div className={className}>
      {!open && (
        <button
          onClick={() => deschide(true)}
          aria-label={UI.openLabel.ro}
          aria-hidden={!visible}
          tabIndex={visible ? 0 : -1}
          style={{ backgroundColor: accent }}
          className={
            "fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full px-5 py-3.5 text-white shadow-lg shadow-black/40 transition-all duration-300 hover:brightness-110 active:scale-95 " +
            (visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")
          }
        >
          <span className="relative flex">
            <ChatIcon />
            <span
              style={{ boxShadow: `0 0 0 2px ${accent}` }}
              className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-300"
            />
          </span>
          <span className="text-sm font-semibold">{UI.openLabel.ro}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto">
          <ChatPanel
            biz={biz}
            onClose={() => deschide(false)}
            className="panel-glow h-[min(78vh,560px)] w-full sm:w-[380px]"
          />
        </div>
      )}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
