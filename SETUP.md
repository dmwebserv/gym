# Turning on phone-to-phone sync (one-time, ~3 minutes)

The app works perfectly on one phone with no setup at all — weights, reps
and PBs are saved on that phone. To make **Danny's phone** and **Kieran's
phone** share one history (so you both see each other's PBs and "last time"
weights), we use a free Supabase project as the shared store.

There is no per-device account, no email and no password: you just enter the
**same short PIN** on both phones once.

---

## 1. Create the free store (Danny or Kieran, 2 minutes)

1. Go to <https://supabase.com> and **Start your project** (free plan, no card needed).
2. Pick any organisation name, any region near you (e.g. `eu-west-2` London), and a database password.
3. Wait ~1 minute for it to spin up, then click **SQL Editor** → **New query**.
4. Open this repo's **`supabase.sql`** file, copy the *whole* file, paste it into the editor and click **Run**.
   You should see `Success. No rows returned`.
5. Click **Project Settings** (gear icon) → **API**.
6. Copy the **Project URL** (looks like `https://xxxx.supabase.co`) and the **anon public** key (long string starting `eyJ...`).

## 2. Put the keys in the app (1 minute)

1. Open this repo on GitHub → **`index.html`** → pencil icon (Edit).
2. Near the top of the file find:

   ```js
   const SUPABASE = {
     url: '',        // e.g. 'https://abcdefghijklm.supabase.co'
     anonKey: ''     // the public "anon" key from Project Settings → API
   };
   const SUPABASE_TABLE_SQL_OK = false; // flipped to true once you've run supabase.sql
   ```

3. Paste your URL between the quotes on the `url` line, and your anon key on the `anonKey` line.
4. Change `false` to `true` on the last line (only after step 1's SQL has run).
5. **Commit changes** (green button). GitHub Pages rebuilds the site automatically — check it's live at your URL, then hard-refresh both phones.

> These two keys are **public by design** — they're meant to sit in the app.
> Nothing is readable or writable without the shared PIN thanks to the locked
> SQL functions, so it's safe in a public repo. The database password from
> step 2 is **never** put in the app.

## 3. Connect the phones (in the gym, 30 seconds)

1. On **Danny's phone**: open the app → tap the **⚙ gear** (top right, next to the name switcher) → **Sync** → **Connect phones (enter the shared PIN)**.
2. Make up a shared PIN (6+ characters is best, e.g. `legday42`). Enter it and tap **Connect**.
3. On **Kieran's phone**: do the same and enter the **exact same PIN**.
4. Both phones now say **Synced** in the footer. Weights and PBs flow both ways automatically — offline is fine, it catches up later.

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
- Export a full backup any time: Settings → Data & backup.
