package service

import (
	"context"
	"testing"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/enttest"

	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates an in-memory SQLite client with auto-migration.
func setupTestDB(t *testing.T) *ent.Client {
	t.Helper()
	return enttest.Open(t, "sqlite3", "file:ent?mode=memory&_fk=1")
}

// createTestFixtures sets up a household, user, and accounts for testing.
func createTestFixtures(t *testing.T, client *ent.Client) (householdID, userID, assetAcctID, expenseAcctID, incomeAcctID, categoryID int) {
	t.Helper()
	ctx := context.Background()

	user, err := client.User.Create().
		SetName("Test User").
		SetEmail("test@example.com").
		SetPasswordHash("hashed").
		Save(ctx)
	if err != nil {
		t.Fatalf("creating test user: %v", err)
	}

	household, err := client.Household.Create().
		SetName("Test Household").
		Save(ctx)
	if err != nil {
		t.Fatalf("creating test household: %v", err)
	}

	assetAcct, err := client.Account.Create().
		SetName("Cash").
		SetType("asset").
		SetHouseholdID(household.ID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating asset account: %v", err)
	}

	expenseAcct, err := client.Account.Create().
		SetName("Food Expenses").
		SetType("expense").
		SetHouseholdID(household.ID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating expense account: %v", err)
	}

	incomeAcct, err := client.Account.Create().
		SetName("Salary").
		SetType("income").
		SetHouseholdID(household.ID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating income account: %v", err)
	}

	category, err := client.Category.Create().
		SetName("Food").
		SetIsSystem(true).
		SetHouseholdID(household.ID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating test category: %v", err)
	}

	return household.ID, user.ID, assetAcct.ID, expenseAcct.ID, incomeAcct.ID, category.ID
}

func TestAddExpense(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	householdID, userID, assetAcctID, expenseAcctID, _, categoryID := createTestFixtures(t, client)
	svc := NewTransactionService(client)
	ctx := context.Background()

	txn, err := svc.AddExpense(ctx, AddExpenseInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AmountCents:   50000, // KES 500
		CategoryID:    categoryID,
		ExpenseAcctID: expenseAcctID,
		AssetAcctID:   assetAcctID,
		Description:   "Groceries at Naivas",
		Date:          time.Now(),
	})
	if err != nil {
		t.Fatalf("AddExpense failed: %v", err)
	}

	if txn.Description != "Groceries at Naivas" {
		t.Errorf("expected description 'Groceries at Naivas', got %q", txn.Description)
	}

	// Verify entries sum to zero.
	entries, err := client.TransactionEntry.Query().
		Where().
		All(ctx)
	if err != nil {
		t.Fatalf("querying entries: %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	var sum int64
	for _, e := range entries {
		sum += e.AmountCents
	}
	if sum != 0 {
		t.Errorf("double-entry invariant violated: entries sum = %d, want 0", sum)
	}

	// Verify account balances.
	expenseAcct, err := client.Account.Get(ctx, expenseAcctID)
	if err != nil {
		t.Fatalf("getting expense account: %v", err)
	}
	if expenseAcct.BalanceCents != 50000 {
		t.Errorf("expense account balance = %d, want 50000", expenseAcct.BalanceCents)
	}

	assetAcct, err := client.Account.Get(ctx, assetAcctID)
	if err != nil {
		t.Fatalf("getting asset account: %v", err)
	}
	if assetAcct.BalanceCents != -50000 {
		t.Errorf("asset account balance = %d, want -50000", assetAcct.BalanceCents)
	}
}

func TestAddIncome(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	householdID, userID, assetAcctID, _, incomeAcctID, categoryID := createTestFixtures(t, client)
	svc := NewTransactionService(client)
	ctx := context.Background()

	txn, err := svc.AddIncome(ctx, AddIncomeInput{
		HouseholdID:  householdID,
		UserID:       userID,
		AmountCents:  100000, // KES 1000
		CategoryID:   categoryID,
		IncomeAcctID: incomeAcctID,
		AssetAcctID:  assetAcctID,
		Description:  "March salary",
		Date:         time.Now(),
	})
	if err != nil {
		t.Fatalf("AddIncome failed: %v", err)
	}

	if txn.Description != "March salary" {
		t.Errorf("expected description 'March salary', got %q", txn.Description)
	}

	// Verify entries sum to zero.
	entries, err := client.TransactionEntry.Query().All(ctx)
	if err != nil {
		t.Fatalf("querying entries: %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	var sum int64
	for _, e := range entries {
		sum += e.AmountCents
	}
	if sum != 0 {
		t.Errorf("double-entry invariant violated: entries sum = %d, want 0", sum)
	}

	// Verify account balances.
	assetAcct, err := client.Account.Get(ctx, assetAcctID)
	if err != nil {
		t.Fatalf("getting asset account: %v", err)
	}
	if assetAcct.BalanceCents != 100000 {
		t.Errorf("asset account balance = %d, want 100000", assetAcct.BalanceCents)
	}

	incomeAcct, err := client.Account.Get(ctx, incomeAcctID)
	if err != nil {
		t.Fatalf("getting income account: %v", err)
	}
	if incomeAcct.BalanceCents != -100000 {
		t.Errorf("income account balance = %d, want -100000", incomeAcct.BalanceCents)
	}
}

func TestAddExpense_InvalidAmount(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	svc := NewTransactionService(client)
	ctx := context.Background()

	_, err := svc.AddExpense(ctx, AddExpenseInput{AmountCents: 0})
	if err == nil {
		t.Error("expected error for zero amount, got nil")
	}

	_, err = svc.AddExpense(ctx, AddExpenseInput{AmountCents: -100})
	if err == nil {
		t.Error("expected error for negative amount, got nil")
	}
}

func TestAddIncome_InvalidAmount(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	svc := NewTransactionService(client)
	ctx := context.Background()

	_, err := svc.AddIncome(ctx, AddIncomeInput{AmountCents: 0})
	if err == nil {
		t.Error("expected error for zero amount, got nil")
	}

	_, err = svc.AddIncome(ctx, AddIncomeInput{AmountCents: -100})
	if err == nil {
		t.Error("expected error for negative amount, got nil")
	}
}

func TestExpenseThenIncome_BalancesAccumulate(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()

	householdID, userID, assetAcctID, expenseAcctID, incomeAcctID, categoryID := createTestFixtures(t, client)
	svc := NewTransactionService(client)
	ctx := context.Background()

	// Record an expense of 500.
	_, err := svc.AddExpense(ctx, AddExpenseInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AmountCents:   50000,
		CategoryID:    categoryID,
		ExpenseAcctID: expenseAcctID,
		AssetAcctID:   assetAcctID,
		Description:   "Lunch",
		Date:          time.Now(),
	})
	if err != nil {
		t.Fatalf("AddExpense failed: %v", err)
	}

	// Record income of 1000.
	_, err = svc.AddIncome(ctx, AddIncomeInput{
		HouseholdID:  householdID,
		UserID:       userID,
		AmountCents:  100000,
		CategoryID:   categoryID,
		IncomeAcctID: incomeAcctID,
		AssetAcctID:  assetAcctID,
		Description:  "Salary",
		Date:         time.Now(),
	})
	if err != nil {
		t.Fatalf("AddIncome failed: %v", err)
	}

	// Asset account: -500 (expense) + 1000 (income) = +500.
	assetAcct, err := client.Account.Get(ctx, assetAcctID)
	if err != nil {
		t.Fatalf("getting asset account: %v", err)
	}
	if assetAcct.BalanceCents != 50000 {
		t.Errorf("asset account balance = %d, want 50000", assetAcct.BalanceCents)
	}

	// Expense account: +500.
	expenseAcct, err := client.Account.Get(ctx, expenseAcctID)
	if err != nil {
		t.Fatalf("getting expense account: %v", err)
	}
	if expenseAcct.BalanceCents != 50000 {
		t.Errorf("expense account balance = %d, want 50000", expenseAcct.BalanceCents)
	}

	// Income account: -1000.
	incomeAcct, err := client.Account.Get(ctx, incomeAcctID)
	if err != nil {
		t.Fatalf("getting income account: %v", err)
	}
	if incomeAcct.BalanceCents != -100000 {
		t.Errorf("income account balance = %d, want -100000", incomeAcct.BalanceCents)
	}

	// All entries across both transactions sum to zero.
	entries, err := client.TransactionEntry.Query().All(ctx)
	if err != nil {
		t.Fatalf("querying entries: %v", err)
	}
	if len(entries) != 4 {
		t.Fatalf("expected 4 entries, got %d", len(entries))
	}
	var sum int64
	for _, e := range entries {
		sum += e.AmountCents
	}
	if sum != 0 {
		t.Errorf("global double-entry invariant violated: sum = %d, want 0", sum)
	}
}
