import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizes[size],
        className
      )}
    />
  );
}

export function PageLoading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <LoadingSpinner size="lg" />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}
