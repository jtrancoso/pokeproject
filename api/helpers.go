package api

import "net/http"

// getLang extracts the language from the ?lang= query parameter. Defaults to "en".
func getLang(r *http.Request) string {
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		return "en"
	}
	return lang
}

// getTranslatedName extracts a translated name from the "names" array in PokeAPI data.
// Falls back to English, then to the "name" field.
func getTranslatedName(data map[string]interface{}, lang string) string {
	names, ok := data["names"].([]interface{})
	if !ok {
		return getStringField(data, "name")
	}
	var englishName, targetName string
	for _, n := range names {
		nameMap, ok := n.(map[string]interface{})
		if !ok {
			continue
		}
		langObj, ok := nameMap["language"].(map[string]interface{})
		if !ok {
			continue
		}
		langName := getStringField(langObj, "name")
		nameStr := getStringField(nameMap, "name")
		if langName == lang {
			targetName = nameStr
		}
		if langName == "en" {
			englishName = nameStr
		}
	}
	if targetName != "" {
		return targetName
	}
	if englishName != "" {
		return englishName
	}
	return getStringField(data, "name")
}

// extractEffectByLang extracts the effect text for a given language from effect_entries.
// Falls back to English.
func extractEffectByLang(data map[string]interface{}, lang string) string {
	entries, ok := data["effect_entries"].([]interface{})
	if !ok {
		return ""
	}
	var englishEffect, targetEffect string
	for _, entry := range entries {
		entryMap, ok := entry.(map[string]interface{})
		if !ok {
			continue
		}
		langObj, ok := entryMap["language"].(map[string]interface{})
		if !ok {
			continue
		}
		langName := getStringField(langObj, "name")
		effect := getStringField(entryMap, "effect")
		if langName == lang {
			targetEffect = effect
		}
		if langName == "en" {
			englishEffect = effect
		}
	}
	if targetEffect != "" {
		return targetEffect
	}
	return englishEffect
}

// getStringField safely extracts a string field from a map
func getStringField(data map[string]interface{}, key string) string {
	if val, ok := data[key].(string); ok {
		return val
	}
	return ""
}

// getIntPtrField safely extracts a nullable int field from a map
func getIntPtrField(data map[string]interface{}, key string) *int {
	val, exists := data[key]
	if !exists || val == nil {
		return nil
	}
	if v, ok := toInt(val); ok {
		return &v
	}
	return nil
}

// toInt converts a Firestore numeric value to int
func toInt(val interface{}) (int, bool) {
	switch v := val.(type) {
	case int64:
		return int(v), true
	case float64:
		return int(v), true
	case int:
		return v, true
	default:
		return 0, false
	}
}

// extractEnglishEffect finds the English effect text from effect_entries
func extractEnglishEffect(data map[string]interface{}) string {
	entries, ok := data["effect_entries"].([]interface{})
	if !ok {
		return ""
	}
	for _, entry := range entries {
		entryMap, ok := entry.(map[string]interface{})
		if !ok {
			continue
		}
		langObj, ok := entryMap["language"].(map[string]interface{})
		if !ok {
			continue
		}
		if getStringField(langObj, "name") == "en" {
			return getStringField(entryMap, "effect")
		}
	}
	return ""
}

// buildSearchMatchItem extracts a SearchMatchItem from raw Firestore data.
func buildSearchMatchItem(data map[string]interface{}) SearchMatchItem {
	item := SearchMatchItem{
		Name: getStringField(data, "name"),
	}
	if id, ok := toInt(data["id"]); ok {
		item.ID = id
	}
	if rid, ok := toInt(data["regional_id"]); ok {
		item.RegionalID = rid
	}
	if typesRaw, ok := data["types"].([]interface{}); ok {
		for _, t := range typesRaw {
			tMap, ok := t.(map[string]interface{})
			if !ok {
				continue
			}
			var entry struct {
				Slot int `json:"slot"`
				Type struct {
					Name string `json:"name"`
				} `json:"type"`
			}
			if slot, ok := toInt(tMap["slot"]); ok {
				entry.Slot = slot
			}
			if typeObj, ok := tMap["type"].(map[string]interface{}); ok {
				entry.Type.Name = getStringField(typeObj, "name")
			}
			item.Types = append(item.Types, entry)
		}
	}
	if item.Types == nil {
		item.Types = make([]struct {
			Slot int `json:"slot"`
			Type struct {
				Name string `json:"name"`
			} `json:"type"`
		}, 0)
	}
	if spritesRaw, ok := data["sprites"].(map[string]interface{}); ok {
		item.Sprites.FrontDefault = getStringField(spritesRaw, "front_default")
	}
	return item
}

// pokemonHasType checks if a SearchMatchItem has the given type.
func pokemonHasType(item SearchMatchItem, typeName string) bool {
	for _, t := range item.Types {
		if t.Type.Name == typeName {
			return true
		}
	}
	return false
}

// pokemonLearnsMoveInHGSS checks if a Pokemon can learn any of the given moves in HG/SS.
func pokemonLearnsMoveInHGSS(data map[string]interface{}, matchingMoves map[string]bool) string {
	movesRaw, ok := data["moves"].([]interface{})
	if !ok {
		return ""
	}
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
		if moveName == "" || !matchingMoves[moveName] {
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
			if getStringField(vgObj, "name") == "heartgold-soulsilver" {
				return moveName
			}
		}
	}
	return ""
}
