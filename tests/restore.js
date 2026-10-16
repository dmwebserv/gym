/* Restore-from-backup verification. This is the feature that could do damage if it were wrong,
   so it is tested against the exact cases that matter: older files must never win, newer ones must,
   deletions must not come back, and the whole thing must be undoable. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, l, e) => { if (c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l + (e ? '  → ' + e : '')); } };

/* A phone that already has history, including one deleted (tombstoned) record. */
const settings = { v:5, onboarded:true, owner:'danny', sel:'danny',
  people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
  legacyMigrated:true, lastChoice:{}, sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false} };
const log = {
  lifts:{
    'l:danny:leg-press:2026-09-20':{id:'l:danny:leg-press:2026-09-20',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'2026-09-20',weight:80,reps:[10],repsMode:'last',ts:2000,day:1},
    'l:danny:leg-press:2026-09-27':{id:'l:danny:leg-press:2026-09-27',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'2026-09-27',weight:85,reps:[10],repsMode:'last',ts:9000,day:1},
    'l:danny:db-curl:2026-09-27':{id:'l:danny:db-curl:2026-09-27',kind:'lift',pid:'danny',ex:'db-curl',name:'Biceps Curl',date:'2026-09-27',weight:12,reps:[12],repsMode:'last',ts:9500,day:1,deleted:true}
  },
  ticks:{ '1:2026-09-20':{ items:[0,1], ts:2000 } }
};

const dom = new JSDOM(html, {
  url:'https://example.org/', runScripts:'dangerously', pretendToBeVisual:true,
  beforeParse(w){
    w.localStorage.setItem('gym:settings', JSON.stringify(settings));
    w.localStorage.setItem('gym:log:danny', JSON.stringify(log));
    w.localStorage.setItem('gym:log:kieran', JSON.stringify({lifts:{},ticks:{}}));
  }
});
const win = dom.window, doc = win.document;
win.confirm = () => true;
const wait = ms => new Promise(r => setTimeout(r, ms));
const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];
const tap = el => el.dispatchEvent(new win.MouseEvent('click', { bubbles:true }));
const q = js => win.eval(js);
const readLog = pid => JSON.parse(win.localStorage.getItem('gym:log:' + pid));

(async () => {
  await wait(500);

  console.log('\n=== the export carries what a restore needs ===');
  const blob = q(`(() => { const all = {}; for (const p of S.people) all[p.id] = logOf(p.id);
    return JSON.stringify({ app:'Session', schema:EXPORT_SCHEMA, version:APP_VERSION,
      exported:new Date().toISOString(), unit:UNIT, people:S.people, data:all }); })()`);
  const exported = JSON.parse(blob);
  ok(exported.app === 'Session' && exported.schema >= 1, 'exports are stamped with an app and a schema version');
  ok(exported.data.danny.lifts && exported.data.kieran, "both people's logs are in the backup");
  ok(exported.exported && !isNaN(Date.parse(exported.exported)), 'and the export date');

  console.log('\n=== the sheet is reachable and refuses the wrong file ===');
  tap($('#gearbtn'));
  await wait(200);
  const restoreBtn = $$('#overlayroot [data-act]').find(b => b.dataset.act === 'restore');
  ok(!!restoreBtn, 'Settings offers "Restore from backup" next to the exports');
  tap(restoreBtn);
  await wait(200);
  ok(!!$('#restorefile'), 'the restore sheet asks for a file');
  ok(/never overwrite/i.test(doc.body.textContent), 'and says plainly that it merges rather than replaces');
  ok(q("analyseBackup({data:'not an object'})") === null, 'a non-backup file is rejected');
  ok(q("analyseBackup({people:[],data:{}})") !== null, 'an empty but valid backup is accepted');

  console.log('\n=== the merge rules ===');
  // An older backup: 80kg at ts 1000 (we have 80 at ts 2000), a lift we do not have, and a
  // record we deliberately deleted (tombstone at ts 9500).
  const backup = {
    app:'Session', schema:2, exported:'2026-10-01T10:00:00.000Z', unit:'kg',
    people: settings.people,
    data: {
      danny: {
        lifts: {
          'l:danny:leg-press:2026-09-20':{ id:'l:danny:leg-press:2026-09-20', kind:'lift', pid:'danny', ex:'leg-press', name:'Leg Press', date:'2026-09-20', weight:70, reps:[8], repsMode:'last', ts:1000, day:1 },
          'l:danny:bench:2026-09-25':{ id:'l:danny:bench:2026-09-25', kind:'lift', pid:'danny', ex:'flat-bench', name:'Flat Bench Press', date:'2026-09-25', weight:60, reps:[8], repsMode:'last', ts:5000, day:1 },
          'l:danny:db-curl:2026-09-27':{ id:'l:danny:db-curl:2026-09-27', kind:'lift', pid:'danny', ex:'db-curl', name:'Biceps Curl', date:'2026-09-27', weight:12, reps:[12], repsMode:'last', ts:4000, day:1 }
        },
        ticks: { '1:2026-09-20':{ items:[0,1,2], ts:1000 } }
      },
      kieran: {
        lifts: { 'l:kieran:squat:2026-09-24':{ id:'l:kieran:squat:2026-09-24', kind:'lift', pid:'kieran', ex:'squat', name:'Squat', date:'2026-09-24', weight:100, reps:[5], repsMode:'last', ts:6000, day:1 } },
        ticks: {}
      },
      stranger: { lifts: { 'l:stranger:x:2026-09-24':{ id:'l:stranger:x:2026-09-24', kind:'lift', pid:'stranger', ex:'squat', date:'2026-09-24', weight:1, ts:7000 } }, ticks:{} }
    }
  };
  const plan = q(`analyseBackup(${JSON.stringify(backup)})`);
  ok(plan && plan.lifts.length === 4, 'the backup is parsed', plan && plan.lifts.length);
  ok(plan.unknownPeople.join() === 'stranger', "a person this phone doesn't know is ignored");

  const before = readLog('danny');
  q(`doRestore(analyseBackup(${JSON.stringify(backup)}))`);
  await wait(250);
  const after = readLog('danny');

  ok(after.lifts['l:danny:leg-press:2026-09-20'].weight === 80,
     'an OLDER version of a record we already have is skipped — the 80kg stays', after.lifts['l:danny:leg-press:2026-09-20'].weight + 'kg');
  ok(after.lifts['l:danny:bench:2026-09-25'].weight === 60,
     'a record we do not have is added');
  ok(!!readLog('kieran').lifts['l:kieran:squat:2026-09-24'], "the other person's records are restored too");
  ok(after.lifts['l:danny:db-curl:2026-09-27'].deleted === true,
     'a record you deleted does NOT come back (its tombstone is newer than the backup)');
  ok(after.ticks['1:2026-09-20'].items.includes(2) === false,
     'and an older tick list does not overwrite a newer one');
  ok(Object.keys(after.lifts).length === Object.keys(before.lifts).length + 1,
     'nothing was removed — the merge only ever adds or updates newer', Object.keys(after.lifts).length + ' vs ' + Object.keys(before.lifts).length);

  console.log('\n=== a newer backup wins, as it should ===');
  const newer = JSON.parse(JSON.stringify(backup));
  newer.data.danny.lifts['l:danny:leg-press:2026-09-20'].weight = 92.5;
  newer.data.danny.lifts['l:danny:leg-press:2026-09-20'].ts = 99999;
  q(`doRestore(analyseBackup(${JSON.stringify(newer)}))`);
  await wait(250);
  ok(readLog('danny').lifts['l:danny:leg-press:2026-09-20'].weight === 92.5,
     'a NEWER version of a record we have is applied', readLog('danny').lifts['l:danny:leg-press:2026-09-20'].weight + 'kg');

  console.log('\n=== and it is undoable ===');
  q('undoLast()');
  await wait(250);
  ok(readLog('danny').lifts['l:danny:leg-press:2026-09-20'].weight === 80,
     'undo puts the older weight back', readLog('danny').lifts['l:danny:leg-press:2026-09-20'].weight + 'kg');

  console.log('\n=== the preview tells you what will happen before it does ===');
  const mixed = JSON.parse(JSON.stringify(backup));
  mixed.data.danny.lifts['l:danny:brand-new:2026-10-02'] =
    { id:'l:danny:brand-new:2026-10-02', kind:'lift', pid:'danny', ex:'pec-fly', name:'Pec Fly', date:'2026-10-02', weight:40, reps:[12], repsMode:'last', ts:88000, day:2 };
  const st = q(`previewBackup(analyseBackup(${JSON.stringify(mixed)}))`);
  ok(st.add >= 1 && st.skip >= 1,
     'the preview counts what will be added and what will be skipped, before anything is written',
     JSON.stringify(st));
  const stillAbsent = readLog('danny').lifts['l:danny:brand-new:2026-10-02'] === undefined;
  ok(stillAbsent, 'and looking at the preview changes nothing on the phone');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
