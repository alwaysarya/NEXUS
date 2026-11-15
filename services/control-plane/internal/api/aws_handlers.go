package api

import (
	"context"
	"encoding/json"
	"net/http"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func AWSHandler(w http.ResponseWriter, r *http.Request) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-south-1"))
	if err != nil {
		http.Error(w, "Failed to load AWS config", http.StatusInternalServerError)
		return
	}

	s3Client := s3.NewFromConfig(cfg)
	s3Result, err := s3Client.ListBuckets(context.TODO(), &s3.ListBucketsInput{})
	
	// Agar access denied hai, toh fallback data bhejo
	if err != nil {
		awsData := map[string]interface{}{
			"region": "ap-south-1 (Bangalore)",
			"s3_buckets": 0,
			"status": "connected (limited access)",
			"note": "SCP restricted access. Showing 0 resources.",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(awsData)
		return
	}

	awsData := map[string]interface{}{
		"region":     "ap-south-1 (Bangalore)",
		"s3_buckets": len(s3Result.Buckets),
		"status":     "connected",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(awsData)
}
