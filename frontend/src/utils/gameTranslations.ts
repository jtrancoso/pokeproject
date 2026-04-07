import type { Lang } from "./i18n";

// Type names in each language
const TYPE_NAMES: Record<string, Record<Lang, string>> = {
  normal: { en: "Normal", es: "Normal" },
  fire: { en: "Fire", es: "Fuego" },
  water: { en: "Water", es: "Agua" },
  electric: { en: "Electric", es: "Eléctrico" },
  grass: { en: "Grass", es: "Planta" },
  ice: { en: "Ice", es: "Hielo" },
  fighting: { en: "Fighting", es: "Lucha" },
  poison: { en: "Poison", es: "Veneno" },
  ground: { en: "Ground", es: "Tierra" },
  flying: { en: "Flying", es: "Volador" },
  psychic: { en: "Psychic", es: "Psíquico" },
  bug: { en: "Bug", es: "Bicho" },
  rock: { en: "Rock", es: "Roca" },
  ghost: { en: "Ghost", es: "Fantasma" },
  dragon: { en: "Dragon", es: "Dragón" },
  dark: { en: "Dark", es: "Siniestro" },
  steel: { en: "Steel", es: "Acero" },
};

// Stat names
const STAT_NAMES: Record<string, Record<Lang, string>> = {
  hp: { en: "HP", es: "PS" },
  attack: { en: "Attack", es: "Ataque" },
  defense: { en: "Defense", es: "Defensa" },
  "special-attack": { en: "Sp.Atk", es: "At.Esp" },
  "special-defense": { en: "Sp.Def", es: "Def.Esp" },
  speed: { en: "Speed", es: "Velocidad" },
};

// Damage class names
const DAMAGE_CLASS_NAMES: Record<string, Record<Lang, string>> = {
  physical: { en: "Physical", es: "Físico" },
  special: { en: "Special", es: "Especial" },
  status: { en: "Status", es: "Estado" },
};

// Learn method names
const LEARN_METHOD_NAMES: Record<string, Record<Lang, string>> = {
  "level-up": { en: "Level up", es: "Nivel" },
  machine: { en: "TM/HM", es: "MT/MO" },
  tutor: { en: "Tutor", es: "Tutor" },
  egg: { en: "Egg", es: "Huevo" },
};

export function translateType(type: string, lang: Lang): string {
  return TYPE_NAMES[type.toLowerCase()]?.[lang] ?? type;
}

export function translateStat(stat: string, lang: Lang): string {
  return STAT_NAMES[stat.toLowerCase()]?.[lang] ?? stat;
}

export function translateDamageClass(dc: string, lang: Lang): string {
  return DAMAGE_CLASS_NAMES[dc.toLowerCase()]?.[lang] ?? dc;
}

export function translateLearnMethod(method: string, lang: Lang): string {
  return LEARN_METHOD_NAMES[method.toLowerCase()]?.[lang] ?? method;
}
