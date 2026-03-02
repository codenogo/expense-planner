package service

import (
	"context"
	"strings"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func TestParseCSV_SingleAmountColumn(t *testing.T) {
	// KCB-style: single amount column, negative = expense
	csv := `Date,Description,Amount,Balance
01/03/2026,MPESA TRANSFER,-5000.00,45000.00
02/03/2026,SALARY CREDIT,100000.00,145000.00
03/03/2026,ATM WITHDRAWAL,-2000.50,143000.00`

	mapping := ColumnMapping{
		DateCol:        0,
		AmountCol:      intPtr(2),
		DescriptionCol: 1,
		DateFormat:     "02/01/2006",
		SkipRows:       1,
	}

	rows, err := ParseCSV(strings.NewReader(csv), mapping)
	if err != nil {
		t.Fatalf("ParseCSV failed: %v", err)
	}

	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(rows))
	}

	// Row 0: expense (negative amount)
	if rows[0].AmountCents != -500000 {
		t.Errorf("row 0 amount = %d, want -500000", rows[0].AmountCents)
	}
	if rows[0].Description != "MPESA TRANSFER" {
		t.Errorf("row 0 description = %q, want %q", rows[0].Description, "MPESA TRANSFER")
	}
	expectedDate := time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC)
	if !rows[0].Date.Equal(expectedDate) {
		t.Errorf("row 0 date = %v, want %v", rows[0].Date, expectedDate)
	}

	// Row 1: income (positive amount)
	if rows[1].AmountCents != 10000000 {
		t.Errorf("row 1 amount = %d, want 10000000", rows[1].AmountCents)
	}

	// Row 2: expense with cents
	if rows[2].AmountCents != -200050 {
		t.Errorf("row 2 amount = %d, want -200050", rows[2].AmountCents)
	}
}

func TestParseCSV_SplitDebitCredit(t *testing.T) {
	// Equity-style: separate debit/credit columns
	csv := `Date,Description,Debit,Credit,Balance
01-Mar-2026,ATM WITHDRAWAL,5000.00,,40000.00
02-Mar-2026,SALARY,,100000.00,140000.00
03-Mar-2026,SHOPPING,1500.00,,138500.00`

	mapping := ColumnMapping{
		DateCol:        0,
		DescriptionCol: 1,
		DebitCol:       intPtr(2),
		CreditCol:     intPtr(3),
		DateFormat:     "02-Jan-2006",
		SkipRows:       1,
	}

	rows, err := ParseCSV(strings.NewReader(csv), mapping)
	if err != nil {
		t.Fatalf("ParseCSV failed: %v", err)
	}

	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(rows))
	}

	// Row 0: debit (expense, stored as negative)
	if rows[0].AmountCents != -500000 {
		t.Errorf("row 0 amount = %d, want -500000", rows[0].AmountCents)
	}

	// Row 1: credit (income, stored as positive)
	if rows[1].AmountCents != 10000000 {
		t.Errorf("row 1 amount = %d, want 10000000", rows[1].AmountCents)
	}

	// Row 2: debit
	if rows[2].AmountCents != -150000 {
		t.Errorf("row 2 amount = %d, want -150000", rows[2].AmountCents)
	}
}

func TestParseCSV_MPESAFormat(t *testing.T) {
	// M-PESA statement: "Paid In" and "Withdrawn" columns
	csv := `Receipt No,Completion Time,Details,Transaction Status,Paid In,Withdrawn,Balance
ABC123,01/03/2026 10:30:00,Payment to XYZ,Completed,,5000.00,45000.00
DEF456,02/03/2026 08:00:00,Salary from ABC,Completed,100000.00,,145000.00`

	mapping := ColumnMapping{
		DateCol:        1,
		DescriptionCol: 2,
		CreditCol:     intPtr(4),
		DebitCol:       intPtr(5),
		DateFormat:     "02/01/2006 15:04:05",
		SkipRows:       1,
	}

	rows, err := ParseCSV(strings.NewReader(csv), mapping)
	if err != nil {
		t.Fatalf("ParseCSV failed: %v", err)
	}

	if len(rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(rows))
	}

	// Row 0: withdrawal (expense)
	if rows[0].AmountCents != -500000 {
		t.Errorf("row 0 amount = %d, want -500000", rows[0].AmountCents)
	}
	if rows[0].Description != "Payment to XYZ" {
		t.Errorf("row 0 description = %q, want %q", rows[0].Description, "Payment to XYZ")
	}

	// Row 1: paid in (income)
	if rows[1].AmountCents != 10000000 {
		t.Errorf("row 1 amount = %d, want 10000000", rows[1].AmountCents)
	}
}

func TestParseCSV_EmptyInput(t *testing.T) {
	csv := ``
	mapping := ColumnMapping{
		DateCol:        0,
		AmountCol:      intPtr(1),
		DescriptionCol: 2,
		DateFormat:     "02/01/2006",
		SkipRows:       0,
	}

	rows, err := ParseCSV(strings.NewReader(csv), mapping)
	if err != nil {
		t.Fatalf("ParseCSV failed: %v", err)
	}
	if len(rows) != 0 {
		t.Errorf("expected 0 rows, got %d", len(rows))
	}
}

func TestParseCSV_InvalidDate(t *testing.T) {
	csv := `Date,Amount,Description
not-a-date,5000.00,Test`

	mapping := ColumnMapping{
		DateCol:        0,
		AmountCol:      intPtr(1),
		DescriptionCol: 2,
		DateFormat:     "02/01/2006",
		SkipRows:       0,
	}

	_, err := ParseCSV(strings.NewReader(csv), mapping)
	if err == nil {
		t.Error("expected error for invalid date, got nil")
	}
}

func TestParseCSV_InvalidAmount(t *testing.T) {
	csv := `Date,Amount,Description
01/03/2026,not-a-number,Test`

	mapping := ColumnMapping{
		DateCol:        0,
		AmountCol:      intPtr(1),
		DescriptionCol: 2,
		DateFormat:     "02/01/2006",
		SkipRows:       0,
	}

	_, err := ParseCSV(strings.NewReader(csv), mapping)
	if err == nil {
		t.Error("expected error for invalid amount, got nil")
	}
}

func TestImportPreview(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()
	ctx := context.Background()

	householdID, _, _, _, _, _ := createTestFixtures(t, client)

	// Create additional categories with keyword-matching names.
	transport, err := client.Category.Create().
		SetName("Transport").
		SetHouseholdID(householdID).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating transport category: %v", err)
	}

	svc := NewImportService(client, NewTransactionService(client))

	rows := []ImportRow{
		{Date: time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC), AmountCents: -500000, Description: "UBER TRANSPORT"},
		{Date: time.Date(2026, 3, 2, 0, 0, 0, 0, time.UTC), AmountCents: 10000000, Description: "SALARY CREDIT"},
	}

	previews, err := svc.PreviewImport(ctx, householdID, rows)
	if err != nil {
		t.Fatalf("PreviewImport failed: %v", err)
	}

	if len(previews) != 2 {
		t.Fatalf("expected 2 preview rows, got %d", len(previews))
	}

	// "UBER TRANSPORT" should match "Transport" category.
	if previews[0].SuggestedCategoryID == nil || *previews[0].SuggestedCategoryID != transport.ID {
		t.Errorf("expected suggested category %d for transport, got %v", transport.ID, previews[0].SuggestedCategoryID)
	}
}

func TestImportCommit(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()
	ctx := context.Background()

	householdID, userID, assetAcctID, expenseAcctID, _, categoryID := createTestFixtures(t, client)

	svc := NewImportService(client, NewTransactionService(client))

	commitRows := []CommitRow{
		{
			Date:        time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC),
			AmountCents: -500000,
			Description: "Groceries at Naivas",
			CategoryID:  categoryID,
		},
		{
			Date:        time.Date(2026, 3, 2, 0, 0, 0, 0, time.UTC),
			AmountCents: -200000,
			Description: "Shopping at Carrefour",
			CategoryID:  categoryID,
		},
	}

	summary, err := svc.CommitImport(ctx, CommitImportInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AssetAcctID:   assetAcctID,
		ExpenseAcctID: expenseAcctID,
		Rows:          commitRows,
	})
	if err != nil {
		t.Fatalf("CommitImport failed: %v", err)
	}

	if summary.TotalImported != 2 {
		t.Errorf("total imported = %d, want 2", summary.TotalImported)
	}
	if summary.SkippedDuplicates != 0 {
		t.Errorf("skipped duplicates = %d, want 0", summary.SkippedDuplicates)
	}
	if summary.TotalAmountCents != 700000 {
		t.Errorf("total amount = %d, want 700000", summary.TotalAmountCents)
	}
}

func TestImportCommit_SkipDuplicates(t *testing.T) {
	client := setupTestDB(t)
	defer client.Close()
	ctx := context.Background()

	householdID, userID, assetAcctID, expenseAcctID, _, categoryID := createTestFixtures(t, client)

	txnSvc := NewTransactionService(client)
	svc := NewImportService(client, txnSvc)

	// Create an existing transaction that matches one of the import rows.
	_, err := txnSvc.AddExpense(ctx, AddExpenseInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AmountCents:   500000,
		CategoryID:    categoryID,
		ExpenseAcctID: expenseAcctID,
		AssetAcctID:   assetAcctID,
		Description:   "Groceries at Naivas",
		Date:          time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("creating existing transaction: %v", err)
	}

	commitRows := []CommitRow{
		{
			Date:        time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC),
			AmountCents: -500000, // Same date + abs(amount) + description = duplicate
			Description: "Groceries at Naivas",
			CategoryID:  categoryID,
		},
		{
			Date:        time.Date(2026, 3, 2, 0, 0, 0, 0, time.UTC),
			AmountCents: -200000,
			Description: "Shopping at Carrefour",
			CategoryID:  categoryID,
		},
	}

	summary, err := svc.CommitImport(ctx, CommitImportInput{
		HouseholdID:   householdID,
		UserID:        userID,
		AssetAcctID:   assetAcctID,
		ExpenseAcctID: expenseAcctID,
		Rows:          commitRows,
	})
	if err != nil {
		t.Fatalf("CommitImport failed: %v", err)
	}

	if summary.TotalImported != 1 {
		t.Errorf("total imported = %d, want 1 (one duplicate skipped)", summary.TotalImported)
	}
	if summary.SkippedDuplicates != 1 {
		t.Errorf("skipped duplicates = %d, want 1", summary.SkippedDuplicates)
	}
}

func intPtr(i int) *int {
	return &i
}
