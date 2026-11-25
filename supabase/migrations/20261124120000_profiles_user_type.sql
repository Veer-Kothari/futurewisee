-- Who signed up: student, parent or organization (Veer and Rustam, Nov 2026).
-- Used to tag subscribers in Kit and shown in /admin → Sign-ups. Accounts made
-- before this stay null. Run this before deploying the code that reads it; the
-- code already live ignores it. Safe to run twice.

alter table public.profiles add column if not exists user_type text;

alter table public.profiles drop constraint if exists profiles_user_type_check;
alter table public.profiles add constraint profiles_user_type_check
  check (user_type in ('student', 'parent', 'organization'));

-- Same as before, plus user_type. Any other value is stored as null, so an
-- older cached form can still create an account.
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
  insert into public.profiles (
    id, full_name, marketing_opt_in, age_confirmed, mailchimp_resubscribe_pending, user_type
  )
  values (
    new.id,
    left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120),
    coalesce(new.raw_user_meta_data ->> 'marketing_opt_in', '') = 'true',
    true,
    coalesce(new.raw_user_meta_data ->> 'marketing_opt_in', '') = 'true',
    case
      when new.raw_user_meta_data ->> 'user_type' in ('student', 'parent', 'organization')
        then new.raw_user_meta_data ->> 'user_type'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
