package service

import (
	"context"
	"testing"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/household"
	"github.com/expenser/expense-planner/ent/householdmember"
	"github.com/expenser/expense-planner/ent/invitecode"
	"github.com/expenser/expense-planner/ent/user"
)

// setupHouseholdFixtures creates a household, owner user, and member user for testing.
func setupHouseholdFixtures(t *testing.T, client *ent.Client) (householdID, ownerID, memberID int) {
	t.Helper()
	ctx := context.Background()

	owner, err := client.User.Create().
		SetName("Owner User").
		SetEmail("owner@example.com").
		SetPasswordHash("hashed").
		Save(ctx)
	if err != nil {
		t.Fatalf("creating owner user: %v", err)
	}

	member, err := client.User.Create().
		SetName("Member User").
		SetEmail("member@example.com").
		SetPasswordHash("hashed").
		Save(ctx)
	if err != nil {
		t.Fatalf("creating member user: %v", err)
	}

	household, err := client.Household.Create().
		SetName("Test Household").
		Save(ctx)
	if err != nil {
		t.Fatalf("creating household: %v", err)
	}

	// Make owner a member with role owner.
	_, err = client.HouseholdMember.Create().
		SetHouseholdID(household.ID).
		SetUserID(owner.ID).
		SetRole(householdmember.RoleOwner).
		Save(ctx)
	if err != nil {
		t.Fatalf("creating owner membership: %v", err)
	}

	return household.ID, owner.ID, member.ID
}

func TestHouseholdService_CreateInviteCode(t *testing.T) {
	tests := []struct {
		name        string
		callerRole  householdmember.Role
		isOwner     bool
		wantErr     bool
		errContains string
	}{
		{
			name:    "owner creates invite code successfully",
			isOwner: true,
			wantErr: false,
		},
		{
			name:        "non-owner is rejected",
			isOwner:     false,
			wantErr:     true,
			errContains: "only owners can create invite codes",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			client := setupTestDB(t)
			defer client.Close()

			householdID, ownerID, memberID := setupHouseholdFixtures(t, client)
			svc := NewHouseholdService(client)
			ctx := context.Background()

			callerID := ownerID
			if !tc.isOwner {
				callerID = memberID
			}

			code, err := svc.CreateInviteCode(ctx, householdID, callerID)
			if tc.wantErr {
				if err == nil {
					t.Errorf("expected error containing %q, got nil", tc.errContains)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if code == nil {
				t.Fatal("expected invite code, got nil")
			}
			if len(code.Code) == 0 {
				t.Error("expected non-empty code string")
			}
			if code.ExpiresAt.Before(time.Now().Add(6 * 24 * time.Hour)) {
				t.Errorf("expected expiry ~7 days from now, got %v", code.ExpiresAt)
			}
			if code.Used {
				t.Error("expected code to not be used")
			}
		})
	}
}

func TestHouseholdService_JoinHousehold(t *testing.T) {
	tests := []struct {
		name        string
		setupCode   func(client *ent.Client, householdID, ownerID int) string
		joinerSetup func(client *ent.Client, householdID, joinerID int)
		wantErr     bool
		errContains string
	}{
		{
			name: "valid code joins household",
			setupCode: func(client *ent.Client, householdID, ownerID int) string {
				ic, err := client.InviteCode.Create().
					SetCode("VALIDCOD").
					SetExpiresAt(time.Now().Add(7 * 24 * time.Hour)).
					SetHouseholdID(householdID).
					SetCreatedByID(ownerID).
					Save(context.Background())
				if err != nil {
					panic(err)
				}
				return ic.Code
			},
			wantErr: false,
		},
		{
			name: "expired code rejected",
			setupCode: func(client *ent.Client, householdID, ownerID int) string {
				ic, err := client.InviteCode.Create().
					SetCode("EXPIREDD").
					SetExpiresAt(time.Now().Add(-1 * time.Hour)).
					SetHouseholdID(householdID).
					SetCreatedByID(ownerID).
					Save(context.Background())
				if err != nil {
					panic(err)
				}
				return ic.Code
			},
			wantErr:     true,
			errContains: "invite code expired",
		},
		{
			name: "used code rejected",
			setupCode: func(client *ent.Client, householdID, ownerID int) string {
				ic, err := client.InviteCode.Create().
					SetCode("USEDCODE").
					SetExpiresAt(time.Now().Add(7 * 24 * time.Hour)).
					SetUsed(true).
					SetHouseholdID(householdID).
					SetCreatedByID(ownerID).
					Save(context.Background())
				if err != nil {
					panic(err)
				}
				return ic.Code
			},
			wantErr:     true,
			errContains: "invite code already used",
		},
		{
			name: "already-member rejected",
			setupCode: func(client *ent.Client, householdID, ownerID int) string {
				ic, err := client.InviteCode.Create().
					SetCode("MEMBRCOD").
					SetExpiresAt(time.Now().Add(7 * 24 * time.Hour)).
					SetHouseholdID(householdID).
					SetCreatedByID(ownerID).
					Save(context.Background())
				if err != nil {
					panic(err)
				}
				return ic.Code
			},
			joinerSetup: func(client *ent.Client, householdID, joinerID int) {
				_, err := client.HouseholdMember.Create().
					SetHouseholdID(householdID).
					SetUserID(joinerID).
					SetRole(householdmember.RoleMember).
					Save(context.Background())
				if err != nil {
					panic(err)
				}
			},
			wantErr:     true,
			errContains: "already a member",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			client := setupTestDB(t)
			defer client.Close()

			householdID, ownerID, joinerID := setupHouseholdFixtures(t, client)
			svc := NewHouseholdService(client)
			ctx := context.Background()

			code := tc.setupCode(client, householdID, ownerID)

			if tc.joinerSetup != nil {
				tc.joinerSetup(client, householdID, joinerID)
			}

			mem, err := svc.JoinHousehold(ctx, code, joinerID)
			if tc.wantErr {
				if err == nil {
					t.Errorf("expected error containing %q, got nil", tc.errContains)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if mem == nil {
				t.Fatal("expected membership, got nil")
			}
			if mem.Role != householdmember.RoleMember {
				t.Errorf("expected role member, got %v", mem.Role)
			}

			// Verify code is marked used.
			ic, err := client.InviteCode.Query().
				Where(invitecode.Code(code)).
				Only(ctx)
			if err != nil {
				t.Fatalf("querying invite code: %v", err)
			}
			if !ic.Used {
				t.Error("expected invite code to be marked used after join")
			}
		})
	}
}

func TestHouseholdService_RemoveMember(t *testing.T) {
	tests := []struct {
		name        string
		setupExtra  func(client *ent.Client, householdID, ownerID, targetID int)
		callerIsOwner bool
		removeTarget  string // "member" or "self-as-last-owner"
		wantErr     bool
		errContains string
	}{
		{
			name:          "owner removes a regular member",
			callerIsOwner: true,
			removeTarget:  "member",
			wantErr:       false,
		},
		{
			name:          "non-owner is rejected",
			callerIsOwner: false,
			removeTarget:  "member",
			wantErr:       true,
			errContains:   "only owners can remove members",
		},
		{
			name:          "owner cannot remove self as last owner",
			callerIsOwner: true,
			removeTarget:  "self-as-last-owner",
			wantErr:       true,
			errContains:   "cannot remove the last owner",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			client := setupTestDB(t)
			defer client.Close()

			householdID, ownerID, memberID := setupHouseholdFixtures(t, client)
			svc := NewHouseholdService(client)
			ctx := context.Background()

			// Make memberID a member of the household.
			_, err := client.HouseholdMember.Create().
				SetHouseholdID(householdID).
				SetUserID(memberID).
				SetRole(householdmember.RoleMember).
				Save(ctx)
			if err != nil {
				t.Fatalf("creating member membership: %v", err)
			}

			callerID := ownerID
			if !tc.callerIsOwner {
				callerID = memberID
			}

			targetID := memberID
			if tc.removeTarget == "self-as-last-owner" {
				targetID = ownerID
			}

			err = svc.RemoveMember(ctx, householdID, callerID, targetID)
			if tc.wantErr {
				if err == nil {
					t.Errorf("expected error containing %q, got nil", tc.errContains)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			// Verify target was removed.
			exists, err := client.HouseholdMember.Query().
				Where(
					householdmember.HasHouseholdWith(household.ID(householdID)),
					householdmember.HasUserWith(user.ID(targetID)),
				).
				Exist(ctx)
			if err != nil {
				t.Fatalf("querying membership after removal: %v", err)
			}
			if exists {
				t.Error("expected member to be removed, but membership still exists")
			}
		})
	}
}

func TestHouseholdService_UpdateMemberRole(t *testing.T) {
	tests := []struct {
		name          string
		callerIsOwner bool
		newRole       householdmember.Role
		wantErr       bool
		errContains   string
	}{
		{
			name:          "owner promotes member to owner",
			callerIsOwner: true,
			newRole:       householdmember.RoleOwner,
			wantErr:       false,
		},
		{
			name:          "owner demotes owner to member",
			callerIsOwner: true,
			newRole:       householdmember.RoleMember,
			wantErr:       false,
		},
		{
			name:          "non-owner is rejected",
			callerIsOwner: false,
			newRole:       householdmember.RoleOwner,
			wantErr:       true,
			errContains:   "only owners can update member roles",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			client := setupTestDB(t)
			defer client.Close()

			householdID, ownerID, memberID := setupHouseholdFixtures(t, client)
			svc := NewHouseholdService(client)
			ctx := context.Background()

			// Add memberID as a member of the household.
			_, err := client.HouseholdMember.Create().
				SetHouseholdID(householdID).
				SetUserID(memberID).
				SetRole(householdmember.RoleMember).
				Save(ctx)
			if err != nil {
				t.Fatalf("creating member membership: %v", err)
			}

			callerID := ownerID
			if !tc.callerIsOwner {
				callerID = memberID
			}

			updated, err := svc.UpdateMemberRole(ctx, householdID, callerID, memberID, tc.newRole)
			if tc.wantErr {
				if err == nil {
					t.Errorf("expected error containing %q, got nil", tc.errContains)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if updated == nil {
				t.Fatal("expected updated membership, got nil")
			}
			if updated.Role != tc.newRole {
				t.Errorf("expected role %v, got %v", tc.newRole, updated.Role)
			}
		})
	}
}
