/* =========================================================================
   ZORIE COLLECTIBLES — SITE CONFIG (GENERATED)
   This file is written by `build.js` from `config.template.js` + env vars
   (.env locally, Vercel environment variables in production).
   Do not edit config.js directly — edit config.template.js and rebuild.
   ========================================================================= */
window.CONFIG = {
  /* Your site domain (used for canonical + sitemap). Replace after you pick a domain. */
  siteUrl: 'https://zorie.vercel.app',

  /* Supabase project (https://supabase.com — free tier).
     Project Settings → API → Project URL + anon/public key. */
  supabase: {
    url: '__SUPABASE_URL__',
    anonKey: '__SUPABASE_ANON_KEY__'
  },

  /* Paystack merchant (https://paystack.com).
     Dashboard → Settings → API Keys → Public key. */
  paystack: {
    publicKey: '__PAYSTACK_PUBLIC_KEY__'
  },

  /* OPay — pay-by-transfer to your OPay account. */
  opay: {
    enabled: true,
    accountNumber: '6105601005',
    accountName: 'Zorie Collectibles'
  },

  /* Admin login — password only (no email field at login).
     email: the admin user created in Supabase Auth (used automatically; hidden). */
  admin: {
    email: '__ADMIN_EMAIL__',
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