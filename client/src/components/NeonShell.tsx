import React from "react";
import { cn } from "@/lib/utils";

export function NeonShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen neo-grid", className)}>
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-28 right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/15 blur-3xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
