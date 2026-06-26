import { useLocation } from "wouter";
import { LayoutGrid, FileText, Clock, MessageSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { icon: LayoutGrid, label: "Intake", href: "/intake" },
  { icon: FileText, label: "Analysis", href: "/analysis" },
  { icon: Clock, label: "History", href: "/history" },
  { icon: MessageSquare, label: "Interview Prep", href: "/interview-prep" },
];

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <aside className="flex flex-col items-center w-14 min-h-screen bg-[var(--color-card)] border-r border-[var(--color-border)] py-4 gap-2 z-10 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-4">
        <span className="text-[var(--color-primary)] font-bold text-sm font-mono">AI</span>
      </div>

      {/* Nav items */}
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive = location.startsWith(href);
        return (
          <button
            key={href}
            onClick={() => navigate(href)}
            title={label}
            className={cn(
              "group relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150",
              isActive
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-[var(--color-card)] border border-[var(--color-border)] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {label}
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* User avatar */}
      {user && (
        <div className="group relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-[var(--color-border)]" title={user.name}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] text-xs font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-[var(--color-card)] border border-[var(--color-border)] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {user.name}
          </span>
        </div>
      )}

      {/* Sign out */}
      <button
        title="Sign out"
        onClick={handleSignOut}
        className="group relative flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-all duration-150"
      >
        <LogOut className="h-4 w-4" />
        <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-[var(--color-card)] border border-[var(--color-border)] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Sign out
        </span>
      </button>
    </aside>
  );
}
