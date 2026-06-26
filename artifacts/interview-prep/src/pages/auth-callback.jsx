import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

export function AuthCallbackPage() {
  const { setToken } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Token is passed in the URL fragment to avoid server logs
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (token) {
      setToken(token);
      // Clean the fragment from the URL before navigating
      window.history.replaceState(null, "", "/intake");
      navigate("/intake");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-4">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-[var(--color-muted-foreground)]">Signing you in...</p>
    </div>
  );
}
