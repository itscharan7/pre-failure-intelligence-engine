import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
  "data-testid": testId,
}: {
  status: "Healthy" | "Warning" | "Critical" | string;
  className?: string;
  "data-testid"?: string;
}) {
  const styles =
    status === "Healthy"
      ? "bg-emerald-400/10 text-emerald-200 border-emerald-400/25 shadow-[0_0_0_1px_rgba(52,211,153,.14),0_18px_60px_-35px_rgba(52,211,153,.55)]"
      : status === "Warning"
        ? "bg-amber-400/10 text-amber-200 border-amber-400/25 shadow-[0_0_0_1px_rgba(251,191,36,.14),0_18px_60px_-35px_rgba(251,191,36,.55)]"
        : "bg-red-400/10 text-red-200 border-red-400/25 shadow-[0_0_0_1px_rgba(248,113,113,.14),0_18px_60px_-35px_rgba(248,113,113,.55)]";

  return (
    <div
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        styles,
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "Healthy" ? "bg-emerald-300" : status === "Warning" ? "bg-amber-300" : "bg-red-300",
        )}
      />
      {status}
    </div>
  );
}
