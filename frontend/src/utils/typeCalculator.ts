import type {
  TeamSlot,
  TypeChart,
  CoverageResult,
  WeaknessResult,
} from "../types/pokemon";

/**
 * Returns the effectiveness multiplier of an attack type against defender types.
 * For single type: looks up chart[attackType][defenderType], defaults to 1.0.
 * For dual type: multiplies the individual factors.
 * If any type is immune (0), result is 0.
 */
export function getEffectiveness(
  attackType: string,
  defenderTypes: string[],
  chart: TypeChart["chart"],
): number {
  let multiplier = 1.0;
  for (const defType of defenderTypes) {
    const factor = chart[attackType]?.[defType] ?? 1.0;
    if (factor === 0) return 0;
    multiplier *= factor;
  }
  return multiplier;
}

/**
 * Calculates offensive coverage: for each of the 17 types, counts how many
 * moves in the team are super effective (factor > 1.0) against that type.
 * Only counts moves with damage_class "physical" or "special" (excludes "status").
 */
export function calculateCoverage(
  team: TeamSlot[],
  allTypes: string[],
  chart: TypeChart["chart"],
): CoverageResult {
  const result: CoverageResult = {};
  for (const defType of allTypes) {
    result[defType] = 0;
  }

  for (const slot of team) {
    if (!slot.pokemon) continue;
    for (const move of slot.moves) {
      if (move.damage_class !== "physical" && move.damage_class !== "special")
        continue;
      for (const defType of allTypes) {
        const factor = getEffectiveness(move.type, [defType], chart);
        if (factor > 1.0) {
          result[defType]++;
        }
      }
    }
  }

  return result;
}

/**
 * Calculates defensive weaknesses: for each of the 17 attacking types, counts
 * how many Pokémon in the team are weak (factor > 1.0) and how many resist
 * (factor < 1.0, including immunities at 0).
 */
export function calculateWeaknesses(
  team: TeamSlot[],
  allTypes: string[],
  chart: TypeChart["chart"],
): WeaknessResult {
  const result: WeaknessResult = {};
  for (const atkType of allTypes) {
    result[atkType] = { weak: 0, resist: 0 };
  }

  for (const slot of team) {
    if (!slot.pokemon) continue;
    const pokemonTypes = slot.pokemon.types.map((t) => t.type.name);
    for (const atkType of allTypes) {
      const factor = getEffectiveness(atkType, pokemonTypes, chart);
      if (factor > 1.0) {
        result[atkType].weak++;
      } else if (factor < 1.0) {
        result[atkType].resist++;
      }
    }
  }

  return result;
}
