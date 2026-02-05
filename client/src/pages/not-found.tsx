import React from "react";
import { Link } from "wouter";
import { Ghost, MoveLeft } from "lucide-react";
import { NeonShell } from "@/components/NeonShell";
import { AppHeader } from "@/components/AppHeader";

export default function NotFound() {
  return (
    <NeonShell>
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-border/70 neon-outline">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl glass grid place-items-center">
              <Ghost className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-4xl sm:text-5xl text-glow">404</h1>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                This node doesn’t exist in the simulation graph. Route not found.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  data-testid="notfound-home"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                    bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18
                    border border-border/70 hover:border-primary/40 hover:bg-white/5
                    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MoveLeft className="h-4 w-4 text-primary" />
                  Return to Console
                </Link>
                <Link
                  href="/runs"
                  data-testid="notfound-runs"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                    bg-white/3 border border-border/70 hover:bg-white/6 hover:border-accent/30
                    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Browse Runs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </NeonShell>
  );
}
