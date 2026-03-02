package schema

import (
	"time"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Transaction holds the schema definition for the Transaction entity.
// Represents a journal header in double-entry accounting.
type Transaction struct {
	ent.Schema
}

// Fields of the Transaction.
func (Transaction) Fields() []ent.Field {
	return []ent.Field{
		field.String("description").
			NotEmpty(),
		field.Time("date"),
		field.Enum("status").
			Values("pending", "posted").
			Default("posted"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the Transaction.
func (Transaction) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("transactions").
			Unique().
			Required(),
		edge.From("created_by", User.Type).
			Ref("transactions").
			Unique().
			Required(),
		edge.To("entries", TransactionEntry.Type),
		edge.From("category", Category.Type).
			Ref("transactions").
			Unique(),
	}
}

// Annotations of the Transaction.
func (Transaction) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
