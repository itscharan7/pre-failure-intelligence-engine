import React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  glow = "primary",
  "data-testid": testId,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: "primary" | "accent" | "none";
  "data-testid"?: string;
}) {
  return (
    <section
      data-testid={testId}
      className={cn(
        "glass rounded-3xl p-5 sm:p-6 scanline",
        "transition-all duration-300 ease-out",
        "hover:translate-y-[-2px] hover:shadow-neon",
        glow === "accent" && "hover:shadow-neon-accent",
        glow === "none" && "hover:shadow-none hover:translate-y-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  eyebrow,
  title,
  icon,
  right,
  className,
  "data-testid": testId,
}: {
  eyebrow?: string;
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)} data-testid={testId}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="text-xs text-muted-foreground tracking-wide uppercase">{eyebrow}</div>
        ) : null}
        <div className="mt-1 flex items-center gap-2">
          {icon}
          <h2 className="text-xl sm:text-2xl text-glow leading-tight">{title}</h2>
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
