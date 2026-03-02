package service

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/category"
	"github.com/expenser/expense-planner/ent/household"
	"github.com/expenser/expense-planner/ent/transaction"
	"github.com/expenser/expense-planner/ent/transactionentry"
)

// ColumnMapping defines which CSV columns map to which fields.
type ColumnMapping struct {
	DateCol        int    // Column index for date
	AmountCol      *int   // Column index for single amount (negative=expense, positive=income)
	DescriptionCol int    // Column index for description
	DebitCol       *int   // Column index for debit/withdrawal (optional, for split format)
	CreditCol      *int   // Column index for credit/deposit (optional, for split format)
	DateFormat     string // Go time format string
	SkipRows       int    // Number of header rows to skip
}

// ImportRow represents a single parsed row from a bank CSV.
type ImportRow struct {
	Date        time.Time
	AmountCents int64 // Positive = income, negative = expense
	Description string
	RawRow      []string
}

// ParseCSV reads a CSV from the given reader using the column mapping
// and returns structured import rows.
func ParseCSV(r io.Reader, mapping ColumnMapping) ([]ImportRow, error) {
	reader := csv.NewReader(r)
	reader.LazyQuotes = true
	reader.TrimLeadingSpace = true

	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("reading CSV: %w", err)
	}

	// Skip header rows.
	if mapping.SkipRows >= len(records) {
		return nil, nil
	}
	records = records[mapping.SkipRows:]

	rows := make([]ImportRow, 0, len(records))
	for i, record := range records {
		lineNum := i + mapping.SkipRows + 1

		if len(record) == 0 {
			continue
		}

		row, err := parseRow(record, mapping, lineNum)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	return rows, nil
}

func parseRow(record []string, mapping ColumnMapping, lineNum int) (ImportRow, error) {
	if err := validateColumnIndex(record, mapping.DateCol, "date", lineNum); err != nil {
		return ImportRow{}, err
	}
	if err := validateColumnIndex(record, mapping.DescriptionCol, "description", lineNum); err != nil {
		return ImportRow{}, err
	}

	dateStr := strings.TrimSpace(record[mapping.DateCol])
	date, err := time.Parse(mapping.DateFormat, dateStr)
	if err != nil {
		return ImportRow{}, fmt.Errorf("line %d: parsing date %q with format %q: %w", lineNum, dateStr, mapping.DateFormat, err)
	}

	amountCents, err := parseAmount(record, mapping, lineNum)
	if err != nil {
		return ImportRow{}, err
	}

	description := strings.TrimSpace(record[mapping.DescriptionCol])

	return ImportRow{
		Date:        date,
		AmountCents: amountCents,
		Description: description,
		RawRow:      record,
	}, nil
}

func parseAmount(record []string, mapping ColumnMapping, lineNum int) (int64, error) {
	if mapping.AmountCol != nil {
		// Single amount column: negative = expense, positive = income.
		if err := validateColumnIndex(record, *mapping.AmountCol, "amount", lineNum); err != nil {
			return 0, err
		}
		return parseCentsFromString(record[*mapping.AmountCol], lineNum, "amount")
	}

	if mapping.DebitCol != nil && mapping.CreditCol != nil {
		// Split debit/credit columns.
		if err := validateColumnIndex(record, *mapping.DebitCol, "debit", lineNum); err != nil {
			return 0, err
		}
		if err := validateColumnIndex(record, *mapping.CreditCol, "credit", lineNum); err != nil {
			return 0, err
		}

		debitStr := strings.TrimSpace(record[*mapping.DebitCol])
		creditStr := strings.TrimSpace(record[*mapping.CreditCol])

		if debitStr != "" {
			cents, err := parseCentsFromString(debitStr, lineNum, "debit")
			if err != nil {
				return 0, err
			}
			// Debits are expenses (store as negative).
			if cents > 0 {
				cents = -cents
			}
			return cents, nil
		}

		if creditStr != "" {
			cents, err := parseCentsFromString(creditStr, lineNum, "credit")
			if err != nil {
				return 0, err
			}
			// Credits are income (store as positive).
			if cents < 0 {
				cents = -cents
			}
			return cents, nil
		}

		// Both empty — zero amount row.
		return 0, nil
	}

	return 0, fmt.Errorf("line %d: column mapping must specify either AmountCol or both DebitCol and CreditCol", lineNum)
}

func parseCentsFromString(s string, lineNum int, field string) (int64, error) {
	s = strings.TrimSpace(s)
	// Remove commas used as thousands separators.
	s = strings.ReplaceAll(s, ",", "")

	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, fmt.Errorf("line %d: parsing %s %q: %w", lineNum, field, s, err)
	}

	// Convert to cents: multiply by 100 and round to avoid float precision issues.
	cents := int64(math.Round(f * 100))
	return cents, nil
}

func validateColumnIndex(record []string, col int, name string, lineNum int) error {
	if col < 0 || col >= len(record) {
		return fmt.Errorf("line %d: %s column index %d out of range (row has %d columns)", lineNum, name, col, len(record))
	}
	return nil
}

// ImportService handles CSV import preview and commit.
type ImportService struct {
	client *ent.Client
	txnSvc *TransactionService
}

// NewImportService creates a new ImportService.
func NewImportService(client *ent.Client, txnSvc *TransactionService) *ImportService {
	return &ImportService{client: client, txnSvc: txnSvc}
}

// PreviewRow is an import row with a suggested category.
type PreviewRow struct {
	ImportRow
	SuggestedCategoryID   *int
	SuggestedCategoryName string
}

// CommitRow is a confirmed row ready to be imported as a transaction.
type CommitRow struct {
	Date        time.Time
	AmountCents int64
	Description string
	CategoryID  int
}

// CommitImportInput holds the parameters for committing an import.
type CommitImportInput struct {
	HouseholdID   int
	UserID        int
	AssetAcctID   int
	ExpenseAcctID int
	IncomeAcctID  int
	Rows          []CommitRow
}

// ImportSummary reports the result of a committed import.
type ImportSummary struct {
	TotalImported    int
	SkippedDuplicates int
	TotalAmountCents int64
}

// PreviewImport parses import rows and suggests categories by keyword matching.
func (s *ImportService) PreviewImport(ctx context.Context, householdID int, rows []ImportRow) ([]PreviewRow, error) {
	// Load all categories for this household.
	categories, err := s.client.Category.Query().
		Where(
			category.HasHouseholdWith(household.ID(householdID)),
		).
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("loading categories: %w", err)
	}

	previews := make([]PreviewRow, 0, len(rows))
	for _, row := range rows {
		pr := PreviewRow{ImportRow: row}

		// Try to match description to a category by keyword (case-insensitive).
		descUpper := strings.ToUpper(row.Description)
		for _, cat := range categories {
			if strings.Contains(descUpper, strings.ToUpper(cat.Name)) {
				pr.SuggestedCategoryID = &cat.ID
				pr.SuggestedCategoryName = cat.Name
				break
			}
		}

		previews = append(previews, pr)
	}

	return previews, nil
}

// CommitImport creates transactions for confirmed import rows, skipping duplicates.
func (s *ImportService) CommitImport(ctx context.Context, input CommitImportInput) (*ImportSummary, error) {
	summary := &ImportSummary{}

	for _, row := range input.Rows {
		// Check for duplicate: same date + absolute amount + description in household.
		absAmount := row.AmountCents
		if absAmount < 0 {
			absAmount = -absAmount
		}

		exists, err := s.isDuplicate(ctx, input.HouseholdID, row.Date, absAmount, row.Description)
		if err != nil {
			return nil, fmt.Errorf("checking duplicate: %w", err)
		}
		if exists {
			summary.SkippedDuplicates++
			continue
		}

		// Create transaction based on sign of amount.
		if row.AmountCents < 0 {
			_, err = s.txnSvc.AddExpense(ctx, AddExpenseInput{
				HouseholdID:   input.HouseholdID,
				UserID:        input.UserID,
				AmountCents:   -row.AmountCents, // AddExpense expects positive
				CategoryID:    row.CategoryID,
				ExpenseAcctID: input.ExpenseAcctID,
				AssetAcctID:   input.AssetAcctID,
				Description:   row.Description,
				Date:          row.Date,
			})
		} else if row.AmountCents > 0 && input.IncomeAcctID != 0 {
			_, err = s.txnSvc.AddIncome(ctx, AddIncomeInput{
				HouseholdID:  input.HouseholdID,
				UserID:       input.UserID,
				AmountCents:  row.AmountCents,
				CategoryID:   row.CategoryID,
				IncomeAcctID: input.IncomeAcctID,
				AssetAcctID:  input.AssetAcctID,
				Description:  row.Description,
				Date:         row.Date,
			})
		} else {
			continue // Skip zero-amount rows.
		}

		if err != nil {
			return nil, fmt.Errorf("creating transaction for %q: %w", row.Description, err)
		}

		summary.TotalImported++
		summary.TotalAmountCents += absAmount
	}

	return summary, nil
}

// isDuplicate checks if a transaction with the same date, amount, and description
// already exists in the household.
func (s *ImportService) isDuplicate(ctx context.Context, householdID int, date time.Time, absAmountCents int64, description string) (bool, error) {
	count, err := s.client.Transaction.Query().
		Where(
			transaction.HasHouseholdWith(household.ID(householdID)),
			transaction.DateEQ(date),
			transaction.DescriptionEQ(description),
			transaction.HasEntriesWith(
				transactionentry.AmountCentsEQ(absAmountCents),
			),
		).
		Count(ctx)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
