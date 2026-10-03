-- Optional provisioning for pre-approved accounts. Only the project administrator
-- can add emails here. No public signup UI and no email is sent by this script.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.allowed_members (
 email text primary key check(email=lower(email)),
 household_id uuid not null references public.households(id) on delete cascade
);
alter table private.allowed_members enable row level security;
revoke all on private.allowed_members from public, anon, authenticated;
create or replace function private.attach_approved_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.email_confirmed_at is not null then
  insert into public.household_members(household_id,user_id)
  select household_id,new.id from private.allowed_members where email=lower(new.email)
  on conflict(user_id) do nothing;
 end if;
 return new;
end;
$$;
revoke all on function private.attach_approved_user() from public, anon, authenticated;
create trigger attach_approved_couple_user
after insert or update of email,email_confirmed_at on auth.users
for each row execute function private.attach_approved_user();
commit;
