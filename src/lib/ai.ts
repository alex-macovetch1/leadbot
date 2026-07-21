/* ------------------------------------------------------------------
   LLM chat — Google Gemini (free tier) for now.

   Provider-isolated on purpose: to switch to Claude (Anthropic) later,
   only this file changes — the /api/chat route and the widget stay the
   same. Gemini roles are "user" and "model"; the system prompt goes in
   a separate `systemInstruction` field.
------------------------------------------------------------------ */

export type ChatMsg = { role: "user" | "model"; text: string };

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function chatComplete(system: string, messages: ChatMsg[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY lipsește (adaugă-l în .env.local).");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1024,
      // Gemini 3 Flash "thinks" by default, which eats the output budget and can
      // truncate the reply before the LEAD_JSON marker. Turn it off for this task.
      thinkingConfig: { thinkingBudget: 0 },
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
