import React from "react";
import type { SearchMatchItem } from "../types/pokemon";
import TypeBadge from "./TypeBadge";

interface PokemonCardProps {
  pokemon: SearchMatchItem;
  onAdd: () => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onAdd }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        background: "#fff",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <img
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        style={{ width: 48, height: 48, imageRendering: "pixelated" }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, textTransform: "capitalize" }}>
          {pokemon.name}
          <span
            style={{
              fontWeight: 400,
              color: "#888",
              marginLeft: 6,
              fontSize: "13px",
            }}
          >
            #{pokemon.regional_id}
          </span>
        </div>
        <div
          style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}
        >
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} typeName={t.type.name} />
          ))}
        </div>
        {pokemon.match_reason === "move" && pokemon.matched_move && (
          <div style={{ fontSize: "12px", color: "#666", marginTop: 2 }}>
            Movimiento: <strong>{pokemon.matched_move}</strong>
          </div>
        )}
      </div>
      <button
        onClick={onAdd}
        style={{
          padding: "6px 14px",
          fontSize: "13px",
          fontWeight: 600,
          background: "#6890F0",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Añadir
      </button>
    </div>
  );
};

export default PokemonCard;
