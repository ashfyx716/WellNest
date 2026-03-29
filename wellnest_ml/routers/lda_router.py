from fastapi import APIRouter

from schemas.lda_schema import LDARequest, LDAResponse, TopicResult
from services.lda_service import run_lda, get_insight_message

router = APIRouter()


@router.post("/topics", response_model=LDAResponse)
def discover_topics(request: LDARequest):
    topics_raw = run_lda(request.notes, request.num_topics)

    topic_results = [
        TopicResult(
            topic_id=t["topic_id"],
            label=t["label"],
            keywords=t["keywords"],
            weight=t["weight"],
            emoji=t["emoji"],
        )
        for t in topics_raw
    ]

    dominant = topic_results[0] if topic_results else TopicResult(
        topic_id=0,
        label="Not enough data",
        keywords=[],
        weight=1.0,
        emoji="🌿",
    )

    return LDAResponse(
        user_id=request.user_id,
        topics=topic_results,
        dominant_topic=dominant,
        insight_message=get_insight_message(dominant.label),
    )
