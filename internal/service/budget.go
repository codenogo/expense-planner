package service

import (
	"context"
	"fmt"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/account"
	"github.com/expenser/expense-planner/ent/budget"
	"github.com/expenser/expense-planner/ent/category"
	"github.com/expenser/expense-planner/ent/household"
	"github.com/expenser/expense-planner/ent/transaction"
	"github.com/expenser/expense-planner/ent/transactionentry"
)

// BudgetService handles budget progress calculations.
type BudgetService struct {
	client *ent.Client
}

// NewBudgetService creates a new BudgetService.
func NewBudgetService(client *ent.Client) *BudgetService {
	return &BudgetService{client: client}
}

// BudgetProgress represents a category's budget vs actual spending.
type BudgetProgress struct {
	BudgetID    int
	CategoryID  int
	Month       string
	AmountCents int64
	SpentCents  int64
	Rollover    bool
}

// GetBudgetProgress returns budget progress for all categories in a household for a given month.
func (s *BudgetService) GetBudgetProgress(ctx context.Context, householdID int, month string) ([]BudgetProgress, error) {
	// Parse month to get date range.
	start, err := time.Parse("2006-01", month)
	if err != nil {
		return nil, fmt.Errorf("invalid month format, expected YYYY-MM: %w", err)
	}
	end := start.AddDate(0, 1, 0)

	// Fetch budgets for this household and month.
	budgets, err := s.client.Budget.Query().
		Where(
			budget.HasHouseholdWith(household.ID(householdID)),
			budget.MonthEQ(month),
		).
		WithCategory().
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("querying budgets: %w", err)
	}

	results := make([]BudgetProgress, 0, len(budgets))
	for _, b := range budgets {
		catID := b.Edges.Category.ID

		// Sum expense entries for this category in the month.
		// Expense entries are positive amounts on expense-type accounts.
		entries, err := s.client.TransactionEntry.Query().
			Where(
				transactionentry.HasTransactionWith(
					transaction.HasHouseholdWith(household.ID(householdID)),
					transaction.HasCategoryWith(category.ID(catID)),
					transaction.DateGTE(start),
					transaction.DateLT(end),
				),
				transactionentry.HasAccountWith(
					account.TypeEQ(account.TypeExpense),
				),
				transactionentry.AmountCentsGT(0),
			).
			All(ctx)
		if err != nil {
			return nil, fmt.Errorf("querying entries for category %d: %w", catID, err)
		}

		var spent int64
		for _, e := range entries {
			spent += e.AmountCents
		}

		results = append(results, BudgetProgress{
			BudgetID:    b.ID,
			CategoryID:  catID,
			Month:       b.Month,
			AmountCents: b.AmountCents,
			SpentCents:  spent,
			Rollover:    b.Rollover,
		})
	}

	return results, nil
}
