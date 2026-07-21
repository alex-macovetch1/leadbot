import { NextResponse } from "next/server";
import { chatComplete, type ChatMsg } from "@/lib/ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { saveLead } from "@/lib/leads";

export async function POST(request: Request) {
  let body: { messages?: ChatMsg[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-20); // keep the last turns only

  let reply: string;
  try {
    reply = await chatComplete(SYSTEM_PROMPT, messages);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // The assistant appends a LEAD_JSON marker once it has every field.
  let done = false;
  const match = reply.match(/LEAD_JSON:\s*(\{[\s\S]*?\})/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      saveLead({
        lang: data.lang ?? "ro",
        deal: data.deal ?? "",
        propertyType: data.propertyType ?? "",
        zone: data.zone ?? "",
        budget: data.budget ?? "",
        name: data.name ?? "",
        phone: data.phone ?? "",
      });
      done = true;
    } catch {
      /* if the marker was malformed, just don't save — the chat still works */
    }
    reply = reply.replace(/LEAD_JSON:[\s\S]*$/, "").trim();
  }

  return NextResponse.json({ reply, done });
}
