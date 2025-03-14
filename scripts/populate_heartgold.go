package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
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
	defer client.Close()

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
		// Fetch detailed Pokémon data
		resp, err := http.Get(entry.PokemonSpecies.URL)
		if err != nil {
			log.Printf("Error fetching %s: %v", entry.PokemonSpecies.Name, err)
			continue
		}

		var p Pokemon
		if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
			log.Printf("Error decoding %s: %v", entry.PokemonSpecies.Name, err)
			resp.Body.Close()
			continue
		}
		resp.Body.Close()

		// Store in Firestore
		_, err = client.Collection("heartgold-pokemon").Doc(entry.PokemonSpecies.Name).Set(ctx, p)
		if err != nil {
			log.Printf("Error storing %s in Firestore: %v", entry.PokemonSpecies.Name, err)
			continue
		}
		fmt.Printf("Stored %s in Firestore\n", entry.PokemonSpecies.Name)

		// Rate limiting to avoid overwhelming the API
		time.Sleep(1 * time.Second)
	}
} 