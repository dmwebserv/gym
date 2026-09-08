-- ============================================================
-- Session app — shared sync store (Supabase)
-- ------------------------------------------------------------
-- How to use:
--   1. Create a free project at https://supabase.com
--   2. Open it → SQL Editor → New query
--   3. Paste this WHOLE file in and click Run.
--   4. Copy your Project URL + anon key:
--        Project Settings → API
--   5. Put those two values into index.html where it says
--        const SUPABASE = { url: '', anonKey: '' };
--      and flip SUPABASE_TABLE_SQL_OK to true. Save + push.
--
-- Security model: every read/write goes through the
-- sync_state() function below, which checks the shared secret
-- that both phones derive from the same PIN. The underlying
-- tables are locked to everyone — nobody can read or write
-- them directly, not even with the public anon key.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  hash text primary key,
  room text not null unique
);

create table if not exists public.lifts (
  id text primary key,        -- composite: room-prefixed, set by the function
  room text not null,
  pid text not null,
  data jsonb not null,
  ts bigint not null
);

alter table public.rooms enable row level security;
alter table public.lifts enable row level security;

revoke all on public.rooms, public.lifts from anon, authenticated;

-- Core function: validate the secret, upsert the device's rows,
-- return everything the room knows so the device can merge.
create or replace function public.sync_state(p_secret text, p_rows jsonb default '[]'::jsonb, p_since bigint default 0)
returns setof public.lifts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest('gym-store:' || p_secret, 'sha256'), 'hex');
  v_room text := 'r' || substr(p_secret, 1, 16);
  r jsonb;
begin
  if p_secret is null or length(p_secret) < 20 then
    raise exception 'invalid secret';
  end if;

  -- register this room the first time we ever see it
  insert into public.rooms(hash, room)
  values (v_hash, v_room)
  on conflict (hash) do nothing;

  -- two different secrets can never share a room
  if not exists (select 1 from public.rooms where hash = v_hash and room = v_room) then
    raise exception 'secret does not match this room';
  end if;

  -- write this device's rows (newest version of a row wins)
  for r in select * from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) loop
    if (r->>'id') is null or (r->>'pid') is null then
      continue;
    end if;
    insert into public.lifts(id, room, pid, data, ts)
    values (
      v_room || ':' || (r->>'id'),
      v_room,
      r->>'pid',
      coalesce(r->'data', '{}'::jsonb),
      coalesce((r->>'ts')::bigint, 0)
    )
    on conflict (id) do update
      set data = excluded.data,
          ts   = excluded.ts
      where excluded.ts >= public.lifts.ts;
  end loop;

  -- hand everything back so the device can merge
  return query
    select l.*
    from public.lifts l
    where l.room = v_room
      and l.ts > p_since
    order by l.ts;
end;
$$;

grant execute on function public.sync_state(text, jsonb, bigint) to anon, authenticated;
