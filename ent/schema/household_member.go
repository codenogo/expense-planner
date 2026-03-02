package schema

import (
	"time"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// HouseholdMember holds the schema definition for the HouseholdMember entity.
type HouseholdMember struct {
	ent.Schema
}

// Fields of the HouseholdMember.
func (HouseholdMember) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("role").
			Values("owner", "member").
			Default("member"),
		field.Time("joined_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the HouseholdMember.
func (HouseholdMember) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("members").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("members").
			Unique().
			Required(),
	}
}

// Annotations of the HouseholdMember.
func (HouseholdMember) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
