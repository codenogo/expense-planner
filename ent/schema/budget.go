package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Budget holds the schema definition for the Budget entity.
// Represents a monthly spending limit for a category within a household.
type Budget struct {
	ent.Schema
}

// Fields of the Budget.
func (Budget) Fields() []ent.Field {
	return []ent.Field{
		field.String("month").
			NotEmpty().
			Comment("YYYY-MM format, e.g. 2026-03"),
		field.Int64("amount_cents").
			Positive(),
		field.Bool("rollover").
			Default(false).
			Comment("Whether unspent budget carries forward to next month"),
	}
}

// Edges of the Budget.
func (Budget) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("budgets").
			Unique().
			Required(),
		edge.From("category", Category.Type).
			Ref("budgets").
			Unique().
			Required(),
	}
}

// Indexes of the Budget.
func (Budget) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("month").
			Edges("household", "category").
			Unique(),
	}
}

// Annotations of the Budget.
func (Budget) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
