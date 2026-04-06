package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// PokemonMoveEntry represents a move entry in the PokemonMovesResponse
type PokemonMoveEntry struct {
	Name           string `json:"name"`
	DisplayName    string `json:"display_name"`
	Type           string `json:"type"`
	Power          *int   `json:"power"`
	Accuracy       *int   `json:"accuracy"`
	PP             int    `json:"pp"`
	DamageClass    string `json:"damage_class"`
	LearnMethod    string `json:"learn_method"`
	LevelLearnedAt int    `json:"level_learned_at"`
}

// PokemonMovesResponse represents the API response for a Pokemon's moves
type PokemonMovesResponse struct {
	Pokemon string             `json:"pokemon"`
	Moves   []PokemonMoveEntry `json:"moves"`
}

// MoveResponse represents the API response for a single move
type MoveResponse struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Type        string `json:"type"`
	Power       *int   `json:"power"`
	Accuracy    *int   `json:"accuracy"`
	PP          int    `json:"pp"`
	DamageClass string `json:"damage_class"`
	Effect      string `json:"effect"`
}

// GetMoveByNameCached returns a specific move by name from the in-memory cache
func GetMoveByNameCached(w http.ResponseWriter, r *http.Request, cache *Cache) {
	name := strings.TrimPrefix(r.URL.Path, "/api/moves/")
	name = strings.ToLower(name)
	lang := getLang(r)

	if name == "" {
		http.Error(w, `{"error": "Move name is required"}`, http.StatusBadRequest)
		return
	}

	data, ok := cache.MovesRaw[name]
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Move not found: %s", name)})
		return
	}

	move := MoveResponse{
		Name:        getStringField(data, "name"),
		DisplayName: getTranslatedName(data, lang),
	}
	if typeObj, ok := data["type"].(map[string]interface{}); ok {
		move.Type = getStringField(typeObj, "name")
	}
	move.Power = getIntPtrField(data, "power")
	move.Accuracy = getIntPtrField(data, "accuracy")
	if pp, ok := toInt(data["pp"]); ok {
		move.PP = pp
	}
	if dcObj, ok := data["damage_class"].(map[string]interface{}); ok {
		move.DamageClass = getStringField(dcObj, "name")
	}
	move.Effect = extractEffectByLang(data, lang)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(move)
}

// GetPokemonMovesCached returns the moves a Pokemon can learn in HG/SS from cache
func GetPokemonMovesCached(w http.ResponseWriter, r *http.Request, cache *Cache) {
	path := r.URL.Path
	path = strings.TrimPrefix(path, "/api/pokemon/")
	name := strings.TrimSuffix(path, "/moves")
	name = strings.ToLower(name)
	lang := getLang(r)

	if name == "" {
		http.Error(w, `{"error": "Pokemon name is required"}`, http.StatusBadRequest)
		return
	}

	var pokemonData map[string]interface{}
	for _, data := range cache.PokemonRaw {
		if strings.ToLower(getStringField(data, "name")) == name {
			pokemonData = data
			break
		}
	}

	if pokemonData == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Pokemon not found: %s", name)})
		return
	}

	movesRaw, ok := pokemonData["moves"].([]interface{})
	if !ok {
		resp := PokemonMovesResponse{Pokemon: name, Moves: []PokemonMoveEntry{}}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	var entries []PokemonMoveEntry
	for _, moveRaw := range movesRaw {
		moveMap, ok := moveRaw.(map[string]interface{})
		if !ok {
			continue
		}
		moveObj, ok := moveMap["move"].(map[string]interface{})
		if !ok {
			continue
		}
		moveName := getStringField(moveObj, "name")
		if moveName == "" {
			continue
		}

		vgDetails, ok := moveMap["version_group_details"].([]interface{})
		if !ok {
			continue
		}

		for _, vgd := range vgDetails {
			detail, ok := vgd.(map[string]interface{})
			if !ok {
				continue
			}
			vgObj, ok := detail["version_group"].(map[string]interface{})
			if !ok {
				continue
			}
			if getStringField(vgObj, "name") != "heartgold-soulsilver" {
				continue
			}

			learnMethod := ""
			if mlm, ok := detail["move_learn_method"].(map[string]interface{}); ok {
				learnMethod = getStringField(mlm, "name")
			}
			levelLearnedAt := 0
			if lvl, ok := toInt(detail["level_learned_at"]); ok {
				levelLearnedAt = lvl
			}

			entry := PokemonMoveEntry{
				Name:           moveName,
				LearnMethod:    learnMethod,
				LevelLearnedAt: levelLearnedAt,
			}

			if moveData, ok := cache.MovesRaw[strings.ToLower(moveName)]; ok {
				entry.DisplayName = getTranslatedName(moveData, lang)
				if typeObj, ok := moveData["type"].(map[string]interface{}); ok {
					entry.Type = getStringField(typeObj, "name")
				}
				entry.Power = getIntPtrField(moveData, "power")
				entry.Accuracy = getIntPtrField(moveData, "accuracy")
				if pp, ok := toInt(moveData["pp"]); ok {
					entry.PP = pp
				}
				if dcObj, ok := moveData["damage_class"].(map[string]interface{}); ok {
					entry.DamageClass = getStringField(dcObj, "name")
				}
			}
			if entry.DisplayName == "" {
				entry.DisplayName = moveName
			}

			entries = append(entries, entry)
			break
		}
	}

	if entries == nil {
		entries = []PokemonMoveEntry{}
	}

	resp := PokemonMovesResponse{Pokemon: name, Moves: entries}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
