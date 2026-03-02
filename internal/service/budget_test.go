package service

import (
	"context"
	"testing"
	"time"
)

func TestGetBudgetProgress(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	householdID, userID, assetAcctID, expenseAcctID, _, categoryID := createTestFixtures(t, client)
	ctx := context.Background()

	// Create a budget for the category.
	_, err := client.Budget.Create().
		SetMonth("2026-03").
		SetAmountCents(100000). // KES 1000 budget
		SetRollover(false).
		SetHouseholdID(householdID).
		SetCategoryID(categoryID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating budget: %v", err)
	}

	// Add an expense in the budget month.
	txnSvc := NewTransactionService(client)
	_, err = txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AmountCents:   30000, // KES 300
		CategoryID:    categoryID,
		ExpenseAcctID: expenseAcctID,
		AssetAcctID:   assetAcctID,
		Description:   "Groceries",
		Date:          time.Date(2026, 3, 15, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("adding expense: %v", err)
	}

	// Add another expense in the same month.
	_, err = txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AmountCents:   20000, // KES 200
		CategoryID:    categoryID,
		ExpenseAcctID: expenseAcctID,
		AssetAcctID:   assetAcctID,
		Description:   "Lunch",
		Date:          time.Date(2026, 3, 20, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("adding second expense: %v", err)
	}

	// Query budget progress.
	budgetSvc := NewBudgetService(client)
	progress, err := budgetSvc.GetBudgetProgress(ctx, householdID, "2026-03")
	if err != nil {
		t.Fatalf("GetBudgetProgress failed: %v", err)
	}

	if len(progress) != 1 {
		t.Fatalf("expected 1 budget progress, got %d", len(progress))
	}

	bp := progress[0]
	if bp.AmountCents != 100000 {
		t.Errorf("budget amount = %d, want 100000", bp.AmountCents)
	}
	if bp.SpentCents != 50000 {
		t.Errorf("spent = %d, want 50000", bp.SpentCents)
	}
	if bp.CategoryID != categoryID {
		t.Errorf("category ID = %d, want %d", bp.CategoryID, categoryID)
	}
}

func TestGetBudgetProgress_NoExpenses(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	householdID, _, _, _, _, categoryID := createTestFixtures(t, client)
	ctx := context.Background()

	// Create a budget with no expenses.
	_, err := client.Budget.Create().
		SetMonth("2026-04").
		SetAmountCents(50000).
		SetHouseholdID(householdID).
		SetCategoryID(categoryID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating budget: %v", err)
	}

	budgetSvc := NewBudgetService(client)
	progress, err := budgetSvc.GetBudgetProgress(ctx, householdID, "2026-04")
	if err != nil {
		t.Fatalf("GetBudgetProgress failed: %v", err)
	}

	if len(progress) != 1 {
		t.Fatalf("expected 1 budget progress, got %d", len(progress))
	}

	if progress[0].SpentCents != 0 {
		t.Errorf("spent = %d, want 0", progress[0].SpentCents)
	}
}

func TestGetBudgetProgress_InvalidMonth(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	budgetSvc := NewBudgetService(client)
	ctx := context.Background()

	_, err := budgetSvc.GetBudgetProgress(ctx, 1, "invalid")
	if err == nil {
		t.Error("expected error for invalid month format, got nil")
	}
}
