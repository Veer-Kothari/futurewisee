# Set up the FutureWise backend (accounts, survey, editor, click tracking)

No app code changes. The generated connection files and `.env` already exist, so nothing is generated or rewritten.

## 1. Database
- Apply `supabase/migrations/20261014120000_futurewise_accounts_content.sql` byte-for-byte as one migration.
- Known blocker: the migration tool refuses any SQL that inserts into `storage.buckets` (line 522 creates "content-media"). Planned handling:
  1. First create the public bucket "content-media" with the storage tool (20 MB, image/jpeg, image/png, image/webp, application/pdf).
  2. Try the migration as written. If it is rejected only for the bucket statement, stop and ask before applying it with that one statement removed (everything else unchanged, including the storage.objects policies). The repo file is not edited.
- Then run read-only checks: the 7 tables with RLS on, trigger `on_auth_user_created` on auth.users, the 7 functions, trigger `profiles_bump_marketing_version` on public.profiles, the bucket settings and its admin-only write policies. Run the database linter and report findings (no fixes).

## 2. Authentication
- Email/password on (enable email auth tool). Google and other providers off (social auth tool, only if any are on).
- Confirm email stays ON (auto-confirm false); leaked-password protection on; sign-up stays open.
- Must be set by hand (no tool for them): minimum password length 8, Site URL, the two exact redirect URLs. Exact paths will be given.
- Email templates: branding the Confirm signup / Reset password emails needs a verified sender domain (paid plan). I will check the email domain status and report; no templates are scaffolded unless a domain is ready.

## 3. Secrets
None requested.

## 4. Read-only checks
- Playwright, no sign-ups or form submissions: load /, /industry-resources, /blog, /resources, /survey, /login, /privacy-policy; record console/runtime errors and confirm the header shows "Log in".
- Report: migration result, object checklist, page results, and which auth settings were set vs. need to be set by hand.
