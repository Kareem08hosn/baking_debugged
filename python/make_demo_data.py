"""Makes python/data/demo_bakes.csv: a MADE-UP bake log for trying the
analysis before the real one is exported. Nothing in it is a real bake.

The fake ratings follow a pattern planted on purpose, so the notebook can
show whether the analysis finds it:
  - best around 72% hydration, worse the further away
  - a hotter oven helps a little
  - plus random noise, like real life
Run:  .venv/bin/python python/make_demo_data.py
"""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

OUT = Path(__file__).resolve().parent / "data" / "demo_bakes.csv"
COLUMNS = [
    "id", "recipe_id", "baked_on", "title", "rating", "flour_g", "water_g",
    "sugar_g", "fat_g", "leavener", "hydration_pct", "oven_temp_c",
    "bake_time_min", "rise", "texture", "what_went_wrong", "notes",
]


def make_rows(count=80, seed=7):
    rng = random.Random(seed)  # seeded: the same "random" file every time
    start = date(2025, 1, 5)
    rows = []
    for i in range(count):
        hydration = round(rng.uniform(58, 86), 1)
        oven = rng.choice([210, 220, 230, 240, 250])
        flour = rng.choice([450, 500, 500, 500, 600])
        score = 4.3 - 0.006 * (hydration - 72) ** 2 + 0.015 * (oven - 230) + rng.gauss(0, 0.45)
        rating = min(5, max(1, round(score * 2) / 2))  # to the nearest half star
        rows.append({
            "id": i + 1,
            "recipe_id": "",
            "baked_on": (start + timedelta(days=4 * i + rng.randint(0, 3))).isoformat(),
            "title": rng.choice(["Sourdough loaf", "Sourdough loaf", "Sandwich loaf", "Focaccia"]),
            "rating": rating,
            "flour_g": flour,
            "water_g": round(flour * hydration / 100),
            "sugar_g": rng.choice([0, 0, 10, 20]),
            "fat_g": rng.choice([0, 0, 15, 30]),
            "leavener": rng.choice(["sourdough starter", "instant yeast"]),
            "hydration_pct": hydration,
            "oven_temp_c": oven,
            "bake_time_min": rng.choice([35, 40, 45]),
            "rise": "",
            "texture": rng.choice(["open", "tight", "even", "gummy", ""]),
            "what_went_wrong": "",
            "notes": "DEMO DATA, not a real bake",
        })
    return rows


if __name__ == "__main__":
    OUT.parent.mkdir(exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(make_rows())
    print(f"Wrote {OUT}")
