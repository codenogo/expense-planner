package seed

import (
	"context"
	"fmt"

	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/ent/household"
)

type categoryDef struct {
	Name     string
	Icon     string
	Children []categoryDef
}

// kenyanPresets defines the default category tree for Kenyan households.
var kenyanPresets = []categoryDef{
	{
		Name: "Food",
		Icon: "utensils",
		Children: []categoryDef{
			{Name: "Groceries", Icon: "cart-shopping"},
			{Name: "Eating Out", Icon: "burger"},
			{Name: "Market", Icon: "store"},
		},
	},
	{
		Name: "Transport",
		Icon: "car",
		Children: []categoryDef{
			{Name: "Matatu", Icon: "bus"},
			{Name: "Uber", Icon: "taxi"},
			{Name: "Fuel", Icon: "gas-pump"},
		},
	},
	{
		Name: "Rent",
		Icon: "house",
	},
	{
		Name: "Utilities",
		Icon: "bolt",
		Children: []categoryDef{
			{Name: "KPLC", Icon: "lightbulb"},
			{Name: "Water", Icon: "droplet"},
			{Name: "Internet", Icon: "wifi"},
		},
	},
	{
		Name: "Airtime & Data",
		Icon: "mobile",
	},
	{
		Name: "Healthcare",
		Icon: "heart-pulse",
		Children: []categoryDef{
			{Name: "Hospital", Icon: "hospital"},
			{Name: "Pharmacy", Icon: "pills"},
			{Name: "NHIF", Icon: "shield"},
		},
	},
	{
		Name: "Education",
		Icon: "graduation-cap",
		Children: []categoryDef{
			{Name: "School Fees", Icon: "school"},
			{Name: "Books", Icon: "book"},
			{Name: "Courses", Icon: "chalkboard"},
		},
	},
	{
		Name: "Entertainment",
		Icon: "film",
		Children: []categoryDef{
			{Name: "Going Out", Icon: "glass-cheers"},
			{Name: "Streaming", Icon: "tv"},
			{Name: "Gym", Icon: "dumbbell"},
		},
	},
	{
		Name: "Shopping",
		Icon: "bag-shopping",
		Children: []categoryDef{
			{Name: "Clothing", Icon: "shirt"},
			{Name: "Electronics", Icon: "laptop"},
			{Name: "Household Items", Icon: "couch"},
		},
	},
	{
		Name: "Savings",
		Icon: "piggy-bank",
		Children: []categoryDef{
			{Name: "M-Shwari", Icon: "mobile"},
			{Name: "SACCO", Icon: "building-columns"},
			{Name: "Other", Icon: "vault"},
		},
	},
	// Income categories
	{
		Name: "Income",
		Icon: "wallet",
		Children: []categoryDef{
			{Name: "Salary", Icon: "banknote"},
			{Name: "Freelance", Icon: "laptop"},
			{Name: "Business", Icon: "briefcase"},
			{Name: "Side Hustle", Icon: "rocket"},
			{Name: "Investments", Icon: "trending-up"},
			{Name: "Rental Income", Icon: "house"},
			{Name: "Gifts", Icon: "gift"},
			{Name: "Refunds", Icon: "rotate-ccw"},
			{Name: "Other Income", Icon: "plus-circle"},
		},
	},
}

// BackfillCategories seeds default categories for any existing households
// that have none. Safe to call on every startup — it's a no-op for households
// that already have categories.
func BackfillCategories(ctx context.Context, client *ent.Client) error {
	// Find households with zero categories.
	hhs, err := client.Household.Query().
		Where(household.Not(household.HasCategories())).
		All(ctx)
	if err != nil {
		return fmt.Errorf("querying households without categories: %w", err)
	}
	for _, h := range hhs {
		if err := SeedDefaultCategories(ctx, client, h.ID); err != nil {
			return fmt.Errorf("backfilling household %d: %w", h.ID, err)
		}
	}
	return nil
}

// SeedDefaultCategories creates the default Kenyan household category tree
// for a given household. All seeded categories are marked as system categories.
func SeedDefaultCategories(ctx context.Context, client *ent.Client, householdID int) error {
	for _, cat := range kenyanPresets {
		if err := createCategory(ctx, client, householdID, nil, cat); err != nil {
			return fmt.Errorf("seeding category %q: %w", cat.Name, err)
		}
	}
	return nil
}

func createCategory(ctx context.Context, client *ent.Client, householdID int, parentID *int, def categoryDef) error {
	builder := client.Category.Create().
		SetName(def.Name).
		SetIcon(def.Icon).
		SetIsSystem(true).
		SetHouseholdID(householdID)

	if parentID != nil {
		builder = builder.SetParentID(*parentID)
	}

	cat, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	for _, child := range def.Children {
		if err := createCategory(ctx, client, householdID, &cat.ID, child); err != nil {
			return err
		}
	}
	return nil
}
