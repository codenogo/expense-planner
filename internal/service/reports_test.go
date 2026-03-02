package service

import (
	"context"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func TestSpendingByCategory(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()
	ctx := context.Background()

	householdID, userID, assetAcctID, expenseAcctID, _, categoryID := createTestFixtures(t, client)

	// Create a second category.
	cat2, err := client.Category.Create().
		SetName("Transport").
		SetHouseholdID(householdID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating category: %v", err)
	}

	txnSvc := NewTransactionService(client)

	// Add expenses in different categories.
	_, err = txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID: householdID, UserID: userID, AmountCents: 30000,
		CategoryID: categoryID, ExpenseAcctID: expenseAcctID, AssetAcctID: assetAcctID,
		Description: "Groceries", Date: time.Date(2026, 3, 5, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("AddExpense: %v", err)
	}

	_, err = txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID: householdID, UserID: userID, AmountCents: 20000,
		CategoryID: categoryID, ExpenseAcctID: expenseAcctID, AssetAcctID: assetAcctID,
		Description: "More groceries", Date: time.Date(2026, 3, 10, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("AddExpense: %v", err)
	}

	_, err = txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID: householdID, UserID: userID, AmountCents: 50000,
		CategoryID: cat2.ID, ExpenseAcctID: expenseAcctID, AssetAcctID: assetAcctID,
		Description: "Uber ride", Date: time.Date(2026, 3, 8, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("AddExpense: %v", err)
	}

	svc := NewReportService(client)

	start := time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)

	results, err := svc.SpendingByCategory(ctx, householdID, start, end)
	if err != nil {
		t.Fatalf("SpendingByCategory: %v", err)
	}

	if len(results) != 2 {
		t.Fatalf("expected 2 categories, got %d", len(results))
	}

	// Results should be sorted by total descending.
	// Transport: 50000, Food: 30000 + 20000 = 50000 — both equal, but order is deterministic.
	total := results[0].TotalCents + results[1].TotalCents
	if total != 100000 {
		t.Errorf("total spending = %d, want 100000", total)
	}

	// Each category should be 50% since both have 50000.
	for _, r := range results {
		if r.TotalCents != 50000 {
			t.Errorf("category %q: total = %d, want 50000", r.Name, r.TotalCents)
		}
		if r.Percentage < 49.0 || r.Percentage > 51.0 {
			t.Errorf("category %q: percentage = %.1f, want ~50.0", r.Name, r.Percentage)
		}
	}
}

func TestSpendingByCategory_NoExpenses(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()
	ctx := context.Background()

	householdID, _, _, _, _, _ := createTestFixtures(t, client)

	svc := NewReportService(client)

	start := time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)

	results, err := svc.SpendingByCategory(ctx, householdID, start, end)
	if err != nil {
		t.Fatalf("SpendingByCategory: %v", err)
	}

	if len(results) != 0 {
		t.Errorf("expected 0 categories, got %d", len(results))
	}
}

func TestMonthlyTrend(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()
	ctx := context.Background()

	householdID, userID, assetAcctID, expenseAcctID, incomeAcctID, categoryID := createTestFixtures(t, client)

	txnSvc := NewTransactionService(client)

	// Add expense in March 2026.
	_, err := txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID: householdID, UserID: userID, AmountCents: 50000,
		CategoryID: categoryID, ExpenseAcctID: expenseAcctID, AssetAcctID: assetAcctID,
		Description: "Groceries", Date: time.Date(2026, 3, 5, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("AddExpense: %v", err)
	}

	// Add income in March 2026.
	_, err = txnSvc.AddIncome(ctx, AddIncomeInput{
		HouseholdID: householdID, UserID: userID, AmountCents: 200000,
		CategoryID: categoryID, IncomeAcctID: incomeAcctID, AssetAcctID: assetAcctID,
		Description: "Salary", Date: time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("AddIncome: %v", err)
	}

	// Add expense in February 2026.
	_, err = txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID: householdID, UserID: userID, AmountCents: 30000,
		CategoryID: categoryID, ExpenseAcctID: expenseAcctID, AssetAcctID: assetAcctID,
		Description: "Feb groceries", Date: time.Date(2026, 2, 15, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("AddExpense: %v", err)
	}

	svc := NewReportService(client)

	// Request last 3 months from March 2026.
	results, err := svc.MonthlyTrend(ctx, householdID, 3, time.Date(2026, 3, 15, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("MonthlyTrend: %v", err)
	}

	if len(results) != 3 {
		t.Fatalf("expected 3 months, got %d", len(results))
	}

	// Results should be sorted by month ascending: Jan, Feb, Mar.
	if results[0].Month != "2026-01" {
		t.Errorf("month 0 = %q, want 2026-01", results[0].Month)
	}
	if results[1].Month != "2026-02" {
		t.Errorf("month 1 = %q, want 2026-02", results[1].Month)
	}
	if results[2].Month != "2026-03" {
		t.Errorf("month 2 = %q, want 2026-03", results[2].Month)
	}

	// January: no data — all zeros.
	if results[0].IncomeCents != 0 || results[0].ExpenseCents != 0 || results[0].NetCents != 0 {
		t.Errorf("Jan: income=%d expense=%d net=%d, want all 0",
			results[0].IncomeCents, results[0].ExpenseCents, results[0].NetCents)
	}

	// February: expense 30000, no income.
	if results[1].ExpenseCents != 30000 {
		t.Errorf("Feb expense = %d, want 30000", results[1].ExpenseCents)
	}
	if results[1].IncomeCents != 0 {
		t.Errorf("Feb income = %d, want 0", results[1].IncomeCents)
	}
	if results[1].NetCents != -30000 {
		t.Errorf("Feb net = %d, want -30000", results[1].NetCents)
	}

	// March: income 200000, expense 50000, net 150000.
	if results[2].IncomeCents != 200000 {
		t.Errorf("Mar income = %d, want 200000", results[2].IncomeCents)
	}
	if results[2].ExpenseCents != 50000 {
		t.Errorf("Mar expense = %d, want 50000", results[2].ExpenseCents)
	}
	if results[2].NetCents != 150000 {
		t.Errorf("Mar net = %d, want 150000", results[2].NetCents)
	}
}
