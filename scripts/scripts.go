package scripts

import (
	"pokeproject/scripts/export"
	"pokeproject/scripts/moves"
	"pokeproject/scripts/pokemon"
)

// PopulateHeartgold runs the Pokémon population script
func PopulateHeartgold() {
	pokemon.PopulateHeartgold()
}

// PopulateMoves runs the moves population script
func PopulateMoves() {
	moves.PopulateMoves()
}

// ExportJSON exports Firestore data to local JSON files
func ExportJSON() {
	export.ExportJSON()
} 