# Zorie Collectibles — Go-Live Setup

The site is built. It works **immediately in demo mode** (data stays in the browser)
and becomes a **real online store** once you complete the steps below. Work top to bottom.

You can accept payments two ways — customers choose at checkout:
- **Paystack** (card / bank transfer / USSD) — hosted popup
- **OPay** (OPay wallet / bank transfer / card / USSD) — OPay hosted cashier page

---

## 1. Supabase (database + admin login)

1. Create a free account at https://supabase.com and start a project (any region is fine).
2. Open **SQL Editor**, paste the whole contents of `supabase/schema.sql`, click **Run**.
3. Create your owner login:
   - Dashboard → **Authentication → Users → Add user** → enter your email + a strong password.
   - (Or uncomment the last block in `supabase/schema.sql` and run it once.)
   - **Note this email** — you will put it in `config.js` (`admin.email`). The admin
     sign-in on the site is password-only; that email is used automatically and hidden.
4. Copy your project keys:
   - Dashboard → **Project Settings → API** → copy the **Project URL** and the **anon/public key**.

## 2. Payment accounts

### Paystack
1. Log in at https://dashboard.paystack.com.
2. **Settings → API Keys** → copy your **Test public key** (`pk_test_…`).
3. Later, when taking real money, use the **Live public key** (`pk_live_…`).

### OPay
1. Create a merchant account at https://merchant.opaycheckout.com and complete KYC.
2. From the merchant dashboard, copy your **Merchant ID**, **Public Key** (`OPAYPUB…`) and **Private Key** (`OPAYPRV…`).
3. Use **sandbox** keys while testing, **live** keys when ready.

## 3. Fill in config.js

Open `config.js` and replace the placeholders:

```js
supabase: {
  url: 'https://xxxx.supabase.co',      // step 1.4
  anonKey: 'eyJhbGciOi…',               // step 1.4
},
paystack: {
  publicKey: 'pk_test_…'                // step 2 (switch to pk_live_… when live)
},
opay: {
  enabled: true                          // turn the OPay option on/off at checkout
},
admin: {
  email: 'you@example.com',             // your Supabase Auth admin email (step 1.3)
  demoPassword: 'zorie2026'             // password used only before Supabase is set up
},
store: {
  whatsapp: '2348012345678',            // YOUR number, digits only
  phone: '+234 801 234 5678',
  ...
}
```

> The OPay keys themselves are NOT placed here — they stay server-side as edge
> function secrets (step 4). While the Supabase keys are still placeholders the
> site runs in demo/local mode.

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

## 5. Host on Vercel

1. Create a free account at https://vercel.com.
2. **Add New → Project**, then either:
   - **Deploy from Git** — push this folder to a GitHub/GitLab repo and import it, or
   - **CLI** — `npm i -g vercel` then run `vercel` in this folder and follow the prompts
     (Framework Preset: **Other**).
3. You get a free subdomain like `zorie-collectibles.vercel.app`. Add a custom domain later in **Project → Settings → Domains**.
4. In `robots.txt`, `sitemap.xml`, `config.js` (`siteUrl`) and the `<meta>` tags in `index.html`, replace `yourdomain.com` with your real URL (currently set to `https://zorie.vercel.app`).
5. Whitelist your site in Paystack: **Settings → API Keys & Webhooks → Add your domain**.

## 6. Test

1. Visit your live URL. Shop should show the catalog.
2. **Paystack test:** add to cart → Checkout → Pay with Paystack → test card `4084 0840 8408 4081` (any CVV/expiry) → order completes.
3. **OPay test:** Checkout → Pay with OPay → you are taken to the OPay cashier → complete payment in sandbox → you are returned and the order is confirmed.
4. Check the admin dashboard (footer → Admin) with the login you created in step 1.3.
5. Confirm you receive the **new-order email** and the customer receives a confirmation.

When everything works, flip to **live**: set `OPAY_ENV=live` secret + live OPay keys, put your Paystack **live** public key in `config.js`, and redeploy.

---

## Troubleshooting

- **Checkout skips Paystack popup** → the public key is still the placeholder; real keys not in `config.js`.
- **OPay "Could not start OPay"** → the `checkout` edge function is missing its OPay secrets, or `SITE_URL` isn't set.
- **OPay returns "Payment not completed"** → payment wasn't `SUCCESS` in sandbox; retry, or the confirm step couldn't reach `/cashier/status` (check `OPAY_PRIVATE_KEY`).
- **Orders save but no emails** → the `checkout` edge function isn't deployed, or `RESEND_API_KEY`/`OWNER_EMAIL` aren't set as secrets.
- **Admin won't sign in** → the user wasn't created in Supabase Auth (step 1.3).
- **Catalog empty** → the `seed-catalog` function wasn't deployed; redeploy it and reload the homepage, or add products manually in Admin.
- **"Catalog seed failed"** → run `supabase functions deploy seed-catalog` then refresh.

## Where everything lives

- `config.js` — site keys and contact details (one file to edit)
- `vercel.json` — Vercel routing config
- `opay-callback.html` — OPay's return page (hands payment back to the store)
- `supabase/schema.sql` — database tables + security rules
- `supabase/functions/checkout` — Paystack verify + OPay create/confirm, saves orders, emails you + customer
- `supabase/functions/seed-catalog` — first-run catalog import
- `supabase/functions/contact` — emails you when a customer uses the contact form