/* Release 2 / v5.1 verification — the exact 3-Day Gym Plan, historical PBs,
   new exercises going through the same logging path, the iPhone safe-area fix,
   and the lighter session UI. Runs the real app in jsdom with old phone data. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8');
const today = new Date().toLocaleDateString('en-CA');

const settings = { v:5, onboarded:true, owner:'danny', sel:'danny',
  people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
  legacyMigrated:true, lastChoice:{}, rotatePick:{}, swap:{}, dayOrder:{}, short:{},
  sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false} };

const lift = (pid, ex, name, date, weight, reps, ts, day) => ({
  id:`l:${pid}:${ex}:${date}`, kind:'lift', pid, ex, name, date, weight,
  reps, repsMode:'last', ts, day
});
const oldLog = {
  lifts:{
    'l:danny:squat:2026-10-01': lift('danny','squat','Barbell Back Squat','2026-10-01',100,5,1759300000000,1),
    'l:danny:bar-bench:2026-10-01': lift('danny','bar-bench','Barbell Bench Press','2026-10-01',80,5,1759300001000,1),
    'l:danny:flat-bench:2026-09-01': lift('danny','flat-bench','Flat Bench Press','2026-09-01',72.5,8,1756700000000,1),
    'l:danny:rdl:2026-10-01': lift('danny','rdl','Romanian Deadlift','2026-10-01',90,7,1759300002000,1),
    'l:danny:tri-pushdown:2026-10-01': lift('danny','tri-pushdown','Cable Triceps Pushdown','2026-10-01',30,12,1759300003000,1),
    'l:danny:leg-press:2026-10-04': lift('danny','leg-press','Leg Press','2026-10-04',150,10,1759500000000,2),
    'l:danny:incline-db-press:2026-10-04': lift('danny','incline-db-press','Incline Dumbbell Bench Press','2026-10-04',32.5,10,1759500001000,2),
    'l:danny:incline-bench:2026-09-04': lift('danny','incline-bench','Incline Bench Press','2026-09-04',30,10,1756900000000,2),
    'l:danny:lat-pulldown:2026-10-04': lift('danny','lat-pulldown','Lat Pulldown','2026-10-04',60,10,1759500002000,2),
    'l:danny:leg-curl:2026-10-04': lift('danny','leg-curl','Seated Leg Curl','2026-10-04',50,12,1759500003000,2),
    'l:danny:lat-raise:2026-10-04': lift('danny','lat-raise','Dumbbell Lateral Raise','2026-10-04',12,15,1759500004000,2),
    'l:danny:db-curl:2026-10-04': lift('danny','db-curl','Dumbbell Biceps Curl','2026-10-04',16,12,1759500005000,2),
    'l:danny:shoulder-press:2026-10-06': lift('danny','shoulder-press','Standing Overhead Press','2026-10-06',45,5,1759700000000,3),
    'l:danny:leg-extension:2026-10-06': lift('danny','leg-extension','Leg Extensions','2026-10-06',70,10,1759700001000,3),
    'l:danny:hip-thrust:2026-09-21': lift('danny','hip-thrust','Hip Thrust','2026-09-21',60,10,1758400000000,2),
    'l:danny:plank:2026-09-21': lift('danny','plank','Plank','2026-09-21',10,1,1758400001000,2),
    'l:danny:dead-bug:2026-09-21': lift('danny','dead-bug','Dead Bug','2026-09-21',5,10,1758400002000,3)
  },
  ticks:{}
};
const kieranLog = {
  lifts:{
    'l:kieran:leg-press:2026-10-04': lift('kieran','leg-press','Leg Press','2026-10-04',160,10,1759500006000,2)
  },
  ticks:{}
};
const seed = JSON.stringify(oldLog);

const dom = new JSDOM(html, {
  url:'https://example.org/', runScripts:'dangerously', pretendToBeVisual:true,
  beforeParse(w){
    w.localStorage.setItem('gym:settings', JSON.stringify(settings));
    w.localStorage.setItem('gym:log:danny', seed);
    w.localStorage.setItem('gym:log:kieran', JSON.stringify(kieranLog));
  }
});
const win = dom.window, doc = win.document;
win.confirm = () => true;
const wait = ms => new Promise(r => setTimeout(r, ms));
let pass=0, fail=0;
const ok=(c,l,e)=>{ if(c){pass++;console.log('  PASS  '+l);} else {fail++;console.log('  FAIL  '+l+(e?'  → '+e:''));} };
const $=s=>doc.querySelector(s), $$=s=>[...doc.querySelectorAll(s)];
const tap=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const input=(el,v)=>{ el.value=v; el.dispatchEvent(new win.Event('input',{bubbles:true})); };
const q=js=>win.eval(js);
const log=pid=>JSON.parse(win.localStorage.getItem('gym:log:'+pid));
const text=()=>$('#app').textContent.replace(/\s+/g,' ');
const goDay=async n=>{ tap($$('#switch button').find(b=>b.dataset.n===String(n))); await wait(140); };
const row=i=>$$('#list li.ex').find(r=>+r.dataset.i===i);
const dayEx=n=>q(`DAYS.find(d=>d.n===${n}).ex.map(e=>e.name+'|'+e.sets)`);

(async()=>{
  await wait(500);
  console.log('\n=== the PDF routine is exact ===');
  const expected = {
    1:{ label:'MON', dow:1, title:'Strength A', ex:[
      'Barbell Back Squat|3 × 4–6','Barbell Bench Press|3 × 4–6','Chest-Supported Row|3 × 5–8','Romanian Deadlift|2 × 6–8','Cable Triceps Pushdown|2 × 10–15']},
    2:{ label:'WED', dow:3, title:'Hypertrophy', ex:[
      'Leg Press|3 × 8–12','Incline Dumbbell Bench Press|3 × 8–12','Lat Pulldown|3 × 8–12','Seated Leg Curl|3 × 10–15','Dumbbell Lateral Raise|3 × 12–20','Dumbbell Biceps Curl|3 × 10–15']},
    3:{ label:'FRI', dow:5, title:'Strength B', ex:[
      'Conventional Deadlift|3 × 3–5','Standing Overhead Press|3 × 4–6','Pull-ups or Weighted Pull-ups|3 × 5–8','Leg Extensions|2 × 8–12','Hammer Curls|2 × 8–12']}
  };
  for (const n of [1,2,3]){
    const d=expected[n];
    ok(dayEx(n).join('|') === d.ex.join('|'), `Day ${n} exercises, sets and reps match the PDF`, dayEx(n).join(' | '));
    ok(q(`DAYS.find(d=>d.n===${n}).title`) === d.title, `Day ${n} is "${d.title}"`);
    ok(q(`DAYS.find(d=>d.n===${n}).label`) === d.label && q(`DAYS.find(d=>d.n===${n}).dow`) === d.dow,
       `Day ${n} is scheduled on ${d.label}`);
  }
  ok(q("DAYS.reduce((t,d)=>t+d.ex.reduce((s,e)=>s+parsePresc(e.sets).sets,0),0)") === 44,
     'the week has exactly 44 prescribed sets', q("DAYS.reduce((t,d)=>t+d.ex.reduce((s,e)=>s+parsePresc(e.sets).sets,0),0)"));
  ok(q("DAYS.every(d=>d.ex.every(e=>e.rest && e.restSec))"), 'every row carries its PDF rest guidance and a timer duration');
  ok(/2–4 min on squats and bench/.test(q('DAYS[0].rest')), 'Strength A keeps its rest guidance');
  ok(/1–2 min on most exercises/.test(q('DAYS[1].rest')), 'Hypertrophy keeps its rest guidance');
  ok(/3–4 min on deadlifts/.test(q('DAYS[2].rest')), 'Strength B keeps its rest guidance');
  ok(q("DAYS[1].ex[4].supersetWith===5 && DAYS[1].ex[5].supersetWith===4"),
     'the optional curls + lateral-raise superset is wired up');
  const allNames = q("DAYS.flatMap(d=>d.ex.map(e=>e.name)).join('|')");
  ok(!/Hack Squat|Pec Fly|Calf Raise|Face Pull|Farmer's Carry|Hip Thrust|Plank|Dead Bug/.test(allNames),
     'the superseded plan exercises are no longer session rows');

  console.log('\n=== historical storage and PBs ===');
  ok(Object.keys(log('danny').lifts).length >= Object.keys(oldLog.lifts).length,
     'every seeded historical record is still stored');
  ok(log('danny').lifts['l:danny:hip-thrust:2026-09-21'].weight === 60 &&
     log('danny').lifts['l:danny:plank:2026-09-21'].weight === 10,
     'retired exercise records are byte-for-byte intact');
  ok(q("personStats('danny','bar-bench').count") === 2,
     'older flat-bench records are read by the barbell bench row without being rewritten');
  ok(q("personStats('danny','incline-db-press').count") === 2,
     'older incline-bench records are read the same way');
  ok(q("personStats('danny','bar-bench').pb.weight") === 80,
     'the current barbell bench PB wins over the older generic record');
  await goDay(1);
  ok(/PB\s+100/.test(row(0).textContent), 'the old squat PB shows on the new back-squat row');
  ok(/PB\s+80/.test(row(1).textContent), 'the old barbell bench PB shows');
  ok(/PB\s+90/.test(row(3).textContent), 'the old Romanian deadlift PB shows');
  ok(/PB\s+30/.test(row(4).textContent), 'the old triceps pushdown PB shows');
  await goDay(2);
  ok(/PB\s+150/.test(row(0).textContent), 'the old leg-press PB shows');
  ok(/PB\s+32\.5/.test(row(1).textContent), 'the old incline dumbbell press PB shows');
  ok(/PB\s+50/.test(row(3).textContent), 'the old seated leg-curl PB shows');
  ok(/Kieran's PB\s+160/.test(row(0).textContent), "the partner's PB is still named");
  await goDay(3);
  ok(/PB\s+45/.test(row(1).textContent), 'the old shoulder-press PB shows on standing overhead press');
  ok(/PB\s+70/.test(row(3).textContent), 'the old leg-extension PB shows');

  console.log('\n=== new exercises log through the same path ===');
  async function logViaSheet(dayN, idx, canon, weight, reps){
    await goDay(dayN);
    tap(row(idx).querySelector('.pill'));
    await wait(90);
    ok(!!$('#winput'), `Day ${dayN} #${idx+1} uses the normal logging sheet`);
    input($('#winput'), String(weight));
    input($('#repsingle .setstepper input'), String(reps));
    tap($('#savebtn'));
    await wait(180);
    const e = log('danny').lifts[`l:danny:${canon}:${today}`];
    ok(!!e && e.weight === weight, `Day ${dayN} #${idx+1} is stored under ${canon}`, e && e.weight);
    ok(e && JSON.stringify(e.reps) === `[${reps}]` && e.repsMode === 'last',
       `and its last-set reps are stored the same way`, e && JSON.stringify(e.reps));
    ok(/PB/.test(row(idx).textContent), `and it becomes that lift's PB on screen`);
  }
  await logViaSheet(1, 2, 'chest-supported-row', 70, 7);
  await logViaSheet(3, 0, 'deadlift', 140, 4);
  await goDay(3);
  q("S.lastChoice['danny'] = S.lastChoice['danny'] || {}; S.lastChoice['danny']['3:2'] = 'weighted-pullup'; render();");
  await wait(140);
  await logViaSheet(3, 2, 'weighted-pullup', 20, 6);
  await goDay(3);
  tap(row(4).querySelector('.pill'));
  await wait(90);
  ok(/per dumbbell/.test($('.wunit').textContent), 'hammer curls are logged per dumbbell');
  input($('#winput'), '18'); input($('#repsingle .setstepper input'), '10');
  tap($('#savebtn'));
  await wait(180);
  ok(!!log('danny').lifts[`l:danny:hammer-curl:${today}`], 'hammer curls get their own new canonical record');
  ok(q("CANON_LABEL['chest-supported-row']") === 'Chest-Supported Row' &&
     q("CANON_LABEL['deadlift']") === 'Conventional Deadlift' &&
     q("CANON_LABEL['hammer-curl']") === 'Hammer Curls',
     'every new movement has a readable label for Progress and CSV');
  ok(q("DAYS.flatMap(d=>d.ex).every(e=>CANON_LABEL[e.canon] && MUSCLE_FALLBACK[e.canon])"),
     'every current movement has a label and muscle, including the new ones');
  ok(log('danny').lifts['l:danny:flat-bench:2026-09-01'].weight === 72.5 && !log('danny').lifts['l:danny:flat-bench:2026-09-01'].deleted,
     'logging new movements never rewrites or deletes older records');

  console.log('\n=== iPhone shell + simpler UI ===');
  ok(/name="apple-mobile-web-app-status-bar-style" content="black"/.test(html),
     'iOS uses a reserved opaque status bar instead of drawing under the Dynamic Island');
  ok(/viewport-fit=cover/.test(html), 'the viewport still opts into the real safe-area insets');
  ok(/padding:calc\(env\(safe-area-inset-top, 0px\) \+ 18px\)/.test(html),
     'the body adds an explicit safe-area gap below the status bar');
  ok(/maximum-scale=1, user-scalable=no/.test(html), 'the app-like zoom restriction is intentionally retained');
  ok(/const VERSION = 'session-v5-1'/.test(sw), 'the service-worker shell version was bumped so phones pick up the fix');
  ok(/Strength A, Hypertrophy and Strength B/.test(manifest), 'the installed-app description names the new plan');
  await goDay(1);
  ok(!!$('.ladderbox') && !$('.ladderbox').open, 'the pull-up ladder remains, still collapsed by default');
  ok(!/Warm-up|Finisher|How heavy|Training together|Fat loss/.test(text()),
     'the old warm-up, finisher and four generic reference guides are gone');
  ok(/How to progress/.test(text()), 'one compact progression note remains');
  ok(!$('.count') && !$('.also'), 'the cluttered 1/3 badges and "also" notes are no longer rendered');
  ok(/Tap a row to log/.test(text()), 'one short instruction replaces the repeated hints');
  tap($('#gearbtn'));
  await wait(140);
  ok(!/What's new|What the symbols mean/.test(doc.body.textContent), 'the long release notes and symbol essay are gone from Settings');
  ok(/Quick guide/.test(doc.body.textContent), 'Settings has a short quick guide instead');
  q('closeOverlay()');
  await wait(80);

  console.log('\n=== retired history + data-safety aids ===');
  ok(q("muscleFor('hip-thrust')") === 'Glutes' && q("muscleFor('dead-bug')") === 'Core',
     'retired lifts keep their muscle labels');
  tap($$('#tabnav button').find(b=>b.dataset.v==='progress'));
  await wait(180);
  ok(/Hip Thrust/.test(text()) && /Plank/.test(text()) && /Dead Bug/.test(text()),
     'retired lifts are still visible in Progress');
  ok(q("allPBs('danny').some(x=>x.ex==='hip-thrust' && x.weight===60)"),
     'and their PBs are still counted');
  q("view='session'; S.lastBackup=0; render();");
  await wait(140);
  ok(/No backup yet/.test(text()), 'a phone that has never exported is nudged to back up');
  q('S.lastBackup = Date.now(); render();');
  await wait(120);
  ok(!/No backup yet|days ago/.test(text()), 'and the nudge disappears once you have');
  q('S.lastBackup = Date.now() - 40*86400000; render();');
  await wait(120);
  ok(/Last backup 40 days ago/.test(text()), 'after a month it comes back');

  q(`logOf('danny').lifts['l:danny:leg-press:2026-09-28'] = {id:'l:danny:leg-press:2026-09-28',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'2026-09-28',weight:90,reps:[10,10,10],ts:1759000000000,day:1}; saveLog('danny',true);`);
  q('cleanOldReps()');
  await wait(200);
  const cleaned = log('danny').lifts['l:danny:leg-press:2026-09-28'];
  ok(cleaned.reps === null, 'the clean-up blanks only invented reps');
  ok(cleaned.weight === 90 && cleaned.date === '2026-09-28', 'but keeps weight and date');
  ok(JSON.stringify(log('danny').lifts['l:danny:chest-supported-row:'+today].reps) === '[7]',
     'and leaves genuinely entered last-set reps alone');
  q('undoLast()');
  await wait(180);
  ok(JSON.stringify(log('danny').lifts['l:danny:leg-press:2026-09-28'].reps) === '[10,10,10]',
     'the clean-up is undoable');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error('HARNESS ERROR:', e); process.exit(2); });
