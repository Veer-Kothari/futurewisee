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