package scripts

import (
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