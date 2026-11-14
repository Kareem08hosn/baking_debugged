-- Run this ONCE in the Supabase SQL Editor if the recipes table already exists
-- (a fresh database gets these columns from schema.sql). Then run seed.sql.
alter table public.recipes add column if not exists source jsonb;
alter table public.recipes add column if not exists tested boolean not null default false;
