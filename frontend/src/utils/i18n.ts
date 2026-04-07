export type Lang = "en" | "es";

const translations: Record<string, Record<Lang, string>> = {
  // Header
  "header.title": { en: "Pokémon Team Builder", es: "Pokémon Team Builder" },
  "header.subtitle": {
    en: "HeartGold / SoulSilver",
    es: "HeartGold / SoulSilver",
  },

  // Search
  "search.placeholder": {
    en: "Search by name, type or move...",
    es: "Buscar por nombre, tipo o movimiento...",
  },
  "search.loading": { en: "Searching...", es: "Buscando..." },
  "search.noResults": {
    en: "No results found for",
    es: "No se encontraron resultados para",
  },
  "search.error": { en: "Error", es: "Error" },

  // Search results
  "results.byName": { en: "By name", es: "Por nombre" },
  "results.byType": { en: "By type", es: "Por tipo" },
  "results.byMove": { en: "By move", es: "Por movimiento" },

  // Team
  "team.title": { en: "Team", es: "Equipo" },
  "team.full": { en: "Team full", es: "Equipo completo" },
  "team.empty": { en: "empty", es: "vacío" },
  "team.slot": { en: "Slot", es: "Slot" },
  "team.moves": { en: "moves", es: "movimientos" },
  "team.add": { en: "Add", es: "Añadir" },

  // Pokemon detail
  "detail.baseStats": { en: "Base Stats", es: "Stats Base" },
  "detail.abilities": { en: "Abilities", es: "Habilidades" },
  "detail.hidden": { en: "(hidden)", es: "(oculta)" },

  // Moves
  "moves.assigned": { en: "Assigned moves", es: "Movimientos asignados" },
  "moves.none": { en: "No moves assigned", es: "Ningún movimiento asignado" },
  "moves.available": { en: "Available moves", es: "Movimientos disponibles" },
  "moves.all": { en: "All", es: "Todos" },
  "moves.levelUp": { en: "Level", es: "Nivel" },
  "moves.machine": { en: "TM/HM", es: "MT/MO" },
  "moves.tutor": { en: "Tutor", es: "Tutor" },
  "moves.egg": { en: "Egg", es: "Huevo" },
  "moves.loading": { en: "Loading moves...", es: "Cargando movimientos..." },
  "moves.emptyCategory": {
    en: "No moves in this category",
    es: "No hay movimientos en esta categoría",
  },
  "moves.move": { en: "Move", es: "Movimiento" },

  // Coverage
  "coverage.title": { en: "Offensive Coverage", es: "Cobertura Ofensiva" },

  // Weakness
  "weakness.title": { en: "Team Weaknesses", es: "Debilidades del Equipo" },

  // Placeholder
  "placeholder.text": {
    en: "Search for Pokémon and add them to your team. Then select a slot to assign moves.",
    es: "Busca Pokémon y añádelos al equipo. Luego selecciona un slot para asignar movimientos.",
  },

  // Footer
  "footer.suggestions": { en: "Suggestions?", es: "¿Sugerencias?" },
  "footer.data": { en: "Data from", es: "Datos de" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}
