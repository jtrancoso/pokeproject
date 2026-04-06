import React, { useState, useMemo } from "react";
import type { TeamSlot, TypeChart } from "../types/pokemon";
import { getEffectiveness } from "../utils/typeCalculator";
import TypeBadge from "./TypeBadge";

interface CoverageChartProps {
  team: TeamSlot[];
  allTypes: string[];
  chart: TypeChart["chart"];
}

interface CoverageDetail {
  pokemonName: string;
  moveName: string;
  moveDisplayName: string;
  moveType: string;
  effectiveness: number;
}

const CoverageChart: React.FC<CoverageChartProps> = ({
  team,
  allTypes,
  chart,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Build detailed coverage: for each defender type, which moves are super effective
  const details = useMemo(() => {
    const map: Record<string, CoverageDetail[]> = {};
    for (const defType of allTypes) {
      const hits: CoverageDetail[] = [];
      for (const slot of team) {
        if (!slot.pokemon) continue;
        for (const move of slot.moves) {
          if (
            move.damage_class !== "physical" &&
            move.damage_class !== "special"
          )
            continue;
          const eff = getEffectiveness(move.type, [defType], chart);
          if (eff > 1.0) {
            hits.push({
              pokemonName: slot.pokemon.name,
              moveName: move.name,
              moveDisplayName: move.display_name || move.name,
              moveType: move.type,
              effectiveness: eff,
            });
          }
        }
      }
      map[defType] = hits;
    }
    return map;
  }, [team, allTypes, chart]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "16px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h4 style={{ margin: "0 0 10px", fontSize: "14px" }}>
        Cobertura Ofensiva
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "6px",
        }}
      >
        {allTypes.map((type) => {
          const hits = details[type] ?? [];
          const count = hits.length;
          const uncovered = count === 0;
          const isExpanded = expanded === type;
          return (
            <div key={type}>
              <div
                onClick={() => setExpanded(isExpanded ? null : type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: isExpanded ? "6px 6px 0 0" : "6px",
                  background: uncovered ? "#fff5f5" : "#f9f9f9",
                  border: uncovered ? "1px solid #e74c3c" : "1px solid #eee",
                  cursor: count > 0 ? "pointer" : "default",
                }}
              >
                <TypeBadge typeName={type} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: uncovered ? "#e74c3c" : "#333",
                  }}
                >
                  {count}
                </span>
              </div>
              {isExpanded && hits.length > 0 && (
                <div
                  style={{
                    background: "#f9f9f9",
                    border: "1px solid #eee",
                    borderTop: "none",
                    borderRadius: "0 0 6px 6px",
                    padding: "6px 8px",
                    fontSize: "12px",
                  }}
                >
                  {hits.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 0",
                      }}
                    >
                      <span>
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                          }}
                        >
                          {h.pokemonName}
                        </span>
                        {" → "}
                        <span style={{ textTransform: "capitalize" }}>
                          {h.moveDisplayName}
                        </span>
                      </span>
                      <span style={{ color: "#27ae60", fontWeight: 600 }}>
                        ×{h.effectiveness}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoverageChart;
