from pydantic import BaseModel
from typing import List


class LDARequest(BaseModel):
    user_id: int
    notes: List[dict]
    num_topics: int = 3


class TopicResult(BaseModel):
    topic_id: int
    label: str
    keywords: List[str]
    weight: float
    emoji: str


class LDAResponse(BaseModel):
    user_id: int
    topics: List[TopicResult]
    dominant_topic: TopicResult
    insight_message: str
