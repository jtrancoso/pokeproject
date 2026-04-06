import React, { useState, useEffect } from "react";
import type { MoveDetail } from "../types/pokemon";
import MoveCard from "./MoveCard";

interface MoveSelectorProps {
  pokemonName: string;
  assignedMoves: MoveDetail[];
  onAddMove: (move: MoveDetail) => void;
  onRemoveMove: (index: number) => void;
  langParam: string;
}

type LearnMethod = "all" | "level-up" | "machine" | "tutor" | "egg";

const TABS: { label: string; value: LearnMethod }[] = [
  { label: "Todos", value: "all" },
  { label: "Nivel", value: "level-up" },
  { label: "MT/MO", value: "machine" },
  { label: "Tutor", value: "tutor" },
  { label: "Huevo", value: "egg" },
];

const MoveSelector: React.FC<MoveSelectorProps> = ({
  pokemonName,
  assignedMoves,
  onAddMove,
  onRemoveMove,
  langParam,
}) => {
  const [allMoves, setAllMoves] = useState<MoveDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LearnMethod>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAllMoves([]);
    setFilter("all");

    fetch(
      `/api/pokemon/${encodeURIComponent(pokemonName)}/moves${langParam ? "?" + langParam : ""}`,
    )
      .then((res) => {
        if (!res.ok)
          throw new Error(`Error cargando movimientos (${res.status})`);
        return res.json();
      })
      .then((data: { pokemon: string; moves: MoveDetail[] }) => {
        if (!cancelled) setAllMoves(data.moves);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error desconocido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pokemonName]);

  const assignedNames = new Set(assignedMoves.map((m) => m.name));
  const maxReached = assignedMoves.length >= 4;

  const filtered =
    filter === "all"
      ? allMoves
      : allMoves.filter((m) => m.learn_method === filter);

  // Sort level-up by level
  const sorted =
    filter === "level-up"
      ? [...filtered].sort((a, b) => a.level_learned_at - b.level_learned_at)
      : filtered;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "16px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
        Movimientos asignados ({assignedMoves.length}/4)
      </h4>
      {assignedMoves.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "12px" }}>
          Ningún movimiento asignado
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginBottom: "12px",
          }}
        >
          {assignedMoves.map((m, i) => (
            <MoveCard key={m.name} move={m} onRemove={() => onRemoveMove(i)} />
          ))}
        </div>
      )}

      <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
        Movimientos disponibles
      </h4>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: filter === tab.value ? 700 : 400,
              background: filter === tab.value ? "#6890F0" : "#f0f0f0",
              color: filter === tab.value ? "#fff" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ fontSize: "13px", color: "#888" }}>
          Cargando movimientos...
        </div>
      )}
      {error && (
        <div style={{ fontSize: "13px", color: "#e74c3c" }}>{error}</div>
      )}

      {!loading && !error && (
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {sorted.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#aaa" }}>
              No hay movimientos en esta categoría
            </div>
          ) : (
            sorted.map((m) => {
              const isAssigned = assignedNames.has(m.name);
              return (
                <MoveCard
                  key={`${m.name}-${m.learn_method}`}
                  move={m}
                  onAdd={() => onAddMove(m)}
                  disabled={isAssigned || maxReached}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MoveSelector;
