import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const Badge = ({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) => {
  const variants: Record<BadgeVariant, string> = {
    default: "border-transparent bg-primary/10 text-primary",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive/10 text-destructive",
    outline: "border-border text-foreground",
    success: "border-transparent bg-success/10 text-success",
    warning: "border-transparent bg-warning/10 text-warning",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export { Badge };
