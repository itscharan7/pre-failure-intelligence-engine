import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Gauge, Radar, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

import { NeonShell } from "@/components/NeonShell";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard, CardTitle } from "@/components/GlassCard";

export default function About() {
  return (
    <NeonShell>
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/3 px-3 py-1 text-xs text-muted-foreground">
            <Radar className="h-3.5 w-3.5 text-primary" />
            Product brief • operator-first UX
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl text-glow">About</h1>
          <p className="mt-2 text-muted-foreground max-w-3xl leading-relaxed">
            Pre‑Failure Intelligence System turns raw multivariate telemetry into{" "}
            <span className="text-foreground/90 font-semibold">actionable risk</span> and{" "}
            <span className="text-foreground/90 font-semibold">transparent explanations</span>.
            Built for rapid triage: at-a-glance status, lifecycle progression, and factor-level reasoning.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            <GlassCard data-testid="about-risk" glow="primary">
              <CardTitle
                eyebrow="Signal → Decision"
                title="Risk scoring"
                icon={<Gauge className="h-5 w-5 text-primary" />}
              />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                The neon gauge is a human-friendly representation of a 0–100 risk scale.
                Use cycle scrub + autoplay to inspect how risk evolves across the lifecycle.
              </p>
              <div className="mt-5">
                <Link
                  href="/"
                  data-testid="about-to-console"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold
                    bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18
                    border border-border/70 hover:border-primary/40 hover:bg-white/5
                    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Open Console
                </Link>
              </div>
            </GlassCard>

            <GlassCard data-testid="about-explain" glow="accent">
              <CardTitle
                eyebrow="Trust"
                title="Explainability"
                icon={<BrainCircuit className="h-5 w-5 text-accent" />}
              />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Explanations list top contributing features for the selected cycle with signed contributions.
                Positive values push risk upward; negative values stabilize the system.
              </p>
              <div className="mt-5">
                <Link
                  href="/model"
                  data-testid="about-to-artifact"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold
                    bg-white/3 border border-border/70 hover:bg-white/6 hover:border-accent/30
                    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  View Artifact
                </Link>
              </div>
            </GlassCard>

            <GlassCard data-testid="about-ops" glow="primary">
              <CardTitle
                eyebrow="Operations"
                title="Recommendations"
                icon={<ShieldAlert className="h-5 w-5 text-primary" />}
              />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Maintenance guidance is derived from status + risk thresholds and lifecycle context.
                Integrate with ticketing systems as a next step (not included in this API contract).
              </p>
            </GlassCard>

            <GlassCard data-testid="about-runs" glow="accent">
              <CardTitle
                eyebrow="Reproducibility"
                title="Runs"
                icon={<Radar className="h-5 w-5 text-accent" />}
              />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Runs track dataset/subset + engine initialization. Create a new run to bootstrap fresh simulations
                and jump directly into monitoring.
              </p>
              <div className="mt-5">
                <Link
                  href="/runs"
                  data-testid="about-to-runs"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold
                    bg-gradient-to-r from-primary/18 via-primary/12 to-accent/18
                    border border-border/70 hover:border-primary/40 hover:bg-white/5
                    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Browse Runs
                </Link>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </main>
    </NeonShell>
  );
}
