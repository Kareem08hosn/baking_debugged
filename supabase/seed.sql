-- Baking Debugged: the starter recipes (placeholders until the real ones).
-- Run this once in the Supabase SQL Editor, after schema.sql.
-- Generated from data/recipes.json.

insert into public.recipes
  (id, name, category, difficulty, prep_time, bake_time, servings, pan, rating,
   diet, ingredients, instructions)
values
  (1, 'Banana Bread', 'bread', 'easy', 15, 60, 10, 'loaf-23x13', 4.5, 
    array['vegetarian']::text[], 
    '[{"name": "ripe bananas", "amount": 350, "unit": "g"}, {"name": "flour", "amount": 250, "unit": "g"}, {"name": "sugar", "amount": 150, "unit": "g"}, {"name": "butter", "amount": 115, "unit": "g"}, {"name": "eggs", "amount": 2, "unit": "count"}, {"name": "baking soda", "amount": 5, "unit": "g"}, {"name": "salt", "amount": 3, "unit": "g"}]'::jsonb, 
    array['Heat the oven to 175°C and line a loaf tin.', 'Mash the bananas, then stir in the melted butter, sugar and eggs.', 'Fold in the flour, baking soda and salt until just combined.', 'Pour into the tin and bake for 60 minutes, until a skewer comes out clean.', 'Cool in the tin for 10 minutes, then turn out onto a rack.']::text[]),
  (2, 'Chocolate Chip Cookies', 'cookies', 'easy', 20, 12, 24, null, 4.8, 
    array['vegetarian']::text[], 
    '[{"name": "flour", "amount": 280, "unit": "g"}, {"name": "butter", "amount": 225, "unit": "g"}, {"name": "brown sugar", "amount": 200, "unit": "g"}, {"name": "sugar", "amount": 100, "unit": "g"}, {"name": "eggs", "amount": 2, "unit": "count"}, {"name": "chocolate chips", "amount": 300, "unit": "g"}, {"name": "baking soda", "amount": 5, "unit": "g"}, {"name": "salt", "amount": 4, "unit": "g"}]'::jsonb, 
    array['Heat the oven to 190°C and line two baking trays.', 'Beat the softened butter with both sugars until pale, then beat in the eggs.', 'Mix in the flour, baking soda and salt, then stir in the chocolate chips.', 'Scoop balls of dough onto the trays, leaving space between them.', 'Bake for 12 minutes, until the edges are golden and the centres still soft.']::text[]),
  (3, 'Sourdough Loaf', 'bread', 'hard', 40, 45, 12, null, 4.2, 
    array['vegetarian', 'vegan']::text[], 
    '[{"name": "bread flour", "amount": 500, "unit": "g"}, {"name": "water", "amount": 375, "unit": "g"}, {"name": "sourdough starter", "amount": 100, "unit": "g"}, {"name": "salt", "amount": 10, "unit": "g"}]'::jsonb, 
    array['Mix the flour and water and rest for 30 minutes.', 'Add the starter and salt and mix until fully combined.', 'Let the dough rise for 4 to 5 hours, stretching and folding it every 45 minutes for the first 3 hours.', 'Shape into a tight round, place in a floured basket and refrigerate overnight.', 'Heat the oven to 230°C with a lidded pot inside.', 'Score the loaf, bake in the pot for 25 minutes with the lid on, then 20 minutes with it off.']::text[]),
  (4, 'Lemon Drizzle Cake', 'cake', 'medium', 20, 50, 10, 'loaf-23x13', 4, 
    array['vegetarian']::text[], 
    '[{"name": "flour", "amount": 225, "unit": "g"}, {"name": "sugar", "amount": 225, "unit": "g"}, {"name": "butter", "amount": 225, "unit": "g"}, {"name": "eggs", "amount": 4, "unit": "count"}, {"name": "baking powder", "amount": 10, "unit": "g"}, {"name": "lemons", "amount": 2, "unit": "count"}, {"name": "icing sugar", "amount": 85, "unit": "g"}]'::jsonb, 
    array['Heat the oven to 180°C and line a loaf tin.', 'Beat the softened butter and sugar until pale, then beat in the eggs one at a time.', 'Fold in the flour, baking powder and the zest of both lemons.', 'Pour into the tin and bake for 50 minutes, until a skewer comes out clean.', 'Mix the lemon juice with the icing sugar and pour it over the warm cake.']::text[]);

-- The ids above were set by hand. This tells the database to continue
-- numbering after the highest one, so the next new recipe gets id 5.
select setval(
  pg_get_serial_sequence('public.recipes', 'id'),
  (select max(id) from public.recipes)
);
