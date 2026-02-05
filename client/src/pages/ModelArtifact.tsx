import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Braces, Cpu, FileJson2, Sparkles } from "lucide-react";

import { NeonShell } from "@/components/NeonShell";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard, CardTitle } from "@/components/GlassCard";
import { useCurrentArtifact } from "@/hooks/use-artifacts";

function safeParseFeatureList(json?: string): string[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

export default function ModelArtifact() {
  const { data, isLoading, error } = useCurrentArtifact();
  const [showRaw, setShowRaw] = useState(false);

  const features = useMemo(() => safeParseFeatureList(data?.featureListJson), [data?.featureListJson]);

  return (
    <NeonShell>
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/3 px-3 py-1 text-xs text-muted-foreground">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            Deployed model metadata
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl text-glow">Artifact</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            The currently deployed ML artifact powering risk scoring and explainability.
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            <div className="lg:col-span-5">
              <GlassCard data-testid="artifact-summary" glow="primary">
                <CardTitle eyebrow="Model" title="Deployment snapshot" icon={<Sparkles className="h-5 w-5 text-primary" />} />

                {error ? (
                  <div data-testid="artifact-error" className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
                    <div className="text-sm font-semibold text-foreground/90">Unable to load artifact</div>
                    <div className="mt-1 text-sm text-muted-foreground">{String((error as Error).message)}</div>
                  </div>
                ) : isLoading ? (
                  <div data-testid="artifact-loading" className="mt-5 space-y-3">
                    <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                  </div>
                ) : data ? (
                  <div className="mt-5 space-y-3">
                    <KV label="Name" value={data.modelName} testId="artifact-modelName" />
                    <KV label="Version" value={data.modelVersion} testId="artifact-modelVersion" />
                    <KV label="Dataset" value={data.trainedOnDataset} testId="artifact-trainedOnDataset" />
                    <KV label="Subset" value={data.trainedOnSubset} testId="artifact-trainedOnSubset" />
                    <div className="rounded-2xl border border-border/60 bg-white/2 p-4">
                      <div className="text-xs text-muted-foreground">Notes</div>
                      <div data-testid="artifact-notes" className="mt-2 text-sm text-foreground/85 leading-relaxed">
                        {data.notes?.trim() ? data.notes : "—"}
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid="toggle-raw-json"
                      onClick={() => setShowRaw((s) => !s)}
                      className="mt-2 inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold
                        bg-white/3 border border-border/70 hover:bg-white/6 hover:border-accent/30
                        transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <FileJson2 className="h-4 w-4 text-accent" />
                      {showRaw ? "Hide raw JSON" : "Show raw JSON"}
                    </button>

                    {showRaw ? (
                      <pre
                        data-testid="artifact-raw-json"
                        className="mt-3 max-h-[260px] overflow-auto rounded-2xl border border-border/60 bg-black/30 p-4 text-xs text-foreground/80"
                      >
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ) : (
                  <div data-testid="artifact-empty" className="mt-5 rounded-2xl border border-border/60 bg-white/2 p-7">
                    <div className="text-sm font-semibold text-foreground/90">No artifact registered</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      The backend returned <span className="font-semibold">null</span> for current artifact.
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="lg:col-span-7">
              <GlassCard data-testid="artifact-features" glow="accent">
                <CardTitle eyebrow="Signals" title="Feature list" icon={<Braces className="h-5 w-5 text-accent" />} />

                {isLoading ? (
                  <div data-testid="feature-loading" className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-9 rounded-full bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : data && features.length ? (
                  <>
                    <div className="mt-5 text-sm text-muted-foreground">
                      {features.length} features available for explainability and trend visualization.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {features.map((f) => (
                        <div
                          key={f}
                          data-testid={`artifact-feature-${f}`}
                          className="rounded-full border border-border/70 bg-white/3 px-3 py-1.5 text-xs font-semibold text-foreground/85 hover:bg-white/6 hover:border-primary/30 transition-all"
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div data-testid="feature-empty" className="mt-5 rounded-2xl border border-border/60 bg-white/2 p-7">
                    <div className="text-sm font-semibold text-foreground/90">No features found</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      The artifact did not provide a valid <span className="font-semibold">featureListJson</span>.
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </main>
    </NeonShell>
  );
}

function KV({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white/2 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div data-testid={testId} className="mt-2 text-sm font-semibold text-foreground/90">
        {value}
      </div>
    </div>
  );
}
