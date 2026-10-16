# STATUS — where we are

**Read this first when you pick this up.** It's the single page: what's decided, what's built, what's
left, and where the detail lives.

Last updated: **16 October 2026** · **Releases 1 and 2 are built and tested.** 138 automated checks pass.

---

## 1. Where things stand, in plain English

| | State |
|---|---|
| **The workout** | Reworked, agreed, and **now built into the app** |
| **Release 1 — how you log** | ✅ Built and tested: last-set reps, undo, edit/delete, log-for-both, typo guard |
| **Release 2 — the new programme** | ✅ Built and tested: the new exercises, automatic weekly rotation, substitutes, the pull-up ladder |
| **Your data** | Untouched. Nothing rewritten, migrated or deleted — proven by a test that boots the app on a phone full of old data |
| **On your phones?** | **Not yet** — `dmwebserv.github.io/gym` serves `main`. Everything is on the branch `arena/5722d17c-gym`, ready for a pull request |
| **Next** | Release 3 (splash / install / offline), then data safety, then the extras |

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
| `tests/` | 138 automated checks that drive the real app |
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

**Also fixed while I was in there:** the app no longer reports "Connected ✦" without checking your PIN;
a wrong PIN is no longer saved before the store accepts it; ticks now roll over correctly if the app is
left open past midnight; and "Erase local data" clears the injected-storage path too.

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

## 9. Build plan

| Release | Scope | State |
|---|---|---|
| **1** | Reps model + invented-reps fix, undo, edit/delete, log-for-both, typo guard, entry hardening | ✅ built, 81 checks |
| **2** | The new programme, derived badges, automatic rotation, substitutes, "do it later", the pull-up ladder, retired-exercise labels, legend, backup nudge, rep clean-up | ✅ built, 41 checks |
| **3** | Splash screen, boot skeleton, manifest, icon set, offline app shell, install polish, safe areas | ⏭ **next** |
| 4 | Progress & motivation: per-dumbbell handling, frequency heatmap, "on this day", milestones, PR wall, comparison, session summary, PB celebration, partner feed, share cards, achievements | todo |
| 5 | Data safety (import/restore, snapshots), sync streamlining, accessibility (danger-zone confirmations, focus handling), themes, settings search | todo |

## 10. How to pick this up

Say any of: **"Read STATUS.md and start Release 3"**, or name a release, or a code from
`IMPROVEMENTS-3.md`. Everything needed is in these files; nothing has to be re-explained.

## 11. Guardrails I'm holding to (so they survive anyone touching this)

- **Never rename an existing storage key** (`gym:settings`, `gym:log:*`, `session:*`). Renaming orphans
  data — the one change that would genuinely lose history.
- **Never rewrite an existing record.** New records get new fields; old ones stay byte-identical.
- **Never delete.** Deletions are tombstones that sync, so the other phone can't resurrect them.
- **Single file, no build step, no dependencies.** It's why the app is instant and hand-editable.
- **Any restore or import merges (newest wins) and never overwrites newer data.**
- **Run `tests/` before merging anything that touches `index.html`.** Three files, 138 checks, about
  20 seconds.
