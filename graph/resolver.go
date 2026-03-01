package graph

import "github.com/expenser/expense-planner/ent"

// Resolver is the root resolver for GraphQL queries.
type Resolver struct {
	Client *ent.Client
}
