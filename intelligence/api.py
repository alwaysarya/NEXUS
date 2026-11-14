from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="NEXUS Intelligence API")

# Dummy Model (Production mein aap asli trained model load karoge)
class NodeMetrics(BaseModel):
    cpu_usage: float
    memory_usage: float

@app.get("/health")
def health():
    return {"status": "AI Engine Running"}

@app.post("/predict")
def predict_failure(metrics: NodeMetrics):
    # Simple logic: Agar CPU > 85% ya Memory > 90% hai, toh risk hai
    risk_score = 0
    if metrics.cpu_usage > 85:
        risk_score += 50
    if metrics.memory_usage > 90:
        risk_score += 50
    
    status = "HIGH RISK" if risk_score >= 50 else "STABLE"
    
    return {
        "node_status": status,
        "risk_score": risk_score,
        "prediction": "Failure likely in next 15 mins" if status == "HIGH RISK" else "Everything normal",
        "confidence": 0.95 if status == "STABLE" else 0.88
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
