package api

import (
	"encoding/json"
	"net/http"

	"pokeproject/typeeffectiveness"
)

// GetTypeEffectiveness returns the Gen IV type effectiveness chart as JSON.
func GetTypeEffectiveness(w http.ResponseWriter, r *http.Request) {
	chart := typeeffectiveness.NewChart()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chart)
}
