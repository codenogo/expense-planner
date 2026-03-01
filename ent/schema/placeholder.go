package schema

import "entgo.io/ent"

// Placeholder holds the schema definition for the Placeholder entity.
type Placeholder struct {
	ent.Schema
}

// Fields of the Placeholder.
func (Placeholder) Fields() []ent.Field {
	return nil
}

// Edges of the Placeholder.
func (Placeholder) Edges() []ent.Edge {
	return nil
}
