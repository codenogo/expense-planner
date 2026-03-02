package schema

import (
	"time"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// InviteCode holds the schema definition for the InviteCode entity.
type InviteCode struct {
	ent.Schema
}

// Fields of the InviteCode.
func (InviteCode) Fields() []ent.Field {
	return []ent.Field{
		field.String("code").
			Unique().
			NotEmpty(),
		field.Time("expires_at"),
		field.Bool("used").
			Default(false),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the InviteCode.
func (InviteCode) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("invite_codes").
			Unique().
			Required(),
		edge.From("created_by", User.Type).
			Ref("invite_codes").
			Unique().
			Required(),
	}
}

// Annotations of the InviteCode.
func (InviteCode) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate()),
	}
}
