import * as React from "react";
import { useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, PlugZap, Tag, ShieldAlert } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";

import { useDataSources, useCreateDataSource } from "@/hooks/use-data-sources";
import { insertDataSourceSchema, type CreateDataSourceRequest } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

const createSchema = insertDataSourceSchema.extend({
  name: z.string().min(2, "Name is too short."),
  type: z.string().min(2, "Type is required (e.g. postgres, s3, webhook)."),
  // config is jsonb; accept string JSON and transform to object
  config: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : ""))
    .refine((v) => {
      if (!v) return true;
      try {
        JSON.parse(v);
        return true;
      } catch {
        return false;
      }
    }, "Config must be valid JSON.")
    .transform((v) => {
      if (!v) return {};
      return JSON.parse(v) as unknown;
    }),
  status: z.string().optional(),
});

type FormValues = z.input<typeof createSchema>;

export default function DataSourcesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useDataSources(workspaceId);
  const create = useCreateDataSource(workspaceId);

  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      workspaceId,
      name: "",
      type: "postgres",
      status: "active",
      config: "{}",
    } as any,
  });

  async function onSubmit(values: FormValues) {
    const payload: CreateDataSourceRequest = {
      workspaceId,
      name: values.name,
      type: values.type,
      status: (values as any).status ?? "active",
      config: (values as any).config ?? {},
      createdAt: undefined as any,
      id: undefined as any,
    } as any;

    create.mutate(payload as any, {
      onSuccess: () => {
        toast({ title: "Data source created", description: `“${payload.name}” connected.` });
        setOpen(false);
        form.reset({ ...(form.getValues() as any), name: "", config: "{}" });
      },
      onError: (err) => {
        const e = err as Error;
        if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
        toast({ title: "Create failed", description: e.message, variant: "destructive" as any });
      },
    });
  }

  return (
    <AppShell workspaceId={workspaceId} title="Data Sources">
      <PageHeader
        title="Data Sources"
        subtitle="Register connectors and configure ingestion. Keep the surface area explicit."
        data-testid="data-sources-header"
        right={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="data-sources-create-open"
              >
                <Plus className="mr-2 h-4 w-4" /> Add source
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border border-border/70 bg-popover/85 backdrop-blur shadow-premium">
              <DialogHeader>
                <DialogTitle>Add data source</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4" data-testid="data-sources-create-form">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Production Postgres"
                            className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                            data-testid="data-sources-create-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="postgres | s3 | webhook"
                              className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                              data-testid="data-sources-create-type"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="active"
                              className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                              data-testid="data-sources-create-status"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="config"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Config (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='{"host":"...","db":"..."}'
                            className="min-h-[120px] rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-xs"
                            data-testid="data-sources-create-config"
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
                      className="rounded-xl"
                      onClick={() => setOpen(false)}
                      data-testid="data-sources-create-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={create.isPending}
                      className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                      data-testid="data-sources-create-submit"
                    >
                      {create.isPending ? "Adding…" : "Add source"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[160px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <GlassCard className="p-6" data-testid="data-sources-error">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-card/40">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-sm font-semibold">Failed to load data sources</div>
                <div className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</div>
              </div>
            </div>
          </GlassCard>
        ) : (data ?? []).length === 0 ? (
          <GlassCard className="p-8" data-testid="data-sources-empty">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-3xl border border-border/60 bg-card/40">
                <PlugZap className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-4 text-lg">No sources connected</div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Add your first data source to begin indexing datasets and receiving telemetry.
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="data-sources-empty-add"
              >
                <Plus className="mr-2 h-4 w-4" /> Add source
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="data-sources-grid">
            {(data ?? []).map((s) => (
              <GlassCard key={s.id} className="p-6" data-testid={`data-source-card-${s.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg">{s.name}</div>
                    <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" /> {s.type}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-border/60 bg-secondary/40 text-foreground/90"
                    data-testid={`data-source-status-${s.id}`}
                  >
                    {s.status}
                  </Badge>
                </div>

                <div className="mt-4 rounded-xl border border-border/60 bg-card/40 p-3">
                  <div className="text-[11px] font-semibold text-muted-foreground">Config</div>
                  <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words text-xs text-foreground/85">
                    {JSON.stringify(s.config ?? {}, null, 2)}
                  </pre>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
