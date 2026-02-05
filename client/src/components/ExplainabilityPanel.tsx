import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Sigma } from "lucide-react";

type Factor = { feature: string; contribution: number; value: number };

function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toFixed(0);
  if (abs >= 100) return n.toFixed(1);
  return n.toFixed(3);
}

export function ExplainabilityPanel({
  factors,
  className,
  "data-testid": testId,
}: {
  factors: Factor[];
  className?: string;
  "data-testid"?: string;
}) {
  const sorted = useMemo(() => {
    return [...factors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  }, [factors]);

  const maxAbs = useMemo(() => {
    return sorted.reduce((m, f) => Math.max(m, Math.abs(f.contribution)), 0) || 1;
  }, [sorted]);

  return (
    <div data-testid={testId} className={cn("rounded-2xl border border-border/60 bg-black/10 p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sigma className="h-4 w-4 text-accent" />
          <div className="text-sm font-semibold text-foreground/90">Top Factors</div>
          <div className="text-xs text-muted-foreground">signed contributions</div>
        </div>
        <div className="text-xs text-muted-foreground">{sorted.length} signals</div>
      </div>

      <div className="mt-4 space-y-2">
        {sorted.map((f) => {
          const pos = f.contribution >= 0;
          const pct = Math.round((Math.abs(f.contribution) / maxAbs) * 100);
          return (
            <div
              key={f.feature}
              data-testid={`factor-${f.feature}`}
              className={cn(
                "group rounded-xl border border-border/50 bg-white/2 px-3 py-2",
                "hover:bg-white/4 hover:border-border/80 transition-all duration-200",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground/90 truncate">{f.feature}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    value <span className="text-foreground/70 font-medium">{fmt(f.value)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold border",
                      pos
                        ? "text-emerald-200 border-emerald-400/25 bg-emerald-400/10"
                        : "text-red-200 border-red-400/25 bg-red-400/10",
                    )}
                  >
                    {pos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {pos ? "+" : ""}
                    {fmt(f.contribution)}
                  </div>
                </div>
              </div>

              <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300 ease-out",
                    pos
                      ? "bg-gradient-to-r from-emerald-300/70 to-primary/70"
                      : "bg-gradient-to-r from-red-300/70 to-accent/70",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
