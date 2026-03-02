package graph

import (
	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/internal/service"
)

// Resolver is the root resolver for GraphQL queries.
type Resolver struct {
	Client    *ent.Client
	JWT       *service.JWTService
	TxnSvc   *service.TransactionService
	ImportSvc *service.ImportService
}
