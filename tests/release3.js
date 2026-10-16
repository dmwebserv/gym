/* Release 3 verification — the app shell, the boot sequence, offline behaviour,
   install state and the theme colour. Runs the real app in jsdom. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, l, e) => { if (c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l + (e ? '  → ' + e : '')); } };

/* ---------- static checks: the shell that ships ---------- */
console.log('\n=== the shell that ships ===');
ok(fs.existsSync(path.join(root, 'manifest.webmanifest')), 'manifest.webmanifest exists');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
ok(manifest.display === 'standalone', 'manifest: installed app runs standalone');
ok(manifest.name === 'Session' && manifest.short_name === 'Session', 'manifest: named Session');
ok(manifest.background_color === '#12161A' && manifest.theme_color === '#12161A', 'manifest: colours match the app');
ok(manifest.icons.some(i => i.sizes === '192x192') && manifest.icons.some(i => i.sizes === '512x512'),
   'manifest: 192 and 512 icons (Android no longer rescales a 180px one)');
ok(manifest.icons.some(i => i.purpose === 'maskable'), 'manifest: a maskable icon so launchers can round it');
for (const i of manifest.icons) ok(fs.existsSync(path.join(root, i.src)), `icon present on disk: ${i.src}`);
ok(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length === 3, 'manifest: home-screen shortcuts (Android)');

ok(fs.existsSync(path.join(root, 'sw.js')), 'service worker exists');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
ok(/fetch|\bcaches\b/.test(sw), 'service worker manages a cache');
ok(/if \(!sameOrigin\) return;/.test(sw),
   'the service worker returns early on every cross-origin request, so the sync store is never cached or served stale');
ok(/req\.mode === 'navigate'/.test(sw), 'navigations are handled separately (network first, cache fallback)');

const fonts = fs.readdirSync(path.join(root, 'fonts')).filter(f => f.endsWith('.woff2'));
ok(fonts.length === 7, 'seven self-hosted font files (Archivo 4 weights, Plex Mono 3)', fonts.length + '');
ok(!/fonts\.googleapis|fonts\.gstatic/.test(html), 'no third-party font request left in the app');
for (const f of fonts) ok(sw.includes('fonts/' + f), `service worker caches ${f}`);

const splashes = fs.readdirSync(root).filter(f => /^splash-\d+x\d+\.png$/.test(f));
ok(splashes.length === 9, 'nine iOS launch images generated', splashes.length + '');
ok(/apple-touch-startup-image/.test(html), 'launch images are wired into the page');
ok(/rel="manifest" href="manifest\.webmanifest"/.test(html), 'the page points at the manifest');
ok(/<title>Session<\/title>/.test(html) && /apple-mobile-web-app-title/.test(html), 'the installed name is still Session');

/* ---------- the boot sequence, live ---------- */
(async () => {
  const dom = new JSDOM(html, { url: 'https://example.org/', runScripts: 'dangerously', pretendToBeVisual: true });
  const win = dom.window, doc = win.document;
  win.confirm = () => true;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];

  console.log('\n=== the boot sequence ===');
  ok(!!$('#splash'), 'the splash element is in the page before anything loads');
  ok(!!$('#bootskeleton'), 'the boot skeleton is in the page too');
  await wait(500);
  ok($('#splash') === null || $('#splash').classList.contains('gone'), 'the splash fades out once your log is ready');
  ok($('#bootskeleton').classList.contains('gone'), 'the skeleton is removed on first paint');
  ok($$('#list li.ex').length > 0, 'and the session is on screen');

  console.log('\n=== theme colour follows the day ===');
  const themeOf = () => ($('meta[name="theme-color"]') || {}).content;
  const dayN = win.eval('currentDay().n');
  const expect = { 1:'#F5C518', 2:'#4C8DFF', 3:'#F0575C' }[dayN];
  ok(themeOf() === expect, `top bar matches day ${dayN} (${expect})`, themeOf());
  win.eval("view='progress'; render();");
  await wait(120);
  ok(themeOf() === '#12161A', 'and falls back to the app colour away from the session');

  console.log('\n=== offline behaviour ===');
  win.eval('view="session"; render();');
  await wait(120);
  ok(!/Offline —/.test($('#app').textContent), 'no offline notice while online');
  Object.defineProperty(win.navigator, 'onLine', { value:false, configurable:true });
  win.dispatchEvent(new win.Event('offline'));
  await wait(160);
  ok(/Offline — everything still saves on this phone/.test($('#app').textContent),
     'going offline says so, and says the important part: it still saves');
  Object.defineProperty(win.navigator, 'onLine', { value:true, configurable:true });
  win.dispatchEvent(new win.Event('online'));
  await wait(200);
  ok(!/Offline —/.test($('#app').textContent), 'and the notice clears when signal returns');

  console.log('\n=== logging works with no connection at all ===');
  const rows = $$('#list li.ex');
  const tap = el => el.dispatchEvent(new win.MouseEvent('click', { bubbles:true }));
  tap(rows[0].querySelector('.pill'));
  await wait(140);
  const inp = $('#winput');
  inp.value = '40'; inp.dispatchEvent(new win.Event('input', { bubbles:true }));
  const ri = $('#repsingle .setstepper input');
  ri.value = '10'; ri.dispatchEvent(new win.Event('input', { bubbles:true }));
  tap($('#savebtn'));
  await wait(200);
  const saved = JSON.parse(win.localStorage.getItem('gym:log:danny'));
  const day = win.eval('currentDay().n');
  const canon = win.eval(`chosenCanonFor('danny', slotKeyOf(${day}, 0), currentDay().ex[0])`);
  const today = new Date().toLocaleDateString('en-CA');
  ok(!!saved.lifts[`l:danny:${canon}:${today}`], 'a lift logged offline is saved to this phone straight away');
  ok(saved.lifts[`l:danny:${canon}:${today}`].weight === 40, 'with the right weight');

  console.log('\n=== the update path is quiet ===');
  ok(/SKIP_WAITING/.test(html) && /SKIP_WAITING/.test(sw), 'the page and worker agree on the update handshake');
  ok(/!document\.getElementById\('overlayroot'\)\.innerHTML/.test(html),
     'an update is only adopted when no sheet is open, so it can never interrupt a session');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
