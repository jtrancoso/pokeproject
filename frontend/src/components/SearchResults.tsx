import React from "react";
import type { SearchMatchItem } from "../types/pokemon";
import type { SearchResults as SearchResultsType } from "../hooks/useSearch";
import { t, type Lang } from "../utils/i18n";
import PokemonCard from "./PokemonCard";

interface SearchResultsProps {
  results: SearchResultsType;
  onAddPokemon: (pokemon: SearchMatchItem) => void;
  lang: Lang;
}

const sectionStyle: React.CSSProperties = { marginBottom: "16px" };
const headerStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "8px",
  paddingBottom: "4px",
  borderBottom: "1px solid #eee",
};

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onAddPokemon,
  lang,
}) => {
  const hasResults =
    results.by_name.length > 0 ||
    results.by_type.length > 0 ||
    results.by_move.length > 0;
  if (!hasResults) return null;

  return (
    <div>
      {results.by_name.length > 0 && (
        <div style={sectionStyle}>
          <div style={headerStyle}>
            {t("results.byName", lang)} ({results.by_name.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {results.by_name.map((p) => (
              <PokemonCard
                key={`name-${p.id}`}
                pokemon={p}
                onAdd={() => onAddPokemon(p)}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}
      {results.by_type.length > 0 && (
        <div style={sectionStyle}>
          <div style={headerStyle}>
            {t("results.byType", lang)} ({results.by_type.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {results.by_type.map((p) => (
              <PokemonCard
                key={`type-${p.id}`}
                pokemon={p}
                onAdd={() => onAddPokemon(p)}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}
      {results.by_move.length > 0 && (
        <div style={sectionStyle}>
          <div style={headerStyle}>
            {t("results.byMove", lang)} ({results.by_move.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {results.by_move.map((p) => (
              <PokemonCard
                key={`move-${p.id}`}
                pokemon={p}
                onAdd={() => onAddPokemon(p)}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
