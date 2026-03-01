package config

import "os"

// Config holds application configuration loaded from environment variables.
type Config struct {
	DatabaseURL string
	Port        string
	JWTSecret   string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() Config {
	c := Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		Port:        os.Getenv("PORT"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
	}
	if c.Port == "" {
		c.Port = "8080"
	}
	if c.DatabaseURL == "" {
		c.DatabaseURL = "postgres://postgres:postgres@localhost:5432/expense_planner?sslmode=disable"
	}
	return c
}
