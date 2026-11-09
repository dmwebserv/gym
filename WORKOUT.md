# The plan — 3-Day Gym Plan (v5.1)

**Source:** `3_day_gym_plan_updated.pdf`, supplied as a screenshot. The app now follows its
exercises, set/rep ranges, suggested schedule, focus lines and rest guidance. It is built into
`index.html`; the other Markdown files in the repository are historical release notes.

**Suggested schedule:** Monday — Strength A · Wednesday — Hypertrophy · Friday — Strength B.

---

## 1. Day 1 — Strength A

**Heavy squat and bench press focus.**

| # | Exercise | Sets | Reps | Rest |
|---:|---|---:|---:|---|
| 1 | Barbell back squat | 3 | 4–6 | 2–4 min |
| 2 | Barbell bench press | 3 | 4–6 | 2–4 min |
| 3 | Chest-supported row | 3 | 5–8 | 2–3 min |
| 4 | Romanian deadlift | 2 | 6–8 | 2–3 min |
| 5 | Cable triceps pushdown | 2 | 10–15 | 60–90 sec |

**13 working sets.** Rest 2–4 min on squats and bench; 2–3 min on rows and Romanian deadlifts;
60–90 sec on pushdowns.

## 2. Day 2 — Hypertrophy

**Muscle growth with controlled reps and moderate loads.**

| # | Exercise | Sets | Reps | Rest |
|---:|---|---:|---:|---|
| 1 | Leg press | 3 | 8–12 | 1–2 min |
| 2 | Incline dumbbell bench press | 3 | 8–12 | 1–2 min |
| 3 | Lat pulldown | 3 | 8–12 | 1–2 min |
| 4 | Seated leg curl | 3 | 10–15 | 1–2 min |
| 5 | Dumbbell lateral raise | 3 | 12–20 | 1–2 min |
| 6 | Dumbbell biceps curl | 3 | 10–15 | 1–2 min |

**18 working sets.** Rest 1–2 min on most exercises; up to 3 min if needed to maintain
performance. Curls and lateral raises can be supersetted — the app links the two rows and opens
the second logging sheet after the first is saved.

## 3. Day 3 — Strength B

**Deadlift and overhead press focus.**

| # | Exercise | Sets | Reps | Rest |
|---:|---|---:|---:|---|
| 1 | Conventional deadlift | 3 | 3–5 | 3–4 min |
| 2 | Standing overhead press | 3 | 4–6 | 2–3 min |
| 3 | Pull-ups or weighted pull-ups | 3 | 5–8 | 2–3 min |
| 4 | Leg extensions | 2 | 8–12 | 60–120 sec |
| 5 | Hammer curls | 2 | 8–12 | 60–120 sec |

**13 working sets.** Rest 3–4 min on deadlifts; 2–3 min on overhead press and pull-ups;
60–120 sec on leg extensions and hammer curls. The row offers bodyweight pull-ups or weighted
pull-ups. Bodyweight is tick-only; the weighted variant uses the normal weight-and-reps sheet.

**Total:** 44 working sets per week.

---

## 4. How to progress

- **Progressive overload:** when you reach the top of the rep range for every set with good
  technique, increase the weight slightly and build the reps back up.
- **Effort:** finish most working sets with about 1–3 good reps left in reserve. Avoid failed reps
  on heavy squats and deadlifts.

These two points are the only progression guidance in the main session, in one collapsed
**How to progress** panel. The old warm-up, finisher and four generic reference guides were
removed because they were not part of the supplied plan.

---

## 5. Logging, PBs and historical data

No stored record is rewritten, renamed or deleted by the plan change.

Movements that already existed reuse their canonical id, so their current PB, last weight and
last-set reps appear on the new row: back squat, barbell bench press, Romanian deadlift,
triceps pushdown, leg press, incline dumbbell press, lat pulldown, seated leg curl, dumbbell
lateral raise, dumbbell biceps curl, standing overhead press and leg extensions.

A few older generic records are also read without being changed: `flat-bench` contributes to the
barbell bench row and `incline-bench` contributes to the incline dumbbell press row. This is a
read-only alias; new saves use the current canonical id.

New movements get their own id and are logged through the same single write path, with weight,
last-set reps, ticks, PBs, undo, sync and Progress history:

- `chest-supported-row` — Chest-Supported Row
- `deadlift` — Conventional Deadlift
- `weighted-pullup` — Weighted Pull-ups
- `hammer-curl` — Hammer Curls

Retired movements such as hip thrust, plank, cable crunch, dead bug, calf raise, face pull and
the old carry remain in Progress, PBs, CSV exports and backups. The pull-up ladder also remains
on every session, collapsed by default.

---

## 6. Timer and app changes

The Timer presets follow the PDF's rest periods:

| Preset | Duration | Used for |
|---|---:|---|
| Heavy | 3:30 | Deadlifts |
| Strength | 2:30 | Squats, presses, rows, RDL and pull-ups |
| Pump | 1:30 | Hypertrophy work |
| Short | 1:15 | Short accessory rests |

Other changes:

- iOS now uses an opaque, reserved status bar (`black`) plus an explicit `env(safe-area-inset-top)`
  body gap, so the app's top controls no longer sit behind the Dynamic Island on an iPhone 16.
- The app-like zoom restriction (`maximum-scale=1, user-scalable=no`) is intentionally retained.
- Top controls and day tabs have 44 px minimum touch targets.
- Exercise rows now show only the muscle, live variant, exact rest guidance and the weight/PB
  controls. The `1/3`-style muscle badges, "also works..." labels, repeated footer instructions,
  long Settings release notes and generic reference essays were removed.
- One short "Tap a row to log" hint remains. Optional tools, the pull-up ladder, search, plate
  calculator, short-on-time trimming and rearranging all remain available.
- The service-worker cache version was bumped so installed phones adopt the new shell on their
  next launch with signal.
