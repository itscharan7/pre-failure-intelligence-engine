import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

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

export function useCurrentArtifact() {
  return useQuery({
    queryKey: [api.artifacts.current.path],
    queryFn: async () => {
      const res = await fetch(api.artifacts.current.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch current artifact");
      const json = await res.json();
      return parseWithLogging(api.artifacts.current.responses[200], json, "artifacts.current");
    },
  });
}
