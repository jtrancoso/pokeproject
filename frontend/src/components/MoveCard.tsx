import React from "react";
import type { MoveDetail } from "../types/pokemon";
import TypeBadge from "./TypeBadge";

interface MoveCardProps {
  move: MoveDetail;
  onAdd?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

const CLASS_ICONS: Record<string, string> = {
  physical: "💥",
  special: "✨",
  status: "🔄",
};

const MoveCard: React.FC<MoveCardProps> = ({
  move,
  onAdd,
  onRemove,
  disabled,
}) => {
  const isClickable = onAdd && !disabled;

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
      <TypeBadge typeName={move.type} />
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
      <span title="Clase de daño" style={{ fontSize: "12px" }}>
        {CLASS_ICONS[move.damage_class] ?? ""} {move.damage_class}
      </span>
      {move.power !== null && (
        <span
          style={{ color: "#c0392b", fontWeight: 600, fontSize: "12px" }}
          title="Poder"
        >
          Pow: {move.power}
        </span>
      )}
      {move.accuracy !== null && (
        <span style={{ color: "#2980b9", fontSize: "12px" }} title="Precisión">
          Acc: {move.accuracy}%
        </span>
      )}
      <span style={{ color: "#888", fontSize: "12px" }} title="PP">
        PP: {move.pp}
      </span>
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
