import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <Component />;
}
