from collections import defaultdict
from transformers import pipeline
import torch

_emotion_pipeline = None


def get_emotion_pipeline():
    global _emotion_pipeline
    if _emotion_pipeline is None:
        device = 0 if torch.cuda.is_available() else -1
        _emotion_pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
            device=device,
        )
    return _emotion_pipeline


EMOTION_MAP = {
    "joy": "HAPPY",
    "neutral": "NEUTRAL",
    "sadness": "SAD",
    "fear": "STRESSED",
    "anger": "ANGRY",
    "disgust": "STRESSED",
    "surprise": "NEUTRAL",
}

NESTI_MESSAGES = {
    "HAPPY": "Your words feel bright today! 🌸 That joy is real.",
    "NEUTRAL": "A steady, calm day. That's okay too 🌿",
    "SAD": "I can sense something heavy in your words 💕 It's okay to feel this way.",
    "STRESSED": "Your words carry some weight today 💛 Take a breath. You're not alone.",
    "TIRED": "Rest is wellness too 🌙 Be gentle with yourself today.",
    "CALM": "There's a quiet strength in your words today 🍃",
    "ANGRY": "Big feelings can show up in our words 🌿 You're safe to feel them here.",
}


def analyze_emotion(text: str):
    if not text or len(text.strip()) < 5:
        return {
            "label": "NEUTRAL",
            "confidence": 0.5,
            "all_scores": {"NEUTRAL": 0.5},
        }

    pipe = get_emotion_pipeline()
    raw = pipe(text[:512])
    # pipeline returns list of {label, score} when top_k=None
    results = raw[0] if isinstance(raw, list) and len(raw) > 0 and isinstance(raw[0], list) else raw
    if isinstance(results, list) and len(results) > 0 and isinstance(results[0], dict):
        sorted_results = sorted(results, key=lambda x: x["score"], reverse=True)
    else:
        sorted_results = [{"label": "neutral", "score": 0.5}]

    agg = defaultdict(float)
    for r in sorted_results:
        lab = (r.get("label") or "neutral").lower()
        wl = EMOTION_MAP.get(lab, "NEUTRAL")
        agg[wl] = max(agg[wl], float(r.get("score", 0)))

    all_scores = {k: round(v, 3) for k, v in sorted(agg.items(), key=lambda x: -x[1])}

    top_hf = sorted_results[0]
    wellnest_label = EMOTION_MAP.get((top_hf.get("label") or "neutral").lower(), "NEUTRAL")
    # Map ANGRY from anger path; tired approximated from sadness dominance
    if wellnest_label == "SAD" and all_scores.get("SAD", 0) > 0.55 and top_hf.get("label", "").lower() == "sadness":
        if "heavy" in text.lower() or "exhaust" in text.lower() or "tired" in text.lower():
            wellnest_label = "TIRED"
    confidence = round(float(top_hf.get("score", 0.5)), 3)

    return {
        "label": wellnest_label,
        "confidence": confidence,
        "all_scores": all_scores,
    }


def get_nesti_message(emotion_label: str, conflicts: bool) -> str:
    base = NESTI_MESSAGES.get(emotion_label, "Thank you for sharing 💛")
    if conflicts:
        return f"Nesti noticed something in your words... 💛 {base} You might be feeling more than you selected."
    return base


def mood_conflicts(manual: str | None, detected: str) -> bool:
    if not manual:
        return False
    m = manual.upper().strip()
    d = detected.upper().strip()
    equivalents = {
        "HAPPY": {"HAPPY", "CALM"},
        "CALM": {"CALM", "HAPPY", "NEUTRAL"},
        "NEUTRAL": {"NEUTRAL"},
        "SAD": {"SAD"},
        "STRESSED": {"STRESSED", "ANGRY"},
        "TIRED": {"TIRED", "SAD"},
        "ANGRY": {"STRESSED", "ANGRY"},
    }
    allowed = equivalents.get(m, {m})
    return d not in allowed
