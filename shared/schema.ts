import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const workspaces = pgTable(
  "workspaces",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("IDX_workspaces_created_at").on(t.createdAt)]
);

export const dataSources = pgTable(
  "data_sources",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: varchar("workspace_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    config: jsonb("config").notNull().default({}),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("IDX_data_sources_workspace_id").on(t.workspaceId),
    index("IDX_data_sources_created_at").on(t.createdAt),
  ]
);

export const datasets = pgTable(
  "datasets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: varchar("workspace_id").notNull(),
    sourceId: varchar("source_id"),
    name: text("name").notNull(),
    schema: jsonb("schema").notNull().default({}),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("IDX_datasets_workspace_id").on(t.workspaceId),
    index("IDX_datasets_created_at").on(t.createdAt),
  ]
);

export const events = pgTable(
  "events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: varchar("workspace_id").notNull(),
    datasetId: varchar("dataset_id"),
    type: text("type").notNull(),
    severity: text("severity").notNull().default("info"),
    title: text("title").notNull(),
    description: text("description"),
    payload: jsonb("payload").notNull().default({}),
    occurredAt: timestamp("occurred_at").defaultNow(),
  },
  (t) => [
    index("IDX_events_workspace_id").on(t.workspaceId),
    index("IDX_events_occurred_at").on(t.occurredAt),
  ]
);

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: varchar("workspace_id").notNull(),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("IDX_ai_conversations_workspace_id").on(t.workspaceId),
    index("IDX_ai_conversations_created_at").on(t.createdAt),
  ]
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("IDX_ai_messages_conversation_id").on(t.conversationId),
    index("IDX_ai_messages_created_at").on(t.createdAt),
  ]
);

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  occurredAt: true,
});

export const insertAiConversationSchema = createInsertSchema(
  aiConversations
).omit({ id: true, createdAt: true });

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;

export type CreateWorkspaceRequest = InsertWorkspace;
export type UpdateWorkspaceRequest = Partial<InsertWorkspace>;

export type CreateDataSourceRequest = InsertDataSource;
export type UpdateDataSourceRequest = Partial<InsertDataSource>;

export type CreateDatasetRequest = InsertDataset;
export type UpdateDatasetRequest = Partial<InsertDataset>;

export type CreateEventRequest = InsertEvent;

export type CreateConversationRequest = InsertAiConversation;
export type CreateMessageRequest = InsertAiMessage;

export type WorkspaceResponse = Workspace;
export type WorkspacesListResponse = Workspace[];
export type DataSourceResponse = DataSource;
export type DataSourcesListResponse = DataSource[];
export type DatasetResponse = Dataset;
export type DatasetsListResponse = Dataset[];
export type EventResponse = Event;
export type EventsListResponse = Event[];
export type ConversationResponse = AiConversation;
export type ConversationsListResponse = AiConversation[];
export type MessageResponse = AiMessage;
export type MessagesListResponse = AiMessage[];

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}

export interface EventsQueryParams {
  cursor?: string;
  severity?: "info" | "low" | "medium" | "high" | "critical";
}

export const WS_EVENTS = {
  EVENT_CREATED: "event-created",
  DATASET_CREATED: "dataset-created",
} as const;

export interface WsMessage<T = unknown> {
  type: (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
  payload: T;
}

export const aiChatRequestSchema = z.object({
  workspaceId: z.string(),
  conversationId: z.string().optional(),
  prompt: z.string().min(1),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;
export type AiChatResponse = {
  conversationId: string;
  messageId: string;
  content: string;
};
