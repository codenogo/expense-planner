package service

import (
	"context"
	"fmt"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/account"
)

// TransactionService handles double-entry transaction creation.
type TransactionService struct {
	client *ent.Client
}

// NewTransactionService creates a new TransactionService.
func NewTransactionService(client *ent.Client) *TransactionService {
	return &TransactionService{client: client}
}

// AddExpenseInput holds the input for recording an expense.
type AddExpenseInput struct {
	HouseholdID    int
	UserID         int
	AmountCents    int64
	CategoryID     int
	ExpenseAcctID  int
	AssetAcctID    int
	Description    string
	Date           time.Time
}

// AddIncomeInput holds the input for recording income.
type AddIncomeInput struct {
	HouseholdID   int
	UserID        int
	AmountCents   int64
	CategoryID    int
	IncomeAcctID  int
	AssetAcctID   int
	Description   string
	Date          time.Time
}

// AddExpense records an expense: debit expense account, credit asset account.
func (s *TransactionService) AddExpense(ctx context.Context, input AddExpenseInput) (*ent.Transaction, error) {
	if input.AmountCents <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}

	tx, err := s.client.Tx(ctx)
	if err != nil {
		return nil, fmt.Errorf("starting transaction: %w", err)
	}

	// Create journal header.
	txn, err := tx.Transaction.Create().
		SetDescription(input.Description).
		SetDate(input.Date).
		SetHouseholdID(input.HouseholdID).
		SetCreatedByID(input.UserID).
		SetCategoryID(input.CategoryID).
		Save(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("creating transaction: %w", err))
	}

	// Debit expense account (positive).
	_, err = tx.TransactionEntry.Create().
		SetAmountCents(input.AmountCents).
		SetTransactionID(txn.ID).
		SetAccountID(input.ExpenseAcctID).
		Save(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("creating debit entry: %w", err))
	}

	// Credit asset account (negative).
	_, err = tx.TransactionEntry.Create().
		SetAmountCents(-input.AmountCents).
		SetTransactionID(txn.ID).
		SetAccountID(input.AssetAcctID).
		Save(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("creating credit entry: %w", err))
	}

	// Update account balances atomically.
	err = tx.Account.Update().
		Where(account.ID(input.ExpenseAcctID)).
		AddBalanceCents(input.AmountCents).
		Exec(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("updating expense account balance: %w", err))
	}

	err = tx.Account.Update().
		Where(account.ID(input.AssetAcctID)).
		AddBalanceCents(-input.AmountCents).
		Exec(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("updating asset account balance: %w", err))
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("committing transaction: %w", err)
	}

	return txn, nil
}

// AddIncome records income: debit asset account, credit income account.
func (s *TransactionService) AddIncome(ctx context.Context, input AddIncomeInput) (*ent.Transaction, error) {
	if input.AmountCents <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}

	tx, err := s.client.Tx(ctx)
	if err != nil {
		return nil, fmt.Errorf("starting transaction: %w", err)
	}

	// Create journal header.
	txn, err := tx.Transaction.Create().
		SetDescription(input.Description).
		SetDate(input.Date).
		SetHouseholdID(input.HouseholdID).
		SetCreatedByID(input.UserID).
		SetCategoryID(input.CategoryID).
		Save(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("creating transaction: %w", err))
	}

	// Debit asset account (positive).
	_, err = tx.TransactionEntry.Create().
		SetAmountCents(input.AmountCents).
		SetTransactionID(txn.ID).
		SetAccountID(input.AssetAcctID).
		Save(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("creating debit entry: %w", err))
	}

	// Credit income account (negative).
	_, err = tx.TransactionEntry.Create().
		SetAmountCents(-input.AmountCents).
		SetTransactionID(txn.ID).
		SetAccountID(input.IncomeAcctID).
		Save(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("creating credit entry: %w", err))
	}

	// Update account balances atomically.
	err = tx.Account.Update().
		Where(account.ID(input.AssetAcctID)).
		AddBalanceCents(input.AmountCents).
		Exec(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("updating asset account balance: %w", err))
	}

	err = tx.Account.Update().
		Where(account.ID(input.IncomeAcctID)).
		AddBalanceCents(-input.AmountCents).
		Exec(ctx)
	if err != nil {
		return nil, rollback(tx, fmt.Errorf("updating income account balance: %w", err))
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("committing transaction: %w", err)
	}

	return txn, nil
}

func rollback(tx *ent.Tx, err error) error {
	if rerr := tx.Rollback(); rerr != nil {
		return fmt.Errorf("%w: rolling back: %v", err, rerr)
	}
	return err
}
