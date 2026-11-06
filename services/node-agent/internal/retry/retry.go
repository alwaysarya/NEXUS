package retry

import (
	"context"
	"fmt"
	"log"
	"time"
)

// Do retries an operation until it succeeds or the context is cancelled.
func Do(
	ctx context.Context,
	initialDelay time.Duration,
	maxDelay time.Duration,
	operation func(context.Context) error,
) error {
	if operation == nil {
		return fmt.Errorf("retry operation cannot be nil")
	}

	if initialDelay <= 0 || maxDelay < initialDelay {
		return fmt.Errorf("invalid retry delays")
	}

	delay := initialDelay

	for {
		if err := ctx.Err(); err != nil {
			return err
		}

		if err := operation(ctx); err == nil {
			return nil
		} else {
			log.Printf("Operation failed: %v. Retrying in %s", err, delay)
		}

		timer := time.NewTimer(delay)

		select {
		case <-ctx.Done():
			if !timer.Stop() {
				select {
				case <-timer.C:
				default:
				}
			}
			return ctx.Err()

		case <-timer.C:
		}

		if delay >= maxDelay/2 {
			delay = maxDelay
		} else {
			delay *= 2
		}
	}
}
