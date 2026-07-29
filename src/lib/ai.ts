/* ------------------------------------------------------------------
   LLM chat — Google Gemini (free tier) for now.

   Provider-isolated on purpose: to switch to Claude (Anthropic) later,
   only this file changes — the /api/chat route and the widget stay the
   same. Gemini roles are "user" and "model"; the system prompt goes in
   a separate `systemInstruction` field.
------------------------------------------------------------------ */

export type ChatMsg = { role: "user" | "model"; text: string };

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

/* Cota gratuită se epuizează după câteva conversații la rând, iar atunci
   vizitatorul primea „ceva n-a mers" — exact în clipa în care un client
   potențial încearcă demonstrația. Așa că la 429 (sau 503) trecem pe un
   model mai mic, cu limită separată: un răspuns puțin mai simplu e mult
   mai bun decât niciun răspuns. */
const REZERVE = [
  process.env.GEMINI_MODEL_FALLBACK || "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

export async function chatComplete(system: string, messages: ChatMsg[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY lipsește (adaugă-l în .env.local).");

  let ultima = "";
  for (const model of [MODEL, ...REZERVE]) {
    try {
      return await cerere(model, key, system, messages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      ultima = msg;
      // doar limitele de cotă / indisponibilitatea merită reîncercate pe alt model
      if (!/\b(429|503|500)\b/.test(msg)) throw e;
    }
  }
  throw new Error(ultima);
}

async function cerere(MODEL: string, key: string, system: string, messages: ChatMsg[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return parts.map((p: any) => p.text ?? "").join("").trim();
}
