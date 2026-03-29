from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from bert_service import analyze

app = FastAPI(title="WellNest BERT Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    text: str
    user_id: int
    entry_date: str


@app.post("/bert/analyze")
def analyze_emotion(req: TextRequest):
    result = analyze(req.text)
    return {
        "user_id": req.user_id,
        "entry_date": req.entry_date,
        **result,
    }


@app.get("/health")
def health():
    return {"status": "BERT service running"}
