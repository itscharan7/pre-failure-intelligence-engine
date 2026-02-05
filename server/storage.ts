import { db } from "./db";
import { mlArtifacts, runs, type MlArtifact, type Run, type CreateRunRequest } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getCurrentArtifact(): Promise<MlArtifact | null>;
  upsertCurrentArtifact(artifact: MlArtifact): Promise<MlArtifact>;

  listRuns(): Promise<Run[]>;
  createRun(input: CreateRunRequest): Promise<Run>;
  getRun(id: string): Promise<Run | null>;
}

export class DatabaseStorage implements IStorage {
  async getCurrentArtifact(): Promise<MlArtifact | null> {
    const [row] = await db.select().from(mlArtifacts).limit(1);
    return row ?? null;
  }

  async upsertCurrentArtifact(artifact: MlArtifact): Promise<MlArtifact> {
    const [row] = await db
      .insert(mlArtifacts)
      .values(artifact)
      .onConflictDoUpdate({
        target: mlArtifacts.id,
        set: {
          modelName: artifact.modelName,
          modelVersion: artifact.modelVersion,
          trainedOnDataset: artifact.trainedOnDataset,
          trainedOnSubset: artifact.trainedOnSubset,
          featureListJson: artifact.featureListJson,
          notes: artifact.notes,
        },
      })
      .returning();

    return row;
  }

  async listRuns(): Promise<Run[]> {
    return await db.select().from(runs).orderBy(desc(runs.startedAtIso));
  }

  async createRun(input: CreateRunRequest): Promise<Run> {
    const [row] = await db.insert(runs).values(input).returning();
    return row;
  }

  async getRun(id: string): Promise<Run | null> {
    const [row] = await db.select().from(runs).where(eq(runs.id, id)).limit(1);
    return row ?? null;
  }
}

export const storage = new DatabaseStorage();
