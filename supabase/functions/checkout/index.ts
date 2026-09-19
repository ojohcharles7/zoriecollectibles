// Zorie Collectibles — checkout edge function
// Supports BOTH payment providers:
//   - Paystack: verify transaction (secret key) + save order + email
//   - OPay:     create hosted cashier order (returns cashierUrl) and
//               confirm via /cashier/status before saving the order
//
// Secrets (Supabase Dashboard -> Edge Functions -> checkout -> Secrets):
//   PAYSTACK_SECRET_KEY        Paystack secret key (for Paystack method)
//   OPAY_MCH_ID                OPay merchant id, e.g. 256612345678901
//   OPAY_PUBLIC_KEY            OPay public key  (OPAYPUB...)
//   OPAY_PRIVATE_KEY           OPay private key (OPAYPRV...) for HMAC-SHA512
//   OPAY_ENV                   "sandbox" or "live" (default sandbox)
//   SITE_URL                   your live site, e.g. https://zorie.example.com
//   RESEND_API_KEY             from https://resend.com
//   OWNER_EMAIL                where you receive new-order alerts
//   EMAIL_FROM                 (optional) sender address
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are auto-provided.
//
// Deploy with:  supabase functions deploy checkout --no-verify-jwt
// (so both the browser and the OPay callback can reach this function)

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

async function hmacSha512Hex(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function opayBase() {
  return (Deno.env.get("OPAY_ENV") === "live")
    ? "https://liveapi.opaycheckout.com/api/v1/international"
    : "https://testapi.opaycheckout.com/api/v1/international";
}

function orderRow(order, reference, userId) {
  return {
    id: order.id,
    date: order.date || new Date().toISOString(),
    customer: order.customer || {},
    items: order.items || [],
    subtotal: Number(order.subtotal) || 0,
    discount: Number(order.discount) || 0,
    delivery: Number(order.delivery) || 0,
    total: Number(order.total) || 0,
    paymethod: order.paymethod || order.payMethod || "",
    payref: reference || order.payref || "",
    status: order.status || (reference ? "Being Handcrafted" : "Awaiting Payment"),
    user_id: userId || null,
  };
}

// Verify the caller's access token (sent automatically by the browser client
// in the Authorization header) and return their user id — so a customer's
// order can be linked to their account without trusting client input.
async function callerUserId(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    return error || !data.user ? null : data.user.id;
  } catch {
    return null;
  }
}

// Queue a transactional email. The scheduled `send-emails` function drains this
// slowly (staying within the provider's free daily budget) so nothing is dropped.
async function queueEmail(recipient, subject, body) {
  if (!recipient) return;
  const { error } = await supabase.from("email_queue").insert({ recipient, subject, body });
  if (error) console.error("queue email failed:", error.message);
}

async function sendNotifications(row) {
  const owner = Deno.env.get("OWNER_EMAIL") || "";
  const c = row.customer || {};
  const items = (row.items || []).map((i) => `- ${i.qty} x ${i.name}`).join("\n");
  const paid = row.paymethod === "paystack" ? "Paystack" : row.paymethod === "opay" ? "OPay" : row.paymethod;
  const fmt = (n) => "₦" + Number(n).toLocaleString("en-NG");
  if (owner) {
    await queueEmail(owner,
      `New order ${row.id} — Zorie Collectibles`,
      `New order ${row.id}\nTotal: ${fmt(row.total)}\nPayment: ${paid}${row.payref ? ` (ref ${row.payref})` : ""}\n\nCustomer: ${c.name} (${c.phone})\nEmail: ${c.email}\nAddress: ${c.address}, ${c.city} (${c.method})\n\nItems:\n${items}`);
  }
  if (c.email) {
    await queueEmail(c.email,
      `Order confirmed — ${row.id} · Zorie Collectibles`,
      `Thank you ${c.name}!\n\nYour order ${row.id} has been received.\nTotal: ${fmt(row.total)}\nPayment: ${paid}\n\nWe will contact you shortly about delivery.\n\n— Zorie Collectibles`);
  }
}

async function paystackVerified(reference, secret) {
  try {
    const r = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    const j = await r.json();
    return !!(j && j.status && j.data && j.data.status === "success");
  } catch { return false; }
}

async function handlePaystack(order, reference, userId) {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
  if (reference) {
    if (!secret) return json({ error: "paystack secret not configured" }, 500);
    if (!(await paystackVerified(reference, secret))) return json({ error: "payment_not_verified" }, 400);
  }
  const row = orderRow(order, reference, userId);
  const { data, error } = await supabase.from("orders").upsert(row).select().single();
  if (error) return json({ error: error.message }, 500);
  await sendNotifications(row);
  return json({ ok: true, order: data });
}

// OPay: create a hosted cashier payment order, return the cashierUrl to redirect to.
async function opayCreate(order, reference) {
  const mch = Deno.env.get("OPAY_MCH_ID") || "";
  const pub = Deno.env.get("OPAY_PUBLIC_KEY") || "";
  const site = Deno.env.get("SITE_URL") || "";
  if (!mch || !pub) return json({ error: "opay not configured" }, 500);
  if (!site) return json({ error: "SITE_URL secret not configured" }, 500);
  if (!reference) reference = order.id;

  const c = order.customer || {};
  const payload = {
    country: "NG",
    reference,
    amount: { total: Number(order.total) || 0, currency: "NGN" },
    returnUrl: `${site}/opay-callback.html?ref=${encodeURIComponent(reference)}`,
    cancelUrl: `${site}/#checkout`,
    customerVisitSource: "BROWSER",
    expireAt: 30,
    userInfo: { userEmail: c.email || "", userMobile: c.phone || "", userName: c.name || "" },
    product: {
      name: `Zorie Collectibles — Order ${order.id}`,
      description: (order.items || []).map((i) => `${i.qty} x ${i.name}`).join(", ") || "Zorie Collectibles order",
    },
  };

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  if (projectRef) payload.callbackUrl = `https://${projectRef}.functions.supabase.co/checkout`;

  try {
    const res = await fetch(opayBase() + "/cashier/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + pub, "MerchantId": mch },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (j.code !== "00000" || !j.data || !j.data.cashierUrl) {
      return json({ ok: false, error: j.message || "opay create failed", code: j.code });
    }
    return json({ ok: true, cashierUrl: j.data.cashierUrl, orderNo: j.data.orderNo, reference });
  } catch {
    return json({ error: "opay unreachable" }, 502);
  }
}

// OPay: confirm a payment via /cashier/status, then save the order.
async function opayConfirm(order, reference, userId) {
  const mch = Deno.env.get("OPAY_MCH_ID") || "";
  const priv = Deno.env.get("OPAY_PRIVATE_KEY") || "";
  if (!mch || !priv) return json({ error: "opay not configured" }, 500);
  if (!reference) return json({ error: "reference required" }, 400);

  const body = { country: "NG", reference };
  const sorted = JSON.stringify({ country: "NG", reference }); // keys sorted alphabetically
  const sig = await hmacSha512Hex(sorted, priv);

  let j;
  try {
    const res = await fetch(opayBase() + "/cashier/status", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sig, "MerchantId": mch },
      body: JSON.stringify(body),
    });
    j = await res.json();
  } catch {
    return json({ error: "opay unreachable" }, 502);
  }

  if (j.code !== "00000" || !j.data) {
    return json({ ok: false, paymentStatus: (j.data || {}).status || "UNKNOWN", message: j.message });
  }
  const status = j.data.status;
  if (status !== "SUCCESS") {
    return json({ ok: false, paymentStatus: status, message: j.message });
  }

  const row = orderRow(order, reference, userId);
  row.paymethod = "opay";
  row.payref = reference;
  row.status = "Being Handcrafted";
  const { data, error } = await supabase.from("orders").upsert(row).select().single();
  if (error) return json({ error: error.message }, 500);
  await sendNotifications(row);
  return json({ ok: true, order: data });
}

// OPay: customer says they've transferred — mark the order + alert the owner.
async function opayProofSubmitted(orderId) {
  if (!orderId) return json({ error: "orderId required" }, 400);
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "Verifying Your Payment" })
    .eq("id", orderId)
    .select()
    .single();
  if (error) return json({ error: error.message }, 500);

  const owner = Deno.env.get("OWNER_EMAIL") || "";
  if (owner) {
    await queueEmail(owner,
      `Payment proof received — order ${orderId}`,
      `A customer has marked order ${orderId} as paid by OPay transfer. Please check the money in your OPay account (6105601005), then update the order to "Being Handcrafted" in the admin dashboard.`);
  }
  return json({ ok: true, order: data });
}

// Guest order tracking: only returns an order when the supplied email matches
// the order's customer email — keeps tracking private while letting guests
// follow their order without an account.
async function trackOrder(orderId, email) {
  if (!orderId || !email) return json({ error: "orderId and email required" }, 400);
  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !data) return json({ ok: false, error: "not_found" }, 404);
  const c = data.customer || {};
  if (String(c.email || "").toLowerCase() !== String(email).toLowerCase()) {
    return json({ ok: false, error: "not_found" }, 404);
  }
  return json({ ok: true, order: data });
}

// Link a customer's past guest orders (placed with the same email) to their
// account so they show up under "My Orders" after signing up. Runs with the
// service role so RLS stays closed to direct client updates.
async function claimOrders(req, email) {
  const userId = await callerUserId(req);
  if (!userId) return json({ error: "unauthorized" }, 401);
  const em = String(email || "").trim().toLowerCase();
  if (!em) return json({ ok: true, claimed: 0 });
  const { data, error } = await supabase
    .from("orders")
    .update({ user_id: userId })
    .eq("user_id", null)
    .ilike("customer->>email", em)
    .select("id");
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, claimed: (data || []).length });
}

// Admin-only: list registered customers from the signup_users table.
// (The table is kept in sync automatically by a trigger on auth.users.)
async function listCustomers(req) {
  const userId = await callerUserId(req);
  if (!userId) return json({ error: "unauthorized" }, 401);
  const { data: me, error: meErr } = await supabase.auth.admin.getUserById(userId);
  const appMeta = me?.user?.app_metadata || {};
  const userMeta = me?.user?.user_metadata || {};
  const isAdmin = appMeta.role === "admin" || userMeta.role === "admin";
  if (meErr || !me || !isAdmin) {
    return json({ error: "forbidden" }, 403);
  }
  const { data, error } = await supabase
    .from("signup_users")
    .select("email, full_name, phone, created_at")
    .order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 500);
  const rows = (data || [])
    .filter((r) => r.email !== me.user.email)
    .map((r) => ({
      email: r.email,
      full_name: r.full_name || "",
      phone: r.phone || "",
      created_at: r.created_at,
    }));
  return json({ ok: true, customers: rows });
}

// Admin-only: daily email budget usage + pending queue count.
async function emailStats(req) {
  const userId = await callerUserId(req);
  if (!userId) return json({ error: "unauthorized" }, 401);
  const { data: me, error: meErr } = await supabase.auth.admin.getUserById(userId);
  const appMeta = me?.user?.app_metadata || {};
  const userMeta = me?.user?.user_metadata || {};
  const isAdmin = appMeta.role === "admin" || userMeta.role === "admin";
  if (meErr || !me || !isAdmin) return json({ error: "forbidden" }, 403);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const [sent, pending, failed] = await Promise.all([
    supabase.from("email_queue").select("id", { count: "exact", head: true })
      .eq("status", "sent").gte("sent_at", startOfDay.toISOString()),
    supabase.from("email_queue").select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("email_queue").select("id", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);
  return json({
    ok: true,
    sentToday: sent.count || 0,
    pending: pending.count || 0,
    failed: failed.count || 0,
    budget: Number(Deno.env.get("DAILY_EMAIL_BUDGET") || "50"),
  });
}

// Newsletter waitlist send. The newsletter stays locked until the waitlist
// reaches NEWSLETTER_TARGET (50) subscribers — then a broadcast to every
// subscriber is queued (drained slowly by `send-emails` like the rest).
const NEWSLETTER_TARGET = 50;

async function sendNewsletter(req, body) {
  const userId = await callerUserId(req);
  if (!userId) return json({ error: "unauthorized" }, 401);
  const { data: me, error: meErr } = await supabase.auth.admin.getUserById(userId);
  const appMeta = me?.user?.app_metadata || {};
  const userMeta = me?.user?.user_metadata || {};
  const isAdmin = appMeta.role === "admin" || userMeta.role === "admin";
  if (meErr || !me || !isAdmin) return json({ error: "forbidden" }, 403);

  const subject = String(body.subject || "").trim();
  const content = String(body.body || "").trim();
  if (!subject || !content) return json({ ok: false, error: "subject and message are required" }, 400);

  const { count } = await supabase
    .from("subscribers")
    .select("email", { count: "exact", head: true });
  const total = count || 0;
  if (total < NEWSLETTER_TARGET) {
    return json({ ok: false, error: "waitlist", count: total, target: NEWSLETTER_TARGET });
  }

  const { data: subs } = await supabase
    .from("subscribers")
    .select("email")
    .order("created_at", { ascending: true });
  const emails = (subs || []).map((s) => s.email).filter(Boolean);
  if (emails.length === 0) return json({ ok: false, error: "no subscribers", count: 0, target: NEWSLETTER_TARGET });

  const { error } = await supabase.from("email_queue").insert(
    emails.map((email) => ({ recipient: email, subject, body: content }))
  );
  if (error) return json({ ok: false, error: error.message }, 500);

  await supabase.from("newsletter_sends").insert({ recipient_count: emails.length, subject });

  return json({ ok: true, count: emails.length, target: NEWSLETTER_TARGET });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  if (body && body.method === "track") {
    return await trackOrder(body.orderId, body.email);
  }
  if (body && body.method === "claim-orders") {
    return await claimOrders(req, body.email);
  }
  if (body && body.method === "customers") {
    return await listCustomers(req);
  }
  if (body && body.method === "email-stats") {
    return await emailStats(req);
  }
  if (body && body.method === "newsletter") {
    return await sendNewsletter(req, body);
  }
  if (body && body.method === "opay") {
    const order = body.order || {};
    if (body.action === "create") return await opayCreate(order, body.reference);
    if (body.action === "confirm") {
      const userId = await callerUserId(req);
      return await opayConfirm(order, body.reference, userId);
    }
    if (body.action === "proof-submitted") return await opayProofSubmitted(body.orderId);
    return json({ ok: true }); // OPay callback ack
  }
  if (body && body.order && body.order.id) {
    const userId = await callerUserId(req);
    return await handlePaystack(body.order, body.reference, userId);
  }
  return json({ ok: true }); // unknown / webhook ack
});