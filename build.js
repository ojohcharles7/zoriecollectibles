/* =========================================================================
   ZORIE COLLECTIBLES — build script
   Generates `config.js` from `config.template.js` + environment variables.
   - Local:   node build.js   (reads .env if present, else process.env)
   - Vercel:  runs automatically via the build command (env from dashboard)
   Zero dependencies — uses Node built-ins only.
   ========================================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ENV_PATH = path.join(ROOT, '.env');

/* Tiny .env parser (KEY=VALUE, # comments, optional quotes). */
function loadDotEnv() {
  const env = {};
  let txt = '';
  try { txt = fs.readFileSync(ENV_PATH, 'utf8'); } catch (e) { return env; }
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = { ...process.env, ...loadDotEnv() };

const TOKENS = {
  __SUPABASE_URL__: (env.SUPABASE_URL || '').trim(),
  __SUPABASE_ANON_KEY__: (env.SUPABASE_ANON_KEY || '').trim(),
  __ADMIN_EMAIL__: (env.ADMIN_EMAIL || '').trim(),
  __PAYSTACK_PUBLIC_KEY__: (env.PAYSTACK_PUBLIC_KEY || '').trim()
};

const tpl = fs.readFileSync(path.join(ROOT, 'config.template.js'), 'utf8');
const out = tpl.replace(/__[A-Z0-9_]+__/g, (tok) =>
  Object.prototype.hasOwnProperty.call(TOKENS, tok) ? TOKENS[tok] : tok
);

fs.writeFileSync(path.join(ROOT, 'config.js'), out);

const missing = Object.entries(TOKENS)
  .filter(([, v]) => !v)
  .map(([k]) => k.replace(/__/g, '').toLowerCase());
console.log('config.js generated.' + (missing.length ? ' Missing env values: ' + missing.join(', ') : ''));