import { NextResponse } from "next/server";
import { getDemoLeads } from "@/lib/leads";

/* Cererile unei singure afaceri, pentru tabla pe care o arătăm clientului.

   Separat de /api/leads dinadins: acolo cheia deschide TOATE afacerile, iar
   clientului îi dăm un link pe care îl poate ține deschis toată ziua. Aici
   cheia e alta și vede doar afacerea cerută în `b`. */
export async function GET(request: Request) {
  const cheie = process.env.BORD_KEY;
  if (!cheie) {
    console.error("BORD_KEY nu e setat — tabla rămâne închisă.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("k") !== cheie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const biz = url.searchParams.get("b");
  if (!biz) return NextResponse.json({ error: "Lipsește afacerea" }, { status: 400 });

  const leads = (await getDemoLeads(biz)).slice(0, 60);
  return NextResponse.json({
    leads: leads.map((l) => ({
      id: l.id, name: l.name, phone: l.phone, details: l.details,
      lang: l.lang, createdAt: l.createdAt,
    })),
  });
}
