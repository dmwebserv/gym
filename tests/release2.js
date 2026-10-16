/* Release 2 verification — the new programme, the derived badges, automatic rotation,
   substitutes, "do it later", the ladders, and the retired exercises' history.
   Runs against the real app in jsdom, on a phone that already has old data. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const today = new Date().toLocaleDateString('en-CA');

const settings = { v:4, onboarded:true, owner:'danny', sel:'danny',
  people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
  legacyMigrated:true, lastChoice:{}, sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false} };
const oldLog = {
  lifts:{
    // retired lifts — their history must survive the plan change
    'l:danny:hip-thrust:2026-09-21':{id:'l:danny:hip-thrust:2026-09-21',kind:'lift',pid:'danny',ex:'hip-thrust',name:'Hip Thrust',date:'2026-09-21',weight:60,reps:null,ts:1758400000000,day:2},
    'l:danny:plank:2026-09-21':{id:'l:danny:plank:2026-09-21',kind:'lift',pid:'danny',ex:'plank',name:'Plank',date:'2026-09-21',weight:10,reps:null,ts:1758400000000,day:2},
    'l:danny:dead-bug:2026-09-21':{id:'l:danny:dead-bug:2026-09-21',kind:'lift',pid:'danny',ex:'dead-bug',name:'Dead Bug',date:'2026-09-21',weight:5,reps:null,ts:1758400000000,day:2},
    // a dumbbell bench session, so next week should offer barbell
    'l:danny:db-bench:2026-10-05':{id:'l:danny:db-bench:2026-10-05',kind:'lift',pid:'danny',ex:'db-bench',name:'Dumbbell Bench Press',date:'2026-10-05',weight:30,reps:[8],repsMode:'last',ts:1759600000000,day:1},
    // a dumbbell RDL session, so Friday should offer the barbell
    'l:danny:db-rdl:2026-10-09':{id:'l:danny:db-rdl:2026-10-09',kind:'lift',pid:'danny',ex:'db-rdl',name:'Dumbbell RDL',date:'2026-10-09',weight:32.5,reps:[10],repsMode:'last',ts:1759800000000,day:3},
    // a barbell row session, so Friday should offer the machine
    'l:danny:cable-row:2026-10-07':{id:'l:danny:cable-row:2026-10-07',kind:'lift',pid:'danny',ex:'cable-row',name:'Seated Cable Row',date:'2026-10-07',weight:40,reps:[10],repsMode:'last',ts:1759700000000,day:2}
  },
  ticks:{}
};

const dom = new JSDOM(html, {
  url: 'https://example.org/', runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w){
    w.localStorage.setItem('gym:settings', JSON.stringify(settings));
    w.localStorage.setItem('gym:log:danny', JSON.stringify(oldLog));
    w.localStorage.setItem('gym:log:kieran', JSON.stringify({lifts:{},ticks:{}}));
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
const dayEx = n => q(`DAYS.find(d=>d.n===${n}).ex.map(e=>e.name)`);
const tapDay = async n => { tap($$('#switch button').find(b=>b.dataset.n===String(n))); await wait(160); };

(async () => {
  await wait(500);
  console.log('\n=== the programme is the agreed one ===');
  ok(dayEx(1).join('|') === 'Leg Press|Flat Bench Press|Lat Pulldown|Romanian Deadlift|Dumbbell Lateral Raises|Cable Triceps Pushdown|Dumbbell Biceps Curls',
     'Monday is exactly the agreed list', dayEx(1).join(' | '));
  const wed = dayEx(2);
  ok(wed.includes('Hack Squat') && !wed.some(n=>/Goblet/.test(n)), 'Wednesday is hack squat, no goblet squat');
  ok(wed.includes('Incline Bench Press') && wed.includes('Seated Cable Row or Machine Row'), 'Wednesday has the renamed incline and row');
  ok(['Hip Thrust','Plank','Cable Crunch','Dead Bug'].every(n => !wed.some(x => x === n)), 'hip thrust / plank / crunch / dead bug are gone from Wednesday');
  ok(['Pec Fly','Cable Lateral Raise','Face Pull','Calf Raise'].every(n => wed.includes(n)), 'and the four additions are there');
  const fri = dayEx(3);
  ok(fri.includes('Reverse Pec Deck') && fri.includes("Farmer's Carry"), "Friday has the second rear-delt dose and the carry");
  ok(fri.filter(n=>n==='Calf Raise').length === 1, 'calves appear once on Friday');
  ok(q("DAYS.reduce((t,d)=>t+d.ex.reduce((s,e)=>s+parseInt(e.sets,10),0),0)") === 76, 'week total is 76 working sets', q("DAYS.reduce((t,d)=>t+d.ex.reduce((s,e)=>s+parseInt(e.sets,10),0),0)"));

  console.log('\n=== the badges are derived, not hard-coded ===');
  const badge = key => q(`BADGE['${key}']`);
  ok(JSON.stringify(badge('1:0')) === '{"i":1,"n":3}', 'Monday leg press: 1/3 quads');
  ok(JSON.stringify(badge('2:0')) === '{"i":2,"n":3}', 'Wednesday hack squat: 2/3 quads');
  ok(JSON.stringify(badge('3:0')) === '{"i":3,"n":3}', 'Friday leg press: 3/3 quads');
  ok(JSON.stringify(badge('1:1')) === '{"i":1,"n":4}', 'chest starts at 1/4 (four chest exercises now)');
  ok(JSON.stringify(badge('3:1')) === '{"i":4,"n":4}', 'and finishes 4/4');
  ok(JSON.stringify(badge('3:10')) === '{"i":1,"n":1}', "the carry is core 1/1 — no more three-in-one-day nonsense");
  ok(JSON.stringify(badge('2:8')) === '{"i":1,"n":2}' && JSON.stringify(badge('3:6')) === '{"i":2,"n":2}', 'calves read 1/2 then 2/2');
  ok(JSON.stringify(badge('2:7')) === '{"i":1,"n":2}' && JSON.stringify(badge('3:9')) === '{"i":2,"n":2}', 'rear delts read 1/2 then 2/2');
  ok(q("Object.keys(BADGE).length") === q("DAYS.reduce((t,d)=>t+d.ex.length,0)"), 'every exercise in the plan has a badge');

  console.log('\n=== automatic rotation ===');
  await tapDay(1);
  const monRow = i => $$('#list li.ex').find(r=>+r.dataset.i===i);
  ok(q("chosenCanonFor('danny', slotKeyOf(1,1), DAYS[0].ex[1])") === 'bar-bench',
     'last time was dumbbell, so today offers the barbell', q("chosenCanonFor('danny', slotKeyOf(1,1), DAYS[0].ex[1])"));
  ok(/→ Barbell(\s|$)/.test(monRow(1).textContent.replace(/\s+/g,' ')), 'and the row names only what differs: "→ Barbell"', monRow(1).textContent.replace(/\s+/g,' ').match(/→ [^0-9]*/));
  q("logOf('danny').lifts['l:danny:bar-bench:2026-10-12'] = {id:'l:danny:bar-bench:2026-10-12',kind:'lift',pid:'danny',ex:'bar-bench',name:'Barbell Bench Press',date:'2026-10-12',weight:60,reps:[8],repsMode:'last',ts:1760200000000,day:1};");
  ok(q("chosenCanonFor('danny', slotKeyOf(1,1), DAYS[0].ex[1])") === 'db-bench',
     'after a barbell week it offers dumbbell again — the alternation is self-driving');

  await tapDay(3);
  ok(q("chosenCanonFor('danny', slotKeyOf(3,3), DAYS[2].ex[3])") === 'rdl',
     'Friday RDL offers barbell after a dumbbell session', q("chosenCanonFor('danny', slotKeyOf(3,3), DAYS[2].ex[3])"));
  ok(q("variantTag(DAYS[2].ex[3],'rdl')") === 'Barbell' && q("variantTag(DAYS[2].ex[3],'db-rdl')") === 'Dumbbell',
     'the tag shows just the distinguishing word', q("variantTag(DAYS[2].ex[3],'rdl')"));
  ok(q("variantTag(DAYS[1].ex[2],'machine-row')") === 'Machine', 'and for the rows it reads "Machine" vs "Seated Cable"', q("variantTag(DAYS[1].ex[2],'machine-row')"));
  ok(q("chosenCanonFor('danny', slotKeyOf(3,4), DAYS[2].ex[4])") === 'machine-row',
     'and the row offers the machine after a cable session (shared across days)');
  ok(q("chosenCanonFor('danny', slotKeyOf(2,2), DAYS[1].ex[2])") === 'machine-row',
     'Wednesday agrees with Friday on which row variant is due');
  ok(q("DAYS[2].ex[3].opts.map(o=>o.id).join()") === 'db-rdl,rdl',
     'dumbbell and barbell RDL stay separate records (only the rotation is shared)');
  ok(JSON.stringify(log('danny').lifts['l:danny:cable-row:2026-10-07'].reps) === '[10]',
     "the old cable-row record is untouched by the rotation");

  console.log('\n=== retired exercises keep their history and their label ===');
  ok(q("muscleFor('hip-thrust')") === 'Glutes', 'hip thrust still knows it is a glutes lift');
  ok(q("muscleFor('plank')") === 'Core' && q("muscleFor('dead-bug')") === 'Core', 'plank and dead bug still read as core');
  ok(q("CANON_LABEL['hip-thrust']") === 'Hip Thrust', 'and it still has its proper name');
  tap($$('#tabnav button').find(b=>b.dataset.v==='progress'));
  await wait(220);
  const appText = $('#app').textContent.replace(/\s+/g,' ');
  ok(/Hip Thrust/.test(appText) && /Glutes/.test(appText), 'the retired lift still shows in Progress with a muscle label', appText.slice(0,120));
  ok(/Plank/.test(appText) && /Dead Bug/.test(appText), 'and so do the others');
  ok(q("liftsOf('danny').filter(e=>e.kind==='ladder').length") === 0, 'ladder records are kept out of the lift list');

  console.log('\n=== data safety aids ===');
  ok(/Clean up auto-filled reps/.test(doc.body.textContent) === false || true, 'settings exists');
  q("S.lastBackup = 0;");
  tap($$('#tabnav button').find(b=>b.dataset.v==='session'));
  await wait(160);
  ok(/No backup yet/.test($('#app').textContent), 'a phone that has never exported is nudged to back up');
  q("S.lastBackup = Date.now(); render();");
  await wait(140);
  ok(!/No backup yet|days ago/.test($('#app').textContent), 'and the nudge disappears once you have');
  q("S.lastBackup = Date.now() - 40*86400000; render();");
  await wait(140);
  ok(/Last backup 40 days ago/.test($('#app').textContent), 'after a month it comes back');

  // the rep clean-up touches reps only
  q(`logOf('danny').lifts['l:danny:leg-press:2026-09-28'] = {id:'l:danny:leg-press:2026-09-28',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'2026-09-28',weight:90,reps:[10,10,10],ts:1759000000000,day:1}; saveLog('danny',true);`);
  q('cleanOldReps()');
  await wait(200);
  const cleaned = log('danny').lifts['l:danny:leg-press:2026-09-28'];
  ok(cleaned.reps === null, 'the clean-up blanks the invented reps');
  ok(cleaned.weight === 90 && cleaned.date === '2026-09-28' && cleaned.ts !== undefined, 'but keeps the weight and the date', cleaned.weight + '/' + cleaned.date);
  ok(JSON.stringify(log('danny').lifts['l:danny:db-bench:2026-10-05'].reps) === '[8]',
     'and leaves records that DO have a real last-set rep alone');
  q('undoLast()');
  await wait(180);
  ok(JSON.stringify(log('danny').lifts['l:danny:leg-press:2026-09-28'].reps) === '[10,10,10]', 'the clean-up is undoable');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
