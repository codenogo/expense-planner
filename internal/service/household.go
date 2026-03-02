package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/household"
	"github.com/expenser/expense-planner/ent/householdmember"
	"github.com/expenser/expense-planner/ent/invitecode"
	"github.com/expenser/expense-planner/ent/user"
)

// HouseholdService handles household membership management.
type HouseholdService struct {
	client *ent.Client
}

// NewHouseholdService creates a new HouseholdService.
func NewHouseholdService(client *ent.Client) *HouseholdService {
	return &HouseholdService{client: client}
}

// isOwner reports whether callerID is an owner of householdID.
func (s *HouseholdService) isOwner(ctx context.Context, householdID, callerID int) (bool, error) {
	return s.client.HouseholdMember.Query().
		Where(
			householdmember.HasHouseholdWith(household.ID(householdID)),
			householdmember.HasUserWith(user.ID(callerID)),
			householdmember.RoleEQ(householdmember.RoleOwner),
		).
		Exist(ctx)
}

// generateCode generates a cryptographically random 8-character hex code.
func generateCode() (string, error) {
	b := make([]byte, 4) // 4 bytes = 8 hex chars
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generating random code: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// CreateInviteCode creates a new invite code for householdID. Only owners can create codes.
func (s *HouseholdService) CreateInviteCode(ctx context.Context, householdID, callerID int) (*ent.InviteCode, error) {
	owner, err := s.isOwner(ctx, householdID, callerID)
	if err != nil {
		return nil, fmt.Errorf("checking ownership: %w", err)
	}
	if !owner {
		return nil, fmt.Errorf("only owners can create invite codes")
	}

	code, err := generateCode()
	if err != nil {
		return nil, err
	}

	ic, err := s.client.InviteCode.Create().
		SetCode(code).
		SetExpiresAt(time.Now().Add(7 * 24 * time.Hour)).
		SetHouseholdID(householdID).
		SetCreatedByID(callerID).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("creating invite code: %w", err)
	}
	return ic, nil
}

// JoinHousehold adds joinerID to the household associated with the given code.
func (s *HouseholdService) JoinHousehold(ctx context.Context, code string, joinerID int) (*ent.HouseholdMember, error) {
	ic, err := s.client.InviteCode.Query().
		Where(invitecode.Code(code)).
		Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("invite code not found")
		}
		return nil, fmt.Errorf("looking up invite code: %w", err)
	}

	if ic.Used {
		return nil, fmt.Errorf("invite code already used")
	}
	if time.Now().After(ic.ExpiresAt) {
		return nil, fmt.Errorf("invite code expired")
	}

	// Find the household this code belongs to.
	hh, err := ic.QueryHousehold().Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("finding household for invite code: %w", err)
	}

	// Check if the joiner is already a member.
	alreadyMember, err := s.client.HouseholdMember.Query().
		Where(
			householdmember.HasHouseholdWith(household.ID(hh.ID)),
			householdmember.HasUserWith(user.ID(joinerID)),
		).
		Exist(ctx)
	if err != nil {
		return nil, fmt.Errorf("checking existing membership: %w", err)
	}
	if alreadyMember {
		return nil, fmt.Errorf("already a member of this household")
	}

	// Create membership.
	mem, err := s.client.HouseholdMember.Create().
		SetHouseholdID(hh.ID).
		SetUserID(joinerID).
		SetRole(householdmember.RoleMember).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("creating membership: %w", err)
	}

	// Mark code as used.
	if err := s.client.InviteCode.UpdateOneID(ic.ID).SetUsed(true).Exec(ctx); err != nil {
		return nil, fmt.Errorf("marking invite code used: %w", err)
	}

	return mem, nil
}

// RemoveMember removes targetID from householdID. Only owners can remove members.
// Prevents removing the last owner.
func (s *HouseholdService) RemoveMember(ctx context.Context, householdID, callerID, targetID int) error {
	owner, err := s.isOwner(ctx, householdID, callerID)
	if err != nil {
		return fmt.Errorf("checking ownership: %w", err)
	}
	if !owner {
		return fmt.Errorf("only owners can remove members")
	}

	// Find target's membership.
	targetMembership, err := s.client.HouseholdMember.Query().
		Where(
			householdmember.HasHouseholdWith(household.ID(householdID)),
			householdmember.HasUserWith(user.ID(targetID)),
		).
		Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return fmt.Errorf("target is not a member of this household")
		}
		return fmt.Errorf("finding target membership: %w", err)
	}

	// If target is an owner, prevent removing the last owner.
	if targetMembership.Role == householdmember.RoleOwner {
		ownerCount, err := s.client.HouseholdMember.Query().
			Where(
				householdmember.HasHouseholdWith(household.ID(householdID)),
				householdmember.RoleEQ(householdmember.RoleOwner),
			).
			Count(ctx)
		if err != nil {
			return fmt.Errorf("counting owners: %w", err)
		}
		if ownerCount <= 1 {
			return fmt.Errorf("cannot remove the last owner from the household")
		}
	}

	if err := s.client.HouseholdMember.DeleteOneID(targetMembership.ID).Exec(ctx); err != nil {
		return fmt.Errorf("removing member: %w", err)
	}
	return nil
}

// UpdateMemberRole updates the role of targetID in householdID. Only owners can update roles.
func (s *HouseholdService) UpdateMemberRole(ctx context.Context, householdID, callerID, targetID int, role householdmember.Role) (*ent.HouseholdMember, error) {
	owner, err := s.isOwner(ctx, householdID, callerID)
	if err != nil {
		return nil, fmt.Errorf("checking ownership: %w", err)
	}
	if !owner {
		return nil, fmt.Errorf("only owners can update member roles")
	}

	// Find target's membership.
	targetMembership, err := s.client.HouseholdMember.Query().
		Where(
			householdmember.HasHouseholdWith(household.ID(householdID)),
			householdmember.HasUserWith(user.ID(targetID)),
		).
		Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("target is not a member of this household")
		}
		return nil, fmt.Errorf("finding target membership: %w", err)
	}

	updated, err := s.client.HouseholdMember.UpdateOneID(targetMembership.ID).
		SetRole(role).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("updating member role: %w", err)
	}
	return updated, nil
}
