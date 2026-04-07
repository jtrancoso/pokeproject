import { useState, useMemo, useCallback, useEffect } from "react";
import { PokemonDetail, MoveDetail, TeamSlot } from "../types/pokemon";

const MAX_TEAM_SIZE = 6;
const MAX_MOVES = 4;
const STORAGE_KEY = "pokemon-team-builder-team";

function createEmptySlot(): TeamSlot {
  return { pokemon: null, moves: [] };
}

function createInitialTeam(): TeamSlot[] {
  return Array.from({ length: MAX_TEAM_SIZE }, createEmptySlot);
}

function loadTeamFromStorage(): TeamSlot[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as TeamSlot[];
      if (Array.isArray(parsed) && parsed.length === MAX_TEAM_SIZE) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupt data
  }
  return createInitialTeam();
}

export interface UseTeamReturn {
  team: TeamSlot[];
  addPokemon: (pokemon: PokemonDetail) => boolean;
  replacePokemon: (slotIndex: number, pokemon: PokemonDetail) => void;
  removePokemon: (slotIndex: number) => void;
  addMove: (slotIndex: number, move: MoveDetail) => boolean;
  removeMove: (slotIndex: number, moveIndex: number) => void;
  isFull: boolean;
}

export function useTeam(): UseTeamReturn {
  const [team, setTeam] = useState<TeamSlot[]>(loadTeamFromStorage);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  const addPokemon = useCallback((pokemon: PokemonDetail): boolean => {
    let added = false;
    setTeam((prev) => {
      const firstEmpty = prev.findIndex((slot) => slot.pokemon === null);
      if (firstEmpty === -1) return prev;
      added = true;
      const next = [...prev];
      next[firstEmpty] = { pokemon, moves: [] };
      return next;
    });
    return added;
  }, []);

  const replacePokemon = useCallback(
    (slotIndex: number, pokemon: PokemonDetail): void => {
      setTeam((prev) => {
        if (slotIndex < 0 || slotIndex >= MAX_TEAM_SIZE) return prev;
        const next = [...prev];
        next[slotIndex] = { pokemon, moves: [] };
        return next;
      });
    },
    [],
  );

  const removePokemon = useCallback((slotIndex: number): void => {
    setTeam((prev) => {
      if (slotIndex < 0 || slotIndex >= MAX_TEAM_SIZE) return prev;
      const next = [...prev];
      next[slotIndex] = createEmptySlot();
      return next;
    });
  }, []);

  const addMove = useCallback(
    (slotIndex: number, move: MoveDetail): boolean => {
      let added = false;
      setTeam((prev) => {
        if (slotIndex < 0 || slotIndex >= MAX_TEAM_SIZE) return prev;
        const slot = prev[slotIndex];
        if (!slot.pokemon) return prev;
        if (slot.moves.length >= MAX_MOVES) return prev;
        if (slot.moves.some((m) => m.name === move.name)) return prev;
        added = true;
        const next = [...prev];
        next[slotIndex] = { ...slot, moves: [...slot.moves, move] };
        return next;
      });
      return added;
    },
    [],
  );

  const removeMove = useCallback(
    (slotIndex: number, moveIndex: number): void => {
      setTeam((prev) => {
        if (slotIndex < 0 || slotIndex >= MAX_TEAM_SIZE) return prev;
        const slot = prev[slotIndex];
        if (moveIndex < 0 || moveIndex >= slot.moves.length) return prev;
        const next = [...prev];
        next[slotIndex] = {
          ...slot,
          moves: slot.moves.filter((_, i) => i !== moveIndex),
        };
        return next;
      });
    },
    [],
  );

  const isFull = useMemo(
    () => team.every((slot) => slot.pokemon !== null),
    [team],
  );

  return {
    team,
    addPokemon,
    replacePokemon,
    removePokemon,
    addMove,
    removeMove,
    isFull,
  };
}
