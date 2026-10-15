-- FutureWise: accounts, survey responses, resource click tracking, and the
-- content Veer edits in /admin (blog posts and Industry Insights items).
--
-- Idempotent: every statement can run again on a database that already has
-- it (Lovable may re-apply this file as its own migration).
--
-- Who can do what (RLS):
--   anon            reads published posts and insight items. Nothing else.
--   authenticated   reads their own profile and edits their name,
--                   reads their own survey answers, clicks and roles.
--   admin role      (user_roles) everything on posts, insight items and the
--                   content-media bucket; reads all profiles, survey answers
--                   and clicks; admin_click_counts().
--   service role    the site's server functions: survey answers, claims,
--                   clicks, rate limits, account deletion.
-- Nobody gets the admin role from the site: it is granted by SQL only.

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'app_role' and n.nspname = 'public') then
    create type public.app_role as enum ('admin');
  end if;
end
$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;
revoke insert, update, delete, truncate on public.user_roles from anon, authenticated;
revoke all on public.user_roles from anon;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- Visitors never need it (their read policies don't call it), so they can't
-- call it either; signed-in users need it inside their RLS policies.
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

drop policy if exists "user_roles: read own" on public.user_roles;
create policy "user_roles: read own" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one per account; created by the sign-up trigger)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  marketing_opt_in boolean not null default false,
  age_confirmed boolean not null default false,
  -- Set only by the server (reconcileMarketing): when this account was last
  -- synced to Mailchimp, and whether its survey-completed tag was added.
  mailchimp_synced_at timestamptz,
  mailchimp_survey_tagged boolean not null default false,
  -- true once this account has created a Mailchimp member (kept after an
  -- opt-out), so deleting the account also deletes that member.
  mailchimp_member boolean not null default false,
  -- The choice last confirmed in Mailchimp (null = never synced or unknown).
  mailchimp_synced_choice boolean,
  -- Bumped by a trigger whenever marketing_opt_in changes, so a sync that
  -- read an older choice can't record itself as the current state.
  marketing_version integer not null default 0,
  -- An explicit "email me" that Mailchimp hasn't confirmed yet (re-subscribe
  -- is retried until it works; plain sign-ins never re-subscribe on their own).
  mailchimp_resubscribe_pending boolean not null default false,
  -- Short lease so only one Mailchimp sync per account runs at a time.
  mailchimp_lock_until timestamptz,
  mailchimp_lock_owner uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists mailchimp_synced_at timestamptz;
alter table public.profiles add column if not exists mailchimp_survey_tagged boolean not null default false;
alter table public.profiles add column if not exists mailchimp_member boolean not null default false;
alter table public.profiles add column if not exists mailchimp_synced_choice boolean;
alter table public.profiles add column if not exists marketing_version integer not null default 0;
alter table public.profiles add column if not exists mailchimp_resubscribe_pending boolean not null default false;
alter table public.profiles add column if not exists mailchimp_lock_until timestamptz;
alter table public.profiles add column if not exists mailchimp_lock_owner uuid;
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
revoke insert, update, delete, truncate on public.profiles from authenticated;
grant select on public.profiles to authenticated;
-- The account holder can change their name only. The email choice
-- (marketing_opt_in) and the mailchimp_* columns change through the server
-- functions, which keep Mailchimp in step with the stored consent.
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.bump_marketing_version()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    new.marketing_version = old.marketing_version + 1;
  end if;
  return new;
end;
$$;
revoke all on function public.bump_marketing_version() from public, anon, authenticated;

drop trigger if exists profiles_bump_marketing_version on public.profiles;
create trigger profiles_bump_marketing_version
  before update on public.profiles
  for each row execute function public.bump_marketing_version();

-- One Mailchimp sync per account at a time (service role only). The lease
-- expires on its own, so a crashed run can't block the account for long.
create or replace function public.acquire_mailchimp_lock(_user uuid, _owner uuid, _seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  got uuid;
begin
  update public.profiles
     set mailchimp_lock_until = now() + make_interval(secs => greatest(1, least(_seconds, 300))),
         mailchimp_lock_owner = _owner
   where id = _user
     and (mailchimp_lock_until is null or mailchimp_lock_until < now()
          or mailchimp_lock_owner = _owner)
  returning id into got;
  return got is not null;
end;
$$;

create or replace function public.release_mailchimp_lock(_user uuid, _owner uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set mailchimp_lock_until = null, mailchimp_lock_owner = null
   where id = _user and mailchimp_lock_owner = _owner;
$$;

revoke all on function public.acquire_mailchimp_lock(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.release_mailchimp_lock(uuid, uuid) from public, anon, authenticated;
grant execute on function public.acquire_mailchimp_lock(uuid, uuid, integer) to service_role;
grant execute on function public.release_mailchimp_lock(uuid, uuid) to service_role;

-- Sign-up: the age confirmation is required here, on the server, not only in
-- the form (16 or older, or a parent/guardian agreed).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'age_confirmed', '') <> 'true' then
    raise exception 'age_confirmation_required' using errcode = 'P0001';
  end if;

  -- Ticking "email me" at sign-up is an explicit choice, so it may re-subscribe
  -- an address that had unsubscribed before.
  insert into public.profiles (id, full_name, marketing_opt_in, age_confirmed, mailchimp_resubscribe_pending)
  values (
    new.id,
    left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120),
    coalesce(new.raw_user_meta_data ->> 'marketing_opt_in', '') = 'true',
    true,
    coalesce(new.raw_user_meta_data ->> 'marketing_opt_in', '') = 'true'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Survey responses (written only by the submitSurvey/claim server functions)
-- ---------------------------------------------------------------------------
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  source text not null check (char_length(source) between 1 and 60),
  respondent_role text not null check (char_length(respondent_role) between 1 and 60),
  industries text[] not null check (cardinality(industries) between 1 and 12),
  needs text[] not null check (cardinality(needs) between 1 and 12),
  confidence smallint not null check (confidence between 1 and 5),
  claim_token_hash text check (claim_token_hash is null or claim_token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
create index if not exists survey_responses_user_id_idx on public.survey_responses (user_id);
create index if not exists survey_responses_created_at_idx on public.survey_responses (created_at desc);
alter table public.survey_responses enable row level security;
revoke all on public.survey_responses from anon;
revoke insert, update, delete, truncate on public.survey_responses from authenticated;
grant select on public.survey_responses to authenticated;

drop policy if exists "survey_responses: read own or admin" on public.survey_responses;
create policy "survey_responses: read own or admin" on public.survey_responses
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Resource clicks (written only by the trackResourceClick server function)
-- ---------------------------------------------------------------------------
create table if not exists public.resource_clicks (
  id bigint generated always as identity primary key,
  resource_id text not null check (resource_id ~ '^[a-z0-9-]{1,80}$'),
  user_id uuid references public.profiles (id) on delete set null,
  source_path text check (source_path is null or char_length(source_path) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists resource_clicks_resource_created_idx
  on public.resource_clicks (resource_id, created_at desc);
create index if not exists resource_clicks_created_at_idx on public.resource_clicks (created_at desc);
create index if not exists resource_clicks_user_id_idx on public.resource_clicks (user_id);
alter table public.resource_clicks enable row level security;
revoke all on public.resource_clicks from anon;
revoke insert, update, delete, truncate on public.resource_clicks from authenticated;
grant select on public.resource_clicks to authenticated;

drop policy if exists "resource_clicks: read own or admin" on public.resource_clicks;
create policy "resource_clicks: read own or admin" on public.resource_clicks
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create or replace function public.admin_click_counts()
returns table (
  resource_id text,
  total_clicks bigint,
  signed_in_clicks bigint,
  unique_users bigint,
  last_click_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return query
    select c.resource_id,
           count(*)::bigint,
           count(c.user_id)::bigint,
           count(distinct c.user_id)::bigint,
           max(c.created_at)
      from public.resource_clicks c
     group by c.resource_id
     order by count(*) desc, c.resource_id;
end;
$$;
revoke all on function public.admin_click_counts() from public, anon;
grant execute on function public.admin_click_counts() to authenticated;

-- ---------------------------------------------------------------------------
-- Blog posts (Veer's editor)
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (char_length(slug) <= 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  category text not null check (category in ('personal-finance', 'practical-skills', 'my-journey')),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 80),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body text not null default '' check (char_length(body) <= 50000),
  cover_image_url text
    check (cover_image_url is null or (char_length(cover_image_url) <= 500 and cover_image_url ~ '^https://')),
  cover_image_alt text not null default '' check (char_length(cover_image_alt) <= 200),
  video_url text
    check (video_url is null or (char_length(video_url) <= 500 and video_url ~ '^https://')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (published, published_at desc);
alter table public.posts enable row level security;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

drop policy if exists "posts: read published (visitors)" on public.posts;
create policy "posts: read published (visitors)" on public.posts
  for select to anon
  using (published);

drop policy if exists "posts: read published or admin" on public.posts;
create policy "posts: read published or admin" on public.posts
  for select to authenticated
  using (published or public.has_role(auth.uid(), 'admin'));

drop policy if exists "posts: admin insert" on public.posts;
create policy "posts: admin insert" on public.posts
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "posts: admin update" on public.posts;
create policy "posts: admin update" on public.posts
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "posts: admin delete" on public.posts;
create policy "posts: admin delete" on public.posts
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.published and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists posts_set_published_at on public.posts;
create trigger posts_set_published_at
  before insert or update on public.posts
  for each row execute function public.set_published_at();

-- ---------------------------------------------------------------------------
-- Industry Insights items (videos, course material, guides, links)
-- ---------------------------------------------------------------------------
create table if not exists public.insight_items (
  id uuid primary key default gen_random_uuid(),
  industry text not null check (industry in (
    'law', 'entrepreneurship', 'investment-banking-and-trading', 'other-finance',
    'tax', 'economics', 'operations'
  )),
  kind text not null check (kind in ('video', 'course', 'guide', 'link')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  summary text not null default '' check (char_length(summary) <= 500),
  body text not null default '' check (char_length(body) <= 30000),
  video_url text
    check (video_url is null or (char_length(video_url) <= 500 and video_url ~ '^https://')),
  link_url text
    check (link_url is null or (char_length(link_url) <= 500 and link_url ~ '^https://')),
  file_url text
    check (file_url is null or (char_length(file_url) <= 500 and file_url ~ '^https://')),
  file_name text check (file_name is null or char_length(file_name) <= 200),
  position integer not null default 0 check (position between 0 and 10000),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists insight_items_industry_idx
  on public.insight_items (industry, published, position);
alter table public.insight_items enable row level security;
grant select on public.insight_items to anon, authenticated;
grant insert, update, delete on public.insight_items to authenticated;

drop policy if exists "insight_items: read published (visitors)" on public.insight_items;
create policy "insight_items: read published (visitors)" on public.insight_items
  for select to anon
  using (published);

drop policy if exists "insight_items: read published or admin" on public.insight_items;
create policy "insight_items: read published or admin" on public.insight_items
  for select to authenticated
  using (published or public.has_role(auth.uid(), 'admin'));

drop policy if exists "insight_items: admin insert" on public.insight_items;
create policy "insight_items: admin insert" on public.insight_items
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "insight_items: admin update" on public.insight_items;
create policy "insight_items: admin update" on public.insight_items
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "insight_items: admin delete" on public.insight_items;
create policy "insight_items: admin delete" on public.insight_items
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists insight_items_set_updated_at on public.insight_items;
create trigger insight_items_set_updated_at
  before update on public.insight_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Rate limits for the server functions (service role only)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('survey', 'claim', 'click', 'newsletter', 'account')),
  ip text not null check (char_length(ip) <= 100),
  at timestamptz not null default now()
);
create index if not exists rate_events_kind_ip_at_idx on public.rate_events (kind, ip, at desc);
alter table public.rate_events enable row level security;
revoke all on public.rate_events from anon, authenticated;

-- true when this IP already has p_max attempts of p_kind in the last
-- p_minutes (request refused). With p_record, an allowed attempt is recorded
-- in the same locked step so a burst can't slip past the limit.
create or replace function public.rate_attempt(
  p_kind text, p_ip text, p_max integer, p_minutes integer, p_record boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_kind || ':' || p_ip));
  select count(*) into n
    from public.rate_events
   where kind = p_kind and ip = p_ip and at >= now() - make_interval(mins => p_minutes);
  if n >= p_max then
    return true;
  end if;
  if p_record then
    insert into public.rate_events (kind, ip) values (p_kind, p_ip);
  end if;
  return false;
end;
$$;
revoke all on function public.rate_attempt(text, text, integer, integer, boolean)
  from public, anon, authenticated;
grant execute on function public.rate_attempt(text, text, integer, integer, boolean) to service_role;

-- Attempt rows hold IP addresses: deleted hourly once a day old (privacy
-- page). Needs pg_cron; without it the migration still succeeds and the
-- server functions' own clean-up is the fallback.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'fw-rate-events-cleanup';
  perform cron.schedule(
    'fw-rate-events-cleanup',
    '17 * * * *',
    'delete from public.rate_events where at < now() - interval ''1 day'''
  );
exception when others then
  raise notice 'pg_cron not available, hourly clean-up not scheduled: %', sqlerrm;
end
$$;

-- ---------------------------------------------------------------------------
-- Storage: cover images and course material uploaded in /admin
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media', 'content-media', true, 20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "content-media: admin read" on storage.objects;
create policy "content-media: admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'content-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "content-media: admin insert" on storage.objects;
create policy "content-media: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'content-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "content-media: admin update" on storage.objects;
create policy "content-media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'content-media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'content-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "content-media: admin delete" on storage.objects;
create policy "content-media: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'content-media' and public.has_role(auth.uid(), 'admin'));
