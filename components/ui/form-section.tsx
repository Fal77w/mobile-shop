import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormSection({
  title,
  description,
  children,
  className,
  columns = 1,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {title ? (
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className={cn("grid gap-4", gridCols[columns])}>{children}</div>
    </div>
  );
}

export function FormField({
  label,
  children,
  className,
  fullWidth,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("space-y-2", fullWidth && "sm:col-span-2 lg:col-span-3", className)}>
      {label ? <label className="text-sm font-medium text-foreground">{label}</label> : null}
      {children}
    </div>
  );
}
