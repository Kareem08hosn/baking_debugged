"""Writes python/bake_analysis.ipynb (the Phase 4 notebook) from the cells
below, so the notebook's content lives in plain, reviewable Python.
Run:  .venv/bin/python python/build_notebook.py
Then open it:  .venv/bin/jupyter notebook python/bake_analysis.ipynb
"""
from pathlib import Path

import nbformat
from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook

md = new_markdown_cell
code = new_code_cell

cells = [
    md("""# What makes a bake good?

An analysis of my bake log: which measurements go with good results, and
whether a simple model can predict how a bake will turn out.

**The data.** The website's bake log exports a CSV (`/bakes` → Export CSV).
Save it as `python/data/bakes.csv`. Until then this notebook runs on
`demo_bakes.csv`, a **made-up** log with a pattern planted on purpose
(best around 72% hydration, a hotter oven helps a little), so the method
can be checked before the real data exists."""),
    code("""import matplotlib.pyplot as plt
import pandas as pd

from bakelog import load_bakes, pick_data_file, usable_features
from model import good_bad_model, rating_model

path, is_demo = pick_data_file()
bakes = load_bakes(path)
print(f"Loaded {len(bakes)} bakes from {path.name}")
if is_demo:
    print("DEMO DATA: made up for testing. Export the real bake log to python/data/bakes.csv.")"""),
    md("""## 1. What's in the log

How many bakes, what kinds, and how much of each column is filled in.
Columns that are mostly empty can't tell us much."""),
    code("""rated = bakes[bakes["rating"].notna()]
print(f"{len(rated)} of {len(bakes)} bakes have a rating")
print()
print(bakes["title"].value_counts().head(10))
print()
filled = bakes[["rating", "hydration_pct", "oven_temp_c", "bake_time_min", "sugar_pct", "fat_pct"]].notna().mean()
print("Share of bakes with each value filled in:")
print((filled * 100).round().astype(int).astype(str) + "%")"""),
    md("""## 2. Ratings

The spread of ratings. If almost every bake is a 4, there is little
variation to explain, and any model will struggle."""),
    code("""fig, ax = plt.subplots(figsize=(7, 3.5))
rated["rating"].plot.hist(bins=[0.75 + 0.5 * i for i in range(10)], ax=ax, color="#14342b", edgecolor="#faf4df")
ax.set_xlabel("Rating")
ax.set_ylabel("Bakes")
ax.set_title("How the bakes were rated")
plt.show()
print(rated["rating"].describe().round(2))"""),
    md("""## 3. What goes with a good rating?

The correlation between each input and the rating, from -1 (higher input,
lower rating) to +1 (higher input, higher rating). Correlation only catches
straight-line relationships, and it doesn't prove cause: it's where to look
next, not an answer."""),
    code("""features = usable_features(bakes)
print("Inputs filled in often enough to use:", ", ".join(features))
correlations = rated[features + ["rating"]].corr()["rating"].drop("rating").sort_values()
print()
print(correlations.round(2))"""),
    md("""The scatter plots show what a single number can hide. A peak in the
middle (too dry and too wet both do worse) gives a correlation near zero,
even though hydration clearly matters."""),
    code("""fig, axes = plt.subplots(1, len(features), figsize=(4 * len(features), 3.5), sharey=True)
if len(features) == 1:
    axes = [axes]
for ax, feature in zip(axes, features):
    ax.scatter(rated[feature], rated["rating"], color="#14342b", alpha=0.6, s=18)
    ax.set_xlabel(feature)
axes[0].set_ylabel("Rating")
plt.tight_layout()
plt.show()"""),
    md("""## 4. Can the inputs predict the rating?

A ridge regression (a straight-line model that is discouraged from
over-reacting to small samples), tested with **cross-validation**: the
data is split into parts, and each part is predicted by a model trained on
the others. It's compared with a baseline that always guesses the average
rating. MAE is the mean absolute error: how far off the guesses are, in
stars. Lower is better."""),
    code("""result = rating_model(bakes, features)
if "error" in result:
    print(result["error"])
else:
    print(f"Bakes used: {result['n']}")
    print(f"Model is off by     {result['mae_model']} stars on average")
    print(f"Baseline is off by  {result['mae_baseline']} stars (always guessing the average)")
    print("Clearly better than the baseline." if result["beats_baseline"] else "NOT clearly better than the baseline (under 5% better): a straight line doesn't explain the ratings.")
    if result["warning"]:
        print("Warning:", result["warning"])
    print()
    print("Weights (effect of one typical step in each input, in stars):")
    for name, weight in result["coefficients"]:
        print(f"  {name:15} {weight:+.3f}")"""),
    md("""A straight-line model can't see a peak, so the next cell gives it one
extra input: how far hydration is from its middle value. If the score
improves, the "sweet spot" is real in this data."""),
    code("""if "hydration_pct" in features:
    with_peak = bakes.copy()
    middle = with_peak["hydration_pct"].median()
    with_peak["hydration_off_middle"] = (with_peak["hydration_pct"] - middle).abs()
    peak_result = rating_model(with_peak, features + ["hydration_off_middle"])
    if "error" not in peak_result:
        print(f"Middle hydration in this log: {middle:.1f}%")
        print(f"Straight-line model: off by {result['mae_model']} stars")
        print(f"With the distance-from-middle input: off by {peak_result['mae_model']} stars")
        print("Clearly better than the baseline." if peak_result["beats_baseline"] else "Still not clearly better than the baseline.")
else:
    print("No hydration column to test.")"""),
    md("""## 5. Good or not?

The same idea as a yes/no question: is it a good bake (rated 4 or more)?
Logistic regression, cross-validated, against a baseline that always
guesses the most common answer."""),
    code("""good = good_bad_model(bakes, features)
if "error" in good:
    print(good["error"])
else:
    print(f"Bakes used: {good['n']} ({good['good_share']:.0%} good)")
    print(f"Model accuracy:     {good['accuracy']:.0%}")
    print(f"Baseline accuracy:  {good['baseline_accuracy']:.0%} (always guessing the most common answer)")
    print("Clearly better than the baseline." if good["beats_baseline"] else "NOT clearly better than the baseline (under 5 points): the inputs don't separate good from not-good bakes.")
    if good["warning"]:
        print("Warning:", good["warning"])"""),
    md("""## 6. How far to trust this

- **Small data.** A home bake log has tens of entries, not thousands.
  Weights can swing a lot with a few more bakes; treat them as hints.
- **Mostly one kind of bake.** What holds for my sourdough may not hold for
  cakes. Results are about the bakes in this log.
- **Missing inputs.** Proofing time, flour brand, kitchen temperature and
  technique aren't logged, and they matter. The model can only use what
  was written down.
- **Ratings are one person's judgement**, on a day, in a mood.
- **Correlation isn't cause.** The way to confirm a finding is to change
  one thing on purpose and log the result.

## 7. What's next

Phase 5 v2: use the weights found here to adjust the rules in the
website's bake debugger (`lib/debugger.js`), but only for findings that
clearly beat the baseline on the real data."""),
]

notebook = new_notebook(cells=cells, metadata={
    "kernelspec": {"name": "python3", "display_name": "Python 3", "language": "python"},
    "language_info": {"name": "python"},
})
out = Path(__file__).resolve().parent / "bake_analysis.ipynb"
nbformat.write(notebook, out)
print(f"Wrote {out}")
