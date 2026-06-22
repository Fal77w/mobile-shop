import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const accentStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function StatCard({
  title,
  value,
  icon: Icon,
  className,
  accent = "default",
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  accent?: keyof typeof accentStyles;
}) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              accentStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
