import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Progress({ value = 0, className, colorClass = "bg-[var(--color-primary)]" }) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-[var(--color-muted)]", className)}>
      <motion.div
        className={cn("h-full rounded-full", colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
