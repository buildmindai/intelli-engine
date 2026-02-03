import * as React from "react";
import { useParams } from "wouter";
import { Activity, DatabaseZap, Shapes, MessagesSquare, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";

import { useDataSources } from "@/hooks/use-data-sources";
import { useDatasets } from "@/hooks/use-datasets";
import { useEvents, type EventsSeverity } from "@/hooks/use-events";
import { useAiConversations } from "@/hooks/use-ai";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  testId,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint: string;
  testId: string;
}) {
  return (
    <GlassCard className="p-6" data-testid={testId}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl">{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{hint}</div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border/60 bg-card/40">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </GlassCard>
  );
}

export default function CommandCenterPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const sources = useDataSources(workspaceId);
  const datasets = useDatasets(workspaceId);
  const events = useEvents(workspaceId);
  const convos = useAiConversations(workspaceId);

  const sevCounts = React.useMemo(() => {
    const counts: Record<EventsSeverity | "info" | "low" | "medium" | "high" | "critical", number> =
      { info: 0, low: 0, medium: 0, high: 0, critical: 0 } as any;
    for (const e of events.data ?? []) {
      const s = String(e.severity) as EventsSeverity;
      if (counts[s] != null) counts[s] += 1;
    }
    return counts;
  }, [events.data]);

  const latest = (events.data ?? []).slice(0, 6);

  return (
    <AppShell workspaceId={workspaceId} title="Command Center">
      <PageHeader
        title="Command Center"
        subtitle="Your operational overview: connectors, datasets, telemetry, and AI context."
        data-testid="command-center-header"
        right={
          <Link
            href={`/app/workspaces/${workspaceId}/assistant`}
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card/40 px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-card hover:border-border hover:-translate-y-0.5 active:translate-y-0"
            data-testid="command-center-open-assistant"
          >
            <MessagesSquare className="h-4 w-4 text-primary" />
            Open Assistant <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="command-center-metrics">
        <Metric
          icon={DatabaseZap}
          label="Data Sources"
          value={sources.isLoading ? "…" : (sources.data ?? []).length}
          hint="Registered connectors"
          testId="metric-sources"
        />
        <Metric
          icon={Shapes}
          label="Datasets"
          value={datasets.isLoading ? "…" : (datasets.data ?? []).length}
          hint="Schemas captured"
          testId="metric-datasets"
        />
        <Metric
          icon={Activity}
          label="Events"
          value={events.isLoading ? "…" : (events.data ?? []).length}
          hint="Telemetry in timeline"
          testId="metric-events"
        />
        <Metric
          icon={MessagesSquare}
          label="AI Conversations"
          value={convos.isLoading ? "…" : (convos.data ?? []).length}
          hint="Workspace dialogue"
          testId="metric-conversations"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12" data-testid="command-center-main">
        <div className="lg:col-span-5">
          <GlassCard className="p-6" data-testid="command-center-severity">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg">Severity radar</div>
                <div className="text-xs text-muted-foreground">Instant incident posture</div>
              </div>
              <Link
                href={`/app/workspaces/${workspaceId}/events`}
                className="text-xs font-semibold text-primary hover:underline"
                data-testid="command-center-open-events"
              >
                View events
              </Link>
            </div>

            <Separator className="my-5 bg-border/60" />

            {events.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 rounded-2xl" />
                <Skeleton className="h-10 rounded-2xl" />
                <Skeleton className="h-10 rounded-2xl" />
                <Skeleton className="h-10 rounded-2xl" />
                <Skeleton className="h-10 rounded-2xl" />
              </div>
            ) : (
              <div className="grid gap-2">
                {(["critical", "high", "medium", "low", "info"] as const).map((s) => {
                  const n = (sevCounts as any)[s] ?? 0;
                  const color =
                    s === "critical"
                      ? "bg-destructive/15 text-destructive border-destructive/30"
                      : s === "high"
                        ? "bg-[hsl(18_92%_58%/0.12)] text-[hsl(18_92%_58%)] border-[hsl(18_92%_58%/0.28)]"
                        : s === "medium"
                          ? "bg-[hsl(48_92%_58%/0.12)] text-[hsl(48_92%_58%)] border-[hsl(48_92%_58%/0.28)]"
                          : s === "low"
                            ? "bg-[hsl(142_70%_45%/0.12)] text-[hsl(142_70%_45%)] border-[hsl(142_70%_45%/0.28)]"
                            : "bg-primary/10 text-primary border-primary/25";

                  return (
                    <div
                      key={s}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 px-4 py-3"
                      data-testid={`command-center-severity-${s}`}
                    >
                      <div className="text-sm font-semibold">{s.toUpperCase()}</div>
                      <Badge variant="secondary" className={`rounded-full border ${color}`}>
                        {n}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-7">
          <GlassCard className="p-6" data-testid="command-center-latest">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg">Latest events</div>
                <div className="text-xs text-muted-foreground">Most recent telemetry snapshots</div>
              </div>
              <Link
                href={`/app/workspaces/${workspaceId}/events`}
                className="text-xs font-semibold text-primary hover:underline"
                data-testid="command-center-open-events-2"
              >
                Open timeline
              </Link>
            </div>

            <Separator className="my-5 bg-border/60" />

            {events.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : (events.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center" data-testid="command-center-latest-empty">
                <div className="text-sm font-semibold">No events yet</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Record an event to start building an operational narrative.
                </div>
              </div>
            ) : (
              <div className="space-y-2" data-testid="command-center-latest-list">
                {latest.map((e) => (
                  <div
                    key={e.id}
                    className="group rounded-2xl border border-border/60 bg-card/40 px-4 py-3 transition-all duration-200 hover:bg-card hover:border-border"
                    data-testid={`command-center-latest-${e.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{e.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full border border-border/60 bg-secondary/30 px-2 py-1 font-mono">
                            {e.type}
                          </span>
                          <span className="rounded-full border border-border/60 bg-secondary/30 px-2 py-1">
                            {String(e.severity).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
