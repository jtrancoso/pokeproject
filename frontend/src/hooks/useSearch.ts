import { useState, useEffect, useRef } from "react";
import { SearchResponse, SearchMatchItem } from "../types/pokemon";

export interface SearchResults {
  by_name: SearchMatchItem[];
  by_type: SearchMatchItem[];
  by_move: SearchMatchItem[];
}

const EMPTY_RESULTS: SearchResults = {
  by_name: [],
  by_type: [],
  by_move: [],
};

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResults;
  loading: boolean;
  error: string | null;
}

export function useSearch(langParam: string): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = new URLSearchParams({ q: query });
        if (langParam) params.append("lang", langParam.replace("lang=", ""));
        const res = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Search failed (${res.status})`);
        }
        const data: SearchResponse = await res.json();
        setResults(data.results);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortControllerRef.current?.abort();
    };
  }, [query, langParam]);

  return { query, setQuery, results, loading, error };
}
