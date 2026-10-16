# Round 3 — the long list

**Nothing in the app has been changed.** `index.html` and `supabase.sql` are untouched — verified
with git. This document is only ideas for you to pick from.

**How to reply:** tick the codes you want (`X12, X44, X150`), or say "all of section 4", or point at
a starter bundle. Nothing gets built until you say so, and then we do **the workouts** after.

**Standing rules (your condition):** every item below is additive. Nothing deletes, rewrites or
reinterprets data you already have, and nothing removes a feature you already use. Where an item
extends something from round 1 or 2, I've noted it (`→ L5`) so you're not reading the same idea twice.

**Where the earlier rounds are:** `IMPROVEMENTS.md` = round 1 (76 ideas + 11 bugs).
`IMPROVEMENTS-2.md` = round 2 (answers, specs, 58 ideas + 2 bugs).

**Parked until the workout review, as you asked:** the `1/3` badge (staying exactly as it is — the
count of times that exercise appears for that muscle), per-muscle volume, the "machine taken?" flow,
substitutes, and anything that depends on which exercises are in the plan.

**Effort tags:** `quick` = under an hour, `medium` = a few hours, `big` = a day or more.

---

## 1. Startup, install and platform (X1–X20)

You asked about the loading screen — that's X1–X4, and it's the cheapest polish in this document.

- **X1 — Splash screen.** A branded boot screen (your icon, the day accent, "Session") instead of an
  empty dark page while your log loads. `quick`
- **X2 — iOS launch image.** An `apple-touch-startup-image` so the *operating system* shows the same
  look when launching from the home screen, not a white or black flash. (iOS support for these is
  patchy across versions, so X1 does the real work and this is the cherry on top.) `quick`
- **X3 — Boot skeleton.** Show the shell — person switcher, tab bar, "loading your log" — so it never
  looks broken on a slow connection, and the layout doesn't jump when the data arrives. `quick`
- **X4 — Fade in, no flash.** First paint waits for data, then fades the session in. Removes the
  half-second of empty rows. `quick`
- **X5 — Web app manifest.** Proper name/short name/colours/standalone mode, so the installed app is
  identified correctly on both platforms and Android installs cleanly. `quick`
- **X6 — Full icon set.** 192, 512, maskable and the 180 you have — Android currently scales one
  180px icon, which bites on some launchers. `quick`
- **X7 — App shortcuts.** Long-press the home-screen icon → "Today's session", "Timer", "Progress".
  Full support on Android, partial on iOS. `quick`
- **X8 — Offline app shell.** A service worker caching the app file, icon and fonts so it opens
  instantly with no signal. Already flagged as the single biggest reliability win (`O1`). `medium`
- **X9 — Update flow.** Version stamp, silent background download, apply on next launch, never
  mid-session. `quick`
- **X10 — Offline indicator.** A small dot saying "offline — everything is saved here, will sync
  later", so a dead signal never looks like a dead app. `quick`
- **X11 — Storage protection.** Ask the browser to protect your data (`navigator.storage.persist()`)
  and *show* whether it's protected — no more guessing. `quick`
- **X12 — Install nudge.** A one-off, dismissible hint for anyone not yet on the home screen,
  including the real reason: installed web apps are exempt from iOS's 7-day storage clearing. `quick`
- **X13 — Accent status bar.** Theme colour follows the current day's accent, so the top of the phone
  matches the app. `quick`
- **X14 — Tablet and landscape layout.** Two columns on wide screens, and a large-face timer when the
  phone is on its side on a bench. `medium`
- **X15 — Desktop niceties.** Hover states, focus rings, keyboard shortcuts (1/2/3 for days, T for
  timer, / to search). Useful when you're updating the plan on a laptop. `quick`
- **X16 — Safe-area audit.** Verify the notch and home-bar padding with the new splash and skeleton —
  currently body padding only, so the fixed tab bar and status bar deserve a check. `quick`
- **X17 — Zoom policy.** Block accidental double-tap zoom while logging, but *allow* pinch-zoom for
  reading — the current setting blocks it entirely (`A3`). `quick`
- **X18 — Keep the single file.** An explicit commitment: no npm, no bundler, no framework. It's why
  the app is instant and hand-editable, and it becomes harder to protect as features are added. `—`
- **X19 — Version and build date** visible in Settings → About, so you always know what's on the
  phone. `quick`
- **X20 — Open-in-app links.** Share a session or PB as a link that opens the app (Android share
  target; iOS handles it less well). `medium`

## 2. Logging: the bit you touch 20 times a session (X21–X58)

- **X21 — Focus mode.** One exercise at a time, huge numbers, a single Next button — for people who
  don't want the whole session on screen. Optional, alongside the current view. `medium`
- **X22 — Guided session.** The app walks you through set by set, starts the rest timer by itself,
  and prompts the next exercise. The full "hands-free between sets" version of X21. `big`
- **X23 — Swipe between days.** Swipe left/right to move MON ↔ WED ↔ FRI instead of tapping. `quick`
- **X24 — Swipe a row.** Left to tick, right to open the log sheet — or the other way round if you
  prefer. `quick`
- **X25 — Long-press a pill to log last time's numbers instantly**, no sheet at all: tick + toast.
  The fastest possible path on a day when nothing changed. `quick`
- **X26 — Long-press menu.** A small context menu on any row: log, edit, note, move later, swap,
  clear. `medium`
- **X27 — Undo stack.** Several steps back, not just the last action — including edits, deletes and
  "log for both". `medium`
- **X28 — Multi-select.** Select several rows and act once: clear them, log them for both, move them
  to the end. `medium`
- **X29 — Drag to reorder today's session.** Reorder on the fly when a machine is busy — a
  one-session reorder, never saved over your plan unless you ask. `medium`
- **X30 — "Do it later".** Send a row to the bottom of today's list in one tap. (Often the real fix
  when a machine is taken, and better than a swap.) `quick`
- **X31 — Tick from the row.** A single tap on the exercise number ticks it off without opening the
  sheet; tap the name/pill to log properly. `quick`
- **X32 — Feel.** A short haptic buzz (Android) and a subtle click (both) on every log and tick, so
  you can log without looking. Toggleable. `quick`
- **X33 — Weight entry hardening.** Comma decimals, stray characters, ±, and holding a stepper to
  accelerate. (Extends `L2`.) `quick`
- **X34 — Autofocus the weight box** with the value selected when the sheet opens, so replacing 27
  with 30 is one tap and a number. (Extends `L1`.) `quick`
- **X35 — Better number keyboard handling.** "Next" moves between fields, and the sheet remembers
  whether you're a "type it" or "tap chips" person. `quick`
- **X36 — Exercise-aware chips.** The quick chips match the increments the actual machine or dumbbell
  rack offers, per exercise. (Extends `L8`, `N17`.) `quick`
- **X37 — Explicit "same as last time" button.** One tap logs last session's weight *and* reps.
  (Extends `N14`.) `quick`
- **X38 — Last three sessions in the sheet.** Not one line — a short list with dates, so you can see
  whether you're actually progressing while you decide the next weight. (Extends `L5`.) `quick`
- **X39 — A mini chart in the sheet.** Same three sessions, as a line. ~40 lines of code. `quick`
- **X40 — Two kinds of note.** A **setup note** that persists forever ("seat 4, pin 6") and a
  **session note** for today only ("knee felt odd"). (Extends `L9`, `N18`, `N19`.) `quick`
- **X41 — Photo note.** Snap the machine's seat/pin setting once; it shows next time. Stored on your
  phone only, and compressed, so it doesn't bloat the sync room. `medium`
- **X42 — RIR chips.** "Easy / About right / Tough", or 1–3 reps in reserve, recorded per lift — this
  is the input that makes the next-weight suggestion genuinely smart (`R7`). `medium`
- **X43 — Tempo logging.** Optional 3-1-1 style tempo per set, for when slow-eccentric work is
  prescribed. `medium`
- **X44 — Warm-up set logging.** Record warm-up sets without them counting as working sets (so your
  ticks, volume and PBs stay honest). `medium`
- **X45 — Drop-set and back-off markers.** Flag a set as a drop or back-off so the data reflects what
  actually happened. `medium`
- **X46 — Superset pairing.** Pair two exercises, alternate them, and log both from one screen. Only
  worth it if you actually train that way — your plan trains you two alternately, so this is a
  genuine "do you want it?" `medium`
- **X47 — AMRAP / to-failure marker.** For the last set when you deliberately push past the target
  reps. `medium`
- **X48 — Rest-pause / cluster marking.** For advanced structures, so those days don't look like
  normal sessions in the stats. `medium`
- **X49 — Freestyle session.** Log any exercise that isn't in the plan (something new, a class, a
  gym while travelling), with "save as template" if you want to keep it. `medium`
- **X50 — Search.** Find any exercise, note or session across your whole history. `medium`
- **X51 — Favourites and pins.** Pin the lifts you care about to the top of the Progress tab. `quick`
- **X52 — Recently used.** The last few exercises you logged, for freestyle sessions. `quick`
- **X53 — Templates.** Save a modified session ("Friday, no leg press, extra rows") and reuse it. `medium`
- **X54 — Repeat a session.** "Do last Monday again" — same exercises, same weights pre-filled. `medium`
- **X55 — Bulk entry grid.** A power-user screen: type a whole session's weights in one go, then save
  once. Good for catching up after forgetting to log during the session. `big`
- **X56 — Per-change offline queue.** Show precisely what's waiting to sync, and let you retry or
  discard a specific change. `medium`
- **X57 — Double-log guard.** Idempotent saves, so a double-tap or a resumed session can't create two
  records for the same lift and day. `quick`
- **X58 — Suspicious-weight guard.** "That's more than double your PB — sure?" before saving. The one
  mistake that permanently distorts a chart. (Extends `N13`.) `quick`

## 3. The programme: plan data, coaching and flexibility (X59–X95)

Everything here is about making the plan something the app understands, rather than text on a screen.
This is where your workout review lands.

- **X59 — Restructure the plan as real data.** Today an exercise is one line with things like
  `"3 × 8–10"` as a string. Turn it into proper fields — sets, rep range, muscles (primary and
  secondary), rest type, per-dumbbell flag, per-side flag, substitutes. This is the foundation for
  the badge staying sensible, volume, swaps and progression. **It changes no logged history.** `medium`
- **X60 — In-app plan editor.** Add, edit, move, delete exercises and days, and define substitutes —
  yourself, in Settings, no code changes. Needs one decision: whether plan edits sync between phones
  (`Y4`). `big`
- **X61 — Plan version history.** Every plan change dated, so an old session can be shown against the
  plan you were actually following (and a change can be undone). `medium`
- **X62 — Substitutes per exercise.** Your pre-agreed alternatives, feeding the "machine taken?" flow
  you approved. `medium`
- **X63 — Muscle map.** Which muscles each exercise hits, primary and secondary. Powers the badges,
  volume panels, balance checks and sensible swaps. `medium`
- **X64 — Auto-progression suggestion.** Uses your own plan's rule (top of the range on your last set
  with reps in reserve → smallest increment). (Extends `R7`.) `medium`
- **X65 — Progression modes.** Off / suggest / pre-fill the suggested weight. You choose how much the
  app nudges. `quick`
- **X66 — Double progression.** Add reps first, then weight — the right model for your 8–12 and 12–15
  ranges. `medium`
- **X67 — Increment awareness.** 2 kg dumbbells, 2.5 kg plates, 5 kg leg-press pin — the suggestion
  is always a weight the kit can actually make. `quick`
- **X68 — Deload weeks.** Auto-suggest every 6–8 weeks, tag the week so stats and streaks treat it
  fairly, and mark it in history. `medium`
- **X69 — Plateau detection.** "Leg press hasn't moved in 6 weeks" plus a suggested change (add reps,
  rotate the variant, check the setup). `medium`
- **X70 — 1RM test mode.** A guided ramp-up with generous rests, logged as a special session that
  doesn't distort your normal charts. `medium`
- **X71 — Failed PB attempts.** Mark a set as an attempt that failed, so it's recorded without
  becoming a fake PB. `medium`
- **X72 — Warm-up generator.** For your working weight, show the ramp-up sets (empty bar, 50%, 70%).
  Directly useful for the RDL and leg press. `quick`
- **X73 — Cool-down and mobility routine.** Your reference section already describes what to do;
  make it a tickable, timed part of the session. `medium`
- **X74 — Editable warm-up/finisher content** per day, instead of it being fixed text. `quick`
- **X75 — Exercise instructions.** How to set up and perform each lift, with the cues that matter, in
  the app. Content work more than code. `medium`
- **X76 — Fit-for-purpose alternatives.** Every exercise has 2–3 realistic alternatives in your gym,
  so X62 always has something to offer. `medium`
- **X77 — Travel mode.** A no-kit session set for hotels and holidays. `medium`
- **X78 — Home mode.** A minimal-equipment session set (bands, dumbbells, bodyweight). `medium`
- **X79 — Time-short mode.** "I've got 40 minutes" and the app trims to the priority lifts and tells
  you which ones it dropped. `medium`
- **X80 — Priority flags.** Which lifts are non-negotiable when time is short (leg press and bench
  before lateral raises, for instance). `quick`
- **X81 — Injury and limitation mode.** Hide or substitute an exercise for a set period with a
  reason, so a knee flare-up doesn't look like laziness in your stats. (Extends `N26`.) `medium`
- **X82 — Conditioning blocks per day.** Your Wednesday and Friday finishers as tickable, timed
  items rather than paragraphs. `quick`
- **X83 — Phase tracking.** Name a block ("autumn — strength focus"), set a goal, and see the block
  as a unit rather than endless weeks. `medium`
- **X84 — Comeback ramp.** After a layoff the app suggests a reduced week, and marks it as a ramp
  rather than a slump. (Extends `N177`.) `medium`
- **X85 — Overall session difficulty.** One tap at the end ("how hard was that?"), tracked over
  weeks — the simplest useful version of `L10`. `quick`
- **X86 — Programme adherence.** Planned vs actual sessions, per week and per block. `quick`
- **X87 — Exercise rotation.** Deliberately rotate variants (goblet ↔ hack, dumbbell ↔ barbell) every
  N weeks and keep the history coherent across the rotation. `medium`
- **X88 — "Why this plan" screen.** The reasoning behind each day, written out — genuinely useful
  when motivation dips or someone asks why you train this way. `quick`
- **X89 — Plan printouts.** A clean printable/PDF version for the gym bag or the fridge. (Extends
  `N31`.) `quick`
- **X90 — Rest-day guidance.** Steps, mobility, protein — a short actionable card on non-training
  days. (Extends `S8`.) `quick`
- **X91 — Weekly plan card.** "This week: 3 sessions, 61 sets, and what matters most." `quick`
- **X92 — Coach notes per day.** Your own standing notes ("always add a warm-up set on RDL"). `quick`
- **X93 — Exercise history integrity.** Make sure a renamed or rotated exercise still shows one
  continuous history rather than two. (Directly protects your existing data.) `medium`
- **X94 — Per-side and per-dumbbell handling.** `2 × 8–10 ea` and "per hand" become real properties,
  so the numbers mean one unambiguous thing everywhere. `medium`
- **X95 — Plan import/export.** Save the plan (not just the logs) so a restore brings back any
  customisation. (Extends `N52`.) `quick`

## 4. Progress, metrics and the mirror (X96–X125)

The lifting side is well covered by your plan; this section is about the *results* side.

- **X96 — Bodyweight log.** One number a week, with a 7-day average so day-to-day noise doesn't
  depress you. (Extends `P4`.) `medium`
- **X97 — Trend vs goal.** Your line against a target line, showing whether you're on pace — the
  clearest possible answer to "is this working for fat loss?" `medium`
- **X98 — Goal setting.** Target weight, target lift, target date, with progress bars. `medium`
- **X99 — Measurements.** Waist, chest, arms, thighs — the metric that often moves when the scales
  don't. `medium`
- **X100 — Body fat estimate.** The tape-measure (Navy) method, presented as an estimate with honest
  caveats. `medium`
- **X101 — Progress photos.** Taken in-app, stored on your phone only, with a before/after slider.
  Needs your call on storage (photos are much bigger than numbers). `medium`
- **X102 — Photo reminders.** Monthly nudge, same light, same pose. `quick`
- **X103 — Weekly check-in.** Five taps on a Sunday: weight, waist, energy, sleep, adherence. `medium`
- **X104 — Best set as the headline number.** `60 × 10` is a better progress marker than `60`, and it
  rewards rep progress where the plan asks for it. (Extends `P1`, `R8`.) `quick`
- **X105 — Estimated 1RM.** Epley, shown next to your raw weight, so 100 × 12 and 110 × 9 can be
  compared fairly. (Extends `P1`.) `quick`
- **X106 — Volume load where it's knowable.** Total kilos moved, only where per-set data exists, and
  clearly separate from your last-set records. `quick`
- **X107 — Per-muscle weekly sets.** From your ticks, not from guesses. Parked with the workouts, but
  this is the shape of it. `medium`
- **X108 — Frequency heatmap.** A 12-week grid showing which muscles got worked and when — spots a
  pattern you can't see week to week. `medium`
- **X109 — Consistency calendar.** Sessions per week over months, with streaks and gaps visible.
  (Extends `P5`.) `medium`
- **X110 — Readiness check-in.** Sleep, soreness, energy before a session, with a gentle suggestion
  to reduce volume on a bad day. `medium`
- **X111 — Deload and illness log.** Mark those weeks so the charts don't read a planned step back as
  failure. `quick`
- **X112 — Sleep log.** Manual entry (web apps can't read sleep data) — useful alongside training
  performance. `quick`
- **X113 — Steps log.** Manual, same reason. Honest: the phone counts steps, but the app can't read
  them. `quick`
- **X114 — Water and protein counters.** Light touch — a daily target and one-tap increments. `quick`
- **X115 — Nutrition-lite.** Optional: a protein and calorie target with quick entry, no food
  database, no meal logging. Your call whether this belongs here at all. `medium`
- **X116 — Hunger and appetite notes.** For a fat-loss phase, tracking appetite explains a lot of
  plateaus. `quick`
- **X117 — Performance vs habits.** Do your best sessions follow good sleep weeks? Correlate what
  you're logging and show it. `medium`
- **X118 — "On this day".** What you lifted a month, six months and a year ago. Cheap, and it's the
  clearest proof of progress. `quick`
- **X119 — Milestone timeline.** First 100 kg, 50th session, first 3-for-3 week — a dated list of
  landmarks. `quick`
- **X120 — PR wall.** Every PB in one screen, sortable by muscle, recentness or size. (Extends `P7`.) `quick`
- **X121 — Rep-max calculator.** "If I did 100 × 12, what could I do for 5?" `quick`
- **X122 — Percentage table.** 60/70/80/90% of your estimated 1RM, for planning warm-ups and testing. `quick`
- **X123 — Two-person comparison.** Side by side PBs, or a per-lift delta. (Extends `P8`, `N37`.) `medium`
- **X124 — Monthly report.** One page: sessions, volume by muscle, PBs, bodyweight direction. `medium`
- **X125 — Trend honesty.** Every estimate in the app labelled as an estimate — 1RM, calories, body
  fat — so nothing is mistaken for a measurement. `quick`

## 5. Cardio and conditioning (X126–X140)

Your plan has a real conditioning half that nothing currently records.

- **X126 — Finisher logging.** Time, incline, speed, distance for the treadmill and bike work that's
  already prescribed. (Extends `S7`.) `medium`
- **X127 — Cardio PBs.** Longest incline walk, best 20-minute distance — a scoreboard for the half
  of the plan currently invisible. `medium`
- **X128 — Interval timer.** Work/rest presets — exactly your Wednesday finisher (1 minute moderate,
  30 seconds harder), on screen and beeping. `medium`
- **X129 — HIIT presets.** Tabata (20/10 × 8), EMOM, 30/30 — if you ever want them. `medium`
- **X130 — Static hold timer.** Plank with a countdown that logs the seconds automatically, so a hold
  is recorded like any other set. (Extends `R9`.) `medium`
- **X131 — Circuit mode.** Cycle a list of exercises with rest between rounds, for a conditioning
  session. `big`
- **X132 — Warm-up timer.** Five minutes before you start, so walking in cold becomes impossible. `quick`
- **X133 — Walking and steps targets.** Weekly minutes vs the 150-minute guideline. `quick`
- **X134 — Cardio streaks.** Consecutive weeks hitting your cardio targets. `quick`
- **X135 — Heart-rate zones guide.** Content only — a web app on iOS can't read a chest strap (Web
  Bluetooth works on Android Chrome, not Safari, so I'd skip it unless you're on Android). `quick`
- **X136 — Rest-day cardio ideas.** Rotating suggestions matched to the week you've had. (Extends
  `X90`.) `quick`
- **X137 — Incline ladder plan.** A structured fat-loss treadmill progression, tickable like a lift. `quick`
- **X138 — Perceived effort for cardio.** One tap, so hard cardio and easy cardio aren't conflated. `quick`
- **X139 — Activity summary.** Lifting and cardio in one weekly number. `quick`
- **X140 — Calorie estimates.** Clearly labelled as rough estimates, for interest only. `quick`

## 6. Gym logistics and kit (X141–X156)

- **X141 — Kit inventory.** A one-off list of what actually exists where you train, so every
  substitute and swap offers only real machines. (Extends `N22`.) `quick`
- **X142 — Machine settings memory.** Seat, pin, bar hooks — remembered per exercise, shown every
  time. (Extends `N18`.) `quick`
- **X143 — Settings photos.** See X41. `medium`
- **X144 — Plate calculator.** What to load per side for a target weight, with your plate inventory. `quick`
- **X145 — kg/lb toggle.** Display-only conversion for anyone who thinks in pounds; stored values stay
  in kg so nothing is corrupted. `medium`
- **X146 — Multiple gyms.** Profiles for two locations (kit lists differ, so substitutes do too). `medium`
- **X147 — Machine queue.** Log that you're waiting, get a nudge when you estimate it's free, reorder
  the session around it. `medium`
- **X148 — Out-of-order flag.** Mark a machine broken so it stops being suggested as a substitute. `quick`
- **X149 — Per-gym increments.** The dumbbell rack in one gym steps in 2s and the other in 2.5s. `quick`
- **X150 — "Machine taken?" flow.** Your approved feature, waiting on the workout review. `medium`
- **X151 — "I did something else instead".** Log a substitute ad-hoc when nothing on the list fits,
  under its own name so no PB is polluted. `medium`
- **X152 — Gym bag checklist.** Tick what to take on training days. `quick`
- **X153 — Session start reminder.** In-app nudge based on your usual training time. `quick`
- **X154 — Travel session set.** See X77. `medium`
- **X155 — "Which one today?" memory, made visible.** Your Goblet/Hack choice is already remembered —
  say so on screen, and let it be changed for one session or permanently. (Extends `L11`.) `quick`
- **X156 — Rest-period guidance in the moment.** The correct rest for that exercise shown *and*
  started, rather than printed in the plan. (Extends `L6`, `L7`.) `medium`

## 7. Motivation, habits and the two of you (X157–X186)

- **X157 — Session complete moment.** A real summary screen: what you lifted, best sets, PBs, vs last
  time, plus a light celebration. The payoff the app currently doesn't have. (Extends `S6`.) `medium`
- **X158 — PB celebration.** A quick animation and a sound when you beat a PB — small, and it lands. `quick`
- **X159 — Streaks with a freeze.** Illness and holidays aren't failure; a freeze keeps the streak
  honest and the motivation intact. (Extends `N39`.) `quick`
- **X160 — Weekly target scoreboard.** 3 sessions, hit or not, visible all week. `quick`
- **X161 — Friendly challenges.** Between the two of you: most sessions this month, biggest PB jump,
  best adherence. `medium`
- **X162 — Shared goals.** Both of you hit 3-for-3 — tracked as a team, not against each other. `medium`
- **X163 — Partner feed.** "Kieran logged leg press 45 → 50." Uses data already syncing. `medium`
- **X164 — Cheers.** Send a thumbs-up or a short message attached to a PB or a session. `medium`
- **X165 — Presence.** See when your brother is mid-session right now. `medium`
- **X166 — Live partner view.** His current exercise and last logged set, updating as he logs. `medium`
- **X167 — Realtime sync.** Supabase can push changes over a live connection instead of the app
  checking every 60 seconds — so his PB appears on your phone in seconds. May need a small database
  config change. `medium`
- **X168 — "You vs last month".** Compare this month's best sets to last month's, per lift. `quick`
- **X169 — Achievements wall.** Gentle milestones rather than childish badges — your call on the tone. `medium`
- **X170 — Weekly recap card.** Shareable to WhatsApp: sessions, PBs, best sets. (Extends `N38`,
  `N11`.) `medium`
- **X171 — Monthly report card.** The same, monthly, with bodyweight direction. `medium`
- **X172 — Year in review.** Total sessions, kilos moved (where knowable), PBs, best month. `medium`
- **X173 — Rest-day tips.** Rotating, useful, from your own reference content. `quick`
- **X174 — Milestone nudges.** "Nine sessions to 100." `quick`
- **X175 — Post-session reflection.** One tap: easy, about right, brutal. `quick`
- **X176 — Honest praise only.** No fake streaks, no guilt mechanics — the app never congratulates you
  for something you didn't do. (A principle worth writing into the copy.) `quick`
- **X177 — Comeback mode.** See X84. `medium`
- **X178 — Optional leaderboard.** Sortable and opt-in, so it stays fun rather than a source of
  friction. (Extends `P8`.) `quick`
- **X179 — Handicap system.** So the stronger lifter doesn't win everything by default. `medium`
- **X180 — House records wall.** Shared PBs, both names on the board. `quick`
- **X181 — Session comments.** A one-line note the other person can see ("skipped the finisher,
  shattered"). `quick`
- **X182 — "Both trained today" indicator.** Tiny, oddly satisfying. `quick`
- **X183 — Partner PBs on your rows.** `K 40 kg` next to the exercise. (Extends `S9`.) `quick`
- **X184 — Anniversary memory.** "One year since you started logging." `quick`
- **X185 — Turn-taking mode.** Auto-alternates who's logged after each save, so you never touch the
  name switcher mid-session. (Extends `N36`.) `medium`
- **X186 — Training-together tips.** Reminders of the etiquette in your reference section, shown
  during shared sessions. `quick`

## 8. Data, backup and recovery (X187–X206)

You asked where your data lives, so, plainly: **each phone keeps its own full copy** (in the phone's
browser storage), and **the sync room keeps a shared copy** — that's why you can see Kieran's logs.
That's two copies, which is decent but not a backup. These items make it three.

- **X187 — Import / restore from backup.** You can export today but not restore. The single biggest
  data-safety gap. (Extends `F1`.) `medium`
- **X188 — CSV import.** Bring data back from a spreadsheet, with a preview of what will change. `medium`
- **X189 — Merge preview.** Before any restore, show exactly what would be added, updated or skipped —
  and never let an older file overwrite newer data. (Extends `F1`.) `medium`
- **X190 — Monthly auto-snapshot.** A rolling local snapshot (last six months) with no user action
  needed, restorable in a couple of taps. `medium`
- **X191 — Cloud cold copy.** A monthly full backup stored in the sync room, so losing both phones is
  recoverable with nothing but the PIN. (Extends `N41`.) `medium`
- **X192 — "Where is my data" screen.** Plain English: what's on this phone, what's in the cloud,
  when each last changed, and what a new phone would recover. This is reassurance as much as a
  feature. `quick`
- **X193 — Storage usage.** How much space your log uses, and what's using it (notes, photos,
  snapshots). `quick`
- **X194 — Anomaly finder.** Scans for impossible numbers (a 200 kg typo) and asks before you fix. `quick`
- **X195 — Duplicate detection.** Finds and merges duplicated records — the usual mess after a sync
  hiccup. `medium`
- **X196 — Edit or delete any past record.** Approved. (Extends `1.2`, `F4`.) `medium`
- **X197 — Delete cloud copy.** A proper "leave the room and erase the cloud side" option — today
  disconnecting leaves the rows behind. `quick`
- **X198 — Complete export.** Logs, plan, settings, versions and who owns which record — so a future
  restore can't lose anything that mattered. (Extends `F5`, `N52`.) `quick`
- **X199 — PDF / print report.** Full history or a chosen date range, for a coach, a physio or your
  own records. (Extends `P10`, `X124`.) `medium`
- **X200 — Share cards.** Session, PB or month rendered as an image. (Extends `N38`.) `medium`
- **X201 — Backup reminders.** Footer line when it's been over a month, with the last-export date
  remembered. (Extends `F2`.) `quick`
- **X202 — Encrypted export.** Password-protect a backup file that contains both people's data. `medium`
- **X203 — Schema versioning.** A version field plus a conversion path, so any future change can read
  today's data — the structural guarantee that nothing you've logged becomes unreadable. `medium`
- **X204 — Self-test page.** Runs the parsers, the sync merge and the export/import round-trip in the
  browser and reports pass/fail — so a change can be proven safe before it reaches your phone. `medium`
- **X205 — Re-pull from the room.** Restore your history from the cloud copy without touching your
  local records first. `quick`
- **X206 — Change log.** Who changed what, when — invaluable when two phones disagree and you need
  to know which one is right. `medium`

## 9. Settings, help and everything else (X207–X225)

- **X207 — Settings search.** Once there are 20 options, finding one matters. `quick`
- **X208 — Plain-English descriptions.** Every setting explained in one honest sentence, no jargon. `quick`
- **X209 — Glossary / legend.** What `1/3` means, what PB means, what the colours mean, what a
  "compound" is — the app currently explains none of its own symbols. (Directly relevant to your
  badge: even if the number stays as-is, the app should say what it counts.) `quick`
- **X210 — First-run tour.** Three cards: log a lift, tick it off, watch your PB. `quick`
- **X211 — Help mode.** Tap "?" then tap anything on screen to get an explanation of it. `medium`
- **X212 — What's new.** A short changelog so you can see what changed after each update. (Extends
  `N46`.) `quick`
- **X213 — Feedback button.** Opens a message pre-filled with the app version and sync state, so you
  can tell me what's wrong in one tap. (Extends `N47`.) `quick`
- **X214 — About and privacy.** Local-first, no tracking, no accounts, exactly where the data sits —
  stated in the app rather than in a document only you two read. `quick`
- **X215 — Safety notes refresh.** When to stop, when to see a physio, the classic "this isn't
  medical advice" — expanded and made readable. `quick`
- **X216 — Sound and haptics toggles.** Because a beeping app in a quiet gym is its own problem. `quick`
- **X217 — Theme options.** Dark, light and high-contrast, honouring the system setting by default. `medium`
- **X218 — Large-text mode.** A gym-friendly "big numbers" toggle independent of the OS setting. `quick`
- **X219 — Colour-blind-safe palettes.** Person colours and day accents separable without relying on
  red/green distinctions. `medium`
- **X220 — App lock.** Face ID / Touch ID via WebAuthn to open the app. Honest framing: a speed bump
  against someone picking up your phone, not encryption. `medium`
- **X221 — Privacy screen.** Blur the app in the iOS app switcher so your weights aren't visible on a
  shared screen. `quick`
- **X222 — Friendly error states.** Every failure explains itself and offers the next action, rather
  than showing a status code. (Extends `Y5`, `A7`.) `quick`
- **X223 — Empty states that teach.** "Nothing logged yet — here's how" on first use of each screen. `quick`
- **X224 — Performance pass.** Fast first paint, no layout shift, fonts that don't block, and a history
  that stays instant even with a thousand entries. `medium`
- **X225 — Accessibility audit.** One complete pass: contrast, tap targets, screen-reader labels,
  voice control, reduced motion, zoom. (Extends `A1`–`A9`, `N53`–`N58`.) `medium`

---

## 10. What I'd build first, if you want an opinion

1. **The reps model + invented-reps fix + undo + edit/delete** — the core loop, and it stops the app
   storing numbers you never entered. (`R1`–`R4`, `R8`, `1.1`, `1.2`)
2. **Log for both** — the biggest time saver on a shared session. (`1.5`)
3. **Import/restore + backup reminders** — so "we'll never lose it" is actually true. (`X187`, `X190`,
   `X191`, `X201`)
4. **Offline + splash + install polish** — it opens instantly with no signal and looks finished doing
   it. (`X1`–`X12`)
5. **Sync correctness** — the "Connected" bug, the wrong-PIN bug, and only sending what changed. (`1.7`)

## 11. What a web app honestly can't do

Listed so nothing here gets mistaken for a promise:

- **Apple Watch** — no app, no watch faces, no logging from the wrist.
- **Health, Fitness, steps, heart rate, sleep** — not readable from a web app on iOS. Manual entry is
  the only route (`X112`, `X113`).
- **Lock-screen widgets, Live Activities, Dynamic Island** — native only.
- **Anything running while the app is closed** — no background sync, no background timers. The rest
  timer with the screen locked was already fixed as far as it can be (`T1`).
- **Bluetooth heart-rate straps** — Android Chrome only, not iOS Safari (`X135`).
- **Push notifications without extra plumbing** — technically possible when installed on iOS 16.4+,
  but it needs a push service and keys; in-app nudges are free and cover most of it.
- **Camera form-checking, video analysis, AI coaching from video** — a different product (and a
  different budget).
- **Being a food database** — nutrition beyond a protein/calorie target (`X115`) is a whole other app.

## 12. Anything else you'd like added to this list?

This is 225 items. If there's a category you'd like me to go deeper on — the plan itself, the
pair-training experience, the stats, the data safety, or something I haven't thought of at all —
say which and I'll write a round 4 that only covers that, in as much detail as you want.
