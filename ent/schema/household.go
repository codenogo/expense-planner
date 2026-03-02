package schema

import (
	"time"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Household holds the schema definition for the Household entity.
type Household struct {
	ent.Schema
}

// Fields of the Household.
func (Household) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("base_currency").
			Default("KES").
			NotEmpty(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the Household.
func (Household) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("members", HouseholdMember.Type),
		edge.To("accounts", Account.Type),
		edge.To("categories", Category.Type),
		edge.To("transactions", Transaction.Type),
		edge.To("budgets", Budget.Type),
		edge.To("tags", Tag.Type),
		edge.To("recurring_bills", RecurringBill.Type),
		edge.To("invite_codes", InviteCode.Type),
	}
}

// Annotations of the Household.
func (Household) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
