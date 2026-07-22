import { NextResponse } from "next/server";
import { chatComplete, type ChatMsg } from "@/lib/ai";
import { buildSystemPrompt } from "@/lib/prompt";
import { getBusiness } from "@/lib/businesses";
import { saveDemoLead } from "@/lib/leads";
import { searchListings, type Listing } from "@/lib/listings";

// The widget is embedded on other domains (the portfolio and clients' sites),
// so the endpoint must allow cross-origin requests.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  let body: { messages?: ChatMsg[]; biz?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }

  const biz = getBusiness(body.biz);
  const messages = (body.messages ?? []).slice(-20); // keep the last turns only

  let reply: string;
  try {
    reply = await chatComplete(buildSystemPrompt(biz), messages);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 502, headers: CORS });
  }

  // Real-estate bots emit a SEARCH_JSON marker with the visitor's criteria.
  // We filter the inventory and return the matches for the chat to render as cards.
  let matches: Listing[] | undefined;
  const searchMatch = reply.match(/SEARCH_JSON:\s*(\{[\s\S]*?\})/);
  if (searchMatch) {
    try {
      const c = JSON.parse(searchMatch[1]);
      matches = searchListings({
        deal: c.deal === "buy" || c.deal === "rent" ? c.deal : undefined,
        rooms: typeof c.rooms === "number" ? c.rooms : undefined,
        zone: typeof c.zone === "string" ? c.zone : undefined,
        budget: typeof c.budget === "number" ? c.budget : undefined,
      });
    } catch {
      /* malformed marker — skip the search, keep the chat working */
    }
    reply = reply.replace(/SEARCH_JSON:[\s\S]*$/, "").trim();
  }

  // The assistant appends a LEAD_JSON marker once it has name + phone.
  let done = false;
  const match = reply.match(/LEAD_JSON:\s*(\{[\s\S]*?\})/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      await saveDemoLead({
        biz: biz.slug,
        lang: data.lang ?? "ro",
        name: data.name ?? "",
        phone: data.phone ?? "",
        details: data.details ?? "",
      });
      done = true;
    } catch {
      /* malformed marker — don't save, but keep the chat working */
    }
    reply = reply.replace(/LEAD_JSON:[\s\S]*$/, "").trim();
  }

  return NextResponse.json({ reply, done, matches }, { headers: CORS });
}
