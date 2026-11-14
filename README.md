# Baking Debugged

A baking website where recipes are measured in grams and treated like experiments: what went in, what came out, and why.

This is a work in progress. So far it has a recipe list with sorting and filtering, and a page for each recipe.

## Planned

- Recipe scaling by servings and pan size, with baker's percentages
- Accounts, saved recipes and a personal bake log
- A model trained on logged bakes, and a "why did my bake fail?" explainer
- Ingredient substitutions that explain the chemistry behind a swap

## Tech

- [Next.js](https://nextjs.org) (App Router, JavaScript) and [Tailwind CSS](https://tailwindcss.com)
- Planned: Supabase (database and login), Python (data analysis and ML), Gemini API

## Run it locally

Needs Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project layout

| Path | What it is |
| --- | --- |
| `app/` | Pages. Each folder is a URL; `app/recipes/[id]/` is the recipe page. |
| `components/` | Reusable pieces of UI, such as the recipe list. |
| `lib/` | Data and helper functions, such as the recipes. |
