import { db } from "./db";
import {
  workspaces,
  dataSources,
  datasets,
  events,
  aiConversations,
  aiMessages,
  type WorkspaceResponse,
  type CreateWorkspaceRequest,
  type DataSourceResponse,
  type CreateDataSourceRequest,
  type DatasetResponse,
  type CreateDatasetRequest,
  type EventResponse,
  type CreateEventRequest,
  type ConversationResponse,
  type CreateConversationRequest,
  type MessageResponse,
  type CreateMessageRequest,
} from "@shared/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

export interface IStorage {
  listWorkspaces(): Promise<WorkspaceResponse[]>;
  createWorkspace(input: CreateWorkspaceRequest): Promise<WorkspaceResponse>;

  listDataSources(workspaceId: string): Promise<DataSourceResponse[]>;
  createDataSource(
    workspaceId: string,
    input: CreateDataSourceRequest
  ): Promise<DataSourceResponse>;

  listDatasets(workspaceId: string): Promise<DatasetResponse[]>;
  createDataset(
    workspaceId: string,
    input: CreateDatasetRequest
  ): Promise<DatasetResponse>;

  listEvents(
    workspaceId: string,
    params?: { cursor?: string; severity?: string }
  ): Promise<EventResponse[]>;
  createEvent(
    workspaceId: string,
    input: CreateEventRequest
  ): Promise<EventResponse>;

  listConversations(workspaceId: string): Promise<ConversationResponse[]>;
  createConversation(
    workspaceId: string,
    input: CreateConversationRequest
  ): Promise<ConversationResponse>;

  listMessages(conversationId: string): Promise<MessageResponse[]>;
  createMessage(
    conversationId: string,
    input: CreateMessageRequest
  ): Promise<MessageResponse>;
}

export class DatabaseStorage implements IStorage {
  async listWorkspaces(): Promise<WorkspaceResponse[]> {
    return await db
      .select()
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt));
  }

  async createWorkspace(input: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
    const [created] = await db.insert(workspaces).values(input).returning();
    return created;
  }

  async listDataSources(workspaceId: string): Promise<DataSourceResponse[]> {
    return await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.workspaceId, workspaceId))
      .orderBy(desc(dataSources.createdAt));
  }

  async createDataSource(
    workspaceId: string,
    input: CreateDataSourceRequest
  ): Promise<DataSourceResponse> {
    const [created] = await db
      .insert(dataSources)
      .values({ ...input, workspaceId })
      .returning();
    return created;
  }

  async listDatasets(workspaceId: string): Promise<DatasetResponse[]> {
    return await db
      .select()
      .from(datasets)
      .where(eq(datasets.workspaceId, workspaceId))
      .orderBy(desc(datasets.createdAt));
  }

  async createDataset(
    workspaceId: string,
    input: CreateDatasetRequest
  ): Promise<DatasetResponse> {
    const [created] = await db
      .insert(datasets)
      .values({ ...input, workspaceId })
      .returning();
    return created;
  }

  async listEvents(
    workspaceId: string,
    params?: { cursor?: string; severity?: string }
  ): Promise<EventResponse[]> {
    const cursor = params?.cursor ? new Date(params.cursor) : undefined;
    const severity = params?.severity;

    const whereParts = [eq(events.workspaceId, workspaceId)];

    if (severity) {
      whereParts.push(eq(events.severity, severity));
    }

    if (cursor) {
      whereParts.push(sql`${events.occurredAt} < ${cursor}`);
    }

    return await db
      .select()
      .from(events)
      .where(and(...whereParts))
      .orderBy(desc(events.occurredAt))
      .limit(100);
  }

  async createEvent(
    workspaceId: string,
    input: CreateEventRequest
  ): Promise<EventResponse> {
    const [created] = await db
      .insert(events)
      .values({ ...input, workspaceId })
      .returning();
    return created;
  }

  async listConversations(workspaceId: string): Promise<ConversationResponse[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.workspaceId, workspaceId))
      .orderBy(desc(aiConversations.createdAt));
  }

  async createConversation(
    workspaceId: string,
    input: CreateConversationRequest
  ): Promise<ConversationResponse> {
    const [created] = await db
      .insert(aiConversations)
      .values({ ...input, workspaceId })
      .returning();
    return created;
  }

  async listMessages(conversationId: string): Promise<MessageResponse[]> {
    return await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(desc(aiMessages.createdAt));
  }

  async createMessage(
    conversationId: string,
    input: CreateMessageRequest
  ): Promise<MessageResponse> {
    const [created] = await db
      .insert(aiMessages)
      .values({ ...input, conversationId })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
