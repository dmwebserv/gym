/* Sync verification: two phones, one shared store, no data loss.
   Implements the real sync_state() semantics in memory (upsert newest-wins, return rows newer
   than p_since) and drives two independent app instances against it. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, l, e) => { if (c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l + (e ? '  → ' + e : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- the sync store, as supabase.sql implements it ---------- */
function makeServer(){
  const table = new Map();          // id -> { id, room, pid, data, ts }
  const calls = [];
  return {
    calls,
    rows(){ return [...table.values()]; },
    async sync_state(p_secret, p_rows, p_since){
      const room = 'r' + String(p_secret).slice(0, 16);
      calls.push({ sent: (p_rows || []).length, since: p_since });
      for (const r of (p_rows || [])){
        if (!r.id || !r.pid) continue;
        const id = room + ':' + r.id;
        const cur = table.get(id);
        // newest version of a row wins, ties keep what is stored
        if (!cur || (r.ts || 0) >= cur.ts) table.set(id, { id, room, pid:r.pid, data:r.data, ts:r.ts || 0 });
      }
      return [...table.values()]
        .filter(r => r.room === room && r.ts > (p_since || 0))
        .map(r => ({ id: r.id.replace(room + ':', ''), room: r.room, pid: r.pid, data: r.data, ts: r.ts }))
        .sort((a, b) => a.ts - b.ts);
    }
  };
}

/* ---------- a phone ---------- */
function phone(server, label, preload){
  const dom = new JSDOM(html, {
    url: 'https://example.org/', runScripts:'dangerously', pretendToBeVisual:true,
    beforeParse(w){
      if (preload) for (const [k, v] of Object.entries(preload)) w.localStorage.setItem(k, JSON.stringify(v));
      w.fetch = async (url, opts) => {
        const body = JSON.parse(opts.body);
        const out = await server.sync_state(body.p_secret, body.p_rows, body.p_since);
        w.__lastSent = body.p_rows.length;
        w.__lastSince = body.p_since;
        return { ok:true, status:200, json: async () => out };
      };
    }
  });
  const win = dom.window;
  return {
    win, label,
    q: js => win.eval(js),
    log: pid => JSON.parse(win.localStorage.getItem('gym:log:' + pid) || '{"lifts":{},"ticks":{}}'),
    settings: () => JSON.parse(win.localStorage.getItem('gym:settings')),
    async sync(manual){ await win.eval(`doSync(${manual ? 'true' : 'false'})`); await wait(60); },
    async connect(pin){
      win.eval(`S.sync.pin = ${JSON.stringify(pin)}; S.sync.upTs = 0; S.sync.downTs = 0; S.sync.count = 0;`);
      await this.sync(true);
    },
    sent: () => win.__lastSent,
    since: () => win.__lastSince
  };
}

(async () => {
  const server = makeServer();
  console.log('\n=== two phones join the same room ===');
  const A = phone(server, 'Danny');
  const B = phone(server, 'Kieran');
  await wait(350);
  await A.connect('legday42');
  await B.connect('legday42');
  ok(A.q("S.sync.lastErr") === '', 'phone A syncs without error');
  ok(B.q("S.sync.lastErr") === '', 'phone B syncs without error');

  console.log('\n=== A logs a lift; B receives it ===');
  const today = new Date().toLocaleDateString('en-CA');
  A.q(`logOf('danny').lifts['l:danny:leg-press:${today}'] = {id:'l:danny:leg-press:${today}',kind:'lift',pid:'danny',ex:'leg-press',name:'Leg Press',date:'${today}',weight:80,reps:[8],repsMode:'last',ts:Date.now(),day:1};
       logOf('danny').ticks['1:${today}'] = {items:[0],ts:Date.now()};
       saveLog('danny', true);`);
  await A.sync(false);
  ok(A.sent() === 2, 'A sends only what changed — the new lift and the tick', A.sent() + ' rows');
  await B.sync(false);
  ok(!!B.log('danny').lifts[`l:danny:leg-press:${today}`], "B now has A's lift");
  ok(B.log('danny').lifts[`l:danny:leg-press:${today}`].weight === 80, 'with the right weight');
  ok(B.log('danny').ticks[`1:${today}`].items.includes(0), "and A's tick");

  console.log('\n=== and it does not re-send old rows on every sync ===');
  await A.sync(false);
  ok(A.sent() === 0, 'A has nothing new to send, so it sends nothing at all', A.sent() + ' rows');
  ok(A.since() > 0, 'and only asks for rows newer than the last one it saw', 'since=' + A.since());

  console.log('\n=== B logs; A receives ===');
  B.q(`logOf('kieran').lifts['l:kieran:hack-squat:${today}'] = {id:'l:kieran:hack-squat:${today}',kind:'lift',pid:'kieran',ex:'hack-squat',name:'Hack Squat',date:'${today}',weight:60,reps:[10],repsMode:'last',ts:Date.now(),day:2}; saveLog('kieran', true);`);
  await B.sync(false);
  await A.sync(false);
  ok(!!A.log('kieran').lifts[`l:kieran:hack-squat:${today}`], "A now has Kieran's lift");
  ok(A.sent() === 0, 'and A still had nothing of its own to send', A.sent() + ' rows');

  console.log('\n=== deletes travel, and cannot be resurrected ===');
  B.q(`deleteTombstone = true; logOf('kieran').lifts['l:kieran:hack-squat:${today}'] = Object.assign({}, logOf('kieran').lifts['l:kieran:hack-squat:${today}'], {deleted:true, ts:Date.now()}); saveLog('kieran', true);`);
  await B.sync(false);
  await A.sync(false);
  ok(A.log('kieran').lifts[`l:kieran:hack-squat:${today}`].deleted === true, "the deletion reached A as a tombstone");
  ok(A.q(`liftsOf('kieran').filter(e => e.ex === 'hack-squat').length`) === 0, 'and A no longer counts it as a lift');
  // B tries to push the old version again (as a stale phone would): it must not undo the delete
  B.q(`logOf('kieran').lifts['l:kieran:hack-squat:${today}'] = Object.assign({}, logOf('kieran').lifts['l:kieran:hack-squat:${today}'], {deleted:false, ts:Date.now() - 600000}); saveLog('kieran', true);`);
  await B.sync(false);
  await A.sync(false);
  ok(A.log('kieran').lifts[`l:kieran:hack-squat:${today}`].deleted === true,
     'an OLDER stale copy cannot resurrect a deleted record');

  console.log('\n=== a record logged offline catches up later ===');
  A.q(`logOf('danny').lifts['l:danny:rdl:${today}'] = {id:'l:danny:rdl:${today}',kind:'lift',pid:'danny',ex:'rdl',name:'Romanian Deadlift',date:'${today}',weight:90,reps:[8],repsMode:'last',ts:Date.now(),day:1}; saveLog('danny', true);`);
  // (no sync yet — the phone has no signal)
  ok(!B.log('danny').lifts[`l:danny:rdl:${today}`], 'B does not have it yet');
  await A.sync(false);          // signal comes back
  await B.sync(false);
  ok(!!B.log('danny').lifts[`l:danny:rdl:${today}`], 'and it arrives as soon as A syncs again');

  console.log('\n=== the pull-up ladder travels too ===');
  A.q(`setLadder('danny', {level:3});`);
  await wait(80);
  await A.sync(false);
  await B.sync(false);
  ok((B.log('danny').lifts['x:danny:ladder'] || {}).level === 3, "Kieran's phone knows Danny is on ladder level 3");

  console.log('\n=== a brand new phone recovers everything from the room ===');
  const C = phone(server, 'new phone');
  await wait(350);
  await C.connect('legday42');
  const cl = C.log('danny');
  const clk = C.log('kieran');
  ok(!!cl.lifts[`l:danny:leg-press:${today}`], 'the new phone has the leg press');
  ok(!!cl.lifts[`l:danny:rdl:${today}`], 'and the RDL');
  ok(!!clk.lifts[`l:kieran:hack-squat:${today}`], "and Kieran's records, including the deleted one it should not count");
  ok(C.q(`liftsOf('kieran').filter(e => e.ex === 'hack-squat').length`) === 0, 'and it does not count the deleted lift');
  ok((cl.lifts['x:danny:ladder'] || {}).level === 3, 'and the ladder level');

  console.log('\n=== the periodic full send is still there as a safety net ===');
  await A.q('S.sync.count = 0;');
  await A.sync(false);
  const fullSend = A.sent();
  ok(fullSend > 2, 'every 20th sync sends everything, so a missed row can never be lost for good',
     fullSend + ' rows sent');
  ok(server.calls.filter(c => c.since === 0).length >= 2, 'and a full sync asks for the whole room again');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  A.win.close(); B.win.close(); C.win.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
