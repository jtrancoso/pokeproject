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

  return (
    <div
      onClick={isClickable ? onAdd : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        background: disabled ? "#f9f9f9" : "#fff",
        borderRadius: "6px",
        border: "1px solid #e0e0e0",
        opacity: disabled ? 0.6 : 1,
        fontSize: "13px",
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
        }}
      >
        {move.display_name || move.name.replace(/-/g, " ")}
      </span>
      <span
        style={{
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}
      >
        {CLASS_ICONS[move.damage_class] && (
          <img
            src={CLASS_ICONS[move.damage_class]}
            alt={dcLabel}
            style={{ width: 16, height: 16, imageRendering: "pixelated" }}
          />
        )}
        {dcLabel}
      </span>
      {move.power !== null && (
        <span style={{ color: "#c0392b", fontWeight: 600, fontSize: "12px" }}>
          Pow: {move.power}
        </span>
      )}
      {move.accuracy !== null && (
        <span style={{ color: "#2980b9", fontSize: "12px" }}>
          Acc: {move.accuracy}%
        </span>
      )}
      <span style={{ color: "#888", fontSize: "12px" }}>PP: {move.pp}</span>
      {onAdd && (
        <button
          onClick={onAdd}
          disabled={disabled}
          style={{
            padding: "3px 10px",
            fontSize: "12px",
            fontWeight: 600,
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
  );
};

export default MoveCard;
