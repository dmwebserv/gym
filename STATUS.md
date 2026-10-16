# STATUS — where we are

**Read this first when you pick this up.** It's the single page: what's decided, what's built, what's
left, and where the detail lives.

Last updated: **16 October 2026** · **Releases 1, 2, 3 and 4 are built, tested and merged to `main` (PR #3), plus restore and sync hardening from Release 5, plus the fixes and polish found by using it.** 419 automated checks pass.

---

## 1. Where things stand, in plain English

| | State |
|---|---|
| **The workout** | Reworked, agreed, and **now built into the app** |
| **Release 1 — how you log** | ✅ Built and tested: last-set reps, undo, edit/delete, log-for-both, typo guard |
| **Release 2 — the new programme** | ✅ Built and tested: the new exercises, automatic weekly rotation, substitutes, the pull-up ladder |
| **Release 3 — it feels like an app** | ✅ Built and tested: splash screen, boot skeleton, home-screen install with proper icons, offline works with no signal at all, top bar follows the day |
| **Release 4 — Progress & motivation** | ✅ Built and tested: four Progress views (lifts, PB wall, 12-week map, you two), the session-complete summary, the PB moment, named partner PBs, last-three-sessions, plate calculator, search, short-on-time trim, superset hand-off |
| **Data safety** | ✅ Built and tested: restore from a backup, safer erase, sync that only sends what changed |
| **Your data** | Untouched. Nothing rewritten, migrated or deleted — proven by a test that boots the app on a phone full of old data |
| **On your phones?** | **Yes** — merged to `main` via PR #3, which `dmwebserv.github.io/gym` serves. It goes live as soon as GitHub Pages rebuilds; the installed app picks the new version up on its next launch with signal |
| **Next** | The remainder of Release 5, and the two deferred items listed in §9 |

## 2. Where everything is

| File | What it is |
|---|---|
| **`STATUS.md`** | This file — the state of play |
| `WORKOUT.md` | The plan as agreed, with the volume table, the ladder and the cut list |
| `preview/new-plan.html` | The plan drawn on screen with the app's real styling — now also showing the weekly alternation |
| `preview/reps-rows.html` | The four ways "last set" reps could be shown on a row (the choice is made) |
| `SELECTED.md` | The check-list of everything you picked, with the flags |
| `IMPROVEMENTS.md` | Round 1: 76 ideas + 11 bugs |
| `IMPROVEMENTS-2.md` | Round 2: answers, specs, 58 ideas + 2 bugs |
| `IMPROVEMENTS-3.md` | Round 3: the long list — 225 ideas (`X1`–`X225`) |
| `index.html` | **The app.** Releases 1 and 2 are in. |
| `tests/` | 224 automated checks that drive the real app |
| `manifest.webmanifest`, `sw.js`, `fonts/`, `pwa-*.png`, `splash-*.png` | What makes it install and work offline |
| `supabase.sql` | The shared sync store. **Untouched.** |

## 3. Decisions locked

**The rule held throughout:** nothing stored is ever lost or rewritten, and no existing feature is
removed. Every change is additive.

- **Reps:** one entry per exercise = your **last set** (the heaviest). One number, not three.
- **Dumbbell weights:** **per hand** — stated on the row and the sheet, stored as you type it.
- **The `1/3` badge:** the number of times that muscle is worked that week, counted in exercises —
  and now **derived from the plan automatically**, so it can never drift again.
- **Variants:** dumbbell and barbell (and cable and machine) are **separate records** with separate
  PBs; only the weekly rotation is shared.
- **Rotation:** **automatic** — the app offers whichever variant you did not do last time. Tapping the
  other one switches it for that day only and doesn't break the alternation.
- **Yoga of the old data:** the app never rewrites it. Old invented reps can be blanked by a button
  you press, and that's undoable.

**Dropped, so they don't get re-suggested:** X7 app shortcuts (iPhone), X20 open-in-app links,
X153 timed notification (see §6), X226 calendar events.

## 4. The programme (detail in `WORKOUT.md`)

- **Monday** — leg press, **flat bench (DB ⇄ barbell)**, lat pulldown, RDL (barbell), dumbbell lateral
  raises, triceps pushdown, dumbbell curls. **19 sets.**
- **Wednesday** — **hack squat**, **incline bench (DB ⇄ barbell)**, **row (cable ⇄ machine)**, leg curl,
  shoulder press, **pec fly**, **cable lateral raise**, **face pull (⇄ reverse pec deck)**, **calf raise**,
  biceps curls, triceps pushdowns (mergeable as a superset). **29 sets.**
- **Friday** — leg press, chest press machine, **lat pulldown or pull-up practice**, **RDL (DB ⇄ barbell)**,
  row, lateral raises, **calf raise**, biceps curls, triceps pushdowns, **reverse pec deck**, **farmer's carry**.
  **28 sets.**
- **76 sets/week** (was 61). Every muscle inside the usual 10–20 sets/week range once indirect work counts.
- **Pull-up ladder** — a collapsible panel, closed by default, at the bottom of every session. Seven
  levels: dead hangs → **scapular pull-ups** → negatives (timed) → bottom-half reps → band-assisted →
  full reps. Built for a gym with no assisted machine; you own bands. Optional extras: inverted rows
  (bar low in the Smith machine) and jump-to-top holds.

## 5. What's built (so you can see it on the phone)

**Release 1 — how you log**

- One box: **Reps · last set**, pre-filled from last time. Nothing is saved unless you type it. (The old
  version silently stored the top of the rep range on every lift — that bug is gone.)
- The row reads `27 kg ×8`; PB lines read `PB 40 ×10`; the Progress rows say best set, not fake totals.
- **Undo** on every save, edit and delete. It restores the previous value *and* re-stamps it, so the undo
  travels to Kieran's phone; a record you'd just created becomes a hidden marker rather than vanishing.
- **Edit / delete** any past record (Progress → a lift → a session): weight, reps, date, or delete.
- **Log for both** — one save writes both of you, each against their own exercise choice, both ticked,
  both PB-checked.
- **Typo guard** — more than double your PB asks first, and nothing is written until you confirm.
- `27,5` now saves as **27.5**.

**Release 2 — the programme**

- The new plan, exactly as agreed, with the badges derived from it.
- **Weekly alternation** for the bench, incline, row and RDL, driven by what you actually did last time.
- **Machine taken?** in every log sheet: pre-agreed substitutes (logged under their own name, so your
  original lift's history and PB are untouched), plus **"Do it later"** to move an exercise to the end
  of today's session.
- **Pull-up ladder** panel, with level tracking that syncs like everything else (it's kept out of your
  Progress and CSV, so it can't pollute your lifts).
- **Retired exercises keep everything**: hip thrust, plank, cable crunch and dead bug stay in your
  history with their names and muscle labels, they just aren't session rows any more.
- A **"What the symbols mean"** legend in Settings — the app finally explains its own `1/3` and `×10`.
- A **backup nudge** in the footer if it's been over a month, and a **"Clean up auto-filled reps"**
  button in Settings (your open question — my recommendation was option (c), so that's what it does:
  blanks the invented reps only, keeps weight and date, spares records that have a real last-set rep,
  and it's undoable straight away).

**Release 3 — it feels like an app**

- **Splash screen and boot skeleton.** Launching shows the logo and "SESSION", then the page's own
  shape fills in — so the app never shows a blank white or empty screen. There's a four-second failsafe,
  so this can never strand you on the splash.
- **Real home-screen install.** A proper manifest with 192/512 icons and a maskable icon (so launchers
  can round it without cropping the logo), the right name, the app's own colours, a portrait lock, and
  home-screen shortcuts (Android) to Today / Timer / Progress.
- **Offline for real.** A service worker caches the app itself, so it opens with no signal at all — the
  first screen you've ever opened. It is **network-first**, so a new version appears the moment you have
  signal, but the copy on the phone means a dead patch in the gym changes nothing.
- **Your data is never cached by the service worker.** Cross-origin requests (the sync room) pass
  straight through, untouched and always fresh.
- **A new version never interrupts a session.** It downloads quietly and is adopted on your *next*
  launch, and only when no sheet is open.
- **The fonts are now part of the app** (Archivo and IBM Plex Mono, 116 KB) instead of coming from
  Google — no third-party request at all, and they work offline.
- **Nine iOS launch images**, so the app opens straight into its own colours instead of a white flash.
- **The phone's top status bar follows the day** — yellow, blue, red — and its normal colour elsewhere.
- **Offline says so, plainly:** "Offline — everything still saves on this phone and syncs when you have
  signal."
- **"This phone" in Settings** tells you whether you're opened as an installed app and whether the
  browser has granted your data protection, in plain words.
- **Buzz on/off and Normal/Higher contrast** in Settings (contrast raises every faint grey at once
  — useful in a bright gym).

**Release 4 — Progress and the session's moment**

- **Progress is now four views** instead of one long list: **Lifts** (as before, plus this month vs last),
  **PBs** (the whole wall, sortable by heaviest / newest / A–Z, with the next milestone counted out),
  **Map** (twelve weeks of squares — one per session day, filled by how much you logged — a streak count,
  and this week's exercises per muscle against what the plan asks), and **You two** (best sets side by side
  on the lifts you both do, the lifts only one of you has logged, and what the other person did lately).
  Retired lifts keep their PB, and **none of these screens writes a single byte** — proven by a test.
- **Memories**: "on this day" from your own history, and a line counting back to the very first lift
  you ever logged.
- **A finished session gets a summary** — how many of how many, kilos moved, minutes, best set, PBs today,
  and the difference against the last time you did that day.
- **Beating a PB gets a moment**: a gold banner slides down with the weight and whose PB it is.
- **Every row shows the other person's PB for that lift, named** — "Kieran's PB 40 ×8" — so it can never be
  mistaken for yours.
- **Gym-floor tools**: hold a weight pill for half a second and it logs **last time's** weight and reps and
  ticks the exercise, with no sheet at all (a normal tap still opens the sheet) · the sheet lists your
  **last three sessions** for that lift with the most recent highlighted · a **plate calculator** that works
  per side from a standard set and refuses a weight it cannot make · **search** across everything you have
  ever logged · **"Short on time?"** trims today to 25/35/45/60 minutes, big lifts first, one movement per
  muscle, marking what it left out (today only) · **the superset hands over by itself** — save the biceps
  set and the triceps sheet is already open, each keeping its own record.

**Data safety (built early, because this is the one that matters)**

- **Restore from a backup.** You could export but never import — that hole is closed. It **merges**:
  anything you have that's newer is kept, anything missing is added, nothing is ever deleted, unknown
  people are ignored, and it's undoable. You see the counts (added / updated / skipped) *before* it
  writes anything, and it refuses the CSV if you pick the wrong file.
- **Erase is now a proper sheet**, not a browser popup: it names how many lifts and ticks are on this
  phone, says plainly that it doesn't touch the other phone, offers an export first, and still needs a
  second tap to arm.
- **Backups are stamped** with the app, a schema version and a date, so any future version can always
  read an old file.
- **Sync now only sends what changed** — a quiet sync sends **zero** rows instead of every record you
  own, and asks only for rows newer than the last it saw. Every 20th sync (and every manual one) still
  sends everything, so a missed row can never be lost. Two phones have been simulated against the real
  SQL semantics: deletes stick, an older stale copy cannot resurrect a deleted record, an offline lift
  catches up, and a brand-new phone recovers the whole room.

**Fixed after the first look on the phone (17 October)**

- **The pull-up ladder really was plain text.** Its stylesheet block had never landed — the panel,
  its rungs and its buttons had no CSS at all, which is why moving up and down seemed to change only a
  number. It now has a proper panel, and the stage you are on is highlighted **and labelled "you are
  here"**, the rungs you have passed are ticked, the stage number appears in both the summary and the
  body, and **the panel stays open while you move up and down** instead of folding itself away.
- **The log sheet's options looked unavailable.** The variant chips ("Which one today?"), the ghost
  buttons (Cancel, Go back, Move up a level) and the small tool buttons were all drawn in the same grey
  as disabled text. Everything you can tap now reads as chalk on a raised surface; **dim is reserved for
  things that genuinely cannot be tapped** (like "Move down" at stage 1).
- **Swiping between days now works** — left for the next session day, right for the previous one — with
  ‹ › arrows either side of the MON/WED/FRI tabs so the gesture is discoverable. It ignores scrolling,
  small drags, slow drags, and does nothing while a sheet is open.
- **A new test suite exists for exactly this class of bug**: it fails the build if any class the app
  renders has no stylesheet rule, and if any tap target resolves to disabled-grey. `tests/interaction.js`,
  47 checks. That is what I should have had before shipping the ladder.

**Polish pass (second round of phone feedback)**

- **Undo now covers everything, not just weights.** Moving an exercise to the end ("do it later"), swapping
  to a substitute, putting it back, moving the ladder up or down, marking it practised, choosing a band,
  trimming today to a shorter session, clearing the day's ticks, and arranging a row — every one of them
  now offers **Undo** in the notice. The undo stack was extended to snapshot layout choices
  (today's order, swaps, one-day picks, trims, remembered choices) as well as the log, so undoing a
  rearrangement genuinely puts the session back the way it was.
- **Rows can be arranged by tapping.** Rearrange → each row gets ▲ ▼. It is **today only** — the plan is
  never rewritten — it is undoable, and it animates so you can see what moved. Tapping was chosen over
  dragging on purpose: a drag has to fight the page scroll, the day swipe and the long-press-to-repeat,
  and goes wrong exactly when you are in a hurry. (Say the word if you want a real drag as well.)
- **Notices now span the width of the screen**, message on the left, Undo on the right, clear of the
  notch and the home bar. No more small pill in the corner.
- **The jitter is fixed, and here is what it was:** every repaint replayed a 400 ms entrance animation on
  the whole page — so ticking a box, logging a lift or moving a row re-animated the entire screen.
  The animation is now tied to genuinely arriving somewhere new (different tab, day or person), data
  changes update in place, and the transition itself is shorter and softer (280 ms, no bounce). Row
  backgrounds, pills, buttons, the progress bar and the sheets all have proper transitions now, and
  reduced-motion still turns all of it off.

**Also fixed while I was in there:** the app no longer reports "Connected ✦" without checking your PIN;
a wrong PIN is no longer saved before the store accepts it; ticks now roll over correctly if the app is
left open past midnight; "Erase local data" clears the injected-storage path too; and the Settings sheet
no longer breaks if the browser lacks `matchMedia` (found by the tests).

## 6. Platform limits — worth remembering before asking for these again

- A web app **cannot** fire a notification at a time you choose. It can only be triggered by a server,
  and iPhone can still stay silent. Your phone's alarm does this today.
- No Apple Watch, no Health/Fitness/steps/heart-rate, no lock-screen widgets, no background timers or sync.
- Install to the home screen **is** a real safeguard: iOS clears a Safari tab's storage after 7 days
  without a visit, but home-screen web apps are exempt. You're already installed.

## 7. After a week on the new programme — the reflection checklist

1. **Did Wednesday and Friday fit your time?** They're 75–85 minutes as a pair on my estimate. If not,
   the cut list is `WORKOUT.md §6` (superset the arms first — free).
2. **Did the extras actually get done** — calves, rear delts, the carry? Anything skipped twice should be
   swapped, not kept as guilt.
3. **Did the alternation feel right** (DB ⇄ barbell, cable ⇄ machine), or would you rather a fixed
   variant per day?
4. **Did the superset get used**, or do the arms work fine separately?
5. **Are the big lifts going up?** If yes, the plan is working — volume isn't the problem.
6. **Anything niggly?** That beats any list I can write.
7. **Was the pull-up ladder used?** If the scapular pulls are too easy/hard, move a level.

## 8. Open questions for you

1. **Any exercise you want renamed** on screen? Cheap now, annoying later.
2. **Machine Row's real name or brand?** I've used "Machine Row" from your description.
3. **Do you want the reps from your pre-Release-1 records blanked?** The button is there in Settings;
   it's your call when to press it. **Recommendation: press it once you're happy with the new logging**,
   after exporting a backup.

## 8b. Two things to know about the setup (not changes — facts)

- **The repo is public**, and GitHub Pages needs that to stay free. So the plan, this file and the tests
  are readable by anyone with the link. Nothing personal is in them beyond your first names and your
  training weights.
- **The shared sync room is protected only by your PIN.** The Supabase key in the app is a public one by
  design (it can do nothing without the room secret), and the room name is derived from that PIN — so a
  strong PIN is what keeps the shared copy private. Everything else never leaves the phone.

## 9. Build plan

| Release | Scope | State |
|---|---|---|
| **1** | Reps model + invented-reps fix, undo, edit/delete, log-for-both, typo guard, entry hardening | ✅ built, 81 checks |
| **2** | The new programme, derived badges, automatic rotation, substitutes, "do it later", the pull-up ladder, retired-exercise labels, legend, backup nudge, rep clean-up | ✅ built, 41 checks |
| **3** | Splash, boot skeleton, manifest, icon set, offline shell, install polish, launch images, top-bar colour, self-hosted fonts | ✅ built, 43 checks |
| **4** | Progress & motivation: the four views, "on this day", milestones, PB wall, comparison, session summary, PB celebration, partner feed, gym-floor tools | ✅ built, 93 checks |
| 5 | Restore + erasing safety ✅, incremental sync ✅, schema-stamped backups ✅; still open: automatic snapshots, heatmap of what you skipped, focus handling, themes | partly built |

## 10. How to pick this up

Say any of: **"Read STATUS.md and finish Release 5"**, or name a single item, or a code from
`IMPROVEMENTS-3.md`. Everything needed is in these files; nothing has to be re-explained.

### Deliberately not built yet, and why

| Item | Why it is waiting |
|---|---|
| **Share cards** (X89 / X170 / X200) | You asked for a good-looking image, not a printout. Drawn on a canvas, which I cannot see from here — it needs your eyes on a real design before it ships |
| **Plateau detection** (X69) | It needs months of real data before it can say anything honest. It would currently just guess |
| **Photo notes** (X41) | A photo in `localStorage` would risk the very storage that holds your log (the limit is about 5 MB in total). It needs IndexedDB first — a real piece of work, not a quick add |
| **Light theme** (X217) | The whole app is dark-first. A light theme is a full colour pass that has to be looked at, not unit-tested. Higher-contrast mode is built in the meantime |
| **Swipe between days** (X23) / **drag to reorder** (X29) | Both fight with scrolling on a phone, and "do it later" already covers the real problem (a machine being busy) |
| **Timed reminders** (X153 / X226) | Not possible for a web app — see §6 |

## 11. Guardrails I'm holding to (so they survive anyone touching this)

- **Never rename an existing storage key** (`gym:settings`, `gym:log:*`, `session:*`). Renaming orphans
  data — the one change that would genuinely lose history.
- **Never rewrite an existing record.** New records get new fields; old ones stay byte-identical.
- **Never delete.** Deletions are tombstones that sync, so the other phone can't resurrect them.
- **Single file, no build step, no dependencies.** It's why the app is instant and hand-editable.
- **Any restore or import merges (newest wins) and never overwrites newer data.**
- **Run `tests/` before merging anything that touches `index.html`.** Nine files, 419 checks, about
  90 seconds. `tests/interaction.js` will catch a missed stylesheet block, which is how the ladder shipped
  unstyled.
- **Nothing third-party loads at runtime** — not the fonts, not a script, not an icon. The sync room is
  the only network call the app ever makes, and it is never cached.
