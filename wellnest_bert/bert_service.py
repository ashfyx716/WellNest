from transformers import pipeline
import torch

_pipe = None


def get_pipe():
    global _pipe
    if _pipe is None:
        _pipe = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
            device=0 if torch.cuda.is_available() else -1,
        )
    return _pipe


LABEL_MAP = {
    "joy": "HAPPY",
    "neutral": "NEUTRAL",
    "sadness": "SAD",
    "fear": "STRESSED",
    "anger": "STRESSED",
    "disgust": "STRESSED",
    "surprise": "NEUTRAL",
}

MESSAGES = {
    "HAPPY": "Your words carry warmth today 🌸 That's beautiful.",
    "NEUTRAL": "A steady, grounded day. That's okay too 🌿",
    "SAD": "I can sense something heavy in your words 💕 It's okay to feel this.",
    "STRESSED": "Your words carry some weight today 💛 Take a breath. You're not alone.",
    "CALM": "There's a quiet peace in your words today 🍃",
}


def analyze(text: str) -> dict:
    if not text or len(text.strip()) < 5:
        return {
            "emotion": "NEUTRAL",
            "confidence": 0.5,
            "message": MESSAGES["NEUTRAL"],
            "all_scores": {"NEUTRAL": 0.5},
        }

    results = get_pipe()(text)[0]
    top = max(results, key=lambda x: x["score"])
    raw_label = top["label"].split(",")[-1].strip().lower() if "," in top["label"] else top["label"].lower()
    emotion = LABEL_MAP.get(raw_label, "NEUTRAL")
    all_scores = {}
    for r in results:
        lab = r["label"].split(",")[-1].strip().lower() if "," in r["label"] else r["label"].lower()
        mapped = LABEL_MAP.get(lab, "NEUTRAL")
        all_scores[mapped] = round(float(r["score"]), 3)

    return {
        "emotion": emotion,
        "confidence": round(float(top["score"]), 3),
        "message": MESSAGES.get(emotion, "Thank you for sharing 💛"),
        "all_scores": all_scores,
    }
