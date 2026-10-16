# Selected — the check-list

**App unchanged so far.** `index.html` and `supabase.sql` are untouched (verified with git). This is
your selection written back to you in plain English so you can double-check it before I build.

**62 items picked from the X list, plus 8 items you'd already agreed in the previous round** (those
don't have X numbers, so they'd otherwise fall through the cracks — section 3).

Anything I'd flag on is marked **⚑** — a limitation, a recommendation, or a slight change of shape.

---

## 1. Startup, install and look (11 + 4)

| Code | What it is | What it does for you |
|---|---|---|
| **X1** | Splash screen | A branded boot screen — icon, day accent, "Session" — instead of an empty dark page |
| **X2** | iOS launch image | The *phone* shows the same look when launching, not a white flash |
| **X3** | Boot skeleton | Shows the shell with "loading your log" so the layout never jumps |
| **X4** | Fade-in | First paint waits for your data, then fades the session in — no flicker |
| **X5** | Web app manifest | The installed app is identified properly on both platforms |
| **X6** | Full icon set | 192/512 + maskable icons — Android currently rescales your single 180px icon |
| **X7** | App shortcuts | ⚑ Long-press the icon → Today / Timer / Progress. **Android only** — iOS doesn't support PWA shortcuts. No harm including it |
| **X8** | Offline app shell | Caches the app file and fonts, so it opens instantly with no signal |
| **X9** | Update flow | New versions download quietly and apply on your *next* launch, never mid-session |
| **X10** | Offline indicator | "Offline — saved here, will sync later" so no signal never looks like a broken app |
| **X11** | Storage protection | ⚑ **Yes, do it.** Asks the browser to protect your data and shows whether it's protected. Not a guarantee — the real protection is you being installed + backups |
| **X13** | Accent status bar | ⚑ **Yes, it looks like an app.** Matches the phone's top bar to the app's colour. On iPhone the strip is drawn by the app itself, so I'd match it to the background and reserve the accent for the splash/skeleton — that's what reads as "native" |
| **X16** | Safe-area audit | ⚑ **Necessary.** Once it's standalone and full-screen, the notch and home-bar padding has to be exactly right or the tab bar sits under the home indicator |
| **X17** | No zoom at all | ⚑ Set as you asked. It works properly in an installed app; in a Safari *tab* iOS deliberately ignores it (can't be beaten — it's an accessibility rule). You're on the home screen, so you get what you want |
| **X20** | Open-in-app links | ⚑ Shared links open inside the installed app on **Android**. On iPhone, a shared link always opens in Safari — Apple doesn't allow it for web apps. If the real goal is sharing a session or PB, that's X170/X200 (already picked) |

## 2. Logging (12)

| Code | What it is | What it does for you |
|---|---|---|
| **X23** | Swipe between days | Swipe MON ↔ WED ↔ FRI instead of tapping |
| **X25** | Long-press a pill | Logs last time's weight *and* reps instantly — tick + toast, no sheet at all |
| **X29** | Drag to reorder | Reorder today's session when a machine is busy (today only, doesn't edit your plan) |
| **X30** | "Do it later" | Sends a row to the bottom of today's list in one tap |
| **X32** | Haptics + click | A buzz and a tick on every log/tick, so you can log without looking. Toggleable |
| **X33** | Weight entry hardening | Comma decimals (currently `27,5` silently saves **27**), stray characters, ±, hold to accelerate |
| **X35** | Number keyboard handling | "Next" moves between fields; the sheet remembers whether you type or tap chips |
| **X38** | Last 3 sessions in the sheet | ⚑ **Recommended, it's cheap.** Shows the last three weights with dates, so you decide the next weight without leaving the sheet |
| **X41** | Photo note | ⚑ Snap the seat/pin/bar setting once and see it next time. Photos stay on your phone, compressed, and don't go to the sync room |
| **X46** | Supersets | ⚑ **Yes, opt-in per pair.** Switch on for a bicep/tricep superset when you want it; the app alternates the two and logs both from one screen. Off by default |
| **X50** | Search the logs | Find any exercise, note or session across your whole history |
| **X58** | Suspicious-weight guard | "More than double your PB — sure?" before saving. Prevents the one mistake that permanently distorts a chart |

## 3. Programme control (13)

| Code | What it is | What it does for you |
|---|---|---|
| **X62** | Substitutes | Pre-agreed alternatives per exercise, feeding the "machine taken?" flow |
| **X63** | Muscle map | Which muscles each exercise hits. Powers the `1/3` badges, sensible swaps and everything else |
| **X69** | Plateau detection | "Leg press hasn't moved in 6 weeks" plus a suggested change |
| **X79** | Time-short mode | "I've got 40 minutes" → the app trims to your priority lifts and tells you what it dropped |
| **X87** | Exercise rotation | ⚑ **This is now the backbone of your plan** — the DB/bar and cable/machine alternations. See the workout section: I'd do it as "offer whichever you didn't do last time" rather than week A/week B |
| **X89** | ⚑ Reshaped | You asked for a good-looking shareable image card rather than a printout — so this merges with X170 and X200 into **one share-card system** (plan, session, PB, week, month). I'll show you the design before it ships |
| **X94** | Per-side / per-dumbbell | `2 × 8–10 ea` and "per hand" become real properties, so every number means one unambiguous thing |
| **X108** | Frequency heatmap | A 12-week grid showing when each muscle was worked — patterns you can't see week to week |
| **X118** | "On this day" | What you lifted a month, six months, a year ago today |
| **X119** | Milestone timeline | First 100 kg, 50th session, first 3-for-3 week — dated |
| **X120** | PR wall | Every PB on one screen, sortable |
| **X123** | Two-person comparison | You vs Kieran, per lift |

## 4. Gym logistics (3)

| Code | What it is | What it does for you |
|---|---|---|
| **X144** | Plate calculator | What to load per side for a target weight with your plates |
| **X150** | "Machine taken?" | Your approved flow: alternatives for that exercise, plus "do it later" and "skip today" |
| **X153** | Session reminder | ⚑ **Hours before can't come from the app** — a web app can't alert you while it's closed. **The reliable fix: an "Add training days to my calendar" button** that creates Mon/Wed/Fri events with a reminder a few hours ahead. Your phone does the reminding, works offline, no server. I've added it as **X226** |

## 5. Progress, motivation and the two of you (11)

| Code | What it is | What it does for you |
|---|---|---|
| **X157** | Session complete moment | A real end-of-session summary: what you lifted, best sets, PBs, vs last time |
| **X158** | PB celebration | A quick animation and a sound when you beat a PB |
| **X163** | Partner feed | "Kieran logged leg press 45 → 50" from data already syncing |
| **X168** | You vs last month | This month's best sets against last month's, per lift |
| **X169** | Achievements wall | Gentle milestones, not childish badges — I'll keep the tone dry |
| **X170** | Weekly recap card | Shareable image of your week |
| **X172** | Year in review | Sessions, PBs, best month |
| **X174** | Milestone nudges | "Nine sessions to 100" |
| **X178** | Optional leaderboard | ⚑ Opt-in and sortable, so it stays fun rather than causing friction |
| **X183** | Partner PBs on your rows | `K 40 kg` next to the exercise |
| **X184** | Anniversary memory | "One year since you started logging" |

## 6. Data, settings and polish (11)

| Code | What it is | What it does for you |
|---|---|---|
| **X200** | Share cards | Session / PB / month rendered as a good-looking image. Merged with X89 + X170 |
| **X203** | Schema versioning | A version stamp and conversion path — the structural guarantee that nothing you've logged ever becomes unreadable by a future version |
| **X207** | Settings search | Find an option once there are 20 of them |
| **X208** | Plain-English descriptions | Every setting explained in one honest sentence |
| **X209** | Glossary / legend | What `1/3` means, what PB means, what the colours mean, what "compound" means. The app currently explains none of its own symbols |
| **X211** | Help mode | Tap "?" then tap anything on screen to have it explained |
| **X212** | What's new | Short changelog after each update |
| **X216** | Sound + haptics toggles | Because a beeping app in a quiet gym is its own problem |
| **X217** | Theme options | Dark / light / high-contrast |

---

## 7. Already agreed in the previous round (still in the plan)

These had no X numbers, so here they are — tell me if any should drop out:

| From | Item |
|---|---|
| Round 2 §1.0 | **Reps model**: last set only, one number — plus the fix for the app inventing reps (it currently saves 10/10/10 on every lift) |
| Round 2 §1.1 | **Undo** on every save — restores the previous value, not just "delete" |
| Round 2 §1.2 | **Edit and delete** any past record (typo'd 200 kg is currently permanent forever) |
| Round 2 §1.5 | **Log for both** when you lift the same weights |
| Round 2 §1.6 | **Data safety** — import/restore, monthly snapshots, backup reminders |
| Round 2 §1.7 | **Sync correctness** — the fake "Connected ✦", the wrong-PIN-then-retries-forever bug, and only sending what changed |
| Round 1 §A | **Accessibility & polish** — screen-reader noise, contrast, tap targets, styled confirmations |
| Round 1 §B | **Bugs** — all 13 found while reading (including ticks not clearing at midnight and post-midnight sessions filed under the wrong day) |

## 8. Three things I'd add (your call)

| Code | Why |
|---|---|
| **X59** — restructure the plan as real data | ⚑ **Effectively required for what you've now asked for.** The DB/bar and cable/machine alternations, substitutes, the muscle map and the badges all need exercises to carry proper fields instead of `"3 × 8–10"` as a string. It changes no logged history |
| **X93** — one lift, several variants | ⚑ **Required for the alternations to be any good.** With rotation you'll have "Flat Press — DB" and "Flat Press — barbell" as two separate lines. X93 groups them as one lift family: you see one combined trend, but the two load lines stay separate (otherwise your PB graph would jump up and down for meaningless reasons) |
| **X187** — import / restore from backup | ⚑ You can export a backup today but there's **no way to load one back in**. It's the only real hole in "we'll never lose it". Also, X203 (which you picked) is the foundation for it |
| **X226** — calendar reminders | The reliable version of X153: add your training days to your phone's calendar with a reminder hours before. No server, works while the app is closed |

## 9. How I'd ship it (so it doesn't arrive all at once)

1. **Release 1 — the core loop:** reps model + invented-reps fix, undo, edit/delete, log for both, the suspicious-weight guard, weight entry hardening.
2. **Release 2 — the plan:** X59 + X93 + X62 + X63 + X87 (the alternations), the replaced Wednesday work, X150 (machine taken?), X69, X79.
3. **Release 3 — it looks like an app:** X1–X13, X16, X17, the offline shell, install polish.
4. **Release 4 — progress and the two of you:** X94, X108, X118–X123, X157–X184, X200.
5. **Release 5 — housekeeping:** X203, X207–X217, accessibility, bugs, sync correctness, data safety.

Same app, same file, nothing lost between releases — data is only ever added to.

---
---

# Part 2 — the workout

You said: keep it, tweak it, here's what we do. Below is what I've understood, what I'd suggest
filling the gaps with, and three honest notes. **Nothing here is built yet** — confirm first.

## 10. What I've understood you want

**Monday — unchanged except:**
- Flat press alternates weekly: **dumbbell one week, barbell the next**.
- Hack squat only, no goblet.
  ⚑ *One flag: the goblet/hack choice is **Wednesday's** squat slot — Monday has no goblet squat
  (it's leg press and RDL). I've assumed you mean Wednesday. Tell me if you also want Monday changed.*

**Wednesday:**
- **Hack squat** only (goblet squat gone).
- Incline press alternates: **dumbbell one week, bar the next**.
- Row alternates: **seated cable row one week, the machine version the next**.
- **Removed:** hip thrust, plank, cable crunch, dead bug.
- Left as-is: shoulder press, leg curl.

**Friday:**
- **Leg press** only (the squat option goes).
- RDL alternates: **dumbbell one week, barbell the next**.
- Row alternates, same as Wednesday.
- Left as-is: chest press machine, lat pulldown / assisted pull-up, lateral raises, biceps, triceps.

**Reassurance on data:** removing an exercise from the plan **never deletes anything you've logged**.
Every goblet squat, hip thrust, plank and dead bug you've recorded stays in Progress and in your
backups forever — it just stops being a row on the session screen. (One small knock-on: those lifts
would lose their muscle label in Progress since they're no longer in the plan. X63 fixes that.)

## 11. What that leaves, by volume

| Day | Before | After your changes |
|---|---|---|
| Monday | 7 exercises · 19 sets | 7 exercises · 19 sets (unchanged) |
| Wednesday | 9 exercises · 22 sets | **5 exercises · 14 sets** |
| Friday | 8 exercises · 20 sets | 8 exercises · 20 sets |
| **Week** | 24 exercises · 61 sets | 20 exercises · **53 sets** |

Wednesday becomes a short day, and the week loses all direct core work. That's the honest picture
before I suggest anything.

## 12. What I'd slot into Wednesday (you asked)

Pick 3–4 of these. Each one is chosen to fill a *gap* in the plan, not to pad the day:

| Suggestion | Sets | Why |
|---|---|---|
| **Lateral raises** | 3 × 12–15 | Side delts are the **lowest-volume muscle in your whole plan** (5 sets/week). Shoulder width is one of the most visible results going, and they cost almost nothing in fatigue |
| **Calves** (leg press calf raise, or seated calf machine) | 3 × 10–15 | The plan currently has **zero** direct calf work — anywhere. If muscle gain is the goal, it's the cheapest uncounted gap |
| **Face pulls or reverse pec deck** | 2–3 × 12–15 | You have almost no direct rear-delt work. Standard shoulder-balance and posture addition, and it services the "stability" part of your goal. Three minutes on a cable |
| **Farmer's carry** or **Pallof press** | 3 × 30–40m / 3 × 10 ea | You've just removed all core work. Carries give core, grip and traps in one movement and don't feel like a plank. If you truly won't do it, skip — but stability was one of your three goals |
| **One single-leg movement** (Bulgarian split squat or single-leg RDL) | 2–3 | The best "stability + muscle" per minute: quads, glutes and hamstrings in one go |
| **Your bicep/tricep superset** (X46) | 2 rounds | Wednesday currently has no direct arm work at all, so it's the natural home for the superset you already do |

With three of those, Wednesday is back to ~22 sets and the same length as now — just built from
exercises you actually do.

## 13. Friday — what I'd keep and what I'd watch

- **Keep lat pulldown + a row** — one vertical pull, one horizontal pull. That's the right
  structure.
- **Calves** fit naturally here too, since you're already on the leg press (same machine, no extra
  setup). One of Wednesday or Friday is enough.
- **Row alternation:** Wednesday's "Seated Cable Row" and Friday's "Cable Row" are already the *same
  exercise* in the app — they share one history and one PB. So whatever pair you choose, use the same
  pair on both days: one clean rotation, one clean history line.
- **RDL:** the barbell version will load much heavier than the dumbbell version, and they aren't
  comparable numbers. That's exactly what X93 solves (one "RDL" lift family, two separate load lines).
- Friday, like Wednesday, has no calf, rear delt or core work — so whichever you add on one day
  covers the week.

## 14. Three honest notes on your goals

**Muscle gain** — your structure is well suited to it: three full-body days, 2–3 sets per exercise,
8–15 reps, all the big patterns covered. The levers that actually move it are progressive overload
(which the app will now record accurately), total weekly sets (you're at 53–60, a good place for
three days), protein and calories, and sleep. Adding *more* exercises isn't automatically better;
the suggestions above are gaps, not padding.

**Strength and stability** — strength will follow the compounds you've kept (leg press, hack squat,
RDL, presses, rows). Stability is the genuine trade-off of dropping hip thrust, plank and dead bug:
that work came from single-leg movements and core bracing. If stability matters, keep **one** of
those — a single-leg movement or a carry — and you've kept the benefit without keeping the exercises
you don't enjoy.

**Fat loss** — you're right that diet does the heavy lifting; the plan's job is to hold on to muscle
while that happens, and it does. The app can log a weekly weigh-in with a trend line (X96/X97 in the
list if you want them) so you're not judging progress by day-to-day noise.

**And one caveat, in the same spirit as the app's own footer:** these are standard, mainstream
suggestions for a healthy adult, not personalised coaching. If something hurts, that beats any list
I can write.

## 15. What the app needs for your alternations

- **Rotation, the smart way:** instead of tracking "week A / week B", the app offers **whichever
  variant you didn't do last time** — per person, needing no calendar, surviving holidays and skipped
  weeks, always overridable if you fancy the other one. This is X87.
- **X59** to hold the variants, substitutes and muscles as proper data.
- **X93** so DB/bar and cable/machine stay one lift with two load lines, not two unrelated lifts.
- This is also why the `1/3` badges won't need your input any more: with the muscle map (X63), the app
  can count how many times each muscle actually appears in the week, and stay correct as the plan
  changes.

## 16. Three questions, then I can start

1. **Confirm the goblet squat is Wednesday's** (Monday has no goblet squat in the current plan).
2. **Which machine is your "non-cable row"?** Seated row machine, chest-supported row, Hammer
   Strength? I need the real name for the substitute list and the rotation.
3. **Rotation automatic or manual?** I'd build automatic-with-override (offer the variant you didn't
   do last). The alternative is a prompt at the start of each exercise — more taps, no surprises.

And a fourth, only if you want it: **any preference between lateral raises, calves, face pulls and a
carry for that Wednesday slot?** If you'd rather, I'll pick three and you can veto after seeing them
on screen.
