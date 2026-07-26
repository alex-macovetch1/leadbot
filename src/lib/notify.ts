/* ------------------------------------------------------------------
   Lead notifications by email.

   Best-effort and fully optional: when RESEND_API_KEY is absent the
   function returns immediately and the chat carries on. Leads are always
   persisted in Supabase first, so a failed send never loses a lead.
------------------------------------------------------------------ */

export type LeadNotice = {
  biz: string;
  bizTitle: string;
  lang: string;
  name: string;
  phone: string;
  details: string;
};

const FROM = process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev";
const TO = process.env.LEAD_EMAIL_TO || "alex.shido.it@gmail.com";

/* Only these bots email anybody. The others are demos shown to prospects —
   people poke at them all day and none of it is a real enquiry. Add a slug
   here (or to LEAD_NOTIFY_BIZ) when a bot goes live for a paying client. */
const NOTIFY_FOR = (process.env.LEAD_NOTIFY_BIZ || "alexweb")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Strip characters a phone number never contains, then build a wa.me link. */
function waLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // Moldovan numbers are typed locally as 069… — wa.me needs the country code.
  const full = digits.length <= 9 ? `373${digits.replace(/^0/, "")}` : digits;
  return `https://wa.me/${full}`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function body(lead: LeadNotice, when: string): string {
  const wa = waLink(lead.phone);
  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:10px 0;color:#6b7280;font-size:13px;width:110px;vertical-align:top">${esc(label)}</td>
           <td style="padding:10px 0;color:#0b0b0c;font-size:15px;font-weight:600">${value}</td>
         </tr>`
      : "";

  return `<!doctype html><html><body style="margin:0;background:#ededea;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e2e2dd">
        <tr><td style="background:#0b0b0c;padding:22px 26px">
          <div style="color:#8a8a90;font-size:11px;letter-spacing:.14em;text-transform:uppercase">Lead nou</div>
          <div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">${esc(lead.name || "Fără nume")}</div>
          <div style="color:#8093ff;font-size:13px;margin-top:4px">${esc(lead.bizTitle)}</div>
        </td></tr>
        <tr><td style="padding:8px 26px 22px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row("Telefon", `<a href="tel:${esc(lead.phone)}" style="color:#1b36ff;text-decoration:none">${esc(lead.phone)}</a>`)}
            ${row("Cere", esc(lead.details))}
            ${row("Limba", lead.lang === "ru" ? "Rusă" : "Română")}
            ${row("Primit", esc(when))}
          </table>
          ${
            wa
              ? `<a href="${wa}" style="display:inline-block;margin-top:18px;background:#1b36ff;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:100px">Răspunde pe WhatsApp</a>`
              : ""
          }
        </td></tr>
      </table>
      <div style="color:#8a8a90;font-size:12px;margin-top:16px">Trimis automat de asistentul de pe site.</div>
    </td></tr>
  </table>
  </body></html>`;
}

/* Telegram: instant, free, and it buzzes the phone. Optional — set
   TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to switch it on. */
async function notifyTelegram(lead: LeadNotice, when: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  const link = waLink(lead.phone);
  const text = [
    "🔔 *Lead nou*",
    "",
    `*${lead.name || "Fără nume"}*`,
    `📞 \`${lead.phone}\``,
    lead.details ? `💬 ${lead.details}` : "",
    "",
    `_${lead.bizTitle} · ${lead.lang === "ru" ? "rusă" : "română"} · ${when}_`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: "Markdown",
        reply_markup: link
          ? { inline_keyboard: [[{ text: "Răspunde pe WhatsApp", url: link }]] }
          : undefined,
      }),
    });
  } catch (err) {
    console.error("notifyTelegram a eșuat:", err);
  }
}

export async function notifyLead(lead: LeadNotice): Promise<void> {
  if (!NOTIFY_FOR.includes(lead.biz)) return;
  const key = process.env.RESEND_API_KEY;

  const when = new Intl.DateTimeFormat("ro-MD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Chisinau",
  }).format(new Date());

  // Telegram first — it is the one that actually reaches him in seconds.
  await notifyTelegram(lead, when);
  if (!key) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Asistent site <${FROM}>`,
        to: [TO],
        reply_to: TO,
        subject: `Lead nou — ${lead.name || "fără nume"} · ${lead.phone}`,
        html: body(lead, when),
        text: [
          `Lead nou de pe ${lead.bizTitle}`,
          `Nume: ${lead.name}`,
          `Telefon: ${lead.phone}`,
          `Cere: ${lead.details}`,
          `Limba: ${lead.lang}`,
          `Primit: ${when}`,
        ].join("\n"),
      }),
    });
    if (!res.ok) console.error("notifyLead: resend a răspuns", res.status, await res.text());
  } catch (err) {
    console.error("notifyLead a eșuat:", err);
  }
}
