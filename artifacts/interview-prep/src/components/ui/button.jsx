import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90",
    ghost: "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
    outline: "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-muted)] hover:border-[var(--color-primary)]/30",
    secondary: "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
    destructive: "bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive)]/90",
  };

  const sizes = {
    default: "h-9 px-4 text-sm",
    sm: "h-7 px-3 text-xs",
    lg: "h-11 px-6 text-base",
    icon: "h-9 w-9",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
