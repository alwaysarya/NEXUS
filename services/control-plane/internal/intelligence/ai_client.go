package intelligence

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type Metrics struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
}

type Prediction struct {
	NodeStatus string  `json:"node_status"`
	RiskScore  int     `json:"risk_score"`
	Prediction string  `json:"prediction"`
	Confidence float64 `json:"confidence"`
}

func GetPrediction(cpu, mem float64) (*Prediction, error) {
	payload := Metrics{CPUUsage: cpu, MemoryUsage: mem}
	body, _ := json.Marshal(payload)

	resp, err := http.Post("http://localhost:8000/predict", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var pred Prediction
	err = json.NewDecoder(resp.Body).Decode(&pred)
	if err != nil {
		return nil, err
	}

	return &pred, nil
}
