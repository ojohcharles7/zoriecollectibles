/* =========================================================================
   ZORIE COLLECTIBLES — DEMO STOREFRONT + ADMIN
   All data persists to this browser's localStorage. See note at bottom of
   page (in the About section) for what a live backend would add.
   ========================================================================= */

/* ---------- helpers ---------- */
const naira = n => '₦' + Number(n).toLocaleString('en-NG');
const uid = () => Math.random().toString(36).slice(2,9);
const todayISO = () => new Date().toISOString();
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ---------- dark / light theme ---------- */
function currentTheme(){ return document.documentElement.dataset.theme || 'light'; }
function applyThemeColor(){
  const dark = currentTheme()==='dark';
  const m = document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content', dark ? '#17120D' : '#F7F3EA');
}
function toggleTheme(){
  const next = currentTheme()==='dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try{ localStorage.setItem('zorie_theme', next); }catch(e){}
  applyThemeColor();
}

/* ---------- product / section images ----------
   Primary source is Supabase Storage (public bucket `product-images`).
   Falls back to local /images when Supabase isn't configured (demo mode). */
function imgUrl(file){
  const u = CONFIG.supabase.url;
  const enabled = !!(u && CONFIG.supabase.anonKey && !/YOUR-/.test(u + CONFIG.supabase.anonKey));
  return enabled ? u + '/storage/v1/object/public/product-images/' + file : 'images/' + file;
}

/* ---------- default catalog ---------- */
const DEFAULT_PRODUCTS = [
 {id:'p01',name:'Custom Name Bracelet – Tiger\'s Eye & Onyx',cat:'Customized Name Bracelets',price:12500,stock:99,img: imgUrl('p01.jpg'),desc:'Matte onyx and warm tiger\'s eye beads spelling out a name of your choice, finished with a gunmetal crown charm. A favourite for gifting.',sizes:['Small (16cm)','Medium (18cm)','Large (18cm)'],tags:['bestseller'],customizable:true},
 {id:'p02',name:'Onyx & Tiger\'s Eye Duo Bracelet',cat:'Men\'s Bracelets',price:13800,stock:17,img: imgUrl('p02.jpg'),desc:'Two-piece stack pairing polished onyx with banded tiger\'s eye and brushed gold spacers — worn together or apart.',sizes:['Medium (18cm)','Large (20cm)'],tags:['new']},
 {id:'p03',name:'Bridal Pearl Gift Set',cat:'Gift Sets',price:48500,stock:6,img: imgUrl('p03.jpg'),desc:'A genuine freshwater pearl necklace, bracelet and stud earrings, presented together for the bride or her bridesmaids.',sizes:['One size set'],tags:['bestseller']},
 {id:'p04',name:'Wolf Spirit Onyx Necklace Set',cat:'Necklace & Bracelet Sets',price:34500,stock:8,img: imgUrl('p04.jpg'),desc:'Matte onyx beads with polished silver-tone spacers, a wolf-head charm and dagger pendant — a bold necklace and bracelet stack in one set.',sizes:['One size set'],tags:['new']},
 {id:'p05',name:'Custom Name Bracelet – Crimson Tiger’s Eye',cat:'Customized Name Bracelets',price:12000,stock:99,img: imgUrl('p05.jpg'),desc:'Deep red tiger\'s eye and matte onyx beads with your name in bold letter beads, finished with a pavé crown charm.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:[],customizable:true},
 {id:'p06',name:'Heritage Fist Pendant Set',cat:'Necklace & Bracelet Sets',price:39500,stock:5,img: imgUrl('p06.jpg'),desc:'Sandalwood-tone beads in gold-tone settings, a stack of skull-accented bracelets and a fist-pendant necklace — a heritage-inspired statement set.',sizes:['One size set'],tags:['bestseller']},
 {id:'p07',name:'Lava & Tiger\'s Eye Grounding Bracelet',cat:'Men\'s Bracelets',price:13200,stock:20,img: imgUrl('p07.jpg'),desc:'Matte onyx, lava stone and tiger\'s eye beads with hematite accents. The porous lava beads hold a drop of your favourite fragrance oil.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p08',name:'Banded Agate Statement Bracelet',cat:'Gemstone Bracelets',price:15500,stock:11,img: imgUrl('p08.jpg'),desc:'Striking banded agate beads in charcoal and honey tones, separated by amber-toned discs — a naturally one-of-a-kind piece.',sizes:['Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p09',name:'Hematite Silver Bead Bracelet',cat:'Men\'s Bracelets',price:11800,stock:19,img: imgUrl('p09.jpg'),desc:'Polished silver-tone hematite beads with a textured cylinder clasp — a clean, minimal everyday piece.',sizes:['Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p10',name:'Tribal Onyx Accent Bracelet',cat:'Traditional/Unique Bead Pieces',price:12800,stock:14,img: imgUrl('p10.jpg'),desc:'Onyx-tone beads paired with a hand-etched tribal-pattern focal bead and warm amber discs — a nod to traditional adornment.',sizes:['Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p11',name:'Custom Name Bracelet – Matte Onyx & Crown',cat:'Customized Name Bracelets',price:12000,stock:99,img: imgUrl('p11.jpg'),desc:'Matte onyx beads with your name spelled in letter beads, finished with a crystal-accented crown and fleur-de-lis charm.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:['new'],customizable:true},
 {id:'p12',name:'Tiger\'s Eye & Gold Bar Bracelet',cat:'Men\'s Bracelets',price:14500,stock:16,img: imgUrl('p12.jpg'),desc:'Rich tiger\'s eye beads alternated with textured gold-tone discs and a signature engraved gold bar.',sizes:['Medium (18cm)','Large (20cm)'],tags:['bestseller']},
 {id:'p13',name:'Wood & Hematite Bead Bracelet',cat:'Men\'s Bracelets',price:11500,stock:18,img: imgUrl('p13.jpg'),desc:'Natural wood beads set among faceted onyx and hematite, for an understated, grounded look.',sizes:['Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p14',name:'Malachite Statement Bracelet',cat:'Gemstone Bracelets',price:15800,stock:10,img: imgUrl('p14.jpg'),desc:'Genuine banded malachite beads in a rich emerald green — bold, striking and made to order in your preferred wrist size.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p15',name:'Frost Agate Gift Set',cat:'Gift Sets',price:27500,stock:9,img: imgUrl('p15.jpg'),desc:'A stack of frosted crackle-agate bracelets in a deep blue colourway, gift-boxed and ready to give.',sizes:['One size set'],tags:[]},
 {id:'p16',name:'Custom Name Bracelet – Onyx & Double Crown',cat:'Customized Name Bracelets',price:12500,stock:99,img: imgUrl('p16.jpg'),desc:'Matte onyx beads with your name in letter beads, a pavé focal bead and two crown charms for an extra regal finish.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:[],customizable:true},
 {id:'p17',name:'Custom Word Bracelet – Lava & Tiger\'s Eye',cat:'Customized Name Bracelets',price:12800,stock:99,img: imgUrl('p17.jpg'),desc:'Not just names — spell out a word that motivates you. Matte onyx, lava stone and tiger\'s eye beads with hematite accents.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:['new'],customizable:true},
 {id:'p18',name:'Ocean Lava Bead Bracelet',cat:'Gemstone Bracelets',price:10800,stock:22,img: imgUrl('p18.jpg'),desc:'Porous lava stone beads in soft teal and sage tones — lightweight, textural, and ready to carry a drop of your favourite scent.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:[]},
 {id:'p19',name:'Custom Name Bracelet – Crown Trio',cat:'Customized Name Bracelets',price:13200,stock:99,img: imgUrl('p19.jpg'),desc:'A two-piece custom name stack in matte onyx and tiger\'s eye, finished with three pavé crown charms.',sizes:['Small (16cm)','Medium (18cm)','Large (20cm)'],tags:[],customizable:true},
 {id:'p20',name:'Rainbow Pearl Stack Bracelet',cat:'Pearl Collection',price:22500,stock:13,img: imgUrl('p20.jpg'),desc:'Genuine freshwater pearls layered with gold-filled paperclip chain and pops of coral, jade and lilac gemstone beads.',sizes:['One size'],tags:['bestseller']},
];

const CATEGORIES = [...new Set([...DEFAULT_PRODUCTS.map(p=>p.cat), 'Watches', 'Perfumes'])];

const DEFAULT_TESTIMONIALS = [
 {name:'Amaka O.', quote:'The rose quartz bracelet is even more beautiful in person. It arrived so well packaged, it felt like a gift to myself.'},
 {name:'Temi A.', quote:'I ordered the custom name bracelet for my sister\'s birthday. The bead work was neat and the turnaround was quick.'},
 {name:'Ifeoma K.', quote:'Zorie pieces get compliments every single time I wear them. The pearl strand is now my everyday luxury.'}
];

/* ---------- state (persisted) ---------- */
const DEFAULT_DISCOUNTS = [{code:'ZORIE10',pct:10,active:true},{code:'WELCOME15',pct:15,active:true}];

const ls = {
  get(k, f){ try{ const v = localStorage.getItem(k); return v===null ? f : JSON.parse(v); }catch(e){ return f; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

/* Supabase is only activated once config.js has real keys. Until then the
   store runs fully in the browser (localStorage) so nothing breaks. */
const supabaseEnabled = !!(CONFIG.supabase.url && CONFIG.supabase.anonKey &&
  !/YOUR-/.test(CONFIG.supabase.url + CONFIG.supabase.anonKey));
const sb = supabaseEnabled ? window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey) : null;

const DATA = {
  products: null, orders: null, discounts: null, subscribers: null,
  cart: ls.get('zorie_cart', []),
  wishlist: ls.get('zorie_wishlist', [])
};

function normalizeProduct(p){
  return { ...p, desc: p.description ?? p.desc ?? '',
    sizes: Array.isArray(p.sizes) ? p.sizes : ['One size'],
    tags: Array.isArray(p.tags) ? p.tags : [],
    customizable: !!p.customizable,
    price: Number(p.price) || 0, stock: Number(p.stock) || 0 };
}
function toRow(p){
  const { desc, description, ...rest } = p;
  return { ...rest, description: desc ?? description ?? '' };
}
function normalizeOrder(o){
  return { ...o, id: String(o.id), date: o.date || new Date().toISOString(),
    customer: o.customer || {}, items: o.items || [],
    subtotal: Number(o.subtotal)||0, discount: Number(o.discount)||0,
    delivery: Number(o.delivery)||0, total: Number(o.total)||0,
    paymethod: o.paymethod || o.payMethod || '', payref: o.payRef || o.payref || '',
    user_id: o.user_id || null,
    status: o.status || 'Being Handcrafted' };
}

const DB = {
  get products(){
    if(DATA.products) return DATA.products;
    let v = ls.get('zorie_products', DEFAULT_PRODUCTS);
    if(sb && Array.isArray(v) && v.some(p=>String(p.img||'').startsWith('data:'))) v = DEFAULT_PRODUCTS;
    return (DATA.products = v);
  },
  set products(v){ DATA.products = v; ls.set('zorie_products', v); if(sb){ sb.from('products').upsert(v.map(toRow)).then(()=>{}).catch(e=>console.warn('sync products', e)); } },
  get orders(){ return DATA.orders || (DATA.orders = ls.get('zorie_orders', [])); },
  set orders(v){ DATA.orders = v; ls.set('zorie_orders', v); if(sb){ sb.from('orders').upsert(v.map(normalizeOrder)).then(()=>{}).catch(e=>console.warn('sync orders', e)); } },
  get discounts(){ return DATA.discounts || (DATA.discounts = ls.get('zorie_discounts', DEFAULT_DISCOUNTS)); },
  set discounts(v){ DATA.discounts = v; ls.set('zorie_discounts', v); if(sb){ sb.from('discounts').upsert(v).then(()=>{}).catch(e=>console.warn('sync discounts', e)); } },
  get subscribers(){ return DATA.subscribers || (DATA.subscribers = ls.get('zorie_subs', [])); },
  set subscribers(v){ DATA.subscribers = v; ls.set('zorie_subs', v); if(sb){ sb.from('subscribers').upsert(v.map(s=>({email:s}))).then(()=>{}).catch(e=>console.warn('sync subs', e)); } },
  get cart(){ return DATA.cart; },
  set cart(v){ DATA.cart = v; ls.set('zorie_cart', v); updateBadges(); syncCartToProfile(); },
  get wishlist(){ return DATA.wishlist; },
  set wishlist(v){ DATA.wishlist = v; ls.set('zorie_wishlist', v); updateBadges(); }
};

/* Load shared data (products/discounts/orders) from Supabase. Seeds the
   catalog on the very first run via the seed-catalog edge function. */
async function loadRemote(){
  if(!sb) return;
  try{
    const [{data:products},{data:discounts},{data:orders}] = await Promise.all([
      sb.from('products').select('*').order('created_at',{ascending:true}),
      sb.from('discounts').select('*').order('created_at',{ascending:true}),
      sb.from('orders').select('*').order('created_at',{ascending:true})
    ]);
    if(products){ DATA.products = products.map(normalizeProduct); if(products.length===0) seedCatalog(); }
    if(discounts && discounts.length){ DATA.discounts = discounts; }
    if(orders){ DATA.orders = orders; }
  }catch(e){ console.warn('Supabase load failed — running local-only.', e); }
}
function seedCatalog(){
  sb.functions.invoke('seed-catalog', { body:{ products: DEFAULT_PRODUCTS.map(toRow) } })
    .then(res=>{ if(res.error) console.warn('Catalog seed failed:', res.error); else loadRemote(); })
    .catch(e=>console.warn('seed-catalog edge function unavailable.', e));
}
let adminDataLoaded = false;
async function refreshAdminData(){
  if(!sb || adminDataLoaded) return;
  adminDataLoaded = true;
  try{
    const [{data:orders},{data:discounts},{data:subscribers}] = await Promise.all([
      sb.from('orders').select('*').order('created_at',{ascending:true}),
      sb.from('discounts').select('*').order('created_at',{ascending:true}),
      sb.from('subscribers').select('email').order('created_at',{ascending:true})
    ]);
    if(orders){ DATA.orders = orders; }
    if(discounts && discounts.length){ DATA.discounts = discounts; }
    if(subscribers){ DATA.subscribers = subscribers.map(s=>s.email); }
  }catch(e){ adminDataLoaded = false; console.warn('admin data load failed — using local data.', e); }
}

/* =========================================================================
   CUSTOMER ACCOUNTS (sign up / sign in / my orders)
   Live mode uses Supabase Auth (passwords are bcrypt-hashed by Supabase).
   Demo mode keeps accounts in localStorage, hashed with SHA-256.
   ========================================================================= */
const AUTH = { user: null, session: null };

function profileName(user){
  if(!user) return '';
  const m = user.user_metadata || {};
  return user.full_name || m.full_name || (user.email||'').split('@')[0] || 'there';
}
function profileEmail(user){
  if(!user) return '';
  return (user.user_metadata||{}).email || user.email || '';
}
function currentUser(){ return AUTH.user; }

/* After a successful sign in / sign up: open the home page so the customer
   can start ordering right away. (Cart items are kept in the bag.) */
function routeAfterAuth(){
  location.hash = '#home';
}

function closeWelcome(){
  closeModal('welcome-modal');
  location.hash = '#home';
}

function updateAuthUI(){
  const me = currentUser();
  const links = document.querySelectorAll('[data-account-label]');
  links.forEach(el=>{
    el.textContent = me ? 'My Account' : 'Sign In / Sign Up';
  });
  const link = document.getElementById('account-link');
  if(link) link.title = me ? 'My Account' : 'Sign In / Sign Up';
}

async function initAuth(){
  if(sb){
    const { data } = await sb.auth.getSession();
    AUTH.session = data.session; AUTH.user = data.session?.user || null;
    sb.auth.onAuthStateChange((ev, session)=>{
      AUTH.session = session; AUTH.user = session?.user || null;
      if(ev==='SIGNED_OUT' || (ev==='TOKEN_REFRESHED' && !session)){
        sessionStorage.removeItem('zorie_admin');
        if((location.hash||'').startsWith('#admin')) router();
      }
      updateAuthUI();
    });
  } else {
    AUTH.user = ls.get('zorie_session', null);
  }
  updateAuthUI();
  if(AUTH.user) restoreUserState();
}

/* =========================================================================
   PER-USER PROFILE (server-synced cart + default delivery info)
   In live mode this lives in the `user_profiles` table; in demo mode the
   same fields ride on the localStorage account record for parity.
   ========================================================================= */
const PROFILE = { data: null };

function profileCache(){
  const me = currentUser();
  if(!me) return null;
  if(PROFILE.data && PROFILE.data.email === (me.email || '').toLowerCase()) return PROFILE.data;
  return null;
}

async function loadUserProfile(){
  const me = currentUser();
  if(!me){ PROFILE.data = null; return null; }
  const email = (me.email || '').toLowerCase();
  if(sb){
    try{
      const { data, error } = await sb.from('user_profiles').select('*').eq('id', me.id).maybeSingle();
      const p = error ? null : (data || { id: me.id, cart: [], address:'', city:'', delivery_method:'' });
      PROFILE.data = { email, ...p, cart: Array.isArray((p||{}).cart) ? p.cart : [] };
    }catch(e){
      PROFILE.data = { email, id: me.id, cart: [], address:'', city:'', delivery_method:'' };
    }
    return PROFILE.data;
  }
  const users = ls.get('zorie_users', []);
  const u = users.find(x=>x.email===email) || {};
  const session = ls.get('zorie_session', null) || {};
  PROFILE.data = {
    email, id: me.id || email,
    address: session.address || u.address || '',
    city: session.city || u.city || '',
    delivery_method: session.delivery_method || u.delivery_method || '',
    cart: DATA.cart
  };
  return PROFILE.data;
}

let cartSyncTimer = null;
function syncCartToProfile(immediate){
  const me = currentUser();
  if(!me) return;
  const save = async ()=>{
    if(sb){
      try{
        await sb.from('user_profiles').upsert({ id: me.id, cart: DB.cart, updated_at: todayISO() });
        if(PROFILE.data) PROFILE.data.cart = DB.cart;
      }catch(e){ console.warn('cart sync failed', e); }
    }
  };
  if(immediate){ save(); }
  else { clearTimeout(cartSyncTimer); cartSyncTimer = setTimeout(save, 800); }
}

/* Merge the guest cart with the account's saved cart (keep the larger qty
   for an item already in both) and re-render if we're mid-checkout. */
async function restoreUserState(){
  const me = currentUser();
  if(!me) return;
  await loadUserProfile();
  const saved = (PROFILE.data && PROFILE.data.cart) || [];
  if(sb && Array.isArray(saved) && saved.length){
    const merged = [...DB.cart];
    saved.forEach(si=>{
      const ex = merged.find(i=>i.key===si.key);
      if(ex){ ex.qty = Math.max(ex.qty, si.qty); }
      else merged.push(si);
    });
    DB.cart = merged;
  }
  syncCartToProfile(true);
  if(sb) await claimPastOrders();
  if(location.hash.startsWith('#checkout')) renderCheckoutPage();
  else if(location.hash.startsWith('#account')) renderAccount();
}

/* Bring past guest orders (same email) into this account. */
async function claimPastOrders(){
  const me = currentUser();
  if(!me || !sb) return;
  try{
    const res = await sb.functions.invoke('checkout', { body:{ method:'claim-orders', email: me.email } });
    if(res && !res.error && res.data && res.data.claimed > 0){
      const { data } = await sb.from('orders').select('*').eq('user_id', me.id);
      if(data) DATA.orders = data.map(normalizeOrder);
    }
  }catch(e){ console.warn('claim orders failed', e); }
}

/* Persist the delivery fields just entered at checkout as the user's default. */
function saveDeliveryDefaults(c){
  const me = currentUser();
  if(!me || !c) return;
  const vals = { address: c.address || '', city: c.city || '', delivery_method: c.method || '' };
  if(sb){
    sb.from('user_profiles').upsert({ id: me.id, ...vals, updated_at: todayISO() })
      .then(()=>{ if(PROFILE.data) Object.assign(PROFILE.data, vals); })
      .catch(e=>console.warn('save delivery defaults failed', e));
  } else {
    const email = (me.email || '').toLowerCase();
    const users = ls.get('zorie_users', []);
    const u = users.find(x=>x.email===email);
    if(u){ Object.assign(u, vals); ls.set('zorie_users', users); }
    const session = ls.get('zorie_session', null);
    if(session){ Object.assign(session, vals); ls.set('zorie_session', session); }
    if(PROFILE.data) Object.assign(PROFILE.data, vals);
  }
}

/* demo-mode password hashing (fallback if Web Crypto unavailable) */
async function hashPassword(pw){
  try{
    if(crypto && crypto.subtle){
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
      return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
  }catch(e){ /* fall through */ }
  let h = 5381;
  for(let i=0;i<pw.length;i++){ h = ((h<<5)+h+pw.charCodeAt(i))|0; }
  return 'f' + Math.abs(h).toString(16);
}

function validatePassword(pw){
  if(!/^[!@#$%^&*]/.test(pw)) return 'Password must start with a special character (!, @, #, $, %, ^, &, *).';
  if(pw.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

async function doSignUp(e){
  e.preventDefault();
  const err = document.getElementById('auth-err');
  const ok = msg =>{ if(err){ err.textContent=msg; err.className='text-xs mt-2 text-forest-ink'; } };
  const fail = msg =>{ if(err){ err.textContent=msg; err.className='text-xs mt-2 text-red-500'; } };
  const full_name = document.getElementById('su-name').value.trim();
  const email = (document.getElementById('su-email').value||'').trim().toLowerCase();
  const phone = document.getElementById('su-phone').value.trim();
  const pw = document.getElementById('su-pw').value;
  if(!full_name){ fail('Please enter your full name.'); return false; }
  if(!phone){ fail('Please enter your phone number.'); return false; }
  const pwErr = validatePassword(pw);
  if(pwErr){ fail(pwErr); return false; }
  if(sb){
    const { data, error } = await sb.auth.signUp({
      email, password: pw,
      options: { data: { full_name, phone } }
    });
    if(error){ fail(error.message); return false; }
    if(data.session){
      AUTH.user = data.session.user; updateAuthUI();
      await restoreUserState();
      routeAfterAuth();
      setTimeout(()=>openModal('welcome-modal'), 150);
    } else {
      ok('Account created! Check your email to confirm, then sign in.');
      renderAccount();
    }
  } else {
    const users = ls.get('zorie_users', []);
    if(users.some(u=>u.email===email)){ fail('An account with this email already exists. Sign in instead.'); return false; }
    const salt = uid()+uid();
    const hash = await hashPassword(pw + ':' + salt);
    users.push({ email, full_name, phone, salt, hash, created_at: todayISO() });
    ls.set('zorie_users', users);
    ls.set('zorie_session', { email, full_name, phone });
    AUTH.user = { email, full_name, phone };
    updateAuthUI();
    await restoreUserState();
    routeAfterAuth();
    setTimeout(()=>openModal('welcome-modal'), 150);
  }
  return false;
}

async function doSignIn(e){
  e.preventDefault();
  const err = document.getElementById('auth-err');
  const fail = msg =>{ if(err){ err.textContent=msg; err.className='text-xs mt-2 text-red-500'; } };
  const email = (document.getElementById('si-email').value||'').trim().toLowerCase();
  const pw = document.getElementById('si-pw').value;
  if(!email || !pw){ fail('Please enter your email and password.'); return false; }
  if(sb){
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
    if(error){ fail('Incorrect email or password.'); return false; }
    AUTH.user = data.user; updateAuthUI();
    await restoreUserState();
    routeAfterAuth();
  } else {
    const users = ls.get('zorie_users', []);
    const u = users.find(x=>x.email===email);
    if(!u){ fail('No account found with that email.'); return false; }
    const hash = await hashPassword(pw + ':' + u.salt);
    if(hash !== u.hash){ fail('Incorrect password.'); return false; }
    ls.set('zorie_session', { email: u.email, full_name: u.full_name, phone: u.phone });
    AUTH.user = { email: u.email, full_name: u.full_name, phone: u.phone };
    updateAuthUI();
    await restoreUserState();
    routeAfterAuth();
  }
  return false;
}

async function signOut(){
  syncCartToProfile(true);
  if(sb){ await sb.auth.signOut(); }
  else { ls.set('zorie_session', null); }
  AUTH.user = null; PROFILE.data = null; updateAuthUI();
  renderAccount();
}

function setAuthTab(mode){
  const inBtn = document.getElementById('ac-tab-in');
  const upBtn = document.getElementById('ac-tab-up');
  const panel = document.getElementById('auth-panel');
  if(!panel) return;
  const inForm = signInFormHTML(), upForm = signUpFormHTML();
  if(mode==='in'){ panel.innerHTML = inForm; }
  else { panel.innerHTML = upForm; }
  if(inBtn && upBtn){
    inBtn.className = 'flex-1 py-3 text-sm uppercase tracking-wideish border-b-2 ' + (mode==='in' ? 'border-forest text-forest-ink font-medium' : 'border-transparent text-muted');
    upBtn.className = 'flex-1 py-3 text-sm uppercase tracking-wideish border-b-2 ' + (mode==='up' ? 'border-forest text-forest-ink font-medium' : 'border-transparent text-muted');
  }
}

/* Shared password field (show/hide toggle) — used by sign-in & sign-up forms. */
function passwordFieldHTML(inputId, attrs){
  return `
    <div class="relative">
      <input type="password" id="${inputId}" ${attrs||''} style="padding-right:2.6rem">
      <button type="button" onclick="togglePasswordVisibility('${inputId}', this)" aria-label="Show password" class="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-strong hover:text-forest-ink transition rounded-md">
        <svg class="eye-open" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
        <svg class="eye-closed hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      </button>
    </div>`;
}

function signInFormHTML(){
  return `
  <form onsubmit="return doSignIn(event)">
    <label>Email</label>
    <input type="email" id="si-email" placeholder="you@example.com" required autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false">
    <label>Password</label>
    ${passwordFieldHTML('si-pw', 'required autocomplete="current-password"')}
    <div id="auth-err" class="text-xs mt-2"></div>
    <button class="btn btn-forest w-full mt-4">Sign In</button>
  </form>
  <div class="text-center mt-6 text-sm">
    <span class="text-muted-strong">New here?</span>
    <button type="button" onclick="setAuthTab('up')" class="text-gold underline ml-1">Create an account</button>
  </div>`;
}

function signUpFormHTML(){
  return `
  <form onsubmit="return doSignUp(event)">
    <div class="grid sm:grid-cols-2 gap-4">
      <div><label>Full Name</label><input type="text" id="su-name" placeholder="Your name" required autocomplete="name"></div>
      <div><label>Phone Number</label><input type="tel" id="su-phone" placeholder="e.g. 0816 957 7178" required autocomplete="tel" inputmode="tel"></div>
    </div>
    <label>Email</label>
    <input type="email" id="su-email" placeholder="you@example.com" required autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false">
    <label>Password</label>
    ${passwordFieldHTML('su-pw', 'required autocomplete="new-password" aria-describedby="su-pw-hint"')}
    <p class="text-[11px] text-muted mt-1" id="su-pw-hint">Must start with a special character (!, @, #, $, %, ^, &, *) and be at least 6 characters.</p>
    <div id="auth-err" class="text-xs mt-2"></div>
    <button class="btn btn-forest w-full mt-4">Create Account</button>
  </form>
  <div class="text-center mt-6 text-sm">
    <span class="text-muted-strong">Already have an account?</span>
    <button type="button" onclick="setAuthTab('in')" class="text-gold underline ml-1">Sign in</button>
  </div>`;
}

async function myOrders(){
  const me = currentUser();
  if(!me) return [];
  if(sb){
    try{
      const { data, error } = await sb.from('orders').select('*')
        .eq('user_id', me.id).order('created_at',{ascending:false});
      return error ? [] : (data||[]).map(normalizeOrder);
    }catch(e){ return []; }
  }
  const email = (me.email||'').toLowerCase();
  return DB.orders
    .filter(o=>String((o.customer||{}).email||'').toLowerCase()===email)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));
}

function orderStatusBadge(s){
  const t = (s||'').toLowerCase();
  let cls = 'bg-surface-soft text-muted-strong';
  if(t.includes('awaiting')) cls = 'bg-amber-100 text-amber-800';
  else if(t.includes('verif')) cls = 'bg-sky-100 text-sky-800';
  else if(t.includes('payment received')) cls = 'bg-teal-100 text-teal-800';
  else if(t.includes('handcraft')) cls = 'bg-gold-pale text-forest-ink';
  else if(t.includes('way')) cls = 'bg-forest-dark text-cream';
  else if(t.includes('delivered')) cls = 'bg-[#D2B48C] text-[#47301F]';
  else if(t.includes('cancelled')) cls = 'bg-red-100 text-red-700';
  return `<span class="inline-block ${cls} px-2 py-0.5 rounded-full text-[10px] font-semibold">${s||'Being Handcrafted'}</span>`;
}

async function renderAccount(){
  const app = document.getElementById('app');
  const me = currentUser();
  if(!me){
    app.innerHTML = `
    <section class="max-w-md mx-auto px-6 py-16">
      <div class="text-center mb-8">
        <h1 class="serif text-3xl">My Account</h1>
        <p class="text-sm text-muted mt-2">Sign in to track your orders, or create an account for faster checkout.</p>
      </div>
      <div class="flex border-b border-edge mb-6">
        <button id="ac-tab-in" onclick="setAuthTab('in')" class="flex-1 py-3 text-sm uppercase tracking-wideish border-b-2 border-forest text-forest-ink font-medium">Sign In</button>
        <button id="ac-tab-up" onclick="setAuthTab('up')" class="flex-1 py-3 text-sm uppercase tracking-wideish border-b-2 border-transparent text-muted">Create Account</button>
      </div>
      <div id="auth-panel">${signInFormHTML()}</div>
    </section>`;
    return;
  }
  app.innerHTML = `<div class="text-center py-28"><div class="mx-auto mb-5 w-8 h-8 border-2 border-edge border-t-gold rounded-full animate-spin"></div><p class="text-sm text-muted">Loading your account…</p></div>`;
  const orders = await myOrders();
  const name = profileName(me);
  const email = (me.email || profileEmail(me));
  const phone = (me.user_metadata||{}).phone || me.phone || '—';
  app.innerHTML = `
  <section class="max-w-3xl mx-auto px-6 py-16">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="serif text-3xl">Hello, ${name.split(' ')[0]}</h1>
        <p class="text-sm text-muted mt-1">${email} · ${phone}</p>
      </div>
      <button onclick="signOut()" class="btn btn-outline btn-sm">Sign Out</button>
    </div>
    <div class="text-xs tracking-wideish uppercase text-gold mb-3">My Orders (${orders.length})</div>
    ${orders.length===0 ? `
      <div class="border border-dashed border-edge p-8 text-center">
        <p class="text-sm text-muted-strong mb-3">You haven't placed any orders yet.</p>
        <a href="#shop" class="btn btn-forest btn-sm">Start Shopping</a>
      </div>` :
      `<div class="space-y-4">
        ${orders.map(o=>`
        <a href="#order?id=${encodeURIComponent(o.id)}" class="block border border-edge p-5 hover:border-gold transition">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span class="text-sm font-semibold text-forest-ink">${o.id}</span>
            ${orderStatusBadge(o.status)}
          </div>
          <div class="text-xs text-muted mb-2">Placed ${new Date(o.date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</div>
          <div class="text-sm text-ink space-y-0.5">
            ${(o.items||[]).slice(0,2).map(i=>`<div>${i.qty} × ${i.name}${i.size?` <span class="text-muted">(${i.size})</span>`:''}</div>`).join('')}
            ${(o.items||[]).length>2 ? `<div class="text-xs text-muted mt-1">+${(o.items||[]).length-2} more item(s)</div>`:''}
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-edge-soft">
            <span class="text-sm">${orderPayLabel(o)}</span>
            <div class="flex items-center gap-3">
              <span class="serif text-lg text-forest-ink">${naira(o.total)}</span>
              <span class="flex items-center gap-1 text-xs text-gold underline">View
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </div>
        </a>`).join('')}
      </div>`}
  </section>`;
}

function orderPayLabel(o){
  const p = o.payMethod || o.paymethod;
  if(p==='paystack') return 'Paystack';
  if(p==='opay') return 'OPay (Transfer)';
  return 'OPay / Bank';
}

function statusTimelineHTML(status){
  const steps = ['Awaiting Payment','Verifying Your Payment','Payment Received','Being Handcrafted','On Its Way','Delivered'];
  const cur = (status||'').trim();
  if(/cancel/i.test(cur)){
    return `<div class="flex items-center gap-2 text-red-600 text-sm font-medium">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
      Order cancelled</div>`;
  }
  const idx = steps.indexOf(cur);
  return `<div class="flex items-start">
    ${steps.map((s,i)=>{
      const done = i <= idx;
      const active = i === idx;
      return `
      <div class="flex-1 flex items-start min-w-0">
        ${i>0?`<div class="mt-1.5 flex-1 h-0.5 min-w-2 ${done?'bg-forest':'bg-surface-soft'}"></div>`:''}
        <div class="flex flex-col items-center px-1">
          <div class="w-3.5 h-3.5 rounded-full border-2 ${done?'bg-forest border-forest':'bg-page border-edge-soft'}"></div>
          <span class="text-[10px] mt-1.5 text-center leading-tight ${active?'text-forest-ink font-semibold':done?'text-forest-ink':'text-muted'}">${s}</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function findProduct(id){ return DB.products.find(p=>p.id===id); }

/* ---------- badges ---------- */
function updateBadges(){
  const cc = DB.cart.reduce((s,i)=>s+i.qty,0);
  const wc = DB.wishlist.length;
  const ce = document.getElementById('cart-count');
  const we = document.getElementById('wish-count');
  ce.textContent = cc; ce.classList.toggle('hidden', cc===0);
  we.textContent = wc; we.classList.toggle('hidden', wc===0);
}

/* ---------- drawers / modals / overlay ---------- */
function closeAllOverlays(){
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('wishlist-drawer').classList.remove('open');
  document.querySelectorAll('.modal-wrap').forEach(m=>m.classList.remove('open'));
}
function openCart(){ renderCart(); document.getElementById('overlay').classList.add('open'); document.getElementById('cart-drawer').classList.add('open'); }
function openWishlistDrawer(){ renderWishlistDrawer(); document.getElementById('overlay').classList.add('open'); document.getElementById('wishlist-drawer').classList.add('open'); }
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function toggleMobileMenu(){ document.getElementById('mobile-menu').classList.toggle('hidden'); }
function openSearch(){ document.getElementById('search-bar').classList.remove('hidden'); document.getElementById('search-input').focus(); }
function closeSearch(){ document.getElementById('search-bar').classList.add('hidden'); }
function onSearchInput(e){
  const q = e.target.value.trim();
  if(q.length>1){ location.hash = '#shop?q=' + encodeURIComponent(q); closeSearch(); }
}

/* ---------- cart logic ---------- */
function addToCart(id, qty, size, note){
  qty = qty || 1;
  const cart = DB.cart;
  const key = id + '|' + (size||'');
  const existing = cart.find(i=>i.key===key);
  if(existing){ existing.qty += qty; } else { cart.push({key,id,qty,size:size||'', note: note||''}); }
  DB.cart = cart;
  toast('Added to bag');
}
function removeFromCart(key){ DB.cart = DB.cart.filter(i=>i.key!==key); renderCart(); }
function setQty(key, qty){
  const cart = DB.cart;
  const item = cart.find(i=>i.key===key);
  if(item){ item.qty = Math.max(1, qty); }
  DB.cart = cart; renderCart();
}
function cartLines(){
  return DB.cart.map(i=>{
    const p = findProduct(i.id);
    return p ? {...i, product:p, lineTotal: p.price*i.qty} : null;
  }).filter(Boolean);
}
function cartSubtotal(){ return cartLines().reduce((s,l)=>s+l.lineTotal,0); }

function renderCart(){
  const lines = cartLines();
  const wrap = document.getElementById('cart-items');
  if(lines.length===0){
    wrap.innerHTML = `<div class="text-center py-16 text-sm text-muted-strong">Your bag is empty.<br><a href="#shop" onclick="closeAllOverlays()" class="text-gold underline mt-3 inline-block">Continue shopping</a></div>`;
  } else {
    wrap.innerHTML = lines.map(l => `
      <div class="flex gap-4 py-5 border-b border-edge-soft">
        <img src="${l.product.img}" class="w-20 h-24 object-cover rounded-sm flex-shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex justify-between gap-2">
            <div class="serif text-lg leading-snug pr-1">${l.product.name}</div>
            <button onclick="removeFromCart('${l.key}')" class="w-6 h-6 shrink-0 rounded-full border border-edge text-muted-strong hover:text-red-500 hover:border-red-300 flex items-center justify-center text-sm leading-none transition" aria-label="Remove">&times;</button>
          </div>
          ${l.size ? `<div class="text-xs text-muted mt-0.5">${l.size}</div>`:''}
          ${l.note ? `<div class="text-xs text-muted italic mt-0.5">"${l.note}"</div>`:''}
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center gap-2">
              <div class="qty-btn" onclick="setQty('${l.key}',${l.qty-1})" aria-label="Decrease">−</div>
              <span class="text-sm w-5 text-center tabular-nums">${l.qty}</span>
              <div class="qty-btn" onclick="setQty('${l.key}',${l.qty+1})" aria-label="Increase">+</div>
            </div>
            <div class="text-sm font-semibold text-forest-ink tabular-nums">${naira(l.lineTotal)}</div>
          </div>
        </div>
      </div>`).join('');
  }
  document.getElementById('cart-subtotal').textContent = naira(cartSubtotal());
}

/* ---------- wishlist ---------- */
function toggleWishlist(id, btnEl){
  let wl = DB.wishlist;
  if(wl.includes(id)){ wl = wl.filter(i=>i!==id); toast('Removed from wishlist'); }
  else { wl.push(id); toast('Added to wishlist'); }
  DB.wishlist = wl;
  if(btnEl) renderShop(currentShopFilters);
  renderWishlistDrawer();
}
function renderWishlistDrawer(){
  const wl = DB.wishlist.map(findProduct).filter(Boolean);
  const wrap = document.getElementById('wishlist-items');
  if(wl.length===0){
    wrap.innerHTML = `<div class="text-center py-16 text-sm text-muted-strong">Nothing saved yet.</div>`;
    return;
  }
  wrap.innerHTML = wl.map(p=>`
    <div class="flex gap-4 py-4 border-b border-edge-soft">
      <img src="${p.img}" class="w-20 h-24 object-cover flex-shrink-0 cursor-pointer" onclick="openProduct('${p.id}')">
      <div class="flex-1">
        <div class="serif text-lg leading-tight">${p.name}</div>
        <div class="text-sm text-gold mt-1">${naira(p.price)}</div>
        <div class="flex gap-3 mt-2 text-xs">
          <button onclick="addToCart('${p.id}',1,(${JSON.stringify(p.sizes)})[0]);" class="text-forest-ink underline">Add to bag</button>
          <button onclick="toggleWishlist('${p.id}')" class="text-muted-strong underline">Remove</button>
        </div>
      </div>
    </div>`).join('');
}

/* ---------- newsletter ---------- */
function subscribeNewsletter(e){
  e.preventDefault();
  const input = document.getElementById('newsletter-email');
  const email = input.value.trim();
  const subs = DB.subscribers;
  if(!subs.includes(email)){ subs.push(email); DB.subscribers = subs; }
  const count = DB.subscribers.length;
  const msg = count < NEWSLETTER_TARGET
    ? `You're on the waitlist (${count}/${NEWSLETTER_TARGET}). We'll email you when it's live!`
    : 'Thank you for subscribing!';
  if(sb){
    sb.from('subscribers').upsert({email}).then(({error})=>{
      if(!error || error.code==='23505'){ toast(msg); input.value=''; }
      else { toast('Could not subscribe. Please try again.'); }
    });
  } else {
    toast(msg);
    input.value='';
  }
  return false;
}

const NEWSLETTER_TARGET = 50;
function sendNewsletterAdmin(){
  const subject = (document.getElementById('nl-subject').value||'').trim();
  const body = (document.getElementById('nl-body').value||'').trim();
  const status = document.getElementById('nl-status');
  const btn = document.getElementById('nl-send-btn');
  if(!subject || !body){ status.textContent = 'Enter both a subject and a message.'; status.className='text-sm mt-3 text-red-500'; return; }
  if(btn){ btn.disabled = true; btn.textContent = 'Queuing…'; }
  const done = (msg, ok=true)=>{
    status.textContent = msg;
    status.className = 'text-sm mt-3 ' + (ok?'text-forest-ink':'text-red-500');
    if(btn){ btn.disabled = false; btn.textContent = 'Send newsletter again'; }
  };
  if(sb){
    sb.functions.invoke('checkout', { body:{ method:'newsletter', subject, body } })
      .then(res=>{
        const d = res && res.data;
        if(d && d.ok){
          done(`Newsletter queued for ${d.count} subscribers. It will send in batches within the daily email budget.`);
          document.getElementById('nl-subject').value='';
          document.getElementById('nl-body').value='';
        } else if(d && d.error==='waitlist'){
          done(`Newsletter still locked — the waitlist needs ${d.target} subscribers and currently has ${d.count}. Keep collecting.`, false);
        } else {
          done('Could not send. Please try again.', false);
        }
      })
      .catch(()=>done('Could not reach the server. Please try again.', false));
  } else {
    if(DB.subscribers.length < NEWSLETTER_TARGET){
      done(`Demo mode — the waitlist needs ${NEWSLETTER_TARGET} subscribers and currently has ${DB.subscribers.length}. Keep collecting.`, false);
      return;
    }
    setTimeout(()=>done('Demo mode — the newsletter would be queued for '+DB.subscribers.length+' subscribers.'), 400);
  }
}

/* =========================================================================
   ROUTER
   ========================================================================= */
let currentShopFilters = {};

function parseHash(){
  const raw = location.hash.slice(1) || 'home';
  const [route, qs] = raw.split('?');
  const params = {};
  if(qs) qs.split('&').forEach(pair=>{
    const [k,v] = pair.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v||'');
  });
  return {route, params};
}

const ROUTE_META = {
  home:     { title:'Zorie Collectibles — Jewellery That Tells Your Story', desc:'Handcrafted bead jewellery, gemstone bracelets and customized name pieces, made with care in Nigeria. Shop securely, pay by transfer.' },
  shop:     { title:'Shop — Zorie Collectibles', desc:'Browse bracelets, necklaces, pearl and gift sets. Free Lagos delivery on orders above ₦50,000.' },
  product:  { title:'Zorie Collectibles', desc:'Handcrafted jewellery from Zorie Collectibles.' },
  about:    { title:'About Us — Zorie Collectibles', desc:'The story behind Zorie Collectibles — beauty meets meaning.' },
  custom:   { title:'Customized Pieces — Zorie Collectibles', desc:'Add a name or word to your own bead bracelet, handmade to order.' },
  checkout: { title:'Checkout — Zorie Collectibles', desc:'Secure checkout by bank transfer.' },
  track:    { title:'Track Order — Zorie Collectibles', desc:'Track your Zorie Collectibles order.' },
  account:  { title:'My Account — Zorie Collectibles', desc:'Sign in to view your Zorie Collectibles orders.' },
  order:    { title:'Order — Zorie Collectibles', desc:'View and track your Zorie Collectibles order.' },
  'opay-callback': { title:'Confirming Payment — Zorie Collectibles', desc:'Confirming your OPay payment.' },
  admin:    { title:'Admin — Zorie Collectibles', desc:'Store owner dashboard.' },
  policies: { title:'Store Policies — Zorie Collectibles', desc:'Shipping, returns, privacy and terms.' },
  faq:      { title:'FAQ — Zorie Collectibles', desc:'Frequently asked questions.' },
  contact:  { title:'Contact — Zorie Collectibles', desc:'Get in touch with Zorie Collectibles.' }
};
function setMeta(meta){
  document.title = meta.title;
  const desc = document.querySelector('meta[name="description"]'); if(desc) desc.setAttribute('content', meta.desc);
  const ogt = document.querySelector('meta[property="og:title"]'); if(ogt) ogt.setAttribute('content', meta.title);
  const ogd = document.querySelector('meta[property="og:description"]'); if(ogd) ogd.setAttribute('content', meta.desc);
}

function router(){
  closeAllOverlays();
  stopOrderPoll();
  const {route, params} = parseHash();
  document.body.classList.toggle('admin-mode', route==='admin');
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant':'auto'});
  if(route==='home'){ renderHome(); setMeta(ROUTE_META.home); }
  else if(route==='shop'){ currentShopFilters = params; renderShop(params); setMeta(ROUTE_META.shop); }
  else if(route==='product'){
    const p = findProduct(params.id);
    renderProductPage(params.id);
    setMeta(p ? { title: p.name + ' — Zorie Collectibles', desc: p.desc || ROUTE_META.product.desc } : ROUTE_META.product);
  }
  else if(route==='about'){ renderAbout(); setMeta(ROUTE_META.about); }
  else if(route==='custom'){ renderCustom(); setMeta(ROUTE_META.custom); }
  else if(route==='checkout'){ renderCheckoutPage(); setMeta(ROUTE_META.checkout); }
  else if(route==='track'){ renderTrackOrder(); setMeta(ROUTE_META.track); }
  else if(route==='account'){ renderAccount(); setMeta(ROUTE_META.account); }
  else if(route==='order'){ renderOrderPage(params); setMeta(ROUTE_META.order); }
  else if(route==='opay-callback'){ renderOpayCallback(params); setMeta(ROUTE_META['opay-callback']); }
  else if(route==='admin'){ renderAdminGate(); setMeta(ROUTE_META.admin); }
  else if(route==='policies'){ renderPolicies(params.page); setMeta(ROUTE_META.policies); }
  else if(route==='faq'){ renderFaq(); setMeta(ROUTE_META.faq); }
  else if(route==='contact'){ renderContact(); setMeta(ROUTE_META.contact); }
  else { renderHome(); setMeta(ROUTE_META.home); }
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
}
window.addEventListener('hashchange', router);

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); revealObserver.unobserve(e.target); } });
},{threshold:.12});

/* =========================================================================
   HOME PAGE
   ========================================================================= */
function productCard(p){
  const inWish = DB.wishlist.includes(p.id);
  return `
  <div class="prod-card reveal" onclick="location.hash='#product?id=${p.id}'">
    <div class="prod-img-wrap">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="wish-heart" onclick="event.stopPropagation(); toggleWishlist('${p.id}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="${inWish?'#B8912F':'none'}" stroke="#B8912F" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </div>
      ${p.tags && p.tags.includes('new') ? `<span class="absolute top-3 left-3 bg-[#D2B48C] text-[#47301F] text-[10px] tracking-wideish px-2 py-1">NEW</span>`:''}
      ${p.stock===0 ? `<span class="absolute top-3 left-3 bg-ink text-white text-[10px] tracking-wideish px-2 py-1">SOLD OUT</span>`:''}
      <div class="quick-add" onclick="event.stopPropagation(); addToCart('${p.id}',1,(${JSON.stringify(p.sizes)})[0]);">QUICK ADD +</div>
    </div>
    <div class="pt-3">
      <div class="text-[11px] tracking-wideish uppercase text-muted-strong">${p.cat}</div>
      <div class="serif text-lg leading-snug mt-0.5">${p.name}</div>
      <div class="text-sm text-gold mt-1">${naira(p.price)}</div>
    </div>
  </div>`;
}

function renderHome(){
  const products = DB.products;
  const featured = products.slice(0,4);
  const arrivals = products.filter(p=>p.tags.includes('new'));
  const bestsellers = products.filter(p=>p.tags.includes('bestseller'));
  const igHref = socialHref(CONFIG.store.instagram, 'https://instagram.com/');

  document.getElementById('app').innerHTML = `
  <!-- HERO -->
  <section class="relative bg-forest-dark text-cream overflow-hidden">
    <div class="absolute inset-0 opacity-[0.18]" style="background:radial-gradient(circle at 20% 30%, var(--gold) 0, transparent 45%), radial-gradient(circle at 85% 70%, var(--gold) 0, transparent 40%);"></div>
    <div class="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 lg:py-32 relative grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div class="bead-row mb-6"><span class="bead"></span><span class="bead" style="background:#F7F3EA"></span><span class="bead"></span><span class="text-[11px] tracking-wideish uppercase text-cream/60 ml-1">Handcrafted Bead Jewellery</span></div>
        <h1 class="serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6">Jewellery That<br><span class="italic text-gold-light">Tells Your Story.</span></h1>
        <p class="text-cream/80 max-w-md leading-relaxed mb-9">Welcome to Zorie Collectibles, where beauty meets meaning. Carefully curated bead jewellery and unique accessories, crafted with quality, simplicity and individuality in mind.</p>
        <div class="flex flex-wrap gap-4">
          <a href="#shop" class="btn btn-gold">Shop Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
          <a href="#shop" class="btn btn-outline-cream">Explore Our Collections</a>
        </div>
      </div>
      <div class="hidden md:block relative">
        <div class="aspect-[4/5] overflow-hidden rounded-full border border-gold-light/40" style="border-width:1px;">
          <img src="${imgUrl('hero.jpg')}" class="w-full h-full object-cover" alt="Zorie Collectibles jewellery">
        </div>
      </div>
    </div>
  </section>

  <!-- marquee -->
  <div class="bg-gold-pale border-y border-gold-light/40 py-3 overflow-hidden">
    <div class="text-[11px] sm:text-xs tracking-[.25em] uppercase text-forest-ink text-center">
      Handcrafted &nbsp;·&nbsp; Curated &nbsp;·&nbsp; Timeless &nbsp;·&nbsp; Made In Nigeria &nbsp;·&nbsp; Gift-Ready
    </div>
  </div>

  <!-- FEATURED -->
  <section class="max-w-7xl mx-auto px-6 py-20">
    <div class="flex items-end justify-between mb-10 reveal">
      <div>
        <div class="text-xs tracking-wideish uppercase text-gold mb-2">Featured</div>
        <h2 class="serif text-4xl">Pieces We Adore</h2>
      </div>
      <a href="#shop" class="hidden sm:inline text-sm btn-ghost">View All</a>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      ${featured.map(productCard).join('')}
    </div>
  </section>

  <!-- NEW ARRIVALS carousel -->
  <section class="bg-surface py-20 border-y border-edge-soft">
    <div class="max-w-7xl mx-auto px-6">
      <div class="mb-10 reveal">
        <div class="text-xs tracking-wideish uppercase text-gold mb-2">Just In</div>
        <h2 class="serif text-4xl">New Arrivals</h2>
      </div>
      <div class="flex gap-6 sm:gap-8 overflow-x-auto pb-4 snap-x">
        ${arrivals.map(p=>`<div class="min-w-[220px] sm:min-w-[260px] snap-start">${productCard(p)}</div>`).join('')}
      </div>
    </div>
  </section>

  <!-- BEST SELLERS -->
  <section class="max-w-7xl mx-auto px-6 py-20">
    <div class="mb-10 reveal">
      <div class="text-xs tracking-wideish uppercase text-gold mb-2">Loved By You</div>
      <h2 class="serif text-4xl">Best Sellers</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      ${bestsellers.map(productCard).join('')}
    </div>
  </section>

  <!-- CUSTOMIZED PIECES -->
  <section class="bg-forest-dark text-cream">
    <div class="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
      <div class="reveal order-2 md:order-1">
        <div class="text-xs tracking-wideish uppercase text-gold-light mb-3">Made For You</div>
        <h2 class="serif text-4xl mb-5">Customized Pieces</h2>
        <p class="text-cream/80 leading-relaxed mb-7 max-w-md">Add a name, an initial or a meaningful word to your own bead bracelet — thoughtfully handmade to order for birthdays, anniversaries, or a gift that says more than words can.</p>
        <a href="#custom" class="btn btn-gold">Design Yours <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
      <div class="order-1 md:order-2 reveal">
        <img src="${imgUrl('custom.jpg')}" class="w-full aspect-[4/3] object-cover" alt="Customized bead bracelet">
      </div>
    </div>
  </section>

  <!-- GEMSTONE COLLECTION -->
  <section class="max-w-7xl mx-auto px-6 py-20">
    <div class="text-center mb-12 reveal">
      <div class="text-xs tracking-wideish uppercase text-gold mb-2">By Stone</div>
      <h2 class="serif text-4xl">The Gemstone Collection</h2>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-6 reveal">
      ${[
        ["Tiger's Eye",'#B9822F'],['Onyx','#1C1C1C'],['Hematite','#6B7076'],
        ['Agate','#3A3F6B'],['Malachite','#2F7A4F'],['Lava Stone','#33312F'],
        ['Pearl','#F2ECE2'],['Wood','#8B5E34']
      ].map(([name,c])=>`
        <a href="#shop?q=${encodeURIComponent(name)}" class="group text-center">
          <div class="w-16 sm:w-20 aspect-square rounded-full mx-auto mb-2 border border-edge group-hover:border-gold transition flex items-center justify-center" style="background:${c}22">
            <div class="w-6 sm:w-8 h-6 sm:h-8 rounded-full" style="background:${c}"></div>
          </div>
          <div class="text-sm serif">${name}</div>
        </a>`).join('')}
    </div>
  </section>

  <!-- WHY CHOOSE US -->
  <section class="bg-gold-pale py-20">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-12 reveal">
        <div class="text-xs tracking-wideish uppercase text-gold mb-2">The Difference</div>
        <h2 class="serif text-4xl">Why Choose Zorie Collectibles</h2>
      </div>
      <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        ${[
          ['Handpicked Materials','Genuine gemstones, freshwater pearls and quality findings, chosen piece by piece.'],
          ['Made With Care','Every bracelet and necklace is assembled and finished by hand, not mass produced.'],
          ['Personal Touch','From custom names to gift wrapping, we treat every order like it matters — because it does.'],
          ['Honest Pricing','Luxury detailing at prices that respect your budget, with no compromise on quality.']
        ].map(([t,d])=>`
          <div class="reveal">
            <div class="hr-gold w-10 mb-4"></div>
            <div class="serif text-xl mb-2">${t}</div>
            <p class="text-sm text-forest-ink/70 leading-relaxed">${d}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="max-w-4xl mx-auto px-6 py-24 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold mb-3 reveal">Customer Reviews</div>
    <div id="testimonial-slide" class="reveal"></div>
  </section>

  <!-- INSTAGRAM -->
  <section class="pb-20">
    <div class="max-w-7xl mx-auto px-6 text-center mb-8 reveal">
      <div class="text-xs tracking-wideish uppercase text-gold mb-2">Follow Along</div>
      <h2 class="serif text-3xl">@zories_collectibles</h2>
    </div>
    <div class="grid grid-cols-3 md:grid-cols-6">
      ${products.slice(0,6).map(p=>`
        <a href="${igHref}" target="_blank" class="relative aspect-square overflow-hidden group">
          <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute inset-0 bg-forest-dark/0 group-hover:bg-forest-dark/40 transition flex items-center justify-center">
            <svg class="opacity-0 group-hover:opacity-100 transition" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>
          </div>
        </a>`).join('')}
    </div>
  </section>
  `;

  // testimonial rotation
  let ti = 0;
  const slideEl = document.getElementById('testimonial-slide');
  function showTestimonial(){
    const t = DEFAULT_TESTIMONIALS[ti];
    slideEl.innerHTML = `
      <p class="serif italic text-2xl sm:text-3xl leading-snug text-forest-ink mb-5">"${t.quote}"</p>
      <div class="text-xs tracking-wideish uppercase text-muted">— ${t.name}</div>`;
    ti = (ti+1) % DEFAULT_TESTIMONIALS.length;
  }
  showTestimonial();
  clearInterval(window._testiTimer);
  window._testiTimer = setInterval(showTestimonial, 5000);
}

/* =========================================================================
   SHOP PAGE
   ========================================================================= */
function renderShop(params){
  params = params || {};
  const all = DB.products;
  const activeCat = params.cat || 'All';
  const q = (params.q || '').toLowerCase();
  const sort = params.sort || 'featured';

  let list = all.filter(p=>{
    const matchCat = activeCat==='All' || p.cat===activeCat;
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  if(sort==='price-asc') list = list.sort((a,b)=>a.price-b.price);
  else if(sort==='price-desc') list = list.sort((a,b)=>b.price-a.price);
  else if(sort==='name') list = list.sort((a,b)=>a.name.localeCompare(b.name));

  document.getElementById('app').innerHTML = `
  <section class="bg-forest-dark text-cream py-14 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold-light mb-2">Shop The Collection</div>
    <h1 class="serif text-4xl sm:text-5xl">${activeCat==='All' ? 'All Jewellery' : activeCat}</h1>
  </section>
  <div class="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-[220px_1fr] gap-10">
    <aside class="hidden md:block">
      <div class="text-xs tracking-wideish uppercase text-muted-strong mb-4">Category</div>
      <ul class="space-y-2 text-sm">
        <li><a href="#shop" class="${activeCat==='All'?'text-gold':''} hover:text-gold">All (${all.length})</a></li>
        ${CATEGORIES.map(c=>`<li><a href="#shop?cat=${encodeURIComponent(c)}" class="${activeCat===c?'text-gold':''} hover:text-gold">${c} (${all.filter(p=>p.cat===c).length})</a></li>`).join('')}
      </ul>
      <div class="hr-gold my-6"></div>
      <div class="text-xs tracking-wideish uppercase text-muted-strong mb-3">Need Something Special?</div>
      <a href="#custom" class="text-sm text-forest-ink underline">Customize a piece →</a>
    </aside>
    <div>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-8">
        <select onchange="location.hash='#shop?cat=${encodeURIComponent(activeCat)}${q?'&q='+encodeURIComponent(q):''}&sort='+this.value" class="md:hidden !w-auto text-xs">
          <option>Sort</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name">Name</option>
        </select>
        <select onchange="location.hash='#shop?cat=${encodeURIComponent(activeCat)}${q?'&q='+encodeURIComponent(q):''}&sort='+this.value" class="hidden md:block !w-auto text-xs ml-auto">
          <option value="featured" ${sort==='featured'?'selected':''}>Sort: Featured</option>
          <option value="price-asc" ${sort==='price-asc'?'selected':''}>Price: Low to High</option>
          <option value="price-desc" ${sort==='price-desc'?'selected':''}>Price: High to Low</option>
          <option value="name" ${sort==='name'?'selected':''}>Name A–Z</option>
        </select>
      </div>
      ${list.length ? `<div class="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">${list.map(productCard).join('')}</div>`
        : `<div class="text-center py-24 text-muted-strong serif text-xl">No pieces found. Try another search.</div>`}
    </div>
  </div>`;
}

/* =========================================================================
   PRODUCT PAGE / QUICK VIEW
   ========================================================================= */
function productDetailHTML(p, isModal){
  const inWish = DB.wishlist.includes(p.id);
  return `
  <div class="grid md:grid-cols-2">
    <div class="aspect-square md:aspect-auto bg-surface-soft rounded-2xl overflow-hidden border-2 border-[#C9A06F]">
      <img src="${p.img}" class="w-full h-full object-cover" alt="${p.name}">
    </div>
    <div class="p-6 sm:p-10">
      ${isModal ? `<button onclick="closeModal('product-modal')" class="absolute top-4 right-4 text-2xl leading-none z-10">&times;</button>`:''}
      <div class="text-xs tracking-wideish uppercase text-muted-strong mb-2">${p.cat}</div>
      <h1 class="serif text-3xl sm:text-4xl mb-3">${p.name}</h1>
      <div class="text-xl text-gold mb-5">${naira(p.price)}</div>
      <p class="text-sm text-muted-strong leading-relaxed mb-6">${p.desc}</p>

      <div class="mb-5">
        <label>Size / Option</label>
        <select id="opt-size-${isModal?'m':'p'}">${p.sizes.map(s=>`<option>${s}</option>`).join('')}</select>
      </div>
      ${p.customizable ? `
      <div class="mb-5">
        <label>Personalization (name / word)</label>
        <input type="text" id="opt-note-${isModal?'m':'p'}" maxlength="14" placeholder="e.g. AMARA">
      </div>`:''}
      <div class="mb-6">
        <label>Quantity</label>
        <div class="flex items-center gap-2">
          <div class="qty-btn" onclick="stepQty('${isModal?'m':'p'}',-1)">−</div>
          <span id="qty-val-${isModal?'m':'p'}" class="w-6 text-center">1</span>
          <div class="qty-btn" onclick="stepQty('${isModal?'m':'p'}',1)">+</div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-4">
        <button onclick="addFromDetail('${p.id}','${isModal?'m':'p'}')" class="btn btn-forest flex-1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/></svg> Add to Cart</button>
        <button onclick="addFromDetail('${p.id}','${isModal?'m':'p'}',true)" class="btn btn-gold flex-1">Buy Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
      </div>
      <button onclick="toggleWishlist('${p.id}')" class="text-sm flex items-center gap-2 text-muted hover:text-gold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${inWish?'#B8912F':'none'}" stroke="currentColor" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        ${inWish ? 'Saved to Wishlist':'Add to Wishlist'}
      </button>
      <div class="hr-gold my-6"></div>
      <div class="text-xs text-muted-strong space-y-1">
        <div>${p.stock>0 ? p.stock+' in stock — ships in 2–4 business days' : 'Currently out of stock'}</div>
        <div>Pickup available in Lagos · Nationwide delivery</div>
      </div>
    </div>
  </div>`;
}
function stepQty(scope, delta){
  const el = document.getElementById('qty-val-'+scope);
  const v = Math.max(1, parseInt(el.textContent)+delta);
  el.textContent = v;
}
function addFromDetail(id, scope, buyNow){
  const size = document.getElementById('opt-size-'+scope)?.value;
  const noteEl = document.getElementById('opt-note-'+scope);
  const qty = parseInt(document.getElementById('qty-val-'+scope).textContent);
  addToCart(id, qty, size, noteEl?noteEl.value:'');
  if(buyNow){ closeModal('product-modal'); location.hash = '#checkout'; }
  else if(document.getElementById('product-modal').classList.contains('open')){ closeModal('product-modal'); openCart(); }
}
function openProduct(id){
  const p = findProduct(id);
  if(!p) return;
  document.getElementById('product-modal-content').innerHTML = productDetailHTML(p, true);
  openModal('product-modal');
}
function renderProductPage(id){
  const p = findProduct(id);
  if(!p){ location.hash='#shop'; return; }
  document.getElementById('app').innerHTML = `<div class="max-w-6xl mx-auto my-10 relative">${productDetailHTML(p,false)}</div>
  <section class="max-w-7xl mx-auto px-6 pb-20">
    <h3 class="serif text-2xl mb-6">You May Also Like</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      ${DB.products.filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,4).map(productCard).join('')}
    </div>
  </section>`;
}

/* =========================================================================
   ABOUT PAGE
   ========================================================================= */
function renderAbout(){
  document.getElementById('app').innerHTML = `
  <section class="bg-forest-dark text-cream py-16 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold-light mb-2">Our Story</div>
    <h1 class="serif text-4xl sm:text-5xl">About Zorie Collectibles</h1>
  </section>
  <section class="max-w-4xl mx-auto px-6 py-16">
    <p class="text-lg leading-relaxed text-ink mb-6">Zorie Collectibles is a lifestyle and jewellery brand focused on providing beautiful, quality and meaningful pieces that allow people to express themselves with confidence.</p>
    <p class="leading-relaxed text-muted-strong mb-6">We specialize in handcrafted and carefully curated bead jewellery, including gemstone bracelets, necklaces, customized name-tag beads, freshwater pearls, coral beads and other unique accessories.</p>
    <p class="leading-relaxed text-muted-strong mb-10">At Zorie Collectibles, we believe jewellery should be more than something you wear. It should tell a story, represent a memory, celebrate a person or simply make you feel beautiful. Our goal is to combine luxury, simplicity, creativity and affordability while delivering an exceptional customer experience.</p>

    <div class="grid sm:grid-cols-2 gap-8 mb-14">
      <div class="border border-edge p-7">
        <div class="text-xs tracking-wideish uppercase text-gold mb-3">Mission</div>
        <p class="serif text-xl leading-snug text-forest-ink">To provide beautiful, quality and meaningful jewellery and lifestyle pieces at accessible prices while delivering exceptional customer service.</p>
      </div>
      <div class="border border-edge p-7">
        <div class="text-xs tracking-wideish uppercase text-gold mb-3">Vision</div>
        <p class="serif text-xl leading-snug text-forest-ink">To build a trusted African lifestyle and jewellery brand recognized for quality, creativity, excellent service and timeless pieces — enjoyed locally and globally.</p>
      </div>
    </div>

    <div class="text-xs tracking-wideish uppercase text-gold mb-5 text-center">Our Values</div>
    <div class="flex flex-wrap justify-center gap-3 mb-16">
      ${['Quality','Integrity','Creativity','Customer Satisfaction','Affordability','Trust','Excellence'].map(v=>`<span class="border border-gold-light text-forest-ink text-sm px-4 py-2 rounded-full">${v}</span>`).join('')}
    </div>
  </section>`;
}

/* =========================================================================
   CUSTOM PAGE
   ========================================================================= */
function renderCustom(){
  const customizable = DB.products.filter(p=>p.customizable);
  document.getElementById('app').innerHTML = `
  <section class="bg-forest-dark text-cream py-16 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold-light mb-2">Made For You</div>
    <h1 class="serif text-4xl sm:text-5xl">Customized Pieces</h1>
    <p class="text-cream/70 max-w-lg mx-auto mt-4">Choose a customizable piece, tell us your name or word at checkout, and we'll hand-bead it just for you.</p>
  </section>
  <section class="max-w-7xl mx-auto px-6 py-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      ${customizable.map(productCard).join('')}
    </div>
  </section>`;
}

/* =========================================================================
   CHECKOUT
   ========================================================================= */
function goToCheckout(){ location.hash = '#checkout'; }

function deliveryFee(subtotal, method){
  if(subtotal>50000 || subtotal===0) return 0;
  return /^Home Delivery/.test(method||'') ? 10000 : 4000;
}

function checkoutFormHTML(lines, discountPct){
  const prof = profileCache() || {};
  const subtotal = lines.reduce((s,l)=>s+l.lineTotal,0);
  const delivery = deliveryFee(subtotal, prof.delivery_method || 'Home Delivery');
  const discountAmt = Math.round(subtotal * (discountPct||0)/100);
  const total = subtotal - discountAmt + delivery;
  const hasActiveDiscounts = (DB.discounts||[]).some(d=>d.active);
  const me = currentUser();
  const pName = me ? ((me.user_metadata||{}).full_name || me.full_name || '') : '';
  const pPhone = me ? ((me.user_metadata||{}).phone || me.phone || '') : '';
  const pEmail = me ? (me.email || '') : '';
  const pAddr = prof.address || '';
  const pCity = prof.city || '';
  const pMethod = prof.delivery_method || 'Home Delivery';
  const DELIVERY_METHODS = ['Home Delivery','Pickup — Aba','Pickup — Abuja','Pickup — Asaba','Pickup — Enugu','Pickup — Lagos','Pickup — Owerri','Pickup — Port Harcourt'];
  const methodOpts = DELIVERY_METHODS.map(m=>`<option${m===pMethod?' selected':''}>${m}</option>`).join('');
  return `
  <button onclick="location.hash='#shop'" class="absolute top-4 right-4 text-xl">&times;</button>
  <h2 class="serif text-3xl mb-8">Checkout</h2>
  <div class="grid md:grid-cols-[1.3fr_1fr] gap-10">
    <form id="checkout-form" onsubmit="return placeOrder(event)" class="border-2 border-[#C9A06F]/70 rounded-2xl p-5 sm:p-7">
      <div class="border border-[#C9A06F]/50 rounded-xl p-4 sm:p-5 mb-6">
        <div class="text-xs tracking-wideish uppercase text-gold mb-4">Delivery Information</div>
        <div class="grid sm:grid-cols-2 gap-4 mb-4">
          <div><label>Full Name</label><input type="text" id="co-name" value="${pName}" required autocomplete="name"></div>
          <div><label>Phone Number</label><input type="tel" id="co-phone" value="${pPhone}" required autocomplete="tel" inputmode="tel"></div>
        </div>
        <div class="mb-4"><label>Email</label><input type="email" id="co-email" value="${pEmail}" required autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
        <div class="mb-4"><label>Delivery Address</label><textarea id="co-address" rows="2" required autocomplete="street-address">${pAddr}</textarea></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label>City</label><input type="text" id="co-city" value="${pCity}" required autocomplete="address-level2"></div>
          <div>
            <label>Delivery Method</label>
            <select id="co-method" onchange="updateDeliveryFee()">${methodOpts}</select>
          </div>
        </div>
      </div>

      <div class="text-xs tracking-wideish uppercase text-gold mb-4">Payment Method</div>
      <div class="border border-gold-light/50 bg-gold-pale/40 rounded-md p-4 mb-6">
        <div class="flex items-center gap-3 text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="text-forest-ink shrink-0"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span>Pay by <b>transfer to our OPay account</b>. You'll see the account details after placing your order.</span>
        </div>
      </div>

      ${hasActiveDiscounts ? `
      <div class="mb-6">
        <label>Discount Code</label>
        <div class="flex gap-2">
          <input type="text" id="co-discount" placeholder="Enter code" autocomplete="off">
          <button type="button" onclick="applyDiscount()" class="btn btn-forest btn-xs">Apply</button>
        </div>
        <div id="discount-msg" class="text-xs mt-1"></div>
      </div>` : ''}

      <button class="btn btn-gold w-full">Place Order — ${naira(total)} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
    </form>

    <div class="border-2 border-[#C9A06F]/70 rounded-2xl p-5 sm:p-7">
      <div class="text-xs tracking-wideish uppercase text-gold mb-4">Order Summary</div>
      <div class="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
        ${lines.map(l=>`
          <div class="flex gap-3 text-sm">
            <img src="${l.product.img}" class="w-12 h-14 object-cover">
            <div class="flex-1">
              <div>${l.product.name}</div>
              <div class="text-muted-strong text-xs">${l.size||''} · Qty ${l.qty}</div>
            </div>
            <div>${naira(l.lineTotal)}</div>
          </div>`).join('')}
      </div>
      <div class="hr-gold mb-4"></div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between"><span>Subtotal</span><span>${naira(subtotal)}</span></div>
        <div class="flex justify-between"><span>Discount</span><span id="co-discount-line">${discountAmt?('-'+naira(discountAmt)):'—'}</span></div>
        <div class="flex justify-between"><span>Delivery</span><span id="co-delivery-line">${delivery===0?'Free':naira(delivery)}</span></div>
        <div class="flex justify-between font-medium text-base pt-2 border-t border-edge-soft"><span>Total</span><span id="co-total">${naira(total)}</span></div>
      </div>
    </div>
  </div>`;
}

let appliedDiscount = 0;
function updateDeliveryFee(){
  const sel = document.getElementById('co-method');
  if(!sel) return;
  const sub = cartLines().reduce((s,l)=>s+l.lineTotal,0);
  const delivery = deliveryFee(sub, sel.value);
  const discAmt = Math.round(sub*(appliedDiscount||0)/100);
  const row = document.getElementById('co-delivery-line');
  const tot = document.getElementById('co-total');
  if(row) row.textContent = delivery===0 ? 'Free' : naira(delivery);
  if(tot) tot.textContent = naira(sub - discAmt + delivery);
}
function applyDiscount(){
  const el = document.getElementById('co-discount');
  if(!el){ appliedDiscount = 0; return; }
  const code = el.value.trim().toUpperCase();
  const d = DB.discounts.find(x=>x.code===code && x.active);
  const msg = document.getElementById('discount-msg');
  if(d){ appliedDiscount = d.pct; msg.textContent = `Code applied — ${d.pct}% off`; msg.className='text-xs mt-1 text-forest-ink'; }
  else { appliedDiscount = 0; msg.textContent = 'Invalid or inactive code'; msg.className='text-xs mt-1 text-red-500'; }
  renderCheckoutPage(true);
}

function renderCheckoutPage(preserveDiscount){
  if(!currentUser()){
    document.getElementById('app').innerHTML = `
      <div class="max-w-md mx-auto px-6 py-16 relative">
        <button onclick="location.hash='#shop'" class="absolute top-4 right-4 text-xl">&times;</button>
        <h2 class="serif text-3xl mb-1 text-center">Checkout</h2>
        <p class="text-sm text-muted text-center mb-6">Please sign in or create an account to place your order.</p>
        <div class="flex border-b border-edge mb-6">
          <button id="ac-tab-in" onclick="setAuthTab('in')" class="flex-1 py-3 text-sm uppercase tracking-wideish border-b-2 border-forest text-forest-ink font-medium">Sign In</button>
          <button id="ac-tab-up" onclick="setAuthTab('up')" class="flex-1 py-3 text-sm uppercase tracking-wideish border-b-2 border-transparent text-muted">Create Account</button>
        </div>
        <div id="auth-panel">${signInFormHTML()}</div>
      </div>`;
    return;
  }
  if(!preserveDiscount) appliedDiscount = 0;
  const lines = cartLines();
  const html = checkoutFormHTML(lines, appliedDiscount);
  if(location.hash.startsWith('#checkout')){
    document.getElementById('app').innerHTML = `<div class="max-w-6xl mx-auto px-6 py-14 relative">${html}</div>`;
  }
}

async function placeOrder(e){
  e.preventDefault();
  const lines = cartLines();
  if(lines.length===0){ toast('Your bag is empty'); return false; }
  const subtotal = lines.reduce((s,l)=>s+l.lineTotal,0);
  const delivery = deliveryFee(subtotal, document.getElementById('co-method').value);
  const discountAmt = Math.round(subtotal*(appliedDiscount||0)/100);
  const total = subtotal - discountAmt + delivery;
  const payMethod = 'opay';

  const order = {
    id: 'ZC-' + Date.now().toString().slice(-8),
    date: todayISO(),
    user_id: (currentUser()||{}).id || null,
    customer: {
      name: document.getElementById('co-name').value,
      phone: document.getElementById('co-phone').value,
      email: document.getElementById('co-email').value,
      address: document.getElementById('co-address').value,
      city: document.getElementById('co-city').value,
      method: document.getElementById('co-method').value
    },
    items: lines.map(l=>({name:l.product.name, size:l.size, note:l.note, qty:l.qty, price:l.product.price, lineTotal:l.lineTotal})),
    subtotal, discount: discountAmt, delivery, total,
    payMethod, status: 'Being Handcrafted'
  };
  saveDeliveryDefaults(order.customer);
const btn = e.target.querySelector('button[type=submit], button');
  const btnLabel = btn.textContent;

  // free order → finish immediately
  if(total<=0){ await finalizeOrder(order, null); return false; }

  // OPay transfer / demo mode
  order.status = 'Awaiting Payment';
  btn.textContent = 'Placing order…'; btn.disabled = true;
  await finalizeOrder(order, null);

  return false;
}

/* OPay hosted-cashier flow: create order server-side, redirect to OPay cashier.
   OPay returns the customer to opay-callback.html → #opay-callback?ref=… where
   renderOpayCallback confirms via /cashier/status and saves the order. */
async function startOpay(order, btn, btnLabel){
  const reference = order.id + '-' + uid();
  btn.textContent = 'Connecting to OPay…'; btn.disabled = true;
  try{
    const res = await sb.functions.invoke('checkout', { body:{ method:'opay', action:'create', order: normalizeOrder(order), reference } });
    if(res.error || !res.data || !res.data.ok || !res.data.cashierUrl){
      throw new Error((res.data && res.data.error) || res.error || 'OPay create failed');
    }
    const pend = JSON.parse(sessionStorage.getItem('zorie_pending_orders') || '{}');
    pend[reference] = { order, reference };
    sessionStorage.setItem('zorie_pending_orders', JSON.stringify(pend));
    window.location.href = res.data.cashierUrl;
  }catch(err){
    console.error(err);
    toast('Could not start OPay. Please try again or choose another method.');
    btn.textContent = btnLabel; btn.disabled = false;
  }
}

async function renderOpayCallback(params){
  const ref = params.ref;
  document.getElementById('app').innerHTML = `<div class="text-center py-28"><div class="mx-auto mb-5 w-8 h-8 border-2 border-edge border-t-gold rounded-full animate-spin"></div><p class="text-sm text-muted">Confirming your payment…</p></div>`;
  const pend = JSON.parse(sessionStorage.getItem('zorie_pending_orders') || '{}');
  const entry = pend[ref];
  if(!entry || !entry.order){
    document.getElementById('app').innerHTML = `<div class="text-center py-24"><p class="serif text-xl mb-3">We couldn't find your pending order.</p><p class="text-sm text-muted mb-6">You may have already completed it.</p><a href="#track" class="btn btn-forest">Track Order</a></div>`;
    return;
  }
  try{
    const res = await sb.functions.invoke('checkout', { body:{ method:'opay', action:'confirm', order: normalizeOrder(entry.order), reference: ref } });
    delete pend[ref];
    sessionStorage.setItem('zorie_pending_orders', JSON.stringify(pend));
    if(res.error || !res.data || !res.data.ok){
      const st = res.data && res.data.paymentStatus;
      document.getElementById('app').innerHTML = `<div class="text-center py-24">
        <p class="serif text-2xl mb-3">Payment not completed</p>
        <p class="text-sm text-muted mb-2">${st ? 'Status: '+st : 'Your payment could not be confirmed.'}</p>
        <a href="#checkout" class="btn btn-forest">Back to Checkout</a></div>`;
      return;
    }
    DB.cart = [];
    appliedDiscount = 0;
    showInvoice(res.data.order);
  }catch(err){
    console.error(err);
    document.getElementById('app').innerHTML = `<div class="text-center py-24"><p class="text-sm text-muted">Something went wrong confirming your payment. Please contact us with order <b>${entry.order.id}</b>.</p></div>`;
  }
}

async function finalizeOrder(order, reference){
  if(reference){ order.payRef = reference; order.status = 'Being Handcrafted'; }
  let saved = order;
  if(sb){
    try{
      const res = await sb.functions.invoke('checkout', { body:{ order: normalizeOrder(order), reference: reference || null } });
      if(res && !res.error && res.data && res.data.order){ saved = res.data.order; }
      else { throw new Error('checkout function did not confirm'); }
    }catch(err){
      console.warn('checkout edge function unavailable — inserting directly.', err);
      try{ await sb.from('orders').insert(normalizeOrder(order)); }
      catch(e2){ console.error('Order save failed', e2); toast('Order recorded locally — please contact us with ' + order.id); }
    }
  } else {
    const orders = DB.orders; orders.push(order); DB.orders = orders;
  }
  DB.cart = [];
  appliedDiscount = 0;
  showInvoice(saved);
}

/* Shared OPay proof submission — returns true on success. */
async function submitPaymentProof(orderId){
  if(sb){
    try{
      const res = await sb.functions.invoke('checkout', { body:{ method:'opay', action:'proof-submitted', orderId } });
      if(res.error || !res.data || !res.data.ok) throw new Error('confirm failed');
      return true;
    }catch(err){
      console.error(err);
      return false;
    }
  } else {
    const orders = DB.orders;
    const o = orders.find(o=>o.id===orderId);
    if(o){ o.status = 'Verifying Your Payment'; DB.orders = orders; }
    return true;
  }
}

/* OPay transfer: customer returns from WhatsApp and confirms they have paid. */
async function confirmOpayPayment(orderId){
  const wrap = document.getElementById('opay-proof-wrap');
  const mark = ()=>{
    if(wrap) wrap.innerHTML = `
      <div class="flex items-center gap-2 text-forest-ink font-medium">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
        Payment proof received — we'll confirm your order shortly.
      </div>`;
  };
  const ok = await submitPaymentProof(orderId);
  if(ok){ mark(); toast('Payment proof sent — thank you!'); }
  else { toast('Could not confirm here. Please message us on WhatsApp instead.'); }
}

function showInvoice(order){
  document.getElementById('invoice-modal-content').innerHTML = `
    <button onclick="closeModal('invoice-modal'); location.hash='#home';" class="absolute top-4 right-4 text-xl">&times;</button>
    <div id="invoice-print">
      <div class="text-center mb-6">
        <div class="serif text-3xl">Zorie <span class="italic text-gold">Collectibles</span></div>
        <div class="text-xs text-muted-strong mt-1">zoriecollectibles@gmail.com · Lagos, Nigeria</div>
      </div>
      <div class="flex justify-center mb-6">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
      </div>
      <h2 class="serif text-2xl text-center mb-1">Order Confirmed</h2>
      <p class="text-center text-sm text-muted mb-8">Thank you, ${order.customer.name.split(' ')[0]}! A confirmation email is on its way to ${order.customer.email}.</p>

      <div class="grid sm:grid-cols-2 gap-4 text-sm mb-6 border-y border-edge-soft py-4">
        <div><span class="text-muted-strong">Order No.</span><br>${order.id}</div>
        <div><span class="text-muted-strong">Date</span><br>${new Date(order.date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</div>
        <div><span class="text-muted-strong">Payment</span><br>${((order.payMethod||order.paymethod)==='paystack') ? 'Paystack' : ((order.payMethod||order.paymethod)==='opay' ? 'OPay (Transfer)' : 'OPay / Bank transfer')}${order.payRef||order.payref?` · ${order.payRef||order.payref}`:''}</div>
        <div><span class="text-muted-strong">Delivery To</span><br>${order.customer.address}, ${order.customer.city}</div>
      </div>

      <table class="w-full text-sm mb-6 responsive">
        <thead><tr class="text-left text-xs text-muted-strong"><th class="pb-2">Item</th><th class="pb-2">Qty</th><th class="pb-2 text-right">Total</th></tr></thead>
        <tbody>
          ${order.items.map(i=>`<tr class="border-t border-edge-soft"><td data-label="Item" class="py-2">${i.name}${i.size?` <span class="text-muted-strong text-xs">(${i.size})</span>`:''}${i.note?` <span class="text-muted-strong text-xs italic">"${i.note}"</span>`:''}</td><td data-label="Qty" class="py-2">${i.qty}</td><td data-label="Total" class="py-2 text-right">${naira(i.lineTotal)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="space-y-1 text-sm mb-8">
        <div class="flex justify-between"><span>Subtotal</span><span>${naira(order.subtotal)}</span></div>
        <div class="flex justify-between"><span>Discount</span><span>${order.discount?('-'+naira(order.discount)):'—'}</span></div>
        <div class="flex justify-between"><span>Delivery</span><span>${order.delivery===0?'Free':naira(order.delivery)}</span></div>
        <div class="flex justify-between font-medium text-base border-t border-edge-soft pt-2"><span>Total Paid</span><span>${naira(order.total)}</span></div>
      </div>
      ${(order.payMethod||order.paymethod)==='opay' ? `
      <div class="border border-gold-light/60 bg-gold-pale/50 rounded-md p-4 mb-8 text-sm">
        <div class="font-semibold text-forest-ink mb-1">Complete your OPay transfer</div>
        <p class="text-muted-strong mb-3">Transfer <b>${naira(order.total)}</b> to the OPay account below, then send your proof of payment:</p>
        <div class="mb-4">
          <span class="text-muted">Account Name:</span> <b>${CONFIG.opay.accountName || '—'}</b><br>
          <span class="text-muted">Account Number:</span> <b class="tracking-wider">${CONFIG.opay.accountNumber}</b> · <span class="text-muted">Bank:</span> OPay
        </div>
        <div id="opay-proof-wrap" class="flex flex-wrap gap-3">
          <a href="https://wa.me/${CONFIG.store.whatsapp}?text=${encodeURIComponent('Hi Zorie Collectibles! I just paid '+naira(order.total)+' for order '+order.id+' via OPay transfer.')}" target="_blank" class="btn btn-gold btn-sm">Send proof on WhatsApp</a>
          <button onclick="confirmOpayPayment('${order.id}')" class="btn btn-gold btn-sm">I have made payment</button>
        </div>
      </div>`:''}
    </div>
    <div class="flex gap-3 no-print">
      <button onclick="window.print()" class="btn btn-forest flex-1">Print / Save Invoice</button>
      <button onclick="closeModal('invoice-modal'); location.hash='#shop';" class="btn btn-gold flex-1">Continue Shopping</button>
    </div>
  `;
  openModal('invoice-modal');
}

/* =========================================================================
   ORDER PAGE (per-account order detail: payment + delivery tracking)
   ========================================================================= */
let orderPollTimer = null;
function stopOrderPoll(){
  if(orderPollTimer){ clearInterval(orderPollTimer); orderPollTimer = null; }
}

/* Fetch a single order owned by the signed-in user. */
async function fetchOrder(id){
  const me = currentUser();
  if(!me) return null;
  if(sb){
    try{
      const { data, error } = await sb.from('orders').select('*').eq('id', id).eq('user_id', me.id).maybeSingle();
      if(error || !data) return null;
      return normalizeOrder(data);
    }catch(e){ return null; }
  }
  const email = (me.email||'').toLowerCase();
  return DB.orders.find(o=>String(o.id)===String(id) && String((o.customer||{}).email||'').toLowerCase()===email) || null;
}
/* Status-specific action panel for the order page. */
function orderPageActionsHTML(o){
  const st = (o.status||'').trim();
  const wa = CONFIG.store.whatsapp;
  const waBtn = `<a href="https://wa.me/${wa}?text=${encodeURIComponent('Hi Zorie Collectibles! I have a question about order '+o.id+'.')}" target="_blank" class="btn btn-outline btn-sm">Message us on WhatsApp</a>`;
  if(/awaiting/i.test(st)){
    return `
    <div class="border border-gold-light/60 bg-gold-pale/50 rounded-md p-4">
      <div class="font-semibold text-forest-ink mb-1">Complete your OPay transfer</div>
      <p class="text-muted-strong text-sm mb-3">Transfer <b>${naira(o.total)}</b> to the OPay account below, then send your proof of payment:</p>
      <div class="text-sm mb-4">
        <span class="text-muted">Account Name:</span> <b>${CONFIG.opay.accountName || '—'}</b><br>
        <span class="text-muted">Account Number:</span> <b class="tracking-wider">${CONFIG.opay.accountNumber}</b> · <span class="text-muted">Bank:</span> OPay
      </div>
      <div class="flex flex-wrap gap-3">
        <a href="https://wa.me/${wa}?text=${encodeURIComponent('Hi Zorie Collectibles! I just paid '+naira(o.total)+' for order '+o.id+' via OPay transfer.')}" target="_blank" class="btn btn-gold btn-sm">Send proof on WhatsApp</a>
        <button data-confirm-pay onclick="orderPageConfirm('${o.id}')" class="btn btn-gold btn-sm">I have made payment</button>
      </div>
      <p class="text-[11px] text-muted mt-3">After you mark payment, we'll confirm your transfer and start preparing your order.</p>
    </div>`;
  }
  if(/verif/i.test(st)){
    return `<div class="border border-edge rounded-md p-4 text-sm text-muted-strong flex flex-wrap items-center justify-between gap-3">
      <div>Your payment proof has been received — we're verifying it now.</div>${waBtn}
    </div>`;
  }
  if(/handcraft/i.test(st)){
    return `<div class="border border-edge rounded-md p-4 text-sm text-muted-strong flex flex-wrap items-center justify-between gap-3">
      <div>Your payment is confirmed — we're handcrafting your order.</div>${waBtn}
    </div>`;
  }
  if(/way/i.test(st)){
    return `<div class="border border-edge rounded-md p-4 text-sm text-muted-strong flex flex-wrap items-center justify-between gap-3">
      <div>Your order is on its way (${(o.customer||{}).method||'delivery'}). Sit tight!</div>${waBtn}
    </div>`;
  }
  if(/delivered/i.test(st)){
    return `<div class="border border-edge rounded-md p-4 text-sm text-muted-strong flex flex-wrap items-center justify-between gap-3">
      <div>Your order has been delivered. Enjoy!</div>${waBtn}
    </div>`;
  }
  if(/cancel/i.test(st)){
    return `<div class="border border-edge rounded-md p-4 text-sm text-muted-strong flex flex-wrap items-center justify-between gap-3">
      <div>This order was cancelled. Need help? Chat with us.</div>${waBtn}
    </div>`;
  }
  return `<div class="border border-edge rounded-md p-4 text-sm text-muted-strong flex flex-wrap items-center justify-between gap-3">
    <div>Order is being processed. Updates will appear here.</div>${waBtn}
  </div>`;
}
let renderedOrderId = null;
let renderedOrderStatus = null;
let renderedOrderPayref = null;

async function renderOrderPage(params){
  const app = document.getElementById('app');
  const me = currentUser();
  if(!me){
    app.innerHTML = `
    <section class="max-w-md mx-auto px-6 py-16 text-center">
      <h1 class="serif text-3xl mb-3">Track Your Order</h1>
      <p class="text-sm text-muted mb-6">Sign in to view this order, or track it with your order number and email.</p>
      <a href="#account" class="btn btn-forest">Sign In</a>
      <a href="#track" class="btn btn-outline mt-3 w-full">Track Order</a>
    </section>`;
    return;
  }
  const id = params.id || '';
  app.innerHTML = `<div class="text-center py-28"><div class="mx-auto mb-5 w-8 h-8 border-2 border-edge border-t-gold rounded-full animate-spin"></div><p class="text-sm text-muted">Loading your order…</p></div>`;
  const order = await fetchOrder(id);
  if(!order){
    app.innerHTML = `
    <section class="max-w-md mx-auto px-6 py-16 text-center">
      <h1 class="serif text-3xl mb-3">Order not found</h1>
      <p class="text-sm text-muted mb-6">We couldn't find order ${id} in your account.</p>
      <a href="#account" class="btn btn-forest">Back to My Account</a>
    </section>`;
    return;
  }
  renderOrderPageHTML(order);
  maybePollOrder(order);
}

function renderOrderPageHTML(o){
  renderedOrderId = o.id;
  renderedOrderStatus = (o.status||'').trim();
  renderedOrderPayref = (o.payRef||o.payref||'')||'';
  const c = o.customer || {};
  const app = document.getElementById('app');
  app.innerHTML = `
  <section class="max-w-3xl mx-auto px-6 py-16">
    <a href="#account" class="text-xs text-gold underline mb-6 inline-block">&larr; Back to My Account</a>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
      <h1 class="serif text-3xl">Order ${o.id}</h1>
      ${orderStatusBadge(o.status)}
    </div>
    <div class="text-xs text-muted mb-8">Placed ${new Date(o.date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})} · ${orderPayLabel(o)}</div>

    <div class="border border-edge rounded-md p-5 mb-6">
      <div class="text-[11px] uppercase tracking-wideish text-gold mb-3">Delivery Status</div>
      ${statusTimelineHTML(o.status)}
    </div>

    ${orderPageActionsHTML(o)}

    <div class="grid sm:grid-cols-2 gap-6 mt-8">
      <div>
        <div class="text-[11px] uppercase tracking-wideish text-gold mb-2">Items</div>
        <div class="border border-edge rounded-md p-4 text-sm">
          ${(o.items||[]).map(i=>`
            <div class="flex justify-between gap-3 py-1">
              <div>${i.qty} × ${i.name}${i.size?` <span class="text-muted">(${i.size})</span>`:''}${i.note?` <span class="text-muted italic">"${i.note}"</span>`:''}</div>
              <div class="tabular-nums">${naira(i.lineTotal ?? i.price*i.qty)}</div>
            </div>`).join('') || '<div class="text-muted">No items</div>'}
          <div class="mt-2 pt-2 border-t border-edge-soft space-y-1">
            <div class="flex justify-between"><span>Subtotal</span><span class="tabular-nums">${naira(o.subtotal)}</span></div>
            <div class="flex justify-between"><span>Discount</span><span class="tabular-nums">${o.discount?('-'+naira(o.discount)):'—'}</span></div>
            <div class="flex justify-between"><span>Delivery</span><span class="tabular-nums">${Number(o.delivery)===0?'Free':naira(o.delivery)}</span></div>
            <div class="flex justify-between font-medium pt-1 border-t border-edge-soft"><span>Total</span><span class="tabular-nums">${naira(o.total)}</span></div>
          </div>
        </div>
      </div>
      <div>
        <div class="text-[11px] uppercase tracking-wideish text-gold mb-2">Delivery Details</div>
        <div class="border border-edge rounded-md p-4 text-sm text-ink space-y-1">
          <div>${c.name||'—'} · ${c.phone||'—'}</div>
          <div>${c.address||''}${c.city?', '+c.city:''}</div>
          <div>${c.method||''}</div>
        </div>
        <div class="text-[11px] uppercase tracking-wideish text-gold mb-2 mt-4">Payment</div>
        <div class="border border-edge rounded-md p-4 text-sm text-ink">${orderPayLabel(o)}${renderedOrderPayref?` · <span class="tabular-nums">${renderedOrderPayref}</span>`:''}</div>
      </div>
    </div>
  </section>`;
}

/* Poll while the order is still pending so the timeline updates when the
   admin changes the status. Stopped on navigation via router(). */
function maybePollOrder(o){
  stopOrderPoll();
  const st = (o.status||'').trim();
  if(!/awaiting|verif|handcraft|way/i.test(st) || !currentUser()) return;
  orderPollTimer = setInterval(async ()=>{
    const fresh = await fetchOrder(renderedOrderId);
    if(!fresh) return;
    const freshStatus = (fresh.status||'').trim();
    const freshPayref = (fresh.payRef||fresh.payref||'')||'';
    if(freshStatus!==renderedOrderStatus || freshPayref!==renderedOrderPayref){
      renderOrderPageHTML(fresh);
    }
    if(/delivered|cancel/i.test(freshStatus)) stopOrderPoll();
  }, 20000);
}

/* Order page: customer says they've paid — submit proof then re-render. */
async function orderPageConfirm(orderId){
  const btn = document.querySelector('[data-confirm-pay]');
  if(btn){ btn.disabled = true; btn.textContent = 'Submitting…'; }
  const ok = await submitPaymentProof(orderId);
  if(ok){
    toast('Payment proof sent — thank you!');
    const fresh = await fetchOrder(orderId);
    if(fresh) renderOrderPageHTML(fresh);
  } else {
    toast('Could not confirm here. Please message us on WhatsApp instead.');
    if(btn){ btn.disabled = false; btn.textContent = 'I have made payment'; }
  }
}

/* =========================================================================
   TRACK ORDER
   ========================================================================= */
function renderTrackOrder(){
  document.getElementById('app').innerHTML = `
  <section class="max-w-xl mx-auto px-6 py-20">
    <h1 class="serif text-3xl mb-2 text-center">Track Your Order</h1>
    <p class="text-sm text-muted text-center mb-8">Enter the order number and the email you used at checkout.</p>
    <form onsubmit="return trackOrder(event)" class="space-y-3 mb-6">
      <div>
        <label for="track-id">Order Number</label>
        <input type="text" id="track-id" placeholder="e.g. ZC-12345678" autocomplete="off" required>
      </div>
      <div>
        <label for="track-email">Email</label>
        <input type="email" id="track-email" placeholder="Email used at checkout" required autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false">
      </div>
      <button type="submit" class="btn btn-forest w-full">Track <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
    </form>
    <p class="text-xs text-muted text-center">Signed in? <a href="#account" class="text-gold underline">View my orders</a></p>
    <div id="track-result"></div>
  </section>`;
}
function trackOrderHTML(order){
  const viewLink = currentUser() ? `<a href="#order?id=${encodeURIComponent(order.id)}" class="text-xs text-gold underline">View full details &rarr;</a>` : '';
  return `
    <div class="border border-edge p-6">
      <div class="flex justify-between mb-3"><span class="text-sm text-muted-strong">Order ${order.id}</span><span class="text-sm bg-gold-pale text-forest-ink px-3 py-1">${order.status}</span></div>
      <div class="text-sm text-muted mb-4">Placed ${new Date(order.date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</div>
      ${order.items.map(i=>`<div class="text-sm py-1">${i.qty} × ${i.name}</div>`).join('')}
      <div class="flex items-center justify-between font-medium mt-3 pt-3 border-t border-edge-soft">
        <span>Total: ${naira(order.total)}</span>
        ${viewLink}
      </div>
    </div>`;
}
async function trackOrder(e){
  if(e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('track-id').value.trim();
  const email = (document.getElementById('track-email').value||'').trim().toLowerCase();
  const el = document.getElementById('track-result');
  const none = `<div class="text-center text-sm text-red-500">No order found with that number and email.</div>`;
  if(!id || !email){ el.innerHTML = none; return; }
  if(sb){
    try{
      const res = await sb.functions.invoke('checkout', { body:{ method:'track', orderId:id, email } });
      const ok = res && !res.error && res.data && res.data.ok;
      el.innerHTML = ok ? trackOrderHTML(normalizeOrder(res.data.order)) : none;
    }catch(err){ el.innerHTML = none; }
  } else {
    const order = DB.orders.find(o=>o.id===id && String((o.customer||{}).email||'').toLowerCase()===email);
    el.innerHTML = order ? trackOrderHTML(order) : none;
  }
}

/* =========================================================================
   ADMIN (Supabase Auth)
   ========================================================================= */
function openAdminLogin(){ openModal('admin-login-modal'); }
function togglePasswordVisibility(inputId, btn){
  const el = document.getElementById(inputId);
  if(!el) return;
  const show = el.type === 'password';
  el.type = show ? 'text' : 'password';
  const open = btn.querySelector('.eye-open'), closed = btn.querySelector('.eye-closed');
  if(open) open.classList.toggle('hidden', show);
  if(closed) closed.classList.toggle('hidden', !show);
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}
async function adminLogin(e){
  e.preventDefault();
  const pw = document.getElementById('admin-password').value;
  if(!sb){
    if(pw === (CONFIG.admin.demoPassword || 'zorie2026')){
      sessionStorage.setItem('zorie_admin','1');
      closeModal('admin-login-modal');
      router();
    } else { toast('Incorrect password'); }
    return false;
  }
  const { error } = await sb.auth.signInWithPassword({ email: CONFIG.admin.email, password: pw });
  if(error){ toast('Incorrect password'); return false; }
  sessionStorage.setItem('zorie_admin','1');
  closeModal('admin-login-modal');
  router();
  return false;
}
async function adminLogout(){
  if(sb){ await sb.auth.signOut(); }
  sessionStorage.removeItem('zorie_admin');
  router();
}

async function renderAdminGate(){
  const flag = sessionStorage.getItem('zorie_admin')==='1';
  let session = null;
  if(sb){ try{ const { data } = await sb.auth.getSession(); session = data.session || null; }catch(e){} }
  const authed = flag && (!sb || !!session);
  if(authed){ renderAdmin(); return; }
  document.getElementById('app').innerHTML = `<div class="max-w-sm mx-auto px-6 py-16 text-center">
    <a href="#home" aria-label="Back to store" title="Back to store" class="mx-auto mb-4 w-12 h-12 rounded-full bg-forest-dark flex items-center justify-center hover:bg-forest transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D8BC72" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>
    </a>
    <h1 class="serif text-2xl mb-2">Admin Access</h1>
    <p class="text-sm text-muted mb-6">Sign in to manage your store.</p>
    <button onclick="openAdminLogin()" class="btn btn-forest btn-sm">Sign In</button>
  </div>`;
}

let adminTab = sessionStorage.getItem('zorie_adminTab') || 'overview';
async function setAdminTab(t){
  const y = window.scrollY;
  adminTab = t;
  sessionStorage.setItem('zorie_adminTab', t);
  await renderAdmin();
  if(y) window.scrollTo({top:y, behavior:'instant' in window ? 'instant':'auto'});
}

const ADMIN_TABS = [
  ['overview','Dashboard','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'],
  ['reports','Reports','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/></svg>'],
  ['products','Products','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></svg>'],
  ['orders','Orders','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/></svg>'],
  ['customers','Customers','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'],
  ['mycustomers','My Customers','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.5 2-4 5-4s5 1.5 5 4"/></svg>'],
  ['discounts','Discounts','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'],
  ['newsletter','Newsletter','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/></svg>']
];

/* ---------- reports helpers ---------- */
let reportRange = 30;
function setReportRange(r){ reportRange = (r==='all' ? 'all' : Number(r)); renderAdmin(); }
function payLabel(m){
  m = (m||'').toLowerCase();
  if(m==='paystack') return 'Paystack';
  if(m==='opay') return 'OPay (Transfer)';
  return m || '—';
}
function statusBadge(s){
  s = s || '';
  const t = s.toLowerCase();
  let cls = 'bg-surface-soft text-muted-strong';
  if(t.includes('awaiting')) cls = 'bg-amber-100 text-amber-800';
  else if(t.includes('verif')) cls = 'bg-sky-100 text-sky-800';
  else if(t.includes('payment received')) cls = 'bg-teal-100 text-teal-800';
  else if(t.includes('handcraft')) cls = 'bg-gold-pale text-forest-ink';
  else if(t.includes('way')) cls = 'bg-forest-dark text-cream';
  else if(t.includes('delivered')) cls = 'bg-[#D2B48C] text-[#47301F]';
  else if(t.includes('cancelled')) cls = 'bg-red-100 text-red-700';
  return `<span class="inline-block ${cls} px-2 py-0.5 rounded-full text-[10px] font-semibold">${s}</span>`;
}
function statusPalette(s){
  const t = (s||'').toLowerCase();
  if(t.includes('awaiting')) return { bg:'#fef3c7', text:'#92400e', border:'#f59e0b' };
  if(t.includes('verif')) return { bg:'#e0f2fe', text:'#075985', border:'#38bdf8' };
  if(t.includes('payment received')) return { bg:'#ccfbf1', text:'#115e59', border:'#2dd4bf' };
  if(t.includes('handcraft')) return { bg:'#faf0dc', text:'#5c4033', border:'#d8bc72' };
  if(t.includes('way')) return { bg:'#5c4033', text:'#fbf7ec', border:'#5c4033' };
  if(t.includes('delivered')) return { bg:'#D2B48C', text:'#47301F', border:'#C9A06F' };
  if(t.includes('cancelled')) return { bg:'#fee2e2', text:'#b91c1c', border:'#f87171' };
  return { bg:'#f3f4f6', text:'#4b5563', border:'#d1d5db' };
}
function statusStyle(s){
  const p = statusPalette(s);
  return `background:${p.bg};color:${p.text};border-color:${p.border};font-weight:600;`;
}
function changeOrderStatus(id, sel){
  updateOrderStatus(id, sel.value);
  sel.style.cssText = statusStyle(sel.value);
}
function loadEmailStats(){
  if(!sb) return Promise.resolve(null);
  return sb.functions.invoke('checkout', { body:{ method:'email-stats' } })
    .then(res => (res && !res.error && res.data && res.data.ok) ? res.data : null)
    .catch(()=>null);
}
function downloadCSV(filename, rows){
  const csv = rows.map(r=>r.map(cell=>'"'+String(cell==null?'':cell).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
function filteredOrdersForRange(){
  const now = new Date();
  const from = reportRange==='all' ? null : new Date(now.getTime() - reportRange*86400000);
  return DB.orders.filter(o=>!from || new Date(o.date)>=from);
}
function exportOrdersCSV(){
  const rows = [['Order ID','Date','Customer','Phone','Email','City','Method','Payment','Items','Subtotal','Discount','Delivery','Total','Status']];
  filteredOrdersForRange().sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(o=>{
    rows.push([
      o.id,
      new Date(o.date).toLocaleDateString('en-NG'),
      (o.customer||{}).name||'', (o.customer||{}).phone||'', (o.customer||{}).email||'',
      (o.customer||{}).city||'', (o.customer||{}).method||'',
      payLabel(o.payMethod||o.paymethod),
      (o.items||[]).map(i=>`${i.qty} x ${i.name}`).join('; '),
      o.subtotal, o.discount, o.delivery, o.total, o.status
    ]);
  });
  downloadCSV('zorie-orders.csv', rows);
}
function exportSummaryCSV(){
  const orders = filteredOrdersForRange();
  const rows = [['Metric','Value']];
  rows.push(['Revenue (₦)', orders.reduce((s,o)=>s+Number(o.total||0),0)]);
  rows.push(['Orders', orders.length]);
  rows.push(['Items Sold', orders.reduce((s,o)=>s+(o.items||[]).reduce((x,i)=>x+Number(i.qty||0),0),0)]);
  rows.push([]);
  rows.push(['Payment Method','Orders','Revenue']);
  const pay = {};
  orders.forEach(o=>{ const m=(o.payMethod||o.paymethod)||'Other'; pay[m] = pay[m]||{n:0, rev:0}; pay[m].n++; pay[m].rev += Number(o.total||0); });
  Object.entries(pay).forEach(([m,v])=>rows.push([payLabel(m), v.n, v.rev]));
  rows.push([]);
  rows.push(['Category','Qty','Revenue']);
  const cat = {};
  orders.forEach(o=>(o.items||[]).forEach(i=>{
    const p = DB.products.find(x=>x.name===i.name);
    const c = p?p.cat:'Other';
    cat[c] = cat[c]||{qty:0, rev:0};
    cat[c].qty += Number(i.qty)||0;
    cat[c].rev += Number(i.lineTotal||0);
  }));
  Object.entries(cat).forEach(([c,v])=>rows.push([c, v.qty, v.rev]));
  downloadCSV('zorie-summary.csv', rows);
}

/* ---------- admin invoice (send as image via WhatsApp) ---------- */
let currentInvoiceId = '';
function phoneDigits(phone){
  let d = String(phone||'').replace(/\D/g,'');
  if(!d) return '';
  if(d.startsWith('0')) d = '234' + d.slice(1);
  return d.startsWith('234') ? d : d;
}
function adminInvoiceHTML(o){
  const c = o.customer||{};
  const pm = payLabel(o.payMethod||o.paymethod);
  return `
  <div id="admin-invoice-print" style="width:460px;max-width:100%;margin:0 auto;background:#fff;color:#26261F;font-family:'Jost',sans-serif;">
    <div style="text-align:center;padding:30px 26px 18px;border-bottom:3px double #B8912F;">
      <div style="font-family:'Cormorant Garamond',serif;font-size:29px;letter-spacing:.04em;color:#5C4033;">Zorie <span style="font-style:italic;color:#B8912F;">Collectibles</span></div>
      <div style="font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:#6b6552;margin-top:4px;">Jewellery That Tells Your Story</div>
      <div style="font-size:11px;color:#6b6552;margin-top:10px;">${CONFIG.store.phone} · ${CONFIG.store.email}</div>
    </div>
    <div style="padding:22px 26px;">
      <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:20px;font-size:12px;">
        <div>
          <div style="font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#B8912F;margin-bottom:4px;">Billed To</div>
          <div style="font-weight:600;">${c.name||''}</div>
          <div>${c.phone||''}</div>
          <div>${c.email||''}</div>
          <div>${c.address||''}${c.city?', '+c.city:''}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#B8912F;margin-bottom:4px;">Invoice</div>
          <div style="font-weight:600;">${o.id}</div>
          <div>${new Date(o.date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</div>
          <div style="margin-top:8px;"><span style="background:#F1E6C8;color:#5C4033;padding:3px 10px;font-size:11px;">${o.status}</span></div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="border-bottom:1px solid #E4DCC7;">
          <th style="text-align:left;padding:6px 4px;">Item</th>
          <th style="text-align:center;padding:6px 4px;">Qty</th>
          <th style="text-align:right;padding:6px 4px;">Amount</th>
        </tr></thead>
        <tbody>
        ${(o.items||[]).map(i=>`
          <tr style="border-bottom:1px solid #F1EBDB;">
            <td style="padding:8px 4px;">${i.name}${i.size?` <span style="color:#9a8f73;font-size:11px;">(${i.size})</span>`:''}${i.note?` <span style="color:#9a8f73;font-size:11px;font-style:italic;">&ldquo;${i.note}&rdquo;</span>`:''}</td>
            <td style="padding:8px 4px;text-align:center;">${i.qty}</td>
            <td style="padding:8px 4px;text-align:right;">${naira(i.lineTotal)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:16px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Subtotal</span><span>${naira(o.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Discount</span><span>${o.discount?('-'+naira(o.discount)):'—'}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span>Delivery</span><span>${o.delivery===0?'Free':naira(o.delivery)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 4px;border-top:2px solid #E4DCC7;font-weight:700;font-size:14px;"><span>Total</span><span>${naira(o.total)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:2px 0;color:#6b6552;"><span>Payment</span><span>${pm}</span></div>
      </div>
    </div>
    <div style="padding:16px 26px 24px;text-align:center;border-top:1px solid #E4DCC7;">
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;color:#5C4033;">Thank you for supporting handcrafted beauty.</div>
      <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#9a8f73;margin-top:6px;">${CONFIG.store.phone} · @zories_collectibles</div>
    </div>
  </div>`;
}
function openOrderInvoice(id){
  const o = DB.orders.find(x=>x.id===id);
  if(!o) return;
  currentInvoiceId = o.id;
  document.getElementById('admin-invoice-body').innerHTML = adminInvoiceHTML(o);
  const digits = phoneDigits((o.customer||{}).phone) || CONFIG.store.whatsapp;
  const msg = encodeURIComponent(`Hello ${(o.customer||{}).name||''}! Thank you for your order ${o.id}. Please find your invoice attached below. Total: ${naira(o.total)} — Zorie Collectibles`);
  document.getElementById('admin-invoice-wa').href = 'https://wa.me/' + digits + '?text=' + msg;
  openModal('admin-invoice-modal');
}
/* Load html2canvas on demand — only when generating an invoice PNG. */
function loadHtml2Canvas(){
  return new Promise((resolve)=>{
    if(typeof html2canvas !== 'undefined') return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.async = true;
    s.onload = ()=> resolve(typeof html2canvas !== 'undefined');
    s.onerror = ()=> resolve(false);
    document.head.appendChild(s);
  });
}
async function renderAdminInvoiceImage(){
  const el = document.getElementById('admin-invoice-print');
  if(!el) return null;
  if(typeof html2canvas === 'undefined' && !(await loadHtml2Canvas())) return null;
  return html2canvas(el, { scale:2, backgroundColor:'#ffffff', useCORS:true });
}
async function downloadAdminInvoice(){
  try{
    const canvas = await renderAdminInvoiceImage();
    if(!canvas){ toast('Image generator not loaded — please refresh.'); return; }
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'Zorie-Invoice-' + (currentInvoiceId||'order') + '.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }catch(e){ console.error(e); toast('Could not generate image.'); }
}
async function shareAdminInvoice(){
  if(!navigator.share || !navigator.canShare){
    toast('Sharing not supported here — use Download PNG'); return;
  }
  try{
    const canvas = await renderAdminInvoiceImage();
    if(!canvas) return;
    const blob = await new Promise(res=>canvas.toBlob(res, 'image/png'));
    const file = new File([blob], 'Zorie-Invoice-'+(currentInvoiceId||'order')+'.png', {type:'image/png'});
    if(!navigator.canShare({files:[file]})){ toast('Sharing not supported here — use Download PNG'); return; }
    await navigator.share({ files:[file], title:'Invoice '+currentInvoiceId, text:'Zorie Collectibles invoice' });
  }catch(e){ if(e.name!=='AbortError') console.error(e); }
}

async function renderAdmin(){
  await refreshAdminData();
  const products = DB.products;
  const orders = DB.orders;
  const discounts = DB.discounts;
  const totalSales = orders.reduce((s,o)=>s+Number(o.total||0),0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const customers = new Set(orders.map(o=>(o.customer||{}).email)).size;

  document.getElementById('app').innerHTML = `
  <div class="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-10 pb-14 sm:pb-10">
    <div class="flex items-center justify-between mb-4 md:mb-6">
      <div>
        <h1 class="serif text-2xl sm:text-3xl leading-none">Owner Dashboard</h1>
        <div class="text-xs text-muted-strong mt-1">Zorie Collectibles</div>
      </div>
      <button onclick="adminLogout()" class="btn btn-outline btn-xs">Sign out</button>
    </div>
    <div class="grid md:grid-cols-[210px_1fr] gap-5 md:gap-8 items-start">
      <aside class="min-w-0">
        <nav class="tab-scroll min-w-0 w-full max-w-full flex md:flex-col gap-1.5 overflow-x-auto overscroll-x-contain text-sm sticky top-16 md:top-24 z-30 bg-page/95 backdrop-blur px-1 py-2 pr-2 md:pr-0 -mx-1 md:mx-0 md:px-0 md:py-0">
          ${ADMIN_TABS.map(([k,l,icon])=>`
            <button onclick="setAdminTab('${k}')" class="shrink-0 flex items-center gap-2 px-4 py-2.5 md:py-2 whitespace-nowrap rounded-full md:rounded-md ${adminTab===k?'bg-forest-dark text-white shadow-lg shadow-forest/20':'text-forest-ink hover:bg-gold-pale'}">
              ${icon}<span>${l}</span>
            </button>`).join('')}
        </nav>
      </aside>
      <div id="admin-content" class="min-w-0"></div>
    </div>
  </div>`;

  const c = document.getElementById('admin-content');

  if(adminTab==='overview'){
    const avg = totalOrders ? Math.round(totalSales/totalOrders) : 0;
    // daily sales — last 14 days
    const daily = [...Array(14)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(13-i));
      const k=d.toDateString();
      const t=orders.filter(o=>new Date(o.date).toDateString()===k).reduce((s,o)=>s+Number(o.total||0),0);
      return { label:d.toLocaleDateString('en-NG',{day:'numeric',month:'short'}), t }; });
    const maxDay = Math.max(1, ...daily.map(d=>d.t));
    // top products
    const prodAgg = {};
    orders.forEach(o=>(o.items||[]).forEach(i=>{
      prodAgg[i.name] = prodAgg[i.name] || {qty:0, rev:0};
      prodAgg[i.name].qty += Number(i.qty)||0;
      prodAgg[i.name].rev += Number(i.lineTotal||0);
    }));
    const topProducts = Object.entries(prodAgg).sort((a,b)=>b[1].qty-a[1].qty).slice(0,5);
    const maxQty = Math.max(1, ...topProducts.map(([,v])=>v.qty));
    // payment split
    const pay = {};
    orders.forEach(o=>{ const m=(o.payMethod||o.paymethod)||'Other'; pay[m]=(pay[m]||0)+Number(o.total||0); });
    const payEntries = Object.entries(pay).sort((a,b)=>b[1]-a[1]);
    const maxPay = Math.max(1, ...payEntries.map(([,v])=>v));
    // low stock + recent
    const lowStock = products.filter(p=>p.stock<=5);
    const recent = orders.slice().reverse().slice(0,5);
    c.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <h2 class="serif text-2xl">Dashboard</h2>
        <button onclick="setAdminTab('reports')" class="btn btn-outline btn-sm">View Reports</button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        ${[
          ['Total Sales', naira(totalSales), '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>'],
          ['Orders', totalOrders, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/></svg>'],
          ['Avg Order', naira(avg), '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>'],
          ['Customers', customers, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>']
        ].map(([l,v,icon])=>`<div class="stat-card p-4 sm:p-5">
          <div class="flex items-center justify-between mb-2"><div class="text-xs tracking-wideish uppercase text-muted-strong">${l}</div>${icon}</div>
          <div class="serif text-xl sm:text-2xl">${v}</div>
        </div>`).join('')}
      </div>
      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <div class="stat-card p-6 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm text-muted">Sales — last 14 days</div>
            <div class="text-xs text-muted-strong">${naira(daily.reduce((s,d)=>s+d.t,0))}</div>
          </div>
          ${orders.length===0 ? `<div class="text-sm text-muted-strong">No orders yet. Once customers check out, sales will appear here.</div>` : `
          <div class="flex items-end gap-2 h-40">
            ${daily.map(d=>`
              <div class="flex-1 flex flex-col items-center justify-end h-full">
                <div class="w-full bg-gold rounded-t transition-colors duration-300 hover:bg-gold-light" style="height:${Math.max(3,(d.t/maxDay)*100)}%" title="${naira(d.t)}"></div>
                <div class="text-[9px] text-muted-strong mt-2">${d.label}</div>
              </div>`).join('')}
          </div>`}
        </div>
        <div class="stat-card p-6">
          <div class="text-sm text-muted mb-4">Payment Methods</div>
          ${payEntries.length? payEntries.map(([m,v])=>`
            <div class="mb-3">
              <div class="flex justify-between text-sm mb-1"><span>${payLabel(m)}</span><span class="font-medium">${naira(v)}</span></div>
              <div class="h-2 bg-surface-soft rounded-full overflow-hidden"><div class="h-full bg-gold rounded-full" style="width:${Math.round(v/maxPay*100)}%"></div></div>
            </div>`).join('') : '<div class="text-sm text-muted-strong">No data.</div>'}
        </div>
      </div>
      <div class="grid lg:grid-cols-3 gap-6">
        <div class="stat-card p-6">
          <div class="text-sm text-muted mb-4">Top Products</div>
          ${topProducts.length? topProducts.map(([name,v])=>`
            <div class="flex items-center gap-3 py-1.5">
              <div class="w-1.5 h-8 bg-gold rounded-full" style="opacity:${0.35+v.qty/maxQty*0.65}"></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm truncate">${name}</div>
                <div class="text-[11px] text-muted-strong">${v.qty} sold · ${naira(v.rev)}</div>
              </div>
            </div>`).join('') : '<div class="text-sm text-muted-strong">No sales yet.</div>'}
        </div>
        <div class="stat-card p-6">
          <div class="text-sm text-muted mb-4">Low Stock Alerts</div>
          ${lowStock.length? lowStock.map(p=>`
            <div class="flex items-center justify-between py-1.5 text-sm">
              <span class="truncate pr-2">${p.name}</span>
              <span class="${p.stock===0?'text-red-500 font-medium':'text-orange-700 font-medium'}">${p.stock===0?'Out of stock':p.stock+' left'}</span>
            </div>`).join('') : '<div class="text-sm text-muted-strong">All stocked up. Good job.</div>'}
        </div>
        <div class="stat-card p-6">
          <div class="text-sm text-muted mb-4">Recent Orders</div>
          ${recent.length? recent.map(o=>`
            <div class="flex items-center justify-between py-1.5 text-sm">
              <span class="truncate pr-2">${o.id}</span>
              <span class="whitespace-nowrap">${naira(o.total)} <span class="text-[10px] text-muted-strong ml-1">${o.status}</span></span>
            </div>`).join('') : '<div class="text-sm text-muted-strong">No orders yet.</div>'}
        </div>
      </div>
      <div class="mt-6 stat-card p-6">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm text-muted">Transactional Email</div>
          <span class="text-xs text-muted-strong">daily budget</span>
        </div>
        <div id="email-stats-box" class="text-sm text-muted-strong">Loading…</div>
      </div>`;
    loadEmailStats().then(es=>{
      const box = document.getElementById('email-stats-box');
      if(!box) return;
      if(!es){
        box.innerHTML = 'Email status is available when Supabase is connected and the checkout function is redeployed.';
        return;
      }
      const pct = es.budget ? Math.min(100, Math.round(es.sentToday/es.budget*100)) : 0;
      box.innerHTML = `
        <div class="h-2 bg-surface-soft rounded-full overflow-hidden mb-3"><div class="h-full bg-gold rounded-full" style="width:${pct}%"></div></div>
        <div class="space-y-1">
          <div class="flex justify-between"><span>Sent today</span><b>${es.sentToday} / ${es.budget}</b></div>
          <div class="flex justify-between"><span>Pending (waiting to send)</span><b>${es.pending}</b></div>
          <div class="flex justify-between"><span>Failed (won't send)</span><b class="${es.failed?'text-red-500':'text-muted-strong'}">${es.failed}</b></div>
        </div>`;
    });
  }

  else if(adminTab==='products'){
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 class="serif text-2xl">Products</h2>
        <button onclick="openProductForm()" class="btn btn-forest btn-sm">+ Add Product</button>
      </div>
      <div id="product-form-wrap" class="mb-8"></div>
      <div class="overflow-x-auto">
      <table class="admin-table w-full min-w-[640px] responsive">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
        ${products.map(p=>`
          <tr>
            <td class="flex items-center gap-3"><img src="${p.img}" class="w-10 h-12 object-cover">${p.name}</td>
            <td data-label="Category">${p.cat}</td>
            <td data-label="Price">${naira(p.price)}</td>
            <td data-label="Stock">${p.stock>0?p.stock:`<span class="text-red-500">Out of stock</span>`}</td>
            <td data-label="Actions" class="space-x-3">
              <button onclick="openProductForm('${p.id}')" class="text-forest-ink underline text-xs">Edit</button>
              <button onclick="deleteProduct('${p.id}')" class="text-red-500 underline text-xs">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
      </div>`;
  }

  else if(adminTab==='orders'){
    c.innerHTML = `
      <h2 class="serif text-2xl mb-6">Orders</h2>
      <div class="overflow-x-auto">
      <table class="admin-table w-full min-w-[640px] responsive">
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
        ${orders.slice().reverse().map(o=>`
          <tr>
            <td>${o.id}<span class="md:hidden block mt-1.5">${statusBadge(o.status)}</span></td>
            <td data-label="Customer">${(o.customer||{}).name||'—'}<br><span class="text-xs text-muted-strong">${(o.customer||{}).email||''}</span></td>
            <td data-label="Total">${naira(o.total)}</td>
            <td data-label="Status">
              <select id="st-sel-${o.id}" onchange="changeOrderStatus('${o.id}', this)" class="!w-auto !py-1 text-xs rounded-md" style="${statusStyle(o.status)}">
                ${['Awaiting Payment','Verifying Your Payment','Payment Received','Being Handcrafted','On Its Way','Delivered','Cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </td>
            <td data-label="Date">${new Date(o.date).toLocaleDateString('en-NG')}</td>
            <td data-label="Actions"><button onclick="openOrderInvoice('${o.id}')" class="text-forest-ink underline text-xs">Invoice</button></td>
          </tr>`).join('')}
        ${orders.length===0?'<tr><td colspan="6" class="text-center text-muted-strong py-8">No orders yet.</td></tr>':''}
        </tbody>
      </table>
      </div>`;
  }

  else if(adminTab==='customers'){
    const byEmail = {};
    orders.forEach(o=>{
      const em = (o.customer||{}).email;
      if(!em) return;
      const key = em.toLowerCase();
      if(!byEmail[key]) byEmail[key] = {...(o.customer||{}), email: em, orders:0, spent:0};
      byEmail[key].orders += 1;
      byEmail[key].spent += Number(o.total||0);
    });
    const list = Object.values(byEmail);
    c.innerHTML = `
      <h2 class="serif text-2xl mb-6">Customers</h2>
      <div class="overflow-x-auto">
      <table class="admin-table w-full min-w-[560px] responsive">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th></tr></thead>
        <tbody>
          ${list.map(cu=>`<tr><td>${cu.name}</td><td data-label="Email">${cu.email}</td><td data-label="Phone">${cu.phone||'—'}</td><td data-label="Orders">${cu.orders}</td><td data-label="Total Spent">${naira(cu.spent)}</td></tr>`).join('')}
          ${list.length===0?'<tr><td colspan="5" class="text-center text-muted-strong py-8">No customers yet.</td></tr>':''}
        </tbody>
      </table>
      </div>`;
  }

  else if(adminTab==='newsletter'){
    const subs = DB.subscribers || [];
    const target = 50;
    const pct = Math.min(100, Math.round(subs.length/target*100));
    const unlocked = subs.length >= target;
    c.innerHTML = `
      <h2 class="serif text-2xl mb-6">Newsletter</h2>
      <div class="stat-card p-6 mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm text-muted">Waitlist progress</div>
          <b>${subs.length} / ${target}</b>
        </div>
        <div class="h-2 bg-surface-soft rounded-full overflow-hidden mb-3"><div class="h-full bg-gold rounded-full" style="width:${pct}%"></div></div>
        ${unlocked
          ? `<p class="text-sm text-forest-ink">The waitlist is full — newsletter sending is unlocked.</p>`
          : `<p class="text-sm text-muted-strong">The newsletter stays locked until the waitlist reaches <b>${target}</b> subscribers. ${subs.length===0?'Share the footer signup form to start collecting emails.':`Keep collecting — <b>${target-subs.length}</b> more to go.`}</p>`}
      </div>
      <div class="stat-card p-6">
        <label>Subject</label>
        <input type="text" id="nl-subject" placeholder="New arrivals at Zorie Collectibles" class="w-full mb-4" autocomplete="off">
        <label>Message</label>
        <textarea id="nl-body" rows="6" placeholder="Hi there,&#10;&#10;..." class="w-full mb-4"></textarea>
        <button id="nl-send-btn" onclick="sendNewsletterAdmin()" class="btn btn-forest ${unlocked?'':'opacity-40'}" ${unlocked?'':'disabled'}>Send newsletter to ${subs.length} subscribers</button>
        <div id="nl-status" class="text-sm mt-3"></div>
      </div>
      <h3 class="serif text-xl mt-8 mb-3">Subscribers (${subs.length})</h3>
      <div class="text-sm text-muted-strong space-y-1">${subs.map(s=>`<div>${s}</div>`).join('') || '<div class="text-muted-strong">None yet.</div>'}</div>`;
  }

  else if(adminTab==='mycustomers'){
    let registered = [];
    let warn = '';
    if(sb){
      try{
        const res = await sb.functions.invoke('checkout', { body:{ method:'customers' } });
        if(res && !res.error && res.data && res.data.ok && Array.isArray(res.data.customers)){
          registered = res.data.customers;
        } else if(res && !res.error && res.data && res.data.ok && !Array.isArray(res.data.customers)){
          warn = 'Your deployed <b>checkout</b> edge function is outdated (it does not have the customer list yet). Redeploy it with: <code>supabase functions deploy checkout --no-verify-jwt</code>';
        } else {
          let em = (res && res.error && res.error.message) || 'request failed';
          try{
            const resp = res.error && res.error.context;
            if(resp && typeof resp.clone === 'function'){
              const t = await resp.clone().json();
              if(t && t.error) em = t.error;
            }
          }catch(_){}
          if(em === 'unauthorized'){
            await sb.auth.signOut().catch(()=>{});
            sessionStorage.removeItem('zorie_admin');
            renderAdminGate();
            return;
          }
          warn = 'Could not load customers (' + em + '). ' + (em === 'forbidden'
            ? 'Your admin sign-in is missing the <b>role: admin</b> claim (App metadata) in Supabase. Add it, then sign out and back in.'
            : 'Please refresh the page and try again.');
        }
      }catch(e){ warn = 'Could not load registered customers (connection error). Please try again.'; }
    } else {
      registered = ls.get('zorie_users', []).map(u=>({ full_name:u.full_name, email:u.email, phone:u.phone, created_at:u.created_at }));
    }
    c.innerHTML = `
      <h2 class="serif text-2xl mb-6">My Customers <span class="text-sm font-normal text-muted">(${registered.length} registered)</span></h2>
      ${warn ? `<div class="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md p-4 mb-6">${warn}</div>` : ''}
      <div class="overflow-x-auto">
      <table class="admin-table w-full min-w-[420px] responsive">
        <thead><tr><th>Full Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>
          ${registered.map(r=>`<tr><td>${r.full_name||'—'}</td><td data-label="Email">${r.email||'—'}</td><td data-label="Phone">${r.phone||'—'}</td></tr>`).join('')}
          ${registered.length===0 && !warn ? '<tr><td colspan="3" class="text-center text-muted-strong py-8">No registered customers yet.</td></tr>':''}
        </tbody>
      </table>
      </div>`;
  }

  else if(adminTab==='discounts'){
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 class="serif text-2xl">Discount Codes</h2>
        <button onclick="addDiscount()" class="btn btn-forest btn-sm">+ New Code</button>
      </div>
      <div class="overflow-x-auto">
      <table class="admin-table w-full min-w-[420px] responsive">
        <thead><tr><th>Code</th><th>Discount</th><th>Status</th><th></th></tr></thead>
        <tbody>
        ${discounts.map((d,i)=>`
          <tr>
            <td class="font-semibold">${d.code}</td>
            <td data-label="Discount">${d.pct}%</td>
            <td data-label="Status">
              <button type="button" onclick="toggleDiscount(${i})" class="flex flex-col items-start gap-1.5 cursor-pointer bg-transparent border-0 p-0" aria-label="Toggle ${d.code}">
                <span class="relative inline-block w-9 h-5 rounded-full transition ${d.active?'bg-forest':'bg-surface-soft'}">
                  <span class="absolute top-0.5 w-4 h-4 rounded-full bg-surface shadow transition-transform ${d.active?'translate-x-4':'translate-x-0.5'}"></span>
                </span>
                <span class="text-xs whitespace-nowrap ${d.active?'text-forest-ink font-medium':'text-muted'}">${d.active?'Active':'Inactive'}</span>
              </button>
            </td>
            <td data-label=""><button onclick="removeDiscount(${i})" class="text-red-500 underline text-xs">Remove</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      </div>`;
  }

  else if(adminTab==='reports'){
    const now = new Date();
    const from = reportRange==='all' ? null : new Date(now.getTime() - reportRange*86400000);
    const filtered = orders.filter(o=>!from || new Date(o.date)>=from).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
    const rev = filtered.reduce((s,o)=>s+Number(o.total||0),0);
    const items = filtered.reduce((s,o)=>s+(o.items||[]).reduce((x,i)=>x+Number(i.qty||0),0),0);
    const avg = filtered.length ? Math.round(rev/filtered.length) : 0;
    // payment split
    const paySplit = {};
    filtered.forEach(o=>{ const m=(o.payMethod||o.paymethod)||'Other'; paySplit[m]=(paySplit[m]||0)+Number(o.total||0); });
    const payRows = Object.entries(paySplit).sort((a,b)=>b[1]-a[1]);
    // category split
    const catSplit = {};
    filtered.forEach(o=>(o.items||[]).forEach(i=>{
      const p = products.find(x=>x.name===i.name);
      const cat = p?p.cat:'Other';
      if(!catSplit[cat]) catSplit[cat] = {qty:0, rev:0};
      catSplit[cat].qty += Number(i.qty)||0;
      catSplit[cat].rev += Number(i.lineTotal||0);
    }));
    const catRows = Object.entries(catSplit).sort((a,b)=>b[1].rev-a[1].rev);
    const ranges = [['7','Last 7 days'],['30','Last 30 days'],['90','Last 90 days'],['all','All time']];
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 class="serif text-2xl">Reports</h2>
        <div class="flex items-center gap-2 flex-wrap">
          ${ranges.map(([v,l])=>`<button onclick="setReportRange('${v}')" class="btn btn-forest btn-xs ${String(reportRange)===v?'':'opacity-70'}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        ${[
          ['Revenue', naira(rev), '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>'],
          ['Orders', filtered.length, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/></svg>'],
          ['Items Sold', items, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/></svg>'],
          ['Avg Order', naira(avg), '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8912F" stroke-width="1.8"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>']
        ].map(([l,v,icon])=>`<div class="stat-card p-4 sm:p-5">
          <div class="flex items-center justify-between mb-2"><div class="text-xs tracking-wideish uppercase text-muted-strong">${l}</div>${icon}</div>
          <div class="serif text-xl sm:text-2xl">${v}</div>
        </div>`).join('')}
      </div>
      <div class="flex flex-wrap gap-3 mb-8">
        <button onclick="exportOrdersCSV()" class="btn btn-forest btn-sm">Export Orders CSV</button>
        <button onclick="exportSummaryCSV()" class="btn btn-forest btn-sm">Export Summary CSV</button>
      </div>
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="stat-card p-6">
          <div class="text-sm text-muted mb-4">Payment Methods</div>
          ${payRows.length? payRows.map(([m,v])=>`<div class="flex items-center justify-between py-1 text-sm"><span>${payLabel(m)}</span><span class="font-medium">${naira(v)}</span></div>`).join('') : '<div class="text-sm text-muted-strong">No data.</div>'}
        </div>
        <div class="stat-card p-6">
          <div class="text-sm text-muted mb-4">Sales by Category</div>
          ${catRows.length? catRows.map(([cat,v])=>`<div class="flex items-center justify-between py-1 text-sm"><span class="truncate pr-2">${cat}</span><span class="font-medium whitespace-nowrap">${naira(v.rev)} <span class="text-muted-strong">(${v.qty})</span></span></div>`).join('') : '<div class="text-sm text-muted-strong">No data.</div>'}
        </div>
      </div>
      <div class="overflow-x-auto">
      <table class="admin-table w-full min-w-[720px] responsive">
        <thead><tr><th>Date</th><th>Order</th><th>Customer</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
        ${filtered.slice().reverse().map(o=>`
          <tr>
            <td>${new Date(o.date).toLocaleDateString('en-NG')}</td>
            <td data-label="Order">${o.id}</td>
            <td data-label="Customer">${(o.customer||{}).name||'—'}</td>
            <td data-label="Payment">${payLabel(o.payMethod||o.paymethod)}</td>
            <td data-label="Total">${naira(o.total)}</td>
            <td data-label="Status">${statusBadge(o.status)}</td>
          </tr>`).join('')}
        ${filtered.length===0?'<tr><td colspan="6" class="text-center text-muted-strong py-8">No orders in this period.</td></tr>':''}
        </tbody>
      </table>
      </div>`;
  }
}

function openProductForm(id){
  const p = id ? findProduct(id) : null;
  const wrap = document.getElementById('product-form-wrap');
  wrap.innerHTML = `
    <form onsubmit="return saveProduct(event, '${id||''}')" class="bg-surface border border-edge rounded-xl p-5 sm:p-6 grid sm:grid-cols-2 gap-4 shadow-sm" autocomplete="off">
      <div><label>Name</label><input type="text" id="pf-name" value="${p?p.name:''}" required></div>
      <div><label>Category</label>
        <select id="pf-cat">${CATEGORIES.map(c=>`<option ${p&&p.cat===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div><label>Price (₦)</label><input type="number" id="pf-price" value="${p?p.price:''}" required inputmode="decimal"></div>
      <div><label>Stock</label><input type="number" id="pf-stock" value="${p?p.stock:10}" required></div>
      <div class="sm:col-span-2">
        <label>Product Image</label>
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
          <div id="pf-img-preview" class="w-20 h-24 rounded-sm border border-edge overflow-hidden flex-shrink-0 ${p&&p.img?'':'hidden'}">
            ${p&&p.img?`<img src="${p.img}" class="w-full h-full object-cover">`:''}
          </div>
          <div class="flex-1">
            <label for="pf-img-file" class="inline-flex items-center gap-2 cursor-pointer btn btn-outline btn-sm !mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
              Upload Image
            </label>
            <input type="file" id="pf-img-file" accept="image/*" onchange="onProductImagePicked(event)" class="sr-only">
            <input type="hidden" id="pf-img" value="${p?p.img:''}">
            <div id="pf-img-note" class="text-[11px] text-muted-strong mt-1.5">Click “Upload Image” to choose a JPG or PNG (max 5MB) — it will be resized automatically. In live mode images are stored in Supabase Storage; in demo mode they are embedded in this browser.</div>
          </div>
        </div>
      </div>
      <div class="sm:col-span-2"><label>Description</label><textarea id="pf-desc" rows="2">${p?p.desc:''}</textarea></div>
      <div class="sm:col-span-2"><label>Sizes / Options (comma separated)</label><input type="text" id="pf-sizes" value="${p?p.sizes.join(', '):'One size'}" autocomplete="off"></div>
      <div class="sm:col-span-2 flex items-center gap-2">
        <input type="checkbox" id="pf-custom" ${p&&p.customizable?'checked':''}>
        <label for="pf-custom" class="!mb-0 !text-sm">Customizable — allow a name / word personalization at checkout</label>
      </div>
      <div class="sm:col-span-2 flex gap-3">
        <button class="btn btn-forest">Save Product <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        <button type="button" onclick="document.getElementById('product-form-wrap').innerHTML=''" class="btn btn-outline btn-sm">Cancel</button>
      </div>
    </form>`;
}
function onProductImagePicked(e){
  const file = e.target.files && e.target.files[0];
  if(!file) return;
  if(file.size > 5*1024*1024){ toast('Image is too large — maximum 5MB'); e.target.value=''; return; }
  const reader = new FileReader();
  reader.onload = ev=>{
    const img = new Image();
    img.onload = ()=>{
      const max = 900;
      const ratio = Math.min(1, max/Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width*ratio));
      canvas.height = Math.max(1, Math.round(img.height*ratio));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      setProductImage(canvas.toDataURL('image/jpeg', .85));
    };
    img.onerror = ()=>{ toast('Could not read that image.'); e.target.value=''; };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}
async function setProductImage(dataUrl){
  const note = document.getElementById('pf-img-note');
  const wrap = document.getElementById('pf-img-preview');
  if(note) note.textContent = 'Uploading image…';
  let finalUrl = dataUrl;
  if(sb){
    try{
      const blob = await (await fetch(dataUrl)).blob();
      const path = 'product-' + uid() + '.jpg';
      const { error } = await sb.storage.from('product-images').upload(path, blob, { contentType:'image/jpeg', upsert:true });
      if(error) throw error;
      finalUrl = sb.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }catch(err){
      console.warn('Storage upload failed — using embedded image.', err);
    }
  }
  document.getElementById('pf-img').value = finalUrl;
  if(wrap){ wrap.classList.remove('hidden'); wrap.innerHTML = `<img src="${finalUrl}" class="w-full h-full object-cover">`; }
  if(note) note.textContent = 'Image attached — save the product to apply it.';
}
async function saveProduct(e, id){
  e.preventDefault();
  const products = DB.products;
  const data = {
    name: document.getElementById('pf-name').value,
    cat: document.getElementById('pf-cat').value,
    price: Number(document.getElementById('pf-price').value),
    stock: Number(document.getElementById('pf-stock').value),
    img: document.getElementById('pf-img').value || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800',
    desc: document.getElementById('pf-desc').value,
    sizes: document.getElementById('pf-sizes').value.split(',').map(s=>s.trim()).filter(Boolean),
    tags: [],
    customizable: document.getElementById('pf-custom').checked
  };
  if(id){
    const idx = products.findIndex(p=>p.id===id);
    products[idx] = {...products[idx], ...data};
  } else {
    products.push({id:'p'+uid(), ...data});
  }
  DATA.products = products;
  if(sb){ try{ await sb.from('products').upsert(products.map(toRow)); }catch(e){ console.warn('sync products', e); } }
  else { ls.set('zorie_products', products); }
  document.getElementById('product-form-wrap').innerHTML = '';
  toast('Product saved');
  renderAdmin();
  return false;
}
async function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  DATA.products = DB.products.filter(p=>p.id!==id);
  if(sb){ try{ await sb.from('products').delete().eq('id', id); }catch(e){ console.warn('sync delete', e); } }
  else { ls.set('zorie_products', DATA.products); }
  toast('Product deleted');
  renderAdmin();
}
async function updateOrderStatus(id, status){
  const orders = DB.orders;
  const o = orders.find(o=>o.id===id);
  if(!o) return;
  o.status = status;
  if(sb){ try{ await sb.from('orders').update({status}).eq('id', id); }catch(e){ console.warn('sync status', e); } }
  else { DB.orders = orders; }
  toast('Order updated');
}
function addDiscount(){
  document.getElementById('nd-code').value = '';
  document.getElementById('nd-pct').value = '';
  document.getElementById('nd-active').checked = true;
  openModal('discount-modal');
  setTimeout(()=>document.getElementById('nd-code').focus(), 50);
}
async function createDiscount(e){
  e.preventDefault();
  const code = document.getElementById('nd-code').value.trim().toUpperCase();
  const pct = Number(document.getElementById('nd-pct').value);
  const active = document.getElementById('nd-active').checked;
  if(!code || !pct || pct<1 || pct>100){ toast('Enter a valid code and percentage (1–100)'); return false; }
  const discounts = DB.discounts;
  if(discounts.some(d=>d.code.toUpperCase()===code)){ toast('That code already exists'); return false; }
  discounts.push({code, pct, active});
  DB.discounts = discounts;
  closeModal('discount-modal');
  await renderAdmin();
  toast(active ? `Code ${code} created and activated` : `Code ${code} created (inactive)`);
  return false;
}
async function toggleDiscount(i){
  const discounts = DB.discounts;
  if(!discounts[i]) return;
  discounts[i].active = !discounts[i].active;
  DB.discounts = discounts;
  await renderAdmin();
  toast(discounts[i].active ? `Code ${discounts[i].code} activated` : `Code ${discounts[i].code} deactivated`);
}
async function removeDiscount(i){
  const discounts = DB.discounts;
  const removed = discounts.splice(i,1)[0];
  DB.discounts = discounts;
  if(sb && removed){ try{ await sb.from('discounts').delete().eq('code', removed.code); }catch(e){ console.warn('sync discounts', e); } }
  await renderAdmin();
}

/* =========================================================================
   TRUST PAGES (policies, FAQ, contact)
   ========================================================================= */
const POLICIES = {
  shipping: {
    title: 'Shipping & Returns', icon: '🚚',
    body: `
      <h3>Delivery</h3>
      <p>We deliver nationwide across Nigeria. Orders ship within 2–4 business days of confirmation. Free home delivery in Lagos on orders above ₦50,000; otherwise home delivery costs ₦10,000 and pickup at any of our locations costs ₦4,000.</p>
      <h3>Order Tracking</h3>
      <p>Use the <a href="#track" class="underline">Track Order</a> page with your order number to see the latest status.</p>
      <h3>Returns</h3>
      <p>Because every piece is handmade and many are personalized, we only accept returns on unused, non-personalized items within 7 days of delivery. Items must be returned in their original packaging. Personalized pieces and sale items are final sale.</p>
      <h3>Customs & Personalization</h3>
      <p>Customized name bracelets take a little longer to craft. We confirm your spelling with you before we begin.</p>`
  },
  returns: {
    title: 'Returns & Exchanges', icon: '↩️',
    body: `
      <h3>How to start a return</h3>
      <p>Email <a href="mailto:zoriecollectibles@gmail.com" class="underline">zoriecollectibles@gmail.com</a> within 7 days of delivery with your order number. We will confirm and give you the return address in Lagos.</p>
      <h3>Refunds</h3>
      <p>Once we receive and inspect the item, refunds are processed within 5–7 business days to your original payment method.</p>
      <h3>Damaged or wrong item</h3>
      <p>If your order arrives damaged or incorrect, send us a photo within 48 hours and we will remake or refund it at no cost to you.</p>`
  },
  privacy: {
    title: 'Privacy Policy', icon: '🔒',
    body: `
      <h3>What we collect</h3>
      <p>We collect only what is needed to fulfil your order: your name, phone number, email, delivery address, and payment reference. We never store your card details.</p>
      <h3>How we use it</h3>
      <p>Your details are used to process orders, arrange delivery, and send order updates. If you subscribe to the newsletter, we use your email to send occasional updates.</p>
      <h3>Your rights</h3>
      <p>You may ask us to view, correct or delete your personal data at any time by emailing <a href="mailto:zoriecollectibles@gmail.com" class="underline">zoriecollectibles@gmail.com</a>.</p>`
  },
  terms: {
    title: 'Terms of Service', icon: '📜',
    body: `
      <h3>Products</h3>
      <p>All items are handmade and may vary slightly from photos. We describe materials honestly, and colours may differ a little on your screen.</p>
      <h3>Pricing & Payment</h3>
      <p>Prices are shown in Nigerian Naira (₦). Payment is made by bank transfer to our OPay account at checkout. Promo codes must be applied at checkout and cannot be combined in ways not stated.</p>
      <h3>Limitation of liability</h3>
      <p>Zorie Collectibles is not liable for delays caused by courier partners beyond our reasonable control, or for misuse of jewellery.</p>`
  }
};

function renderPolicies(page){
  const p = POLICIES[page] || POLICIES.shipping;
  document.getElementById('app').innerHTML = `
  <section class="bg-forest-dark text-cream py-14 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold-light mb-2">Store Policies</div>
    <h1 class="serif text-4xl sm:text-5xl">${p.title}</h1>
  </section>
  <section class="max-w-3xl mx-auto px-6 py-14">
    <nav class="flex flex-wrap gap-2 mb-10">
      ${Object.entries(POLICIES).map(([k,v])=>`<a href="#policies/${k}" class="text-xs tracking-wideish uppercase px-4 py-2 border ${page===k?'border-gold text-gold':'border-edge text-muted hover:border-gold'}">${v.title}</a>`).join('')}
    </nav>
    <div class="policy-body">${p.body}</div>
  </section>`;
}

function renderFaq(){
  const faqs = [
    ['How long does delivery take?','Orders ship within 2–4 business days. Lagos delivery is usually 1–3 days after dispatch; other states 2–6 days depending on location.'],
    ['Do you deliver outside Nigeria?','Not yet. We currently deliver nationwide in Nigeria, with free Lagos pickup available.'],
    ['Can I personalize a bracelet?','Yes. Choose any piece marked as customizable and add your name or word at checkout (up to 14 characters).'],
    ['How do I pay?','By bank transfer to our OPay account at checkout. We confirm once your payment proof arrives.'],
    ['How do I track my order?','Open the Track Order page and enter your order number (e.g. ZC-12345678) and the email you used at checkout.'],
    ['What if I receive a damaged item?','Contact us within 48 hours with a photo and we will remake or refund it free of charge.'],
    ['Do you offer gift wrapping?','Yes — every order is packed with care and many pieces are ready to gift. Mention a gift note at checkout and we will add it.'],
    ['Can I cancel my order?','If your order has not been shipped yet, email us and we will cancel and refund it. Personalized pieces enter production quickly, so act fast.']
  ];
  document.getElementById('app').innerHTML = `
  <section class="bg-forest-dark text-cream py-14 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold-light mb-2">Help</div>
    <h1 class="serif text-4xl sm:text-5xl">Frequently Asked Questions</h1>
  </section>
  <section class="max-w-3xl mx-auto px-6 py-14">
    <div class="space-y-3">
      ${faqs.map(([q,a])=>`
        <details class="border border-edge px-5 py-4">
          <summary class="serif text-lg cursor-pointer">${q}</summary>
          <p class="text-sm text-muted-strong leading-relaxed pt-3">${a}</p>
        </details>`).join('')}
    </div>
    <div class="text-center mt-12">
      <p class="text-sm text-muted mb-4">Still have questions?</p>
      <a href="#contact" class="btn btn-forest">Contact Us</a>
    </div>
  </section>`;
}

function renderContact(){
  const s = CONFIG.store;
  document.getElementById('app').innerHTML = `
  <section class="bg-forest-dark text-cream py-14 text-center">
    <div class="text-xs tracking-wideish uppercase text-gold-light mb-2">We're Here to Help</div>
    <h1 class="serif text-4xl sm:text-5xl">Contact Zorie Collectibles</h1>
  </section>
  <section class="max-w-5xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-12">
    <div>
      <h3 class="serif text-2xl mb-4">Send us a message</h3>
      <form onsubmit="return submitContact(event)" class="space-y-4">
        <div><label>Name</label><input type="text" id="ct-name" required autocomplete="name"></div>
        <div><label>Email</label><input type="email" id="ct-email" required autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
        <div><label>Message</label><textarea id="ct-message" rows="4" required></textarea></div>
        <button class="btn btn-forest w-full">Send Message <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
      </form>
      <div id="contact-msg" class="text-sm mt-3"></div>
    </div>
    <div class="space-y-6">
      <h3 class="serif text-2xl">Get in touch</h3>
      <div class="text-sm text-muted-strong space-y-3">
        <div>📧 <a href="mailto:${s.email}" class="text-forest-ink underline">${s.email}</a></div>
        <div>📞 <a href="tel:${s.phone.replace(/\s/g,'')}" class="text-forest-ink underline">${s.phone}</a></div>
        <div>💬 <a href="https://wa.me/${s.whatsapp}" target="_blank" class="text-forest-ink underline">WhatsApp us</a> — fastest response</div>
        <div>📍 Lagos, Nigeria</div>
      </div>
      <div class="border border-edge p-5 text-sm text-muted-strong">
        <div class="font-medium text-forest-ink mb-2">Opening hours</div>
        Monday – Saturday · 9am – 7pm (WAT)
      </div>
      <div class="border border-edge p-5 text-sm text-muted-strong">
        <div class="font-medium text-forest-ink mb-2">Order support</div>
        For order updates or tracking help, include your order number in your message.
      </div>
    </div>
  </section>`;
}

function submitContact(e){
  e.preventDefault();
  const data = {
    name: document.getElementById('ct-name').value.trim(),
    email: document.getElementById('ct-email').value.trim(),
    message: document.getElementById('ct-message').value.trim()
  };
  const el = document.getElementById('contact-msg');
  const done = ()=>{ el.textContent = 'Thank you! We will get back to you soon.'; el.className='text-sm mt-3 text-forest-ink'; document.getElementById('ct-name').value=''; document.getElementById('ct-email').value=''; document.getElementById('ct-message').value=''; };
  const fail = ()=>{ el.textContent = 'Something went wrong — please email us directly.'; el.className='text-sm mt-3 text-red-500'; };
  if(sb){
    sb.functions.invoke('contact', { body: data }).then(res=> res.error ? fail() : done()).catch(()=>{
      sb.from('contact_messages').insert(data).then(({error})=> error ? fail() : done()).catch(fail);
    });
  } else { done(); }
  return false;
}

/* Fill footer / WhatsApp links from config */
function socialHref(v, prefix){
  if(!v) return '#';
  return /^https?:\/\//i.test(v) ? v : prefix + v;
}
function applyConfig(){
  const s = CONFIG.store;
  const wa = document.getElementById('wa-float');
  const fw = document.getElementById('footer-wa');
  if(wa) wa.href = 'https://wa.me/' + s.whatsapp;
  if(fw) fw.href = 'https://wa.me/' + s.whatsapp;
  const ph = document.getElementById('footer-phone');
  if(ph) ph.textContent = s.phone;
  const em = document.getElementById('footer-email');
  if(em){ em.textContent = s.email; em.href = 'mailto:' + s.email; }
  const ig = document.getElementById('footer-ig');
  if(ig) ig.href = socialHref(s.instagram, 'https://instagram.com/');
  const fb = document.getElementById('footer-fb');
  if(fb) fb.href = socialHref(s.facebook, 'https://facebook.com/');
  const tx = document.getElementById('footer-x');
  if(tx) tx.href = socialHref(s.twitter, 'https://x.com/');
  const tt = document.getElementById('footer-tiktok');
  if(tt) tt.href = socialHref(s.tiktok, 'https://www.tiktok.com/@');
}

/* =========================================================================
   INIT
   ========================================================================= */
applyConfig();
applyThemeColor();
updateBadges();
initAuth();
router();
loadRemote().then(()=>{ updateBadges(); router(); }).catch(()=>{});
