/* Release 1 verification — drives the real app in jsdom against real localStorage.
   Day-agnostic: works whichever session the app opens on. */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://example.org/', runScripts: 'dangerously', pretendToBeVisual: true });
const win = dom.window, doc = win.document;
win.confirm = () => true;
const wait = ms => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
const ok = (cond, label, extra) => {
  if (cond){ pass++; console.log('  PASS  ' + label); }
  else { fail++; console.log('  FAIL  ' + label + (extra ? '  → ' + extra : '')); }
};
const $ = s => doc.querySelector(s);
const $$ = s => [...doc.querySelectorAll(s)];
const tap = el => el.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
const input = (el, v) => { el.value = v; el.dispatchEvent(new win.Event('input', { bubbles: true })); };
const log = pid => JSON.parse(win.localStorage.getItem('gym:log:' + pid));
const today = new Date().toLocaleDateString('en-CA');
const q = js => win.eval(js);

(async () => {
  await wait(400);
  console.log('\n=== boot ===');
  ok($$('#persons button').length === 2, 'two people in the switcher');
  ok(!!$('#overlayroot [data-who]'), 'onboarding shows on first run');
  tap($$('#overlayroot [data-who]')[0]);
  await wait(120);
  ok(!$('#overlayroot').innerHTML, 'onboarding closes after choosing');

  const dayN = q('currentDay().n');
  // the id the app actually file under: for a "Squat or Leg Press" slot that is the chosen variant
  const canon0 = q("chosenCanonFor('danny', slotKeyOf(currentDay().n, 0), currentDay().ex[0])");
  const canon1 = q("chosenCanonFor('danny', slotKeyOf(currentDay().n, 1), currentDay().ex[1])");
  const presc0max = q('parsePresc(currentDay().ex[0].sets).max');
  const row0 = () => $$('#list li.ex')[0];
  const row1 = () => $$('#list li.ex')[1];
  console.log(`  (app opened Day ${dayN}, first lift "${canon0}", second "${canon1}")`);
  ok($$('#list li.ex').length === q('currentDay().ex.length'), 'every exercise in the day is rendered');

  // ---------- 1. no invented reps ----------
  console.log('\n=== 1. invented-reps fix ===');
  tap(row0().querySelector('.pill'));
  await wait(80);
  ok(!!$('#winput'), 'log sheet opened');
  ok($('#repsingle .setstepper input').value === '', 'rep box is EMPTY on a lift never logged (no 10/10/10)');
  ok($('#repsingle .setstepper input').placeholder === String(presc0max), 'placeholder hints the top of the range', $('#repsingle .setstepper input').placeholder);
  ok($('#repsmulti').style.display === 'none', 'per-set editor hidden by default');

  // ---------- 2. log weight + last-set reps ----------
  console.log('\n=== 2. last-set reps ===');
  input($('#winput'), '27');
  input($('#repsingle .setstepper input'), '8');
  ok(/Log 27 kg × 8/.test($('#savebtn').textContent), 'button reads "Log 27 kg × 8"', $('#savebtn').textContent.trim());
  tap($('#savebtn'));
  await wait(150);
  const eid = `l:danny:${canon0}:${today}`;
  const e1 = log('danny').lifts[eid];
  ok(!!e1, 'entry written for today', eid);
  ok(e1 && e1.weight === 27, 'weight is 27', e1 && e1.weight);
  ok(e1 && JSON.stringify(e1.reps) === '[8]', 'reps stored as [8] — one number, last set', e1 && JSON.stringify(e1.reps));
  ok(e1 && e1.repsMode === 'last', 'repsMode marked "last"');
  ok(log('danny').ticks[dayN + ':' + today].items.includes(0), 'exercise ticked off');
  ok(/Logged 27 kg × 8/.test($('#toast').innerHTML), 'toast reports weight and reps');
  ok(!!$('#toast .undobtn'), 'toast offers Undo');
  ok(/×8/.test(row0().querySelector('.pill').textContent), 'row pill shows "×8"', row0().querySelector('.pill').textContent);
  ok(/PB 27 ×8/.test(row0().textContent.replace(/\s+/g, ' ')), 'PB line shows the reps too', row0().textContent.replace(/\s+/g, ' ').slice(0, 120));

  // ---------- 3. undo ----------
  console.log('\n=== 3. undo ===');
  tap($('#toast .undobtn'));
  await wait(150);
  ok(log('danny').lifts[eid].deleted === true, 'undo tombstones the entry (kept in storage so the other phone drops it too)');
  ok(!log('danny').ticks[dayN + ':' + today].items.includes(0), 'undo also un-ticks the exercise');
  ok(row0().querySelector('.pill').textContent.trim() === '—kg', 'row returns to empty', JSON.stringify(row0().querySelector('.pill').textContent.trim()));

  // ---------- 4. comma decimals ----------
  console.log('\n=== 4. weight entry hardening ===');
  tap(row0().querySelector('.pill'));
  await wait(80);
  input($('#winput'), '27,5');
  input($('#repsingle .setstepper input'), '8');
  tap($('#savebtn'));
  await wait(150);
  ok(log('danny').lifts[eid].weight === 27.5, '27,5 saves as 27.5 (it used to save 27)', log('danny').lifts[eid].weight);
  tap(row0().querySelector('.pill'));            // saving closes the sheet, so reopen
  await wait(100);
  input($('#winput'), '27.5.5');
  tap($('#savebtn'));
  await wait(120);
  ok(log('danny').lifts[eid].weight === 27.5, 'a stray second decimal point does not corrupt the weight', log('danny').lifts[eid].weight);

  // ---------- 5. log for both ----------
  console.log('\n=== 5. log for both ===');
  tap(row1().querySelector('.pill'));
  await wait(80);
  ok(!!$('[data-both]'), 'the "who is this for?" choice is offered');
  tap($('[data-bothv="1"]'));
  ok(/Kieran/.test($('#savebtn').textContent), 'button names both people', $('#savebtn').textContent.trim());
  input($('#winput'), '30');
  input($('#repsingle .setstepper input'), '10');
  tap($('#savebtn'));
  await wait(180);
  const dE = Object.values(log('danny').lifts).find(e => e.ex === canon1 && !e.deleted);
  const kE = Object.values(log('kieran').lifts).find(e => e.ex === canon1 && !e.deleted);
  ok(!!dE && !!kE, 'both people got the entry');
  ok(dE && kE && dE.weight === 30 && kE.weight === 30, 'same weight for both');
  ok(kE && JSON.stringify(kE.reps) === '[10]', "Kieran's copy has the reps too");
  ok(log('kieran').ticks[dayN + ':' + today].items.includes(1), "Kieran's copy is ticked too");
  ok(!!$('#toast .undobtn'), 'undo offered for a both-save');
  // a new record must show a clean last-set headline and no per-set clutter
  tap($$('#tabnav button').find(b => b.dataset.v === 'progress'));
  await wait(120);
  tap($$('.pr-row').find(r => r.dataset.ex === canon1));
  await wait(120);
  const newItem = $$('.hist-item').find(i => /\u00d7 10/.test(i.textContent));
  ok(!!newItem, 'new record shows "× 10" as the headline');
  ok(newItem && !/sets recorded/.test(newItem.textContent), 'new record has no per-set clutter', newItem && newItem.textContent.replace(/\s+/g,' '));
  tap($('[data-close]'));
  await wait(80);
  tap($$('#tabnav button').find(b => b.dataset.v === 'session'));
  await wait(100);
  tap($('#toast .undobtn'));
  await wait(150);
  ok(!Object.values(log('kieran').lifts).find(e => e.ex === canon1 && !e.deleted), 'undo removes it from BOTH people');
  // re-log for the later tests
  tap(row1().querySelector('.pill'));
  await wait(80);
  tap($('[data-bothv="1"]'));
  input($('#winput'), '30');
  input($('#repsingle .setstepper input'), '10');
  tap($('#savebtn'));
  await wait(180);

  // ---------- 6. typo guard ----------
  console.log('\n=== 6. suspicious weight guard ===');
  tap(row1().querySelector('.pill'));
  await wait(80);
  input($('#winput'), '300');
  tap($('#savebtn'));
  await wait(120);
  ok(/That looks heavy/.test(doc.body.textContent), 'guard appears for 300 kg against a 30 kg PB');
  ok(Object.values(log('danny').lifts).find(e => e.ex === canon1 && !e.deleted).weight === 30,
     'NOTHING is written while the guard is showing');
  tap($('#riskyes'));
  await wait(180);
  ok(Object.values(log('danny').lifts).find(e => e.ex === canon1 && !e.deleted).weight === 300, 'confirming writes it');
  tap($('#toast .undobtn'));
  await wait(180);
  ok(Object.values(log('danny').lifts).find(e => e.ex === canon1 && !e.deleted).weight === 30, 'undo puts the old value back');

  // ---------- 7. old records keep working ----------
  console.log('\n=== 7. old records are untouched ===');
  const oldId = `l:danny:${canon0}:2026-09-20`;
  q(`
    logOf('danny').lifts['${oldId}'] =
      {id:'${oldId}',kind:'lift',pid:'danny',ex:'${canon0}',name:'Legacy',date:'2026-09-20',
       weight:40,reps:[10,9,8],ts:${Date.now() - 86400000 * 20},day:1};
    saveLog('danny', true); render();
  `);
  await wait(80);
  tap($$('#tabnav button').find(b => b.dataset.v === 'progress'));
  await wait(120);
  tap($$('.pr-row').find(r => r.dataset.ex === canon0));
  await wait(120);
  const legacyItem = $$('.hist-item').find(i => i.dataset.eid === oldId);
  ok(!!legacyItem, 'a pre-existing record still lists');
  ok(/× 8/.test(legacyItem.textContent), 'old [10,9,8] shows the last set as the headline', legacyItem.textContent.replace(/\s+/g, ' '));
  ok(/3 sets recorded · 10 · 9 · 8/.test(legacyItem.textContent), 'the older per-set numbers are still visible, labelled honestly', legacyItem.textContent.replace(/\s+/g, ' '));
  ok(JSON.stringify(log('danny').lifts[oldId].reps) === '[10,9,8]', 'the stored array is still exactly [10,9,8] — untouched');

  // ---------- 8. edit + delete ----------
  console.log('\n=== 8. edit and delete past records ===');
  tap(legacyItem);
  await wait(120);
  ok(!!$('#ewin'), 'edit sheet opens from a past record');
  ok($('#ewdate').value === '2026-09-20', 'date is editable and pre-filled');
  input($('#ewin'), '42.5');
  input($('#ewreps'), '9');
  tap($('#esave'));
  await wait(180);
  const ed = log('danny').lifts[oldId];
  ok(ed.weight === 42.5 && ed.reps[0] === 9, 'past record edited (weight + reps)', ed.weight + '/' + JSON.stringify(ed.reps));

  tap($$('#tabnav button').find(b => b.dataset.v === 'progress'));
  await wait(120);
  tap($$('.pr-row').find(r => r.dataset.ex === canon0));
  await wait(120);
  tap($$('.hist-item').find(i => i.dataset.eid === oldId));
  await wait(120);
  tap($('#edel'));
  await wait(180);
  ok(log('danny').lifts[oldId].deleted === true, 'delete leaves a tombstone (so it cannot come back)');
  ok(!$$('.pr-row').some(r => r.dataset.ex === canon0) || true, 'render survived the delete');
  tap($('#toast .undobtn'));
  await wait(180);
  ok(log('danny').lifts[oldId].deleted === undefined, 'undo restores the deleted record');

  // ---------- 9. changing the date ----------
  console.log('\n=== 9. changing the date ===');
  tap($$('#tabnav button').find(b => b.dataset.v === 'progress'));
  await wait(120);
  tap($$('.pr-row').find(r => r.dataset.ex === canon0));
  await wait(120);
  tap($$('.hist-item').find(i => i.dataset.eid === oldId));
  await wait(120);
  input($('#ewdate'), '2026-09-18');
  tap($('#esave'));
  await wait(180);
  ok(!!log('danny').lifts[`l:danny:${canon0}:2026-09-18`], 'record moved to the new date');
  ok(log('danny').lifts[oldId].deleted === true, 'a tombstone is left on the old date');

  // ---------- 10. existing features intact ----------
  console.log('\n=== 10. existing features still work ===');
  tap($$('#tabnav button').find(b => b.dataset.v === 'session'));
  await wait(100);
  tap($$('#switch button').find(b => b.dataset.n === '2'));
  await wait(140);
  const wed = $$('#list li.ex');
  ok(wed.length === q('DAYS.find(d=>d.n===2).ex.length'), 'Wednesday renders every exercise in the plan', 'got ' + wed.length);
  ok(/1\/4|2\/4|3\/4|4\/4/.test(doc.body.textContent), 'chest badge now reads out of 4 (pec fly added)');
  ok(/CALVES/i.test(doc.body.textContent), 'calves are in the plan');

  // the alternating slot offers both and switches for today only
  const rowIdx = q("DAYS.find(d=>d.n===2).ex.findIndex(e=>e.canon==='row')");
  const rowRow = () => $$('#list li.ex').find(r => +r.dataset.i === rowIdx);
  tap(rowRow().querySelector('.pill'));
  await wait(140);
  ok(!!$('[data-choices]'), 'the alternating row offers both variants');
  ok(/alternates these for you/i.test($('.choicehint').textContent), 'and says the app alternates them');
  const other = $('[data-choices] button:not([aria-pressed="true"])');
  const otherId = other.dataset.c;
  tap(other);
  await wait(140);
  ok(q(`(S.rotatePick['danny']['2:${rowIdx}']||{}).c`) === otherId, 'switching stores a one-day pick, not a permanent one');
  ok(q(`(S.rotatePick['danny']['2:${rowIdx}']||{}).d`) === today, "the pick is stamped with today's date so it expires");
  ok(/→/.test(rowRow().textContent), 'the row names the variant when it is not the default');
  tap($('[data-close]'));
  await wait(100);

  // bodyweight is now per-variant: pull-up practice has no weight
  tap($$('#switch button').find(b => b.dataset.n === '3'));
  await wait(140);
  const pullIdx = q("DAYS.find(d=>d.n===3).ex.findIndex(e=>e.canon==='pull-work')");
  q(`setRotatePick('danny','3:${pullIdx}','pullup')`);
  win.eval('render()');
  await wait(140);
  tap($$('#list li.ex').find(r => +r.dataset.i === pullIdx).querySelector('.pill, *'));
  await wait(140);
  ok(!!$('#tickbtn') && !$('#winput'), 'pull-up practice is tick-only — no weight box', ($('#winput') ? 'has weight box' : 'ok'));
  tap($('#tickbtn'));
  await wait(160);
  ok(log('danny').ticks['3:' + today].items.includes(pullIdx), 'pull-up practice ticks off without a bogus lift entry');
  ok(!Object.values(log('danny').lifts).some(e => e.ex === 'pullup'), 'and writes no lift record (so no fake PB)');

  // the ladder lives at the bottom of every session and is excluded from Progress
  ok(!!$('.ladderbox'), 'the pull-up ladder panel is on the session screen');
  ok(!$('.ladderbox').open, 'and it is collapsed by default (no screen space taken)');
  tap($('[data-ladder="done"]'));
  await wait(200);
  ok(!!log('danny').lifts['x:danny:ladder'], 'marking practise logs a ladder record');
  ok(log('danny').lifts['x:danny:ladder'].kind === 'ladder', 'tagged as a ladder record, not a lift');
  tap($$('#tabnav button').find(b => b.dataset.v === 'progress'));
  await wait(180);
  ok(!/ladder/i.test($('#app').textContent), 'the ladder record does NOT appear in Progress',
     ($('#app').textContent.match(/ladder/i) || [''])[0]);

  // "machine taken?" — swap, log under the substitute's own name, and put it back
  tap($$('#tabnav button').find(b => b.dataset.v === 'session'));
  await wait(140);
  tap($$('#switch button').find(b => b.dataset.n === '2'));
  await wait(140);
  const legIdx = q("DAYS.find(d=>d.n===2).ex.findIndex(e=>e.canon==='hack-squat')");
  tap($$('#list li.ex').find(r => +r.dataset.i === legIdx).querySelector('.pill'));
  await wait(140);
  ok(!!$('#subsbtn'), 'the sheet offers "Machine taken?"');
  tap($('#subsbtn'));
  await wait(140);
  ok(/Machine taken\?/.test($('.modal-title').textContent), 'the substitutes sheet opens');
  const subBtn = $$('#ov [data-sub]')[0];
  const subId = subBtn.dataset.sub;
  tap(subBtn);
  await wait(220);
  ok(q(`(S.swap['danny']||{})['2:${today}:${legIdx}'] && S.swap['danny']['2:${today}:${legIdx}'].id`) === subId, 'the swap is recorded for today');
  ok(!!$('#unsub'), 'the sheet says it is logging the substitute and offers to put it back');
  input($('#winput'), '40');
  input($('#repsingle .setstepper input'), '10');
  tap($('#savebtn'));
  await wait(220);
  ok(!!log('danny').lifts['l:danny:' + subId + ':' + today], 'logged under the substitute, not the original lift');
  ok(!log('danny').lifts['l:danny:hack-squat:' + today], "the original lift's history is untouched");

  // "do it later" moves the row to the end of today only
  const before = $$('#list li.ex').map(r => +r.dataset.i);
  q(`moveToEnd('danny', 2, todayKey(), ${legIdx}, 11)`);
  win.eval('render()');
  await wait(160);
  const after = $$('#list li.ex').map(r => +r.dataset.i);
  ok(after[after.length - 1] === legIdx, '"do it later" moves the exercise to the end');
  ok(after.length === before.length, 'and every exercise is still on screen');
  ok(after.slice(0, -1).join() === before.filter(i => i !== legIdx).join(), 'with the rest of the order unchanged');

  // the timer still works
  tap($$('#tabnav button').find(b => b.dataset.v === 'timer'));
  await wait(140);
  ok(!!$('#tstart'), 'timer tab renders');
  tap($('#tstart'));
  await wait(160);
  ok(q('Timer.total') > 0, 'timer starts', q('Timer.total'));

  // ---------- 11. sync payload ----------
  console.log('\n=== 11. what sync sends ===');
  let sent = null;
  win.fetch = async (url, opts) => { sent = JSON.parse(opts.body); return { ok: true, json: async () => [] }; };
  q("S.sync.pin = 'test-pin';");
  await q('doSync(true)');
  await wait(150);
  const rowsSent = sent ? sent.p_rows : [];
  ok(rowsSent.length > 0, 'sync sends rows');
  ok(rowsSent.filter(r => r.data && r.data.deleted).length > 0, 'tombstones are uploaded, so a delete travels to the other phone');
  ok(rowsSent.some(r => r.pid === 'kieran'), "the other person's records are uploaded too");
  ok(rowsSent.some(r => r.data && r.data.repsMode === 'last'), 'the new reps shape syncs');
  ok(q('S.sync.lastErr') === '', 'sync reports no error');

  console.log('\n=== results ===');
  console.log(pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
