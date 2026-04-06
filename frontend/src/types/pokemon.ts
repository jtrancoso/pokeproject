export interface PokemonListItem {
  id: number;
  name: string;
  regional_id: number;
  types: { slot: number; type: { name: string } }[];
  sprites: { front_default: string };
}

export interface PokemonDetail extends PokemonListItem {
  base_experience: number;
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: { front_default: string; back_default: string };
}

export interface MoveDetail {
  name: string;
  display_name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damage_class: string;
  learn_method: string;
  level_learned_at: number;
}

export interface TeamSlot {
  pokemon: PokemonDetail | null;
  moves: MoveDetail[];
}

export interface TypeChart {
  types: string[];
  chart: Record<string, Record<string, number>>;
}

export interface CoverageResult {
  [defenderType: string]: number;
}

export interface WeaknessResult {
  [attackerType: string]: { weak: number; resist: number };
}

export interface SearchMatchItem {
  id: number;
  name: string;
  regional_id: number;
  types: { slot: number; type: { name: string } }[];
  sprites: { front_default: string };
  match_reason: "name" | "type" | "move";
  matched_move?: string;
}

export interface SearchResponse {
  query: string;
  results: {
    by_name: SearchMatchItem[];
    by_type: SearchMatchItem[];
    by_move: SearchMatchItem[];
  };
}
