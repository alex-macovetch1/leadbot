import { NextResponse } from "next/server";
import { saveLead, getLeads } from "@/lib/leads";
import { isValidPhone, type Lead } from "@/lib/flow";

// Save a captured lead from the chat widget.
export async function POST(request: Request) {
  let body: Partial<Lead>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !body.phone || !isValidPhone(body.phone)) {
    return NextResponse.json({ error: "A name and a valid phone are required" }, { status: 400 });
  }

  const lead = await saveLead({
    lang: body.lang ?? "ro",
    deal: body.deal ?? "",
    propertyType: body.propertyType ?? "",
    zone: body.zone ?? "",
    budget: body.budget ?? "",
    name: body.name,
    phone: body.phone,
  });

  return NextResponse.json({ ok: true, id: lead.id });
}

// List leads for the admin panel. Protected by a simple key.
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key !== (process.env.ADMIN_KEY || "demo")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ leads: await getLeads() });
}
