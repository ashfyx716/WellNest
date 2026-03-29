from fastapi import APIRouter

from schemas.rf_schema import RFRequest, RFResponse
from services.rf_service import predict_risk, get_or_create_model

router = APIRouter()


@router.post("/predict", response_model=RFResponse)
def predict_wellness_risk(request: RFRequest):
    result = predict_risk(request.history)
    return RFResponse(
        user_id=request.user_id,
        risk_level=result["risk_level"],
        risk_score=result["risk_score"],
        risk_label=result["risk_label"],
        prediction_message=result["prediction_message"],
        alert_family=result["alert_family"],
        top_risk_factors=result["top_risk_factors"],
        recommendations=result["recommendations"],
    )


@router.get("/feature-importance")
def get_feature_importance():
    model = get_or_create_model()
    features = [
        "avg_sleep", "min_sleep", "avg_activity", "avg_diet",
        "avg_mood", "min_mood", "stressed_days", "poor_sleep_days",
        "inactive_days", "total_logged", "mood_variability",
    ]
    importance = dict(zip(features, model.feature_importances_.tolist()))
    return {"feature_importance": importance}
