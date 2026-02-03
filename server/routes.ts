import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

function zodErrorToPayload(err: z.ZodError) {
  return {
    message: err.errors[0]?.message ?? "Invalid request",
    field: err.errors[0]?.path?.join("."),
  };
}

async function seedDatabase() {
  const existing = await storage.listWorkspaces();
  if (existing.length > 0) return;

  const workspace = await storage.createWorkspace({
    name: "Orion Intelligence Cell",
  });

  const source1 = await storage.createDataSource(workspace.id, {
    name: "Public Threat Feed API",
    type: "api",
    config: { baseUrl: "https://example.com", auth: "token" },
    status: "active",
  });

  const source2 = await storage.createDataSource(workspace.id, {
    name: "Manufacturing Sensor Gateway",
    type: "iot",
    config: { protocol: "mqtt", topic: "plant/line-3/#" },
    status: "active",
  });

  const dataset1 = await storage.createDataset(workspace.id, {
    sourceId: source1.id,
    name: "ThreatSignals",
    schema: {
      fields: [
        { name: "indicator", type: "string" },
        { name: "confidence", type: "number" },
        { name: "region", type: "string" },
      ],
    },
    description: "Normalized indicators from external feeds.",
  });

  const dataset2 = await storage.createDataset(workspace.id, {
    sourceId: source2.id,
    name: "Line3Telemetry",
    schema: {
      fields: [
        { name: "sensorId", type: "string" },
        { name: "metric", type: "string" },
        { name: "value", type: "number" },
        { name: "unit", type: "string" },
      ],
    },
    description: "High-frequency sensor events from production line 3.",
  });

  await storage.createEvent(workspace.id, {
    datasetId: dataset1.id,
    type: "threat.alert",
    severity: "high",
    title: "Clustered indicators detected",
    description: "Multiple correlated indicators observed across adjacent regions.",
    payload: { indicators: 7, confidenceAvg: 0.82 },
  });

  await storage.createEvent(workspace.id, {
    datasetId: dataset2.id,
    type: "telemetry.anomaly",
    severity: "medium",
    title: "Vibration threshold exceeded",
    description: "Sustained vibration over baseline for 4 minutes.",
    payload: { sensorId: "vb-22", metric: "vibration", value: 14.2, unit: "mm/s" },
  });

  await storage.createEvent(workspace.id, {
    datasetId: dataset2.id,
    type: "telemetry.health",
    severity: "info",
    title: "Gateway heartbeat",
    description: "All sensors reporting within expected parameters.",
    payload: { sensorsOnline: 48 },
  });

  const convo = await storage.createConversation(workspace.id, {
    title: "Welcome briefing",
  });

  await storage.createMessage(convo.id, {
    role: "assistant",
    content:
      "This workspace is seeded with example sources, datasets, and events. Ask me to summarize recent events or propose next actions.",
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.workspaces.list.path, isAuthenticated, async (_req, res) => {
    const items = await storage.listWorkspaces();
    res.json(items);
  });

  app.post(api.workspaces.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.workspaces.create.input.parse(req.body);
      const created = await storage.createWorkspace(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  app.get(api.dataSources.list.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const items = await storage.listDataSources(workspaceId);
    res.json(items);
  });

  app.post(api.dataSources.create.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    try {
      const input = api.dataSources.create.input.parse(req.body);
      const created = await storage.createDataSource(workspaceId, input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  app.get(api.datasets.list.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const items = await storage.listDatasets(workspaceId);
    res.json(items);
  });

  app.post(api.datasets.create.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    try {
      const input = api.datasets.create.input.parse(req.body);
      const created = await storage.createDataset(workspaceId, input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  app.get(api.events.list.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const querySchema = z
      .object({
        cursor: z.string().optional(),
        severity: z.string().optional(),
      })
      .optional();

    const params = querySchema.parse(req.query);
    const items = await storage.listEvents(workspaceId, params);
    res.json(items);
  });

  app.post(api.events.create.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    try {
      const input = api.events.create.input.parse(req.body);
      const created = await storage.createEvent(workspaceId, input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  app.get(api.ai.conversations.list.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const items = await storage.listConversations(workspaceId);
    res.json(items);
  });

  app.post(api.ai.conversations.create.path, isAuthenticated, async (req, res) => {
    const { workspaceId } = req.params;
    const ws = await storage.listWorkspaces();
    if (!ws.find((w) => w.id === workspaceId)) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    try {
      const input = api.ai.conversations.create.input.parse(req.body);
      const created = await storage.createConversation(workspaceId, input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  app.get(api.ai.messages.list.path, isAuthenticated, async (req, res) => {
    const { conversationId } = req.params;
    const items = await storage.listMessages(conversationId);
    res.json(items);
  });

  app.post(api.ai.messages.create.path, isAuthenticated, async (req, res) => {
    const { conversationId } = req.params;
    try {
      const input = api.ai.messages.create.input.parse(req.body);
      const created = await storage.createMessage(conversationId, input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  app.post(api.ai.chat.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.ai.chat.input.parse(req.body);

      let conversationId = input.conversationId;
      if (!conversationId) {
        const convo = await storage.createConversation(input.workspaceId, {
          title: "AI Session",
        });
        conversationId = convo.id;
      }

      const userMsg = await storage.createMessage(conversationId, {
        role: "user",
        content: input.prompt,
      });

      const contextEvents = await storage.listEvents(input.workspaceId, {
        severity: undefined,
      });

      const systemContext = `You are an AI assistant inside an enterprise intelligence platform. Use the provided context to be precise and actionable.\n\nRecent events (most recent first):\n${contextEvents
        .slice(0, 10)
        .map((e) => `- [${e.severity}] ${e.title}: ${e.description ?? ""}`)
        .join("\n")}`;

      // Use OpenAI-compatible Replit AI endpoint if available in runtime.
      // Fallback response if AI provider isn't wired by frontend yet.
      let assistantText = "I can help analyze your workspace. Ask me to summarize events, assess risk, or propose next actions.";

      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({
          apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
          baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-5.2",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: input.prompt },
          ],
        });

        assistantText = completion.choices[0]?.message?.content?.trim() || assistantText;
      } catch (_err) {
        // Keep fallback text
      }

      const assistantMsg = await storage.createMessage(conversationId, {
        role: "assistant",
        content: assistantText,
      });

      res.json({
        conversationId,
        messageId: assistantMsg.id,
        content: assistantMsg.content,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToPayload(err));
      }
      throw err;
    }
  });

  await seedDatabase();

  return httpServer;
}
