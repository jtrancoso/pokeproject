import React, { useState, useEffect } from "react";
import type { MoveDetail } from "../types/pokemon";
import { t, type Lang } from "../utils/i18n";
import MoveCard from "./MoveCard";

interface MoveSelectorProps {
  pokemonName: string;
  assignedMoves: MoveDetail[];
  onAddMove: (move: MoveDetail) => void;
  onRemoveMove: (index: number) => void;
  langParam: string;
  lang: Lang;
}

type LearnMethod = "all" | "level-up" | "machine" | "tutor" | "egg";

const TAB_KEYS: { key: string; value: LearnMethod }[] = [
  { key: "moves.all", value: "all" },
  { key: "moves.levelUp", value: "level-up" },
  { key: "moves.machine", value: "machine" },
  { key: "moves.tutor", value: "tutor" },
  { key: "moves.egg", value: "egg" },
];

const MoveSelector: React.FC<MoveSelectorProps> = ({
  pokemonName,
  assignedMoves,
  onAddMove,
  onRemoveMove,
  langParam,
  lang,
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
        if (!res.ok) throw new Error(`Error (${res.status})`);
        return res.json();
      })
      .then((data: { pokemon: string; moves: MoveDetail[] }) => {
        if (!cancelled) setAllMoves(data.moves);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pokemonName, langParam]);

  const assignedNames = new Set(assignedMoves.map((m) => m.name));
  const maxReached = assignedMoves.length >= 4;
  const filtered =
    filter === "all"
      ? allMoves
      : allMoves.filter((m) => m.learn_method === filter);
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
        {t("moves.assigned", lang)} ({assignedMoves.length}/4)
      </h4>
      {assignedMoves.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "12px" }}>
          {t("moves.none", lang)}
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
            <MoveCard
              key={m.name}
              move={m}
              onRemove={() => onRemoveMove(i)}
              lang={lang}
            />
          ))}
        </div>
      )}

      <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
        {t("moves.available", lang)}
      </h4>
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        {TAB_KEYS.map((tab) => (
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
            {t(tab.key, lang)}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ fontSize: "13px", color: "#888" }}>
          {t("moves.loading", lang)}
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
              {t("moves.emptyCategory", lang)}
            </div>
          ) : (
            sorted.map((m) => (
              <MoveCard
                key={`${m.name}-${m.learn_method}`}
                move={m}
                onAdd={() => onAddMove(m)}
                disabled={assignedNames.has(m.name) || maxReached}
                lang={lang}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MoveSelector;
