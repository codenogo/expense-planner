package graph

import (
	"context"
	"fmt"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/householdmember"
	"github.com/expenser/expense-planner/ent/user"
	"github.com/expenser/expense-planner/internal/middleware"
	"github.com/expenser/expense-planner/internal/service"
)

// Resolver is the root resolver for GraphQL queries.
type Resolver struct {
	Client    *ent.Client
	JWT       *service.JWTService
	TxnSvc   *service.TransactionService
	ImportSvc *service.ImportService
	ReportSvc *service.ReportService
}

func intPtr(i int) *int {
	return &i
}

// userHouseholdIDs returns the household IDs the authenticated user belongs to.
// Returns an error if the user is not authenticated.
func userHouseholdIDs(ctx context.Context, client *ent.Client) (int, []int, error) {
	uc := middleware.UserFromContext(ctx)
	if uc == nil {
		return 0, nil, fmt.Errorf("authentication required")
	}

	members, err := client.HouseholdMember.Query().
		Where(householdmember.HasUserWith(user.ID(uc.UserID))).
		WithHousehold().
		All(ctx)
	if err != nil {
		return 0, nil, fmt.Errorf("querying household memberships: %w", err)
	}

	ids := make([]int, len(members))
	for i, m := range members {
		ids[i] = m.Edges.Household.ID
	}
	return uc.UserID, ids, nil
}
