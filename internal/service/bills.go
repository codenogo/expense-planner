package service

import (
	"context"
	"fmt"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/household"
	"github.com/expenser/expense-planner/ent/recurringbill"
)

// BillService handles recurring bill status management.
type BillService struct {
	client *ent.Client
}

// NewBillService creates a new BillService.
func NewBillService(client *ent.Client) *BillService {
	return &BillService{client: client}
}

// UpdateBillStatuses marks pending bills as overdue if the current day
// is past their due_day for the current month.
func (s *BillService) UpdateBillStatuses(ctx context.Context, householdID int) (int, error) {
	today := time.Now()
	currentDay := today.Day()

	count, err := s.client.RecurringBill.Update().
		Where(
			recurringbill.HasHouseholdWith(household.ID(householdID)),
			recurringbill.StatusEQ(recurringbill.StatusPending),
			recurringbill.DueDayLTE(currentDay),
		).
		SetStatus(recurringbill.StatusOverdue).
		Save(ctx)
	if err != nil {
		return 0, fmt.Errorf("updating bill statuses: %w", err)
	}

	return count, nil
}
