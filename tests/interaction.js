/* Interaction verification.
   1. The stylesheet audit: every class the app renders must have a rule, and nothing you can tap
      may be styled as dim as disabled text. (The pull-up ladder shipped with no CSS at all and
      looked like plain text — this is the guard against that happening again.)
   2. The pull-up ladder behaves: the stage you are on is marked, moving up/down moves the mark and
      the words, and the panel stays open while you do it.
   3. Swiping the session changes day, and only when it is meant to. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, l, e) => { if (c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l + (e ? '  → ' + e : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ============ 1. the stylesheet audit ============ */
console.log('\n=== every class the app renders has a rule ===');
const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const css = styles.replace(/\/\*[\s\S]*?\*\//g, '');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
let markup = html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
markup = markup.replace(/&[a-zA-Z]+;/g, ' ');   // &nbsp; etc. are entities, not classes

/* A class may be built from a template hole (class="hmc l${lvl}"), so the hole is replaced with a
   marker: a token with a marker is a prefix and needs at least one real class starting with it. */
const used = new Map();                                  // class (or prefix) -> is prefix
for (const src of [markup, script]){
  for (const m of src.matchAll(/class="([^"]*)"/g)){
    const raw = m[1].replace(/\$\{[^}]*\}/g, '\u0000').replace(/[`'"]/g, ' ');
    for (const tok of raw.split(/\s+/)){
      if (!tok) continue;
      const isPrefix = tok.includes('\u0000');
      const c = tok.replace(/\u0000/g, '');
      if (/^[a-z][a-z0-9-]*$/.test(c)) used.set(c, used.get(c) || isPrefix);
    }
  }
}
const defined = [...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]);
const missing = [...used.entries()]
  .filter(([c, isPrefix]) => isPrefix ? !defined.some(d => d.startsWith(c)) : !defined.includes(c))
  .map(([c]) => c).sort();
ok(missing.length === 0,
   'no class is rendered without a stylesheet rule (the ladder bug)',
   missing.length ? 'missing: ' + missing.map(c => '.' + c).join(', ') : '');

console.log('\n=== nothing tappable is styled as dim as disabled text ===');
/* last rule wins, exactly as the browser resolves it */
function finalColor(selector){
  let colour = null;
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
    const sels = m[1].split(',').map(x => x.trim());
    if (!sels.includes(selector)) continue;
    const c = m[2].match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
    if (c) colour = c[1].trim();
  }
  return colour;
}
const TAPPABLE = ['.choicechips button', '.cta.ghost', '.mini-btn', '.switch button', '.views button', '.qchip', '.reset', '.tpreset'];
for (const sel of TAPPABLE){
  const c = finalColor(sel);
  ok(c && !/var\(--muted\)/.test(c), `${sel} reads as chalk, not muted grey`, String(c));
}
const pressed = finalColor('.choicechips button[aria-pressed="true"]');
ok(pressed && !/var\(--muted\)/.test(pressed), 'and the selected option is still obvious', String(pressed));
ok(/\.ladderbox/.test(css) && /\.ladderbody/.test(css) && /\.lvl\b/.test(css),
   'the ladder has box, body and level styles');
ok(/\.lvl\.now/.test(css), 'including the level you are on');
ok(/\.switch \.swipearrow/.test(css), 'and the arrows that advertise swiping');

/* ============ 2 + 3. behaviour ============ */
const dom = new JSDOM(html, {
  url:'https://example.org/', runScripts:'dangerously', pretendToBeVisual:true,
  beforeParse(w){
    w.localStorage.setItem('gym:settings', JSON.stringify({ v:5, onboarded:true, owner:'danny', sel:'danny',
      people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
      legacyMigrated:true, lastChoice:{}, sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false} }));
    w.localStorage.setItem('gym:log:danny', JSON.stringify({ lifts:{}, ticks:{} }));
    w.localStorage.setItem('gym:log:kieran', JSON.stringify({ lifts:{}, ticks:{} }));
  }
});
const win = dom.window, doc = win.document;
win.confirm = () => true;
const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];
const q = js => win.eval(js);
const tap = el => el.dispatchEvent(new win.MouseEvent('click', { bubbles:true }));
const text = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

/* a touch, built by hand because jsdom has no TouchEvent */
function touch(el, type, x, y){
  const ev = new win.Event(type, { bubbles:true, cancelable:true });
  const point = { clientX:x, clientY:y };
  Object.defineProperty(ev, 'touches', { value: type === 'touchend' ? [] : [point] });
  Object.defineProperty(ev, 'changedTouches', { value: [point] });
  el.dispatchEvent(ev);
  return ev;
}

(async () => {
  await wait(500);
  q("view='session'; render();");
  await wait(200);

  console.log('\n=== the pull-up ladder ===');
  const box = $('.ladderbox');
  ok(!!box, 'the panel is in the session');
  ok(!box.hasAttribute('open'), 'and is closed by default, so it costs no screen space');
  tap($('.ladderbox > summary'));
  box.setAttribute('open', '');                 // jsdom does not toggle <details> itself
  await wait(120);
  ok($$('.lvl').length === 7, 'seven rungs are listed', $$('.lvl').length + '');
  ok($$('.lvl.now').length === 1, 'exactly one is marked as the one you are on');
  ok($$('.lvl.now .here').length === 1, 'and it says so in words, not colour alone');
  const stage0 = text($('.lvl.now'));
  ok(/Stage 1:|1/.test(text($('.ladderstage'))), 'the body names the stage you are on', text($('.ladderstage')).slice(0, 60));
  ok(/stage 1 of 7/i.test(text($('.ladderbox > summary'))), 'and so does the collapsed summary',
     text($('.ladderbox > summary')));

  tap($('[data-ladder="up"]'));
  await wait(250);
  const stage1 = text($('.lvl.now'));
  ok(stage1 !== stage0, 'moving up changes the marked rung', stage1.slice(0, 40));
  ok($$('.lvl.now').length === 1 && $$('.lvl.done').length === 1,
     'the rung you passed is ticked and exactly one is current',
     `now=${$$('.lvl.now').length} done=${$$('.lvl.done').length}`);
  ok(/stage 2 of 7/i.test(text($('.ladderbox > summary'))), 'the summary number follows');
  ok(/Stage 2:/.test(text($('.ladderstage'))), 'and so does the stage line', text($('.ladderstage')).slice(0, 60));
  ok(q('(ladderOf("danny")||{}).level') === 2, 'and it is stored');
  ok($('.ladderbox').hasAttribute('open'), 'the panel stays open while you move levels');
  ok(!!$('[data-ladder="up"]') && !$('[data-ladder="up"]').hasAttribute('disabled'), 'the up button is still available');

  tap($('[data-ladder="down"]'));
  await wait(250);
  ok($$('.lvl.now').length === 1 && $$('.lvl.done').length === 0, 'moving down ticks nothing off');
  ok(/stage 1 of 7/i.test(text($('.ladderbox > summary'))), 'and the number comes back');
  ok(q('(ladderOf("danny")||{}).level') === 1, 'stored too');
  ok($('[data-ladder="down"]').hasAttribute('disabled'), 'at the bottom, down is disabled — the one place dim is right');

  q('setLadder("danny", { level:6 });');
  await wait(250);
  ok($$('.lvl.now').length === 1 && /stage 6 of 7/i.test(text($('.ladderbox > summary'))), 'stage 6 shows');
  ok(!!$('[data-band]'), 'with the band chips, because stage 6 is the band-assisted one');
  ok(!/undefined/.test(text($('.ladderbox'))), 'and nothing on the panel says undefined');

  console.log('\n=== swipe between days ===');
  const root = $('#sessionRoot');
  const dayOf = () => $$('#switch button').find(b => b.getAttribute('aria-pressed') === 'true').textContent;
  const first = dayOf();
  ok(!!$('#switch .swipearrow'), 'the day tabs show arrows either side');
  ok($$('.swipearrow').length === 2, 'one each side');

  touch(root, 'touchstart', 300, 400);
  touch(root, 'touchend', 180, 405);                 // 120px left
  await wait(300);
  const second = dayOf();
  ok(second !== first, `a left swipe moves to the next day (${first} → ${second})`);

  touch(root, 'touchstart', 180, 400);
  touch(root, 'touchend', 300, 402);                 // 120px right
  await wait(300);
  ok(dayOf() === first, 'a right swipe goes back');

  const before = dayOf();
  touch(root, 'touchstart', 200, 400);
  touch(root, 'touchend', 210, 560);                 // mostly vertical: a scroll
  await wait(200);
  ok(dayOf() === before, 'scrolling down the list does not change day');
  touch(root, 'touchstart', 200, 400);
  touch(root, 'touchend', 235, 405);                 // only 35px
  await wait(200);
  ok(dayOf() === before, 'a small drag does not change day');
  touch(root, 'touchstart', 300, 400);
  await wait(850);
  touch(root, 'touchend', 120, 402);                 // slow drag, probably a hold
  await wait(200);
  ok(dayOf() === before, 'a slow drag does not change day');

  touch(root, 'touchstart', 300, 400);
  touch(root, 'touchend', 180, 400);
  await wait(200);
  const swiped = dayOf();
  ok(swiped !== before, 'a deliberate swipe still works after those');
  // while a sheet is open the gesture must not fire
  q('view="session"; render();');
  await wait(200);
  tap($$('#list li.ex .pill')[0]);
  await wait(250);
  const withSheet = dayOf();
  touch(root, 'touchstart', 300, 400);
  touch(root, 'touchend', 170, 400);
  await wait(200);
  ok(dayOf() === withSheet, 'swiping does not change day while a sheet is open');
  q('closeOverlay()');
  await wait(120);
  touch(root, 'touchstart', 300, 400);
  touch(root, 'touchend', 170, 400);
  await wait(250);
  ok(dayOf() !== withSheet, 'and it works again once the sheet is closed');

  console.log('\n=== the log sheet options look tappable ===');
  await wait(150);
  const chips = $$('#list [data-choices] button, #overlayroot [data-choices] button');
  q(`openLogSheet(${q('currentDay().ex.findIndex(e => e.opts && e.opts.length)')})`);
  await wait(250);
  const options = $$('#overlayroot [data-choices] button');
  ok(options.length >= 2, 'a variant slot offers both options', options.length + '');
  ok(options.some(b => b.getAttribute('aria-pressed') === 'true'), 'one is marked as the one today');
  ok(options.every(b => b.className.indexOf('disabled') < 0), 'and none is rendered as disabled');
  q('closeOverlay()');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
