import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type RunCreateInput } from "@shared/routes";

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

export function useRuns() {
  return useQuery({
    queryKey: [api.runs.list.path],
    queryFn: async () => {
      const res = await fetch(api.runs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch runs");
      const json = await res.json();
      return parseWithLogging(api.runs.list.responses[200], json, "runs.list");
    },
  });
}

export function useCreateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RunCreateInput) => {
      const validated = api.runs.create.input.parse(input);
      const res = await fetch(api.runs.create.path, {
        method: api.runs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.runs.create.responses[400], errJson, "runs.create.400");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to create run");
      }

      const json = await res.json();
      return parseWithLogging(api.runs.create.responses[201], json, "runs.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.runs.list.path] });
    },
  });
}
