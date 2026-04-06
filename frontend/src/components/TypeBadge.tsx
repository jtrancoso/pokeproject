import React from "react";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
};

interface TypeBadgeProps {
  typeName: string;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ typeName }) => {
  const color = TYPE_COLORS[typeName.toLowerCase()] ?? "#888";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "12px",
        backgroundColor: color,
        color: "#fff",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {typeName}
    </span>
  );
};

export default TypeBadge;
