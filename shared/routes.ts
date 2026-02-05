import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { mlArtifacts, runs } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const runCreateSchema = createInsertSchema(runs).omit({ id: true });

export const api = {
  artifacts: {
    current: {
      method: "GET" as const,
      path: "/api/artifacts/current",
      responses: {
        200: z.custom<typeof mlArtifacts.$inferSelect>().nullable(),
      },
    },
  },
  runs: {
    create: {
      method: "POST" as const,
      path: "/api/runs",
      input: runCreateSchema,
      responses: {
        201: z.custom<typeof runs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/runs",
      responses: {
        200: z.array(z.custom<typeof runs.$inferSelect>()),
      },
    },
  },
  engine: {
    series: {
      method: "GET" as const,
      path: "/api/engine/:engineId/series",
      responses: {
        200: z.object({
          engineId: z.string(),
          totalCycles: z.number(),
          featureNames: z.array(z.string()),
          series: z.array(
            z.object({
              cycle: z.number(),
              values: z.record(z.number()),
            }),
          ),
        }),
        404: errorSchemas.notFound,
      },
    },
    risk: {
      method: "GET" as const,
      path: "/api/engine/:engineId/risk",
      input: z
        .object({
          cycle: z.coerce.number().int().positive().optional(),
        })
        .optional(),
      responses: {
        200: z.object({
          cycle: z.number(),
          risk: z.number(),
          status: z.enum(["Healthy", "Warning", "Critical"]),
          lifecycleProgress: z.number(),
        }),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    explain: {
      method: "GET" as const,
      path: "/api/engine/:engineId/explain",
      input: z
        .object({
          cycle: z.coerce.number().int().positive(),
          topK: z.coerce.number().int().positive().max(12).optional(),
        })
        .optional(),
      responses: {
        200: z.object({
          cycle: z.number(),
          risk: z.number(),
          topFactors: z.array(
            z.object({
              feature: z.string(),
              contribution: z.number(),
              value: z.number(),
            }),
          ),
        }),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    restart: {
      method: "POST" as const,
      path: "/api/engine/:engineId/restart",
      responses: {
        200: z.object({
          ok: z.boolean(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  return url;
}

export type RunCreateInput = z.infer<typeof api.runs.create.input>;
export type RunResponse = z.infer<typeof api.runs.create.responses[201]>;
export type RunsListResponse = z.infer<typeof api.runs.list.responses[200]>;
export type CurrentArtifactResponse = z.infer<
  typeof api.artifacts.current.responses[200]
>;
export type EngineSeriesResponse = z.infer<typeof api.engine.series.responses[200]>;
export type EngineRiskResponse = z.infer<typeof api.engine.risk.responses[200]>;
export type EngineExplainResponse = z.infer<
  typeof api.engine.explain.responses[200]
>;
