import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Cpu, Pause, Play, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";

import { NeonShell } from "@/components/NeonShell";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard, CardTitle } from "@/components/GlassCard";
import { RiskGauge } from "@/components/RiskGauge";
import { StatusPill } from "@/components/StatusPill";
import { SensorTrendChart } from "@/components/SensorTrendChart";
import { FeatureChips } from "@/components/FeatureChips";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";
import { MaintenanceRecommendation } from "@/components/MaintenanceRecommendation";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import { useCurrentArtifact } from "@/hooks/use-artifacts";
import { useEngineExplain, useEngineRisk, useEngineSeries, useRestartEngine } from "@/hooks/use-engine";

const AUTOPLAY_MS = 900;

function safeTopFeatures(artifactFeatureListJson?: string): string[] {
  if (!artifactFeatureListJson) return [];
  try {
    const raw = JSON.parse(artifactFeatureListJson);
    if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Dashboard() {
  const [engineId, setEngineId] = useState<string>("E-1001");
  const [cycle, setCycle] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [topK, setTopK] = useState<number>(8);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const { data: artifact, isLoading: artifactLoading, error: artifactError } = useCurrentArtifact();
  const { data: series, isLoading: seriesLoading, error: seriesError } = useEngineSeries(engineId);
  const { data: risk, isLoading: riskLoading, error: riskError } = useEngineRisk(engineId, cycle);
  const { data: explain, isLoading: explainLoading, error: explainError } = useEngineExplain(engineId, cycle, topK);
  const restart = useRestartEngine(engineId);

  const totalCycles = series?.totalCycles ?? 300;

  const knownFeatures = useMemo(() => {
    const fromSeries = series?.featureNames ?? [];
    const fromArtifact = safeTopFeatures(artifact?.featureListJson);
    const merged = Array.from(new Set([...fromSeries, ...fromArtifact]));
    return merged;
  }, [series?.featureNames, artifact?.featureListJson]);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  useEffect(() => {
    if (selectedFeatures.length === 0 && knownFeatures.length) {
      setSelectedFeatures(knownFeatures.slice(0, 4));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownFeatures.join("|")]);

  // Autoplay
  const playingRef = useRef(isPlaying);
  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const t = window.setInterval(() => {
      setCycle((c) => {
        const next = c + 1;
        if (next >= totalCycles) {
          // stop at end-of-life
          playingRef.current = false;
          setIsPlaying(false);
          return totalCycles;
        }
        return next;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [isPlaying, totalCycles]);

  useEffect(() => {
    // clamp cycle when engine series changes
    setCycle((c) => clamp(c, 1, totalCycles));
  }, [totalCycles]);

  const status = risk?.status ?? "Healthy";
  const riskVal = risk?.risk ?? 0;

  const pageError = artifactError || seriesError || riskError || explainError;

  return (
    <NeonShell>
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/3 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_22px_rgba(0,245,255,.8)]" />
              Live lifecycle simulation • explainable risk
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl leading-[0.95] text-glow">
              Neon Console
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Monitor multivariate sensor drift, forecast pre-failure risk, and inspect top contributing factors — cycle by cycle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="glass rounded-2xl p-3 border border-border/60">
              <div className="text-xs text-muted-foreground">Engine ID</div>
              <div className="mt-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <input
                  data-testid="engineId-input"
                  value={engineId}
                  onChange={(e) => setEngineId(e.target.value)}
                  className="w-44 bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                  placeholder="E-1001"
                />
              </div>
            </div>

            <button
              type="button"
              data-testid="play-toggle"
              onClick={() => setIsPlaying((p) => !p)}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18
                border border-border/70 hover:border-primary/40 hover:bg-white/5
                transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isPlaying ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              data-testid="restart-button"
              onClick={() => setConfirmRestart(true)}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                bg-white/3 border border-border/70 hover:border-accent/40 hover:bg-white/6
                transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw className={restart.isPending ? "h-4 w-4 text-accent animate-spin" : "h-4 w-4 text-accent"} />
              Restart
            </button>
          </div>
        </motion.div>

        {pageError ? (
          <div
            data-testid="dashboard-error"
            className="mt-8 rounded-3xl border border-destructive/40 bg-destructive/10 p-5 text-destructive-foreground"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-300 mt-0.5" />
              <div>
                <div className="font-semibold">Telemetry link unstable</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {String((pageError as Error).message || pageError)}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Try adjusting the Engine ID or visit{" "}
                  <Link href="/runs" className="text-primary hover:underline" data-testid="dashboard-error-link-runs">
                    Runs
                  </Link>{" "}
                  to create a new simulation run.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          <div className="lg:col-span-4">
            <GlassCard data-testid="risk-card" className="h-full" glow="primary">
              <CardTitle
                eyebrow="Real‑time"
                title="Risk Core"
                right={<StatusPill status={status} data-testid="status-pill" />}
              />

              <div className="mt-5">
                <RiskGauge risk={riskVal} statusLabel={status} data-testid="risk-gauge" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-white/2 p-3">
                  <div className="text-xs text-muted-foreground">Cycle</div>
                  <div data-testid="cycle-readout" className="mt-1 text-lg font-semibold text-foreground/90">
                    {cycle}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white/2 p-3">
                  <div className="text-xs text-muted-foreground">Progress</div>
                  <div data-testid="progress-readout" className="mt-1 text-lg font-semibold text-foreground/90">
                    {risk?.lifecycleProgress != null ? `${Math.round(risk.lifecycleProgress)}%` : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Cycle scrub</span>
                  <span data-testid="cycle-scrub-value">
                    {cycle}/{totalCycles}
                  </span>
                </div>
                <input
                  data-testid="cycle-slider"
                  type="range"
                  min={1}
                  max={totalCycles}
                  value={cycle}
                  onChange={(e) => setCycle(Number(e.target.value))}
                  className="mt-2 w-full accent-[hsl(var(--primary))]"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  Autoplay interval: <span className="text-foreground/70 font-medium">{AUTOPLAY_MS}ms</span>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-8">
            <GlassCard data-testid="telemetry-card" className="h-full" glow="accent">
              <CardTitle
                eyebrow="Sensors"
                title="Live Telemetry"
                icon={<SlidersHorizontal className="h-5 w-5 text-accent" />}
                right={
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block text-xs text-muted-foreground">
                      Select up to <span className="text-foreground/70 font-semibold">5</span>
                    </div>
                    <Link
                      href="/model"
                      data-testid="telemetry-to-artifact"
                      className="rounded-xl border border-border/70 bg-white/3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-white/6 hover:border-primary/30 transition-all"
                    >
                      Model context
                    </Link>
                  </div>
                }
              />

              <div className="mt-4">
                {seriesLoading ? (
                  <div data-testid="series-loading" className="rounded-2xl border border-border/60 bg-white/2 p-6">
                    <div className="h-4 w-44 bg-white/10 rounded animate-pulse" />
                    <div className="mt-4 h-64 bg-white/5 rounded-2xl animate-pulse" />
                  </div>
                ) : series ? (
                  <>
                    <FeatureChips
                      data-testid="feature-chips"
                      features={knownFeatures.slice(0, 18)}
                      selected={selectedFeatures}
                      maxSelected={5}
                      onToggle={(f) => {
                        setSelectedFeatures((prev) => {
                          const isOn = prev.includes(f);
                          if (isOn) return prev.filter((x) => x !== f);
                          if (prev.length >= 5) return prev;
                          return [...prev, f];
                        });
                      }}
                      onSelectOnly={(f) => setSelectedFeatures([f])}
                      className="mb-4"
                    />

                    <SensorTrendChart
                      data-testid="sensor-chart"
                      series={series.series}
                      featureNames={series.featureNames}
                      selectedFeatures={selectedFeatures.length ? selectedFeatures : series.featureNames.slice(0, 4)}
                      height={340}
                    />
                  </>
                ) : (
                  <div data-testid="series-empty" className="rounded-2xl border border-border/60 bg-white/2 p-6">
                    <div className="text-sm font-semibold text-foreground/90">No series data</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Enter a valid engine id or create a run in{" "}
                      <Link href="/runs" className="text-primary hover:underline" data-testid="series-empty-link">
                        Runs
                      </Link>
                      .
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7">
            <GlassCard data-testid="explain-card" className="h-full" glow="primary">
              <CardTitle
                eyebrow="Explainability"
                title="Why this risk?"
                right={
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Top K</div>
                    <select
                      data-testid="topk-select"
                      value={topK}
                      onChange={(e) => setTopK(Number(e.target.value))}
                      className="rounded-xl border border-border/70 bg-white/3 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:ring-4 focus:ring-primary/15"
                    >
                      {[4, 6, 8, 10, 12].map((k) => (
                        <option key={k} value={k} className="bg-black">
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                }
              />

              <div className="mt-4">
                {explainLoading ? (
                  <div data-testid="explain-loading" className="rounded-2xl border border-border/60 bg-white/2 p-6">
                    <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : explain ? (
                  <ExplainabilityPanel data-testid="explain-panel" factors={explain.topFactors} />
                ) : (
                  <div data-testid="explain-empty" className="rounded-2xl border border-border/60 bg-white/2 p-6">
                    <div className="text-sm font-semibold text-foreground/90">No explainability data</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Move the cycle slider or ensure the engine supports explain endpoint.
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5">
            <GlassCard data-testid="maintenance-card" className="h-full" glow="accent">
              <CardTitle eyebrow="Ops" title="Recommendation" />
              <div className="mt-4">
                {(riskLoading || seriesLoading) && !risk ? (
                  <div data-testid="recommend-loading" className="rounded-2xl border border-border/60 bg-white/2 p-6">
                    <div className="h-4 w-52 bg-white/10 rounded animate-pulse" />
                    <div className="mt-4 h-40 bg-white/5 rounded-2xl animate-pulse" />
                  </div>
                ) : risk ? (
                  <MaintenanceRecommendation
                    data-testid="maintenance-recommendation"
                    status={risk.status}
                    risk={risk.risk}
                    cycle={risk.cycle}
                    totalCycles={totalCycles}
                  />
                ) : (
                  <div data-testid="recommend-empty" className="rounded-2xl border border-border/60 bg-white/2 p-6">
                    <div className="text-sm font-semibold text-foreground/90">Awaiting risk telemetry</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Start autoplay or select a cycle to compute the failure risk.
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-border/60 bg-white/2 p-4">
                <div className="text-xs text-muted-foreground">Model metadata</div>
                {artifactLoading ? (
                  <div className="mt-2 h-4 w-56 bg-white/10 rounded animate-pulse" />
                ) : artifact ? (
                  <div className="mt-2 text-sm text-foreground/85">
                    <div data-testid="artifact-modelName">
                      <span className="text-muted-foreground">Model:</span>{" "}
                      <span className="font-semibold">{artifact.modelName}</span>
                    </div>
                    <div className="mt-1" data-testid="artifact-modelVersion">
                      <span className="text-muted-foreground">Version:</span>{" "}
                      <span className="font-semibold">{artifact.modelVersion}</span>
                    </div>
                  </div>
                ) : (
                  <div data-testid="artifact-none" className="mt-2 text-sm text-muted-foreground">
                    No deployed artifact registered.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmRestart}
        onOpenChange={setConfirmRestart}
        title="Restart simulation?"
        description="This will request the engine to restart its lifecycle. Your current cycle position will reset to 1."
        confirmText={restart.isPending ? "Restarting..." : "Restart"}
        cancelText="Cancel"
        onConfirm={() => {
          restart.mutate(undefined, {
            onSuccess: () => {
              setCycle(1);
              setIsPlaying(true);
              setConfirmRestart(false);
            },
            onError: () => {
              setConfirmRestart(false);
            },
          });
        }}
        destructive={false}
        data-testid="confirm-restart"
      />
    </NeonShell>
  );
}
