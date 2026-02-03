import * as React from "react";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, ArrowRight, FolderKanban } from "lucide-react";

import { useWorkspaces, useCreateWorkspace } from "@/hooks/use-workspaces";
import { insertWorkspaceSchema, type CreateWorkspaceRequest } from "@shared/schema";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

const createSchema = insertWorkspaceSchema.extend({
  name: z.string().min(2, "Workspace name must be at least 2 characters."),
});

export default function WorkspacesPage() {
  const { toast } = useToast();
  const { data, isLoading, error } = useWorkspaces();
  const create = useCreateWorkspace();

  const [open, setOpen] = React.useState(false);

  const form = useForm<CreateWorkspaceRequest>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateWorkspaceRequest) {
    create.mutate(values, {
      onSuccess: () => {
        toast({ title: "Workspace created", description: `“${values.name}” is ready.` });
        setOpen(false);
        form.reset({ name: "" });
      },
      onError: (err) => {
        const e = err as Error;
        if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
        toast({ title: "Create failed", description: e.message, variant: "destructive" as any });
      },
    });
  }

  return (
    <AppShell title="Workspaces">
      <PageHeader
        title="Workspaces"
        subtitle="Create environments, scope data, and operate with clean lineage."
        data-testid="workspaces-header"
        right={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="workspaces-create-open"
              >
                <Plus className="mr-2 h-4 w-4" /> New workspace
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border border-border/70 bg-popover/85 backdrop-blur shadow-premium">
              <DialogHeader>
                <DialogTitle>Create workspace</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4" data-testid="workspaces-create-form">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Nightwatch Ops"
                            className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                            data-testid="workspaces-create-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpen(false)}
                      className="rounded-xl"
                      data-testid="workspaces-create-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={create.isPending}
                      className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                      data-testid="workspaces-create-submit"
                    >
                      {create.isPending ? "Creating…" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-8 grid gap-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <GlassCard className="p-6" data-testid="workspaces-error">
            <div className="text-sm font-semibold">Could not load workspaces</div>
            <div className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</div>
          </GlassCard>
        ) : (data ?? []).length === 0 ? (
          <GlassCard className="p-8" data-testid="workspaces-empty">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-3xl border border-border/60 bg-card/40">
                <FolderKanban className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-4 text-lg">No workspaces yet</div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create your first workspace to start registering data sources, datasets, and event telemetry.
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="workspaces-empty-create"
              >
                <Plus className="mr-2 h-4 w-4" /> Create workspace
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="workspaces-grid">
            {(data ?? []).map((w) => (
              <GlassCard key={w.id} className="p-6" data-testid={`workspace-card-${w.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg">{w.name}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{w.id}</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-primary/25 bg-primary/10 text-primary"
                    data-testid={`workspace-badge-${w.id}`}
                  >
                    Active
                  </Badge>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Open modules</div>
                  <Link
                    href={`/app/workspaces/${w.id}/command-center`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm font-semibold transition-all duration-200 hover:bg-card hover:border-border hover:-translate-y-0.5 active:translate-y-0"
                    data-testid={`workspace-open-${w.id}`}
                  >
                    Enter <ArrowRight className="h-4 w-4 text-primary" />
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
