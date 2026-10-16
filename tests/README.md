# Tests

These drive the **real app** (`index.html`) in a headless DOM against real `localStorage`, including
a simulated phone that already holds months of old data. They are development tooling only — the app
itself has no dependencies, no build step, and nothing in this folder ships to a phone.

```bash
cd tests
npm install jsdom     # one-time, ~36 packages, only for testing
node release1.js      # logging: reps model, undo, edit/delete, log-for-both, guards    (81 checks)
node release2.js      # the programme, badges, rotation, substitutes, ladder            (41 checks)
node upgrade.js       # a phone full of old data boots into the new code unharmed        (16 checks)
```

`release1.js` is deliberately day-agnostic: it works out which session the app opens on and asserts
against that, so it passes on a Monday, Wednesday or Friday.

## What they prove

| File | Covers |
|---|---|
| `release1.js` | Reps are only saved when entered (the old code invented `10/10/10` on every log) · one last-set number stores as `reps:[8]` + `repsMode:'last'` · the row shows `×8` · undo restores the previous state *and* tombstones a record it created, so the other phone follows · `27,5` saves as 27.5 · a stray second decimal can't corrupt the value · log-for-both writes both people and both ticks, and undo removes both · the 300 kg typo guard writes nothing until confirmed · an old `[10,9,8]` record keeps its exact bytes and shows its last set as the headline · edit, delete, undo-delete and date-change (leaving a tombstone behind) · alternating slots store a one-day pick that expires · pull-up practice is tick-only and writes no fake PB · the ladder panel is collapsed by default and its record is kept out of Progress · "machine taken?" logs under the substitute and leaves the original lift alone · "do it later" reorders today only · the timer still works · the sync payload carries tombstones and the new shape |
| `release2.js` | The programme is exactly the agreed one (7 / 11 / 11 exercises, 76 sets, no goblet squat, no hip thrust/plank/crunch/dead bug, calves and rear delts doubled, the carry present) · every badge is derived from the plan and correct (`1/4…4/4` chest, `1/1` core, `1/2` calves and rear delts) · rotation offers whichever variant was *not* done last, in both directions, and the row shows only the distinguishing word · dumbbell and barbell stay separate records · retired lifts keep their name and muscle label in Progress · the backup nudge appears, clears after an export, returns after a month · the old-rep clean-up blanks reps only, keeps weight and date, spares real last-set records, and is undoable |
| `upgrade.js` | A phone that already has months of data and no `repsMode` fields: nothing is rewritten or migrated, PBs and ticks survive, old three-value records are labelled honestly, pre-fill reads them correctly, and new records sit alongside them |

If any file fails after a future change, that is the signal that something started touching stored
data when it shouldn't. Run all three before merging anything that touches `index.html`.
