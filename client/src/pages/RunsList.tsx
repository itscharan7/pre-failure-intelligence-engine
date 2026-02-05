import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CalendarClock, Database, ExternalLink, Layers, Search } from "lucide-react";

import { NeonShell } from "@/components/NeonShell";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard, CardTitle } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { useRuns } from "@/hooks/use-runs";

function contains(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export default function RunsList() {
  const { data, isLoading, error } = useRuns();
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const runs = data ?? [];
    if (!q.trim()) return runs;
    return runs.filter((r) => {
      return (
        contains(r.engineId, q) ||
        contains(r.dataset, q) ||
        contains(r.subset, q) ||
        contains(r.startedAtIso, q)
      );
    });
  }, [data, q]);

  return (
    <NeonShell>
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/3 px-3 py-1 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Simulation history • reproducible runs
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl text-glow">Runs</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Create and track simulation runs. Jump from a run’s engine into the live console.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="glass rounded-2xl p-3 border border-border/60 w-full sm:w-[340px]">
              <div className="text-xs text-muted-foreground">Search</div>
              <div className="mt-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  data-testid="runs-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="engineId, dataset, subset…"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
              </div>
            </div>

            <Link
              href="/runs/new"
              data-testid="runs-new-link"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18
                border border-border/70 hover:border-primary/40 hover:bg-white/5
                transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Database className="h-4 w-4 text-primary" />
              Create Run
            </Link>
          </div>
        </motion.div>

        <div className="mt-8">
          <GlassCard data-testid="runs-table-card" glow="none">
            <CardTitle
              eyebrow="Inventory"
              title="Run Registry"
              right={
                <div className="text-xs text-muted-foreground">
                  Total:{" "}
                  <span data-testid="runs-count" className="text-foreground/80 font-semibold">
                    {items.length}
                  </span>
                </div>
              }
            />

            {error ? (
              <div data-testid="runs-error" className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
                <div className="text-sm font-semibold text-foreground/90">Failed to load runs</div>
                <div className="mt-1 text-sm text-muted-foreground">{String((error as Error).message)}</div>
              </div>
            ) : isLoading ? (
              <div data-testid="runs-loading" className="mt-5 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl border border-border/60 bg-white/2 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div data-testid="runs-empty" className="mt-5 rounded-2xl border border-border/60 bg-white/2 p-7">
                <div className="text-sm font-semibold text-foreground/90">No runs yet</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Create a run to initialize datasets and start exploring lifecycle telemetry.
                </div>
                <div className="mt-4">
                  <Link
                    href="/runs/new"
                    data-testid="runs-empty-cta"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                      bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18
                      border border-border/70 hover:border-primary/40 hover:bg-white/5
                      transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Database className="h-4 w-4 text-primary" />
                    Create first run
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 overflow-hidden rounded-2xl border border-border/60">
                <div className="grid grid-cols-12 bg-white/2 px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <div className="col-span-4">Engine</div>
                  <div className="col-span-3 hidden sm:block">Dataset</div>
                  <div className="col-span-2 hidden md:block">Subset</div>
                  <div className="col-span-3">Started</div>
                </div>
                <div className="divide-y divide-border/60">
                  {items.map((r) => (
                    <div
                      key={r.id}
                      data-testid={`run-row-${r.id}`}
                      className="grid grid-cols-12 items-center px-4 py-4 bg-black/10 hover:bg-white/3 transition-colors"
                    >
                      <div className="col-span-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <StatusPill status="Healthy" className="hidden sm:inline-flex" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground/90 truncate" data-testid={`run-engine-${r.id}`}>
                              {r.engineId}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{r.totalCycles} cycles</div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 hidden sm:block text-sm text-foreground/80" data-testid={`run-dataset-${r.id}`}>
                        {r.dataset}
                      </div>
                      <div className="col-span-2 hidden md:block text-sm text-foreground/80" data-testid={`run-subset-${r.id}`}>
                        {r.subset}
                      </div>

                      <div className="col-span-5 sm:col-span-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                          <CalendarClock className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate" data-testid={`run-started-${r.id}`}>{r.startedAtIso}</span>
                        </div>
                        <Link
                          href={`/?engineId=${encodeURIComponent(r.engineId)}`}
                          data-testid={`run-open-${r.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-white/3 px-3 py-2 text-xs font-semibold text-foreground/85 hover:bg-white/6 hover:border-primary/30 transition-all"
                        >
                          Open
                          <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </NeonShell>
  );
}
