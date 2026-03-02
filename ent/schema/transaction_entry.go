package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// TransactionEntry holds the schema definition for the TransactionEntry entity.
// Represents a journal leg in double-entry accounting.
// Positive amount_cents = debit, negative = credit.
type TransactionEntry struct {
	ent.Schema
}

// Fields of the TransactionEntry.
func (TransactionEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Int64("amount_cents"),
	}
}

// Edges of the TransactionEntry.
func (TransactionEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("transaction", Transaction.Type).
			Ref("entries").
			Unique().
			Required(),
		edge.From("account", Account.Type).
			Ref("entries").
			Unique().
			Required(),
	}
}

// Annotations of the TransactionEntry.
func (TransactionEntry) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
	}
}
