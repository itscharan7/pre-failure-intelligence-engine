import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

function parseWithLogging<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: any } },
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error?.format?.() ?? result.error);
    throw result.error;
  }
  return result.data;
}

export function useEngineSeries(engineId?: string) {
  return useQuery({
    enabled: !!engineId,
    queryKey: [api.engine.series.path, engineId],
    queryFn: async () => {
      const url = buildUrl(api.engine.series.path, { engineId: engineId! });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const errJson = await res.json().catch(() => null);
        if (errJson) parseWithLogging(api.engine.series.responses[404], errJson, "engine.series.404");
        throw new Error("Engine not found");
      }
      if (!res.ok) throw new Error("Failed to fetch engine series");
      const json = await res.json();
      return parseWithLogging(api.engine.series.responses[200], json, "engine.series.200");
    },
  });
}

export function useEngineRisk(engineId?: string, cycle?: number) {
  return useQuery({
    enabled: !!engineId,
    queryKey: [api.engine.risk.path, engineId, cycle ?? null],
    queryFn: async () => {
      const base = buildUrl(api.engine.risk.path, { engineId: engineId! });
      const qs = cycle ? `?${new URLSearchParams({ cycle: String(cycle) }).toString()}` : "";
      const url = `${base}${qs}`;

      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        if (res.status === 404) {
          const errJson = await res.json().catch(() => null);
          if (errJson) parseWithLogging(api.engine.risk.responses[404], errJson, "engine.risk.404");
          throw new Error("Engine not found");
        }
        if (res.status === 400) {
          const errJson = await res.json().catch(() => null);
          if (errJson) {
            const parsed = parseWithLogging(api.engine.risk.responses[400], errJson, "engine.risk.400");
            throw new Error(parsed.message);
          }
          throw new Error("Invalid request");
        }
        throw new Error("Failed to fetch risk");
      }

      const json = await res.json();
      return parseWithLogging(api.engine.risk.responses[200], json, "engine.risk.200");
    },
  });
}

export function useEngineExplain(engineId?: string, cycle?: number, topK: number = 8) {
  return useQuery({
    enabled: !!engineId && !!cycle,
    queryKey: [api.engine.explain.path, engineId, cycle ?? null, topK],
    queryFn: async () => {
      const base = buildUrl(api.engine.explain.path, { engineId: engineId! });
      const params = new URLSearchParams();
      if (cycle) params.set("cycle", String(cycle));
      if (topK) params.set("topK", String(topK));
      const url = `${base}?${params.toString()}`;

      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        if (res.status === 404) {
          const errJson = await res.json().catch(() => null);
          if (errJson) parseWithLogging(api.engine.explain.responses[404], errJson, "engine.explain.404");
          throw new Error("Engine not found");
        }
        if (res.status === 400) {
          const errJson = await res.json().catch(() => null);
          if (errJson) {
            const parsed = parseWithLogging(api.engine.explain.responses[400], errJson, "engine.explain.400");
            throw new Error(parsed.message);
          }
          throw new Error("Invalid request");
        }
        throw new Error("Failed to fetch explainability");
      }

      const json = await res.json();
      return parseWithLogging(api.engine.explain.responses[200], json, "engine.explain.200");
    },
  });
}

export function useRestartEngine(engineId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!engineId) throw new Error("Missing engineId");
      const url = buildUrl(api.engine.restart.path, { engineId });
      const res = await fetch(url, { method: api.engine.restart.method, credentials: "include" });

      if (!res.ok) {
        if (res.status === 404) {
          const errJson = await res.json().catch(() => null);
          if (errJson) parseWithLogging(api.engine.restart.responses[404], errJson, "engine.restart.404");
          throw new Error("Engine not found");
        }
        throw new Error("Failed to restart simulation");
      }

      const json = await res.json();
      return parseWithLogging(api.engine.restart.responses[200], json, "engine.restart.200");
    },
    onSuccess: () => {
      // Broad invalidation since restart impacts lifecycle/series/risk/explain
      qc.invalidateQueries({ queryKey: [api.engine.series.path] });
      qc.invalidateQueries({ queryKey: [api.engine.risk.path] });
      qc.invalidateQueries({ queryKey: [api.engine.explain.path] });
    },
  });
}
