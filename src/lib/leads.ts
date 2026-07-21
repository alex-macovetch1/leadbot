import type { Lead } from "./flow";

/* ------------------------------------------------------------------
   Lead storage.

   In-memory for now — it works in a running server (local dev) but
   resets on restart / serverless cold start. This module is the single
   place to swap for a real database: replace the array with Supabase /
   Postgres queries and the API route + admin page keep working unchanged.
------------------------------------------------------------------ */

export type StoredLead = Lead & { id: string; createdAt: number };

const store: StoredLead[] = [];
let counter = 0;

export function saveLead(lead: Lead): StoredLead {
  const entry: StoredLead = {
    ...lead,
    id: `lead_${Date.now()}_${counter++}`,
    createdAt: Date.now(),
  };
  store.unshift(entry);
  return entry;
}

export function getLeads(): StoredLead[] {
  return store;
}
