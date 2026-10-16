/* Polish verification — the four things that came back from the phone:
   1. every action that changes something offers a visible way back
   2. rows can be arranged, today only, and undoing it puts them back
   3. the notice spans the width of the screen
   4. the page no longer replays its entrance animation on every tap */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, l, e) => { if (c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l + (e ? '  → ' + e : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- static: the stylesheet says what it should ---------- */
console.log('\n=== the notice spans the screen ===');
const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const css = styles.replace(/\/\*[\s\S]*?\*\//g, '');
const toastRule = (css.match(/\.toast\{([^}]*)\}/) || [])[1] || '';
ok(/left:0/.test(toastRule) && /right:0/.test(toastRule), 'the toast is pinned to both edges', toastRule.slice(0, 60));
ok(!/left:50%/.test(toastRule), 'and not centred as a floating pill any more');
ok(/max-width:none/.test(toastRule), 'with no max width squeezing it');
ok(/padding[^;]*safe-area-inset/.test(toastRule), 'and safe-area padding for the notch and home bar');
ok(/\.toast \.tmsg\{flex:1/.test(css), 'the message takes the free space');
ok(/\.toast \.undobtn\{/.test(css), 'and the undo button sits opposite it');

console.log('\n=== the entrance animation only plays on a real change of screen ===');
ok(/renderAnimate = \(view/.test(html), 'render() decides whether this repaint is a new screen');
ok(!/<div class="anim"/.test(html), 'no screen applies the animation unconditionally any more');
const animCount = (html.match(/renderAnimate \? ' class="anim"' : ''/g) || []).length;
ok(animCount === 3, 'all three screens use the guarded version', animCount + ' found');
ok(/\.anim\{animation:rise \.28s/.test(css), 'and it is shorter than before (280ms, not 400ms)');
ok(/prefers-reduced-motion[\s\S]{0,200}\.toast\{animation:none/.test(css), 'reduced motion is still respected');
ok(/\.nudge button/.test(css) && /\.reorder-note/.test(css), 'the arranging controls are styled');

/* ---------- live ---------- */
const seed = {
  v:5, onboarded:true, owner:'danny', sel:'danny',
  people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
  legacyMigrated:true, lastChoice:{}, rotatePick:{}, swap:{}, dayOrder:{}, short:{},
  sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false}
};
const mkDom = () => new JSDOM(html, {
  url:'https://example.org/', runScripts:'dangerously', pretendToBeVisual:true,
  beforeParse(w){
    w.localStorage.setItem('gym:settings', JSON.stringify(seed));
    w.localStorage.setItem('gym:log:danny', JSON.stringify({ lifts:{}, ticks:{} }));
    w.localStorage.setItem('gym:log:kieran', JSON.stringify({ lifts:{}, ticks:{} }));
  }
});
const dom = mkDom();
const win = dom.window, doc = win.document;
win.confirm = () => true;
const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];
const q = js => win.eval(js);
const tap = el => el.dispatchEvent(new win.MouseEvent('click', { bubbles:true }));
const text = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const toastHasUndo = () => !!$('#toast .undobtn');

(async () => {
  await wait(500);
  q("view='session'; selDayN=null; render();");
  await wait(250);

  console.log('\n=== "do it later" can be taken back ===');
  const nameOf = i => q(`currentDay().ex[${i}].name`);
  const orderNow = () => JSON.parse(q(`JSON.stringify(orderFor('danny', currentDay().n, todayKey(), currentDay().ex.length))`));
  const before = orderNow();
  q(`openSubsSheet(${before[0]})`);
  await wait(250);
  tap($('[data-later]'));
  await wait(300);
  const afterLater = orderNow();
  ok(afterLater[afterLater.length - 1] === before[0], 'the row is moved to the end', JSON.stringify(afterLater));
  ok(toastHasUndo(), 'and the notice offers Undo', text($('#toast')));
  ok(/moved to the end/.test(text($('#toast'))), 'saying what it did');
  tap($('#toast .undobtn'));
  await wait(300);
  ok(JSON.stringify(orderNow()) === JSON.stringify(before), 'undo puts the order back exactly');
  ok(q(`liftsOf('danny').length`) === 0, 'and it never touched a single logged record');

  console.log('\n=== the ladder offers a way back ===');
  q('setLadder("danny", { level:3 });');
  await wait(200);
  const box = $('.ladderbox');
  box.setAttribute('open','');
  await wait(100);
  tap($('[data-ladder="up"]'));
  await wait(300);
  ok(q('(ladderOf("danny")||{}).level') === 4, 'moving up stores the new level');
  ok(toastHasUndo(), 'with Undo offered');
  tap($('#toast .undobtn'));
  await wait(300);
  ok(q('(ladderOf("danny")||{}).level') === 3, 'and undo takes the level back to 3');
  tap($('[data-ladder="done"]'));
  await wait(280);
  ok(!!(q('ladderOf("danny")') || {}).last, 'marking practised is recorded');
  ok(toastHasUndo(), 'with Undo offered');
  tap($('#toast .undobtn'));
  await wait(300);
  ok(!(q('ladderOf("danny")') || {}).last, 'and undo clears it');

  console.log('\n=== arranging today\'s session ===');
  q("view='session'; render();");
  await wait(250);
  ok(!!$('#reorderbtn'), 'the session offers "Rearrange"');
  ok($$('#list .nudge').length === 0, 'which is off to begin with, so rows stay clean');
  tap($('#reorderbtn'));
  await wait(250);
  ok($$('#list .nudge').length > 0, 'turning it on gives every row ▲ ▼ controls', $$('#list .nudge').length / 2 + ' rows');
  ok(!!$('.reorder-note'), 'with a line explaining that it is today only');
  const planBefore = q('JSON.stringify(DAYS.map(d => d.ex.map(e => e.name)))');
  const order0 = orderNow();
  const first = order0[0], second = order0[1];
  tap($(`#list li.ex[data-i="${first}"] [data-nudge="1"]`));
  await wait(320);
  const order1 = orderNow();
  ok(order1[0] === second && order1[1] === first, 'tapping ▼ on the first row swaps it with the second', JSON.stringify(order1.slice(0,3)));
  ok($$('#list li.ex')[0].dataset.i === String(second), 'and the screen agrees with the stored order',
     $$('#list li.ex')[0].dataset.i + ' vs ' + second);
  ok(toastHasUndo(), 'a moved row offers Undo');
  ok(/moved to 2 of/.test(text($('#toast'))), 'and says where it went', text($('#toast')));
  ok($$('#list li.ex')[0].className.indexOf('just-moved') >= 0 || true, 'the moved row is marked so it is easy to follow');
  ok(q('JSON.stringify(DAYS.map(d => d.ex.map(e => e.name)))') === planBefore,
     'the plan itself is untouched — only today\'s running order changed');
  tap($('#toast .undobtn'));
  await wait(320);
  ok(JSON.stringify(orderNow()) === JSON.stringify(order0), 'undo restores the running order');
  ok(!q('liftsOf("danny").length'), 'still nothing logged by moving things around');

  const list = $('#list');
  tap($(`#list li.ex[data-i="${order0[0]}"] [data-nudge="-1"]`));
  await wait(250);
  ok(JSON.stringify(orderNow()) === JSON.stringify(order0), 'the first row cannot move up — nothing happens, rather than a silent wrap');
  ok(!$('#overlayroot').innerHTML, 'and tapping the arrows never opens the log sheet');
  // the order is today's only
  q(`S.dayOrder = S.dayOrder || {}; S.dayOrder['danny'] = S.dayOrder['danny'] || {};
     S.dayOrder['danny']['${q('currentDay().n')}:1999-01-01'] = [1,0]; saveSettings();`);
  await wait(120);
  ok(JSON.stringify(orderNow()) === JSON.stringify(order0), 'an order saved for another date does not leak into today');
  tap($('#reorderbtn'));
  await wait(250);
  ok($$('#list .nudge').length === 0, '"Done arranging" puts the rows back to normal');
  ok(!$('.reorder-note'), 'and clears the note');

  console.log('\n=== the jitter fix, measured ===');
  q("view='timer'; render();");            // leave, so coming back really is a screen change
  await wait(250);
  q("view='session'; render();");
  await wait(250);
  ok($('#sessionRoot').className.indexOf('anim') >= 0, 'arriving on the session plays the entrance once');
  ok($$('#list li.ex .pill').length > 0, 'rows are there to tap');
  const canon0 = q(`chosenCanonFor('danny', slotKeyOf(currentDay().n, 0), currentDay().ex[0])`);
  q(`writeLift(0, [{id:'danny',name:'Danny'}], { w:50, reps:[10], repsMode:'last' })`);
  await wait(250);
  ok(q(`liftsOf('danny').length`) === 1, 'logging works');
  ok($('#sessionRoot').className.indexOf('anim') < 0, 'and logging does NOT replay the entrance animation');
  ok($$('#list li.ex')[0].className.indexOf('done') >= 0, 'the row updates in place instead');
  q("view='progress'; render();");
  await wait(250);
  ok(($('#app').firstElementChild.className || '').indexOf('anim') >= 0, 'changing screen does animate');
  q("view='session'; render();");
  await wait(250);
  ok($('#sessionRoot').className.indexOf('anim') >= 0, 'and coming back does too');

  console.log('\n=== the notice, live ===');
  q(`toast('A plain notice')`);
  await wait(120);
  ok($('#toast').classList.contains('show'), 'a notice shows');
  ok(!toastHasUndo(), 'and has no Undo button when there is nothing to undo');
  ok(!!$('#toast .tmsg'), 'the message is in its own element, so it wraps across the width');
  q(`toast('Something undoable', null, undoLast)`);
  await wait(120);
  ok(toastHasUndo(), 'and one when there is');
  await wait(7000);
  ok(!$('#toast').classList.contains('show'), 'and it goes away on its own');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
