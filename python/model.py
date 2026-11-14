"""Simple, honest models of what makes a bake good (Phase 4).

Two questions:
  1. Can the inputs predict the rating?          (ridge regression)
  2. Can they tell good bakes (4+) from the rest? (logistic regression)

Every score is cross-validated (the model is always tested on bakes it
didn't learn from) and compared with a baseline that ignores the inputs
entirely: "always guess the average" or "always guess the most common
answer". A model that can't beat its baseline has learned nothing.
"""
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Below this many bakes, results are shown with a clear warning.
FEW_BAKES = 30
SEED = 42  # fixed, so the numbers come out the same every run

# How much better than the baseline a model must be to count. A model that
# is only a hair better is within the noise of a small dataset.
MARGIN = 0.05  # 5%


def _rows(df, features, target):
    """Only the bakes that have the target and every feature."""
    return df.dropna(subset=[target, *features])


def _coefficients(pipeline, features):
    """Each feature's weight, largest effect first.

    The features were standardised (StandardScaler), so a weight means "the
    effect of one typical step (one standard deviation) of this feature",
    which makes them comparable even though their units differ.
    """
    weights = pipeline[-1].coef_.ravel()
    pairs = sorted(zip(features, weights), key=lambda pair: abs(pair[1]), reverse=True)
    return [(name, round(float(weight), 3)) for name, weight in pairs]


def rating_model(df, features):
    """Predict the rating. Returns a dict of results, or {"error": ...}."""
    data = _rows(df, features, "rating")
    n = len(data)
    if n < 10 or not features:
        return {"error": f"Need at least 10 rated bakes with these inputs filled in (have {n})."}

    X, y = data[features], data["rating"]
    folds = KFold(n_splits=min(5, n // 2), shuffle=True, random_state=SEED)
    model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
    baseline = DummyRegressor(strategy="mean")

    # cross_val_score gives "negative error" (bigger is better), so flip it.
    model_mae = -cross_val_score(model, X, y, cv=folds, scoring="neg_mean_absolute_error").mean()
    baseline_mae = -cross_val_score(baseline, X, y, cv=folds, scoring="neg_mean_absolute_error").mean()

    model.fit(X, y)
    return {
        "n": n,
        "features": features,
        "mae_model": round(float(model_mae), 2),
        "mae_baseline": round(float(baseline_mae), 2),
        # At least 5% less error than always guessing the average
        "beats_baseline": bool(model_mae < baseline_mae * (1 - MARGIN)),
        "coefficients": _coefficients(model, features),
        "warning": f"Only {n} bakes: treat this as a hint, not a finding." if n < FEW_BAKES else None,
    }


def good_bad_model(df, features):
    """Tell good (4+) from not-good bakes. Returns a dict, or {"error": ...}."""
    data = _rows(df, features, "good")
    n = len(data)
    counts = data["good"].value_counts()
    smaller_class = int(counts.min()) if len(counts) == 2 else 0
    if n < 10 or smaller_class < 3 or not features:
        return {"error": "Need at least 10 rated bakes, with at least 3 good and 3 not-good ones."}

    X, y = data[features], data["good"].astype(bool)
    # Stratified: every fold keeps the same mix of good and not-good bakes
    folds = StratifiedKFold(n_splits=min(5, smaller_class), shuffle=True, random_state=SEED)
    model = make_pipeline(StandardScaler(), LogisticRegression())
    baseline = DummyClassifier(strategy="most_frequent")

    accuracy = cross_val_score(model, X, y, cv=folds, scoring="accuracy").mean()
    baseline_accuracy = cross_val_score(baseline, X, y, cv=folds, scoring="accuracy").mean()

    model.fit(X, y)
    return {
        "n": n,
        "good_share": round(float(y.mean()), 2),
        "accuracy": round(float(accuracy), 2),
        "baseline_accuracy": round(float(baseline_accuracy), 2),
        # At least 5 percentage points more accurate than the baseline
        "beats_baseline": bool(accuracy >= baseline_accuracy + MARGIN),
        "coefficients": _coefficients(model, features),
        "warning": f"Only {n} bakes: treat this as a hint, not a finding." if n < FEW_BAKES else None,
    }
