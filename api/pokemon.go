package api

import (
	"encoding/json"
	"net/http"
	"strings"
)

// PokemonListItem represents a Pokemon in the list view
type PokemonListItem struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	RegionalID int    `json:"regional_id"`
	Types      []struct {
		Slot int `json:"slot"`
		Type struct {
			Name string `json:"name"`
		} `json:"type"`
	} `json:"types"`
	Sprites struct {
		FrontDefault string `json:"front_default"`
	} `json:"sprites"`
}

// GetPokemonListCached returns all Pokemon from the in-memory cache
func GetPokemonListCached(w http.ResponseWriter, r *http.Request, cache *Cache) {
	var list []SearchMatchItem
	for _, data := range cache.PokemonRaw {
		list = append(list, buildSearchMatchItem(data))
	}
	if list == nil {
		list = []SearchMatchItem{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

// ExtractPokemonName extracts the pokemon name from the URL path
func ExtractPokemonName(path string) string {
	if strings.HasPrefix(path, "/api/pokemon/") {
		return strings.TrimPrefix(path, "/api/pokemon/")
	}
	return strings.TrimPrefix(path, "/pokemon/")
}

// GetPokemonByNameCached returns a specific Pokemon by name from cache
func GetPokemonByNameCached(w http.ResponseWriter, r *http.Request, cache *Cache) {
	name := strings.ToLower(ExtractPokemonName(r.URL.Path))

	if name == "" {
		http.Error(w, `{"error": "Pokemon name is required"}`, http.StatusBadRequest)
		return
	}

	for _, data := range cache.PokemonRaw {
		if strings.ToLower(getStringField(data, "name")) == name {
			// Build a detailed response from raw data
			detail := buildPokemonDetail(data)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(detail)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Pokemon not found: " + name})
}

// buildPokemonDetail builds a detailed Pokemon response from raw Firestore data
func buildPokemonDetail(data map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	// Copy basic fields
	result["id"] = data["id"]
	result["name"] = data["name"]
	result["regional_id"] = data["regional_id"]
	result["base_experience"] = data["base_experience"]
	result["height"] = data["height"]
	result["weight"] = data["weight"]
	result["types"] = data["types"]
	result["abilities"] = data["abilities"]
	result["stats"] = data["stats"]
	result["sprites"] = data["sprites"]

	return result
}
