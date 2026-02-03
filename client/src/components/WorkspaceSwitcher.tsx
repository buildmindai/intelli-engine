import * as React from "react";
import { Link, useLocation } from "wouter";
import { Check, ChevronDown, Layers } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSwitcher({
  currentWorkspaceId,
}: {
  currentWorkspaceId?: string;
}) {
  const { data, isLoading, error } = useWorkspaces();
  const [, setLocation] = useLocation();

  const current = data?.find((w) => w.id === currentWorkspaceId) ?? null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "group w-full justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-5 shadow-sm",
            "hover:bg-card hover:border-border transition-all duration-200"
          )}
          data-testid="workspace-switcher-trigger"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_25%,hsl(var(--primary)/0.25),transparent_62%),linear-gradient(to_bottom_right,hsl(var(--secondary)),hsl(var(--card)))] border border-border/60">
              <Layers className="h-4 w-4 text-foreground/80" />
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-semibold">
                {isLoading ? "Loading workspaces…" : current?.name ?? "Select workspace"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {error ? "Could not load" : currentWorkspaceId ? currentWorkspaceId : "Your environments"}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-border/70 bg-popover/80 p-2 shadow-premium backdrop-blur"
        data-testid="workspace-switcher-popover"
      >
        <div className="px-2 pb-2 pt-1">
          <div className="text-xs font-semibold text-muted-foreground">Workspaces</div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="grid gap-1 p-1">
              {(data ?? []).map((w) => {
                const selected = w.id === currentWorkspaceId;
                return (
                  <button
                    key={w.id}
                    onClick={() => setLocation(`/app/workspaces/${w.id}/command-center`)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left",
                      "border border-transparent hover:border-border/70 hover:bg-secondary/60 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                    )}
                    data-testid={`workspace-switcher-item-${w.id}`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{w.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{w.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                          <Check className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          Open
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              {(data ?? []).length === 0 ? (
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  No workspaces yet. Create one to begin.
                </div>
              ) : null}
            </div>
          </ScrollArea>
        )}

        <div className="mt-2 border-t border-border/60 p-2">
          <Link
            href="/app/workspaces"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border/60 bg-card/50 px-3 py-2 text-sm font-semibold text-foreground/90 shadow-sm transition-all duration-200 hover:bg-card hover:border-border hover:-translate-y-0.5 active:translate-y-0"
            data-testid="workspace-switcher-manage-link"
          >
            Manage workspaces
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
