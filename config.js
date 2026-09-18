/* =========================================================================
   ZORIE COLLECTIBLES — SITE CONFIG
   Fill in the values below. Everything is public (safe to ship to the browser).
   When keys still contain "YOUR-" placeholders, the site runs in offline/demo
   mode (data stays in each visitor's browser) so nothing breaks.
   ========================================================================= */
window.CONFIG = {
  /* Your site domain (used for canonical + sitemap). Replace after you pick a domain. */
  siteUrl: 'https://zorie.vercel.app',

  /* Supabase project (https://supabase.com — free tier).
     Project Settings → API → Project URL + anon/public key. */
  supabase: {
    url: 'https://YOUR-PROJECT.supabase.co',
    anonKey: 'YOUR-ANON-KEY'
  },

  /* Paystack merchant (https://paystack.com).
     Dashboard → Settings → API Keys → Public key.
     Use the TEST key (pk_test_…) while building, then switch to the LIVE key (pk_live_…). */
  paystack: {
    publicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxx'
  },

  /* OPay — pay-by-transfer to your OPay account.
     accountNumber: the OPay account customers transfer payment to.
     accountName:   the name on the account (shown to customers, optional). */
  opay: {
    enabled: true,
    accountNumber: '6105601005',
    accountName: 'Zorie Collectibles'
  },

  /* Admin login — password only (no email field at login).
     email:  the admin user you create in Supabase Auth (used automatically; hidden).
             Fill this when you configure Supabase.
     demoPassword: used only while Supabase is NOT configured (local/demo mode). */
  admin: {
    email: 'YOUR-ADMIN-EMAIL',
    demoPassword: 'zorie2026'
  },

  /* Your real contact details — used for the footer, WhatsApp float and emails. */
  store: {
    email: 'zoriecollectibles@gmail.com',
    phone: '+234 816 957 7178',
    whatsapp: '2348169577178',   /* digits only, no + or spaces */
    instagram: 'zories_collectibles?stkn=bWQyeHFpbzVwY3A1',
    facebook: 'https://www.facebook.com/share/1DeUiccPGU/',
    twitter: 'chibuzookorie8',
    tiktok: 'https://vm.tiktok.com/ZS9A8nQbWyvmf-q4vCC/'
  }
};