import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "./flow";

/* ------------------------------------------------------------------
   Lead storage — Supabase (Postgres).

   Persists across restarts and deploys, and works on serverless.
   Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment.
   Falls back to in-memory only when those are not set (local demo).
------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type StoredLead = Lead & { id: string; createdAt: number };

// --- in-memory fallback (used only when Supabase env is absent) ---
const memory: StoredLead[] = [];
let counter = 0;

let _sb: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  if (!_sb) _sb = createClient(url, key, { auth: { persistSession: false } });
  return _sb;
}

export async function saveLead(lead: Lead): Promise<StoredLead> {
  const entry: StoredLead = { ...lead, id: `lead_${Date.now()}_${counter++}`, createdAt: Date.now() };
  const db = sb();
  if (db) {
    await db.from("leads").insert({
      id: entry.id,
      lang: entry.lang,
      deal: entry.deal,
      property_type: entry.propertyType,
      zone: entry.zone,
      budget: entry.budget,
      name: entry.name,
      phone: entry.phone,
      created_at: entry.createdAt,
    });
  } else {
    memory.unshift(entry);
  }
  return entry;
}

export async function getLeads(): Promise<StoredLead[]> {
  const db = sb();
  if (!db) return memory;
  const { data } = await db.from("leads").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id,
    lang: r.lang,
    deal: r.deal,
    propertyType: r.property_type,
    zone: r.zone,
    budget: r.budget,
    name: r.name,
    phone: r.phone,
    createdAt: Number(r.created_at),
  }));
}

/* ------------------------------------------------------------------
   Generic, per-business demo leads. One table (demo_leads) serves any
   business the bot is branded for. Best-effort: never throws, so a chat
   demo keeps working even if the table is missing — it just falls back
   to in-memory for that serverless instance.
------------------------------------------------------------------ */

export type DemoLead = {
  id: string;
  biz: string;
  lang: string;
  name: string;
  phone: string;
  details: string;
  createdAt: number;
};

const demoMemory: DemoLead[] = [];

export async function saveDemoLead(input: {
  biz: string;
  lang: string;
  name: string;
  phone: string;
  details: string;
}): Promise<void> {
  const entry: DemoLead = { ...input, id: `lead_${Date.now()}_${counter++}`, createdAt: Date.now() };
  const db = sb();
  try {
    if (db) {
      await db.from("demo_leads").insert({
        id: entry.id,
        biz: entry.biz,
        lang: entry.lang,
        name: entry.name,
        phone: entry.phone,
        details: entry.details,
        created_at: entry.createdAt,
      });
    } else {
      demoMemory.unshift(entry);
    }
  } catch {
    demoMemory.unshift(entry);
  }
}

export async function getDemoLeads(biz?: string): Promise<DemoLead[]> {
  const db = sb();
  if (!db) return biz ? demoMemory.filter((l) => l.biz === biz) : demoMemory;
  try {
    let q = db.from("demo_leads").select("*").order("created_at", { ascending: false });
    if (biz) q = q.eq("biz", biz);
    const { data } = await q;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      biz: r.biz,
      lang: r.lang,
      name: r.name,
      phone: r.phone,
      details: r.details,
      createdAt: Number(r.created_at),
    }));
  } catch {
    return demoMemory;
  }
}
