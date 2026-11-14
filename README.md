# Baking Debugged

A baking website where recipes are measured in grams and treated like experiments: what went in, what came out, and why.

This is a work in progress. So far it has a recipe list with sorting and filtering, a page for each recipe with scaling (by servings or pan size) and unit conversion, and a form for adding recipes.

## Planned

- Accounts, saved recipes and a personal bake log
- A model trained on logged bakes, and a "why did my bake fail?" explainer
- Ingredient substitutions that explain the chemistry behind a swap

## Tech

- [Next.js](https://nextjs.org) (App Router, JavaScript) and [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres database)
- Python for the recipe maths (`python/scaler.py`), mirrored in JavaScript (`lib/scaler.js`)
- Planned: Supabase login, data analysis and ML in Python, Gemini API

## Run it locally

Needs Node.js 20.9 or newer.

Recipes are stored in a [Supabase](https://supabase.com) database, so you need a free Supabase project:

1. In the Supabase SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
2. Create a `.env.local` file in the project folder with your project's values (from the dashboard's Connect button):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Install and start:

   ```bash
   npm install
   npm run dev
   ```

Then open http://localhost:3000.

Tests: `npm test` (JavaScript) and `python3 -m unittest discover python` (Python).

## Project layout

| Path | What it is |
| --- | --- |
| `app/` | Pages. Each folder is a URL; `app/recipes/[id]/` is the recipe page. |
| `components/` | Reusable pieces of UI, such as the recipe list. |
| `lib/` | Data access and helper functions: recipes, scaling, unit conversion. |
| `data/` | JSON shared by the site and the Python scripts. |
| `python/` | Python scripts and their tests. |
| `supabase/` | SQL that creates and fills the database. |
