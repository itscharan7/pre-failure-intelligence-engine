import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function riskColor(risk: number) {
  if (risk < 40) return "from-emerald-300 to-primary";
  if (risk < 70) return "from-amber-300 to-primary";
  return "from-red-300 to-accent";
}

export function RiskGauge({
  risk,
  statusLabel,
  className,
  "data-testid": testId,
}: {
  risk: number;
  statusLabel?: string;
  className?: string;
  "data-testid"?: string;
}) {
  const value = clamp(risk, 0, 100);
  const dash = useMemo(() => {
    const radius = 78;
    const c = 2 * Math.PI * radius;
    const pct = value / 100;
    return { c, o: c * (1 - pct) };
  }, [value]);

  return (
    <div
      data-testid={testId}
      className={cn("relative grid place-items-center rounded-3xl glass-strong p-5 neon-outline", className)}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative grid place-items-center">
        <svg width="220" height="220" viewBox="0 0 220 220" className="block">
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(142 76% 50%)" stopOpacity="0.9" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 18 -7"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="110" cy="110" r="92" fill="none" stroke="hsl(var(--border) / 0.7)" strokeWidth="18" />
          <circle
            cx="110"
            cy="110"
            r="92"
            fill="none"
            stroke="hsl(var(--foreground) / 0.06)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <motion.circle
            cx="110"
            cy="110"
            r="78"
            fill="none"
            stroke="url(#riskGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={dash.c}
            initial={{ strokeDashoffset: dash.c }}
            animate={{ strokeDashoffset: dash.o }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            filter="url(#softGlow)"
            transform="rotate(-90 110 110)"
          />
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div className="text-xs text-muted-foreground tracking-wide uppercase">Failure Risk</div>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "mt-2 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r",
              riskColor(value),
            )}
            data-testid="risk-gauge-value"
          >
            {Math.round(value)}
          </motion.div>
          <div className="mt-2 text-sm text-muted-foreground" data-testid="risk-gauge-statusLabel">
            {statusLabel ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
