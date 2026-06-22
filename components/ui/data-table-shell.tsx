import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTableShell({
  children,
  className,
  footer,
}: {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <div className={cn("data-table-shell", className)}>
      <div className="table-scroll">{children}</div>
      {footer ? (
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
