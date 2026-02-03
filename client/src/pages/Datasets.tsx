import * as React from "react";
import { useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Boxes, FileJson2, BadgeInfo } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";

import { useDatasets, useCreateDataset } from "@/hooks/use-datasets";
import { useDataSources } from "@/hooks/use-data-sources";

import { insertDatasetSchema, type CreateDatasetRequest } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

const createSchema = insertDatasetSchema.extend({
  name: z.string().min(2, "Name is too short."),
  sourceId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  schema: z
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
    }, "Schema must be valid JSON.")
    .transform((v) => {
      if (!v) return {};
      return JSON.parse(v) as unknown;
    }),
});

type FormValues = z.input<typeof createSchema>;

export default function DatasetsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useDatasets(workspaceId);
  const sources = useDataSources(workspaceId);
  const create = useCreateDataset(workspaceId);

  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      workspaceId,
      name: "",
      sourceId: "",
      description: "",
      schema: "{}",
    } as any,
  });

  async function onSubmit(values: FormValues) {
    const payload: CreateDatasetRequest = {
      workspaceId,
      name: values.name,
      sourceId: (values as any).sourceId || null,
      description: values.description || null,
      schema: (values as any).schema ?? {},
      createdAt: undefined as any,
      id: undefined as any,
    } as any;

    create.mutate(payload as any, {
      onSuccess: () => {
        toast({ title: "Dataset created", description: `“${payload.name}” indexed.` });
        setOpen(false);
        form.reset({ ...(form.getValues() as any), name: "", description: "", schema: "{}" });
      },
      onError: (err) => {
        const e = err as Error;
        if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
        toast({ title: "Create failed", description: e.message, variant: "destructive" as any });
      },
    });
  }

  return (
    <AppShell workspaceId={workspaceId} title="Datasets">
      <PageHeader
        title="Datasets"
        subtitle="Capture structure, annotate meaning, and establish lineage."
        data-testid="datasets-header"
        right={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="datasets-create-open"
              >
                <Plus className="mr-2 h-4 w-4" /> New dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border border-border/70 bg-popover/85 backdrop-blur shadow-premium">
              <DialogHeader>
                <DialogTitle>Create dataset</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4" data-testid="datasets-create-form">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. payments.transactions"
                            className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                            data-testid="datasets-create-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source ID (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              sources.data?.[0]?.id
                                ? `e.g. ${sources.data[0].id}`
                                : "Paste a data source id"
                            }
                            className="rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                            data-testid="datasets-create-sourceId"
                          />
                        </FormControl>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Tip: create sources first, then paste their IDs here for lineage.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What does this dataset represent? Who owns it? What are the key fields?"
                            className="min-h-[90px] rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                            data-testid="datasets-create-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schema"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schema (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='{"fields":[{"name":"id","type":"uuid"}]}'
                            className="min-h-[120px] rounded-xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-xs"
                            data-testid="datasets-create-schema"
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
                      data-testid="datasets-create-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={create.isPending}
                      className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                      data-testid="datasets-create-submit"
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

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <GlassCard className="p-6" data-testid="datasets-error">
            <div className="text-sm font-semibold">Failed to load datasets</div>
            <div className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</div>
          </GlassCard>
        ) : (data ?? []).length === 0 ? (
          <GlassCard className="p-8" data-testid="datasets-empty">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-3xl border border-border/60 bg-card/40">
                <Boxes className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-4 text-lg">No datasets yet</div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Datasets describe structure. Add one and attach schema JSON as you learn more.
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="datasets-empty-create"
              >
                <Plus className="mr-2 h-4 w-4" /> Create dataset
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="datasets-grid">
            {(data ?? []).map((d) => (
              <GlassCard key={d.id} className="p-6" data-testid={`dataset-card-${d.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg">{d.name}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {d.sourceId ? `Source: ${d.sourceId}` : "No source linked"}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-border/60 bg-secondary/40 text-foreground/90"
                    data-testid={`dataset-badge-${d.id}`}
                  >
                    <FileJson2 className="mr-1 h-3.5 w-3.5 text-primary" />
                    JSON
                  </Badge>
                </div>

                {d.description ? (
                  <div className="mt-4 rounded-xl border border-border/60 bg-card/40 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                      <BadgeInfo className="h-3.5 w-3.5" /> Description
                    </div>
                    <div className="mt-2 text-sm text-foreground/90">{d.description}</div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-xl border border-border/60 bg-card/40 p-3">
                  <div className="text-[11px] font-semibold text-muted-foreground">Schema</div>
                  <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words text-xs text-foreground/85">
                    {JSON.stringify(d.schema ?? {}, null, 2)}
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
