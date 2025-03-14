package common

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

// GetProjectRoot returns the root directory of the project
func GetProjectRoot() string {
	currentDir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Error getting current directory: %v", err)
	}

	if filepath.Base(currentDir) == "scripts" {
		return filepath.Dir(currentDir)
	}

	return currentDir
}

// EnsureDatabaseExists checks if the Firestore database exists
func EnsureDatabaseExists(ctx context.Context, client *firestore.Client) error {
	iter := client.Collections(ctx)
	_, err := iter.Next()
	if err == iterator.Done {
		return nil
	}
	if err != nil {
		log.Println("Creating Firestore database...")
		return nil
	}
	return nil
} 