import * as Icons from "lucide-react";

import * as React from "react";
import { Link } from "wouter";

import { GlassCard } from "@/components/GlassCard";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Feature({
  icon: Icon,
  title,
  desc,
  accent = "primary",
  testId,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent?: "primary" | "accent";
  testId: string;
}) {
  return (
    <GlassCard className="p-6" data-testid={testId}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-2xl border border-border/70",
            "bg-[radial-gradient(circle_at_30%_25%,hsl(var(--primary)/0.18),transparent_60%),linear-gradient(to_bottom_right,hsl(var(--secondary)),hsl(var(--card)))]",
            accent === "accent" &&
              "bg-[radial-gradient(circle_at_30%_25%,hsl(var(--accent)/0.16),transparent_60%),linear-gradient(to_bottom_right,hsl(var(--secondary)),hsl(var(--card)))]"
          )}
        >
          <Icon className={cn("h-5 w-5", accent === "accent" ? "text-accent" : "text-primary")} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Landing() {
  return (
    <div className="bg-aurora min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Link
              href="#features"
              className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
              data-testid="landing-nav-features"
            >
              Features
            </Link>
            <Link
              href="#trust"
              className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
              data-testid="landing-nav-trust"
            >
              Trust
            </Link>
            <Button
              onClick={() => {
                window.location.href = "/api/login";
              }}
              className="rounded-xl bg-primary text-primary-foreground shadow-[0_16px_60px_-30px_hsl(var(--primary)/0.8)] hover:shadow-[0_20px_72px_-34px_hsl(var(--primary)/0.9)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              data-testid="landing-cta-login"
            >
              Enter Console <Icons.ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="animate-stagger space-y-5">
              <Badge
                variant="secondary"
                className="w-fit rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                data-testid="landing-badge"
              >
                <Icons.Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                Palantir-inspired, MVP-ready foundation
              </Badge>

              <h1 className="text-4xl leading-[1.05] sm:text-5xl md:text-6xl text-glow" data-testid="landing-title">
                See through noise.
                <span className="block text-foreground/90">Act with certainty.</span>
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg" data-testid="landing-subtitle">
                NOCTIS is a dark-mode, operator-grade intelligence console for your data sources,
                datasets, and event telemetry—with an AI assistant that speaks your domain.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  onClick={() => {
                    window.location.href = "/api/login";
                  }}
                  className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-premium hover:-translate-y-0.5 hover:shadow-[0_36px_120px_-60px_hsl(var(--primary)/0.9)] transition-all duration-200"
                  data-testid="landing-primary"
                >
                  Get started <Icons.ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link
                  href="/app/workspaces"
                  className="inline-flex items-center justify-center rounded-2xl border border-border/60 bg-card/40 px-5 py-3 text-sm font-semibold text-foreground/90 shadow-sm transition-all duration-200 hover:bg-card hover:border-border hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="landing-secondary"
                >
                  View workspaces
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1.5">
                  <Icons.Lock className="h-3.5 w-3.5 text-primary" />
                  OIDC sessions
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1.5">
                  <Icons.Radar className="h-3.5 w-3.5 text-accent" />
                  Event telemetry
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1.5">
                  <Icons.Layers3 className="h-3.5 w-3.5 text-foreground/80" />
                  Workspace-scoped
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <GlassCard className="p-6 sm:p-7" data-testid="landing-hero-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Live preview</div>
                  <div className="text-lg">Command Center</div>
                </div>
                <div className="ring-glow rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                  Operator mode
                </div>
              </div>

              <Separator className="my-5 bg-border/60" />

              <div className="grid gap-3">
                {[
                  { label: "Data Sources", value: "Connected", hint: "Active connectors online" },
                  { label: "Datasets", value: "Indexed", hint: "Schemas captured & searchable" },
                  { label: "Events", value: "Observed", hint: "Severity-filtered timeline" },
                  { label: "AI Assistant", value: "Ready", hint: "Context-aware analysis" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-3 transition-all duration-200 hover:bg-card"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{row.label}</div>
                      <div className="truncate text-xs text-muted-foreground">{row.hint}</div>
                    </div>
                    <div className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-semibold text-foreground/90">
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-[radial-gradient(circle_at_30%_25%,hsl(var(--accent)/0.12),transparent_60%),radial-gradient(circle_at_80%_70%,hsl(var(--primary)/0.14),transparent_55%)] p-4">
                <div className="flex items-start gap-3">
                  <Icons.ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Built for compliance narratives</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Clear lineage, explicit workspace scoping, and audit-friendly events.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section id="features" className="mt-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl">The core modules</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A focused MVP foundation—beautiful, wired, and ready to extend.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={Icons.LayoutDashboard}

              title="Command Center"
              desc="Filter events by severity and stay on top of operational signal."
              testId="feature-command-center"
            />
            <Feature
              icon={Icons.DatabaseZap}

              title="Data Sources"
              desc="Register connectors with typed configuration and status."
              testId="feature-data-sources"
            />
            <Feature
              icon={Icons.Shapes}
              title="Datasets"
              desc="Capture schema, descriptions, and source lineage."
              testId="feature-datasets"
            />
            <Feature
              icon={Icons.Activity}

              title="Events"
              desc="Structured timelines for incident response and governance."
              testId="feature-events"
            />
            <Feature
              icon={Icons.MessagesSquare}

              title="AI Assistant"
              desc="Workspace-aware chat: ask questions, get actionable answers."
              accent="accent"
              testId="feature-ai"
            />
            <Feature
              icon={Icons.ShieldCheck}


              title="Security posture"
              desc="Session-backed auth and clean UX patterns for operators."
              testId="feature-security"
            />
          </div>
        </section>

        <section id="trust" className="mt-14">
          <GlassCard className="p-6 sm:p-8" data-testid="landing-trust">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <h2 className="text-2xl sm:text-3xl">Trust is a feature.</h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Dark-mode ergonomics, precise information hierarchy, and consistent interaction
                  states—built for long nights and high-stakes decisions.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Icons.ShieldCheck, t: "OIDC sessions", d: "Replit Auth-backed login flows." },
                    { icon: Icons.Lock, t: "Cookies only", d: "Credentials included in every request." },
                    { icon: Icons.Radar, t: "Signal first", d: "Severity filters and concise timelines." },
                    { icon: Icons.Sparkles, t: "Premium motion", d: "Staggered entry and micro-interactions." },
                  ].map(({icon: Icon, t, d }) => (
                    <div key={t} className="flex gap-3 rounded-2xl border border-border/60 bg-card/40 p-4">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-secondary/40">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{t}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_25%_15%,hsl(var(--primary)/0.20),transparent_55%),radial-gradient(circle_at_85%_80%,hsl(var(--accent)/0.18),transparent_55%)] p-6 shadow-premium">
                  <div className="text-xs font-semibold text-muted-foreground">Ready to deploy</div>
                  <div className="mt-2 text-xl">Operator-grade UX</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A cohesive design system, wired CRUD flows, and workspace-scoped routing.
                  </p>
                  <Button
                    onClick={() => {
                      window.location.href = "/api/login";
                    }}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
                    data-testid="landing-trust-cta"
                  >
                    Enter the console <Icons.ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        <footer className="mt-14 pb-8 text-xs text-muted-foreground">
          <Separator className="mb-6 bg-border/60" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} NOCTIS. Built for signal.</div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-border/60 bg-card/30 px-3 py-1.5">Dark mode first</span>
              <span className="rounded-full border border-border/60 bg-card/30 px-3 py-1.5">Workspace scoped</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
