import React from "react";
import type { PokemonDetail as PokemonDetailType } from "../types/pokemon";
import TypeBadge from "./TypeBadge";

interface PokemonDetailProps {
  pokemon: PokemonDetailType;
}

const STAT_COLORS: Record<string, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp.Atk",
  "special-defense": "Sp.Def",
  speed: "Speed",
};

const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon }) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "16px",
        border: "1px solid #e0e0e0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          style={{ width: 80, height: 80, imageRendering: "pixelated" }}
        />
        <div>
          <h3
            style={{ margin: 0, textTransform: "capitalize", fontSize: "18px" }}
          >
            {pokemon.name}
          </h3>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} typeName={t.type.name} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <h4
          style={{
            margin: "0 0 6px",
            fontSize: "13px",
            color: "#666",
            textTransform: "uppercase",
          }}
        >
          Stats Base
        </h4>
        {pokemon.stats.map((s) => {
          const pct = Math.min((s.base_stat / 255) * 100, 100);
          const color = STAT_COLORS[s.stat.name] ?? "#aaa";
          const label = STAT_LABELS[s.stat.name] ?? s.stat.name;
          return (
            <div
              key={s.stat.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  width: "60px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                {label}
              </span>
              <span
                style={{ width: "30px", fontSize: "12px", textAlign: "right" }}
              >
                {s.base_stat}
              </span>
              <div
                style={{
                  flex: 1,
                  height: "10px",
                  background: "#eee",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "5px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h4
          style={{
            margin: "0 0 6px",
            fontSize: "13px",
            color: "#666",
            textTransform: "uppercase",
          }}
        >
          Habilidades
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {pokemon.abilities.map((a) => (
            <span
              key={a.ability.name}
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                background: a.is_hidden ? "#f0e6ff" : "#f0f0f0",
                border: a.is_hidden ? "1px solid #d0b0ff" : "1px solid #ddd",
                textTransform: "capitalize",
              }}
            >
              {a.ability.name.replace("-", " ")}
              {a.is_hidden && (
                <span
                  style={{ fontSize: "10px", color: "#9b59b6", marginLeft: 4 }}
                >
                  (oculta)
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
