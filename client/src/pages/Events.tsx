import * as React from "react";
import { useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle, Plus, Radar, Shield, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";

import { useEvents, useCreateEvent, type EventsSeverity } from "@/hooks/use-events";
import { insertEventSchema, type CreateEventRequest } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

const severitySchema = z.enum(["info", "low", "medium", "high", "critical"]);

const createSchema = insertEventSchema.extend({
  title: z.string().min(2, "Title is too short."),
  type: z.string().min(2, "Type is required."),
  severity: severitySchema.default("info"),
  description: z.string().optional().nullable(),
  datasetId: z.string().optional().nullable(),
  payload: z
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
    }, "Payload must be valid JSON.")
    .transform((v) => {
      if (!v) return {};
      return JSON.parse(v) as unknown;
    }),
});

type FormValues = z.input<typeof createSchema>;

function severityStyle(sev: string) {
  switch (sev) {
    case "critical":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "high":
      return "border-[hsl(18_92%_58%/0.35)] bg-[hsl(18_92%_58%/0.12)] text-[hsl(18_92%_58%)]";
    case "medium":
      return "border-[hsl(48_92%_58%/0.35)] bg-[hsl(48_92%_58%/0.12)] text-[hsl(48_92%_58%)]";
    case "low":
      return "border-[hsl(142_70%_45%/0.35)] bg-[hsl(142_70%_45%/0.12)] text-[hsl(142_70%_45%)]";
    default:
      return "border-primary/25 bg-primary/10 text-primary";
  }
}

export default function EventsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { toast } = useToast();

  const [severity, setSeverity] = React.useState<EventsSeverity | undefined>(undefined);

  const list = useEvents(workspaceId, severity);
  const create = useCreateEvent(workspaceId);

  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      workspaceId,
      title: "",
      type: "anomaly.detected",
      severity: "info",
      description: "",
      datasetId: "",
      payload: "{}",
    } as any,
  });

  async function onSubmit(values: FormValues) {
    const payload: CreateEventRequest = {
      workspaceId,
      datasetId: values.datasetId || null,
      type: values.type,
      severity: values.severity,
      title: values.title,
      description: values.description || null,
      payload: (values as any).payload ?? {},
      occurredAt: undefined as any,
      id: undefined as any,
    } as any;

    create.mutate(payload as any, {
      onSuccess: () => {
        toast({ title: "Event recorded", description: `“${payload.title}” added.` });
        setOpen(false);
        form.reset({ ...(form.getValues() as any), title: "", description: "", payload: "{}" });
      },
      onError: (err) => {
        const e = err as Error;
        if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
        toast({ title: "Create failed", description: e.message, variant: "destructive" as any });
      },
    });
  }

  return (
    <AppShell workspaceId={workspaceId} title="Events">
      <PageHeader
        title="Events"
        subtitle="A severity-driven timeline for incident response, governance, and learning."
        data-testid="events-header"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-border/60 bg-card/40 p-1 shadow-sm">
              {(["all", "info", "low", "medium", "high", "critical"] as const).map((s) => {
                const active = (s === "all" && !severity) || severity === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeverity(s === "all" ? undefined : (s as EventsSeverity))}
                    className={[
                      "rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",
                      active
                        ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    ].join(" ")}
                    data-testid={`events-filter-${s}`}
                  >
                    {s.toUpperCase()}
                  </button>
                );
              })}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                  data-testid="events-create-open"
                >
                  <Plus className="mr-2 h-4 w-4" /> Record event
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-border/70 bg-popover/85 backdrop-blur shadow-premium">
                <DialogHeader>
                  <DialogTitle>Record event</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4" data-testid="events-create-form">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. Spike in failed payments"
                                className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                                data-testid="events-create-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="info | low | medium | high | critical"
                                className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                                data-testid="events-create-severity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                                placeholder="anomaly.detected"
                                className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                                data-testid="events-create-type"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="datasetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dataset ID (optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Link to dataset if applicable"
                                className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                                data-testid="events-create-datasetId"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add context for responders, on-call, and audit narratives."
                              className="min-h-[90px] rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                              data-testid="events-create-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payload"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payload (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='{"metric":"fail_rate","delta":0.12}'
                              className="min-h-[120px] rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-xs"
                              data-testid="events-create-payload"
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
                        data-testid="events-create-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={create.isPending}
                        className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                        data-testid="events-create-submit"
                      >
                        {create.isPending ? "Recording…" : "Record"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-12" data-testid="events-layout">
        <div className="lg:col-span-4">
          <GlassCard className="p-6" data-testid="events-sidecard">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border/60 bg-card/40">
                <Radar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">Signal hygiene</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Keep event titles tight. Payloads structured. Severity meaningful.
                </div>
              </div>
            </div>
            <Separator className="my-5 bg-border/60" />
            <div className="grid gap-3">
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" /> Guidance
                </div>
                <div className="mt-2 text-sm text-foreground/90">
                  Use <span className="font-mono text-xs text-primary/90">type</span> for taxonomy (e.g.{" "}
                  <span className="font-mono text-xs">anomaly.detected</span>).
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-accent" /> Pro tip
                </div>
                <div className="mt-2 text-sm text-foreground/90">
                  Ask the AI Assistant to summarize patterns across recent events.
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-8">
          <GlassCard className="p-6" data-testid="events-list-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg">Timeline</div>
                <div className="text-xs text-muted-foreground">
                  Filter: {severity ? severity.toUpperCase() : "ALL"}
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full border border-border/60 bg-secondary/40 text-foreground/90" data-testid="events-count">
                {(list.data ?? []).length} events
              </Badge>
            </div>

            <Separator className="my-5 bg-border/60" />

            {list.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            ) : list.error ? (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4" data-testid="events-error">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-card/40">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Failed to load events</div>
                    <div className="mt-1 text-sm text-muted-foreground">{(list.error as Error).message}</div>
                  </div>
                </div>
              </div>
            ) : (list.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center" data-testid="events-empty">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl border border-border/60 bg-card/40">
                  <Radar className="h-7 w-7 text-primary" />
                </div>
                <div className="mt-4 text-lg">No events found</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Record an event to begin building an operational narrative.
                </div>
                <Button
                  onClick={() => setOpen(true)}
                  className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                  data-testid="events-empty-record"
                >
                  <Plus className="mr-2 h-4 w-4" /> Record event
                </Button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="events-list">
                {(list.data ?? []).map((e) => (
                  <div
                    key={e.id}
                    className="group rounded-2xl border border-border/60 bg-card/40 p-4 transition-all duration-200 hover:bg-card hover:border-border"
                    data-testid={`event-row-${e.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold">{e.title}</span>
                          <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${severityStyle(e.severity)}`}>
                            {String(e.severity).toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full border border-border/60 bg-secondary/30 px-2 py-1 font-mono">
                            {e.type}
                          </span>
                          {e.datasetId ? (
                            <span className="rounded-full border border-border/60 bg-secondary/30 px-2 py-1 font-mono">
                              dataset:{e.datasetId}
                            </span>
                          ) : null}
                        </div>
                        {e.description ? (
                          <div className="mt-3 text-sm text-foreground/90">{e.description}</div>
                        ) : null}
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        <div className="font-semibold text-foreground/80">Occurred</div>
                        <div className="mt-1 font-mono">
                          {e.occurredAt ? new Date(e.occurredAt as any).toLocaleString() : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-border/60 bg-background/20 p-3">
                      <div className="text-[11px] font-semibold text-muted-foreground">Payload</div>
                      <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap break-words text-xs text-foreground/80">
                        {JSON.stringify(e.payload ?? {}, null, 2)}
                      </pre>
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
