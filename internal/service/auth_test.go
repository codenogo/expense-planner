package service

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "s3cureP@ssw0rd"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}
	if hash == "" {
		t.Fatal("HashPassword() returned empty hash")
	}
	if hash == password {
		t.Fatal("HashPassword() returned plaintext password")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "s3cureP@ssw0rd"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}

	// Correct password should match.
	if err := CheckPassword(hash, password); err != nil {
		t.Errorf("CheckPassword() with correct password: %v", err)
	}

	// Wrong password should not match.
	if err := CheckPassword(hash, "wrongpassword"); err == nil {
		t.Error("CheckPassword() with wrong password: expected error, got nil")
	}
}
