import { useState, useCallback } from "react";
import "./App.css";
import type {
  PokemonDetail as PokemonDetailType,
  SearchMatchItem,
} from "./types/pokemon";
import { useTeam } from "./hooks/useTeam";
import { useSearch } from "./hooks/useSearch";
import { useTypeChart } from "./hooks/useTypeChart";
import { useLang } from "./hooks/useLang";
import { t } from "./utils/i18n";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import TeamPanel from "./components/TeamPanel";
import PokemonDetail from "./components/PokemonDetail";
import MoveSelector from "./components/MoveSelector";
import CoverageChart from "./components/CoverageChart";
import WeaknessChart from "./components/WeaknessChart";

function App() {
  const { team, addPokemon, removePokemon, addMove, removeMove, isFull } =
    useTeam();
  const { lang, setLang, langParam } = useLang();
  const {
    query,
    setQuery,
    results,
    loading: searchLoading,
    error: searchError,
  } = useSearch(langParam);
  const { typeChart } = useTypeChart();

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const selectedPokemon =
    selectedSlot !== null ? (team[selectedSlot]?.pokemon ?? null) : null;
  const selectedMoves =
    selectedSlot !== null ? (team[selectedSlot]?.moves ?? []) : [];
  const allTypes = typeChart?.types ?? [];
  const chart = typeChart?.chart ?? {};

  const handleAddPokemon = useCallback(
    async (pokemon: SearchMatchItem) => {
      if (isFull) return;
      setFetchingDetail(true);
      try {
        const res = await fetch(
          `/api/pokemon/${encodeURIComponent(pokemon.name)}`,
        );
        if (!res.ok) throw new Error("Error");
        const detail: PokemonDetailType = await res.json();
        addPokemon(detail);
        setQuery("");
      } catch {
        /* silently fail */
      } finally {
        setFetchingDetail(false);
      }
    },
    [addPokemon, isFull, setQuery],
  );

  const handleRemovePokemon = useCallback(
    (index: number) => {
      removePokemon(index);
      if (selectedSlot === index) setSelectedSlot(null);
    },
    [removePokemon, selectedSlot],
  );

  const hasSelection = selectedPokemon !== null;

  return (
    <div className="app">
      <header className="app-header">
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
          }}
        >
          <img
            src="/icons/favicon.png"
            alt="MochiPC"
            style={{ width: 36, height: 36, imageRendering: "pixelated" }}
          />
          MochiPC
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="subtitle">{t("header.subtitle", lang)}</span>
          <div style={{ display: "flex", gap: "4px", marginLeft: "12px" }}>
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "3px 10px",
                  fontSize: "12px",
                  fontWeight: lang === l ? 700 : 400,
                  background: lang === l ? "#6890F0" : "#e0e0e0",
                  color: lang === l ? "#fff" : "#333",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="app-search">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          loading={searchLoading || fetchingDetail}
          lang={lang}
        />
      </div>

      <div className={hasSelection ? "app-body app-body--detail" : "app-body"}>
        {!hasSelection && (
          <aside className="app-results">
            {searchError && (
              <div
                style={{
                  padding: "12px",
                  color: "#e74c3c",
                  background: "#fff5f5",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                {t("search.error", lang)}: {searchError}
              </div>
            )}
            {query.length >= 2 &&
              !searchLoading &&
              !searchError &&
              results.by_name.length === 0 &&
              results.by_type.length === 0 &&
              results.by_move.length === 0 && (
                <div
                  style={{ padding: "12px", color: "#888", fontSize: "13px" }}
                >
                  {t("search.noResults", lang)} "{query}"
                </div>
              )}
            <SearchResults
              results={results}
              onAddPokemon={handleAddPokemon}
              lang={lang}
            />
          </aside>
        )}

        {hasSelection ? (
          <main className="app-center-wide">
            <PokemonDetail pokemon={selectedPokemon} lang={lang} />
            <MoveSelector
              pokemonName={selectedPokemon.name}
              assignedMoves={selectedMoves}
              onAddMove={(move) =>
                selectedSlot !== null && addMove(selectedSlot, move)
              }
              onRemoveMove={(moveIdx) =>
                selectedSlot !== null && removeMove(selectedSlot, moveIdx)
              }
              langParam={langParam}
              lang={lang}
            />
          </main>
        ) : (
          <main className="app-center">
            <div className="placeholder">{t("placeholder.text", lang)}</div>
          </main>
        )}

        <aside className="app-team">
          <TeamPanel
            team={team}
            onRemovePokemon={handleRemovePokemon}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            isFull={isFull}
            lang={lang}
          />
        </aside>
      </div>

      {allTypes.length > 0 && (
        <div className="app-analysis">
          <CoverageChart
            team={team}
            allTypes={allTypes}
            chart={chart}
            lang={lang}
          />
          <WeaknessChart
            team={team}
            allTypes={allTypes}
            chart={chart}
            lang={lang}
          />
        </div>
      )}

      <footer className="app-footer">
        <span>
          {t("footer.suggestions", lang)}{" "}
          <a href="mailto:chatter@mochipc.com">chatter@mochipc.com</a>
        </span>
        <span>
          {t("footer.data", lang)}{" "}
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PokeAPI
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;
