import React from "react";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";

export function FeatureChips({
  features,
  selected,
  onToggle,
  onSelectOnly,
  maxSelected = 5,
  className,
  "data-testid": testId,
}: {
  features: string[];
  selected: string[];
  onToggle: (feature: string) => void;
  onSelectOnly: (feature: string) => void;
  maxSelected?: number;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div data-testid={testId} className={cn("flex flex-wrap gap-2", className)}>
      {features.map((f) => {
        const isOn = selected.includes(f);
        const disabled = !isOn && selected.length >= maxSelected;
        return (
          <div key={f} className="flex items-center gap-2">
            <button
              type="button"
              data-testid={`feature-chip-${f}`}
              onClick={() => onToggle(f)}
              disabled={disabled}
              className={cn(
                "group relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                "transition-all duration-200 ease-out",
                "hover:-translate-y-0.5 active:translate-y-0",
                disabled && "opacity-50 cursor-not-allowed hover:translate-y-0",
                isOn
                  ? "bg-primary/12 text-primary border-primary/25 shadow-[0_0_0_1px_rgba(0,245,255,.14),0_20px_80px_-60px_rgba(0,245,255,.55)]"
                  : "bg-white/3 text-foreground/80 border-border/70 hover:border-primary/30 hover:bg-white/5",
              )}
            >
              {isOn ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 opacity-80" />}
              <span className="max-w-[14ch] truncate">{f}</span>
              {!isOn && disabled ? (
                <span className="ml-1 text-[10px] text-muted-foreground">(max)</span>
              ) : null}
            </button>

            <button
              type="button"
              data-testid={`feature-only-${f}`}
              onClick={() => onSelectOnly(f)}
              className={cn(
                "hidden sm:inline-flex items-center justify-center rounded-full border border-border/70",
                "h-8 w-8 bg-white/2 hover:bg-white/5 transition-all duration-200",
                "hover:border-accent/35 hover:-translate-y-0.5 active:translate-y-0",
              )}
              title="Solo"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
