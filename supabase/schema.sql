-- SafeCircle feed + anonymous auth — run in Supabase Dashboard → SQL Editor.
-- Enable: Authentication → Providers → Anonymous → ON
-- Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (.env.example)

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tag text not null,
  body text not null,
  relates_count integer not null default 0,
  user_id uuid references auth.users (id) on delete set null
);

create table public.replies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  post_id uuid not null references public.posts (id) on delete cascade,
  body text not null,
  display_name text,
  user_id uuid references auth.users (id) on delete set null
);

create index replies_post_id_idx on public.replies (post_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);

alter table public.posts enable row level security;
alter table public.replies enable row level security;

-- Public read; no email or name exposed in the app — only internal user_id on rows.
create policy "posts_select" on public.posts for select using (true);
create policy "replies_select" on public.replies for select using (true);

-- Writes require an authenticated session (including anonymous users) and matching user_id.
create policy "posts_insert_own" on public.posts for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "replies_insert_own" on public.replies for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create or replace function public.increment_post_relates (target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set relates_count = relates_count + 1
  where id = target_id;
end;
$$;

-- Anonymous users are JWT role "authenticated", not "anon".
grant execute on function public.increment_post_relates (uuid) to authenticated;
