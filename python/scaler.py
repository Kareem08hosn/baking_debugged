"""Recipe maths for Baking Debugged: scaling, baker's percentages, hydration.

Run it from the project root:

    python3 python/scaler.py                       # list the recipes
    python3 python/scaler.py --recipe 3            # show one recipe's numbers
    python3 python/scaler.py --recipe 3 --servings 24
    python3 python/scaler.py --recipe 1 --pan rect-33x23   # scale to another pan
    python3 python/scaler.py --pans                        # list the pans

It reads the same data/recipes.json file the website uses. This logic gets
ported to JavaScript for the site's scaling feature, so every function here is
small and works on plain dictionaries and lists (the JSON shapes).

Only the standard library is used, so there is nothing to install.
"""

import argparse
import json
import math
from pathlib import Path

# data/recipes.json, found relative to this file so the script works from any
# folder. parent = python/, parent.parent = the project root.
DATA_FOLDER = Path(__file__).resolve().parent.parent / "data"
RECIPES_PATH = DATA_FOLDER / "recipes.json"
PANS_PATH = DATA_FOLDER / "pans.json"

# How much of an ingredient's weight is water, as a fraction from 0 to 1.
# Hydration counts the water in these. Ingredients that aren't listed count
# as 0, including butter (about 16% water), which bakers leave out by
# convention.
WATER_FRACTION = {
    "water": 1.0,
    "milk": 0.87,
    "buttermilk": 0.9,
    "yogurt": 0.85,
}

# Dried and concentrated milks are not liquid, so they add no water.
NOT_LIQUID = ["powder", "dry", "condensed", "evaporated"]

# Words in an ingredient's note that mean it goes ON the bake, not into the
# dough: "water, for the egg wash", "milk, for the icing".
NOT_IN_DOUGH = ["wash", "glaz", "icing", "frosting", "brushing"]

# A sourdough starter is flour and water mixed together. This assumes a
# "100% hydration" starter: equal weights of each, the most common kind.
STARTER_FLOUR_FRACTION = 0.5
STARTER_WATER_FRACTION = 0.5


def load_recipes(path=RECIPES_PATH):
    """Read the recipes file and return a list of recipe dictionaries."""
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def load_pans(path=PANS_PATH):
    """Read the pans file and return a list of pan dictionaries."""
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def find_pan(pans, pan_id):
    """Return the pan with this id, or None if there isn't one."""
    for pan in pans:
        if pan["id"] == pan_id:
            return pan
    return None


def pan_area(pan):
    """The area of a pan's base in square centimetres.

    Round: pi x radius squared. Rectangle (and square, and loaf tin):
    length x width.
    """
    if pan["shape"] == "round":
        radius = pan["diameter"] / 2
        return math.pi * radius * radius
    return pan["length"] * pan["width"]


def pan_scale_factor(from_pan, to_pan):
    """How much to multiply a recipe by when moving it to another pan.

    It is the ratio of the two base areas, so the batter sits at the same
    depth. 20 cm round -> 33 x 23 cm rectangle is about 2.4.
    """
    return pan_area(to_pan) / pan_area(from_pan)


def find_recipe(recipes, recipe_id):
    """Return the recipe with this id, or None if there isn't one."""
    for recipe in recipes:
        if recipe["id"] == recipe_id:
            return recipe
    return None


def round_half_up(number):
    """Round to a whole number, with .5 always going up (112.5 -> 113).

    Python's built-in round() sends .5 to the nearest EVEN number instead
    (round(112.5) is 112), which surprises people and differs from
    JavaScript's Math.round. This matches Math.round, so the JavaScript port
    of this file gives the same amounts.
    """
    return math.floor(number + 0.5)


def round_amount(amount, unit):
    """Round an amount to something you can measure.

    Grams round to the nearest gram (or 0.1 g below 10 g, where a whole gram
    is a big difference, e.g. salt and baking soda). Counts round to the
    nearest half, because half an egg is doable and 0.37 of an egg isn't.
    """
    if unit == "count":
        return round_half_up(amount * 2) / 2
    if amount < 10:
        return round_half_up(amount * 10) / 10
    return round_half_up(amount)


def scale_recipe(recipe, new_servings):
    """Return a copy of the recipe with every amount scaled to new_servings.

    The original recipe is not changed. Bake time is NOT scaled: it depends
    on the size and shape of what goes in the oven, not on the total amount.
    """
    if new_servings <= 0:
        raise ValueError("servings must be more than 0")

    factor = new_servings / recipe["servings"]

    scaled_ingredients = []
    for ingredient in recipe["ingredients"]:
        scaled_ingredients.append(
            {
                "name": ingredient["name"],
                "amount": round_amount(
                    ingredient["amount"] * factor, ingredient["unit"]
                ),
                "unit": ingredient["unit"],
            }
        )

    # {**recipe, ...} copies the recipe and replaces the two keys listed.
    return {**recipe, "servings": new_servings, "ingredients": scaled_ingredients}


def is_flour(ingredient):
    """True for any flour: "flour", "bread flour", "whole wheat flour"..."""
    return "flour" in ingredient["name"].lower()


def is_starter(ingredient):
    return "starter" in ingredient["name"].lower()


def flour_weight(recipe):
    """Total grams of the ingredients that are flour."""
    total = 0
    for ingredient in recipe["ingredients"]:
        if ingredient["unit"] == "g" and is_flour(ingredient):
            total += ingredient["amount"]
    return total


def bakers_percentages(recipe):
    """Each ingredient's weight as a percentage of the flour weight.

    This is how bakers write formulas: flour is always 100%, and everything
    else is measured against it. Water at 75% means 75 g of water for every
    100 g of flour. It makes recipes easy to compare and to scale.

    Returns a list of { name, percent }. Ingredients measured by count (eggs)
    have no weight in the data, so they are left out. Returns an empty list
    if the recipe has no flour.
    """
    flour = flour_weight(recipe)
    if flour == 0:
        return []

    percentages = []
    for ingredient in recipe["ingredients"]:
        if ingredient["unit"] != "g":
            continue
        percentages.append(
            {
                "name": ingredient["name"],
                "percent": round(ingredient["amount"] / flour * 100, 1),
            }
        )
    return percentages


def water_fraction(ingredient):
    """How much of this ingredient's weight counts as water, from 0 to 1.

    Recipes rarely say just "water": they say "lukewarm water" or "whole
    milk". So the liquid is found from the LAST word of the name, after
    dropping any note that follows a comma: "milk, for the tangzhong" -> "milk".
    """
    # partition(",") splits at the first comma: (before, ",", after)
    main, _, note = ingredient["name"].lower().partition(",")

    if any(word in note for word in NOT_IN_DOUGH):
        return 0
    if any(word in main for word in NOT_LIQUID):
        return 0

    # "lukewarm water" -> ["lukewarm", "water"] -> "water"
    last_word = main.strip().split(" ")[-1]
    # .get(word, 0) looks the word up and gives 0 if it isn't there.
    return WATER_FRACTION.get(last_word, 0)


def hydration(recipe):
    """Water as a percentage of flour: the main number for bread dough.

    Higher hydration means a wetter dough: roughly 60% is a stiff sandwich
    loaf and 75% or more is an open, holey crumb.

    What is counted:
      - water and milk, by how much of each is water (WATER_FRACTION)
      - sourdough starter, split into its flour and its water
    What is not counted: eggs (measured by count, so no weight), butter, and
    liquid that goes on the outside (an egg wash, a glaze).

    Returns None if the recipe has no flour.
    """
    flour = 0
    water = 0
    for ingredient in recipe["ingredients"]:
        if ingredient["unit"] != "g":
            continue
        amount = ingredient["amount"]

        if is_starter(ingredient):
            flour += amount * STARTER_FLOUR_FRACTION
            water += amount * STARTER_WATER_FRACTION
        elif is_flour(ingredient):
            flour += amount
        else:
            water += amount * water_fraction(ingredient)

    if flour == 0:
        return None
    return round(water / flour * 100, 1)


def format_amount(ingredient):
    """ "250 g" for grams, "2" for counts. :g drops a trailing ".0"."""
    if ingredient["unit"] == "count":
        return f"{ingredient['amount']:g}"
    return f"{ingredient['amount']:g} {ingredient['unit']}"


def print_recipe(recipe):
    """Print a recipe's ingredients, baker's percentages and hydration."""
    print(f"{recipe['name']} (serves {recipe['servings']:g})")
    print()

    # Look up each ingredient's percentage by name.
    percent_by_name = {}
    for row in bakers_percentages(recipe):
        percent_by_name[row["name"]] = row["percent"]

    # :<22 pads text to 22 characters on the left; :>8 right-aligns in 8.
    print(f"{'ingredient':<22}{'amount':>8}{'baker %':>10}")
    for ingredient in recipe["ingredients"]:
        percent = percent_by_name.get(ingredient["name"])
        percent_text = "" if percent is None else f"{percent:g}%"
        print(
            f"{ingredient['name']:<22}{format_amount(ingredient):>8}{percent_text:>10}"
        )

    print()
    recipe_hydration = hydration(recipe)
    if recipe_hydration is None:
        print("Hydration: not available (no flour)")
    else:
        print(f"Hydration: {recipe_hydration:g}%")


def main():
    # argparse reads the options typed after the script name.
    parser = argparse.ArgumentParser(description="Scale a recipe and show its ratios.")
    parser.add_argument("--recipe", type=int, help="id of the recipe to show")
    parser.add_argument("--servings", type=float, help="scale the recipe to this many servings")
    parser.add_argument("--pan", help="scale the recipe to this pan (an id from --pans)")
    # action="store_true" makes --pans a switch: True if typed, False if not.
    parser.add_argument("--pans", action="store_true", help="list the pans")
    args = parser.parse_args()

    recipes = load_recipes()
    pans = load_pans()

    if args.pans:
        for pan in pans:
            print(f"  {pan['id']:<12}{pan['label']}")
        return

    if args.servings is not None and args.pan is not None:
        raise SystemExit("Use --servings or --pan, not both")

    if args.recipe is None:
        print("Recipes (pass --recipe ID to see one):")
        for recipe in recipes:
            print(f"  {recipe['id']}: {recipe['name']}")
        return

    recipe = find_recipe(recipes, args.recipe)
    if recipe is None:
        # SystemExit with a message prints it and stops with an error code.
        raise SystemExit(f"No recipe with id {args.recipe}")

    if args.pan is not None:
        to_pan = find_pan(pans, args.pan)
        if to_pan is None:
            raise SystemExit(f"No pan with id {args.pan} (see --pans)")
        # .get("pan") gives None if the recipe has no "pan" key at all.
        from_pan = find_pan(pans, recipe.get("pan"))
        if from_pan is None:
            raise SystemExit(f"{recipe['name']} isn't baked in a pan, so it can't be scaled to one")
        # Scaling to a pan is scaling to however many servings fit in it.
        factor = pan_scale_factor(from_pan, to_pan)
        args.servings = round_half_up(recipe["servings"] * factor * 10) / 10
        print(f"{from_pan['label']} -> {to_pan['label']}: x{factor:.2f}")
        print()

    if args.servings is not None:
        try:
            recipe = scale_recipe(recipe, args.servings)
        except ValueError as error:
            raise SystemExit(f"Can't scale: {error}")

    print_recipe(recipe)


# Only run main() when this file is run directly, not when another file
# (like the tests) imports it.
if __name__ == "__main__":
    main()
