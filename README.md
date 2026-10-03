# 慢慢喜欢你 · Our Little Days

A private, responsive memory space for two people and their cat. Built with React, TypeScript, Vite, Motion and Supabase. The interface combines warm editorial typography with spring transitions, a responsive photo gallery, private media, and direct feedback on every save.

## What works

- Live relationship dashboard, calendar anniversary countdown and pet age calculation.
- Photo/video upload; images are resized to at most 2048px and encoded to WebP before upload.
- Albums, text and photo journals, sweet moments, thoughts, conflict/repair records, and pet records.
- Fullscreen-style media dialog with thumbnails, keyboard navigation, touch swipes, zoom and native video controls.
- Personal cycle records with explicitly defined interval windows; work records with per-day expected times and next-day support.
- Editing, deletion with confirmation, search/filtering, and full JSON export including media.
- Supabase email/password login, shared household, private storage, row-level security and realtime refresh.
- Desktop, tablet and phone layouts; respects reduced-motion preference.

## Development

Use Node 22 and pnpm 11.25.0 or newer:

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

Without Supabase configuration, the Vite development server provides a clearly labeled local preview backed by IndexedDB. This mode is **not available in production**. A production build without Supabase configuration displays a locked setup page.

Local preview seed settings may be supplied through `.env.development.local`:

```dotenv
VITE_PREVIEW_START_DATE=YYYY-MM-DD
VITE_PREVIEW_PET_BIRTHDAY=YYYY-MM-DD
```

Personal dates, login emails, credentials, uploaded media and user records do not belong in Git. `.env*`, research material and local artifacts are ignored. 3D character assets being developed separately are not required by this application.

## Supabase setup

1. Create a Free project and run `supabase/schema.sql` once in the SQL Editor.
2. Create the intended users in **Authentication → Users**. Use the dashboard's create-user form and set their passwords yourself. The app does not offer public registration.
3. Create a household and add only the intended user IDs to `household_members`. Use the template in `supabase/bootstrap.example.sql`; replace placeholders locally, not in a public commit. Alternatively, run `supabase/approved-members.sql` once and add the intended email/household pairs to the private `allowed_members` table. Its trigger attaches only confirmed, pre-approved accounts when they are created or confirmed.
4. In **Authentication → Sign In / Providers**, disable new user signups. Existing users can still sign in.
5. Copy `.env.example` to `.env.local`, setting the project URL and publishable key (or legacy anon key). Never use the secret/service-role key in the browser.

The application stores settings and records in private Postgres rows. All table policies require household membership. The `memories` storage bucket is private and scoped by the household ID in its path. Viewing media uses temporary signed URLs, refreshed while the app is in use. Anonymous requests to private tables are denied. Household membership can only be changed by the project administrator.

## Deployment

The included GitHub Actions workflow builds and deploys `main` to GitHub Pages. Add repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and enable **Settings → Pages → GitHub Actions**. `VITE_BASE_PATH` in the workflow must match the repository path. The public entry page requires login; private data is fetched from Supabase after authentication.

For Vercel or Cloudflare Pages, use build command `pnpm build`, output directory `dist`, and `VITE_BASE_PATH=/`. Set the same Supabase variables. This application uses internal state navigation and does not require path rewrites.

## Free storage limits

Checked against official pricing on 2026-10-03:

- [Supabase Free](https://supabase.com/pricing): 500 MB database, 1 GB files, 5 GB egress plus 5 GB cached egress; 50 MB per-file maximum. Free projects can pause after one week of inactivity.
- [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/): Standard storage includes 10 GB-month per month in the free tier and free internet egress. It is a possible future storage upgrade and is **not connected in this version**.

Daily video uploads can exceed 1 GB quickly. Images are optimized automatically; videos are stored as provided. Browser playback depends on the file's codec; H.264 MP4 is the most broadly compatible. HEIC images should be converted to JPG before upload. Free services do not include an uptime guarantee or unlimited storage.

## Validation and limits

`pnpm test` checks calendar-day counting, anniversary boundaries, pet age, time zones, cycle intervals and punctuality metrics. The UI must additionally be checked for uploads, reload persistence, media viewing, authentication, responsive layout and realtime changes. Sample records used during development are not real personal memories.

Cycle statistics are personal tracking only, not diagnosis or contraception advice. Work punctuality includes only dates the user actually records. JSON export contains media and may require substantial memory for large video collections; there is no in-app restore UI yet. Media transcodes, push notifications, native offline sync, live 3D avatars and automatic backups are future additions.
