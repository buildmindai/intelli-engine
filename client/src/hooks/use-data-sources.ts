import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type DataSourceInput } from "@shared/routes";
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

export function useDataSources(workspaceId: string) {
  const url = buildUrl(api.dataSources.list.path, { workspaceId });
  return useQuery({
    queryKey: [api.dataSources.list.path, workspaceId],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.dataSources.list.responses[404], await res.json(), "dataSources.list[404]");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.dataSources.list.responses[200], await res.json(), "dataSources.list[200]");
    },
    enabled: !!workspaceId,
  });
}

export function useCreateDataSource(workspaceId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.dataSources.create.path, { workspaceId });

  return useMutation({
    mutationFn: async (input: DataSourceInput) => {
      const validated = api.dataSources.create.input.parse(input);
      const res = await apiRequest(api.dataSources.create.method, url, validated);
      if (res.status === 201) {
        return parseWithLogging(api.dataSources.create.responses[201], await res.json(), "dataSources.create[201]");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.dataSources.create.responses[400], await res.json(), "dataSources.create[400]");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.dataSources.create.responses[404], await res.json(), "dataSources.create[404]");
        throw new Error(err.message);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.dataSources.list.path, workspaceId] });
    },
  });
}
