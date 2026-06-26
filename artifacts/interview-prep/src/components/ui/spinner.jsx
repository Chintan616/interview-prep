import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]",
        className
      )}
    />
  );
}
