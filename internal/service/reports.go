package service

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/account"
	"github.com/expenser/expense-planner/ent/budget"
	"github.com/expenser/expense-planner/ent/household"
	"github.com/expenser/expense-planner/ent/transaction"
	"github.com/expenser/expense-planner/ent/transactionentry"
)

// ReportService handles reporting and aggregation queries.
type ReportService struct {
	client *ent.Client
}

// NewReportService creates a new ReportService.
func NewReportService(client *ent.Client) *ReportService {
	return &ReportService{client: client}
}

// CategorySpend represents spending in a single category.
type CategorySpend struct {
	CategoryID int
	Name       string
	TotalCents int64
	Percentage float64
}

// SpendingByCategory returns expense totals grouped by category for a date range,
// sorted by total descending with percentage of overall spending.
func (s *ReportService) SpendingByCategory(ctx context.Context, householdID int, startDate, endDate time.Time) ([]CategorySpend, error) {
	// Fetch all expense entries within the date range for this household.
	entries, err := s.client.TransactionEntry.Query().
		Where(
			transactionentry.HasTransactionWith(
				transaction.HasHouseholdWith(household.ID(householdID)),
				transaction.DateGTE(startDate),
				transaction.DateLT(endDate),
			),
			transactionentry.HasAccountWith(
				account.TypeEQ(account.TypeExpense),
			),
			transactionentry.AmountCentsGT(0),
		).
		WithTransaction(func(q *ent.TransactionQuery) {
			q.WithCategory()
		}).
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("querying expense entries: %w", err)
	}

	// Aggregate by category.
	catTotals := make(map[int]*CategorySpend)
	var grandTotal int64

	for _, e := range entries {
		txn := e.Edges.Transaction
		if txn == nil || txn.Edges.Category == nil {
			continue
		}
		cat := txn.Edges.Category

		cs, ok := catTotals[cat.ID]
		if !ok {
			cs = &CategorySpend{CategoryID: cat.ID, Name: cat.Name}
			catTotals[cat.ID] = cs
		}
		cs.TotalCents += e.AmountCents
		grandTotal += e.AmountCents
	}

	// Convert to slice, calculate percentages, and sort.
	results := make([]CategorySpend, 0, len(catTotals))
	for _, cs := range catTotals {
		if grandTotal > 0 {
			cs.Percentage = float64(cs.TotalCents) / float64(grandTotal) * 100
		}
		results = append(results, *cs)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].TotalCents > results[j].TotalCents
	})

	return results, nil
}

// MonthSummary represents income, expense, and net totals for a single month.
type MonthSummary struct {
	Month        string // YYYY-MM format
	IncomeCents  int64
	ExpenseCents int64
	NetCents     int64
}

// MonthlyTrend returns income, expense, and net totals per month for the last N months
// from the reference date. Months with no data return zeros.
func (s *ReportService) MonthlyTrend(ctx context.Context, householdID int, months int, ref time.Time) ([]MonthSummary, error) {
	// Calculate the start of the range (N months back from the start of ref's month).
	refStart := time.Date(ref.Year(), ref.Month(), 1, 0, 0, 0, 0, time.UTC)
	rangeStart := refStart.AddDate(0, -(months-1), 0)
	rangeEnd := refStart.AddDate(0, 1, 0)

	// Initialize all months with zeros.
	summaries := make([]MonthSummary, months)
	monthIndex := make(map[string]int)
	for i := 0; i < months; i++ {
		m := rangeStart.AddDate(0, i, 0)
		key := m.Format("2006-01")
		summaries[i] = MonthSummary{Month: key}
		monthIndex[key] = i
	}

	// Fetch all transaction entries in the range.
	entries, err := s.client.TransactionEntry.Query().
		Where(
			transactionentry.HasTransactionWith(
				transaction.HasHouseholdWith(household.ID(householdID)),
				transaction.DateGTE(rangeStart),
				transaction.DateLT(rangeEnd),
			),
		).
		WithTransaction().
		WithAccount().
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("querying entries for trend: %w", err)
	}

	for _, e := range entries {
		txn := e.Edges.Transaction
		acct := e.Edges.Account
		if txn == nil || acct == nil {
			continue
		}

		monthKey := txn.Date.Format("2006-01")
		idx, ok := monthIndex[monthKey]
		if !ok {
			continue
		}

		switch acct.Type {
		case account.TypeExpense:
			if e.AmountCents > 0 {
				summaries[idx].ExpenseCents += e.AmountCents
			}
		case account.TypeIncome:
			// Income entries on income accounts are negative (credit).
			// Take absolute value.
			if e.AmountCents < 0 {
				summaries[idx].IncomeCents += -e.AmountCents
			}
		}
	}

	// Calculate net for each month.
	for i := range summaries {
		summaries[i].NetCents = summaries[i].IncomeCents - summaries[i].ExpenseCents
	}

	return summaries, nil
}

// DashboardSummary holds aggregated data for the household dashboard.
type DashboardSummary struct {
	TotalBalanceCents  int64
	TotalIncomeCents   int64
	TotalSpendingCents int64
	SafeToSpendCents   int64
	RecentTransactions []*ent.Transaction
}

// GetDashboardSummary returns an overview for the household dashboard:
// total asset balance, current-month income and spending, safe-to-spend
// (balance minus remaining budgeted amounts), and the 10 most recent transactions.
func (s *ReportService) GetDashboardSummary(ctx context.Context, householdID int) (*DashboardSummary, error) {
	now := time.Now().UTC()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, 0)

	// Total balance: sum of all asset account balances.
	assetAccounts, err := s.client.Account.Query().
		Where(
			account.HasHouseholdWith(household.ID(householdID)),
			account.TypeEQ(account.TypeAsset),
		).
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("querying asset accounts: %w", err)
	}
	var totalBalance int64
	for _, a := range assetAccounts {
		totalBalance += a.BalanceCents
	}

	// Current month income and spending via MonthlyTrend(1 month).
	trend, err := s.MonthlyTrend(ctx, householdID, 1, now)
	if err != nil {
		return nil, fmt.Errorf("computing monthly trend: %w", err)
	}
	var totalIncome, totalSpending int64
	if len(trend) > 0 {
		totalIncome = trend[0].IncomeCents
		totalSpending = trend[0].ExpenseCents
	}

	// Safe-to-spend: balance minus sum of remaining budget for current month.
	// Remaining budget = max(0, budgeted - spent) per category.
	monthKey := monthStart.Format("2006-01")
	budgets, err := s.client.Budget.Query().
		Where(
			budget.HasHouseholdWith(household.ID(householdID)),
			budget.MonthEQ(monthKey),
		).
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("querying budgets: %w", err)
	}

	var totalBudgeted int64
	for _, b := range budgets {
		totalBudgeted += b.AmountCents
	}
	// Remaining commitment = total budgeted - already spent (capped at 0).
	remaining := totalBudgeted - totalSpending
	if remaining < 0 {
		remaining = 0
	}
	safeToSpend := totalBalance - remaining

	// Recent transactions: last 10 by date descending.
	recentTxns, err := s.client.Transaction.Query().
		Where(
			transaction.HasHouseholdWith(household.ID(householdID)),
			transaction.DateGTE(monthStart),
			transaction.DateLT(monthEnd),
		).
		Order(ent.Desc(transaction.FieldDate)).
		Limit(10).
		WithCategory().
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("querying recent transactions: %w", err)
	}

	return &DashboardSummary{
		TotalBalanceCents:  totalBalance,
		TotalIncomeCents:   totalIncome,
		TotalSpendingCents: totalSpending,
		SafeToSpendCents:   safeToSpend,
		RecentTransactions: recentTxns,
	}, nil
}
