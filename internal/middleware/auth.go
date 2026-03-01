package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/expenser/expense-planner/internal/service"
)

type contextKey string

const userContextKey contextKey = "user"

// UserContext holds authenticated user info extracted from the JWT.
type UserContext struct {
	UserID int
	Email  string
}

// Auth returns middleware that extracts the JWT from the Authorization
// header and injects user context. Unauthenticated requests pass through
// (auth is enforced at the resolver level for protected queries).
func Auth(jwtSvc *service.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" {
				next.ServeHTTP(w, r)
				return
			}

			tokenString := strings.TrimPrefix(header, "Bearer ")
			if tokenString == header {
				// No "Bearer " prefix found.
				next.ServeHTTP(w, r)
				return
			}

			claims, err := jwtSvc.ValidateToken(tokenString)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			ctx := context.WithValue(r.Context(), userContextKey, &UserContext{
				UserID: claims.UserID,
				Email:  claims.Email,
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserFromContext retrieves the authenticated user from context.
// Returns nil if no user is authenticated.
func UserFromContext(ctx context.Context) *UserContext {
	u, _ := ctx.Value(userContextKey).(*UserContext)
	return u
}
