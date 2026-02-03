import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, LogOut, Cookie, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <PageHeader
        title="Settings"
        subtitle="Minimal MVP settings. Extend as your platform evolves."
        data-testid="settings-header"
        right={
          <Button
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => {
              window.location.href = "/api/logout";
            }}
            data-testid="settings-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-12" data-testid="settings-layout">
        <GlassCard className="p-6 lg:col-span-7" data-testid="settings-security">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border/60 bg-card/40">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-lg">Security</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Authentication is handled via Replit OIDC. Sessions are stored in PostgreSQL.
              </div>
            </div>
          </div>

          <Separator className="my-5 bg-border/60" />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Cookie className="h-4 w-4 text-primary" /> Cookies
              </div>
              <div className="mt-2 text-sm text-foreground/90">
                Requests use <span className="font-mono text-xs">credentials: include</span>.
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Database className="h-4 w-4 text-accent" /> Sessions
              </div>
              <div className="mt-2 text-sm text-foreground/90">
                Stored in <span className="font-mono text-xs">sessions</span> table (mandatory).
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-5" data-testid="settings-about">
          <div className="text-lg">About</div>
          <div className="mt-1 text-sm text-muted-foreground">
            NOCTIS is an MVP foundation for data intelligence: workspaces, data sources, datasets,
            event telemetry, and an AI assistant.
          </div>

          <Separator className="my-5 bg-border/60" />

          <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
            Extend this page with:
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Workspace roles & access</li>
              <li>Retention & export policies</li>
              <li>Notification channels</li>
              <li>Connector secrets management</li>
            </ul>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
