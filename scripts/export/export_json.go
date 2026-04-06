package export

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"pokeproject/scripts/common"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

// ExportJSON exports Firestore collections to JSON files in data/ directory.
// This allows the backend to run without Firestore in production.
func ExportJSON() {
	projectRoot := common.GetProjectRoot()

	if err := godotenv.Load(filepath.Join(projectRoot, ".env")); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		log.Fatal("GOOGLE_CLOUD_PROJECT environment variable is not set")
	}

	ctx := context.Background()
	opt := option.WithCredentialsFile(filepath.Join(projectRoot, "service-account.json"))
	client, err := firestore.NewClient(ctx, projectID, opt)
	if err != nil {
		log.Fatalf("Error initializing Firestore client: %v", err)
	}
	defer client.Close()

	dataDir := filepath.Join(projectRoot, "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatalf("Error creating data directory: %v", err)
	}

	// Export Pokemon
	exportCollection(ctx, client, "heartgold-pokemon", filepath.Join(dataDir, "heartgold-pokemon.json"))

	// Export Moves
	exportCollection(ctx, client, "heartgold-moves", filepath.Join(dataDir, "heartgold-moves.json"))

	fmt.Println("Export complete!")
}

func exportCollection(ctx context.Context, client *firestore.Client, collection, outputPath string) {
	log.Printf("Exporting %s...", collection)

	docs, err := client.Collection(collection).Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("Error reading %s: %v", collection, err)
	}

	var items []map[string]interface{}
	for _, doc := range docs {
		items = append(items, doc.Data())
	}

	data, err := json.Marshal(items)
	if err != nil {
		log.Fatalf("Error marshaling %s: %v", collection, err)
	}

	if err := os.WriteFile(outputPath, data, 0644); err != nil {
		log.Fatalf("Error writing %s: %v", outputPath, err)
	}

	log.Printf("Exported %d documents to %s", len(items), outputPath)
}
