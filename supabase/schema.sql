-- Run once in the project's SQL Editor. All personal rows are private.
begin;
create table if not exists public.households (
 id uuid primary key default gen_random_uuid(),
 settings jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.household_members (
 household_id uuid not null references public.households(id) on delete cascade,
 user_id uuid not null unique references auth.users(id) on delete cascade,
 primary key(household_id,user_id)
);
create or replace function public.is_household_member(target text)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.household_members where household_id::text=target and user_id=(select auth.uid())); $$;
revoke all on function public.is_household_member(text) from public, anon;
grant execute on function public.is_household_member(text) to authenticated;
create table if not exists public.memories (
 id uuid primary key default gen_random_uuid(),
 household_id uuid not null references public.households(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 100),
 text text not null default '' check(char_length(text)<=20000),
 date date not null,
 category text not null check(category in ('daily','sweet','conflict','thought','mini')),
 media jsonb not null default '[]'::jsonb check(jsonb_typeof(media)='array' and jsonb_array_length(media)<=12),
 resolved boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists memories_household_date on public.memories(household_id,date desc);
create table if not exists public.trackers (
 id uuid primary key default gen_random_uuid(),
 household_id uuid not null references public.households(id) on delete cascade,
 kind text not null check(kind in ('period','work')),
 date date not null,
 expected text not null default '',
 actual text not null default '',
 actual_next_day boolean not null default false,
 note text not null default '' check(char_length(note)<=2000),
 created_at timestamptz not null default now(),
 unique(household_id,kind,date),
 check(kind='period' or (expected ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and actual ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'))
);
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.memories enable row level security;
alter table public.trackers enable row level security;
revoke all on public.households, public.household_members, public.memories, public.trackers from anon, authenticated;
grant select on public.households, public.household_members to authenticated;
grant update(settings) on public.households to authenticated;
grant select,insert,update,delete on public.memories, public.trackers to authenticated;
create policy "members read own membership" on public.household_members for select to authenticated using(user_id=(select auth.uid()));
create policy "members read household" on public.households for select to authenticated using(public.is_household_member(id::text));
create policy "members edit settings" on public.households for update to authenticated using(public.is_household_member(id::text)) with check(public.is_household_member(id::text));
create policy "members read memories" on public.memories for select to authenticated using(public.is_household_member(household_id::text));
create policy "members add memories" on public.memories for insert to authenticated with check(public.is_household_member(household_id::text));
create policy "members edit memories" on public.memories for update to authenticated using(public.is_household_member(household_id::text)) with check(public.is_household_member(household_id::text));
create policy "members delete memories" on public.memories for delete to authenticated using(public.is_household_member(household_id::text));
create policy "members read trackers" on public.trackers for select to authenticated using(public.is_household_member(household_id::text));
create policy "members add trackers" on public.trackers for insert to authenticated with check(public.is_household_member(household_id::text));
create policy "members edit trackers" on public.trackers for update to authenticated using(public.is_household_member(household_id::text)) with check(public.is_household_member(household_id::text));
create policy "members delete trackers" on public.trackers for delete to authenticated using(public.is_household_member(household_id::text));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('memories','memories',false,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "members read private media" on storage.objects for select to authenticated using(bucket_id='memories' and public.is_household_member((storage.foldername(name))[1]));
create policy "members upload private media" on storage.objects for insert to authenticated with check(bucket_id='memories' and public.is_household_member((storage.foldername(name))[1]));
create policy "members delete private media" on storage.objects for delete to authenticated using(bucket_id='memories' and public.is_household_member((storage.foldername(name))[1]));
-- Authenticated subscriptions still obey the SELECT policies above.
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='memories' and schemaname='public') then alter publication supabase_realtime add table public.memories; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='trackers' and schemaname='public') then alter publication supabase_realtime add table public.trackers; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='households' and schemaname='public') then alter publication supabase_realtime add table public.households; end if;
end $$;
commit;
