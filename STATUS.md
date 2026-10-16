# STATUS — where we are

**Read this first when you come back to this project.** It's the single-page version of everything:
what's decided, what's built, what's next, and where the detail lives.

Last updated: **16 October 2026**.

---

## 1. In one paragraph

You asked me to review the app, then to make a long list of possible improvements. Both are done and the
**workout has been reworked and agreed**. **Nothing in the app itself has been changed yet** — `index.html`
and `supabase.sql` are untouched, so the app on your phones is exactly as it was and **no data has been lost,
changed or migrated**. The next step is building Release 1.

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
| `index.html` | **The app. Unchanged.** |
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

1. **Do you have resistance bands?** The ladder works without them, but band-assisted is the level that bridges
   you to your first full rep. A set costs about £10.
2. **Is there a Smith machine or a rack you can set a bar low in?** That's what inverted rows need — the single
   best builder of a first pull-up.
3. **Which machine is the "Machine Row" exactly?** I've used the name from your description (plate-loaded,
   chest-supported, upright, single-arm capable). Tell me the real name or brand and I'll use it.
4. **Anything on the plan you want renamed?** Names are cheap to change now and slightly annoying to change later.

## 8. Build plan — the staged releases

| Release | Scope | Depends on the workout? |
|---|---|---|
| **1** | Reps model + invented-reps fix, undo, edit/delete, log-for-both, suspicious-weight guard, entry hardening | **No** — can start immediately |
| 2 | The plan as real data, variants + rotation, substitutes, muscle map, "machine taken?", plateau detection, time-short mode | Yes |
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
