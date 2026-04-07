import React from "react";
import { t, type Lang } from "../utils/i18n";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  loading: boolean;
  lang: Lang;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  loading,
  lang,
}) => {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t("search.placeholder", lang)}
        style={{
          width: "100%",
          padding: "10px 16px",
          fontSize: "15px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#6890F0")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
      />
      {loading && (
        <span
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "13px",
            color: "#888",
          }}
        >
          {t("search.loading", lang)}
        </span>
      )}
    </div>
  );
};

export default SearchBar;
