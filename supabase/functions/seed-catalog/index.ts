// Zorie Collectibles — catalog seeder
// Called once by the browser the first time it loads with an empty products
// table. Copies the built-in catalog into Supabase using the service role.
// No secrets required (service role key is auto-provided by Supabase).

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const products = body?.products;
  if (!Array.isArray(products) || products.length === 0) {
    return json({ error: "products required" }, 400);
  }

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    cat: p.cat,
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    img: p.img || "",
    description: p.desc || p.description || "",
    sizes: Array.isArray(p.sizes) ? p.sizes : ["One size"],
    tags: Array.isArray(p.tags) ? p.tags : [],
    customizable: !!p.customizable,
  }));

  const { data, error } = await supabase.from("products").upsert(rows);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, inserted: data?.length ?? rows.length });
});