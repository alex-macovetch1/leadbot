/* ------------------------------------------------------------------
   Trimite lead-ul în amoCRM.

   Clientul își face în amoCRM o „integrare privată" (Настройки →
   Интеграции → Создать интеграцию) și primește un token de lungă durată.
   Nouă ne dă două lucruri: subdomeniul contului și tokenul. Fără OAuth,
   fără parole, fără acces la contul lui — și le poate revoca oricând.

     AMOCRM_SUBDOMAIN=numeclub          (din numeclub.amocrm.ru)
     AMOCRM_HOST=amocrm.ru              (sau kommo.com, dacă e cont Kommo)
     AMOCRM_TOKEN=eyJ0eXAiOiJKV1Qi...
     AMOCRM_PIPELINE_ID=123456          (opțional, altfel intră în pâlnia implicită)

   Fără variabilele astea funcția nu face nimic și nu strică nimic:
   lead-ul rămâne salvat la noi și trimis pe email.
------------------------------------------------------------------ */

export type LeadCrm = {
  bizTitle: string;
  name: string;
  phone: string;
  details: string;
  /* Numele lead-ului, dacă clientul are o convenție a lui. La TRACIA e
     „Botanica 2021" — filiala plus anul nașterii. Fără el punem numele
     afacerii în față, ca să se vadă de unde vine cererea. */
  titlu?: string;
};

const SUB = process.env.AMOCRM_SUBDOMAIN || "";
const HOST = process.env.AMOCRM_HOST || "amocrm.ru";
const TOKEN = process.env.AMOCRM_TOKEN || "";
const PIPELINE = process.env.AMOCRM_PIPELINE_ID || "";

export function amocrmConfigurat(): boolean {
  return Boolean(SUB && TOKEN);
}

/** Creează lead + contact într-un singur apel (complex endpoint). */
export async function trimiteInAmoCrm(lead: LeadCrm): Promise<boolean> {
  if (!amocrmConfigurat()) return false;

  /* Endpointul „complex" creează lead-ul ȘI contactul deodată și le leagă —
     altfel ar ieși un lead fără telefon, exact lucrul de care are nevoie
     omul care sună înapoi. */
  const corp = [
    {
      name: (lead.titlu || `${lead.bizTitle}: ${lead.details}`).slice(0, 250),
      ...(PIPELINE ? { pipeline_id: Number(PIPELINE) } : {}),
      _embedded: {
        contacts: [
          {
            first_name: lead.name || "Părinte",
            custom_fields_values: [
              {
                field_code: "PHONE",
                values: [{ enum_code: "MOB", value: lead.phone }],
              },
            ],
          },
        ],
      },
    },
  ];

  try {
    const r = await fetch(`https://${SUB}.${HOST}/api/v4/leads/complex`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corp),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      const detaliu = await r.text().catch(() => "");
      throw new Error(`amoCRM ${r.status}: ${detaliu.slice(0, 200)}`);
    }
    return true;
  } catch (e) {
    /* Un CRM căzut nu are voie să piardă lead-ul: e deja salvat la noi și
       plecat pe email, așa că doar notăm eroarea. */
    console.error("amoCRM: lead-ul nu a intrat —", e instanceof Error ? e.message : e);
    return false;
  }
}
