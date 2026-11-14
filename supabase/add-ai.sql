-- Tables for the AI features: a shared answer cache, daily limits, and
-- recipe embeddings for "find a recipe by describing it".
-- Run this ONCE in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It only adds things; nothing existing changes.

-- pgvector: lets Postgres store embeddings (lists of numbers) and find the
-- closest ones. Supabase has it built in; this switches it on.
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- AI answer cache: the same question is never sent to the API twice.
-- RLS is on with NO policies, so the website's normal keys can't read or
-- write it at all. Only the server, using the secret key, can. That stops
-- anyone planting fake answers that other people would then see.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_cache (
  kind text not null, -- "substitution", "explanation", "search"
  cache_key text not null, -- a fingerprint (hash) of the question
  input jsonb not null, -- the question, for checking later
  output jsonb not null, -- the answer
  model text not null,
  created_at timestamptz not null default now(),
  primary key (kind, cache_key)
);
alter table public.ai_cache enable row level security;

-- ---------------------------------------------------------------------------
-- Daily AI requests per person, to stay inside the free tier and stop one
-- person using it all. Server only, like the cache.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;

-- ---------------------------------------------------------------------------
-- Recipe embeddings: one vector per site recipe, filled by
-- scripts/embed-recipes.mjs (npm run embed). 768 numbers each; must match
-- EMBED_DIMENSIONS in lib/ai/config.js.
-- ---------------------------------------------------------------------------
create table if not exists public.recipe_embeddings (
  recipe_id bigint primary key references public.recipes (id) on delete cascade,
  embedding vector(768) not null,
  -- a fingerprint of the text that was embedded, so unchanged recipes are
  -- skipped next time
  content_hash text not null,
  model text not null,
  updated_at timestamptz not null default now()
);
alter table public.recipe_embeddings enable row level security;
-- Anyone may read embeddings of recipes they can see (the site's own).
grant select on public.recipe_embeddings to anon, authenticated;
create policy "anyone can read embeddings of visible recipes"
  on public.recipe_embeddings for select to anon, authenticated
  using (exists (select 1 from public.recipes where recipes.id = recipe_id));

-- The search itself: the recipes whose embeddings are closest to the
-- question's. "<=>" is pgvector's cosine distance (0 = same direction), so
-- 1 - distance is a similarity from about -1 to 1. "security invoker" runs
-- it with the caller's permissions, so it only sees recipes they can see.
create or replace function public.match_recipes(query_embedding vector(768), match_count integer default 10)
returns table (recipe_id bigint, similarity double precision)
language sql stable security invoker
set search_path = public, extensions
as $$
  select e.recipe_id, 1 - (e.embedding <=> query_embedding) as similarity
  from public.recipe_embeddings e
  join public.recipes r on r.id = e.recipe_id
  where r.owner is null
  order by e.embedding <=> query_embedding
  limit least(match_count, 50);
$$;
grant execute on function public.match_recipes(vector, integer) to anon, authenticated;

-- (No vector index: with about a hundred recipes, checking them all is
-- instant. Add an HNSW index if this ever grows to thousands.)
