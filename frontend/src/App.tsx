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
        if (!res.ok) throw new Error("Error al obtener detalle");
        const detail: PokemonDetailType = await res.json();
        addPokemon(detail);
        setQuery(""); // Clear search after adding
      } catch {
        // silently fail for MVP
      } finally {
        setFetchingDetail(false);
      }
    },
    [addPokemon, isFull],
  );

  const handleRemovePokemon = useCallback(
    (index: number) => {
      removePokemon(index);
      if (selectedSlot === index) setSelectedSlot(null);
    },
    [removePokemon, selectedSlot],
  );

  // When a slot is selected, use a 2-column layout (detail+moves | team)
  // instead of 3-column (results | detail | team)
  const hasSelection = selectedPokemon !== null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pokémon Team Builder</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="subtitle">HeartGold / SoulSilver</span>
          <div style={{ display: "flex", gap: "4px", marginLeft: "12px" }}>
            <button
              onClick={() => setLang("en")}
              style={{
                padding: "3px 10px",
                fontSize: "12px",
                fontWeight: lang === "en" ? 700 : 400,
                background: lang === "en" ? "#6890F0" : "#e0e0e0",
                color: lang === "en" ? "#fff" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang("es")}
              style={{
                padding: "3px 10px",
                fontSize: "12px",
                fontWeight: lang === "es" ? 700 : 400,
                background: lang === "es" ? "#6890F0" : "#e0e0e0",
                color: lang === "es" ? "#fff" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ES
            </button>
          </div>
        </div>
      </header>

      <div className="app-search">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          loading={searchLoading || fetchingDetail}
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
                Error: {searchError}
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
                  No se encontraron resultados para "{query}"
                </div>
              )}
            <SearchResults results={results} onAddPokemon={handleAddPokemon} />
          </aside>
        )}

        {hasSelection ? (
          <main className="app-center-wide">
            <PokemonDetail pokemon={selectedPokemon} />
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
            />
          </main>
        ) : (
          <main className="app-center">
            <div className="placeholder">
              Busca Pokémon y añádelos al equipo. Luego selecciona un slot para
              asignar movimientos.
            </div>
          </main>
        )}

        <aside className="app-team">
          <TeamPanel
            team={team}
            onRemovePokemon={handleRemovePokemon}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            isFull={isFull}
          />
        </aside>
      </div>

      {allTypes.length > 0 && (
        <div className="app-analysis">
          <CoverageChart team={team} allTypes={allTypes} chart={chart} />
          <WeaknessChart team={team} allTypes={allTypes} chart={chart} />
        </div>
      )}
    </div>
  );
}

export default App;
