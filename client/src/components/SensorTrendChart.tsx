import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

type SeriesPoint = { cycle: number; values: Record<string, number> };

function pickNeon(index: number) {
  const palette = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  return palette[index % palette.length];
}

export function SensorTrendChart({
  series,
  featureNames,
  selectedFeatures,
  height = 320,
  className,
  "data-testid": testId,
}: {
  series: SeriesPoint[];
  featureNames: string[];
  selectedFeatures: string[];
  height?: number;
  className?: string;
  "data-testid"?: string;
}) {
  const data = useMemo(() => {
    return series.map((p) => {
      const row: Record<string, number> = { cycle: p.cycle };
      for (const f of selectedFeatures) row[f] = p.values?.[f] ?? 0;
      return row;
    });
  }, [series, selectedFeatures]);

  return (
    <div data-testid={testId} className={cn("rounded-2xl border border-border/60 bg-black/10 p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-sm text-muted-foreground">
          Multivariate sensor telemetry <span className="text-foreground/80">({selectedFeatures.length} channels)</span>
        </div>
        <div className="hidden sm:block text-xs text-muted-foreground">
          X: cycle • Y: normalized readings
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="gridGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.14)" />
                <stop offset="100%" stopColor="hsl(var(--accent) / 0.10)" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="hsl(var(--foreground) / 0.08)" strokeDasharray="4 10" />
            <XAxis
              dataKey="cycle"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border) / 0.7)" }}
              tickLine={{ stroke: "hsl(var(--border) / 0.7)" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border) / 0.7)" }}
              tickLine={{ stroke: "hsl(var(--border) / 0.7)" }}
              width={42}
            />

            <Tooltip
              contentStyle={{
                background: "linear-gradient(180deg, rgba(16, 20, 40, 0.88), rgba(10, 12, 24, 0.70))",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                boxShadow: "0 30px 120px -70px rgba(0, 245, 255, 0.55)",
                color: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.8)" }}
            />

            <Legend
              wrapperStyle={{ color: "rgba(255,255,255,0.72)", fontSize: 12, paddingTop: 8 }}
            />

            {selectedFeatures.map((f, idx) => (
              <Line
                key={f}
                type="monotone"
                dataKey={f}
                stroke={pickNeon(idx)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Tip: reduce channels for clarity. Available:{" "}
        <span className="text-foreground/70">{featureNames.slice(0, 6).join(", ")}{featureNames.length > 6 ? "…" : ""}</span>
      </div>
    </div>
  );
}
