# Tests

These drive the **real app** (`index.html`) in a headless DOM against real `localStorage`.
They are development tooling only — the app itself has no dependencies, no build step and
nothing in this folder ships to a phone.

```bash
cd tests
npm install jsdom          # one-time, ~36 packages, only for testing
node release1.js           # the reps model, undo, edit/delete, log-for-both, guards (63 checks)
node upgrade.js            # a phone that already has old data boots into the new code (16 checks)
```

`release1.js` is deliberately day-agnostic: it works out which session the app opens on and
asserts against that, so it passes on a Monday, Wednesday or Friday.

## What they prove

| File | Covers |
|---|---|
| `release1.js` | Reps are only saved when entered (the old code invented `10/10/10` on every log) · one last-set number stores as `reps:[8]` + `repsMode:'last'` · the row shows `×8` · undo restores the previous state *and* tombstones a new record so the other phone follows · `27,5` saves as 27.5 · a stray second decimal doesn't corrupt · log-for-both writes both people and both ticks · the 300 kg typo guard writes nothing until confirmed · an old `[10,9,8]` record keeps its exact bytes and displays its last set · edit, delete, undo-delete and date-change (with a tombstone left behind) · bodyweight rows, variant chips and the timer still work · the sync payload carries tombstones and the new shape |
| `upgrade.js` | A phone that already has months of data and no `repsMode` fields: nothing is rewritten or migrated, PBs and ticks survive, old three-value records are labelled honestly, pre-fill reads them correctly, and new records sit alongside them |

If either file is run after a future change and fails, that's the signal that something
started touching stored data when it shouldn't.
