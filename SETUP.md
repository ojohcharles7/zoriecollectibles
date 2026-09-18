# Zorie Collectibles — Go-Live Setup

The site is built. It works **immediately in demo mode** (data stays in the browser)
and becomes a **real online store** once you complete the steps below. Work top to bottom.

> **First step:** run `npm run build` (or `node build.js`) once in this folder.
> It generates `config.js` from your environment variables (see "Environment
> variables"). `config.js` is gitignored and never committed.

You can accept payments two ways — customers choose at checkout:
- **Paystack** (card / bank transfer / USSD) — hosted popup
- **OPay** (OPay wallet / bank transfer / card / USSD) — OPay hosted cashier page

---

## 1. Supabase (database + admin login)

1. Create a free account at https://supabase.com and start a project (any region is fine).
2. Apply the schema. Two options:
   - **CLI migrations (recommended)** — the schema lives in `supabase/migrations/`. From this folder run:
     ```bash
     npx supabase db push \
       --db-url "postgresql://postgres.<project-ref>:<DB-PASSWORD>@aws-1-<region>.pooler.supabase.com:5432/postgres"
     ```
     (The pooler cluster index — `aws-0` vs `aws-1` — varies per project; use the one that accepts your tenant.)
   - **SQL Editor** — paste the contents of `supabase/schema.sql` and click **Run**.
   Either way this creates the tables, row-level security, and the public `product-images` storage bucket.
3. Create your owner login:
   - Dashboard → **Authentication → Users → Add user** → enter your email + a strong password.
   - (Or uncomment the last block in `supabase/schema.sql` and run it once.)
   - **Note this email** — you will set it as `ADMIN_EMAIL` in your environment
     (see "Environment variables"). The admin sign-in on the site is password-only;
     that email is used automatically and hidden.
4. Copy your project keys — Dashboard → **Project Settings → API** → copy the
   **Project URL** and the **anon/public key**, and set them as `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` (see "Environment variables").

## 2. Payment accounts

### Paystack
1. Log in at https://dashboard.paystack.com.
2. **Settings → API Keys** → copy your **Test public key** (`pk_test_…`).
3. Later, when taking real money, use the **Live public key** (`pk_live_…`).

### OPay
1. Create a merchant account at https://merchant.opaycheckout.com and complete KYC.
2. From the merchant dashboard, copy your **Merchant ID**, **Public Key** (`OPAYPUB…`) and **Private Key** (`OPAYPRV…`).
3. Use **sandbox** keys while testing, **live** keys when ready.

## 3. Environment variables (config is generated, never hand-edited)

`config.js` is **generated** by `build.js` from `config.template.js` + your environment
variables. Never edit `config.js` directly — edit `config.template.js` or change the
env vars, then run `npm run build`.

Create a `.env` file in this folder (copy `.env.example`), or set the same variables
in Vercel (**Project → Settings → Environment Variables**):

```bash
SUPABASE_URL=https://<project>.supabase.co   # public-by-design
SUPABASE_ANON_KEY=<anon or publishable key>  # public-by-design
SUPABASE_DB_PASSWORD=<postgres password>     # REAL SECRET — server-side only
ADMIN_EMAIL=<admin auth user email>          # required for admin sign-in
PAYSTACK_PUBLIC_KEY=pk_test_… / pk_live_…    # switch to live when ready
```

> **Security:** `SUPABASE_URL` and `SUPABASE_ANON_KEY` are *public-by-design* — the
> browser needs them (row-level security protects your data). `SUPABASE_DB_PASSWORD`
> is a real secret: it is **never** injected into `config.js` or sent to the browser.
> `.env`, `config.js` and `node_modules` are gitignored — never commit them.

After editing `.env`, run `npm run build`. On Vercel the build runs automatically
(`vercel.json` → `buildCommand: "node build.js"`).

## 4. Deploy the edge functions (verification + email + OPay)

Install the Supabase CLI once, then from this folder run:

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy checkout --no-verify-jwt
supabase functions deploy seed-catalog contact
```

> `--no-verify-jwt` lets both your browser and the OPay callback reach `checkout`
> without needing a login token.

Then set the function secrets (Dashboard → **Edge Functions → each function → Secrets**):

| Function     | Secrets                                                                 |
|--------------|--------------------------------------------------------------------------|
| `checkout`   | `PAYSTACK_SECRET_KEY` (Paystack **secret** key), `OPAY_MCH_ID`, `OPAY_PUBLIC_KEY`, `OPAY_PRIVATE_KEY`, `OPAY_ENV` (`sandbox` or `live`), `SITE_URL` (your live domain, e.g. `https://zorie.vercel.app`), `RESEND_API_KEY`, `OWNER_EMAIL`, optional `EMAIL_FROM` |
| `seed-catalog` | none (auto-provided)                                                    |
| `contact`    | `RESEND_API_KEY`, `OWNER_EMAIL`                                          |

Create `RESEND_API_KEY` free at https://resend.com. `OWNER_EMAIL` is where you get
new-order alerts.

### Upload the product images

The catalog ships with 22 product + section images. `script.js` references them from
Supabase Storage — bucket **`product-images`**, public — via the generated
`SUPABASE_URL` (falling back to the local `images/` folder in demo mode).

Upload the files from the repo's `images/` folder to Dashboard → **Storage →
product-images** (the bucket and its public-read policy are created by `schema.sql`).
The `seed-catalog` edge function copies each product (including its `img` URL) into
the `products` table on first load.

## 5. Host on Vercel

1. Create a free account at https://vercel.com.
2. **Add New → Project**, then either:
   - **Deploy from Git** — push this folder to a GitHub/GitLab repo and import it, or
   - **CLI** — `npm i -g vercel` then run `vercel` in this folder and follow the prompts
     (Framework Preset: **Other**).
3. You get a free subdomain like `zorie-collectibles.vercel.app`. Add a custom domain later in **Project → Settings → Domains**.
4. Set the environment variables from section 3 in **Project → Settings → Environment Variables** — the build reads them to generate `config.js`. The build command and output directory are already configured in `vercel.json`.
5. In `robots.txt`, `sitemap.xml`, `config.template.js` (`siteUrl`) and the `<meta>` tags in `index.html`, replace `yourdomain.com` with your real URL (currently set to `https://zorie.vercel.app`).
6. Whitelist your site in Paystack: **Settings → API Keys & Webhooks → Add your domain**.

## 6. Test

1. Visit your live URL. Shop should show the catalog.
2. **Paystack test:** add to cart → Checkout → Pay with Paystack → test card `4084 0840 8408 4081` (any CVV/expiry) → order completes.
3. **OPay test:** Checkout → Pay with OPay → you are taken to the OPay cashier → complete payment in sandbox → you are returned and the order is confirmed.
4. Check the admin dashboard (footer → Admin) with the login you created in step 1.3.
5. Confirm you receive the **new-order email** and the customer receives a confirmation.

When everything works, flip to **live**: set `OPAY_ENV=live` secret + live OPay keys, put your Paystack **live** public key in `config.js`, and redeploy.

---

## Troubleshooting

- **Checkout skips Paystack popup** → `PAYSTACK_PUBLIC_KEY` is empty; set it in `.env`/Vercel and run `npm run build`. The Paystack script now loads on demand at checkout.
- **OPay "Could not start OPay"** → the `checkout` edge function is missing its OPay secrets, or `SITE_URL` isn't set.
- **OPay returns "Payment not completed"** → payment wasn't `SUCCESS` in sandbox; retry, or the confirm step couldn't reach `/cashier/status` (check `OPAY_PRIVATE_KEY`).
- **Orders save but no emails** → the `checkout` edge function isn't deployed, or `RESEND_API_KEY`/`OWNER_EMAIL` aren't set as secrets.
- **Admin won't sign in** → the user wasn't created in Supabase Auth (step 1.3), or `ADMIN_EMAIL` doesn't match it.
- **Catalog empty** → the `seed-catalog` function wasn't deployed (redeploy it and reload the homepage), or the images weren't uploaded to the `product-images` bucket.
- **"Catalog seed failed"** → run `supabase functions deploy seed-catalog` then refresh.

## Where everything lives

- `config.template.js` + `build.js` — site keys and contact details are generated from env vars into `config.js` (edit the template or your `.env`, then `npm run build`)
- `vercel.json` — Vercel routing config
- `opay-callback.html` — OPay's return page (hands payment back to the store)
- `supabase/schema.sql` — database tables + security rules
- `supabase/functions/checkout` — Paystack verify + OPay create/confirm, saves orders, emails you + customer
- `supabase/functions/seed-catalog` — first-run catalog import
- `supabase/functions/contact` — emails you when a customer uses the contact form