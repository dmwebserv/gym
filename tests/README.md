# Tests

These drive the **real app** (`index.html`) in a headless DOM against real `localStorage`, including
a simulated phone that already holds months of old data, and **two phones sharing one sync room**.
They are development tooling only — the app itself has no dependencies, no build step, and nothing in
this folder ships to a phone.

```bash
cd tests
npm install jsdom     # one-time, only for testing
node release1.js      # logging: reps model, undo, edit/delete, log-for-both, guards        (81 checks)
node release2.js      # the programme, badges, rotation, substitutes, ladder                (41 checks)
node release3.js      # the shell that ships, splash, offline, install, theme, first run    (46 checks)
node release4.js      # Progress views, session summary, PB moment, gym-floor tools          (93 checks)
node restore.js       # restore from backup: merge rules, no resurrection, undoable         (20 checks)
node sync.js          # two phones, one room: no data loss, deletes stick, offline catches up (23 checks)
node upgrade.js       # a phone full of old data boots into the new code unharmed            (16 checks)
```

**320 checks, roughly 45 seconds.** Run all seven before merging anything that touches `index.html`.

`release1.js` is deliberately day-agnostic: it works out which session the app opens on and asserts
against that, so it passes on a Monday, Wednesday or Friday.

## What they prove

| File | Covers |
|---|---|
| `release1.js` | Reps are only saved when entered (the old code invented `10/10/10` on every log) · one last-set number stores as `reps:[8]` + `repsMode:'last'` · the row shows `×8` · undo restores the previous state *and* tombstones a record it created, so the other phone follows · `27,5` saves as 27.5 · a stray second decimal can't corrupt the value · log-for-both writes both people and both ticks, and undo removes both · the 300 kg typo guard writes nothing until confirmed · an old `[10,9,8]` record keeps its exact bytes and shows its last set as the headline · edit, delete, undo-delete and date-change (leaving a tombstone behind) · alternating slots store a one-day pick that expires · pull-up practice is tick-only and writes no fake PB · the ladder panel is collapsed by default and its record is kept out of Progress · "machine taken?" logs under the substitute and leaves the original lift alone · "do it later" reorders today only · the timer still works · the sync payload carries tombstones and the new shape |
| `release2.js` | The programme is exactly the agreed one (7 / 11 / 11 exercises, 76 sets, no goblet squat, no hip thrust/plank/crunch/dead bug, calves and rear delts doubled, the carry present) · every badge is derived from the plan and correct (`1/4…4/4` chest, `1/1` core, `1/2` calves and rear delts) · rotation offers whichever variant was *not* done last, in both directions, and the row shows only the distinguishing word · dumbbell and barbell stay separate records · retired lifts keep their name and muscle label in Progress · the backup nudge appears, clears after an export, returns after a month · the old-rep clean-up blanks reps only, keeps weight and date, spares real last-set records, and is undoable |
| `release3.js` | A brand new phone with no data at all still clears the splash and asks who is using it (never a broken screen) · the manifest is valid, standalone, correctly named and coloured, with 192/512 + maskable icons and shortcuts, and every icon it names exists · the service worker exists, caches all seven self-hosted fonts, treats navigations separately, and **returns early on cross-origin requests so the sync store is never cached** · no third-party font request remains · nine iOS launch images are generated and wired · the splash and skeleton are in the page, the splash fades and the skeleton clears on first paint · the top bar follows the day's accent and falls back on other screens · going offline shows a notice that says data still saves, and it clears when signal returns · a lift logged while offline is saved with the right weight · the update handshake only adopts a new version when no sheet is open |
| `restore.js` | Exports carry an app name, a schema version and a date · Settings offers "Restore from backup" beside the exports · a non-backup file is refused · **an older version of a record you already have is skipped, a newer one is applied** · records you don't have are added, for both people · unknown people are ignored · **a deleted record does not come back** (the tombstone is newer) · nothing is ever removed · restore is undoable · the preview counts adds/skips before writing anything and changes nothing on the phone |
| `sync.js` | Two independent app instances against an in-memory implementation of the real `sync_state()` SQL. Proves: only changed rows are uploaded (a quiet sync sends **zero** rows), `p_since` asks only for what's new, the other phone receives lifts and ticks, a new lift on B reaches A, deletes travel as tombstones and **an older stale copy cannot resurrect a deleted record**, a lift logged with no signal arrives when signal returns, the pull-up ladder level syncs, a brand new phone recovers everything from the room, and every 20th sync still sends everything as a safety net |
| `release4.js` | Progress has four views and each is real: the month-on-month comparison only compares lifts logged in both months · the PB wall sorts three ways, is per person (switching person switches the wall), shows retired lifts, and every date is a real date · the map draws 12 weeks × 3 days, a full day fills its square, and "this week against the plan" lists every muscle · "you two" only compares lifts both people have logged, lists the ones only one has, and shows the partner feed with honest ago-text · memories count back to the first lift ever logged · **visiting every view writes not one byte to the log** · the session summary appears only when the whole session is ticked and reports kilos moved, minutes, best set and PBs · **beating a PB raises the named banner and a lighter set does not** · each row carries "Kieran's PB" clearly attributed to Kieran · long-press logs last time's numbers with no sheet, ticks the exercise, and does not also open the sheet (a quick tap still does) · the plate calculator is correct on real plate maths, refuses impossible numbers and weights below the bar, and handles a plate-loaded machine · the trim keeps the big lifts, marks the rest as "left out today" without removing any row, never leaks from yesterday, and clears · search finds by name, says plainly when there is nothing, and asks for two letters · saving one half of a superset opens the other half by itself, with a note, both halves ticked, each in its own separate record, and no loop |
| `upgrade.js` | A phone that already has months of data and no `repsMode` fields: nothing is rewritten or migrated, PBs and ticks survive, old three-value records are labelled honestly, pre-fill reads them correctly, and new records sit alongside them |

If any file fails after a future change, that is the signal that something started touching stored
data when it shouldn't.
