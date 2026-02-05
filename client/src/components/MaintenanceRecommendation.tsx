import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Siren, Wrench, ArrowRight } from "lucide-react";

export function MaintenanceRecommendation({
  status,
  risk,
  cycle,
  totalCycles,
  className,
  "data-testid": testId,
}: {
  status: "Healthy" | "Warning" | "Critical";
  risk: number;
  cycle: number;
  totalCycles: number;
  className?: string;
  "data-testid"?: string;
}) {
  const rec = useMemo(() => {
    if (status === "Critical" || risk >= 80) {
      return {
        icon: <Siren className="h-5 w-5 text-red-300" />,
        title: "Immediate intervention recommended",
        body:
          "Risk is elevated. Halt non-essential load and schedule maintenance window. Inspect high-impact sensors and validate calibration.",
        tone: "border-red-400/25 bg-red-400/10",
        cta: "Create maintenance ticket",
      };
    }
    if (status === "Warning" || risk >= 55) {
      return {
        icon: <Wrench className="h-5 w-5 text-amber-300" />,
        title: "Plan proactive maintenance",
        body:
          "Early signals detected. Reduce stress where possible and review contributing factors. Prepare parts and run diagnostics within the next interval.",
        tone: "border-amber-400/25 bg-amber-400/10",
        cta: "Schedule diagnostics",
      };
    }
    return {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-300" />,
      title: "Operating within healthy range",
      body:
        "Telemetry is stable. Continue monitoring and keep baseline snapshots for drift detection. Consider expanding sensor coverage for explainability.",
      tone: "border-emerald-400/25 bg-emerald-400/10",
      cta: "Save baseline snapshot",
    };
  }, [status, risk]);

  const progress = Math.max(0, Math.min(1, cycle / Math.max(1, totalCycles)));
  const eta = Math.max(0, totalCycles - cycle);

  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-2xl border border-border/60 bg-black/10 p-4 sm:p-5",
        className,
      )}
    >
      <div className={cn("rounded-2xl border p-4", rec.tone)}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{rec.icon}</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground/90">{rec.title}</div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{rec.body}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="text-xs text-muted-foreground">
            Lifecycle:{" "}
            <span className="text-foreground/80 font-medium">
              {cycle}/{totalCycles}
            </span>{" "}
            • Remaining{" "}
            <span className="text-foreground/80 font-medium">{eta}</span>{" "}
            cycles
          </div>

          <button
            type="button"
            data-testid="maintenance-cta"
            onClick={() => {
              // No endpoint specified — still wire interaction meaningfully
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: {
                    title: "Action queued",
                    description: rec.cta,
                  },
                }),
              );
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              "bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18",
              "border border-border/70 hover:border-primary/40 hover:bg-white/5",
              "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
            )}
          >
            {rec.cta}
            <ArrowRight className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid="lifecycle-label">Lifecycle progression</span>
          <span data-testid="lifecycle-percent">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-white/5 overflow-hidden border border-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 via-accent/50 to-emerald-300/50"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
