import { z } from "zod";
import {
  insertWorkspaceSchema,
  insertDataSourceSchema,
  insertDatasetSchema,
  insertEventSchema,
  insertAiConversationSchema,
  insertAiMessageSchema,
  aiChatRequestSchema,
  workspaces,
  dataSources,
  datasets,
  events,
  aiConversations,
  aiMessages,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const workspaceResponseSchema = z.custom<typeof workspaces.$inferSelect>();
const dataSourceResponseSchema = z.custom<typeof dataSources.$inferSelect>();
const datasetResponseSchema = z.custom<typeof datasets.$inferSelect>();
const eventResponseSchema = z.custom<typeof events.$inferSelect>();
const conversationResponseSchema = z.custom<typeof aiConversations.$inferSelect>();
const messageResponseSchema = z.custom<typeof aiMessages.$inferSelect>();

export const api = {
  workspaces: {
    list: {
      method: "GET" as const,
      path: "/api/workspaces",
      responses: {
        200: z.array(workspaceResponseSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/workspaces",
      input: insertWorkspaceSchema,
      responses: {
        201: workspaceResponseSchema,
        400: errorSchemas.validation,
      },
    },
  },
  dataSources: {
    list: {
      method: "GET" as const,
      path: "/api/workspaces/:workspaceId/data-sources",
      responses: {
        200: z.array(dataSourceResponseSchema),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/workspaces/:workspaceId/data-sources",
      input: insertDataSourceSchema,
      responses: {
        201: dataSourceResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  datasets: {
    list: {
      method: "GET" as const,
      path: "/api/workspaces/:workspaceId/datasets",
      responses: {
        200: z.array(datasetResponseSchema),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/workspaces/:workspaceId/datasets",
      input: insertDatasetSchema,
      responses: {
        201: datasetResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  events: {
    list: {
      method: "GET" as const,
      path: "/api/workspaces/:workspaceId/events",
      input: z
        .object({
          cursor: z.string().optional(),
          severity: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(eventResponseSchema),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/workspaces/:workspaceId/events",
      input: insertEventSchema,
      responses: {
        201: eventResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    conversations: {
      list: {
        method: "GET" as const,
        path: "/api/workspaces/:workspaceId/ai/conversations",
        responses: {
          200: z.array(conversationResponseSchema),
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/workspaces/:workspaceId/ai/conversations",
        input: insertAiConversationSchema,
        responses: {
          201: conversationResponseSchema,
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
    },
    messages: {
      list: {
        method: "GET" as const,
        path: "/api/ai/conversations/:conversationId/messages",
        responses: {
          200: z.array(messageResponseSchema),
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/ai/conversations/:conversationId/messages",
        input: insertAiMessageSchema,
        responses: {
          201: messageResponseSchema,
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
    },
    chat: {
      method: "POST" as const,
      path: "/api/ai/chat",
      input: aiChatRequestSchema,
      responses: {
        200: z.object({
          conversationId: z.string(),
          messageId: z.string(),
          content: z.string(),
        }),
        400: errorSchemas.validation,
        401: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  return url;
}

export type WorkspaceInput = z.infer<typeof api.workspaces.create.input>;
export type WorkspaceResponse = z.infer<typeof api.workspaces.create.responses[201]>;
export type WorkspacesListResponse = z.infer<typeof api.workspaces.list.responses[200]>;

export type DataSourceInput = z.infer<typeof api.dataSources.create.input>;
export type DataSourceResponse = z.infer<typeof api.dataSources.create.responses[201]>;
export type DataSourcesListResponse = z.infer<typeof api.dataSources.list.responses[200]>;

export type DatasetInput = z.infer<typeof api.datasets.create.input>;
export type DatasetResponse = z.infer<typeof api.datasets.create.responses[201]>;
export type DatasetsListResponse = z.infer<typeof api.datasets.list.responses[200]>;

export type EventInput = z.infer<typeof api.events.create.input>;
export type EventResponse = z.infer<typeof api.events.create.responses[201]>;
export type EventsListResponse = z.infer<typeof api.events.list.responses[200]>;

export type AiConversationInput = z.infer<typeof api.ai.conversations.create.input>;
export type AiConversationResponse = z.infer<
  typeof api.ai.conversations.create.responses[201]
>;

export type AiMessageInput = z.infer<typeof api.ai.messages.create.input>;
export type AiMessageResponse = z.infer<typeof api.ai.messages.create.responses[201]>;

export type AiChatInput = z.infer<typeof api.ai.chat.input>;
export type AiChatResponse = z.infer<typeof api.ai.chat.responses[200]>;

export type ValidationError = z.infer<typeof errorSchemas.validation>;
export type NotFoundError = z.infer<typeof errorSchemas.notFound>;
export type InternalError = z.infer<typeof errorSchemas.internal>;
