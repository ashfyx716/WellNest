from pydantic import BaseModel, Field
from typing import Optional


class BertRequest(BaseModel):
    text: str
    user_id: int
    entry_date: str
    manual_mood: Optional[str] = None  # e.g. HAPPY, STRESSED — for conflict detection


class EmotionResult(BaseModel):
    label: str
    confidence: float
    all_scores: dict = Field(default_factory=dict)


class BertResponse(BaseModel):
    user_id: int
    entry_date: str
    detected_emotion: EmotionResult
    nesti_message: str
    conflicts_with_manual: bool
