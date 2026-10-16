# The plan — final (v1)

**App still untouched.** `index.html` and `supabase.sql` unchanged (verified with git).
**On screen:** `preview/new-plan.html` — the whole plan rendered with the app's real styling.

---

## 1. Your questions, answered

| Question | Answer |
|---|---|
| **Monday — Flat Press: bar or dumbbells?** | **Both, alternating weekly.** Renamed **Flat Bench Press**. Dumbbell one week, barbell the next — the app offers whichever you didn't do last time. The row shows which variant is live and you can switch with one tap. |
| **Monday — RDL: bar or dumbbells?** | **Barbell.** It's unchanged — Monday's RDL has always been the barbell version. *Friday's* is the one that alternates. |
| **Monday — Lateral Raises: dumbbells or cable?** | **Dumbbells** on Monday. The cable version is now Wednesday (your "extra lateral raise, alternating dumbbell and cable"). Friday is dumbbells too. |
| **Wednesday — Incline Press: bar or dumbbells?** | **Both, alternating weekly.** Renamed **Incline Bench Press**. Dumbbell one week, barbell the next. |
| **Wednesday — the row** | Renamed exactly as you said: **Seated Cable Row or Machine Row**, alternating weekly. |
| **Wednesday — the superset** | Understood. Biceps and triceps are now **two separate exercises** — separate muscles, separate records, separate PBs. The app offers to **merge them into a superset** when you want it (2 taps), which saves ~6 minutes. Not merging is the default; nothing is combined unless you ask. |
| **Friday — pull-up help** | Understood. It's a **collapsible panel at the bottom of every session**, closed by default so it costs no screen space. It tracks your ladder and gives the next target. **And since you have no assisted pull-up machine, the ladder has been rebuilt without one** — bands, negatives and bottom-half work instead. See §4. |
| **Friday — RDL: dumbbell or bar?** | **Both, alternating weekly.** (It used to be dumbbell-only.) Your dumbbell and barbell numbers are kept completely separate — see §2. |
| **Friday — the row** | Same pair as Wednesday: **cable ⇄ machine**, alternating weekly, so each variant keeps one clean history. |

## 2. X93, as you asked: separate records, shared rotation

- Dumbbell and barbell versions of the same lift are **two completely separate records**: separate weights, separate PBs, separate history lines. Same for cable and machine rows, and for dumbbell and cable lateral raises.
- The only thing they share is the **rotation** ("which did I do last time?") and the **display name** ("RDL"), so you're never guessing which variant a number came from.
- That's deliberate: 32.5 kg dumbbells is a very different session from a 90 kg barbell RDL, and merging them would make your PB chart meaningless.
- Where an exercise works a muscle differently (a fly vs a press, a cable vs a dumbbell raise), it stays its own thing.

## 3. The plan

### MONDAY — *unchanged apart from the flat bench*

| # | Exercise | Sets × reps | Muscle | Variant |
|---|---|---|---|---|
| 1 | Leg Press | 3 × 8–10 | Quads | — |
| 2 | **Flat Bench Press** | 3 × 8–10 | Chest | **dumbbell ⇄ barbell, weekly** |
| 3 | Lat Pulldown | 3 × 8–12 | Lats | — |
| 4 | Romanian Deadlift | 3 × 8–10 | Hamstrings | **barbell** (unchanged) |
| 5 | Dumbbell Lateral Raises | 3 × 12–15 | Side delts | dumbbells |
| 6 | Cable Triceps Pushdown | 2 × 10–15 | Triceps | — |
| 7 | Dumbbell Biceps Curls | 2 × 10–15 | Biceps | — |

**19 sets · 60–75 min**

### WEDNESDAY — *rebuilt*

| # | Exercise | Sets × reps | Muscle | Variant |
|---|---|---|---|---|
| 1 | Hack Squat | 3 × 8–12 | Quads | goblet squat dropped |
| 2 | **Incline Bench Press** | 3 × 8–12 | Chest | **dumbbell ⇄ barbell, weekly** |
| 3 | **Seated Cable Row or Machine Row** | 3 × 8–12 | Mid back | **cable ⇄ machine, weekly** |
| 4 | Leg Curl | 2 × 10–15 | Hamstrings | — |
| 5 | Shoulder Press | 2 × 8–12 | Front delts | — |
| 6 | **Pec Fly** | 3 × 10–15 | Chest | new |
| 7 | **Cable Lateral Raise** | 3 × 12–15 | Side delts | new |
| 8 | **Face Pull** | 3 × 12–15 | Rear delts | new · alternates with Reverse Pec Deck |
| 9 | **Calf Raise** | 3 × 10–15 | Calves | new |
| 10 | Biceps Curls | 2 × 12–15 | Biceps | can merge with #11 as a superset |
| 11 | Triceps Pushdowns | 2 × 12–15 | Triceps | can merge with #10 as a superset |

**29 sets · 75–85 min as a pair**

**Removed:** Goblet Squat, Hip Thrust, Plank, Cable Crunch, Dead Bug — history kept forever.

### FRIDAY — *leg press only, plus the new work*

| # | Exercise | Sets × reps | Muscle | Variant |
|---|---|---|---|---|
| 1 | Leg Press | 3 × 10–12 | Quads | squat option dropped |
| 2 | Chest Press Machine | 3 × 8–12 | Chest | — |
| 3 | Lat Pulldown or Pull-up Practice | 3 × 8–12 | Lats | **weekly** · practice = your ladder level |
| 4 | **Romanian Deadlift** | 3 × 10–12 | Hamstrings | **dumbbell ⇄ barbell, weekly** |
| 5 | **Seated Cable Row or Machine Row** | 2 × 10–12 | Mid back | **cable ⇄ machine, weekly** |
| 6 | Dumbbell Lateral Raises | 2 × 12–15 | Side delts | dumbbells |
| 7 | **Calf Raise** | 3 × 10–15 | Calves | new · on the leg press |
| 8 | Biceps Curls | 2 × 12–15 | Biceps | — |
| 9 | Triceps Pushdowns | 2 × 12–15 | Triceps | — |
| 10 | **Reverse Pec Deck** | 2 × 12–15 | Rear delts | new · second weekly dose |
| 11 | **Farmer's Carry** | 3 × 30–40m | Core · grip · traps | new · 60–90s rest |

**28 sets · 75–85 min as a pair**

### Weekly volume

| Muscle | Sets/week | From |
|---|---|---|
| Chest | **12** | bench, incline, fly, chest press |
| Quads | 9 | leg press ×2, hack squat |
| Hamstrings | 8 | RDL ×2, leg curl |
| Side delts | **8** | raises on all three days |
| Lats | 6 | pulldown / pull-up practice ×2 |
| Biceps | 6 | curls ×3 (+2 indirect from rows) |
| Triceps | 6 | pushdowns ×3 (+2 indirect from presses) |
| Calves | **6** | new — previously zero |
| Mid back | 5 | row ×2 |
| Rear delts | **5** | new — face pull + reverse pec deck |
| Core · grip · traps | 3 | the carry |
| Front delts | 2 | shoulder press (+presses indirectly) |
| Glutes | ~6 | via RDL ×2 and leg press (indirect) |
| **Total** | **76** | 19 Mon · 29 Wed · 28 Fri |

Plan was 61 sets → now 76. The 9 sets of hip thrust / plank / crunch / dead bug went to chest, side delts,
rear delts and calves. Every muscle sits inside the standard 10–20 sets/week range once indirect work counts.

## 4. The pull-up ladder — no assisted machine needed

It lives in a **collapsible panel at the bottom of every session**, closed by default, so it never takes
screen space. Open it when you want to practise or log a set.

| # | Level | Target | Why |
|---|---|---|---|
| 1 | Dead hang | 3 × 20–30s | Grip, shoulder resilience, comfort in the bottom position |
| 2 | **Scapular pull-ups** | 3 × 5–8 | **The missing link.** Pull the shoulder blades down without bending the elbows — the first inch of a pull-up, and the part almost nobody trains |
| 3 | Negatives | 3 × 3 @ 5s | **Where you are now.** The app times the descent so you can't cheat it by dropping |
| 4 | Negatives | 3 × 5 @ 5s | Same, more volume. Hit it twice and the ladder moves you up |
| 5 | Bottom-half reps | 3 × 3 | Dead hang → 90° → lower. The exact range you said you're missing |
| 6 | Band-assisted pull-ups | 3 × 3–5 | Bands instead of a machine. Logged as a **band level** (heavy → medium → light), because bands can't be measured in kg |
| 7 | Full pull-up | 1 rep | Then 2, then 3, then 5 |

**Optional accessories, any session:** inverted rows 2 × 8–10 (the single best builder of a first pull-up) and
jump-to-top holds 3 × 10s.

**What the app does:** shows your current level and next target · times your hangs and negatives out loud ·
logs band work as a level · advances you automatically when you hit a target twice · keeps its own history so
you can see the ladder moving even on weeks when the weights don't.

## 5. Other recommendations

1. **Isolations always come last** — everything added sits after your big lifts, so nothing can rob your top sets.
2. **Progress them differently:** add reps first on the 12–15 exercises; add weight when you hit the top of the range on your last set for the compounds. The app will prompt the right one for each.
3. **Superset the arms on Wednesday when you're short on time** — saves ~6 minutes and costs nothing.
4. **Barbell bench needs a spotter or safeties.** You train together, so use them. Don't compare dumbbell and barbell numbers to each other — separate records for that reason.
5. **Glutes are the quiet loser** of these changes: hip thrust was their only direct work. RDL twice a week and the squats cover them decently, so it's a fair trade — just so you know it happened.
6. **The unglamorous half:** protein high, moderate deficit rather than a crash, 7–9 hours of sleep, 8–10k steps. The plan holds the muscle while that happens.

## 6. If sessions run long — the cut list

Wednesday and Friday are 75–85 minutes as a pair (you alternate, so rest is generous and wall-clock time is
longer). If that's too long, cut in this order:

1. **Superset the arms** on Wednesday (free — saves ~6 min).
2. **Trim the carry to 2 sets** (saves ~4 min).
3. **Drop the peck fly** (chest already gets 12 sets/week).
4. **Move Wednesday's arms to Friday** as a superset (saves ~8 min, keeps the work).

I would not cut the calves, the lateral raises or the rear delts — those are the three that change how you look.

## 7. Next

The plan is settled, subject to the three open questions in `STATUS.md §7`. Next step is **Release 1** —
the reps model and the invented-reps fix, undo, edit/delete, log-for-both — which doesn't depend on any of this.
