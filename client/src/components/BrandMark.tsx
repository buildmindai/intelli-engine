import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="brandmark">
      <div
        className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-border bg-card shadow-premium"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,hsl(var(--primary)/0.28),transparent_60%),radial-gradient(circle_at_70%_75%,hsl(var(--accent)/0.22),transparent_55%)]" />
        <div className="absolute inset-0 opacity-80 [mask-image:radial-gradient(12px_12px_at_50%_40%,#000,transparent)]" />
        <div className="relative h-4 w-4 rounded-md bg-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_0_24px_hsl(var(--primary)/0.35)]" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide text-foreground/90">NOCTIS</div>
        <div className="text-[11px] text-muted-foreground">Data Intelligence</div>
      </div>
    </div>
  );
}
