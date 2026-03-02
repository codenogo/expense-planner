package graph

import (
	"context"
	"strings"
	"testing"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/enttest"
	"github.com/expenser/expense-planner/ent/householdmember"
	"github.com/expenser/expense-planner/internal/middleware"

	_ "github.com/mattn/go-sqlite3"
)

func setupTestDB(t *testing.T) *ent.Client {
	t.Helper()
	return enttest.Open(t, "sqlite3", "file:ent?mode=memory&_fk=1")
}

func TestUserHouseholdIDs(t *testing.T) {
	tests := []struct {
		name        string
		setup       func(t *testing.T, client *ent.Client) context.Context
		wantUserID  int
		wantHHCount int
		wantErr     bool
		errContains string
	}{
		{
			name: "no auth context returns error",
			setup: func(t *testing.T, client *ent.Client) context.Context {
				return context.Background()
			},
			wantErr:     true,
			errContains: "authentication required",
		},
		{
			name: "authenticated user with no memberships returns empty list",
			setup: func(t *testing.T, client *ent.Client) context.Context {
				u, err := client.User.Create().
					SetName("Loner").
					SetEmail("loner@example.com").
					SetPasswordHash("hashed").
					Save(context.Background())
				if err != nil {
					t.Fatalf("creating user: %v", err)
				}
				return middleware.ContextWithUser(context.Background(), &middleware.UserContext{
					UserID: u.ID,
					Email:  u.Email,
				})
			},
			wantHHCount: 0,
		},
		{
			name: "authenticated user with one membership returns that household",
			setup: func(t *testing.T, client *ent.Client) context.Context {
				ctx := context.Background()
				u, err := client.User.Create().
					SetName("Member").
					SetEmail("member@example.com").
					SetPasswordHash("hashed").
					Save(ctx)
				if err != nil {
					t.Fatalf("creating user: %v", err)
				}
				hh, err := client.Household.Create().
					SetName("Test Household").
					Save(ctx)
				if err != nil {
					t.Fatalf("creating household: %v", err)
				}
				_, err = client.HouseholdMember.Create().
					SetHouseholdID(hh.ID).
					SetUserID(u.ID).
					SetRole(householdmember.RoleMember).
					Save(ctx)
				if err != nil {
					t.Fatalf("creating membership: %v", err)
				}
				return middleware.ContextWithUser(ctx, &middleware.UserContext{
					UserID: u.ID,
					Email:  u.Email,
				})
			},
			wantHHCount: 1,
		},
		{
			name: "authenticated user with multiple memberships returns all households",
			setup: func(t *testing.T, client *ent.Client) context.Context {
				ctx := context.Background()
				u, err := client.User.Create().
					SetName("Multi").
					SetEmail("multi@example.com").
					SetPasswordHash("hashed").
					Save(ctx)
				if err != nil {
					t.Fatalf("creating user: %v", err)
				}
				for i := 0; i < 3; i++ {
					hh, err := client.Household.Create().
						SetName("Household").
						Save(ctx)
					if err != nil {
						t.Fatalf("creating household %d: %v", i, err)
					}
					_, err = client.HouseholdMember.Create().
						SetHouseholdID(hh.ID).
						SetUserID(u.ID).
						SetRole(householdmember.RoleMember).
						Save(ctx)
					if err != nil {
						t.Fatalf("creating membership %d: %v", i, err)
					}
				}
				return middleware.ContextWithUser(ctx, &middleware.UserContext{
					UserID: u.ID,
					Email:  u.Email,
				})
			},
			wantHHCount: 3,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			client := setupTestDB(t)
			defer client.Close()

			ctx := tc.setup(t, client)
			userID, hhIDs, err := userHouseholdIDs(ctx, client)

			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tc.errContains)
				}
				if !strings.Contains(err.Error(), tc.errContains) {
					t.Errorf("expected error containing %q, got %q", tc.errContains, err.Error())
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if len(hhIDs) != tc.wantHHCount {
				t.Errorf("expected %d household IDs, got %d", tc.wantHHCount, len(hhIDs))
			}
			if tc.wantHHCount > 0 && userID == 0 {
				t.Error("expected non-zero userID for authenticated user with memberships")
			}
		})
	}
}

func TestMembershipAuthorizationPattern(t *testing.T) {
	tests := []struct {
		name        string
		isMember    bool
		wantAllowed bool
	}{
		{
			name:        "user who is a member of household is allowed",
			isMember:    true,
			wantAllowed: true,
		},
		{
			name:        "user who is not a member of household is denied",
			isMember:    false,
			wantAllowed: false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			client := setupTestDB(t)
			defer client.Close()
			ctx := context.Background()

			u, err := client.User.Create().
				SetName("Test User").
				SetEmail("test@example.com").
				SetPasswordHash("hashed").
				Save(ctx)
			if err != nil {
				t.Fatalf("creating user: %v", err)
			}

			targetHH, err := client.Household.Create().
				SetName("Target Household").
				Save(ctx)
			if err != nil {
				t.Fatalf("creating target household: %v", err)
			}

			if tc.isMember {
				_, err = client.HouseholdMember.Create().
					SetHouseholdID(targetHH.ID).
					SetUserID(u.ID).
					SetRole(householdmember.RoleMember).
					Save(ctx)
				if err != nil {
					t.Fatalf("creating membership: %v", err)
				}
			}

			authCtx := middleware.ContextWithUser(ctx, &middleware.UserContext{
				UserID: u.ID,
				Email:  u.Email,
			})

			_, hhIDs, err := userHouseholdIDs(authCtx, client)
			if err != nil {
				t.Fatalf("unexpected error from userHouseholdIDs: %v", err)
			}

			// Apply the same membership-loop pattern used in resolvers.
			allowed := false
			for _, id := range hhIDs {
				if id == targetHH.ID {
					allowed = true
					break
				}
			}

			if allowed != tc.wantAllowed {
				t.Errorf("expected allowed=%v, got allowed=%v", tc.wantAllowed, allowed)
			}
		})
	}
}
