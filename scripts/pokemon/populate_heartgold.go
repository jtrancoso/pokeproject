package pokemon

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"pokeproject/scripts/common"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type Pokemon struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	BaseExperience int    `json:"base_experience"`
	Height         int    `json:"height"`
	Weight         int    `json:"weight"`
	Types          []struct {
		Slot int `json:"slot"`
		Type struct {
			Name string `json:"name"`
		} `json:"type"`
	} `json:"types"`
	Abilities []struct {
		Ability struct {
			Name string `json:"name"`
		} `json:"ability"`
		IsHidden bool `json:"is_hidden"`
	} `json:"abilities"`
	Stats []struct {
		BaseStat int `json:"base_stat"`
		Stat     struct {
			Name string `json:"name"`
		} `json:"stat"`
	} `json:"stats"`
	Sprites struct {
		FrontDefault string `json:"front_default"`
		BackDefault  string `json:"back_default"`
	} `json:"sprites"`
}

type PokedexEntry struct {
	EntryNumber int `json:"entry_number"`
	PokemonSpecies struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	} `json:"pokemon_species"`
}

type Pokedex struct {
	PokemonEntries []PokedexEntry `json:"pokemon_entries"`
}

func PopulateHeartgold() {
	projectRoot := common.GetProjectRoot()
	fmt.Println("Using directory:", projectRoot)

	// Load environment variables
	if err := godotenv.Load(filepath.Join(projectRoot, ".env")); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		log.Fatal("GOOGLE_CLOUD_PROJECT environment variable is not set")
	}

	// Initialize Firestore
	ctx := context.Background()
	opt := option.WithCredentialsFile(filepath.Join(projectRoot, "service-account.json"))
	client, err := firestore.NewClient(ctx, projectID, opt)
	if err != nil {
		log.Fatalf("Error initializing Firestore client: %v", err)
	}
	defer client.Close()

	// Ensure database exists
	if err := common.EnsureDatabaseExists(ctx, client); err != nil {
		log.Printf("Warning: Could not verify database existence: %v", err)
	}

	// Clean the collection before populating
	log.Println("Cleaning Pokemon collection...")
	iter := client.Collection("heartgold-pokemon").Documents(ctx)
	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		_, err = doc.Ref.Delete(ctx)
		if err != nil {
			log.Printf("Error deleting document %s: %v", doc.Ref.ID, err)
			continue
		}
	}
	log.Println("Collection cleaned successfully")

	// Create a test document to ensure database is working
	testDoc := map[string]interface{}{
		"test": true,
		"timestamp": time.Now(),
	}
	_, err = client.Collection("heartgold-pokemon").Doc("_test").Set(ctx, testDoc)
	if err != nil {
		log.Fatalf("Error creating test document: %v. Please ensure you have created the Firestore database in the Google Cloud Console.", err)
	}
	// Delete test document
	_, err = client.Collection("heartgold-pokemon").Doc("_test").Delete(ctx)
	if err != nil {
		log.Printf("Warning: Could not delete test document: %v", err)
	}

	// Fetch Johto Pokédex entries
	resp, err := http.Get("https://pokeapi.co/api/v2/pokedex/7")
	if err != nil {
		log.Fatalf("Error fetching Pokédex: %v", err)
	}
	defer resp.Body.Close()

	var pokedex Pokedex
	if err := json.NewDecoder(resp.Body).Decode(&pokedex); err != nil {
		log.Fatalf("Error decoding Pokédex response: %v", err)
	}

	fmt.Printf("Found %d Pokémon in Johto Pokédex\n", len(pokedex.PokemonEntries))

	// Process each Pokémon
	for _, entry := range pokedex.PokemonEntries {
		// Fetch detailed Pokémon data using the /pokemon/{name} endpoint
		pokemonURL := fmt.Sprintf("https://pokeapi.co/api/v2/pokemon/%s", entry.PokemonSpecies.Name)
		resp, err := http.Get(pokemonURL)
		if err != nil {
			log.Printf("Error fetching %s: %v", entry.PokemonSpecies.Name, err)
			continue
		}

		// Read the entire response body
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Printf("Error reading response for %s: %v", entry.PokemonSpecies.Name, err)
			continue
		}

		// Parse the JSON into a generic map to store all fields
		var pokemon Pokemon
		if err := json.Unmarshal(body, &pokemon); err != nil {
			log.Printf("Error decoding JSON for %s: %v", entry.PokemonSpecies.Name, err)
			continue
		}

		// Store the complete data in Firestore
		_, err = client.Collection("heartgold-pokemon").Doc(entry.PokemonSpecies.Name).Set(ctx, pokemon)
		if err != nil {
			log.Printf("Error storing %s in Firestore: %v", entry.PokemonSpecies.Name, err)
			continue
		}
		fmt.Printf("Stored %s in Firestore\n", entry.PokemonSpecies.Name)

		// Rate limiting to avoid overwhelming the API
		time.Sleep(1 * time.Second)
	}
} 