-- Run this ONLY if you already created posts/replies without user_id (older schema.sql).
-- New projects should use the current schema.sql only.

alter table public.posts add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.replies add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists posts_user_id_idx on public.posts (user_id);

drop policy if exists "posts_insert" on public.posts;
drop policy if exists "replies_insert" on public.replies;

create policy "posts_insert_own" on public.posts for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "replies_insert_own" on public.replies for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

revoke execute on function public.increment_post_relates (uuid) from anon;
grant execute on function public.increment_post_relates (uuid) to authenticated;
