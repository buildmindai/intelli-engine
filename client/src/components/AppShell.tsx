import * as React from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  DatabaseZap,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Shapes,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { BrandMark } from "@/components/BrandMark";

function initialsFromName(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

export function AppShell({
  workspaceId,
  title,
  children,
}: {
  workspaceId?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const display = fullName || user?.email || "Operator";

  const nav = [
    {
      label: "Command Center",
      href: workspaceId
        ? `/app/workspaces/${workspaceId}/command-center`
        : "/app/workspaces",
      icon: LayoutDashboard,
      testId: "nav-command-center",
    },
    {
      label: "Data Sources",
      href: workspaceId
        ? `/app/workspaces/${workspaceId}/data-sources`
        : "/app/workspaces",
      icon: DatabaseZap,
      testId: "nav-data-sources",
    },
    {
      label: "Datasets",
      href: workspaceId
        ? `/app/workspaces/${workspaceId}/datasets`
        : "/app/workspaces",
      icon: Shapes,
      testId: "nav-datasets",
    },
    {
      label: "Events",
      href: workspaceId
        ? `/app/workspaces/${workspaceId}/events`
        : "/app/workspaces",
      icon: Activity,
      testId: "nav-events",
    },
    {
      label: "AI Assistant",
      href: workspaceId
        ? `/app/workspaces/${workspaceId}/assistant`
        : "/app/workspaces",
      icon: MessagesSquare,
      testId: "nav-ai-assistant",
    },
  ];

  return (
    <SidebarProvider>
      <div className="bg-aurora min-h-screen">
        <Sidebar
          className="border-r border-sidebar-border/80"
          data-testid="app-sidebar"
        >
          <SidebarHeader className="gap-3 p-4">
            <BrandMark />
            <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
          </SidebarHeader>

          <SidebarContent className="px-3 pb-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs tracking-wide text-muted-foreground">
                Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => {
                    const active = location === item.href;
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link
                            href={item.href}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-xl px-3 py-2",
                              "transition-all duration-200 ease-out",
                              "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                              active &&
                                "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-primary/25 shadow-[0_18px_50px_-34px_hsl(var(--primary)/0.45)]",
                            )}
                            data-testid={item.testId}
                          >
                            <span
                              className={cn(
                                "grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card/50",
                                "group-hover:border-border group-hover:bg-card",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4",
                                  active
                                    ? "text-primary"
                                    : "text-foreground/80",
                                )}
                              />
                            </span>
                            <span className="text-sm font-semibold">
                              {item.label}
                            </span>
                            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-4 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[radial-gradient(circle_at_30%_25%,hsl(var(--primary)/0.2),transparent_60%),linear-gradient(to_bottom_right,hsl(var(--secondary)),hsl(var(--card)))] border border-border/60">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Secure by design</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    OIDC auth, session-backed. Audit-friendly event capture.
                  </div>
                </div>
              </div>
              <Separator className="my-3 bg-border/60" />
              <Link
                href="/app/settings"
                className="inline-flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm font-semibold transition-all duration-200 hover:bg-card hover:border-border"
                data-testid="nav-settings"
              >
                <span className="inline-flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="rounded-2xl border border-border/60 bg-card/55 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-1 ring-border/60">
                  {user?.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={display} />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-foreground">
                    {initialsFromName(fullName || user?.email)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-sm font-semibold"
                    data-testid="user-display"
                  >
                    {isLoading ? "Loading…" : display}
                  </div>
                  <div
                    className="truncate text-xs text-muted-foreground"
                    data-testid="user-email"
                  >
                    {user?.email ?? "—"}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-border"
                  onClick={() => {
                    window.location.href = "/api/logout";
                  }}
                  data-testid="logout-button"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger data-testid="sidebar-trigger" />
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Workspace
                  </div>
                  <div className="text-sm font-semibold text-foreground/90">
                    {title ?? "Operations Console"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/app/workspaces"
                  className="hidden md:inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-card hover:border-border hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="header-workspaces-link"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Workspaces
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
            <div className="animate-enter">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
