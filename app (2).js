/* ScamCatch Shield: demo app. Vanilla JS, no build step. State persists in localStorage. */
const KEY = 'scamcatch-v1', HOTLINE = '1326', CARE_LINE = '1326'; // TODO: replace CARE_LINE with the real Care Specialist number
const $app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
const today = () => new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

const fresh = () => ({
  mode: null, step: 'mode', tab: 'home', setup: false, sim: 0, alert: null, toast: '',
  reg: { role: 'Guardian', name: 'Rina Corazon', mobile: '+63 919 888 2211', age: '42', rel: 'Daughter', city: 'Quezon City', priv: false, link: false },
  parent: { phone: '917 123 4567', name: 'Nanay' },
  set: { riskOnly: true, sync: true, weekly: true, paused: false },
  consent: { given: true, date: today() }, autoBlock: false, allow: [], checked: 12, blocked: 3, pending: null,
  log: [
    { id: 1, num: '0917 516 0628', kind: 'call', label: 'Bank impersonation', status: 'blocked', time: '7:02 PM', day: 'Today' },
    { id: 2, num: 'Link in SMS', kind: 'sms', label: 'Phishing site', status: 'blocked', time: '4:15 PM', day: 'Yesterday' },
    { id: 3, num: 'Ate Liza', kind: 'call', label: 'Known contact', status: 'allowed', time: '9:30 AM', day: 'Yesterday' }],
  chat: [{ me: 0, t: 'Hello! Paste any message, number or link and I will check if it is safe.' }]
});
let S; try { S = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const care = () => S.mode === 'care';
const pname = () => S.parent.name || 'Nanay';
const gname = () => (S.reg.name || 'Rina').split(' ')[0];

const I = {
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>', chart: '<path d="M4 20V4M4 20h16M8 15l4-4 3 3 5-6"/>',
  sync: '<path d="M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17h.01"/>',
  person: '<circle cx="12" cy="7" r="3.5"/><path d="M6 21v-3a6 6 0 0112 0v3"/>', head: '<path d="M4 14v-2a8 8 0 0116 0v2M4 14h3v5H4zM17 14h3v5h-3zM17 19a4 4 0 01-4 2"/>'
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const tog = (k, title, sub, on, extra = '') => `<div class="tog"><div><b>${title}</b><small>${sub}</small></div><button class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${on}" aria-label="${title}" data-act="${k}" ${extra}></button></div>`;

/* ---------- Screens ---------- */
const V = {};
V.mode = () => `<div class="content" style="justify-content:center">
  <div><div class="eyebrow">ScamCatch</div><h2>Zero-Reach Scam Protection</h2><p class="sub" style="margin-top:6px">Choose how you want to be protected.</p></div>
  <div class="card glow fields" style="gap:12px;padding:18px"><span style="color:#6fa0ff">${ic('person')}</span><h2 style="font-size:21px">Family Mode</h2>
    <p class="sub">For adult children and protected relatives. Guardian alerts and cross-device approval.</p>
    <span class="pill blue" style="align-self:flex-start;text-transform:none">$3 / month · 1 senior + 1 guardian</span>
    <button class="btn primary" data-act="pick" data-m="family">Choose Family Mode</button></div>
  <div class="card glow pink fields" style="gap:12px;padding:18px"><span style="color:var(--pink)">${ic('head')}</span><h2 style="font-size:21px">Care Mode</h2>
    <p class="sub">Direct senior setup. Silent telco SIM shielding and a 24/7 Care Specialist line.</p>
    <span class="pill pink" style="align-self:flex-start;text-transform:none">Telco SIM add-on · Postpaid / Prepaid</span>
    <button class="btn" data-act="pick" data-m="care">Choose Care Mode</button></div></div>`;

V.reg = () => { const r = S.reg; return `<div class="content">
  <div><div class="eyebrow">Family mode</div><h2>Family registration</h2><p class="sub">Set your role and location.</p></div>
  <div><label class="f">Your role</label><div class="seg">${['Guardian', 'Protected'].map(x => `<button class="${r.role === x ? 'on' : ''}" data-act="role" data-v="${x}">${x}</button>`).join('')}</div>
  ${r.role === 'Protected' ? '<p class="sub" style="margin-top:6px">This demo opens the guardian view (Rina). Use Care Mode for the senior view.</p>' : ''}</div>
  <div class="fields">
   <div><label class="f" for="r1">Full name</label><input id="r1" class="in" data-f="reg.name" value="${esc(r.name)}"></div>
   <div><label class="f" for="r2">Mobile number</label><input id="r2" class="in" data-f="reg.mobile" inputmode="tel" value="${esc(r.mobile)}"></div>
   <div class="btns"><div class="grow"><label class="f" for="r3">Age</label><input id="r3" class="in" data-f="reg.age" inputmode="numeric" value="${esc(r.age)}"></div>
    <div class="grow"><label class="f" for="r4">Relationship</label><select id="r4" class="in" data-f="reg.rel">${['Daughter', 'Son', 'Spouse', 'Other'].map(o => `<option ${r.rel === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div></div>
   <div><label class="f" for="r5">City / Municipality</label><input id="r5" class="in" data-f="reg.city" value="${esc(r.city)}"></div></div>
  <label class="chk"><input type="checkbox" data-c="reg.priv" ${r.priv ? 'checked' : ''}><span><b>Data privacy:</b> I agree to real-time metadata scanning of calls, SMS and e-wallet links.</span></label>
  <label class="chk"><input type="checkbox" data-c="reg.link" ${r.link ? 'checked' : ''}><span><b>Cross-device link:</b> Protection starts when my relative installs ScamCatch and accepts.</span></label>
  <div class="grow"></div><button class="btn primary" id="go" data-act="reg" ${r.priv && r.link ? '' : 'disabled'}>Complete setup and launch</button></div>`; };

V.add = () => `<div class="content">
  <div class="bars"><i class="on"></i><i class="on"></i><i></i><i></i></div><div class="eyebrow">Step 2 of 4</div>
  <h2>Add your parent</h2><p class="sub">Enter the mobile number ScamCatch should protect. We will ask them to agree first.</p>
  <div><label class="f">Parent's mobile number</label><div class="btns"><div class="in" style="flex:none;width:64px;text-align:center">+63</div><input class="in" data-f="parent.phone" inputmode="tel" aria-label="Mobile number" value="${esc(S.parent.phone)}"></div></div>
  <div><label class="f" for="pn">What do you call them?</label><input id="pn" class="in" data-f="parent.name" value="${esc(S.parent.name)}"></div>
  <div class="card sub">Protection starts only after they agree. You will see risk alerts only, never their messages.</div>
  <div class="grow"></div><button class="btn primary" data-act="consent">Send consent request</button><button class="btn" data-act="back">Back</button></div>`;

const statusPill = () => !S.consent.given ? '<span class="pill bad">Off</span>' : S.set.paused ? '<span class="pill warn">Paused</span>' : '<span class="pill ok">Protected</span>';
const rowItem = (e, guardian) => {
  const st = { blocked: ['bad', 'Blocked'], allowed: ['ok', 'Allowed'], held: [guardian ? 'warn' : 'blue', guardian ? 'Held' : 'Checking'] }[e.status];
  const sub = guardian ? `${esc(e.label)} · ${e.time}${e.day === 'Today' ? '' : ' · ' + e.day}` : `${e.kind === 'call' ? 'Call' : 'Message'} · ${e.time} · ${e.day}`;
  let act = '';
  if (!guardian && e.status === 'blocked') act = e.flagged ? `<button class="link" data-act="unflag" data-id="${e.id}">Flagged · Undo</button>` : `<button class="btn sm" data-act="flag" data-id="${e.id}">Not a scam</button>`;
  if (guardian && e.flagged) act = `<button class="link" data-act="unflag" data-id="${e.id}">${esc(pname())} flagged · Undo</button>`;
  return `<div class="item"><div><b>${esc(e.num)}</b><small>${sub}</small></div><div class="end"><span class="pill ${st[0]}">${st[1]}</span>${act}</div></div>`;
};
const demoTools = () => `<div class="card"><div class="eyebrow" style="margin-bottom:10px">Demo tools</div><div class="btns"><button class="btn sm" data-act="sim">Simulate incoming</button><button class="btn sm" data-act="home">Switch mode</button><button class="btn sm" data-act="reset">Reset</button></div></div>`;

V.guardian = () => { const p = S.pending, n = pname();
  return `<div class="content">
  <div class="row"><div><div class="eyebrow">Guardian</div><h2>${esc(n)} ${esc((S.reg.name || '').split(' ').pop() || '')}</h2></div>${statusPill()}</div>
  <div class="card stats"><div><b style="color:var(--cyan)">${S.checked}</b><span>Checked</span></div><div><b>${S.blocked}</b><span>Blocked</span></div><div><b style="color:var(--amber)">${p ? 1 : 0}</b><span>Needs you</span></div></div>
  ${p ? `<div class="card glow fields"><span class="pill warn" style="align-self:flex-start">Uncertain · Paused</span>
    <div class="bubble" style="max-width:100%;border-radius:12px">${esc(p.msg)}<small style="display:block;color:var(--muted);margin-top:4px">${esc(p.num)}</small></div>
    <a class="btn primary" href="tel:+63${esc(S.parent.phone.replace(/\D/g, ''))}">Verify with ${esc(n)}</a>
    <div class="btns"><button class="btn allow" data-act="allow">Allow</button><button class="btn block" data-act="block">Block</button></div></div>`
  : `<div class="card"><b>Nothing needs you</b><p class="sub">Unsure calls and messages will wait here for your decision.</p></div>`}
  <div class="card">${tog('auto', `Auto-block for ${esc(n)}`, 'Unsure calls are blocked without waiting for you.', S.autoBlock)}</div>
  <div class="row"><div class="eyebrow">Recent activity</div><button class="link" data-act="privacy">Privacy and consent</button></div>
  <div class="card" style="padding:4px 14px">${S.log.slice(0, 3).map(e => rowItem(e, 1)).join('')}</div>${demoTools()}</div>`; };

V.senior = () => `<div class="content">
  <div class="row"><div><div class="eyebrow">Care mode</div><h2>Hello, ${esc(pname())}</h2></div>${statusPill()}</div>
  <div class="card center"><div class="shield">${ic('shield')}</div><b style="font-size:17px">Your phone is protected</b><p class="sub" style="margin-top:4px">Calls and messages are checked before they reach you.</p></div>
  <div class="card stats"><div><b style="color:var(--cyan)">${S.checked}</b><span>Checked</span></div><div><b>${S.blocked}</b><span>Blocked</span></div><div><b style="color:var(--green)">${S.log.filter(e => e.flagged).length}</b><span>Flagged safe</span></div></div>
  <div class="eyebrow">Recent activity</div><div class="card" style="padding:4px 14px">${S.log.slice(0, 3).map(e => rowItem(e, 0)).join('')}</div>${demoTools()}</div>`;

V.tracker = () => `<div class="content"><div><div class="eyebrow">${care() ? 'History' : 'Tracker'}</div><h2>${care() ? 'Calls and messages' : 'All activity'}</h2>
  <p class="sub">${care() ? 'Tap "Not a scam" on anything that should not have been blocked.' : `Flagged items were marked safe by ${esc(pname())}.`}</p></div>
  <div class="card" style="padding:4px 14px">${S.log.map(e => rowItem(e, !care())).join('')}</div></div>`;

V.sync = () => { const c = care() || S.set.sync; return `<div class="content"><div><div class="eyebrow">PH Sync</div><h2>Shared scam blocklist</h2><p class="sub">Numbers and links reported across the Philippines, checked against live BSP and DICT lists.</p></div>
  <div class="card stats"><div><b style="color:var(--cyan)">1,284</b><span>Blocked today</span></div><div><b>${S.blocked}</b><span>From you</span></div></div>
  <div class="card"><div class="row"><b>Anonymous sharing</b><span class="pill ${c ? 'ok' : 'warn'}">${c ? 'On' : 'Off'}</span></div><p class="sub" style="margin-top:4px">${c ? 'Blocked numbers help protect other families.' : 'Turn it on in Privacy and consent.'}</p></div>
  <div class="card" style="padding:4px 14px">${[['BSP blacklist', '5 min ago'], ['DICT blacklist', '12 min ago'], ['Community reports', 'Live']].map(r => `<div class="item"><b>${r[0]}</b><small>${r[1]}</small></div>`).join('')}</div></div>`; };

V.chat = () => `<div class="content"><div><div class="eyebrow">Chat AI</div><h2>ScamCatch assistant</h2><p class="sub" style="color:var(--cyan)">Online · automated analysis</p></div>
  <div class="chat" id="chatlog">${S.chat.map(m => `<div class="bubble ${m.me ? 'me' : ''}">${m.me ? esc(m.t) : m.t}</div>`).join('')}</div>
  <div class="btns" style="flex:none"><input class="in" id="cin" placeholder="Paste a suspicious message" aria-label="Message to check"><button class="btn primary" style="flex:none;width:76px" data-act="send">Send</button></div></div>`;

V.help = () => `<div class="content"><div><div class="eyebrow">Help</div><h2>Help and emergency support</h2><p class="sub">Steps for seniors and family guardians.</p></div>
  <div class="card fields" style="gap:14px">${[['How does the Zero-Reach firewall work?', 'It checks calls and SMS before they show on your phone, against live BSP and DICT blacklists.'], ['What does "Paused" mean?', 'The AI is unsure, so the guardian is asked to allow or block.'], ['Already sent money?', 'Call the hotline now to freeze linked bank and e-wallet accounts.']].map(q => `<div><b style="font-size:14px">${q[0]}</b><p class="sub">${q[1]}</p></div>`).join('')}</div>
  <div class="grow"></div>
  ${care() ? `<a class="btn" href="tel:${CARE_LINE}">Call your Care Specialist</a>` : ''}
  <button class="btn primary" data-act="tab" data-t="chat">Chat assistance (AI and care support)</button>
  <a class="btn danger" href="tel:${HOTLINE}">Emergency scam hotline ${HOTLINE}</a></div>`;

V.privacy = () => { const s = S.set, n = pname(); return `<div class="content">
  <div class="row"><div><div class="eyebrow">Settings</div><h2>Privacy and consent</h2><p class="sub">You control what is shared.</p></div><button class="btn sm" data-act="tab" data-t="home">Done</button></div>
  <div class="card" style="padding:4px 14px">${tog('s:riskOnly', 'Guardian sees risk alerts only', 'Never the full content of messages.', s.riskOnly)}${tog('s:sync', 'Share anonymous scam data with PH Sync', 'Helps block scams for others.', s.sync)}${tog('s:weekly', 'Weekly report to guardian', 'Sent every Sunday.', s.weekly)}${tog('s:paused', 'Pause protection for 1 hour', 'Use only if a call must go through.', s.paused)}</div>
  <div class="card"><b>${S.consent.given ? 'Consent given' : 'Consent revoked'}</b><p class="sub">${S.consent.given ? `${esc(n)} agreed on ${S.consent.date}. They can stop at any time.` : `Protection is off. Send a new consent request to ${esc(n)} to restart it.`}</p></div>
  <div class="grow"></div><button class="btn" data-act="export">Download my data</button>
  ${S.consent.given ? '<button class="btn danger" data-act="revoke">Revoke consent</button>' : '<button class="btn primary" data-act="regrant">Send new consent request</button>'}</div>`; };

V.alert = e => `<div class="content" style="justify-content:center"><div class="card glow center" style="padding:22px"><div class="shield">${ic('shield')}</div>
  <h2>We stopped a ${e.kind === 'call' ? 'call' : 'message'}</h2><p class="sub" style="margin:8px 0 12px;font-size:15px">You do not need to do anything.</p><span class="pill ok">You are protected</span></div>
  <div class="card"><small class="sub">Blocked at ${e.time}</small><b style="display:block;font-size:17px;margin-top:2px">${esc(e.num)}</b></div>
  <div class="card"><b>${esc(gname())} was told.</b><p class="sub">Your family can see this alert.</p></div>
  <button class="btn primary" data-act="dismiss">Okay</button><a class="btn" href="tel:${esc(S.reg.mobile.replace(/\s/g, ''))}">Call ${esc(gname())}</a></div>`;

const TABS = [['home', 'Firewall', 'shield'], ['tracker', 'Tracker', 'chart'], ['sync', 'PH Sync', 'sync'], ['chat', 'Chat AI', 'chat'], ['help', 'Help', 'help']];
const nav = () => `<nav class="nav" aria-label="Main">${TABS.map(t => `<button class="${S.tab === t[0] ? 'on' : ''}" data-act="tab" data-t="${t[0]}">${ic(t[2])}${care() && t[0] === 'tracker' ? 'History' : t[1]}</button>`).join('')}</nav>`;

function render() {
  const keepIn = document.getElementById('cin')?.value;
  let h;
  if (S.step === 'mode') h = V.mode();
  else if (S.step === 'reg') h = V.reg();
  else if (S.step === 'add') h = V.add();
  else {
    const a = care() && S.alert && S.log.find(e => e.id === S.alert);
    if (a) h = V.alert(a);
    else h = (S.tab === 'home' ? (care() ? V.senior() : V.guardian()) : V[S.tab]()) + nav();
  }
  $app.innerHTML = h + (S.toast ? `<div class="toast" role="status">${esc(S.toast)}</div>` : '');
  if (S.tab === 'chat') { const l = document.getElementById('chatlog'); if (l) l.parentElement.scrollTop = l.parentElement.scrollHeight; if (keepIn) document.getElementById('cin').value = keepIn; }
  save();
}
const toast = m => { S.toast = m; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = ''; render(); }, 2600); };

/* ---------- Logic ---------- */
const SCEN = [
  { num: '0917 516 0628', kind: 'call', label: 'Bank impersonation', v: 'scam' },
  { num: 'gcash-verify-login.xyz', kind: 'sms', label: 'Phishing site', v: 'scam' },
  { num: '0928 441 7730', kind: 'sms', label: 'Unknown number', v: 'unsure', msg: 'Ma, this is my new number. I need money urgently.' },
  { num: 'Ate Liza', kind: 'call', label: 'Known contact', v: 'safe' }];
const add = (o, status) => { const e = { id: Date.now() + Math.random(), time: now(), day: 'Today', ...o, status }; delete e.v; S.log.unshift(e); S.checked++; if (status === 'blocked') S.blocked++; return e; };

function simulate() {
  if (!S.consent.given) return toast('Protection is off. Consent was revoked.');
  const sc = SCEN[S.sim++ % SCEN.length];
  if (S.set.paused) { add(sc, 'allowed'); return toast('Protection is paused. Call went through.'); }
  if (S.allow.includes(sc.num)) { add(sc, 'allowed'); return toast(`${sc.num} allowed. ${pname()} marked it safe.`); }
  let e;
  if (sc.v === 'safe') { add(sc, 'allowed'); return toast(`Allowed: ${sc.num}`); }
  if (sc.v === 'scam' || S.autoBlock) { e = add(sc, 'blocked'); if (sc.v === 'unsure') e.label += ' (auto-blocked)'; }
  else { e = add(sc, 'held'); S.pending = { id: e.id, num: sc.num, msg: sc.msg }; }
  if (e.status === 'blocked') { if (care()) { S.alert = e.id; return render(); } return toast(`Blocked ${sc.num}`); }
  toast(care() ? 'Checking a new message…' : 'A message needs your decision.');
}
function decide(ok) {
  const e = S.log.find(x => x.id === S.pending?.id); if (!e) return;
  e.status = ok ? 'allowed' : 'blocked'; if (!ok) S.blocked++; S.pending = null; toast(ok ? 'Allowed.' : 'Blocked.');
}
function analyze(t) {
  const l = t.toLowerCase(), brand = /gcash|maya|bdo|bpi|landbank|unionbank|paymaya/.test(l);
  const link = /https?:\/\/|\b[\w-]+\.(xyz|top|click|link|info|ph|com)\b/.test(l);
  const bad = /verify|login|otp|mpin|prize|claim|won|suspend|urgent/.test(l);
  const known = SCEN.filter(s => s.v !== 'safe').some(s => l.includes(s.num.toLowerCase().replace(/\s/g, '')) || l.includes(s.num.toLowerCase()));
  const money = /send money|new number|need money|padala|load|bank details/.test(l);
  if (known || (link && (brand || bad)) || (brand && bad)) return ['high', 'This looks like a lookalike link or number built to steal your login or MPIN. Do not open or reply.'];
  if (money || link || bad) return ['med', 'Be careful. Call the person on a number you already know before sending money or codes.'];
  return ['low', 'I found nothing suspicious. If anything feels off, ask a family member first.'];
}
function send() {
  const i = document.getElementById('cin'), t = i.value.trim(); if (!t) return;
  S.chat.push({ me: 1, t }); i.value = ''; render();
  setTimeout(() => {
    const [r, m] = analyze(t), c = { high: 'var(--red)', med: 'var(--amber)', low: 'var(--green)' }[r];
    let extra = '';
    if (r === 'high') { add({ num: t.slice(0, 40), kind: 'sms', label: 'Chat check' }, 'blocked'); extra = care() ? ` I blocked it and alerted ${esc(gname())}.` : ' I blocked it and will warn your family.'; }
    S.chat.push({ me: 0, t: `<b style="color:${c}">${{ high: 'High risk.', med: 'Medium risk.', low: 'Low risk.' }[r]}</b> ${m}${extra}` }); render();
  }, 500);
}
const setPath = (p, v) => { const [a, b] = p.split('.'); S[a][b] = v; save(); };

const A = {
  pick: d => { S.mode = d.m; S.tab = 'home'; S.step = d.m === 'care' ? 'app' : (S.setup ? 'app' : 'reg'); render(); if (d.m === 'care') toast('Telco SIM shielding is active.'); },
  role: d => { S.reg.role = d.v; render(); },
  reg: () => { S.step = 'add'; render(); },
  back: () => { S.step = 'reg'; render(); },
  consent: () => { S.setup = true; S.consent = { given: true, date: today() }; S.step = 'app'; S.tab = 'home'; render(); toast(`Consent request sent. ${pname()} agreed (demo).`); },
  home: () => { S.step = 'mode'; S.alert = null; render(); },
  reset: () => { S = fresh(); render(); },
  sim: simulate, allow: () => decide(true), block: () => decide(false), send,
  dismiss: () => { S.alert = null; render(); },
  tab: d => { S.tab = d.t; render(); },
  privacy: () => { S.tab = 'privacy'; render(); },
  auto: () => { S.autoBlock = !S.autoBlock; render(); toast(S.autoBlock ? `Auto-block on for ${pname()}.` : 'Auto-block off. You decide on unsure calls.'); },
  flag: d => { const e = S.log.find(x => x.id == d.id); e.flagged = true; if (!S.allow.includes(e.num)) S.allow.push(e.num); toast('Thanks. We will allow this number next time.'); },
  unflag: d => { const e = S.log.find(x => x.id == d.id); e.flagged = false; S.allow = S.allow.filter(n => n !== e.num); toast('Flag removed. This number stays blocked.'); },
  revoke: () => { S.consent.given = false; render(); },
  regrant: () => { S.consent = { given: true, date: today() }; render(); toast(`${pname()} agreed (demo).`); },
  export: () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ guardian: S.reg, parent: S.parent, settings: S.set, consent: S.consent, activity: S.log }, null, 2)], { type: 'application/json' }));
    a.download = 'scamcatch-data.json'; a.click(); URL.revokeObjectURL(a.href);
  }
};
$app.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const k = t.dataset.act;
  if (k.startsWith('s:')) { S.set[k.slice(2)] = !S.set[k.slice(2)]; return render(); }
  A[k]?.(t.dataset);
});
$app.addEventListener('input', e => {
  const f = e.target.dataset.f; if (!f) return; setPath(f, e.target.value);
});
$app.addEventListener('change', e => {
  const c = e.target.dataset.c; if (!c) return; setPath(c, e.target.checked);
  const b = document.getElementById('go'); if (b) b.disabled = !(S.reg.priv && S.reg.link);
});
$app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'cin') send(); });
render();
