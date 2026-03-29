from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import bert_router, lda_router, rf_router

app = FastAPI(
    title="WellNest ML Microservice",
    description="BERT emotion detection, LDA topic modelling, Random Forest wellness prediction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bert_router.router, prefix="/ml/bert", tags=["BERT Emotion"])
app.include_router(lda_router.router, prefix="/ml/lda", tags=["LDA Topics"])
app.include_router(rf_router.router, prefix="/ml/rf", tags=["Risk Prediction"])


@app.get("/health")
def health():
    return {"status": "WellNest ML service running ✅"}
