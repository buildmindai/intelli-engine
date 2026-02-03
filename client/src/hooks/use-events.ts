import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type EventInput } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type EventsSeverity = "info" | "low" | "medium" | "high" | "critical";

export function useEvents(workspaceId: string, severity?: EventsSeverity) {
  const url = buildUrl(api.events.list.path, { workspaceId });
  const params = new URLSearchParams();
  if (severity) params.set("severity", severity);

  const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

  return useQuery({
    queryKey: [api.events.list.path, workspaceId, severity ?? "all"],
    queryFn: async () => {
      const res = await fetch(finalUrl, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.events.list.responses[404], await res.json(), "events.list[404]");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.events.list.responses[200], await res.json(), "events.list[200]");
    },
    enabled: !!workspaceId,
  });
}

export function useCreateEvent(workspaceId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.events.create.path, { workspaceId });

  return useMutation({
    mutationFn: async (input: EventInput) => {
      const validated = api.events.create.input.parse(input);
      const res = await apiRequest(api.events.create.method, url, validated);
      if (res.status === 201) {
        return parseWithLogging(api.events.create.responses[201], await res.json(), "events.create[201]");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.events.create.responses[400], await res.json(), "events.create[400]");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.events.create.responses[404], await res.json(), "events.create[404]");
        throw new Error(err.message);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.events.list.path, workspaceId] });
    },
  });
}
