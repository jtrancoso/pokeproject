package typeeffectiveness

// Chart holds the Gen IV type effectiveness data.
// Data only stores multipliers that differ from 1.0 (neutral).
type Chart struct {
	Types []string                      `json:"types"`
	Data  map[string]map[string]float64 `json:"chart"`
}

// NewChart returns the complete Gen IV type effectiveness chart (17 types, no Fairy).
func NewChart() *Chart {
	c := &Chart{
		Types: []string{
			"normal", "fire", "water", "electric", "grass",
			"ice", "fighting", "poison", "ground", "flying",
			"psychic", "bug", "rock", "ghost", "dragon",
			"dark", "steel",
		},
		Data: make(map[string]map[string]float64),
	}

	set := func(atk, def string, val float64) {
		if c.Data[atk] == nil {
			c.Data[atk] = make(map[string]float64)
		}
		c.Data[atk][def] = val
	}

	// Normal
	set("normal", "rock", 0.5)
	set("normal", "ghost", 0)
	set("normal", "steel", 0.5)

	// Fire
	set("fire", "fire", 0.5)
	set("fire", "water", 0.5)
	set("fire", "grass", 2)
	set("fire", "ice", 2)
	set("fire", "bug", 2)
	set("fire", "rock", 0.5)
	set("fire", "dragon", 0.5)
	set("fire", "steel", 2)

	// Water
	set("water", "fire", 2)
	set("water", "water", 0.5)
	set("water", "grass", 0.5)
	set("water", "ground", 2)
	set("water", "rock", 2)
	set("water", "dragon", 0.5)

	// Electric
	set("electric", "water", 2)
	set("electric", "electric", 0.5)
	set("electric", "grass", 0.5)
	set("electric", "ground", 0)
	set("electric", "flying", 2)
	set("electric", "dragon", 0.5)

	// Grass
	set("grass", "fire", 0.5)
	set("grass", "water", 2)
	set("grass", "grass", 0.5)
	set("grass", "poison", 0.5)
	set("grass", "ground", 2)
	set("grass", "flying", 0.5)
	set("grass", "bug", 0.5)
	set("grass", "rock", 2)
	set("grass", "dragon", 0.5)
	set("grass", "steel", 0.5)

	// Ice
	set("ice", "fire", 0.5)
	set("ice", "water", 0.5)
	set("ice", "grass", 2)
	set("ice", "ice", 0.5)
	set("ice", "ground", 2)
	set("ice", "flying", 2)
	set("ice", "dragon", 2)
	set("ice", "steel", 0.5)

	// Fighting
	set("fighting", "normal", 2)
	set("fighting", "ice", 2)
	set("fighting", "poison", 0.5)
	set("fighting", "flying", 0.5)
	set("fighting", "psychic", 0.5)
	set("fighting", "bug", 0.5)
	set("fighting", "rock", 2)
	set("fighting", "ghost", 0)
	set("fighting", "dark", 2)
	set("fighting", "steel", 2)

	// Poison
	set("poison", "poison", 0.5)
	set("poison", "ground", 0.5)
	set("poison", "rock", 0.5)
	set("poison", "ghost", 0.5)
	set("poison", "grass", 2)
	set("poison", "steel", 0)

	// Ground
	set("ground", "fire", 2)
	set("ground", "electric", 2)
	set("ground", "grass", 0.5)
	set("ground", "poison", 2)
	set("ground", "flying", 0)
	set("ground", "bug", 0.5)
	set("ground", "rock", 2)
	set("ground", "steel", 2)

	// Flying
	set("flying", "electric", 0.5)
	set("flying", "grass", 2)
	set("flying", "fighting", 2)
	set("flying", "bug", 2)
	set("flying", "rock", 0.5)
	set("flying", "steel", 0.5)

	// Psychic
	set("psychic", "fighting", 2)
	set("psychic", "poison", 2)
	set("psychic", "psychic", 0.5)
	set("psychic", "dark", 0)
	set("psychic", "steel", 0.5)

	// Bug
	set("bug", "fire", 0.5)
	set("bug", "grass", 2)
	set("bug", "fighting", 0.5)
	set("bug", "poison", 0.5)
	set("bug", "flying", 0.5)
	set("bug", "psychic", 2)
	set("bug", "ghost", 0.5)
	set("bug", "dark", 2)
	set("bug", "steel", 0.5)

	// Rock
	set("rock", "fire", 2)
	set("rock", "ice", 2)
	set("rock", "fighting", 0.5)
	set("rock", "ground", 0.5)
	set("rock", "flying", 2)
	set("rock", "bug", 2)
	set("rock", "steel", 0.5)

	// Ghost
	set("ghost", "normal", 0)
	set("ghost", "psychic", 2)
	set("ghost", "ghost", 2)
	set("ghost", "dark", 0.5)
	set("ghost", "steel", 0.5)

	// Dragon
	set("dragon", "dragon", 2)
	set("dragon", "steel", 0.5)

	// Dark
	set("dark", "fighting", 0.5)
	set("dark", "psychic", 2)
	set("dark", "ghost", 2)
	set("dark", "dark", 0.5)
	set("dark", "steel", 0.5)

	// Steel
	set("steel", "fire", 0.5)
	set("steel", "water", 0.5)
	set("steel", "electric", 0.5)
	set("steel", "ice", 2)
	set("steel", "rock", 2)
	set("steel", "steel", 0.5)

	return c
}

// GetEffectiveness returns the type effectiveness multiplier for an attack type
// against a defense type. Returns 1.0 (neutral) if the combination is not in the chart.
func (c *Chart) GetEffectiveness(attackType, defenseType string) float64 {
	if defenders, ok := c.Data[attackType]; ok {
		if mult, ok := defenders[defenseType]; ok {
			return mult
		}
	}
	return 1.0
}
