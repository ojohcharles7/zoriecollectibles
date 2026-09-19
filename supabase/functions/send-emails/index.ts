// Zorie Collectibles — scheduled transactional email sender
// Runs every 15 minutes and drains the `email_queue` table slowly so the store
// stays within the email provider's free daily budget (~50/day by default).
// Nothing is dropped: rate-limited / failed emails stay pending and retry next run.
//
// Secrets: RESEND_API_KEY, OWNER_EMAIL (not required here), optional EMAIL_FROM,
//          optional DAILY_EMAIL_BUDGET (default 50)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 20;

async function sendOne(job, from) {
  const resend = Deno.env.get("RESEND_API_KEY") || "";
  if (!resend) return { ok: false, retry: true, error: "RESEND_API_KEY not set" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: job.recipient,
      subject: job.subject,
      text: job.body,
    }),
  });
  if (res.ok) return { ok: true, retry: false };
  // 429 = rate limit (wait for next run), 4xx permanent (won't retry forever)
  const permanent = res.status >= 400 && res.status < 500 && res.status !== 429;
  const detail = (await res.text()).slice(0, 300);
  return { ok: false, retry: !permanent, error: `HTTP ${res.status} ${detail}` };
}

Deno.serve(async () => {
  const from = Deno.env.get("EMAIL_FROM") || "Zorie Collectibles <onboarding@resend.dev>";
  const budget = Number(Deno.env.get("DAILY_EMAIL_BUDGET") || "50");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("email_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", today.toISOString());
  let sentToday = count || 0;
  if (sentToday >= budget) {
    return json({ ok: true, sent: 0, skipped: "budget reached", sentToday, budget });
  }

  const { data: pending, error: fetchErr } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (fetchErr) return json({ ok: false, error: fetchErr.message }, 500);

  let sent = 0;
  for (const job of pending || []) {
    if (sentToday >= budget) break;
    const result = await sendOne(job, from);
    const now = new Date().toISOString();
    if (result.ok) {
      await supabase.from("email_queue").update({ status: "sent", sent_at: now }).eq("id", job.id);
      sent += 1;
      sentToday += 1;
    } else {
      const attempts = Number(job.attempts || 0) + 1;
      const status = !result.retry || attempts >= MAX_ATTEMPTS ? "failed" : "pending";
      await supabase.from("email_queue")
        .update({ attempts, error: result.error || "", status })
        .eq("id", job.id);
    }
  }

  return json({ ok: true, sent, sentToday, budget, remaining: Math.max(0, budget - sentToday) });
});