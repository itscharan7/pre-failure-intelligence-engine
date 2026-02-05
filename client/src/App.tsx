import React, { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import RunsList from "@/pages/RunsList";
import RunCreate from "@/pages/RunCreate";
import ModelArtifact from "@/pages/ModelArtifact";
import About from "@/pages/About";
import { useToast } from "@/hooks/use-toast";

function DashboardRouteWrapper() {
  const [loc] = useLocation();
  const params = new URLSearchParams(loc.split("?")[1] ?? "");
  const engineId = params.get("engineId");

  // Dashboard manages its own state; as a small enhancement, we can redirect to clean URL
  // while preserving engineId (optional). For now: no-op.
  return <Dashboard key={engineId ?? "default"} />;
}

function ToastBridge() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ title?: string; description?: string }>;
      toast({
        title: ce.detail?.title ?? "Notice",
        description: ce.detail?.description ?? "",
      });
    };
    window.addEventListener("toast", handler as EventListener);
    return () => window.removeEventListener("toast", handler as EventListener);
  }, [toast]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardRouteWrapper} />
      <Route path="/runs" component={RunsList} />
      <Route path="/runs/new" component={RunCreate} />
      <Route path="/model" component={ModelArtifact} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ToastBridge />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
