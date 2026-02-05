import React, { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, DatabaseZap, Sparkles } from "lucide-react";

import { NeonShell } from "@/components/NeonShell";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard, CardTitle } from "@/components/GlassCard";
import { useCreateRun } from "@/hooks/use-runs";
import { insertRunSchema, type CreateRunRequest } from "@shared/schema";
import { z } from "zod";

const formSchema = insertRunSchema.extend({
  // ensure all are strings (table is text)
  engineId: z.string().min(1, "Engine ID is required"),
  dataset: z.string().min(1, "Dataset is required"),
  subset: z.string().min(1, "Subset is required"),
  totalCycles: z.string().min(1, "Total cycles is required"),
  startedAtIso: z.string().min(1, "Start time is required"),
});

type FormState = CreateRunRequest;

function nowIso() {
  return new Date().toISOString();
}

export default function RunCreate() {
  const [, navigate] = useLocation();
  const create = useCreateRun();

  const [form, setForm] = useState<FormState>({
    engineId: "E-1001",
    dataset: "NASA C-MAPSS",
    subset: "FD001",
    totalCycles: "300",
    startedAtIso: nowIso(),
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validation = useMemo(() => {
    const r = formSchema.safeParse(form);
    return r;
  }, [form]);

  const errors = useMemo(() => {
    if (validation.success) return {};
    const map: Record<string, string> = {};
    for (const e of validation.error.errors) {
      map[e.path.join(".")] = e.message;
    }
    return map;
  }, [validation]);

  const canSubmit = validation.success && !create.isPending;

  return (
    <NeonShell>
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/3 px-3 py-1 text-xs text-muted-foreground">
                <DatabaseZap className="h-3.5 w-3.5 text-primary" />
                Initialize simulation run
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl text-glow">Create Run</h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Define dataset + engine context. After creation, jump into the neon console to play the lifecycle.
              </p>
            </div>

            <Link
              href="/runs"
              data-testid="back-to-runs"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold
                bg-white/3 border border-border/70 hover:bg-white/6 hover:border-primary/30
                transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              Back
            </Link>
          </div>

          <div className="mt-8">
            <GlassCard data-testid="create-run-card" glow="accent">
              <CardTitle
                eyebrow="Parameters"
                title="Run configuration"
                right={
                  <div className="text-xs text-muted-foreground">
                    Required fields • validated locally
                  </div>
                }
              />

              <form
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setTouched({
                    engineId: true,
                    dataset: true,
                    subset: true,
                    totalCycles: true,
                    startedAtIso: true,
                  });

                  if (!validation.success) return;

                  create.mutate(form, {
                    onSuccess: (created) => {
                      navigate(`/?engineId=${encodeURIComponent(created.engineId)}`);
                    },
                  });
                }}
              >
                <Field
                  label="Engine ID"
                  value={form.engineId}
                  error={touched.engineId ? errors.engineId : undefined}
                  onChange={(v) => setForm((p) => ({ ...p, engineId: v }))}
                  onBlur={() => setTouched((p) => ({ ...p, engineId: true }))}
                  testId="field-engineId"
                  placeholder="E-1001"
                />
                <Field
                  label="Dataset"
                  value={form.dataset}
                  error={touched.dataset ? errors.dataset : undefined}
                  onChange={(v) => setForm((p) => ({ ...p, dataset: v }))}
                  onBlur={() => setTouched((p) => ({ ...p, dataset: true }))}
                  testId="field-dataset"
                  placeholder="NASA C-MAPSS"
                />
                <Field
                  label="Subset"
                  value={form.subset}
                  error={touched.subset ? errors.subset : undefined}
                  onChange={(v) => setForm((p) => ({ ...p, subset: v }))}
                  onBlur={() => setTouched((p) => ({ ...p, subset: true }))}
                  testId="field-subset"
                  placeholder="FD001"
                />
                <Field
                  label="Total cycles"
                  value={form.totalCycles}
                  error={touched.totalCycles ? errors.totalCycles : undefined}
                  onChange={(v) => setForm((p) => ({ ...p, totalCycles: v }))}
                  onBlur={() => setTouched((p) => ({ ...p, totalCycles: true }))}
                  testId="field-totalCycles"
                  placeholder="300"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Started at (ISO)"
                    value={form.startedAtIso}
                    error={touched.startedAtIso ? errors.startedAtIso : undefined}
                    onChange={(v) => setForm((p) => ({ ...p, startedAtIso: v }))}
                    onBlur={() => setTouched((p) => ({ ...p, startedAtIso: true }))}
                    testId="field-startedAtIso"
                    placeholder={nowIso()}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="set-started-now"
                      onClick={() => setForm((p) => ({ ...p, startedAtIso: nowIso() }))}
                      className="rounded-xl border border-border/70 bg-white/3 px-3 py-2 text-xs font-semibold text-foreground/85 hover:bg-white/6 hover:border-primary/30 transition-all"
                    >
                      Set to now
                    </button>
                    <button
                      type="button"
                      data-testid="preset-fd002"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          dataset: "NASA C-MAPSS",
                          subset: "FD002",
                          totalCycles: "350",
                        }))
                      }
                      className="rounded-xl border border-border/70 bg-white/3 px-3 py-2 text-xs font-semibold text-foreground/85 hover:bg-white/6 hover:border-accent/30 transition-all"
                    >
                      Preset: FD002
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2 mt-2 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="text-sm text-muted-foreground">
                    {create.error ? (
                      <span data-testid="create-run-error" className="text-red-200">
                        {String((create.error as Error).message)}
                      </span>
                    ) : (
                      <span data-testid="create-run-hint">
                        After create, you’ll be redirected to the console.
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    data-testid="create-run-submit"
                    disabled={!canSubmit}
                    className="
                      inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold
                      bg-gradient-to-r from-primary to-accent/90 text-primary-foreground
                      shadow-[0_24px_120px_-80px_rgba(0,245,255,.75)]
                      hover:shadow-[0_30px_140px_-90px_rgba(255,0,214,.55)]
                      hover:-translate-y-0.5 active:translate-y-0
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                      transition-all duration-200 ease-out
                    "
                  >
                    <Sparkles className="h-4 w-4" />
                    {create.isPending ? "Creating…" : "Create Run"}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </motion.div>
      </main>
    </NeonShell>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  testId: string;
}) {
  return (
    <label className="block" data-testid={testId}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`
          mt-2 w-full px-4 py-3 rounded-2xl
          bg-black/20 border-2
          text-foreground placeholder:text-muted-foreground/70
          focus:outline-none focus:ring-4 focus:ring-primary/15
          transition-all duration-200
          ${error ? "border-red-400/50 focus:border-red-400" : "border-border/70 focus:border-primary"}
        `}
      />
      {error ? <div className="mt-1 text-xs text-red-200">{error}</div> : null}
    </label>
  );
}
