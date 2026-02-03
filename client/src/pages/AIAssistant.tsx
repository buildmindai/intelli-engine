import * as React from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageSquarePlus, Send, Sparkles, Bot, User as UserIcon, Loader2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";

import { useAiChat, useAiConversations, useAiMessages, useCreateAiConversation } from "@/hooks/use-ai";
import { insertAiConversationSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

const newConversationSchema = insertAiConversationSchema.extend({
  title: z.string().min(2, "Title is too short."),
});

const promptSchema = z.object({
  prompt: z.string().min(1, "Write a prompt."),
});

type PromptValues = z.infer<typeof promptSchema>;

function Bubble({
  role,
  content,
  testId,
}: {
  role: string;
  content: string;
  testId: string;
}) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"} data-testid={testId}>
      <div
        className={[
          "max-w-[92%] sm:max-w-[80%] rounded-3xl border p-4 shadow-sm",
          isUser
            ? "border-primary/25 bg-primary/10"
            : "border-border/60 bg-card/40",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-2xl border border-border/60 bg-secondary/30">
            {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
          </span>
          {isUser ? "Operator" : "NOCTIS AI"}
        </div>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {content}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);

  const conversations = useAiConversations(workspaceId);
  const createConversation = useCreateAiConversation(workspaceId);
  const chat = useAiChat();

  const messages = useAiMessages(activeConversationId ?? "");

  const promptForm = useForm<PromptValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: { prompt: "" },
  });

  React.useEffect(() => {
    if (!activeConversationId && (conversations.data ?? []).length > 0) {
      setActiveConversationId(conversations.data![0].id);
    }
  }, [activeConversationId, conversations.data]);

  const composerRef = React.useRef<HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    composerRef.current?.focus();
  }, [activeConversationId]);

  function handleNewConversation() {
    // Create with a crisp default title; user can later create named ones (MVP)
    const title = `Session — ${new Date().toLocaleString()}`;
    createConversation.mutate(
      { workspaceId, title } as any,
      {
        onSuccess: (c) => {
          setActiveConversationId(c.id);
          toast({ title: "Conversation created", description: "You can start asking questions." });
        },
        onError: (err) => {
          const e = err as Error;
          if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
          toast({ title: "Failed to create conversation", description: e.message, variant: "destructive" as any });
        },
      }
    );
  }

  async function onSend(values: PromptValues) {
    const prompt = values.prompt.trim();
    if (!prompt) return;

    const convId = activeConversationId;
    if (!convId) {
      // create then send
      const title = `Session — ${new Date().toLocaleString()}`;
      createConversation.mutate(
        { workspaceId, title } as any,
        {
          onSuccess: (c) => {
            setActiveConversationId(c.id);
            promptForm.setValue("prompt", "");
            chat.mutate(
              { workspaceId, conversationId: c.id, prompt },
              {
                onError: (err) => {
                  const e = err as Error;
                  if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
                  toast({ title: "AI request failed", description: e.message, variant: "destructive" as any });
                },
              }
            );
          },
          onError: (err) => {
            const e = err as Error;
            if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
            toast({ title: "Failed to create conversation", description: e.message, variant: "destructive" as any });
          },
        }
      );
      return;
    }

    promptForm.setValue("prompt", "");

    chat.mutate(
      { workspaceId, conversationId: convId, prompt },
      {
        onError: (err) => {
          const e = err as Error;
          if (isUnauthorizedError(e)) return redirectToLogin((opts) => toast(opts));
          toast({ title: "AI request failed", description: e.message, variant: "destructive" as any });
        },
      }
    );
  }

  const combinedMessages = React.useMemo(() => {
    const base = messages.data ?? [];
    // When chat is pending, render an optimistic "assistant thinking" bubble after user send.
    // We can't reliably append the user message without server echo; keep it minimal.
    return base;
  }, [messages.data]);

  return (
    <AppShell workspaceId={workspaceId} title="AI Assistant">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask questions across sources, datasets, and events—within your workspace scope."
        data-testid="ai-header"
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="rounded-2xl border border-border/60 bg-card/40 hover:bg-card hover:border-border transition-all duration-200"
              onClick={() => setLocation(`/app/workspaces/${workspaceId}/command-center`)}
              data-testid="ai-back-command-center"
            >
              Back to Command Center
            </Button>
            <Button
              className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
              onClick={handleNewConversation}
              disabled={createConversation.isPending}
              data-testid="ai-new-conversation"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              {createConversation.isPending ? "Creating…" : "New conversation"}
            </Button>
          </div>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-12" data-testid="ai-layout">
        <GlassCard className="p-4 lg:col-span-4" data-testid="ai-conversations-card">
          <div className="flex items-center justify-between px-2 pb-2">
            <div>
              <div className="text-sm font-semibold">Conversations</div>
              <div className="text-xs text-muted-foreground">Workspace history</div>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full border border-border/60 bg-secondary/40 text-foreground/90"
              data-testid="ai-conversations-count"
            >
              {(conversations.data ?? []).length}
            </Badge>
          </div>

          <Separator className="my-2 bg-border/60" />

          {conversations.isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-2xl" />
              ))}
            </div>
          ) : conversations.error ? (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm" data-testid="ai-conversations-error">
              <div className="font-semibold">Failed to load conversations</div>
              <div className="mt-1 text-muted-foreground">{(conversations.error as Error).message}</div>
            </div>
          ) : (conversations.data ?? []).length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center" data-testid="ai-conversations-empty">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-3xl border border-border/60 bg-card/40">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-3 text-sm font-semibold">No conversations yet</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Create a conversation and ask your first question.
              </div>
              <Button
                onClick={handleNewConversation}
                className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                data-testid="ai-conversations-empty-create"
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" /> New conversation
              </Button>
            </div>
          ) : (
            <div className="grid gap-1 p-2" data-testid="ai-conversations-list">
              {(conversations.data ?? []).map((c) => {
                const active = c.id === activeConversationId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={[
                      "w-full rounded-2xl border px-3 py-2 text-left transition-all duration-200",
                      active
                        ? "border-primary/30 bg-primary/10 shadow-[0_18px_60px_-46px_hsl(var(--primary)/0.6)]"
                        : "border-transparent hover:border-border/60 hover:bg-secondary/40",
                    ].join(" ")}
                    data-testid={`ai-conversation-${c.id}`}
                  >
                    <div className="truncate text-sm font-semibold">{c.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.id}</div>
                  </button>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard className="flex min-h-[520px] flex-col p-0 lg:col-span-8" data-testid="ai-chat-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="text-sm font-semibold">Chat</div>
              <div className="text-xs text-muted-foreground">
                {activeConversationId ? `Conversation: ${activeConversationId}` : "Create or select a conversation"}
              </div>
            </div>
            {chat.isPending ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary" data-testid="ai-status-thinking">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/30 px-3 py-1 text-xs font-semibold text-foreground/90" data-testid="ai-status-ready">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Ready
              </div>
            )}
          </div>

          <Separator className="bg-border/60" />

          <div className="flex-1 space-y-3 overflow-auto px-6 py-4" data-testid="ai-messages">
            {!activeConversationId ? (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl border border-border/60 bg-card/40">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <div className="mt-4 text-lg">Start a conversation</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Create a new conversation, then ask about sources, datasets, and events.
                </div>
                <Button
                  onClick={handleNewConversation}
                  className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                  data-testid="ai-start-conversation"
                >
                  <MessageSquarePlus className="mr-2 h-4 w-4" /> New conversation
                </Button>
              </div>
            ) : messages.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-16 rounded-3xl" />
              </div>
            ) : messages.error ? (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
                <div className="font-semibold">Failed to load messages</div>
                <div className="mt-1 text-muted-foreground">{(messages.error as Error).message}</div>
              </div>
            ) : (combinedMessages ?? []).length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center">
                <div className="text-sm font-semibold">No messages yet</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Try: “Summarize high-severity events and suggest next actions.”
                </div>
              </div>
            ) : (
              (combinedMessages ?? []).map((m, idx) => (
                <Bubble
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  testId={`ai-message-${idx}`}
                />
              ))
            )}
          </div>

          <Separator className="bg-border/60" />

          <div className="p-4 sm:p-5" data-testid="ai-composer">
            <form
              onSubmit={promptForm.handleSubmit(onSend)}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
              data-testid="ai-composer-form"
            >
              <Textarea
                {...promptForm.register("prompt")}
                ref={(el) => {
                  composerRef.current = el;
                }}
                placeholder='Ask: "What changed in the last 24 hours?"'
                className="min-h-[56px] flex-1 rounded-2xl bg-background/40 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                data-testid="ai-composer-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    promptForm.handleSubmit(onSend)();
                  }
                }}
              />

              <Button
                type="submit"
                disabled={chat.isPending}
                className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                data-testid="ai-composer-send"
                onClick={() => {
                  // onSubmit handles actual send; this ensures "wired" click path for test IDs
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </form>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-card/30 px-3 py-1.5">
                Cmd/Ctrl + Enter to send
              </span>
              <span className="rounded-full border border-border/60 bg-card/30 px-3 py-1.5">
                Workspace scoped: {workspaceId}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
