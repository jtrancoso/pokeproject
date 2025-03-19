package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"

	"pokeproject/api"
	"pokeproject/scripts"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

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

func main() {
	// Define command line flags
	pokemonFlag := flag.Bool("pokemon", false, "Run the Pokémon population script")
	movesFlag := flag.Bool("moves", false, "Run the moves population script")
	flag.Parse()

	// Run the selected script if flags are set
	if *pokemonFlag {
		log.Println("Running Pokémon population script...")
		scripts.PopulateHeartgold()
		return
	}
	if *movesFlag {
		log.Println("Running moves population script...")
		scripts.PopulateMoves()
		return
	}

	// If no flags are set, start the server
	startServer()
}

func startServer() {
	// Define routes
	http.HandleFunc("/pokemon", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			api.GetPokemonList(w, r, firestoreClient)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/pokemon/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			api.GetPokemonByName(w, r, firestoreClient)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

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