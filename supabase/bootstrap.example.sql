-- Replace placeholders locally, after creating the intended user in Authentication.
-- Do not commit real emails, dates, passwords or private records to the repository.
with home as (
 insert into public.households(settings)
 values(jsonb_build_object(
  'names','你 & 我',
  'startDate','YYYY-MM-DD',
  'petBirthday','YYYY-MM-DD',
  'timezone','Asia/Dubai',
  'cycleDays',28,'toleranceDays',3,'workTime','18:00'
 )) returning id
)
insert into public.household_members(household_id,user_id)
select home.id, auth.users.id from home,auth.users
where auth.users.email='YOUR_LOGIN_EMAIL';
-- To add the partner later, add their auth.users ID to the SAME household ID.
