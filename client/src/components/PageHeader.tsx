import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  right,
  className,
  "data-testid": testId,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)} data-testid={testId}>
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl text-glow">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm md:text-base text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}
