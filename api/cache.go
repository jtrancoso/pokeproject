package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"unicode"

	"cloud.google.com/go/firestore"
)

// Cache holds all Pokemon and Move data in memory.
type Cache struct {
	PokemonRaw    []map[string]interface{}
	MovesRaw      map[string]map[string]interface{}
	MoveNameIndex map[string]string // translated name -> API name
}

// NewCacheFromJSON loads data from local JSON files (no Firestore needed).
func NewCacheFromJSON(dataDir string) (*Cache, error) {
	cache := &Cache{
		MovesRaw:      make(map[string]map[string]interface{}),
		MoveNameIndex: make(map[string]string),
	}

	// Load Pokemon
	pokemonPath := filepath.Join(dataDir, "heartgold-pokemon.json")
	pokemonData, err := os.ReadFile(pokemonPath)
	if err != nil {
		return nil, fmt.Errorf("could not read %s: %w", pokemonPath, err)
	}

	var pokemonRaw []map[string]interface{}
	if err := json.Unmarshal(pokemonData, &pokemonRaw); err != nil {
		return nil, fmt.Errorf("could not parse %s: %w", pokemonPath, err)
	}

	// Normalize keys (Firestore stores Go struct fields in PascalCase)
	for _, p := range pokemonRaw {
		cache.PokemonRaw = append(cache.PokemonRaw, normalizeKeys(p))
	}
	log.Printf("Loaded %d Pokemon from %s", len(cache.PokemonRaw), pokemonPath)

	// Load Moves
	movesPath := filepath.Join(dataDir, "heartgold-moves.json")
	movesData, err := os.ReadFile(movesPath)
	if err != nil {
		return nil, fmt.Errorf("could not read %s: %w", movesPath, err)
	}

	var movesRaw []map[string]interface{}
	if err := json.Unmarshal(movesData, &movesRaw); err != nil {
		return nil, fmt.Errorf("could not parse %s: %w", movesPath, err)
	}

	for _, m := range movesRaw {
		name := ""
		if n, ok := m["name"].(string); ok {
			name = n
		}
		if name == "" {
			continue
		}
		lowerName := strings.ToLower(name)
		cache.MovesRaw[lowerName] = m
		cache.MoveNameIndex[lowerName] = lowerName
		if names, ok := m["names"].([]interface{}); ok {
			for _, n := range names {
				nameMap, ok := n.(map[string]interface{})
				if !ok {
					continue
				}
				translatedName := strings.ToLower(getStringField(nameMap, "name"))
				if translatedName != "" {
					cache.MoveNameIndex[translatedName] = lowerName
				}
			}
		}
	}
	log.Printf("Loaded %d moves from %s", len(cache.MovesRaw), movesPath)

	return cache, nil
}

// NewCacheFromFirestore loads data from Firestore (fallback / development).
func NewCacheFromFirestore(client *firestore.Client) *Cache {
	ctx := context.Background()
	cache := &Cache{
		MovesRaw:      make(map[string]map[string]interface{}),
		MoveNameIndex: make(map[string]string),
	}

	log.Println("Loading Pokemon from Firestore...")
	pokemonDocs, err := client.Collection("heartgold-pokemon").Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("Failed to load Pokemon: %v", err)
	}
	for _, doc := range pokemonDocs {
		cache.PokemonRaw = append(cache.PokemonRaw, normalizeKeys(doc.Data()))
	}
	log.Printf("Loaded %d Pokemon from Firestore", len(cache.PokemonRaw))

	log.Println("Loading moves from Firestore...")
	moveDocs, err := client.Collection("heartgold-moves").Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("Failed to load moves: %v", err)
	}
	for _, doc := range moveDocs {
		data := doc.Data()
		name := getStringField(data, "name")
		if name == "" {
			continue
		}
		lowerName := strings.ToLower(name)
		cache.MovesRaw[lowerName] = data
		cache.MoveNameIndex[lowerName] = lowerName
		if names, ok := data["names"].([]interface{}); ok {
			for _, n := range names {
				nameMap, ok := n.(map[string]interface{})
				if !ok {
					continue
				}
				translatedName := strings.ToLower(getStringField(nameMap, "name"))
				if translatedName != "" {
					cache.MoveNameIndex[translatedName] = lowerName
				}
			}
		}
	}
	log.Printf("Loaded %d moves from Firestore", len(cache.MovesRaw))

	return cache
}

// normalizeKeys converts PascalCase keys to snake_case recursively.
func normalizeKeys(m map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{}, len(m))
	for k, v := range m {
		newKey := toSnakeCase(k)
		switch val := v.(type) {
		case map[string]interface{}:
			result[newKey] = normalizeKeys(val)
		case []interface{}:
			result[newKey] = normalizeSlice(val)
		default:
			result[newKey] = val
		}
	}
	return result
}

func normalizeSlice(s []interface{}) []interface{} {
	result := make([]interface{}, len(s))
	for i, v := range s {
		switch val := v.(type) {
		case map[string]interface{}:
			result[i] = normalizeKeys(val)
		case []interface{}:
			result[i] = normalizeSlice(val)
		default:
			result[i] = val
		}
	}
	return result
}

func toSnakeCase(s string) string {
	var result []rune
	runes := []rune(s)
	for i, r := range runes {
		if unicode.IsUpper(r) {
			if i > 0 {
				prevUpper := unicode.IsUpper(runes[i-1])
				nextLower := i+1 < len(runes) && unicode.IsLower(runes[i+1])
				if !prevUpper || nextLower {
					result = append(result, '_')
				}
			}
			result = append(result, unicode.ToLower(r))
		} else {
			result = append(result, r)
		}
	}
	return string(result)
}
