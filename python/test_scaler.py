"""Tests for scaler.py. Run from the project root:

    python3 -m unittest discover python

Each test builds a small recipe by hand, so the expected numbers are easy to
check in your head and don't change when data/recipes.json changes.
"""

import unittest

import scaler

# 500 g flour, 375 g water -> 75% hydration before the starter is counted.
SOURDOUGH = {
    "id": 1,
    "name": "Test sourdough",
    "servings": 12,
    "ingredients": [
        {"name": "bread flour", "amount": 500, "unit": "g"},
        {"name": "water", "amount": 375, "unit": "g"},
        {"name": "sourdough starter", "amount": 100, "unit": "g"},
        {"name": "salt", "amount": 10, "unit": "g"},
    ],
}

CAKE = {
    "id": 2,
    "name": "Test cake",
    "servings": 10,
    "ingredients": [
        {"name": "flour", "amount": 200, "unit": "g"},
        {"name": "butter", "amount": 100, "unit": "g"},
        {"name": "eggs", "amount": 3, "unit": "count"},
        {"name": "baking soda", "amount": 5, "unit": "g"},
    ],
}

NO_FLOUR = {
    "id": 3,
    "name": "Test meringue",
    "servings": 6,
    "ingredients": [{"name": "sugar", "amount": 200, "unit": "g"}],
}


def amounts(recipe):
    """{ name: amount } for a recipe, to keep the assertions short."""
    return {i["name"]: i["amount"] for i in recipe["ingredients"]}


class ScaleRecipeTests(unittest.TestCase):
    def test_doubling_doubles_every_amount(self):
        scaled = scaler.scale_recipe(SOURDOUGH, 24)
        self.assertEqual(scaled["servings"], 24)
        self.assertEqual(
            amounts(scaled),
            {"bread flour": 1000, "water": 750, "sourdough starter": 200, "salt": 20},
        )

    def test_same_servings_changes_nothing(self):
        self.assertEqual(amounts(scaler.scale_recipe(CAKE, 10)), amounts(CAKE))

    def test_original_recipe_is_not_changed(self):
        scaler.scale_recipe(SOURDOUGH, 24)
        self.assertEqual(SOURDOUGH["ingredients"][0]["amount"], 500)
        self.assertEqual(SOURDOUGH["servings"], 12)

    def test_counts_round_to_the_nearest_half(self):
        # 3 eggs for 10 servings -> 1.5 for 5 and 1.2 for 4 (rounds to 1)
        self.assertEqual(amounts(scaler.scale_recipe(CAKE, 5))["eggs"], 1.5)
        self.assertEqual(amounts(scaler.scale_recipe(CAKE, 4))["eggs"], 1)

    def test_small_gram_amounts_keep_one_decimal(self):
        # 5 g baking soda for 10 servings -> 1.5 g for 3
        self.assertEqual(amounts(scaler.scale_recipe(CAKE, 3))["baking soda"], 1.5)

    def test_a_half_gram_rounds_up(self):
        # 225 g for 10 servings -> 112.5 g for 5, which rounds up to 113
        recipe = {
            "servings": 10,
            "ingredients": [{"name": "flour", "amount": 225, "unit": "g"}],
        }
        self.assertEqual(amounts(scaler.scale_recipe(recipe, 5))["flour"], 113)

    def test_ratios_survive_scaling(self):
        # Scaling changes amounts, not proportions.
        self.assertEqual(
            scaler.hydration(scaler.scale_recipe(SOURDOUGH, 36)),
            scaler.hydration(SOURDOUGH),
        )

    def test_zero_or_negative_servings_is_an_error(self):
        with self.assertRaises(ValueError):
            scaler.scale_recipe(CAKE, 0)
        with self.assertRaises(ValueError):
            scaler.scale_recipe(CAKE, -2)


class BakersPercentageTests(unittest.TestCase):
    def test_flour_is_100_and_the_rest_is_relative_to_it(self):
        percents = {
            row["name"]: row["percent"] for row in scaler.bakers_percentages(SOURDOUGH)
        }
        self.assertEqual(
            percents,
            {"bread flour": 100, "water": 75, "sourdough starter": 20, "salt": 2},
        )

    def test_count_ingredients_are_left_out(self):
        names = [row["name"] for row in scaler.bakers_percentages(CAKE)]
        self.assertNotIn("eggs", names)

    def test_no_flour_gives_an_empty_list(self):
        self.assertEqual(scaler.bakers_percentages(NO_FLOUR), [])


class HydrationTests(unittest.TestCase):
    def test_starter_counts_as_half_flour_half_water(self):
        # flour 500 + 50 = 550, water 375 + 50 = 425 -> 77.3%
        self.assertEqual(scaler.hydration(SOURDOUGH), 77.3)

    def test_plain_water_over_flour(self):
        recipe = {
            "servings": 1,
            "ingredients": [
                {"name": "flour", "amount": 400, "unit": "g"},
                {"name": "water", "amount": 260, "unit": "g"},
            ],
        }
        self.assertEqual(scaler.hydration(recipe), 65)

    def test_milk_counts_for_its_water_only(self):
        recipe = {
            "servings": 1,
            "ingredients": [
                {"name": "flour", "amount": 100, "unit": "g"},
                {"name": "milk", "amount": 100, "unit": "g"},
            ],
        }
        self.assertEqual(scaler.hydration(recipe), 87)

    def test_yogurt_and_buttermilk_count_for_their_water(self):
        recipe = {
            "servings": 1,
            "ingredients": [
                {"name": "flour", "amount": 100, "unit": "g"},
                {"name": "yogurt", "amount": 100, "unit": "g"},
            ],
        }
        self.assertEqual(scaler.hydration(recipe), 85)

    def test_no_liquid_is_zero(self):
        self.assertEqual(scaler.hydration(CAKE), 0)

    def test_no_flour_gives_none(self):
        self.assertIsNone(scaler.hydration(NO_FLOUR))


ROUND_20 = {"id": "round-20", "shape": "round", "diameter": 20}
SQUARE_20 = {"id": "square-20", "shape": "rectangle", "length": 20, "width": 20}
RECT_40X20 = {"id": "rect", "shape": "rectangle", "length": 40, "width": 20}


class PanTests(unittest.TestCase):
    def test_a_rectangles_area_is_length_times_width(self):
        self.assertEqual(scaler.pan_area(RECT_40X20), 800)

    def test_a_round_pans_area_is_pi_times_radius_squared(self):
        # radius 10 -> 314.159...; compare to 2 decimal places
        self.assertAlmostEqual(scaler.pan_area(ROUND_20), 314.16, places=2)

    def test_the_same_pan_scales_by_1(self):
        self.assertEqual(scaler.pan_scale_factor(ROUND_20, ROUND_20), 1)

    def test_a_pan_with_double_the_area_doubles_the_recipe(self):
        self.assertEqual(scaler.pan_scale_factor(SQUARE_20, RECT_40X20), 2)

    def test_going_to_a_smaller_pan_gives_a_factor_below_1(self):
        self.assertEqual(scaler.pan_scale_factor(RECT_40X20, SQUARE_20), 0.5)

    def test_a_square_holds_more_than_a_round_pan_of_the_same_width(self):
        # 400 / 314.16 = 1.27
        self.assertAlmostEqual(
            scaler.pan_scale_factor(ROUND_20, SQUARE_20), 1.27, places=2
        )


class RealDataTests(unittest.TestCase):
    def test_every_recipe_in_the_data_file_can_be_processed(self):
        recipes = scaler.load_recipes()
        self.assertGreater(len(recipes), 0)
        for recipe in recipes:
            scaler.scale_recipe(recipe, recipe["servings"] * 2)
            scaler.bakers_percentages(recipe)
            scaler.hydration(recipe)

    def test_every_recipes_pan_exists_in_the_pans_file(self):
        pans = scaler.load_pans()
        for recipe in scaler.load_recipes():
            if recipe["pan"] is not None:
                self.assertIsNotNone(scaler.find_pan(pans, recipe["pan"]))


if __name__ == "__main__":
    unittest.main()
