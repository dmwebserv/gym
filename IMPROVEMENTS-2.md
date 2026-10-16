# Round 2 — your answers, the two questions you asked, the confirmed work, and 58 new ideas

**Nothing in the app has been touched.** Your data and every existing feature are exactly as they
were — this round is answers, specs and new suggestions only, because you asked me to come back
before proceeding.

Round 1 is `IMPROVEMENTS.md` (items `R`, `L`, `S`, `P`, `T`, `F`, `Y`, `O`, `A`, `B`). New ideas in
this round are numbered `N1`–`N58`. **Round 3 is `IMPROVEMENTS-3.md` — the long list, `X1`–`X225`.**
The reps row mock-up is still live in the preview panel.

---

## 0. Your answers, locked in

### 0.1 The `1/3` badge = "which of the planned 3 times this week this is"

Understood — and now that I know what it means, I've checked it against the whole plan. **Two rows
are currently wrong**, and both come from the same cause: the number is a hard-coded label on each
row, counted in *exercises*, not in *times that muscle is worked*.

**Problem 1 — three core exercises in one session read as three separate sessions.**
Wednesday has Plank (`1/3`), Cable Crunch (`2/3`) and Dead Bug (`3/3`). Core is worked *once* that
week. By your definition all three rows should read `1/1`, but they read as if Wednesday were the
1st, 2nd and 3rd core session of the week.

**Problem 2 — indirect work doesn't count, so glutes claim to be worked once a week.**
The Hip Thrust row shows `Glutes 1/1`. But the plan hits glutes in five other exercises (leg press,
Romanian deadlift, goblet/hack squat, squat/leg press, DB RDL — all list glutes under "also"). So
glutes get worked by **6 exercises a week** while the badge says once.

Here's what the data actually says:

| Muscle | Badge today | Exercises in the plan that train it | Sessions/week (actual) |
|---|---|---|---|
| Quads | 1/3 → 2/3 → 3/3 ✅ | 3 direct | 3 |
| Chest | 1/3 → 2/3 → 3/3 ✅ | 3 direct (+1 upper chest) | 3 |
| Hamstrings | 1/3 → 2/3 → 3/3 ✅ | 3 direct (+1 from hip thrust) | 3 |
| Lats | 1/2 → 2/2 ✅ | 2 direct | 2 |
| Mid back | 1/2 → 2/2 ✅ | 2 direct | 2 |
| Side delts | 1/2 → 2/2 ✅ | 2 direct | 2 |
| Triceps | 1/2 → 2/2 ✅ | 2 direct + **4 indirect** | 6 |
| Biceps | 1/2 → 2/2 ✅ | 2 direct + **4 indirect** | 6 |
| **Core** | **1/3, 2/3, 3/3 on the same day ❌** | 3 direct, all Wednesday | 1 |
| **Glutes** | **1/1 ❌** | 1 direct + **5 indirect** | 6 |
| **Front delts** | **1/1 ❌** | 1 direct + 1 indirect | 2 |

So: seven of the eleven are right, three are misleading. Fixing this properly means the app counts
*sessions for that muscle*, and knows which muscles each exercise hits (the "also" line already
tells it — that data is sitting right there, unused). See `N1`–`N5` below, and there's a question for
you at the end: count direct work only, or everything that trains the muscle.

### 0.2 Dumbbell weights are per hand — confirmed, recorded

Affected rows: Dumbbell Bench Press, Incline Dumbbell Press, Dumbbell Romanian Deadlift, Dumbbell
Biceps Curls, and Lateral Raises (if you use dumbbells). Five small changes, no data change:

- Rows and the log sheet say **"per dumbbell"** so the number is never ambiguous.
- History and the export show it (`30 per dumbbell · 60 total`) — the stored value stays exactly
  `30`, so nothing is rewritten.
- Dumbbell PBs are never compared against machine/barbell equivalents (they aren't the same thing),
  and the progress chart says which it is.
- The CSV gets a `per_hand` column rather than changing the existing `weight_kg` values, so any
  spreadsheet you've already built keeps working.

### 0.3 One entry per exercise = your last set (which is your heaviest) — confirmed

This is a slightly unusual choice and worth me saying why, because it changes what the app should
advise: most people's last set is *lighter* than their first, because fatigue. You're describing the
opposite (you build up to a top set), which is a perfectly good way to train — it just means four
things:

1. **The recorded weight is your top set**, so "PB = heaviest weight ever" stays honest, and your
   new entries will be genuinely accurate (unlike current ones — see `R2`/`B1`: the app currently
   invents reps on every save, so rep-based stats today are fiction).
2. **The plan's progression rule needs rewording.** Your Reference says add weight when you hit the
   top of the range *on every set* — but you'll only be recording one set, so the app can't verify
   "every set". It should say *last set*, to match what's measured. Otherwise the app gives advice
   based on data it doesn't have.
3. **Volume has to be counted in sets, not kilos.** With one set recorded you can't know tonnage
   (the total weight moved) — but you don't need to. "Muscle volume" is counted in *hard sets*, and
   your ticks already tell the app how many sets you did. See 1.3.
4. **Your old records have fabricated reps in them** (the hidden 10/10/10 default). They're
   harmless for weights and PBs, but they'd poison any rep-based stat like estimated 1RM. There's a
   question at the end about what you'd like done — nothing gets deleted either way.

---

## 1. Your change list — specs, ready to build

### 1.1 Undo

- Every save shows **Undo** in the toast for ~8 seconds (`Logged 27 kg × 8 · Leg Press — Undo`).
- Undo restores the *previous* state, not just "delete": if you updated today's entry from 25 to 27,
  undo puts 25 back; if there was nothing there, undo removes the entry and un-ticks the exercise.
- Covers ticks, "done without a weight", edits and deletes, and a "log for both" save (undo removes
  both people's entries).
- It writes a new timestamp, so the undo itself syncs to the other phone like any other change —
  no risk of the old value being resurrected from the other phone.
- Storage: nothing new in your data records; the undo history lives in memory (and is deliberately
  lost on reload — it's for mis-taps, not for going back in time).
`Effort: S`

### 1.2 Edit and delete any record (not just today's)

Today you can only overwrite *today's* entry. A typo'd `200` instead of `20` is permanent — and
becomes your PB forever, because the key is date-stamped and old keys are never touched.

- Tap any row in Progress → an exercise's history → any session → edit weight/reps, change the date,
  or delete it.
- **Delete is a tombstone**: the record is kept with a "deleted" flag rather than removed, so the
  deletion travels to the other phone (sync is "newest wins, never remove" — without this, a deleted
  entry would come straight back from the other phone). Your history is never silently destroyed,
  and a deleted entry can be restored from the same screen.
- Typo protection: entering a weight more than double your PB asks "that's 200 kg — sure?" before
  saving.
`Effort: M · Data: additive (a `deleted` flag + tombstones; nothing existing is rewritten)`

### 1.3 "What's per-muscle volume?" — answered with your own plan

**Volume = how many hard sets a muscle gets per week.** It's the dose. Strength and size respond to
the *number of quality sets*, not to the weight on any single set — which is why it's a useful thing
for the app to show, and why it doesn't need per-set reps to work (just your ticks and the plan).

Your plan's planned weekly volume, counted from the exercise table:

| Muscle | Sets/week | Spread over |
|---|---|---|
| Quads | 9 | 3 sessions |
| Chest | 9 | 3 sessions |
| Hamstrings | 8 | 3 sessions |
| Lats | 6 | 2 sessions |
| Core | 6 | 1 session |
| Side delts | 5 | 2 sessions |
| Mid back | 5 | 2 sessions |
| Triceps | 4 direct + 4 indirect | 2 sessions (+4) |
| Biceps | 4 direct + 4 indirect | 2 sessions (+4) |
| Glutes | 3 direct + indirect in 5 more exercises | 1 session (6) |
| Front delts | 2 direct + 1 indirect | 1 session |
| **Total** | **61 working sets** | 3 sessions, 60–75 min each |

For context (and this isn't coaching, it's the standard range used in the literature): most people
grow well on roughly **10–20 sets per muscle per week**, beginners at the lower end, and indirect
work counts toward it. Read against that, your plan is doing well on quads/chest/hams, fine on
lats/back, and **low on shoulders** — side delts at 5 sets is the clearest gap in an otherwise
well-built plan, and side delts are unusually cheap to add (small muscle, little fatigue, so 1–2
extra sets of lateral raises is close to free). Biceps and triceps at 4 direct sets each are
respectable once you count the indirect work from rows and presses.

**What the feature would show** (`N7`): a small per-muscle panel on the Progress tab — this week vs
planned vs your 4-week average, with "no side-delt work since 8 Oct" style flags. It answers "am I
actually doing enough for X?" without you counting anything by hand, and it's the natural home for
the badge question in 0.1, since the badge is about *frequency* and volume is about *dose*.
`Effort: M · Data: none (computed from your existing ticks + the plan)`

### 1.4 "Machine taken?" — designed, held until the exercise review

Held, as you asked. Here's the design so you know what you're deciding about:

- Tapping **Machine taken?** in the log sheet shows 2–3 pre-agreed substitutes for that slot, chosen
  by you in advance — not a blank "type any exercise" box. That keeps comparisons honest.
- Plus two non-swap options: **"do it later"** (parks the exercise to the bottom of today's list —
  often what you actually want when a machine is busy) and **"skip for today"**.
- Swaps log under the *substitute's own name*, not the original — so your leg press PB isn't polluted
  by a hack squat. The row then shows `→ Hack Squat` exactly like it already does for the
  Goblet/Hack slot, and you can make the change permanent for future sessions.
- This needs the same "muscle map" data as 0.1/`N7` (which exercise trains which muscle), which is
  why doing the exercise review first is the right order.

### 1.5 "Log for both" — when you lift the same weights

Good idea, and it's a small change on top of what's there.

- In the log sheet: a **"Log for both"** switch showing both names (`Danny + Kieran`). One save
  writes the same weight and reps for both people and ticks it for both.
- It respects each person's own variant: if one of you does Goblet Squat and the other Hack Squat,
  each records against their own — with an optional "use the same one for both" if you're sharing
  the machine.
- The PB check runs for both, so the toast can say `🏆 NEW PB for Danny · Kieran matched his best`.
- Bodyweight rows get "Tick for both".
- Undo removes both entries.
- Optional follow-on (`N36`): a "training together" mode that alternates who's logged after each
  save, so you never have to switch person at the top of the screen mid-session.
`Effort: M · Data: none new (it writes two of the records that already exist, one per person)`

### 1.6 Data safety

What I'd build, in priority order (your call on which to include):

1. **Import / restore from a backup** — the one real gap. You can export JSON and CSV today but
   there's no way back in. I'd add a `.json` import that *merges* (newest wins, exactly like sync —
   never destructive), shows what it found before you confirm, and requires your existing data to be
   untouched by anything older.
2. **Edit/delete past records** (1.2) — removes the "typo is permanent forever" class of loss.
3. **Monthly auto-snapshot** — a compact internal snapshot of both people's logs kept locally
   (rolling, e.g. last 6 months), restorable from the import screen. No user action needed.
4. **A cloud "cold copy"** — write a full backup row into the sync room itself once a month, so if
   both phones are lost the data can be recovered by entering the PIN on a new phone. (The room
   already holds every entry — this just makes the recovery path explicit and documented, `N41`.)
5. **Backup reminder** — footer line when it's been >30 days, plus remembering the last export date.
6. **Erase local data gets safety rails** — show what will be cleared, offer "export first", require
   typing a word to confirm, and warn that it doesn't touch the other phone.
7. **Install to home screen** (1.8) — the one action that actually stops iOS clearing browser
   storage after 7 days of not visiting.
`Effort: M total, splittable · Data: additive only, and every operation is a merge, never a replace`

### 1.7 Sync

Confirmed scope:

1. **Stop reporting "Connected ✦" without checking the PIN** (`Y1`/`B3`) — if a background sync is
   already running, the app currently assumes your new PIN worked. It'll wait and verify.
2. **Stop saving a wrong PIN before it's proved** (`Y2`/`B4`) — right now a mistyped PIN is stored
   immediately and the phone then retries forever with a dead credential, showing errors, with
   recovery hidden in a "Reconnect" button.
3. **Only send what changed** (`Y3`) — today every sync pushes all local rows up and pulls everything
   down, every 60 seconds, forever. It's small now; it gets slower as the log grows, and it's needless
   battery. The database function already supports this (`p_since`) — no SQL change needed.
4. **Deletions travel** (`Y7`) — needed for 1.2. Tombstones, same merge rule.
5. **One debounced refresh** instead of four overlapping triggers (`Y6`), plus "Sync now".
6. **Honest status** — one clear state (`Synced 09:41` / `Syncing…` / `Offline — will retry` /
   `Not connected`), and errors that say what to do about it, not just what broke (`Y5`).
7. **A sync health panel** (`N42`) — entries per person, when the other phone last wrote, and
   "both phones agree ✓".
8. **Optional hardening** (`N43`/`Y8`) — store the derived secret rather than your plain PIN on the
   phone (people reuse PINs), require 8+ characters, and make the SQL refuse PIN guesses that try to
   create new rooms. This is the only item in this list that needs you to re-run `supabase.sql`.

### 1.8 "How would offline & install work?"

Two separate things that people usually lump together.

**Offline** — your *data* is already offline-first (localStorage; the app never needs the network to
record a lift; sync catches up later). What isn't offline is the **app file itself**: right now your
phone must fetch `index.html` from GitHub Pages, plus the Archivo/IBM Plex fonts from Google. In a
basement with no signal that's a blank or stale screen — which defeats the point.

- Fix: a small **service worker** that caches the app shell (HTML, icon, and the two fonts, which I'd
  self-host so there's no third-party request at all). Result: it opens instantly with no signal,
  logging works fully, and sync resumes when you have bars.
- Updates are handled by a version stamp: on open the app checks for a new version, downloads it, and
  applies it on the *next* launch — never mid-session.
- Service workers need HTTPS, which GitHub Pages already gives you. Nothing to buy, no build step.
- What it can't do: keep syncing while the app is closed (browsers don't allow that — the app syncs
  the moment you open it), and it can't make the rest timer run while the phone is locked (see `T1`).

**Install ("Add to Home Screen")** — turns it from a web page into an app:

- Home-screen icon, no browser chrome, its own entry in the app switcher, opens full-screen.
- **It's also your data insurance.** iOS Safari applies a 7-day cap to a site's local storage if you
  don't visit; a web app installed to the home screen is explicitly exempt from that rule. Not
  "probably", it's the documented exemption — so installing is the single best protection for the
  data on your phone. (I'd still build the backups in 1.6, because "exempt from a timer" is not the
  same as "backed up".)
- Partly done already: the app has the iOS standalone meta tags and a 180×180 icon. Missing: a web
  app manifest plus 192/512 icons (proper standalone install on Android, cleaner on iOS), and the
  service worker.
- The honest limit: a web app can't be an Apple Watch app, can't read Health/Fitness (steps, heart
  rate), and can't show lock-screen widgets. If you ever want those it has to become a native app —
  that's a different project, and I'd only go there if you find yourself wishing for it in practice.
- Optional later: **push notifications** for "it's training day". Technically possible on iOS 16.4+
  but only for installed web apps, and it needs a server-side push service — so it means real extra
  plumbing. In-app nudges would cover 90% of it for free.

### 1.9 Accessibility & polish

Confirmed scope (`A1`–`A9`), which is mostly about not making the app harder to use than it needs to
be: remove the whole-page screen-reader re-announcement on every tap; focus management + Escape in
sheets; allow pinch-zoom (`user-scalable=no` is currently blocking it); stop nesting two buttons in
one row; lift contrast on the muted grey text and the completed rows; bump the 9.5–10.5px labels;
replace the browser `confirm()` alerts with styled sheets; and add optional haptics/clicks. New
additions this round: `N53`–`N58`.

### 1.10 Bugs — all found while reading, fix list

| # | Bug | Fix |
|---|---|---|
| B1 | Hidden rep steppers are saved even when untouched, defaulting to the top of the range — so every logged lift currently stores invented reps, and "3 sets logged"/"total reps" are fiction | Fixed by the last-set model (`R1`/`R2`) |
| B2 | `parseFloat('27,5')` → 27: a comma decimal silently logs a lighter weight | Normalise commas + reject junk (`L2`) |
| B3 | "Phones connected ✦" can be reported while a sync is in flight, without the PIN ever being checked | Await and verify (`Y1`) |
| B4 | A wrong PIN is written to settings before it's proved, leaving the phone retrying forever | Save on success only (`Y2`) |
| B5 | Rest timer uses `requestAnimationFrame`, which pauses when the tab is hidden or the screen locks — so it goes quiet while you're resting (the opposite of useful) | Timestamp maths + Wake Lock + scheduled alert (`T1`) |
| B6 | The first beep after a fresh load can be silent (`AudioContext` created outside a user gesture) | Create/resume it in the Start handler (`T2`) |
| B7 | Save button copy is fixed at open time, so after switching Goblet → Hack it still says "Update to…" when nothing was logged for that option | Recompute on variant change |
| B8 | Rep steppers silently clamp 0–60 and label holds as "reps" | Per-prescription labels + limits (`R9`) |
| B9 | `wipeLocal()` misses the injected `window.storage` path; `migrateLegacy()` reads `localStorage` directly | Wipe through `Store`, not raw `localStorage` |
| B10 | `supabase.sql`'s "secret does not match this room" branch can never fire (the insert happens just above it) | Tidy the function (only if we touch the SQL) |
| B11 | Dead helpers (`pcVar`, `pad`) and a duplicated close-binding | Remove |
| **B12 (new)** | **Ticks don't clear at midnight if the app is left open** — the date is only recomputed on render, and an unsynced app doesn't re-render when you return to it | Re-check the date on visibility change |
| **B13 (new)** | **A session logged after midnight is filed under the new day** (your 00:30 Friday lift becomes Saturday's), and ticks clear out from under it | "Session started yesterday" handling + a grace period |

---

## 2. Round 2 — 58 more suggestions

### The badge, the week and the plan (`N1`–`N6`)

- **N1 — Count sessions, not exercises, for the badge.** Fixes the core `1/3, 2/3, 3/3` absurdity:
  counting distinct days per muscle gives Core `1/1`, and it stays correct if the plan changes.
- **N2 — Decide whether indirect work counts.** Glutes would read `1/6 → 2/6 → …` if "also" counts.
  Truthful for the muscle, noisier on the row. (Question at the end.)
- **N3 — Make the badge live.** Instead of a static label, derive it from what you've actually
  logged: `2nd of 3 this week · 1 done`. Then the badge doubles as a weekly scoreboard.
- **N4 — Order by what you actually do, not the calendar.** If you do Friday's session on Saturday,
  the "1st/2nd/3rd" sequence should follow your real order, not the hard-coded day order (`S4`).
- **N5 — Say what the accent colour means.** The badge goes accent-coloured on the last planned
  session for that muscle; nothing explains that, so it reads as decoration.
- **N6 — Show the muscle's weekly set target next to it.** e.g. `Quads · 2/3 sessions · 9 sets/wk`,
  tying the badge (frequency) and volume (dose) together in one line.

### Volume and training insight (`N7`–`N12`)

- **N7 — Per-muscle volume panel** (the answer to your question, as a feature) — sets this week vs
  planned vs 4-week average, from your ticks.
- **N8 — Low-volume flags.** "Side delts: 5 sets/week planned — the lowest in your plan." Points at
  the gaps without you auditing anything.
- **N9 — "Not trained this week" warning.** On Thursday: "quads and chest haven't been hit yet this
  week." Cheap, and it stops a missed Monday quietly becoming a missed week.
- **N10 — Push/pull balance.** Chest 9 + front delts 2 + triceps 4 vs lats 6 + mid back 5 + biceps 4.
  Comparing those two totals is a common shoulder-health check, and the app has the data.
- **N11 — Sunday recap card.** Sessions, sets per muscle, PBs, vs last week. (Round-1 `P10` makes it
  exportable; this is the in-app version.)
- **N12 — "Direct vs indirect" honesty.** Once N2 is answered, show both numbers so nothing is
  overstated — e.g. `Triceps 4 direct · 4 more from presses`.

### Logging speed and accuracy (`N13`–`N21`)

- **N13 — Typo guard.** "That's more than double your PB — sure?" before saving. Prevents the one
  mistake that corrupts a PB chart permanently.
- **N14 — "Same as last time" as one button.** Beyond pre-filling: a single tap that logs last
  session's weight *and* reps, for when nothing changed.
- **N15 — Long-press a pill to log last time's numbers without opening the sheet.** The fastest
  possible path: no screen change at all, just the tick and the toast.
- **N16 — Hold-to-repeat steppers.** Press and hold `+` to climb 27.5 → 30 → 32.5 instead of tapping.
- **N17 — Remember the increment per exercise.** Lat pulldown moves in 5s, dumbbells in 2s, the leg
  press pin in 5s. Chips labelled with what the machine actually offers.
- **N18 — Setup notes per exercise, kept forever.** "Seat 4, pin 6, bar on the low hooks." Different
  from a per-session note — this is machine memory, and it's the thing you can never remember.
- **N19 — Per-session note** (`L9`) — kept separate from N18 so setup memory doesn't get buried.
- **N20 — Show the delta on save.** `+2.5 kg vs last time` in the toast, not just the number.
- **N21 — Bigger number entry for the sheet.** The weight field is the star of the screen; give it
  room, and make the tap target 44px+ everywhere for gloved hands.

### Sessions and plan flexibility (`N22`–`N33`)

- **N22 — Your gym's kit list.** A one-off checklist in Settings of which machines actually exist
  where you train; substitutes and swaps then only ever offer kit you have.
- **N23 — "Do it later"** instead of swapping (often the real answer when a machine is busy) — no new
  exercise, no PB pollution.
- **N24 — Pre-agreed substitutes per exercise.** 2–3 you've already approved, so `Machine taken?`
  offers real choices rather than improvisation. This is the output of the exercise review.
- **N25 — A plan editor in Settings** (the strategic option below) so you can change exercises
  yourself instead of asking me. Bigger build.
- **N26 — Injury/limitation flags.** "Skip squats for a fortnight (knee)" greys the row out with a
  reason instead of leaving it unticked and looking like failure.
- **N27 — Deload week marker.** Tag a week as lighter; volume panels and streaks treat it fairly.
- **N28 — Session duration.** Auto-start the clock on your first log and show `62 min` in history.
- **N29 — Warm-up set suggestion.** "Working set 60 kg → warm up 20, 40" printed in the sheet. Small
  thing that stops you walking in cold on a heavy RDL.
- **N30 — Plate maths for barbell lifts.** What to load for 82.5 kg with 20 kg bar and your plates.
  Low priority while you're mostly on machines, but cheap.
- **N31 — Print/PDF the plan** for the wall or the gym bag.
- **N32 — Superset pairing.** Only if you want it; your plan trains you two alternately, so it's
  probably not worth the complexity.
- **N33 — "Do it tomorrow".** If you miss Friday, shift it rather than lose the week's volume (S4
  refinement).

### Motivation and training as a pair (`N34`–`N40`)

- **N34 — Milestones.** First 100 kg leg press, 10 sessions, 50 sessions, a PB on every lift, a
  3-for-3 week. Small, cheap, and they land harder than stats.
- **N35 — "Kieran's logged today, you haven't."** An in-app nudge only (no push needed) — oddly
  effective when there are two of you.
- **N36 — Training-together mode.** Auto-alternates the logged person after each save, so you never
  touch the name switcher mid-session.
- **N37 — Shared PB chase.** "You're 2.5 kg behind Danny on leg press." Free motivation, uses data
  you already sync.
- **N38 — Shareable session card.** A generated image of today's session (or a new PB) to drop into
  WhatsApp. Optional, slightly fun.
- **N39 — Streak counter.** With the honest caveat that a deload or illness isn't failure (`N27`).
- **N40 — Who's on what, at a glance.** During a shared session, show the partner's last logged set
  next to yours so you both know where you are.

### Data and sync hardening (`N41`–`N52`)

- **N41 — Cloud cold copy.** A monthly full-backup row in the sync room, so losing both phones is
  recoverable with nothing but the PIN.
- **N42 — Sync health panel.** Entries per person, last write from the other phone, "both agree ✓".
- **N43 — Don't keep the PIN in plain text on the phone.** Store the derived secret instead (people
  reuse PINs elsewhere; a lost phone shouldn't leak a PIN you use for other things).
- **N44 — Database housekeeping.** An index on `(room, ts)` (the function's main query), a maximum
  row size, and rate-limiting room creation. Needs one re-run of `supabase.sql`.
- **N45 — Say out loud that the room is a backup.** A Settings line: "a new phone restores everything
  by entering the same PIN." Right now that's true but undocumented, so it doesn't feel like safety.
- **N46 — Version stamp + "what's new".** Which version is on this phone, and a short changelog. With
  offline caching you'll otherwise never know whether you're seeing the newest build.
- **N47 — "Something's wrong" button.** Copies version, sync state and counts to the clipboard so you
  can paste it to me instead of describing symptoms.
- **N48 — Backup nudge on the finish line.** The session-complete screen is the one moment you'd
  actually tap "back up now".
- **N49 — Guard the destructive button.** "Erase local data" behind an export prompt and a typed
  confirmation (`1.6.6`).
- **N50 — Third person, if it ever comes up.** The data model is per-person already; the UI hard-codes
  two. Cheap to make flexible, pointless until you need it.
- **N51 — Show conflicts.** If both phones edited the same entry within a minute, say which one won
  instead of silently picking the newer.
- **N52 — Export the plan, not just the data.** A JSON of the exercise list too, so a restored backup
  can bring back a customised plan (`N25` needs this).

### Accessibility & polish, beyond round 1 (`N53`–`N58`)

- **N53 — Give the progress bar real semantics.** `role="progressbar"` with `aria-valuenow`, so a
  screen reader says "6 of 8 done" instead of reading a decorative div.
- **N54 — 44px minimum tap targets.** The steppers, close buttons and pills are close but not
  reliably there; in a gym, one-handed, that matters more than usual.
- **N55 — Survive 200% text size.** Respect the OS font-size setting (and the pinch-zoom fix in
  `A3`) without the rows collapsing — the fixed `min-width:118px` side column is the fragile bit.
- **N56 — Never rely on colour alone.** Person colour and the accent carry meaning today; add a
  second cue (the ✓, the name) so colour-blind use and bright sunlight don't lose information.
- **N57 — A proper screen-reader pass on the sheet.** Named steppers ("fewer reps, set 3"),
  a clearer label on the PIN box, and the "who is training" switcher announced as a selection.
- **N58 — High-contrast / light option.** For outdoors or a very bright gym; the dark-only theme is
  a choice, not a requirement.

---

## 3. What I need from you for the exercise review

When you're ready, the cleanest format is one line per exercise — this is exactly the data the app
needs, and it feeds the badge fix, the volume panel, `Machine taken?` and the substitutes list:

```
Day / position      e.g.  Monday #1
Exercise            Leg Press
Muscle (primary)    Quads
Also works          glutes
Sets × reps         3 × 8–10
Rest type           compound / isolation / core
Bodyweight?         no
Substitutes         Hack Squat, Leg Extension, Smith Machine Squat
Per dumbbell?       no
Notes               seat 4, pin 6
```

Anything you leave blank, I'll propose something for you to approve. And if you'd rather never send
me a list at all, say the word and I'll build the plan editor (`N25`) so you can do it yourself in
the app — it's a bigger job and it needs a decision about whether plan changes sync between phones
(`Y4`), but it's the last word in flexibility.

## 4. Suggested build order

1. **The reps model** (`R1`–`R4`, `R8`, plus `B1`, `B2`, `B7`) — your idea, done properly, and it
   fixes the invented-reps problem at the same time.
2. **Undo + edit/delete** (`1.1`, `1.2`) — mistakes become recoverable.
3. **Log for both** (`1.5`) — the biggest day-to-day time saver when you train together.
4. **Data safety** (`1.6`) — import/restore first, then snapshots and the cold copy.
5. **Sync correctness** (`1.7` items 1–6).
6. **Offline + install** (`1.8`) — the app stops needing a signal.
7. **Bugs and accessibility** (`1.10`, `1.9`) — a tidy-up pass.
8. **The badge, volume and insight** (`N1`–`N12`, `P1`, `P3`) — after the exercise review.
9. **`Machine taken?` + substitutes** (`1.4`, `N22`–`N24`) — after the exercise review.

## 5. Honest limits, so nothing is over-promised

- No Apple Watch, no Health/Fitness/steps/heart-rate — web apps can't reach those.
- No lock-screen widgets or Live Activities.
- No timers or sync that keep running while the app is closed.
- No push notifications without adding a server-side push service.
- No camera form-check, no offline video.
- And the one that never changes: browser storage is not a backup. Sync + export + install is a
  three-legged stool, and all three legs are in the plan above.
