import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

type EngineState = {
  currentCycle: number;
};

const engineStates = new Map<string, EngineState>();

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function riskToStatus(risk: number): "Healthy" | "Warning" | "Critical" {
  if (risk < 35) return "Healthy";
  if (risk < 70) return "Warning";
  return "Critical";
}

function maintenanceRecommendation(status: "Healthy" | "Warning" | "Critical"): string {
  if (status === "Healthy") {
    return "No immediate action. Continue monitoring and schedule routine inspection.";
  }
  if (status === "Warning") {
    return "Inspect within the next maintenance window. Check top contributing subsystems and trending sensors.";
  }
  return "Immediate attention recommended. Prepare maintenance action and consider taking the asset out of service.";
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededChoice<T>(rand: () => number, items: T[]): T {
  const idx = Math.floor(rand() * items.length);
  return items[Math.max(0, Math.min(items.length - 1, idx))];
}

function gaussianNoise(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function simulateEngineSeries(engineId: string) {
  const numericId = Array.from(engineId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = mulberry32(1337 + numericId);

  const totalCycles = 220 + Math.floor(rand() * 90);

  const rawSensors = Array.from({ length: 21 }, (_, i) => `s${i + 1}`);

  const series = [] as Array<{ cycle: number; values: Record<string, number> }>;

  const driftBase = 0.002 + rand() * 0.006;
  const wearStart = Math.floor(totalCycles * (0.35 + rand() * 0.15));

  const baseLevels: Record<string, number> = {};
  for (const s of rawSensors) {
    baseLevels[s] = 0.8 + rand() * 0.4;
  }

  const degradingSensors = new Set<string>();
  for (let i = 0; i < 6; i++) {
    degradingSensors.add(seededChoice(rand, rawSensors));
  }

  for (let c = 1; c <= totalCycles; c++) {
    const t = c / totalCycles;
    const wear = c < wearStart ? 0 : Math.pow((c - wearStart) / Math.max(1, totalCycles - wearStart), 1.6);

    const values: Record<string, number> = {};

    for (const s of rawSensors) {
      const base = baseLevels[s];
      const noise = 0.02 * gaussianNoise(rand);
      const seasonal = 0.015 * Math.sin(2 * Math.PI * t * (1.0 + rand() * 0.3));
      const drift = driftBase * c * (degradingSensors.has(s) ? (0.7 + rand() * 0.8) : (0.2 + rand() * 0.2));
      const wearEffect = degradingSensors.has(s) ? (0.55 * wear) : (0.18 * wear);

      const direction = s.endsWith("1") || s.endsWith("4") || s.endsWith("7") ? 1 : -1;
      const v = base + seasonal + noise + direction * (0.15 * drift / totalCycles + wearEffect);

      values[s] = Number.isFinite(v) ? v : base;
    }

    series.push({ cycle: c, values });
  }

  return { engineId, totalCycles, featureNames: rawSensors, series };
}

const engineCache = new Map<string, ReturnType<typeof simulateEngineSeries>>();

function getEngine(engineId: string) {
  const existing = engineCache.get(engineId);
  if (existing) return existing;
  const sim = simulateEngineSeries(engineId);
  engineCache.set(engineId, sim);
  return sim;
}

function computeRisk(engineId: string, cycle: number): number {
  const eng = getEngine(engineId);
  const c = clamp(cycle, 1, eng.totalCycles);
  const t = c / eng.totalCycles;

  const stateSeed = Array.from(engineId).reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
  const rand = mulberry32(stateSeed);

  const base = 8 + 6 * Math.sin(2 * Math.PI * t);
  const growth = 100 * Math.pow(t, 2.4);
  const wiggle = 2.5 * gaussianNoise(rand);

  const risk = clamp(base + growth + wiggle, 0, 100);
  return risk;
}

function computeTopFactors(engineId: string, cycle: number, topK: number) {
  const eng = getEngine(engineId);
  const point = eng.series[clamp(cycle, 1, eng.totalCycles) - 1];

  const statusRisk = computeRisk(engineId, cycle);

  const randSeed = Array.from(engineId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + cycle * 97;
  const rand = mulberry32(randSeed);

  const features = eng.featureNames;
  const contributions = features.map((f) => {
    const v = point.values[f] ?? 0;
    const sign = rand() > 0.5 ? 1 : -1;
    const mag = (0.2 + rand() * 1.2) * (statusRisk / 100);
    return {
      feature: f,
      contribution: sign * mag,
      value: v,
      abs: Math.abs(sign * mag),
    };
  });

  contributions.sort((a, b) => b.abs - a.abs);
  return contributions.slice(0, topK).map(({ abs: _abs, ...rest }) => rest);
}

async function seedDatabase() {
  const artifact = await storage.getCurrentArtifact();
  if (!artifact) {
    await storage.upsertCurrentArtifact({
      id: "current",
      modelName: "Isolation Forest (unsupervised)",
      modelVersion: "v1.0",
      trainedOnDataset: "NASA C-MAPSS",
      trainedOnSubset: "FD001",
      featureListJson: JSON.stringify(Array.from({ length: 21 }, (_, i) => `s${i + 1}`)),
      notes:
        "This project UI/API is wired for FD001. Add the training pipeline to replace the simulator with real model scoring + SHAP explanations.",
    });
  }

  const existingRuns = await storage.listRuns();
  if (existingRuns.length === 0) {
    const now = new Date().toISOString();
    await storage.createRun({
      engineId: "engine-001",
      dataset: "NASA C-MAPSS",
      subset: "FD001",
      totalCycles: "260",
      startedAtIso: now,
    });

    await storage.createRun({
      engineId: "engine-037",
      dataset: "NASA C-MAPSS",
      subset: "FD001",
      totalCycles: "245",
      startedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    });

    await storage.createRun({
      engineId: "engine-089",
      dataset: "NASA C-MAPSS",
      subset: "FD001",
      totalCycles: "232",
      startedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  await seedDatabase();

  app.get(api.artifacts.current.path, async (_req, res) => {
    const artifact = await storage.getCurrentArtifact();
    res.json(artifact);
  });

  app.get(api.runs.list.path, async (_req, res) => {
    const rows = await storage.listRuns();
    res.json(rows);
  });

  app.post(api.runs.create.path, async (req, res) => {
    try {
      const input = api.runs.create.input.parse(req.body);
      const row = await storage.createRun(input);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid request",
          field: err.errors[0]?.path?.join(".") ?? undefined,
        });
      }
      throw err;
    }
  });

  app.get(api.engine.series.path, async (req, res) => {
    const engineId = String(req.params.engineId);
    const eng = getEngine(engineId);
    res.json(eng);
  });

  app.get(api.engine.risk.path, async (req, res) => {
    const engineId = String(req.params.engineId);
    const eng = getEngine(engineId);

    const parsed = api.engine.risk.input?.safeParse(req.query);
    if (parsed && !parsed.success) {
      return res.status(400).json({ message: "Invalid query" });
    }

    const requestedCycle = parsed?.success ? parsed.data?.cycle : undefined;

    const state = engineStates.get(engineId) ?? { currentCycle: 1 };
    let cycle = requestedCycle ?? state.currentCycle;
    cycle = clamp(cycle, 1, eng.totalCycles);

    if (requestedCycle === undefined) {
      if (state.currentCycle < eng.totalCycles) {
        state.currentCycle += 1;
      }
      engineStates.set(engineId, state);
    }

    const risk = computeRisk(engineId, cycle);
    const status = riskToStatus(risk);

    res.json({
      cycle,
      risk,
      status,
      lifecycleProgress: clamp(cycle / eng.totalCycles, 0, 1),
      maintenance: maintenanceRecommendation(status),
    });
  });

  app.get(api.engine.explain.path, async (req, res) => {
    const engineId = String(req.params.engineId);
    const eng = getEngine(engineId);

    const parsed = api.engine.explain.input?.safeParse(req.query);
    if (parsed && !parsed.success) {
      return res.status(400).json({ message: "Invalid query" });
    }

    const cycle = clamp(parsed?.success ? parsed.data?.cycle ?? 1 : 1, 1, eng.totalCycles);
    const topK = clamp(parsed?.success ? parsed.data?.topK ?? 8 : 8, 1, 12);

    const risk = computeRisk(engineId, cycle);
    const topFactors = computeTopFactors(engineId, cycle, topK);

    res.json({
      cycle,
      risk,
      topFactors,
    });
  });

  app.post(api.engine.restart.path, async (req, res) => {
    const engineId = String(req.params.engineId);
    if (!engineCache.has(engineId)) {
      getEngine(engineId);
    }
    engineStates.set(engineId, { currentCycle: 1 });
    res.json({ ok: true });
  });

  return httpServer;
}
