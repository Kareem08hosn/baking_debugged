-- Favourites: the recipes each person has saved with the Save button.
-- Run this ONCE in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It only adds a new table; nothing existing changes.

-- One row per (person, recipe) pair. The primary key on both columns means
-- the same recipe can't be saved twice by the same person.
create table if not exists public.favourites (
  -- who saved it: filled in automatically with whoever is signed in
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  -- which recipe; if the recipe is deleted, its favourites go too
  recipe_id bigint not null
    references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.favourites enable row level security;

-- Signed-in people only. There is no update policy: a favourite is either
-- there or not, so it is only ever added or deleted.
grant select, insert, delete on public.favourites to authenticated;

create policy "people can see their own favourites"
  on public.favourites
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- You can only save recipes you can see. The "exists" check runs with your
-- own permissions, so someone else's private recipe doesn't count.
create policy "people can save recipes they can see"
  on public.favourites
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes where recipes.id = recipe_id)
  );

create policy "people can remove their own favourites"
  on public.favourites
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
