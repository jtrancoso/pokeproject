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

	// Find matching moves: search by API name AND by translated names
	matchingMoves := make(map[string]bool)
	// Search by API name
	for name := range cache.MovesRaw {
		if strings.Contains(name, query) {
			matchingMoves[name] = true
		}
	}
	// Search by translated name (e.g. "placaje" -> "tackle")
	for translatedName, apiName := range cache.MoveNameIndex {
		if strings.Contains(translatedName, query) {
			matchingMoves[apiName] = true
		}
	}

	byName := []SearchMatchItem{}
	byType := []SearchMatchItem{}
	byMove := []SearchMatchItem{}

	isTypeSearch := validTypes[query]

	log.Printf("Search: query=%q, pokemonCount=%d, matchingMoves=%d, isTypeSearch=%v",
		query, len(cache.PokemonRaw), len(matchingMoves), isTypeSearch)

	for _, data := range cache.PokemonRaw {
		item := buildSearchMatchItem(data)

		// Search by name
		if strings.Contains(strings.ToLower(item.Name), query) {
			match := item
			match.MatchReason = "name"
			byName = append(byName, match)
		}

		// Search by type
		if isTypeSearch && pokemonHasType(item, query) {
			match := item
			match.MatchReason = "type"
			byType = append(byType, match)
		}

		// Search by move
		if len(matchingMoves) > 0 {
			if matchedMove := pokemonLearnsMoveInHGSS(data, matchingMoves); matchedMove != "" {
				match := item
				match.MatchReason = "move"
				// Show the translated name of the matched move
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
