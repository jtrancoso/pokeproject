import React from "react";
import type { TeamSlot as TeamSlotType } from "../types/pokemon";
import { t, type Lang } from "../utils/i18n";
import TypeBadge from "./TypeBadge";

interface TeamSlotProps {
  slot: TeamSlotType;
  slotIndex: number;
  onRemove: () => void;
  onSelect: () => void;
  isSelected: boolean;
  lang: Lang;
}

const TeamSlot: React.FC<TeamSlotProps> = ({
  slot,
  slotIndex,
  onRemove,
  onSelect,
  isSelected,
  lang,
}) => {
  const isEmpty = slot.pokemon === null;

  return (
    <div
      onClick={onSelect}
      style={{
        padding: "10px",
        borderRadius: "10px",
        border: isSelected ? "2px solid #6890F0" : "2px solid #e0e0e0",
        background: isSelected ? "#f0f5ff" : "#fff",
        cursor: "pointer",
        minHeight: "80px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {isEmpty ? (
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#bbb",
            fontSize: "13px",
          }}
        >
          {t("team.slot", lang)} {slotIndex + 1} — {t("team.empty", lang)}
        </div>
      ) : (
        <>
          <img
            src={slot.pokemon!.sprites.front_default}
            alt={slot.pokemon!.name}
            style={{ width: 48, height: 48, imageRendering: "pixelated" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                textTransform: "capitalize",
                fontSize: "14px",
              }}
            >
              {slot.pokemon!.name}
            </div>
            <div
              style={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                marginTop: 2,
              }}
            >
              {slot.pokemon!.types.map((tp) => (
                <TypeBadge
                  key={tp.type.name}
                  typeName={tp.type.name}
                  lang={lang}
                />
              ))}
            </div>
            {slot.moves.length > 0 && (
              <div style={{ fontSize: "11px", color: "#888", marginTop: 2 }}>
                {slot.moves.length}/4 {t("team.moves", lang)}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
};

export default TeamSlot;
