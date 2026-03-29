import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "random_forest_model.pkl")

SLEEP_MAP = {"POOR": 1, "OKAY": 2, "GOOD": 3, None: 2}
ACTIVITY_MAP = {"NOT_ACTIVE": 0, "RESTED": 1, "WALKED": 2, "YOGA": 3, None: 1}
DIET_MAP = {"SKIPPED": 0, "JUNK": 1, "NORMAL": 2, "HEALTHY": 3, None: 2}
MOOD_MAP = {
    "STRESSED": 1, "SAD": 1, "TIRED": 1,
    "NEUTRAL": 2, "CALM": 3, "HAPPY": 3, None: 2,
}


def _entry_dict(e):
    if hasattr(e, "model_dump"):
        return e.model_dump()
    return e


def encode_entry(entry) -> list:
    d = _entry_dict(entry)
    return [
        SLEEP_MAP.get(d.get("sleep_quality"), 2),
        ACTIVITY_MAP.get(d.get("activity"), 1),
        DIET_MAP.get(d.get("diet"), 2),
        MOOD_MAP.get(d.get("mood"), 2),
    ]


def extract_features(history: list) -> np.ndarray:
    if not history:
        return np.array([[2.0, 1.0, 2.0, 2.0, 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]])

    encoded = [encode_entry(e) for e in history]
    df = pd.DataFrame(encoded, columns=["sleep", "activity", "diet", "mood"])

    features = [
        float(df["sleep"].mean()),
        float(df["sleep"].min()),
        float(df["activity"].mean()),
        float(df["diet"].mean()),
        float(df["mood"].mean()),
        float(df["mood"].min()),
        float((df["mood"] == 1).sum()),
        float((df["sleep"] == 1).sum()),
        float((df["activity"] == 0).sum()),
        float(len(history)),
        float(df["mood"].std() if len(df) > 1 else 0.0),
    ]
    return np.array([features])


def get_or_create_model():
    path = os.path.normpath(MODEL_PATH)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
        return joblib.load(path)

    np.random.seed(42)
    X_train, y_train = [], []

    for _ in range(500):
        X_train.append([2.8, 1.0, 2.7, 2.8, 2.7, 2.0, 0, 0, 1, 14, 0.3])
        y_train.append(0)

    for _ in range(500):
        X_train.append([2.0, 1.0, 1.8, 2.2, 2.0, 1.5, 2, 1, 3, 10, 0.6])
        y_train.append(1)

    for _ in range(500):
        X_train.append([1.3, 0.5, 1.2, 1.8, 1.3, 1.0, 5, 4, 7, 7, 0.8])
        y_train.append(2)

    X = np.array(X_train) + np.random.normal(0, 0.2, (1500, 11))
    y = np.array(y_train)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X, y)
    joblib.dump(model, path)
    return model


RISK_LABELS = {
    0: ("LOW", "🟢 Calm week ahead", False),
    1: ("MEDIUM", "🟡 Take care this week", False),
    2: ("HIGH", "🔴 You need extra support", True),
}

PREDICTION_MESSAGES = {
    "LOW": "Based on your recent patterns, Nesti sees a calm week ahead 🌿 Keep it up!",
    "MEDIUM": "Nesti notices some patterns to watch 💛 Small self-care steps this week will help.",
    "HIGH": "Nesti is concerned about your recent patterns 💕 Please take extra care of yourself — your family has been notified.",
}

RECOMMENDATIONS = {
    "LOW": ["Keep your current sleep schedule 🌙", "A daily 10-min walk does wonders 🚶‍♀️", "You're doing great! 🌸"],
    "MEDIUM": ["Try sleeping 30 min earlier tonight 🌙", "Have one healthy meal today 🥗", "Take 5 deep breaths when stressed 🌿"],
    "HIGH": [
        "Rest is your priority today 🛌",
        "Talk to someone you trust 💕",
        "Try the breathing exercise in Sanctuary 🧘‍♀️",
        "Let your family know how you feel ❤️",
    ],
}


def get_risk_factors(history: list) -> list:
    factors = []
    poor_sleep = sum(1 for e in history if _entry_dict(e).get("sleep_quality") == "POOR")
    stressed = sum(
        1 for e in history if _entry_dict(e).get("mood") in ("STRESSED", "SAD", "TIRED")
    )
    inactive = sum(1 for e in history if _entry_dict(e).get("activity") == "NOT_ACTIVE")
    junk = sum(
        1 for e in history if _entry_dict(e).get("diet") in ("JUNK", "SKIPPED")
    )

    if poor_sleep >= 3:
        factors.append(f"Poor sleep on {poor_sleep} days 😴")
    if stressed >= 3:
        factors.append(f"Difficult moods on {stressed} days 😔")
    if inactive >= 4:
        factors.append(f"Inactive on {inactive} days 🛋️")
    if junk >= 3:
        factors.append(f"Unhealthy eating on {junk} days 🍕")
    if not factors:
        factors.append("Patterns look stable 🌿")
    return factors


def predict_risk(history: list):
    model = get_or_create_model()
    features = extract_features(history)
    risk_idx = int(model.predict(features)[0])
    risk_proba = model.predict_proba(features)[0]
    risk_score = float(risk_proba[min(risk_idx, len(risk_proba) - 1)])

    risk_level, risk_label, alert_family = RISK_LABELS[risk_idx]

    return {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 3),
        "risk_label": risk_label,
        "prediction_message": PREDICTION_MESSAGES[risk_level],
        "alert_family": alert_family,
        "top_risk_factors": get_risk_factors(history),
        "recommendations": RECOMMENDATIONS[risk_level],
    }
