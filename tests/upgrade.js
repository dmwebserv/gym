/* The real upgrade path: a phone that already has months of data boots into the new code. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const today = new Date().toLocaleDateString('en-CA');

const settings = { v:3, onboarded:true, owner:'danny', sel:'danny',
  people:[{id:'danny',name:'Danny',color:'--p1',initial:'D'},{id:'kieran',name:'Kieran',color:'--p2',initial:'K'}],
  legacyMigrated:true, lastChoice:{}, sync:{pin:'',room:'',lastSync:0,lastErr:'',busy:false} };
const oldLog = {
  lifts:{
    'l:danny:leg-press:2026-09-20':{id:'l:danny:leg-press:2026-09-20',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'2026-09-20',weight:80,reps:[10,10,10],ts:1758000000000,day:1},
    'l:danny:leg-press:2026-09-27':{id:'l:danny:leg-press:2026-09-27',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'2026-09-27',weight:85,reps:[10,10,10],ts:1758600000000,day:1},
    'l:danny:db-bench:2026-09-20':{id:'l:danny:db-bench:2026-09-20',kind:'lift',pid:'danny',ex:'db-bench',name:'Dumbbell Bench Press',date:'2026-09-20',weight:30,reps:null,ts:1758000000000,day:1}
  },
  ticks:{ ['1:' + today]:{items:[0],ts:1758000000000} }
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
const q=js=>win.eval(js);

(async () => {
  await wait(500);
  console.log('\n=== existing phone upgrading to the new code ===');
  ok(!$('#overlayroot [data-who]'), 'no onboarding (already onboarded)');
  ok($$('#list li.ex').length > 0, 'session screen renders');
  ok(/Danny/.test($('#app').textContent) && $('#persons button[aria-pressed="true"]').textContent.includes('Danny'), 'the owner is still selected');
  const stored = JSON.parse(win.localStorage.getItem('gym:log:danny'));
  ok(JSON.stringify(stored.lifts['l:danny:leg-press:2026-09-20'].reps) === '[10,10,10]',
     'old rep arrays are untouched in storage');
  ok(stored.lifts['l:danny:leg-press:2026-09-20'].repsMode === undefined, 'no fields were added to old records');
  ok(stored.ticks['1:' + today].items.includes(0), 'existing ticks survive');

  tap($$('#tabnav button').find(b=>b.dataset.v==='progress'));
  await wait(200);
  ok(/85/.test(doc.body.textContent) && /× 10/.test(doc.body.textContent), 'PB shows the last set (85 × 10)');
  ok(/no PB yet/.test(doc.body.textContent), 'a lift logged without reps still reads sensibly');
  tap($$('.pr-row').find(r=>r.dataset.ex==='leg-press'));
  await wait(200);
  const item = $$('.hist-item')[0];
  ok(/3 sets recorded · 10 · 10 · 10/.test(item.textContent), 'old three-number records are labelled honestly', item.textContent.replace(/\s+/g,' '));
  ok($$('.hist-item').length === 2, 'both old sessions listed');

  // logging on top of old data pre-fills from the old record
  tap($('[data-close]')); await wait(80);
  tap($$('#tabnav button').find(b=>b.dataset.v==='session')); await wait(150);
  const legRow = $$('#list li.ex').find(r=>r.textContent.includes('Leg Press'));
  tap(legRow.querySelector('.pill')); await wait(150);
  ok($('#winput').value === '85', 'weight pre-fills from the old record (85)', $('#winput').value);
  ok($('#repsingle .setstepper input').value === '10', 'reps pre-fill from the old record (10)', $('#repsingle .setstepper input').value);
  ok(/Last: 85 kg × 10/.test($('#lastrow').textContent), 'the "last" line shows weight and reps', $('#lastrow').textContent.replace(/\s+/g,' ').trim());
  ok(/PB: 85 kg × 10/.test($('#lastrow').textContent), 'the PB line shows weight and reps');
  tap($('#savebtn')); await wait(250);
  const e2 = JSON.parse(win.localStorage.getItem('gym:log:danny')).lifts['l:danny:leg-press:' + today];
  ok(!!e2 && e2.weight === 85 && e2.repsMode === 'last', 'a new record sits alongside the old ones', JSON.stringify(e2 && e2.reps));
  ok(q("Object.values(logOf('danny').lifts).filter(e=>e.deleted).length") === 0, 'nothing was tombstoned or rewritten');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  win.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error('HARNESS ERROR:', e); process.exit(2); });
