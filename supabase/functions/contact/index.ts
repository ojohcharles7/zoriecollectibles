// Zorie Collectibles — contact form notifier
// Emails the owner when someone uses the contact form.
// Secrets: RESEND_API_KEY, OWNER_EMAIL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Queue a transactional email — the scheduled `send-emails` function sends it.
async function queueEmail(recipient, subject, body) {
  if (!recipient) return;
  const { error } = await supabase.from("email_queue").insert({ recipient, subject, body });
  if (error) console.error("queue email failed:", error.message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const { name, email, message } = body || {};
  if (!email || !message) return json({ error: "email and message required" }, 400);

  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) return json({ error: error.message }, 500);

  const owner = Deno.env.get("OWNER_EMAIL") || "";
  if (owner) {
    await queueEmail(owner,
      `Contact message from ${name || email}`,
      `From: ${name || "?"} (${email})\n\n${message}`);
  }

  return json({ ok: true });
});