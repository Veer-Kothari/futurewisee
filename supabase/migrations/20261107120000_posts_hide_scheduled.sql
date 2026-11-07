-- Posts read through the public API: only what the site itself shows.
-- Before this, anyone with the publishable key could read a published post
-- scheduled for later (published_at in the future) or one in the hidden
-- my-journey section; only the site's own queries filtered those out.
-- Admins still see everything, so the editor can preview scheduled posts.

drop policy if exists "posts: read published (visitors)" on public.posts;
create policy "posts: read published (visitors)" on public.posts
  for select to anon
  using (published and published_at <= now() and category <> 'my-journey');

drop policy if exists "posts: read published or admin" on public.posts;
create policy "posts: read published or admin" on public.posts
  for select to authenticated
  using (
    (published and published_at <= now() and category <> 'my-journey')
    or public.has_role(auth.uid(), 'admin')
  );
