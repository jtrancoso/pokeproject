import React, { useState, useMemo } from "react";
import type { TeamSlot, TypeChart } from "../types/pokemon";
import { t, type Lang } from "../utils/i18n";
import { getEffectiveness } from "../utils/typeCalculator";
import TypeBadge from "./TypeBadge";

interface WeaknessChartProps {
  team: TeamSlot[];
  allTypes: string[];
  chart: TypeChart["chart"];
  lang: Lang;
}

interface WeaknessDetail {
  pokemonName: string;
  effectiveness: number;
  category: "weak" | "resist";
}

const WeaknessChart: React.FC<WeaknessChartProps> = ({
  team,
  allTypes,
  chart,
  lang,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const details = useMemo(() => {
    const map: Record<string, WeaknessDetail[]> = {};
    for (const atkType of allTypes) {
      const entries: WeaknessDetail[] = [];
      for (const slot of team) {
        if (!slot.pokemon) continue;
        const pokemonTypes = slot.pokemon.types.map((t) => t.type.name);
        const eff = getEffectiveness(atkType, pokemonTypes, chart);
        if (eff > 1.0) {
          entries.push({
            pokemonName: slot.pokemon.name,
            effectiveness: eff,
            category: "weak",
          });
        } else if (eff < 1.0) {
          entries.push({
            pokemonName: slot.pokemon.name,
            effectiveness: eff,
            category: "resist",
          });
        }
      }
      map[atkType] = entries;
    }
    return map;
  }, [team, allTypes, chart]);

  const counts = useMemo(() => {
    const map: Record<string, { weak: number; resist: number }> = {};
    for (const type of allTypes) {
      const entries = details[type] ?? [];
      map[type] = {
        weak: entries.filter((e) => e.category === "weak").length,
        resist: entries.filter((e) => e.category === "resist").length,
      };
    }
    return map;
  }, [details, allTypes]);

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
        {t("weakness.title", lang)}
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "6px",
        }}
      >
        {allTypes.map((type) => {
          const entry = counts[type] ?? { weak: 0, resist: 0 };
          const danger = entry.weak >= 3;
          const isExpanded = expanded === type;
          const typeDetails = details[type] ?? [];
          const hasDetails = typeDetails.length > 0;
          return (
            <div key={type}>
              <div
                onClick={() =>
                  hasDetails && setExpanded(isExpanded ? null : type)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  borderRadius: isExpanded ? "6px 6px 0 0" : "6px",
                  background: danger ? "#fff5f5" : "#f9f9f9",
                  border: danger ? "1px solid #e74c3c" : "1px solid #eee",
                  cursor: hasDetails ? "pointer" : "default",
                }}
              >
                <TypeBadge typeName={type} lang={lang} />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    fontSize: "12px",
                  }}
                >
                  <span
                    style={{
                      color: danger ? "#e74c3c" : "#c0392b",
                      fontWeight: 600,
                    }}
                  >
                    ▼ {entry.weak}
                  </span>
                  <span style={{ color: "#27ae60", fontWeight: 600 }}>
                    ▲ {entry.resist}
                  </span>
                </div>
              </div>
              {isExpanded && typeDetails.length > 0 && (
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
                  {typeDetails.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 0",
                      }}
                    >
                      <span
                        style={{ textTransform: "capitalize", fontWeight: 600 }}
                      >
                        {d.pokemonName}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: d.category === "weak" ? "#e74c3c" : "#27ae60",
                        }}
                      >
                        ×{d.effectiveness}
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

export default WeaknessChart;
