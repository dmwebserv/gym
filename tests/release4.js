/* Release 4 verification — the Progress screen's four views, the session summary, the PB
   moment, and the partner's PB on your own rows. Runs the real app in jsdom. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, l, e) => { if (c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l + (e ? '  → ' + e : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- dates, all derived so this passes on any day ---------- */
const iso = d => d.toLocaleDateString('en-CA');
const shift = (days) => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate() + days); return d; };
const TODAY = iso(shift(0));
const D3 = iso(shift(-3)), D10 = iso(shift(-10)), D45 = iso(shift(-45)), LONG = iso(shift(-400));
function monthShifted(n){
  const d = new Date(); d.setHours(12,0,0,0); d.setMonth(d.getMonth() + n);
  return iso(d);
}
const THIS_M = monthShifted(0), LAST_M = monthShifted(-1);

const lift = (pid, ex, name, date, weight, reps, ts, day) => ({
  id:`l:${pid}:${ex}:${date}`, kind:'lift', pid, ex, name, date, weight,
  reps:[reps], repsMode:'last', ts:ts || Date.now(), day
});

const settings = { v:5, onboarded:true, owner:'danny', sel:'danny',
  people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
  legacyMigrated:true, lastChoice:{}, rotatePick:{}, swap:{}, dayOrder:{},
  sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false} };

const dannyLog = {
  lifts:{
    // two months of one lift, so "this month vs last" has something to compare
    'lp1': lift('danny','leg-press','Leg Press', THIS_M.slice(0,7) + '-04', 90, 10, 5000, 1),
    'lp2': lift('danny','leg-press','Leg Press', LAST_M.slice(0,7) + '-20', 80, 10, 4000, 1),
    // history spread out, including over a year ago for the anniversary line
    'bp1': lift('danny','flat-bench','Flat Bench Press', D45, 57.5, 8, 3000, 1),
    'bp2': lift('danny','flat-bench','Flat Bench Press', D10, 60, 8, 3500, 1),
    'hs1': lift('danny','hack-squat','Hack Squat', D3, 70, 10, 3600, 2),
    'old': lift('danny','dead-bug','Dead Bug', LONG, 20, 10, 1000, 3)
  },
  ticks:{ ['1:' + THIS_M.slice(0,7) + '-04']:{ items:[0,1], ts:5000 } }
};
const kieranLog = {
  lifts:{
    'k1': lift('kieran','leg-press','Leg Press', THIS_M.slice(0,7) + '-04', 110, 8, 5100, 1),
    'k2': lift('kieran','hack-squat','Hack Squat', D3, 55, 12, 5200, 2),
    'k3': lift('kieran','face-pull','Face Pull', D3, 25, 15, 5300, 2)
  },
  ticks:{}
};

const dom = new JSDOM(html, {
  url:'https://example.org/', runScripts:'dangerously', pretendToBeVisual:true,
  beforeParse(w){
    w.localStorage.setItem('gym:settings', JSON.stringify(settings));
    w.localStorage.setItem('gym:log:danny', JSON.stringify(dannyLog));
    w.localStorage.setItem('gym:log:kieran', JSON.stringify(kieranLog));
  }
});
const win = dom.window, doc = win.document;
win.confirm = () => true;
const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];
const tap = el => el.dispatchEvent(new win.MouseEvent('click', { bubbles:true }));
const q = js => win.eval(js);
const txt = () => $('#app').textContent;

(async () => {
  await wait(500);
  q("view='progress'; progressView='lifts'; render();");
  await wait(200);

  console.log('\n=== the Progress screen has four views ===');
  const tabs = $$('[data-pv]').map(b => b.dataset.pv);
  ok(tabs.join() === 'lifts,pbs,map,two', 'Lifts · PBs · Map · You two', tabs.join());
  ok($('[data-pv="lifts"]').getAttribute('aria-pressed') === 'true', 'it opens on your lifts');

  console.log('\n=== X168 — this month against last ===');
  ok(/This month vs last/.test(txt()), 'the comparison block is there');
  ok(/Leg Press/.test(txt()) && /80/.test(txt()) && /90/.test(txt()), 'it shows last month\'s best and this month\'s');
  ok(/\+10/.test(txt()), 'and the difference');
  ok(!/Hack Squat[\s\S]*This month vs last/.test(txt()), 'a lift only logged once is not compared');

  console.log('\n=== X120 — the PB wall ===');
  tap($('[data-pv="pbs"]'));
  await wait(200);
  ok(/The wall/.test(txt()), 'the wall view opens');
  const wallFirst = $$('.wallrow')[0].textContent.replace(/\s+/g,' ').trim();
  ok(/90/.test(wallFirst) && /Leg Press/.test(wallFirst), "sorted by heaviest first — Danny's 90kg leg press", wallFirst);
  ok(!/Invalid Date/.test(txt()), 'and every date on the wall is a real date');
  q("S.sel='kieran'; render();");
  await wait(200);
  ok(/110/.test($$('.wallrow')[0].textContent), "switching person shows Kieran's wall (110 leg press)");
  ok($$('.wallrow').length === 3, 'and only theirs', $$('.wallrow').length + ' rows');
  q("S.sel='danny'; render();");
  await wait(200);
  ok(/hack · |Hack Squat/.test(txt()), 'muscle and name are both shown per row');
  ok(/Dead Bug/.test(txt()), 'lifts that are no longer in the plan still have their PB — nothing is hidden');
  tap($('[data-pbsort="name"]'));
  await wait(200);
  const names = $$('.wallrow .wn').map(e => e.textContent);
  ok(names.join() === names.slice().sort().join(), 'the A–Z sort works', names.join(' / '));
  tap($('[data-pbsort="recent"]'));
  await wait(200);
  ok($('[data-pbsort="recent"]').getAttribute('aria-pressed') === 'true', 'and the newest-first sort');
  ok(/to <b>\d+<\/b>|more lifts/.test($('#app').innerHTML), 'X174: it nudges you towards the next milestone');

  console.log('\n=== X108 — the map ===');
  tap($('[data-pv="map"]'));
  await wait(200);
  ok($$('.hmweek').length === 12, 'twelve weeks are drawn', $$('.hmweek').length + '');
  ok($$('.hmweek .hmc').length === 36, 'one square per training day per week (3 × 12)', $$('.hmweek .hmc').length + '');
  ok($$('.hmc.l3').length >= 1, 'a fully logged day shows as a full square');
  ok(/This week against the plan/.test(txt()), 'the muscle frequency block is there');
  ok($$('.mfreq').length >= 8, 'every muscle in the plan gets a line', $$('.mfreq').length + '');
  ok(/sessions all time|in 12 weeks|weeks in a row/.test(txt()), 'and the three totals');

  console.log('\n=== X123 + X163 — you two ===');
  tap($('[data-pv="two"]'));
  await wait(200);
  ok(/Lifts you both do/.test(txt()), 'the comparison is scoped to lifts you both do');
  ok(/Danny/.test(txt()) && /Kieran/.test(txt()), 'both names appear');
  ok($$('.vsrow').length === 2, 'leg press and hack squat are compared, nothing else', $$('.vsrow').length + '');
  ok(/Only one of you has logged/.test(txt()), 'lifts only one of you has logged are listed separately');
  ok(/Face Pull/.test(txt()) && /Dead Bug/.test(txt()), 'including the retired one, for the person who did it');
  ok(/latest/.test(txt()) && /3 days ago/.test(txt()), 'X163: the partner feed shows what they logged and when');

  console.log('\n=== X118 / X184 — memories ===');
  ok(/On this day/.test(txt()), 'the memories block is there');
  ok(/since you logged your first lift/.test(txt()), 'and counts back to the very first lift you logged');
  ok(/Dead Bug/.test(txt()), 'naming it');

  console.log('\n=== nothing on these screens writes to the log ===');
  const before = win.localStorage.getItem('gym:log:danny') + win.localStorage.getItem('gym:log:kieran');
  for (const v of ['lifts','pbs','map','two','lifts']){ q(`progressView='${v}'; render();`); await wait(60); }
  const after = win.localStorage.getItem('gym:log:danny') + win.localStorage.getItem('gym:log:kieran');
  ok(before === after, 'viewing Progress never changes a single stored byte');

  console.log('\n=== X157 / X158 — the session moment ===');
  q("view='session'; render();");
  await wait(200);
  ok(!/Session complete/.test(txt()), 'no summary while the session is unfinished');
  const dayN = q('currentDay().n');
  const total = q('currentDay().ex.length');
  // tick everything and log a weight on the first two
  q(`(function(){
    const d = currentDay(), date = todayKey();
    const items = d.ex.map((_, i) => i);
    logOf('danny').ticks[tickKey(d.n, date)] = { items, ts: Date.now() };
    const a = { id:'l:danny:'+chosenCanonFor('danny', slotKeyOf(d.n,0), d.ex[0])+':'+date, kind:'lift', pid:'danny',
      ex:chosenCanonFor('danny', slotKeyOf(d.n,0), d.ex[0]), name:d.ex[0].name, date, weight:100, reps:[8],
      repsMode:'last', ts:Date.now() - 3600000, day:d.n };
    logOf('danny').lifts[a.id] = a;
    saveLog('danny', true); render();
  })()`);
  await wait(250);
  ok(/Session complete/.test(txt()), `the summary appears once all ${total} are ticked off`);
  ok(/of \d+ logged|logged/.test(txt()), 'it says how many were logged');
  ok(/kg moved/.test(txt()), 'how much you moved in total');
  ok(/min/.test(txt()), 'and how long you were at it');
  ok(/Best set:/.test(txt()), 'the best set of the day');

  console.log('\n=== X158 — a PB gets a moment ===');
  // slot 0 is a plain slot (no variants), so a PB definitely exists for it
  const canon = q(`chosenCanonFor('danny', slotKeyOf(currentDay().n, 0), currentDay().ex[0])`);
  ok(!!q(`personStats('danny', ${JSON.stringify(canon)})`), `slot 0 has a PB to beat (${canon})`);
  const weight = q(`personStats('danny', ${JSON.stringify(canon)}).pb.weight`);
  q(`writeLift(0, [{id:'danny', name:'Danny'}], { w:${weight} + 5, reps:[8], repsMode:'last' })`);
  await wait(250);
  ok($('#pbbanner').classList.contains('show'), 'beating a PB raises the banner');
  ok(/new PB for Danny/.test($('#pbbanner').textContent), 'and it says whose PB it is', $('#pbbanner').textContent.trim());
  q("document.getElementById('pbbanner').classList.remove('show')");   // clear the moment
  q(`writeLift(0, [{id:'danny', name:'Danny'}], { w:${weight} - 5, reps:[8], repsMode:'last' })`);
  await wait(250);
  ok(!$('#pbbanner').classList.contains('show'), 'a lighter set gets no banner — it has to be a real PB');

  console.log('\n=== X183 — whose PB is it ===');
  q("view='session'; render();");
  await wait(200);
  const partnerLines = $$('#list .pbline.partner').map(e => e.textContent.replace(/\s+/g,' ').trim());
  ok(partnerLines.length >= 1, "the partner's PB is on the rows", partnerLines.length + ' rows');
  ok(/Kieran's PB/.test(partnerLines.join(' | ')), "and it is named — Kieran's PB, never mistaken for your own", partnerLines[0]);
  ok(!/^PB/.test(partnerLines[0]), "the partner line never looks like your own PB line");


  console.log('\n=== X38 — the last three sessions, in the sheet ===');
  q("view='session'; render();");
  await wait(200);
  tap($$('#list .pill')[0]);
  await wait(200);
  ok(!!$('.l3'), 'the sheet lists your recent sessions for that lift');
  const l3 = $$('.l3 .l3row').length;
  ok(l3 >= 1 && l3 <= 3, 'up to three, newest first', l3 + ' rows');
  ok(!!$('.l3 .l3row.now'), 'the most recent one is highlighted');
  ok(/Last \d sessions|Last session/.test($('.l3').textContent), 'labelled plainly');
  q('closeOverlay()');

  console.log('\n=== X144 — plate calculator ===');
  const doMath = (t, b) => JSON.parse(q(`JSON.stringify(plateMath(${t}, ${b}))`));
  let r = doMath(100, 20);
  ok(r.perSide === 40, '100 kg on a 20 kg bar is 40 kg a side', JSON.stringify(r.perSide));
  ok(r.plates.map(p => p.plate + '×' + p.n).join(' + ') === '25×1 + 15×1', 'which is a 25 and a 15', r.plates.map(p => p.plate + '×' + p.n).join(' + '));
  ok(r.remainder === 0, 'and it adds up exactly');
  r = doMath(102.5, 20);
  ok(r.perSide === 41.25 && r.remainder === 0, 'odd numbers resolve to real plates (41.25 a side)', JSON.stringify(r.plates));
  r = doMath(20, 20);
  ok(r.perSide === 0 && r.plates.length === 0, 'an empty bar needs no plates');
  r = doMath(15, 20);
  ok(!!r.error, 'and a weight below the bar is refused rather than guessed');
  r = doMath(101, 20);
  ok(r.remainder > 0, 'an impossible number says so instead of pretending', JSON.stringify(r.remainder));
  r = doMath(60, 0);
  ok(r.perSide === 30 && r.remainder === 0, 'a plate-loaded machine (no bar) works too');
  tap($('#platebtn'));
  await wait(200);
  ok(!!$('#plwt') && !!$('#plateres'), 'the sheet opens with a target and a result');
  ok(/per side/.test($('#overlayroot').textContent), 'and says the plates are per side');
  q('closeOverlay()');

  console.log('\n=== X50 — search the log ===');
  tap($('#searchbtn2'));
  await wait(200);
  const qi = $('#q');
  qi.value = 'leg'; qi.dispatchEvent(new win.Event('input', { bubbles:true }));
  await wait(150);
  ok(/match/.test($('#qres').textContent), 'a two-letter search finds things');
  ok(/Leg Press/.test($('#qres').textContent), 'and names them');
  qi.value = 'zzzz'; qi.dispatchEvent(new win.Event('input', { bubbles:true }));
  await wait(150);
  ok(/Nothing matching/.test($('#qres').textContent), 'nonsense finds nothing, said plainly');
  qi.value = 'k'; qi.dispatchEvent(new win.Event('input', { bubbles:true }));
  await wait(150);
  ok(/at least two letters/.test($('#qres').textContent), 'one letter asks for more rather than searching');
  q('closeOverlay()');


  console.log('\n=== X25 — long-press repeats last time ===');
  q("view='session'; render();");
  await wait(200);
  {
    // a clean slate for slot 0: one older session to repeat, nothing logged today
    q(`(function(){
      const d = currentDay(), date = todayKey();
      const c = chosenCanonFor('danny', slotKeyOf(d.n, 0), d.ex[0]);
      // one clean previous session for this lift, and nothing logged today
      for (const k of Object.keys(logOf('danny').lifts))
        if (logOf('danny').lifts[k].ex === c) delete logOf('danny').lifts[k];
      logOf('danny').lifts['l:danny:repeat:test'] = { id:'l:danny:repeat:test', kind:'lift', pid:'danny',
        ex:c, name:d.ex[0].name, date:'${TODAY}', weight:66, reps:[9], repsMode:'last', ts:Date.now() - 172800000, day:d.n };
      delete logOf('danny').ticks[tickKey(d.n, date)];
      saveLog('danny', true); render();
    })()`);
    await wait(220);
    const canon0 = q(`chosenCanonFor('danny', slotKeyOf(currentDay().n, 0), currentDay().ex[0])`);
    ok(q(`personStats('danny', ${JSON.stringify(canon0)}).last.weight`) === 66,
       'the previous session to repeat is in place (66 kg)');
    const li = $$('#list li.ex')[0];
    const pill = li.querySelector('.pill');
    pill.dispatchEvent(new win.PointerEvent('pointerdown', { bubbles:true }));
    await wait(700);                                    // longer than the 450ms press
    const logged = q(`(logOf('danny').lifts['l:danny:' + ${JSON.stringify(canon0)} + ':' + todayKey()] || {}).weight`);
    ok(logged === 66, "holding a pill logs last time's weight with no sheet at all", String(logged));
    ok(q(`(logOf('danny').lifts['l:danny:' + ${JSON.stringify(canon0)} + ':' + todayKey()] || {}).repsMode`) === 'last',
       'and it is written the same way the sheet writes it');
    ok(q(`ticksFor('danny', currentDay().n, todayKey()).includes(0)`), 'and the exercise is ticked off too');
    ok(/Repeated 66/.test($('#toast').textContent), 'the toast says what it repeated', $('#toast').textContent.trim());
    pill.dispatchEvent(new win.PointerEvent('pointerup', { bubbles:true }));
    tap(li);
    await wait(150);
    ok(!$('#overlayroot').innerHTML, 'and the tap that ends the press does not also open the sheet');
    await wait(700);
    tap($$('#list li.ex')[0].querySelector('.pill'));
    await wait(220);
    ok(!!$('#winput'), 'a quick tap still opens the sheet as before');
    q('closeOverlay()');
  }

  console.log('\n=== X79 — short on time ===');
  tap($('#shortbtn'));
  await wait(220);
  ok(!!$('#shortmins'), 'the sheet asks how long you have');
  const trim45 = JSON.parse(q(`JSON.stringify(trimFor(45, currentDay()))`));
  const trim25 = JSON.parse(q(`JSON.stringify(trimFor(25, currentDay()))`));
  const totalEx = q('currentDay().ex.length');
  ok(trim45.keep.length > 0 && trim45.keep.length <= totalEx, '45 minutes keeps a sensible subset', trim45.keep.length + '/' + totalEx);
  ok(trim25.keep.length <= trim45.keep.length, '25 minutes keeps no more than 45', trim25.keep.length + ' vs ' + trim45.keep.length);
  const keptFirst = q(`trimFor(30, currentDay()).keep.includes(0)`);
  ok(keptFirst, 'the first big lift of the day always survives a cut');
  q(`setShortFor('danny', currentDay().n, todayKey(), trimFor(30, currentDay()).keep, 30); render();`);
  await wait(220);
  const cut = $$('#list li.ex.cut').length;
  ok(cut > 0, 'the trimmed rows are marked on the session', cut + ' left out');
  ok(/left out today/.test(txt()), 'and say so in words, not just greyed out');
  ok(/Trimmed to 30 min/.test(txt()), 'the button shows that today is trimmed');
  ok($$('#list li.ex').length === totalEx, 'nothing is removed from the plan — all rows are still listed');
  q(`setShortFor('danny', currentDay().n, todayKey(), null, 0); render();`);
  await wait(200);
  ok($$('#list li.ex.cut').length === 0, 'and it clears completely');
  q(`S.short['danny'] = { key:(currentDay().n + ':1999-01-01'), keep:[0], mins:25 }; saveSettings(); render();`);
  await wait(200);
  ok($$('#list li.ex.cut').length === 0, 'yesterday\'s trim never leaks into today');
  q("S.short = {}; saveSettings(); render();");
  await wait(150);

  console.log('\n=== the log sheet still behaves ===');
  tap($$('#list li.ex')[0].querySelector('.pill'));
  await wait(200);
  ok(!!$('#winput') && !!$('#savebtn'), 'it opens with the weight field and save button');
  ok(!!$('.l3'), 'with the last three sessions listed');
  q('closeOverlay()');


  console.log('\n=== X46 — the superset hands over by itself ===');
  {
    // find a slot that is supersetted, wherever today falls in the week
    const info = JSON.parse(q(`JSON.stringify((function(){
      for (let d = 0; d < DAYS.length; d++){
        for (let i = 0; i < DAYS[d].ex.length; i++){
          const s = DAYS[d].ex[i];
          if (s.supersetWith != null) return { dayN:DAYS[d].n, idx:i, pair:s.supersetWith, dow:DAYS[d].dow };
        }
      }
      return null;
    })())`));
    ok(!!info, 'the plan still contains a superset pair');
    const dayFor = n => q(`DAYS.find(d => d.n === ${n}).dow`);
    // jump the app to that day's session, whatever today is
    q(`view='session'; sessionKey=null; window.__forceDay = ${info.dayN};`);
    q(`currentDay = (function(orig){ return function(){ const d = DAYS.find(x => x.n === window.__forceDay); return d || orig(); }; })(currentDay);`);
    q('render();');
    await wait(250);
    const slotName = q(`currentDay().ex[${info.idx}].name`);
    const pairName = q(`currentDay().ex[${info.pair}].name`);
    tap($$('#list li.ex')[info.idx].querySelector('.pill'));
    await wait(250);
    ok(!!$('#winput'), `the sheet opens for ${slotName}`);
    const wi = $('#winput');
    wi.value = '30'; wi.dispatchEvent(new win.Event('input', { bubbles:true }));
    const ri = $('#repsingle .setstepper input');
    ri.value = '12'; ri.dispatchEvent(new win.Event('input', { bubbles:true }));
    tap($('#savebtn'));
    await wait(400);
    ok(!!$('#overlayroot').innerHTML, 'saving one half of the superset opens the other half straight away');
    ok(new RegExp(pairName.split(' ')[0]).test($('#overlayroot').textContent), `and it is ${pairName}`, $('#overlayroot').textContent.slice(0, 90).replace(/\s+/g,' '));
    ok(!!$('.superset-note'), 'with a note explaining what just happened');
    ok(/logged/.test($('.superset-note').textContent), 'naming what was logged and what is next');
    const wi2 = $('#winput');
    wi2.value = '25'; wi2.dispatchEvent(new win.Event('input', { bubbles:true }));
    const ri2 = $('#repsingle .setstepper input');
    ri2.value = '15'; ri2.dispatchEvent(new win.Event('input', { bubbles:true }));
    tap($('#savebtn'));
    await wait(400);
    ok(!$('#overlayroot').innerHTML, 'saving the second half closes the sheets — no loop');
    const both = q(`ticksFor('danny', currentDay().n, todayKey())`);
    ok(both.includes(info.idx) && both.includes(info.pair), 'both halves are ticked', JSON.stringify(both));
    const cA = q(`chosenCanonFor('danny', slotKeyOf(currentDay().n, ${info.idx}), currentDay().ex[${info.idx}])`);
    const cB = q(`chosenCanonFor('danny', slotKeyOf(currentDay().n, ${info.pair}), currentDay().ex[${info.pair}])`);
    ok(q(`(logOf('danny').lifts['l:danny:' + ${JSON.stringify(cA)} + ':' + todayKey()] || {}).weight`) === 30,
       'each half keeps its own weight in its own record');
    ok(q(`(logOf('danny').lifts['l:danny:' + ${JSON.stringify(cB)} + ':' + todayKey()] || {}).weight`) === 25,
       'and the second is separate, not merged');
    ok(cA !== cB, 'the two halves are different records', cA + ' vs ' + cB);
    tap($$('#list li.ex')[0].querySelector('.pill'));
    await wait(250);
    q('closeOverlay()');
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
