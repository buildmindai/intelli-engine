import * as React from "react";
import { useLocation } from "wouter";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, FolderKanban } from "lucide-react";

export default function AppIndexPage() {
  const { data, isLoading, error } = useWorkspaces();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !error && (data ?? []).length > 0) {
      setLocation(`/app/workspaces/${data![0].id}/command-center`);
    }
  }, [data, isLoading, error, setLocation]);

  return (
    <AppShell title="Overview">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <GlassCard className="p-6" data-testid="app-index-error">
          <div className="text-sm font-semibold">Could not load workspaces</div>
          <div className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</div>
        </GlassCard>
      ) : (
        <GlassCard className="p-8" data-testid="app-index-empty">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-3xl border border-border/60 bg-card/40">
              <FolderKanban className="h-7 w-7 text-primary" />
            </div>
            <div className="mt-4 text-lg">No workspace selected</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Head to workspaces to create or choose an environment.
            </div>
            <Button
              className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setLocation("/app/workspaces")}
              data-testid="app-index-go-workspaces"
            >
              Go to Workspaces <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      )}
    </AppShell>
  );
}
