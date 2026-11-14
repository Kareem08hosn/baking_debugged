# Baking Debugged

A baking website that treats every bake as an experiment: recipes measured in grams, the chemistry of why bakes work or fail, a personal bake log, and tools to find out what went wrong.

## What it does

- **Recipes** in grams, each scaling to your servings or pan, converting to cups or millilitres, with baker’s percentages and a hydration gauge for bread.
- **Chemistry notes**: eight short explainers (leaveners, gluten, hydration, sugar, fats, eggs, browning, oven temperature), each with a diagram, a “what goes wrong if…” list and recipes that show it.
- **Bake debugger**: pick what you baked and what went wrong; a rules engine built from baking chemistry ranks the likely causes, shows which of your answers pointed there, and says what to change.
- **Lab tools**: a recipe scaler, a pan-size converter, a unit and oven-temperature converter, and high-altitude adjustments.
- **What can I make?**: type what’s in your kitchen and see which recipes fit.
- **Accounts** (magic-link sign-in): your own private recipes, saved recipes, notes on any recipe, preferences, and a **bake log** with CSV import and export.
- **AI features (switched off until a Gemini key is set)**: substitutions with the chemistry behind each swap, plain-language explanations of a debug report, and finding a recipe by describing it (embeddings + pgvector). Each one already works without AI: a curated swap table, the rules engine, and keyword search.
- **Data analysis** (Python): a notebook that asks which measurements go with good bakes, with cross-validated models that must beat a baseline to count.

## Tech

- [Next.js](https://nextjs.org) 16 (App Router, plain JavaScript) and [Tailwind CSS](https://tailwindcss.com) 4
- [Supabase](https://supabase.com): Postgres, magic-link auth, Row Level Security on every table, pgvector
- Google Gemini API (planned to switch on), called from the server with `fetch`; answers cached in the database and rate-limited per person
- Python: `python/scaler.py` (recipe maths, mirrored in `lib/scaler.js` with matching tests), pandas and scikit-learn for the analysis

## How it’s organised

| Folder | What’s in it |
| --- | --- |
| `app/` | Pages and server actions (one folder per page) |
| `components/` | React components, grouped by page where they belong to one |
| `lib/` | Plain JavaScript logic with no React: scaling, units, the debugger rules, CSV, validation, AI prompts. Most files have a `.test.js` beside them |
| `lib/supabase/` | The three Supabase clients: public (anonymous), server (signed-in), browser; plus a server-only admin client for the AI cache |
| `supabase/` | SQL: `schema.sql` for a fresh database, plus the step-by-step migration files |
| `python/` | The recipe scaler, the analysis notebook and its helpers |
| `data/` | The starter recipes and pan sizes shared by the site and Python |

Public pages are built once and reused for everyone; anything personal is fetched for the signed-in person only, and the database’s policies decide what each person can read or change.

## Run it locally

Needs Node.js 20.9 or newer.

1. Create a free Supabase project. In its SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql` (the starter recipes).
2. Copy `.env.example` to `.env.local` and fill in at least the two `NEXT_PUBLIC_SUPABASE_` values (Project Settings → API keys).
3. In Supabase → Authentication → Email templates, make the Magic Link and Confirm signup links point to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`, and set the Site URL to `http://localhost:3000`.
4. Install and start:

   ```bash
   npm install
   npm run dev
   ```

   Then open http://localhost:3000.

### Switching on the AI features

Set `GEMINI_API_KEY` and `SUPABASE_SECRET_KEY` in `.env.local` (server-only, never `NEXT_PUBLIC_`), run `supabase/add-ai.sql` if your database predates it, then `npm run embed` to build the recipe embeddings.

## Tests and checks

```bash
npm test          # JavaScript tests (Node's built-in test runner)
npm run lint
npm run build
python3 -m unittest discover python   # scaler tests (standard library only)
```

## Data analysis

```bash
python3 -m venv .venv
.venv/bin/pip install -r python/requirements.txt
.venv/bin/python -m unittest discover python      # all Python tests
.venv/bin/jupyter notebook python/bake_analysis.ipynb
```

The notebook reads `python/data/bakes.csv`, the CSV exported from the site’s bake log (git-ignored: it’s personal data). Without it, it runs on `python/data/demo_bakes.csv`, a made-up log with a planted pattern so the method can be checked.

## Credits

The starter recipes are adapted (converted to grams, instructions rewritten) from recipes published by King Arthur Baking. Each recipe page links to its original and is marked “untested”, with no rating, until it has been baked here. Other sites’ star ratings are never shown.
