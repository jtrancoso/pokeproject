package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

// SearchMatchItem represents a single Pokemon match in search results.
type SearchMatchItem struct {
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
	MatchReason string `json:"match_reason"`
	MatchedMove string `json:"matched_move,omitempty"`
}

// SearchResults groups search matches by category.
type SearchResults struct {
	ByName []SearchMatchItem `json:"by_name"`
	ByType []SearchMatchItem `json:"by_type"`
	ByMove []SearchMatchItem `json:"by_move"`
}

// SearchResponse is the top-level response for the search endpoint.
type SearchResponse struct {
	Query   string        `json:"query"`
	Results SearchResults `json:"results"`
}

// validTypes lists the 17 Gen IV types.
var validTypes = map[string]bool{
	"normal": true, "fire": true, "water": true, "electric": true,
	"grass": true, "ice": true, "fighting": true, "poison": true,
	"ground": true, "flying": true, "psychic": true, "bug": true,
	"rock": true, "ghost": true, "dragon": true, "dark": true,
	"steel": true,
}

// typeTranslations maps translated type names to their English API name.
var typeTranslations = map[string]string{
	// Spanish
	"normal": "normal", "fuego": "fire", "agua": "water", "eléctrico": "electric",
	"electrico": "electric", "planta": "grass", "hielo": "ice", "lucha": "fighting",
	"veneno": "poison", "tierra": "ground", "volador": "flying", "psíquico": "psychic",
	"psiquico": "psychic", "bicho": "bug", "roca": "rock", "fantasma": "ghost",
	"dragón": "dragon", "dragon": "dragon", "siniestro": "dark", "acero": "steel",
	// English (identity)
	"fire": "fire", "water": "water", "electric": "electric", "grass": "grass",
	"ice": "ice", "fighting": "fighting", "poison": "poison", "ground": "ground",
	"flying": "flying", "psychic": "psychic", "bug": "bug", "rock": "rock",
	"ghost": "ghost", "dark": "dark", "steel": "steel",
}

// resolveTypeQuery checks if the query matches a type name (in any language).
// Returns the English type name or "" if not a type.
func resolveTypeQuery(query string) string {
	// Exact match
	if apiType, ok := typeTranslations[query]; ok {
		return apiType
	}
	return ""
}

// SearchCached handles GET /api/search?q={query} using in-memory cache.
func SearchCached(w http.ResponseWriter, r *http.Request, cache *Cache) {
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	if len(query) < 2 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Query parameter 'q' is required and must be at least 2 characters",
		})
		return
	}

	// Check if query matches a type (in any language)
	matchedType := resolveTypeQuery(query)

	// Find matching moves: search by API name AND by translated names
	matchingMoves := make(map[string]bool)
	for name := range cache.MovesRaw {
		if strings.Contains(name, query) {
			matchingMoves[name] = true
		}
	}
	for translatedName, apiName := range cache.MoveNameIndex {
		if strings.Contains(translatedName, query) {
			matchingMoves[apiName] = true
		}
	}

	byName := []SearchMatchItem{}
	byType := []SearchMatchItem{}
	byMove := []SearchMatchItem{}

	log.Printf("Search: query=%q, matchedType=%q, matchingMoves=%d",
		query, matchedType, len(matchingMoves))

	for _, data := range cache.PokemonRaw {
		item := buildSearchMatchItem(data)

		// Search by name
		if strings.Contains(strings.ToLower(item.Name), query) {
			match := item
			match.MatchReason = "name"
			byName = append(byName, match)
		}

		// Search by type (using resolved type name)
		if matchedType != "" && pokemonHasType(item, matchedType) {
			match := item
			match.MatchReason = "type"
			byType = append(byType, match)
		}

		// Search by move
		if len(matchingMoves) > 0 {
			if matchedMove := pokemonLearnsMoveInHGSS(data, matchingMoves); matchedMove != "" {
				match := item
				match.MatchReason = "move"
				if moveData, ok := cache.MovesRaw[matchedMove]; ok {
					lang := getLang(r)
					match.MatchedMove = getTranslatedName(moveData, lang)
				} else {
					match.MatchedMove = matchedMove
				}
				byMove = append(byMove, match)
			}
		}
	}

	resp := SearchResponse{
		Query: query,
		Results: SearchResults{
			ByName: byName,
			ByType: byType,
			ByMove: byMove,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
