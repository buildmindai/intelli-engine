import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type WorkspaceInput } from "@shared/routes";
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

export function useWorkspaces() {
  return useQuery({
    queryKey: [api.workspaces.list.path],
    queryFn: async () => {
      const res = await fetch(api.workspaces.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.workspaces.list.responses[200], await res.json(), "workspaces.list");
    },
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: WorkspaceInput) => {
      const validated = api.workspaces.create.input.parse(input);
      const res = await apiRequest(api.workspaces.create.method, api.workspaces.create.path, validated);
      if (res.status === 201) {
        return parseWithLogging(
          api.workspaces.create.responses[201],
          await res.json(),
          "workspaces.create[201]"
        );
      }
      if (res.status === 400) {
        const err = parseWithLogging(
          api.workspaces.create.responses[400],
          await res.json(),
          "workspaces.create[400]"
        );
        throw new Error(err.message);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.workspaces.list.path] });
    },
  });
}
