import React from "react";
import type { TeamSlot as TeamSlotType } from "../types/pokemon";
import { t, type Lang } from "../utils/i18n";
import TeamSlot from "./TeamSlot";

interface TeamPanelProps {
  team: TeamSlotType[];
  onRemovePokemon: (index: number) => void;
  selectedSlot: number | null;
  onSelectSlot: (index: number) => void;
  isFull: boolean;
  lang: Lang;
}

const TeamPanel: React.FC<TeamPanelProps> = ({
  team,
  onRemovePokemon,
  selectedSlot,
  onSelectSlot,
  isFull,
  lang,
}) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px" }}>{t("team.title", lang)}</h3>
        {isFull && (
          <span style={{ fontSize: "12px", color: "#e74c3c", fontWeight: 600 }}>
            {t("team.full", lang)}
          </span>
        )}
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
      >
        {team.map((slot, i) => (
          <TeamSlot
            key={i}
            slot={slot}
            slotIndex={i}
            onRemove={() => onRemovePokemon(i)}
            onSelect={() => onSelectSlot(i)}
            isSelected={selectedSlot === i}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamPanel;
