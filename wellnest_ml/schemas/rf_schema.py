from pydantic import BaseModel
from typing import List, Optional


class WellnessDataPoint(BaseModel):
    entry_date: str
    sleep_quality: Optional[str] = None
    activity: Optional[str] = None
    diet: Optional[str] = None
    mood: Optional[str] = None


class RFRequest(BaseModel):
    user_id: int
    history: List[WellnessDataPoint]


class RFResponse(BaseModel):
    user_id: int
    risk_level: str
    risk_score: float
    risk_label: str
    prediction_message: str
    alert_family: bool
    top_risk_factors: List[str]
    recommendations: List[str]
