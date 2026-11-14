-- Lets signed-in people save their own recipes in the recipes table.
-- Run this ONCE in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It only ADDS things; it doesn't change or delete any existing recipe.
--
-- How it works:
--   owner = null        a site recipe: everyone can read it, nobody can change it
--   owner = a user's id  that person's recipe: only they can read, change or delete it
-- Users' recipes are private for now, so nobody can post spam that others see.

-- 1. Who a recipe belongs to. "references auth.users" links it to Supabase's
--    list of accounts; "on delete cascade" removes someone's recipes if their
--    account is deleted. "default auth.uid()" fills in whoever is signed in.
alter table public.recipes
  add column if not exists owner uuid
  references auth.users (id) on delete cascade
  default auth.uid();

-- An index makes "find this person's recipes" fast.
create index if not exists recipes_owner_idx on public.recipes (owner);

-- 2. Reading. The old policy let anyone read every row; replace it with two.
--    (select auth.uid()) is the id of the signed-in user, or null.
drop policy if exists "anyone can read recipes" on public.recipes;

create policy "anyone can read site recipes"
  on public.recipes
  for select
  to anon, authenticated
  using (owner is null);

create policy "people can read their own recipes"
  on public.recipes
  for select
  to authenticated
  using (owner = (select auth.uid()));

-- 3. Writing: only signed-in people, and only rows that are theirs.
--    "with check" is tested on the new row: you can't insert a recipe under
--    someone else's id, or hand your recipe to someone else.
grant insert, update, delete on public.recipes to authenticated;

create policy "people can add their own recipes"
  on public.recipes
  for insert
  to authenticated
  with check (owner = (select auth.uid()));

create policy "people can change their own recipes"
  on public.recipes
  for update
  to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

create policy "people can delete their own recipes"
  on public.recipes
  for delete
  to authenticated
  using (owner = (select auth.uid()));
