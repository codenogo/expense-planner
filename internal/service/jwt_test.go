package service

import (
	"testing"
	"time"
)

func TestGenerateAccessToken(t *testing.T) {
	js := NewJWTService("test-secret-key-for-testing-only")

	token, err := js.GenerateAccessToken(42, "user@example.com")
	if err != nil {
		t.Fatalf("GenerateAccessToken() error = %v", err)
	}
	if token == "" {
		t.Fatal("GenerateAccessToken() returned empty token")
	}
}

func TestGenerateRefreshToken(t *testing.T) {
	js := NewJWTService("test-secret-key-for-testing-only")

	token, err := js.GenerateRefreshToken(42)
	if err != nil {
		t.Fatalf("GenerateRefreshToken() error = %v", err)
	}
	if token == "" {
		t.Fatal("GenerateRefreshToken() returned empty token")
	}
}

func TestValidateAccessToken(t *testing.T) {
	js := NewJWTService("test-secret-key-for-testing-only")

	token, err := js.GenerateAccessToken(42, "user@example.com")
	if err != nil {
		t.Fatalf("GenerateAccessToken() error = %v", err)
	}

	claims, err := js.ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v", err)
	}
	if claims.UserID != 42 {
		t.Errorf("UserID = %d, want 42", claims.UserID)
	}
	if claims.Email != "user@example.com" {
		t.Errorf("Email = %q, want %q", claims.Email, "user@example.com")
	}
}

func TestValidateRefreshToken(t *testing.T) {
	js := NewJWTService("test-secret-key-for-testing-only")

	token, err := js.GenerateRefreshToken(42)
	if err != nil {
		t.Fatalf("GenerateRefreshToken() error = %v", err)
	}

	claims, err := js.ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v", err)
	}
	if claims.UserID != 42 {
		t.Errorf("UserID = %d, want 42", claims.UserID)
	}
	// Refresh tokens don't carry email.
	if claims.Email != "" {
		t.Errorf("Email = %q, want empty for refresh token", claims.Email)
	}
}

func TestValidateToken_InvalidSignature(t *testing.T) {
	js1 := NewJWTService("secret-key-one")
	js2 := NewJWTService("secret-key-two")

	token, err := js1.GenerateAccessToken(42, "user@example.com")
	if err != nil {
		t.Fatalf("GenerateAccessToken() error = %v", err)
	}

	_, err = js2.ValidateToken(token)
	if err == nil {
		t.Error("ValidateToken() with wrong secret: expected error, got nil")
	}
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	js := &JWTService{
		secret:             []byte("test-secret"),
		accessTokenExpiry:  -1 * time.Minute, // Already expired.
		refreshTokenExpiry: 7 * 24 * time.Hour,
	}

	token, err := js.GenerateAccessToken(42, "user@example.com")
	if err != nil {
		t.Fatalf("GenerateAccessToken() error = %v", err)
	}

	_, err = js.ValidateToken(token)
	if err == nil {
		t.Error("ValidateToken() with expired token: expected error, got nil")
	}
}
