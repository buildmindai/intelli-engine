import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AiChatInput, type AiConversationInput, type AiMessageInput } from "@shared/routes";
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

export function useAiConversations(workspaceId: string) {
  const url = buildUrl(api.ai.conversations.list.path, { workspaceId });
  return useQuery({
    queryKey: [api.ai.conversations.list.path, workspaceId],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.ai.conversations.list.responses[404], await res.json(), "ai.conversations.list[404]");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.ai.conversations.list.responses[200], await res.json(), "ai.conversations.list[200]");
    },
    enabled: !!workspaceId,
  });
}

export function useCreateAiConversation(workspaceId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.ai.conversations.create.path, { workspaceId });

  return useMutation({
    mutationFn: async (input: AiConversationInput) => {
      const validated = api.ai.conversations.create.input.parse(input);
      const res = await apiRequest(api.ai.conversations.create.method, url, validated);
      if (res.status === 201) {
        return parseWithLogging(api.ai.conversations.create.responses[201], await res.json(), "ai.conversations.create[201]");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.ai.conversations.create.responses[400], await res.json(), "ai.conversations.create[400]");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.ai.conversations.create.responses[404], await res.json(), "ai.conversations.create[404]");
        throw new Error(err.message);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.ai.conversations.list.path, workspaceId] });
    },
  });
}

export function useAiMessages(conversationId: string) {
  const url = buildUrl(api.ai.messages.list.path, { conversationId });
  return useQuery({
    queryKey: [api.ai.messages.list.path, conversationId],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.ai.messages.list.responses[404], await res.json(), "ai.messages.list[404]");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.ai.messages.list.responses[200], await res.json(), "ai.messages.list[200]");
    },
    enabled: !!conversationId,
  });
}

export function useCreateAiMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.ai.messages.create.path, { conversationId });

  return useMutation({
    mutationFn: async (input: AiMessageInput) => {
      const validated = api.ai.messages.create.input.parse(input);
      const res = await apiRequest(api.ai.messages.create.method, url, validated);
      if (res.status === 201) {
        return parseWithLogging(api.ai.messages.create.responses[201], await res.json(), "ai.messages.create[201]");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.ai.messages.create.responses[400], await res.json(), "ai.messages.create[400]");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.ai.messages.create.responses[404], await res.json(), "ai.messages.create[404]");
        throw new Error(err.message);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.ai.messages.list.path, conversationId] });
    },
  });
}

export function useAiChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AiChatInput) => {
      const validated = api.ai.chat.input.parse(input);
      const res = await apiRequest(api.ai.chat.method, api.ai.chat.path, validated);

      if (res.status === 200) {
        return parseWithLogging(api.ai.chat.responses[200], await res.json(), "ai.chat[200]");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.ai.chat.responses[400], await res.json(), "ai.chat[400]");
        throw new Error(err.message);
      }
      if (res.status === 401) {
        const err = parseWithLogging(api.ai.chat.responses[401], await res.json(), "ai.chat[401]");
        throw new Error(`401: ${err.message}`);
      }
      throw new Error(`Unexpected response: ${res.status}`);
    },
    onSuccess: async (data) => {
      // Refresh conversations + messages for the newly used conversation
      await queryClient.invalidateQueries({ queryKey: [api.ai.conversations.list.path, data.conversationId] });
      await queryClient.invalidateQueries({ queryKey: [api.ai.messages.list.path, data.conversationId] });
    },
  });
}
