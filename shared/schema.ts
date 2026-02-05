import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep the existing users table (template compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// Pre-Failure Intelligence (ML artifacts + runs)
// ============================================

export const mlArtifacts = pgTable("ml_artifacts", {
  // Single-row table (by id) to store current deployed model metadata
  id: varchar("id").primaryKey(),
  modelName: text("model_name").notNull(),
  modelVersion: text("model_version").notNull(),
  trainedOnDataset: text("trained_on_dataset").notNull(),
  trainedOnSubset: text("trained_on_subset").notNull(),
  featureListJson: text("feature_list_json").notNull(),
  notes: text("notes").notNull().default(""),
});

export type MlArtifact = typeof mlArtifacts.$inferSelect;

export const insertMlArtifactSchema = createInsertSchema(mlArtifacts).omit({});
export type InsertMlArtifact = z.infer<typeof insertMlArtifactSchema>;

export const runs = pgTable("runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engineId: text("engine_id").notNull(),
  dataset: text("dataset").notNull(), // e.g. NASA C-MAPSS
  subset: text("subset").notNull(), // e.g. FD001
  totalCycles: text("total_cycles").notNull(),
  startedAtIso: text("started_at_iso").notNull(),
});

export type Run = typeof runs.$inferSelect;

export const insertRunSchema = createInsertSchema(runs).omit({ id: true });
export type InsertRun = z.infer<typeof insertRunSchema>;

// ============================================
// EXPLICIT API CONTRACT TYPES
// ============================================

export type CreateRunRequest = InsertRun;
export type RunResponse = Run;

export type CurrentArtifactResponse = MlArtifact | null;

export interface RiskPoint {
  cycle: number;
  risk: number; // 0..100
  status: "Healthy" | "Warning" | "Critical";
}

export interface FeatureContribution {
  feature: string;
  contribution: number; // signed
  value: number;
}

export interface ExplainResponse {
  cycle: number;
  risk: number;
  topFactors: FeatureContribution[];
}

export interface SensorSeriesPoint {
  cycle: number;
  values: Record<string, number>;
}

export interface EngineSeriesResponse {
  engineId: string;
  totalCycles: number;
  featureNames: string[];
  series: SensorSeriesPoint[];
}
