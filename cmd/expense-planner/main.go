package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"entgo.io/contrib/entgql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/expenser/expense-planner/ent"
	"github.com/expenser/expense-planner/graph"
	"github.com/expenser/expense-planner/internal/config"
	"github.com/expenser/expense-planner/internal/middleware"
	"github.com/expenser/expense-planner/internal/service"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg := config.Load()

	// Open PostgreSQL connection via pgx.
	client, err := ent.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("opening database connection: %v", err)
	}
	defer client.Close()

	// Run auto-migration.
	ctx := context.Background()
	if err := client.Schema.Create(ctx); err != nil {
		log.Fatalf("running schema migration: %v", err)
	}

	// Create JWT service.
	jwtSvc := service.NewJWTService(cfg.JWTSecret)

	// Create transaction service.
	txnSvc := service.NewTransactionService(client)

	// Create import service.
	importSvc := service.NewImportService(client, txnSvc)

	// Create report service.
	reportSvc := service.NewReportService(client)

	// Create household service.
	householdSvc := service.NewHouseholdService(client)

	// Create GraphQL server.
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{Client: client, JWT: jwtSvc, TxnSvc: txnSvc, ImportSvc: importSvc, ReportSvc: reportSvc, HouseholdSvc: householdSvc},
	}))
	srv.Use(entgql.Transactioner{TxOpener: client})

	// Apply auth middleware.
	authMiddleware := middleware.Auth(jwtSvc)

	mux := http.NewServeMux()
	mux.Handle("GET /", playground.Handler("Expense Planner", "/query"))
	mux.Handle("/query", authMiddleware(srv))
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"status":"ok"}`)
	})

	log.Printf("expense-planner listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
		log.Fatal(err)
	}
}
