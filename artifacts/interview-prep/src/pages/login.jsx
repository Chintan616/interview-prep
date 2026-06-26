import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) navigate("/intake");
  }, [isAuthenticated]);

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-5">
            <span className="text-[var(--color-primary)] font-bold text-xl font-mono">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">
            Interview Prep
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1.5">
            AI-powered resume analysis & interview simulator
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col gap-6">
          <div>
            <p className="text-xs font-mono text-[var(--color-primary)] tracking-widest uppercase mb-1">
              Get Started
            </p>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Sign in to continue
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Your sessions, analyses, and questions are saved to your account.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-input)] hover:border-[var(--color-primary)]/30 transition-all duration-150"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-xs text-center text-[var(--color-muted-foreground)]">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "ATS Analysis", sub: "Strict scoring" },
            { label: "Skill Gaps", sub: "Matched vs missing" },
            { label: "20 Questions", sub: "Per session" },
          ].map(({ label, sub }) => (
            <div key={label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3">
              <p className="text-xs font-semibold text-[var(--color-foreground)]">{label}</p>
              <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
