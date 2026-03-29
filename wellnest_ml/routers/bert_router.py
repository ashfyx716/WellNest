from typing import List
from fastapi import APIRouter

from schemas.bert_schema import BertRequest, BertResponse, EmotionResult
from services.bert_service import analyze_emotion, get_nesti_message, mood_conflicts

router = APIRouter()


@router.post("/analyze", response_model=BertResponse)
def analyze_note(request: BertRequest):
    er = analyze_emotion(request.text)
    conflicts = mood_conflicts(request.manual_mood, er["label"])
    nesti_msg = get_nesti_message(er["label"], conflicts)

    emotion = EmotionResult(
        label=er["label"],
        confidence=float(er["confidence"]),
        all_scores=er.get("all_scores") or {},
    )

    return BertResponse(
        user_id=request.user_id,
        entry_date=request.entry_date,
        detected_emotion=emotion,
        nesti_message=nesti_msg,
        conflicts_with_manual=conflicts,
    )


@router.post("/batch-analyze")
def batch_analyze(texts: List[dict]):
    results = []
    for item in texts:
        result = analyze_emotion(item.get("text", ""))
        results.append({
            "entry_date": item.get("entry_date"),
            "emotion": result,
        })
    return {"results": results}
