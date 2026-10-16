# STATUS — where we are

**Read this first when you come back to this project.** It's the single-page version of everything:
what's decided, what's built, what's next, and where the detail lives.

Last updated: **16 October 2026** · **Release 1 built and tested.**

---

## 1. In one paragraph

You asked me to review the app, then for a long list of possible improvements, then we reworked the workout.
All three are done.

**Release 1 is now built in `index.html`**: the last-set reps model, the fix for the app inventing reps, undo,
edit/delete of any past record, log-for-both, the heavy-weight typo guard and weight-entry fixes.
`supabase.sql` is untouched and **no stored data is lost, changed or migrated** — verified by an automated
test that boots the app on a phone full of old data.

**The app on your phone still shows the old exercise list** until Release 2 lands — Release 1 changes how you
log, not what's programmed. See §8.

## 2. Where everything is

| File | What it is |
|---|---|
| **`STATUS.md`** | This file — the state of play |
| `WORKOUT.md` | **The final plan (v1)** — every exercise, variant, volume table, the pull-up ladder, the cut list |
| `preview/new-plan.html` | The new plan on screen, rendered with the app's real styling |
| `preview/reps-rows.html` | Mock-up of the four ways of showing "last set" reps on a session row |
| `SELECTED.md` | The check-list of everything you picked, with flags |
| `IMPROVEMENTS.md` | Round 1: 76 ideas (`R`, `L`, `S`, `P`, `T`, `F`, `Y`, `O`, `A`) + 11 bugs (`B`) |
| `IMPROVEMENTS-2.md` | Round 2: answers, specs for the approved work, 58 ideas (`N`) + 2 bugs |
| `IMPROVEMENTS-3.md` | Round 3: the long list — 225 ideas (`X1`–`X225`) |
| `index.html` | **The app — Release 1 built in.** |
| `tests/` | Automated checks that drive the real app (`node release1.js`, `node upgrade.js`) |
| `supabase.sql` | The shared sync store. **Unchanged.** |

## 3. Decisions locked

**Your rule throughout, which I've held to:** nothing stored is ever lost or rewritten, and no existing
feature is removed. Every change is additive.

- **Reps:** one entry per exercise = your **last set**, which is your heaviest. One number, not three.
- **Dumbbell weights:** **per hand** — shown as such everywhere, stored exactly as you type it.
- **The `1/3` badge:** stays exactly as it is — how many times that muscle is worked that week. It'll be
  derived automatically from the plan so it can never drift out of sync again.
- **Variants:** dumbbell and barbell (and cable and machine) are **separate records** with separate PBs;
  the only thing they share is the weekly rotation.
- **Rotation:** **automatic** — the app offers whichever variant you didn't do last time, always overridable.
- **Approved work:** reps model + the invented-reps fix, undo, edit/delete any record, log-for-both,
  suspicious-weight guard, weight-entry hardening, data safety (import/restore, snapshots, backup reminders),
  sync correctness, offline + install polish, accessibility, all 13 bugs found so far, the staged releases.
- **Confirmed details:** dumbbell weights are **per hand**; **resistance bands owned** (used for the
  pull-up ladder's bridging level); **Smith machine available** (barbell bench without a spotter, and the bar
  set low for inverted rows); the non-cable row is a **seated row machine** (plate-loaded, chest-supported,
  upright, single-arm capable).

**Dropped, so nobody re-suggests them:** X7 app shortcuts (iPhone only → you're on iPhone, unsupported),
X20 open-in-app links, X153 timed notification (see §6), X226 calendar events.

## 4. The workout (summary — detail in `WORKOUT.md`)

- **Monday** unchanged except the **Flat Bench Press** alternating dumbbell ⇄ barbell weekly. 19 sets.
- **Wednesday** rebuilt: hack squat, incline bench (DB ⇄ bar), row (cable ⇄ machine), leg curl, shoulder press,
  **pec fly, cable lateral raise, face pull (⇄ reverse pec deck), calves, biceps curls, triceps pushdowns**
  (mergeable into a superset). Goblet squat, hip thrust, plank, cable crunch and dead bug removed. 29 sets.
- **Friday** leg press only, RDL (DB ⇄ bar), row (cable ⇄ machine), plus **calves, reverse pec deck and a
  farmer's carry**. 28 sets.
- **Total 76 sets/week** (was 61). Chest 12, quads 9, hams 8, side delts 8, calves 6, rear delts 5.
- **Pull-up ladder** in a collapsible panel at the bottom of every session — rebuilt with **no assisted
  machine**: dead hangs, scapular pull-ups, negatives (timed), bottom-half reps, band-assisted, then full reps.
- **Reflect after one week on it** — checklist in §5.

## 5. After one week: the reflection checklist

You said you'd come back to this after a week on the programme. Ask these:

1. **Did Wednesday and Friday fit your time?** 75–85 minutes as a pair was my estimate. If it's too long, the cut list is `WORKOUT.md §6`.
2. **Did the extras actually get done** — calves, rear delts, the carry? Honest answer matters more than a nice one; any exercise skipped twice should be swapped, not kept as guilt.
3. **Did the superset get used** on Wednesday, or do the arms work fine as separate exercises?
4. **Did the rotation feel right** — dumbbell ⇄ barbell weekly, or would you rather it was fixed per day?
5. **Are the big lifts going up?** Leg press, hack squat, RDL, bench. If yes, the plan is working; volume is not the problem.
6. **Anything niggly or painful?** That beats any list I can write.
7. **Do you want more of the same, or a change of stimulus?** Four to six weeks is the usual point to consider a change.

## 6. Platform limits — worth remembering before you ask for these again

- A web app **cannot** fire a notification at a time you choose. It can only be triggered by a server, which
  means a scheduled job plus push keys — and iPhone can still stay silent. Your phone's alarm or calendar
  does this job today.
- No Apple Watch, no Health/Fitness/steps/heart-rate, no lock-screen widgets, no background timers or sync.
- Install to the home screen **is** a real safeguard: iOS clears a Safari tab's storage after 7 days without a
  visit, but home-screen web apps are exempt. You're already installed.

## 7. Open questions

1. **What should happen to the reps already stored from the old code?** Every record logged before this change
   has invented reps in it — the old code wrote the top of the rep range (`10/10/10`) whether you typed anything
   or not. Nothing is being changed or deleted; the question is what the app should *show* for those old rows.
   Options: (a) leave them and show them as `3 sets recorded · 10 · 10 · 10`, which is what it does now;
   (b) hide old reps from rep-based figures and show weight only; (c) add a one-off "clean up old rep data"
   button in Settings that blanks them, after exporting a backup. **My recommendation: (c), once you're happy
   with the new logging.**
2. **Anything on the plan you want renamed?** Names are cheap now and annoying later.
3. **Machine Row's real name or brand?** I've used your description for now.

## 8. Build plan — the staged releases

| Release | Scope | Depends on the workout? |
|---|---|---|
| **1** ✅ | Reps model + invented-reps fix, undo, edit/delete, log-for-both, suspicious-weight guard, entry hardening | **Built and tested** |
| 2 ⏭ **next** | The plan as real data, the new workout, variants + automatic rotation, substitutes, muscle map, "machine taken?", plateau detection, time-short mode | Yes — and it's the release that puts the new programme on your phone |
| 3 | Splash, boot skeleton, manifest, icons, offline shell, install polish, no-zoom, safe areas | No |
| 4 | Progress & motivation: per-side/per-dumbbell handling, frequency heatmap, "on this day", milestones, PR wall, comparison, session summary, PB celebration, partner feed, share cards, achievements | Partly |
| 5 | Data safety (import/restore, snapshots, backup reminders), sync correctness, accessibility, bugs, glossary, help mode, settings search, themes | No |

## 9. How to pick this up

Say any version of: **"Read STATUS.md and start Release 1"** — or name a release, or a code from
`IMPROVEMENTS-3.md`. Everything you need is in the files above; no context needs re-explaining.

## 10. Guardrails I'm holding to (so they survive me, or anyone else, touching this)

- **Never rename an existing storage key** (`gym:settings`, `gym:log:*`, `session:*`). Renaming orphans data —
  it's the one change that would genuinely lose history.
- **Never rewrite an existing record.** New records get new fields; old ones stay byte-identical.
- **Never delete.** Deletions are tombstones that sync, so the other phone can't resurrect them.
- **Single file, no build step, no dependencies.** It's why the app is instant and can be edited by hand.
- **Any restore or import merges (newest wins) and never overwrites newer data.**

## 11. Release 1 — what actually changed in the app

For reference when you're testing it. All additive; no record was rewritten and no key was renamed.

| Change | Detail |
|---|---|
| **One reps box** | The log sheet asks for **Reps · last set**, one number, pre-filled from last time. Hidden if you never logged reps. Nothing is saved unless you type it (the old code saved a hidden `10/10/10` on every single log) |
| **Reps on the row** | The weight pill now reads `27 kg ×8`, and the PB line reads `PB 40 ×10 · 12 Oct` |
| **"log every set"** | The old three-stepper editor is still there, one tap away, and existing multi-set records open in that format |
| **Undo** | Every save, edit and delete shows **Undo** for 6.5 seconds. It restores the previous value *and* re-stamps it, so the undo travels to the other phone — and a record you created becomes a hidden tombstone rather than vanishing (otherwise sync would pull it back) |
| **Edit / delete** | Any past record: tap Progress → a lift → a session. Change weight, reps or the date, or delete it. Deleting leaves a hidden tombstone so it can't come back from the other phone, and undo reverses it |
| **Log for both** | A "who is this for?" choice when you're lifting the same thing. Each person gets the entry against *their own* exercise choice, both get ticked, and both are checked for a PB |
| **Typo guard** | More than double your PB (and 10 kg+ over) asks first, and nothing is written until you confirm |
| **Weight entry** | `27,5` now saves as 27.5 (it used to save 27), stray characters are handled, and a second decimal point can't corrupt the number |
| **Rejected nonsense** | The old "total reps" and "N sets logged" figures — which counted invented numbers — are replaced by **best set** (`85 ×10`) |
| **Untouched** | Bodyweight rows, the "which one today?" chips, ticks, the timer, Progress, history, export, sync, settings, onboarding |
