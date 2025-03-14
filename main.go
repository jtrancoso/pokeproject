package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type Pokemon struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	GameIndices   []struct {
		GameIndex int `json:"game_index"`
		Version   struct {
			Name string `json:"name"`
		} `json:"version"`
	} `json:"game_indices"`
}

var firestoreClient *firestore.Client

func init() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		log.Fatal("GOOGLE_CLOUD_PROJECT environment variable is not set")
	}

	// Initialize Firestore
	ctx := context.Background()
	opt := option.WithCredentialsFile("service-account.json")
	client, err := firestore.NewClient(ctx, projectID, opt)
	if err != nil {
		log.Fatalf("Error initializing Firestore client: %v", err)
	}
	firestoreClient = client
}

func getPokemon(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement Pokemon retrieval from Firestore
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message": "Not implemented yet"}`))
}

func main() {
	defer firestoreClient.Close()

	// Define routes
	http.HandleFunc("/pokemon", getPokemon)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
} 