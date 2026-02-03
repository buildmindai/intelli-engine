import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grain relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-premium",
        "backdrop-blur supports-[backdrop-filter]:bg-card/55",
        "transition-all duration-300 ease-out",
        "hover:border-border hover:shadow-[0_24px_80px_-42px_hsl(0_0%_0%/0.9),0_0_0_1px_hsl(var(--primary)/0.18)]",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_320px_at_20%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(700px_380px_at_85%_10%,hsl(var(--accent)/0.08),transparent_55%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}
