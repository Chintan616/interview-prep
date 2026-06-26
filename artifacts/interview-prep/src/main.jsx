import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Router, Route, Switch } from "wouter";
import { AuthProvider } from "./lib/auth-context";
import { SessionProvider } from "./lib/session-context";
import { ProtectedRoute } from "./components/layout/protected-route";
import { LoginPage } from "./pages/login";
import { AuthCallbackPage } from "./pages/auth-callback";
import { LandingPage } from "./pages/landing";
import { IntakePage } from "./pages/intake";
import { AnalysisPage } from "./pages/analysis";
import { InterviewPrepPage } from "./pages/interview-prep";
import { HistoryPage } from "./pages/history";
import "./index.css";

document.documentElement.classList.add("dark");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <Router>
            <Switch>
              {/* Public routes */}
              <Route path="/" component={LandingPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/auth/callback" component={AuthCallbackPage} />

              {/* Protected routes */}
              <Route path="/intake">
                <ProtectedRoute component={IntakePage} />
              </Route>
              <Route path="/analysis">
                <ProtectedRoute component={AnalysisPage} />
              </Route>
              <Route path="/interview-prep">
                <ProtectedRoute component={InterviewPrepPage} />
              </Route>
              <Route path="/history">
                <ProtectedRoute component={HistoryPage} />
              </Route>
            </Switch>
          </Router>
        </SessionProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
