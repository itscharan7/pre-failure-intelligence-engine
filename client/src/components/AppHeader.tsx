import { Link, useLocation } from "wouter";
import { Activity, Cpu, Gauge, Layers, Orbit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Console", icon: Gauge },
  { href: "/runs", label: "Runs", icon: Layers },
  { href: "/model", label: "Artifact", icon: Cpu },
  { href: "/about", label: "About", icon: Orbit },
];

export function AppHeader() {
  const [loc] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white/5 transition-colors"
            data-testid="nav-brand"
          >
            <div className="relative grid place-items-center h-10 w-10 rounded-2xl glass neon-outline">
              <Activity className="h-5 w-5 text-primary" />
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-muted-foreground">Pre‑Failure</div>
              <div className="text-lg text-glow tracking-tight">Intelligence System</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-2xl glass px-2 py-2 border border-border/60">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = loc === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    "hover:bg-white/6 hover:text-foreground",
                    active
                      ? "bg-white/8 text-foreground shadow-neon"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                  {active && (
                    <span className="pointer-events-none absolute inset-x-2 -bottom-[7px] h-[2px] rounded-full bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/runs/new"
              data-testid="nav-new-run"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                "bg-gradient-to-r from-primary/20 via-primary/15 to-accent/20 border border-border/70",
                "hover:border-primary/50 hover:bg-white/5 transition-all",
                "shadow-neon",
              )}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              New Run
            </Link>
          </div>
        </div>

        <div className="md:hidden mt-3 flex flex-wrap gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = loc === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  "glass border border-border/60",
                  active ? "neon-outline text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
