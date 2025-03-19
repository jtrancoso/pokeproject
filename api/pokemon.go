package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"cloud.google.com/go/firestore"
)

// PokemonListItem represents a Pokemon in the list view
type PokemonListItem struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	Types         []struct {
		Slot int `json:"slot"`
		Type struct {
			Name string `json:"name"`
		} `json:"type"`
	} `json:"types"`
	Sprites struct {
		FrontDefault string `json:"front_default"`
	} `json:"sprites"`
}

// PokemonDetail represents a Pokemon in the detail view
type PokemonDetail struct {
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

// GetPokemonList returns all Pokemon from Firestore
func GetPokemonList(w http.ResponseWriter, r *http.Request, client *firestore.Client) {
	ctx := context.Background()
	
	// Get all documents from the collection
	iter := client.Collection("heartgold-pokemon").Documents(ctx)
	defer iter.Stop()

	var pokemonList []PokemonListItem
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var pokemon PokemonListItem
		if err := doc.DataTo(&pokemon); err != nil {
			http.Error(w, fmt.Sprintf("Error parsing Pokemon data: %v", err), http.StatusInternalServerError)
			return
		}
		pokemonList = append(pokemonList, pokemon)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pokemonList)
}

// normalizePokemonName prepares a Pokemon name for consistent lookup
func normalizePokemonName(name string) string {
	// Convert to lowercase
	return strings.ToLower(name)
}

// GetPokemonByName returns a specific Pokemon by name (case-insensitive)
func GetPokemonByName(w http.ResponseWriter, r *http.Request, client *firestore.Client) {
	ctx := context.Background()
	
	// Get and normalize name from URL
	name := normalizePokemonName(r.URL.Path[len("/pokemon/"):])

	// Query Firestore for the Pokemon
	iter := client.Collection("heartgold-pokemon").Documents(ctx)
	defer iter.Stop()

	var pokemon PokemonDetail
	found := false

	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		if err := doc.DataTo(&pokemon); err != nil {
			continue
		}

		if pokemon.Name == name {
			found = true
			break
		}
	}

	if !found {
		http.Error(w, "Pokemon not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pokemon)
} 