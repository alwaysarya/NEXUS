package retry

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestDoRetriesUntilSuccess(t *testing.T) {
	attempts := 0

	err := Do(context.Background(), time.Millisecond, 4*time.Millisecond,
		func(ctx context.Context) error {
			attempts++
			if attempts < 3 {
				return errors.New("temporary failure")
			}
			return nil
		},
	)

	if err != nil {
		t.Fatalf("Do() returned error: %v", err)
	}

	if attempts != 3 {
		t.Fatalf("expected 3 attempts, got %d", attempts)
	}
}

func TestDoStopsWhenContextIsCancelled(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()

	err := Do(ctx, time.Second, 30*time.Second,
		func(ctx context.Context) error {
			return errors.New("temporary failure")
		},
	)

	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("expected context deadline exceeded, got %v", err)
	}
}

func TestDoRejectsInvalidDelays(t *testing.T) {
	err := Do(context.Background(), 0, time.Second,
		func(ctx context.Context) error {
			return nil
		},
	)

	if err == nil {
		t.Fatal("expected error for invalid delays")
	}
}
