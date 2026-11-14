"""Tests for bakelog.py and model.py. Skipped when pandas isn't installed
(the system Python), so `python3 -m unittest discover python` still runs
the scaler tests. Run all of them with:
  .venv/bin/python -m unittest discover python
"""
import tempfile
import unittest
from pathlib import Path

try:
    import pandas  # noqa: F401
    HAVE_PANDAS = True
except ImportError:
    HAVE_PANDAS = False


@unittest.skipUnless(HAVE_PANDAS, "pandas not installed (use .venv/bin/python)")
class AnalysisTests(unittest.TestCase):
    def setUp(self):
        import csv
        from make_demo_data import COLUMNS, make_rows

        self.folder = tempfile.TemporaryDirectory()
        self.path = Path(self.folder.name) / "bakes.csv"
        with open(self.path, "w", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=COLUMNS)
            writer.writeheader()
            writer.writerows(make_rows())

    def tearDown(self):
        self.folder.cleanup()

    def test_loading_adds_the_worked_out_columns(self):
        from bakelog import load_bakes

        df = load_bakes(self.path)
        self.assertEqual(len(df), 80)
        first = df.iloc[0]
        self.assertAlmostEqual(first["sugar_pct"], first["sugar_g"] / first["flour_g"] * 100, places=1)
        self.assertEqual(bool(first["good"]), first["rating"] >= 4)

    def test_missing_hydration_is_worked_out_from_water_and_flour(self):
        from bakelog import load_bakes

        path = Path(self.folder.name) / "small.csv"
        path.write_text("title,rating,flour_g,water_g,hydration_pct\nLoaf,4,500,350,\n")
        df = load_bakes(path)
        self.assertEqual(df.loc[0, "hydration_pct"], 70.0)
        self.assertTrue(pandas.isna(df.loc[0, "oven_temp_c"]))  # column added, empty

    def test_a_file_without_titles_is_refused(self):
        from bakelog import load_bakes

        path = Path(self.folder.name) / "bad.csv"
        path.write_text("rating\n4\n")
        with self.assertRaises(ValueError):
            load_bakes(path)

    def test_the_models_find_the_planted_pattern(self):
        from bakelog import load_bakes, usable_features
        from model import good_bad_model, rating_model

        df = load_bakes(self.path)
        features = usable_features(df)
        self.assertIn("hydration_pct", features)
        # A straight line can't see the planted hydration peak...
        straight = rating_model(df, features)
        self.assertFalse(straight["beats_baseline"])
        self.assertIsNone(straight["warning"])  # 80 bakes is enough
        # ...but with "distance from the middle" as an input, it can.
        df["off_middle"] = (df["hydration_pct"] - df["hydration_pct"].median()).abs()
        self.assertTrue(rating_model(df, features + ["off_middle"])["beats_baseline"])
        good = good_bad_model(df, features)
        self.assertIn("accuracy", good)

    def test_too_few_bakes_are_refused_politely(self):
        from bakelog import load_bakes
        from model import rating_model

        df = load_bakes(self.path).head(5)
        self.assertIn("error", rating_model(df, ["hydration_pct"]))


if __name__ == "__main__":
    unittest.main()
