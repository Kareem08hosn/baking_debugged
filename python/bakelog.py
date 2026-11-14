"""Loading and tidying a bake log for analysis (Phase 4).

The input is the CSV that the website's bake log exports (/bakes ->
Export CSV), with the database's column names: baked_on, title, rating,
flour_g, water_g, sugar_g, fat_g, leavener, hydration_pct, oven_temp_c,
bake_time_min, rise, texture, what_went_wrong, notes.

Put the real export at python/data/bakes.csv (git-ignored: it's personal
data). Until then, the notebook uses python/data/demo_bakes.csv, which is
MADE UP (see make_demo_data.py).
"""
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent / "data"
REAL_FILE = DATA_DIR / "bakes.csv"
DEMO_FILE = DATA_DIR / "demo_bakes.csv"

NUMBER_COLUMNS = [
    "rating", "flour_g", "water_g", "sugar_g", "fat_g",
    "hydration_pct", "oven_temp_c", "bake_time_min",
]

# The inputs a model may learn from. Flour weight itself is left out: it
# says how BIG the bake was, not how it was made. Sugar and fat are used as
# baker's percentages (per 100 g flour) for the same reason.
CANDIDATE_FEATURES = ["hydration_pct", "oven_temp_c", "bake_time_min", "sugar_pct", "fat_pct"]

# A bake rated 4 or more counts as "good".
GOOD_RATING = 4


def pick_data_file():
    """Return (path, is_demo): the real export if it exists, else the demo."""
    if REAL_FILE.exists():
        return REAL_FILE, False
    return DEMO_FILE, True


def load_bakes(path):
    """Read a bake log CSV and return a tidy pandas DataFrame.

    Adds:
      hydration_pct  worked out from water / flour where it's missing
      sugar_pct      sugar as a baker's percentage
      fat_pct        fat as a baker's percentage
      good           True/False from the rating (missing if not rated)
    """
    df = pd.read_csv(path)
    missing = {"title", "rating"} - set(df.columns)
    if missing:
        raise ValueError(f"The bake log needs these columns: {', '.join(sorted(missing))}")

    # Make sure numbers are numbers: anything unreadable becomes NaN
    # ("not a number", pandas' marker for a missing value).
    for column in NUMBER_COLUMNS:
        if column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce")
        else:
            df[column] = float("nan")
    if "baked_on" in df.columns:
        df["baked_on"] = pd.to_datetime(df["baked_on"], errors="coerce")

    # Hydration from flour and water where it wasn't written down.
    # .where keeps the existing value where the condition is True.
    worked_out = (df["water_g"] / df["flour_g"] * 100).round(1)
    df["hydration_pct"] = df["hydration_pct"].where(df["hydration_pct"].notna(), worked_out)

    df["sugar_pct"] = (df["sugar_g"] / df["flour_g"] * 100).round(1)
    df["fat_pct"] = (df["fat_g"] / df["flour_g"] * 100).round(1)

    # "boolean" (capital-B style) is pandas' True/False type that also
    # allows "missing", for bakes without a rating.
    df["good"] = (df["rating"] >= GOOD_RATING).astype("boolean")
    df.loc[df["rating"].isna(), "good"] = pd.NA
    return df


def usable_features(df, min_filled=0.6):
    """The candidate features filled in for at least 60% of rated bakes.

    A column that's mostly empty would throw away most rows if used.
    """
    rated = df[df["rating"].notna()]
    if rated.empty:
        return []
    return [column for column in CANDIDATE_FEATURES if rated[column].notna().mean() >= min_filled]
