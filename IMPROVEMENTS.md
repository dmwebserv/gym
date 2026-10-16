# Session app — full improvement review

> **The list has grown:** `IMPROVEMENTS-2.md` (round 2) = replies to your questions, the specs for
> the approved changes, and 58 ideas (`N1`–`N58`). `IMPROVEMENTS-3.md` (round 3) = the long list of
> 225 ideas (`X1`–`X225`). Nothing in this document has been superseded.

**What I read:** `index.html` (2,243 lines, single file, no build step), `supabase.sql`,
`SETUP.md`. The app is live at <https://dmwebserv.github.io/gym/> (GitHub Pages, `main`).

**The two rules I've held this list to (your condition):**

1. **No stored data is ever lost or rewritten.** Every change below is additive. Your existing
   lift/tick records keep their current shape and keep working. There is no destructive migration
   anywhere in this list.
2. **No existing feature is removed.** Where I suggest replacing something (e.g. three rep boxes →
   one rep box), the old behaviour stays available behind a toggle, so nothing you can do today
   becomes impossible tomorrow.

**How to use it:** pick the codes you want (`R1, L3, F1 …`) and I'll build them. Every item has an
effort tag (`S` = under an hour, `M` = a few hours, `L` = a day or more) and a note on whether it
touches stored data.

**Read this first:** the section **R** is your reps idea worked out properly — including a real bug
in the current app that makes your idea *more* valuable than you probably think.

---

## R. Your reps idea (last set only) — the flagship change

**R1 — Log one "last set" reps number instead of three, and show it as the last result.**
Today the sheet shows a stepper for every set ("Set 1 / Set 2 / Set 3"), which is three decisions
for something you only care about once. Change it to a single number — *last set reps* — so the flow
becomes: open the exercise (weight and reps both pre-filled from last time) → **Log 27 kg × 8**.
It then displays everywhere as your last result: `27 kg × 8`.
*How it stores without losing anything:* your existing entries keep `reps: [10, 9, 8]` exactly as
they are. A new last-set-only entry is stored in the **same field** as
`reps: [null, null, 8]` — the array position still means "set 3", blanks already render as `·`
everywhere in the app today, and old entries stay readable. A tiny reader helper (`lastReps(entry)`
= last non-blank value) is what the UI uses, so a 3-year-old record and a new one display
consistently. Nothing is migrated, nothing is re-written. Optionally we also stamp
`repsMode:'last'` so the app knows which editor to open by default.
`Effort: M · Data: additive only`

**R2 — Stop the app inventing reps you never entered (this is the real bug).**
Right now, every time you save a weight, the hidden rep steppers are read even if you never opened
them, and they default to the *top* of the rep range. So logging leg press 27 kg today silently
stores `reps: [10, 10, 10]`. I verified this in the code — it happens on every single log. That's
why the Progress tab's "3 sets logged" and "total reps" numbers are currently fiction. Your
last-set idea fixes it by construction: we only save a reps value if you actually touched it.
`Effort: S (falls out of R1) · Data: never touches old entries`

**R3 — Pre-fill reps with what you actually did last time.**
The weight already pre-fills from your last session, but reps default to the range maximum. Pre-fill
reps from your last logged value for that exercise so "same as last time" is one tap. Copy the CTA
to match: **Log 27 kg × 8 (same as last time)**.
`Effort: S · Data: none`

**R4 — Keep a "log every set" escape hatch.**
Some days (or some exercises — a top set then back-offs) you *do* want per-set numbers. Keep the
existing three-stepper editor behind a small "log every set" toggle in the same sheet. Existing
records with full arrays open in this mode automatically, so nothing you've recorded becomes
unreadable or uneditable.
`Effort: S · Data: none`

**R5 — Show the last result on the session row (three options, mock-up attached).**
Where to put `× 8` next to the weight:
(a) inside the pill — `27 kg ×8` (most compact, no extra vertical space);
(b) on the line under the pill — `today 27 kg × 8` (room to also show the date);
(c) pill + secondary line — `27 kg` then `27 × 8 · PB 40`.
I've mocked all three with the app's real styles so you can see them on your phone before deciding.
`Effort: S · Data: none`

**R6 — Show reps consistently everywhere.**
Once reps are trustworthy, they should appear in the PB line (`PB 40 kg × 10`), the Progress rows,
the history sheet, the session-complete summary, the toast ("Logged 27 kg × 8") and the CSV export
(add a `last_reps` column; keep the existing `reps` column so old spreadsheets don't break).
`Effort: S · Data: none`

**R7 — Suggest the next weight from the plan's own rule.**
Your Reference section already states the progression rule: hit the top of the range on your last
set with 1–3 in reserve → add the smallest increment. With last-set reps recorded, the app can
compute it: `last set 10 of 8–10 → try 29.5 kg next time` shown on the row and in the sheet. This
turns the app from a notebook into a coach, and it costs almost nothing once R1 exists.
`Effort: M · Data: none`

**R8 — Fix the statistics that stop being meaningful with last-set-only reps.**
"Total reps" and "N sets logged" are wrong today (see R2) and can't be derived from a single number
honestly. Replace with **best set** (weight × reps) and **estimated 1RM** — see P1 — and only show
volume totals where full per-set data exists.
`Effort: S · Data: none`

**R9 — Reps in seconds for holds and "ea" for per-side work.**
`Plank 2 × 30–45s` and `Dead Bug 2 × 8–10 ea` are parsed today as if they were rep counts, and both
are marked bodyweight so they can't be logged at all. Use the prescription's own suffix: holds log
**seconds**, per-side work labels itself "each side". Then a plank that goes 45s → 60s shows up in
Progress like everything else.
`Effort: M · Data: additive`

**R10 — Say whether a dumbbell weight is per hand or the pair.**
Dumbbell Bench Press, Incline DB Press, DB RDL, DB Curls and Lateral Raises are all one number
today. Two years from now you won't remember if "27 kg" meant each dumbbell or both. Add a small
"per dumbbell" hint on those exercises (display only, no data change).
`Effort: S · Data: none`

---

## L. Logging flow (the bit you touch 20 times a session)

**L1 — Open the sheet with the number already selected, or log in one tap.**
Opening an exercise does not focus the weight box, so changing 27 → 30 is tap-tap-tap. Either
auto-focus and select-all (one tap replaces the value) or, better with R1, keep the big **Log**
button as the default action so the common case is a single tap.
`Effort: S · Data: none`

**L2 — Accept a comma as a decimal point.**
Typing `27,5` silently saves **27** (`parseFloat('27,5')` → 27). Normalise commas, strip stray
characters, and reject nonsense with a clear message instead of a rounded-down weight.
`Effort: S · Data: none — but it prevents wrong numbers being stored`

**L3 — Undo.**
"Logged 27 kg × 8 · Leg Press" with an **Undo** link in the toast. Mis-taps happen at 7am with one
hand; undo is the cheapest safety net there is.
`Effort: S · Data: none`

**L4 — "Log & next exercise".**
After saving, close the sheet and scroll to the next un-ticked exercise, so you're always looking at
where you are. Today it closes and leaves you wherever you were.
`Effort: S · Data: none`

**L5 — Show the last few sessions inside the log sheet.**
The sheet currently shows one "Last:" line. Showing the last 3 entries (`27 × 8 · 12 Oct`,
`25 × 8 · 9 Oct`, `25 × 7 · 5 Oct`) — or a mini chart — is exactly what you need to decide the next
weight, without leaving the sheet for the Progress tab.
`Effort: S–M · Data: none`

**L6 — Start the rest timer from the log sheet, automatically.**
`Rest: 90–120s` is printed in the sheet today but does nothing. On save, auto-start the correct
preset (compound/isolation/core), with an override. This merges the Timer tab into the actual
workout instead of making you remember to go to it.
`Effort: M · Data: none`

**L7 — A little "rest remaining" strip while you browse the session.**
Once L6 exists, a discreet countdown (e.g. next to the progress bar) means you don't have to sit on
the Timer tab to know when to go again.
`Effort: M · Data: none`

**L8 — Micro-loading chips.**
The quick chips are −2.5 / +2.5 / +5. Add ±1.25 (many machines and small plates step in 1.25) and
the chips you actually use most, and consider remembering the increment per exercise so the chip
labels match the kit.
`Effort: S · Data: none`

**L9 — Notes per lift.**
`"belt"`, `"left knee sore"`, `"kit taken, used the other one"`. The export already has a `note`
column that nothing ever fills. One optional line in the sheet, shown in history.
`Effort: S · Data: additive`

**L10 — "How hard was that?" (reps in reserve).**
Three chips: **easy / about right / tough**. Your plan's Rule is built on "1–3 reps left in you",
but nothing captures it. Combined with R7 it makes the next-weight suggestion genuinely smart rather
than a guess.
`Effort: M · Data: additive`

**L11 — Make "which one today?" sticky and obvious.**
The Goblet/Hack and Squat/Leg Press chips already remember your last choice (good). Show the choice
on the row in the person's colour (it does) and add a one-line "sticks for next time" hint, because
it's currently invisible that it's remembered.
`Effort: S · Data: none`

**L12 — Log-then-tick vs tick-without-weight are already right — keep them.**
Worth protecting: "Done without a weight" and the tick toggling both ways is a good design. R1 must
not break it.
`Effort: — · Data: none`

---

## S. Session screen & plan flexibility

**S1 — The `1/3` badge next to each muscle name is unexplained.**
Every row shows something like `QUADS 1/3` (accent-coloured when it's `3/3`). Nothing in the app or
the repo says what it means, and there's no legend. Either label it properly ("2nd of 3 squat
sessions this week") or replace it with a clearer signal such as sets-this-week. *Tell me what it's
meant to convey and I'll make it readable.*
`Effort: S · Data: none`

**S2 — Swap an exercise for today (kit taken).**
The footer already says "swap exercises if the kit is taken" — but there's no way to do it. A small
"swap for today" in the sheet (pick from a short list, or type one) keeps the session honest and
keeps the tick/progress behaviour intact.
`Effort: M · Data: additive (a new entry shape for swaps)`

**S3 — Make a swap permanent.**
Same as S2, plus "keep this change". This edits the plan on that phone; note that the plan lives in
the code and settings, so if you want a permanent change to appear on both phones it needs to be
synced (see Y4) — which is a bigger design decision. Worth doing only after S2 proves useful.
`Effort: L · Data: settings only`

**S4 — Train out of order, or on a different day.**
The plan is Mon/Wed/Fri and the app highlights today. Real life shifts things: a Tuesday session, or
Friday's workout done on Saturday. A "do this session today" button (which just moves today's date
context) fixes the "No session today — rest day" dead end.
`Effort: M · Data: none (uses existing date keys)`

**S5 — Show completion on the day switcher.**
A dot or tick on MON/WED/FRI telling you which of this week's sessions are already logged. Small,
and it answers "have I done legs yet this week?" instantly.
`Effort: S · Data: none`

**S6 — A session-complete summary.**
When the last exercise is ticked: best sets, total weight moved (where data allows), any PBs, and a
comparison with last time (`3 more reps than last week`). This is the emotional payoff moment the
app currently doesn't have, and it's where the "last result" display belongs.
`Effort: M · Data: none`

**S7 — Log the finisher/cardio.**
Incline treadmill and bike finishers are in the plan and completely untracked. One optional
"finisher: 12 min, incline 8" line per session (plus steps if you want) would round out the plan,
and it directly supports the fat-loss half of your goal.
`Effort: S–M · Data: additive`

**S8 — "Today" at a glance on rest days.**
The rest-day card is good. Add "last session: Friday · 8 exercises, 6 logged" so the app is still
useful on the days you're not training.
`Effort: S · Data: none`

**S9 — Your partner's number on the row.**
You train together; seeing `K 40 kg` next to the exercise is quietly motivating and helps you set
weights when you share a machine. Display only, uses data you already sync.
`Effort: S · Data: none`

**S10 — Reorder / superset two exercises.**
Lower value unless you actually run supersets. The plan's "training together" note implies
alternating rather than supersets, so I'd skip this unless you want it.
`Effort: L · Data: additive`

---

## P. Progress & insight

**P1 — Estimated 1RM so PBs are fair across rep ranges.**
Right now "PB" = heaviest weight ever, which quietly rewards low-rep sets. 110 kg × 8 and 100 kg × 10
are almost the same effort but the app calls the first one your best. Showing an estimated 1RM
(Epley: `w × (1 + reps/30)`) alongside the raw weight makes progress visible when you add reps
instead of plates — which, with 8–10 and 12–15 ranges in the same plan, you will.
`Effort: M · Data: none (computed on the fly)`

**P2 — Real charts.**
The sparkline has no axis, no dates and no scale — it shows shape, not progress. A proper chart in
the history sheet (dates across the bottom, weight up the side, tap a point for that session) makes
the Progress tab something you'd actually look at.
`Effort: M · Data: none`

**P3 — Weekly volume per muscle group.**
"How many hard sets did I do for legs this week?" is the single most useful number for the muscle
half of your goal, and the app has all the data. A compact per-muscle breakdown (this week, 4-week
average) would guide the training decisions the plan can't make for you.
`Effort: M · Data: computed from existing logs`

**P4 — Bodyweight log and trend.**
You're training for fat loss, and the app tracks weights but not *you*. A weekly weigh-in with a
trend line (and the same 7-day smoothing trick to ignore noise) is arguably the most valuable missing
feature for your actual goal.
`Effort: M · Data: additive (new record type; syncs like a lift)`

**P5 — Consistency view.**
Sessions per week/month, current streak, this month vs last. The plan's essentials list literally
starts with "train consistently, 3 times a week" — give it a scoreboard.
`Effort: M · Data: none`

**P6 — Sort, filter and spot gaps.**
The Progress list is sorted by heaviest PB. Add sort by recently trained, group by muscle, and a
"not trained in 14 days" flag (useful when you skip a session).
`Effort: S–M · Data: none`

**P7 — PB history.**
You can see the current PB and date, but not *when you beat it* or by how much. A short PB timeline
per exercise ("PB ▸ 30 kg · 3 Oct ▸ 32.5 kg · 24 Oct") is cheap and satisfying.
`Effort: S · Data: none`

**P8 — Two-person comparison.**
A simple per-exercise "you vs Kieran" (or a PB leaderboard) — the data is already on both phones. Fun
and motivating, but purely optional; it's the one feature that could cause friction if one of you
cares a lot more than the other.
`Effort: M · Data: none`

**P9 — Show the numbers you now record in history.**
Once reps are real, the history sheet should show `27 kg × 8` (last set) and best set, not
"target reps (not entered)".
`Effort: S · Data: none`

**P10 — A monthly summary you can export/print.**
One page: sessions, best sets, PBs, bodyweight trend. Nice for a coach, a doctor, or just for you in
six months.
`Effort: M · Data: none`

---

## T. Rest timer

**T1 — It doesn't reliably alert you when the phone is in your pocket (this is a big one).**
The countdown runs on `requestAnimationFrame`, which browsers pause when the tab is hidden — and
iOS suspends it entirely when the screen locks. So in practice the timer goes quiet while you're
actually resting, and only catches up (and beeps) when you pick the phone up. That's the opposite of
what a rest timer is for. Fixes, in order of reliability: keep the screen awake with the Wake Lock
API while a rest is running; schedule the alert audio at start time rather than at the end; and
always fire a catch-up beep on return. I'd also be honest in the UI about which one is in play.
`Effort: M · Data: none`

**T2 — The first beep after a fresh page load can be silent.**
`AudioContext` is only created inside `beep()`. If you press Start without tapping a preset first,
the context is created outside a user gesture and browsers are allowed to keep it muted. Create and
resume the audio context inside the Start button handler.
`Effort: S · Data: none`

**T3 — Remember the timer across reloads and tab switches.**
Reloading the page (or the app being killed by iOS) loses a running rest. Persist the end time so it
resumes correctly.
`Effort: S · Data: none (its own key, e.g. gym:timer)`

**T4 — Custom durations and per-exercise defaults.**
The presets match the plan (good), but sometimes you want 2:00 or 0:45. A "+15s / −15s" pair, and
remembering the duration per exercise, is a small change with daily benefit.
`Effort: S · Data: none`

**T5 — Bigger, glove-friendly controls and a louder ending.**
Larger Start/Pause (it's the most-tapped button in the gym), plus a longer/double alert with a
screen flash so it works with the phone face-down on a bench.
`Effort: S · Data: none`

---

## F. Data safety (your "don't lose anything" requirement)

**F1 — Import / restore from a backup (currently missing).**
You can export JSON and CSV, but there is no way to load a backup *back in*. If a phone is lost,
replaced, wiped by iOS, or you tap "Erase local data", the only route back is the sync room — and
only for what was already synced under that PIN. An import that merges a `.json` backup (newest wins,
same rule as sync) is the single most important data-safety gap in the app.
`Effort: M · Data: additive — merge only, never overwrite newer`

**F2 — Nudge you to back up, and remember when you last did.**
"Last backup 94 days ago — download one" as a small footer line, plus a reminder if you've logged
sessions since the last export. Peace of mind for two minutes a month.
`Effort: S · Data: one settings field`

**F3 — Ask the browser to keep your data, and plan for iOS eviction.**
`navigator.storage.persist()` (where supported) requests exemption from storage eviction. iOS can
clear script-writable storage after a long period without a visit; home-screen web apps are
generally exempt, but "generally" isn't a backup strategy. Combined with F1 and sync, the risk drops
to near zero. Nothing to change in how data is stored.
`Effort: S · Data: none`

**F4 — Edit or delete a past entry.**
Today you can only overwrite *today's* entry. A typo'd `200` instead of `20` two weeks ago is
permanent (and becomes your PB forever), because the key is date-stamped and old keys are never
touched. Edit/delete on any history row fixes it — and needs a small "tombstone" so the deletion
propagates through sync (see Y7) instead of being resurrected from the other phone.
`Effort: M · Data: additive (tombstones); existing entries untouched`

**F5 — Export includes everything needed to restore.**
Add the timer/settings/last-backup fields and a `schema` version to the JSON so a future version of
the app can always read today's backups. Keep the CSV exactly as-is (it's for humans).
`Effort: S · Data: none`

**F6 — Two-person safety: a copy of the other person's data too.**
The current export already includes both people's logs when they're on the same phone — keep that,
and if F1 lands, imports should merge per-person rather than replacing the file's owner.
`Effort: S · Data: none`

---

## Y. Sync

**Y1 — "Phones connected ✦" can appear without the PIN ever being checked.**
If a background sync is in flight when you press Connect (the app syncs every 60s, on focus, and on
visibility change), `doSync` returns `{ok:true}` immediately and the app reports success without
validating the PIN. Worst case you believe you're connected when you aren't.
`Effort: S · Data: none`

**Y2 — A wrong PIN is saved before it's proved wrong.**
`S.sync.pin` is written *before* the first sync attempt. If the PIN is mistyped, the phone then
retries forever with a dead PIN, showing errors, and the only recovery is the hidden
"Reconnect" button. Save the PIN only on success, or roll it back.
`Effort: S · Data: settings only`

**Y3 — Sync re-uploads and re-downloads everything, every time.**
`p_since: 0` and a full local row set go up on every sync — every 60 seconds, on every save, on
focus. It's small today, but it's needless battery, data and battery drain, and it gets slower as the
log grows. Track a watermark (the function already accepts `p_since`) and send only changed rows.
`Effort: M · Data: none`

**Y4 — Decide what syncs: data only, or settings too.**
Today only lifts and ticks cross over — names, the "who am I" choice and the plan live per phone.
That's why S3 (permanent plan changes) can't be done without deciding this. I'd suggest a small,
explicit set of "shared settings" (names, plan edits) and keeping PIN/device choices local.
`Effort: M · Data: additive (settings are already a JSON blob with a version field)`

**Y5 — Make sync status more visible and less alarming.**
The status lives in small footer text. A single obvious state (Synced 09:41 / Syncing / Offline —
will retry / Not connected) in Settings plus the Session footer is enough; make the error messages
say what to *do*, not just what failed.
`Effort: S · Data: none`

**Y6 — Cut redundant syncs.**
Focus + visibilitychange + the 60s interval + post-save can all fire within a second of each other.
One debounced refresh (plus a manual "Sync now") is enough for two phones.
`Effort: S · Data: none`

**Y7 — Deletions must propagate (see F4).**
The merge rule is "newest wins, never remove", so deletions can't travel. A tombstone row
(`{deleted:true, ts}`) merged the same way fixes it cleanly and keeps the "never lose a newer
write" guarantee.
`Effort: M · Data: additive`

**Y8 — PIN strength and stranger-proofing the room.**
Two small things: require 8+ characters (a 4-character PIN is guessable by anyone who knows the
project URL, since the room is derived from it and every guess is one cheap API call), and make the
SQL require an explicit "create this room" flag so a wrong guess can't quietly register a new room
or add junk rows to `rooms`. Cheap insurance; your data is only as private as the PIN.
`Effort: S (app + a one-off SQL re-run) · Data: none`

---

## O. Offline, install and speed

**O1 — The app doesn't work without signal.**
There's no service worker, so the page must be fetched from GitHub Pages each time. In a basement
gym with no signal, that's a blank screen or a stale copy — which defeats the point of an
offline-first local-storage app. A small service worker that caches the app shell fixes it, and it's
the single biggest reliability win for daily use.
`Effort: M · Data: none`

**O2 — Make it a proper installed app (especially Android).**
There's no web app manifest and the icon is a single 180×180 PNG (fine for iPhone). Adding a manifest
plus 192/512 icons gives you a real standalone app on Android and a cleaner install on iOS.
`Effort: S · Data: none`

**O3 — Update flow for a cached app.**
Once O1 exists, the app can serve a stale version to itself. Cache the shell with a version stamp,
check for a new version on load, and apply it on the next launch (never mid-session).
`Effort: S (part of O1) · Data: none`

**O4 — Fonts block first paint offline.**
Archivo and IBM Plex Mono load from Google Fonts. With no signal (or blocked fonts) the typography
falls back mid-render, and it's an extra network dependency for an app whose whole point is working
in a gym. Self-host the two fonts, or accept system fonts and drop the request.
`Effort: S · Data: none`

**O5 — Keep the single file, no build step — please.**
Worth saying explicitly: the fact that this is one HTML file with no toolchain, no dependencies and
no deploy pipeline is a feature, not a limitation. It's why it loads instantly, works offline
(for storage at least), and can be edited by hand. Everything above can be done inside that
constraint; I won't introduce npm, a bundler or a framework.
`Effort: — · Data: none`

---

## A. Accessibility & polish

**A1 — `aria-live="polite"` on `<main>` makes screen readers re-read the whole page.**
Every render (every tap) announces the entire app. Remove it from the main container; announce only
the toast and specific updates.
`Effort: S · Data: none`

**A2 — Sheets need focus management and Escape.**
`role="dialog"` is set, but focus isn't moved into the sheet on open, isn't trapped, and isn't
returned to the pill on close (and Escape doesn't close it). Also, the close handler is bound twice
in the log sheet — harmless, but worth tidying.
`Effort: S · Data: none`

**A3 — Don't block pinch-zoom.**
`maximum-scale=1, user-scalable=no` prevents zooming small text, which is a WCAG failure and a real
problem for anyone with less than perfect eyesight in a dim gym.
`Effort: S · Data: none`

**A4 — Nested interactive elements.**
The weight pill is a `<button>` inside a row that is also a `role="button"`, and both do the same
thing. Screen readers announce two controls for one action. Make the row the tap target and the pill
visual (or vice versa) — one control, one label.
`Effort: S · Data: none`

**A5 — Low-contrast secondary text.**
`.pbline.blank` (opacity .55), `.restline` (opacity .8) and completed rows (`opacity .4`) drop the
muted grey well below readable contrast on the dark background. Raise the floor and stop stacking
opacity on top of an already-muted colour.
`Effort: S · Data: none`

**A6 — Bump the smallest type.**
Several labels are 9.5–10.5px (tab bar, muscle line, PB line, rest line). On a 360px phone in a gym
that's squint territory. 11–12px minimum is achievable without losing the aesthetic.
`Effort: S · Data: none`

**A7 — Replace native `confirm()` dialogs.**
"Clear ticks" and "Erase local data" use browser alerts, which look foreign to the app, can be
suppressed by browsers, and give no context. A styled confirmation sheet (with the count of what's
being cleared) is better and matches everything else.
`Effort: S · Data: none`

**A8 — Haptic and audio feedback.**
Android can vibrate on tick/log; iOS Safari can't vibrate, but a short click sound (toggleable)
works on both. Small, but it lets you log without looking at the screen.
`Effort: S · Data: none`

**A9 — Dark-only theme.**
Fine as a choice — but worth a note: if you ever train outdoors or in a bright gym, a light/high
contrast option helps. Low priority.
`Effort: M · Data: none`

**A10 — Keep what's already good.** Reduced-motion support, safe-area handling, the person colour
coding, per-person data separation, footnote disclaimers, and the reference accordions are all done
well — I'll avoid touching them.
`Effort: — · Data: none`

---

## B. Bugs found while reading the code

| # | Bug | Effect | Fix effort |
|---|-----|--------|-----------|
| B1 | Hidden rep steppers are read and saved on every log, defaulting to the top of the rep range | Invented reps stored for every lift; "sets logged"/"total reps" in Progress are fiction | With R1 |
| B2 | `parseFloat('27,5')` → 27 | A comma decimal silently logs a lighter weight | S (L2) |
| B3 | Success reported while a sync is in flight | "Connected" without the PIN being validated | S (Y1) |
| B4 | PIN saved before being proved | Phone stuck retrying a wrong PIN | S (Y2) |
| B5 | Timer uses `requestAnimationFrame` | No alert while the phone is asleep/locked | M (T1) |
| B6 | `AudioContext` created outside a gesture | First beep after a fresh load can be silent | S (T2) |
| B7 | Save button copy is fixed at open time | After switching Goblet → Hack it still says "Update to …" when nothing was logged for that option | S |
| B8 | `reps` steppers clamp to 0–60 silently; holds are labelled "reps" | Wrong label for planks/dead bugs, silent clamping | R9 |
| B9 | `wipeLocal()` can't clear the injected `window.storage` path; `migrateLegacy()` reads `localStorage` directly | Only matters inside a host shell, but the wipe may not be complete there | S |
| B10 | `supabase.sql`'s "secret does not match this room" branch can never fire (the row is inserted just above) | Dead code; the real protection is the room derivation | S |
| B11 | Unused helpers (`pcVar`, `pad`) and a duplicated close-binding | Harmless tidiness | S |

---

## C. Things I'd deliberately not do

- **No accounts, no logins, no cloud dependency** beyond the optional room. The PIN model is the
  right call for two people.
- **No framework, no build step, no npm.** O5.
- **No renaming of storage keys** (`gym:settings`, `gym:log:*`, `session:*`). Renaming orphans data —
  it's the one change that *would* lose history, so it's off the table.
- **No destructive rewrite of existing records.** Additive fields only; old entries stay byte-identical.
- **No social/sharing features** beyond a possible session summary — the app is for two people in a
  gym, not a feed.
- **No automatic deletion of old data.** Ever.

---

## Suggested first bundle (if you want my opinion)

1. **R1 + R2 + R3 + R5** — your reps idea, done properly, including the fix for invented reps. The
   single biggest usability win in the app.
2. **L2 + L3 + L1** — comma fix, undo, one-tap logging. Tiny, and they remove daily friction.
3. **T1 + T2** — make the rest timer actually work with the phone in your pocket.
4. **F1 + F2** — backup restore and a backup nudge. This is the "we'll never lose it" insurance.
5. **O1 + O2** — offline + installable, so it opens in the gym car park with one bar of signal.

Then, in a second pass: **S1/S2** (the plan-flexibility stuff), **P1 + P3 + P4** (insight: fair PBs,
volume, bodyweight trend), **Y1–Y3** (sync correctness), **A1–A7** (accessibility tidy-up).

## Open questions for you

1. **What is the `1/3` badge meant to mean?** (My best guess: "this is the 1st of 3 squat-pattern
   sessions this week", because it's accent-coloured when it's the last one. If that's right I'll
   label it properly; if it isn't, I'll replace it.)
2. **Dumbbell weights: per hand or the pair?** It decides how R10 reads and how your history is
   interpreted.
3. **Last set or first set?** You said the last set matters most — happy to go with that. Worth
   knowing that some coaches use the *first* working set as the benchmark precisely because it isn't
   fatigue-limited. If you'd rather record the first set I can make the choice a setting.
