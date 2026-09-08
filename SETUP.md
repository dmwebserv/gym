# Phone-to-phone sync

The app works perfectly on one phone with no setup at all — weights, reps
and PBs are saved on that phone. To make **Danny's phone** and **Kieran's
phone** share one history (so you both see each other's PBs and "last time"
weights), we use a free Supabase project as the shared store.

There is no per-device account, no email and no password: you just enter the
**same short PIN** on both phones once.

---

## Status: ✅ keys are already in the app

The project URL and publishable key are already configured in `index.html`.
If you're setting this up again from scratch (e.g. a new project), re-create
it with the two steps below — otherwise jump straight to **Connect the
phones**.

## 1. One-time database setup (2 minutes, only if not done yet)

1. Go to <https://supabase.com> → your project.
2. Click **SQL Editor** → **New query**.
3. Paste the *whole* contents of this repo's **`supabase.sql`** in and click **Run**.
   You should see `Success. No rows returned`.
4. If you ever need new keys: **Project Settings** (gear icon) → **API**.
   Copy the **Project URL** (`https://xxxx.supabase.co`) and the
   **publishable** key (starts with `sb_publishable_...` — this is the modern
   anon key) and put them in the `SUPABASE` block at the top of `index.html`,
   with `SUPABASE_TABLE_SQL_OK = true`.

> These keys are **public by design** — they're meant to sit in the app.
> Nothing is readable or writable without the shared PIN thanks to the locked
> SQL functions, so it's safe in a public repo. The database password is
> **never** put in the app.

## 2. Connect the phones (30 seconds)

1. On **Danny's phone**: open the app → tap the **⚙ gear** (top right, next to the name switcher) → **Sync** → **Connect phones (enter the shared PIN)**.
2. Make up a shared PIN (6+ characters is best, e.g. `legday42`). Enter it and tap **Connect**.
3. On **Kieran's phone**: do the same and enter the **exact same PIN**.
4. Both phones now say **Synced** in the footer (and on the Progress tab).
   Weights and PBs flow both ways automatically — offline is fine, it catches
   up later.

> Forgot the PIN? Each phone keeps its own full copy of the data, so nothing
> is lost — export a backup from Settings to be safe. (There is deliberately
> no way to recover a forgotten PIN from the cloud.)

---

## Everyday notes

- **Tick marks** (today's session progress) clear the next day. **Lift history
  and PBs never clear** — they're yours forever, per person.
- The weight pill on each exercise is pre-filled with **your** last weight for
  that lift. Tap it to log → it saves and ticks the exercise off.
- **PB** under every pill = the heaviest you've logged for that lift, with the
  date. Tap it to see the full history + trend.
- "Squat or Leg Press" style rows remember which machine you picked each time
  and compare like with like.
- The **Progress** tab always pulls the freshest data when you open it, so the
  other person's latest lifts appear there immediately.
- Export a full backup any time: Settings → Data & backup.
