import { useState, useEffect } from "react";
import { TypeChart } from "../types/pokemon";

export interface UseTypeChartReturn {
  typeChart: TypeChart | null;
  loading: boolean;
  error: string | null;
}

export function useTypeChart(): UseTypeChartReturn {
  const [typeChart, setTypeChart] = useState<TypeChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChart() {
      try {
        const res = await fetch("/api/types/effectiveness");
        if (!res.ok) {
          throw new Error(`Failed to load type chart (${res.status})`);
        }
        const data: TypeChart = await res.json();
        if (!cancelled) {
          setTypeChart(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchChart();

    return () => {
      cancelled = true;
    };
  }, []);

  return { typeChart, loading, error };
}
