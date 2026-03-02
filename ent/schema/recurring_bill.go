package schema

import (
	"time"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// RecurringBill holds the schema definition for the RecurringBill entity.
// Tracks recurring expenses like rent, KPLC, Netflix, etc.
type RecurringBill struct {
	ent.Schema
}

// Fields of the RecurringBill.
func (RecurringBill) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.Int64("amount_cents").
			Positive(),
		field.Int("due_day").
			Min(1).
			Max(31).
			Comment("Day of the month the bill is due (1-31)"),
		field.Enum("frequency").
			Values("monthly", "weekly", "annual").
			Default("monthly"),
		field.Enum("status").
			Values("pending", "paid", "overdue").
			Default("pending"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the RecurringBill.
func (RecurringBill) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("recurring_bills").
			Unique().
			Required(),
		edge.From("category", Category.Type).
			Ref("recurring_bills").
			Unique(),
	}
}

// Annotations of the RecurringBill.
func (RecurringBill) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
