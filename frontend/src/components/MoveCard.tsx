import React from "react";
import type { MoveDetail } from "../types/pokemon";
import type { Lang } from "../utils/i18n";
import { translateDamageClass } from "../utils/gameTranslations";
import TypeBadge from "./TypeBadge";

interface MoveCardProps {
  move: MoveDetail;
  onAdd?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  lang?: Lang;
}

const CLASS_ICONS: Record<string, string> = {
  physical: "/icons/physical.png",
  special: "/icons/special.png",
  status: "/icons/status.png",
};

const MoveCard: React.FC<MoveCardProps> = ({
  move,
  onAdd,
  onRemove,
  disabled,
  lang,
}) => {
  const isClickable = onAdd && !disabled;
  const dcLabel = lang
    ? translateDamageClass(move.damage_class, lang)
    : move.damage_class;
  const iconSrc = CLASS_ICONS[move.damage_class];

  return (
    <div
      className="move-card"
      onClick={isClickable ? onAdd : undefined}
      style={{
        background: disabled ? "#f9f9f9" : "#fff",
        opacity: disabled ? 0.6 : 1,
        cursor: isClickable ? "pointer" : "default",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (isClickable) e.currentTarget.style.background = "#f0fff0";
      }}
      onMouseLeave={(e) => {
        if (isClickable)
          e.currentTarget.style.background = disabled ? "#f9f9f9" : "#fff";
      }}
    >
      <TypeBadge typeName={move.type} lang={lang} />
      <span
        style={{
          fontWeight: 600,
          textTransform: "capitalize",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {move.display_name || move.name.replace(/-/g, " ")}
      </span>
      <div className="move-card-stats">
        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          {iconSrc && (
            <img
              src={iconSrc}
              alt={dcLabel}
              style={{ width: 16, height: 16, imageRendering: "pixelated" }}
            />
          )}
          {dcLabel}
        </span>
        {move.power !== null && (
          <span style={{ color: "#c0392b", fontWeight: 600 }}>
            Pow: {move.power}
          </span>
        )}
        {move.accuracy !== null && (
          <span style={{ color: "#2980b9" }}>Acc: {move.accuracy}%</span>
        )}
        <span style={{ color: "#888" }}>PP: {move.pp}</span>
        {move.learn_method === "level-up" && move.level_learned_at > 0 && (
          <span style={{ color: "#e67e22", fontWeight: 600 }}>
            Nv. {move.level_learned_at}
          </span>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            disabled={disabled}
            style={{
              padding: "3px 10px",
              fontSize: "12px",
              fontWeight: 600,
              marginLeft: "auto",
              background: disabled ? "#ccc" : "#27ae60",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            +
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              padding: "3px 10px",
              fontSize: "12px",
              fontWeight: 600,
              marginLeft: "auto",
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            −
          </button>
        )}
      </div>
    </div>
  );
};

export default MoveCard;
