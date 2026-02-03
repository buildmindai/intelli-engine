import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type DatasetInput } from "@shared/routes";
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

export function useDatasets(workspaceId: string) {
  const url = buildUrl(api.datasets.list.path, { workspaceId });
  return useQuery({
    queryKey: [api.datasets.list.path, workspaceId],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.datasets.list.responses[404], await res.json(), "datasets.list[404]");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.datasets.list.responses[200], await res.json(), "datasets.list[200]");
    },
    enabled: !!workspaceId,
  });
}

export function useCreateDataset(workspaceId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.datasets.create.path, { workspaceId });

  return useMutation({
    mutationFn: async (input: DatasetInput) => {
      const validated = api.datasets.create.input.parse(input);
      const res = await apiRequest(api.datasets.create.method, url, validated);
      if (res.status === 201) {
        return parseWithLogging(api.datasets.create.responses[201], await res.json(), "datasets.create[201]");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.datasets.create.responses[400], await res.json(), "datasets.create[400]");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.datasets.create.responses[404], await res.json(), "datasets.create[404]");
        throw new Error(err.message);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.datasets.list.path, workspaceId] });
    },
  });
}
