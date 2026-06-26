import { useLocation } from "wouter";
import { Trash2, BarChart2, MessageSquare, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useListSessions, useDeleteSession } from "@workspace/api-spec";
import { useSession } from "@/lib/session-context";
import { PageLayout } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const STATUS_VARIANT = {
  draft: "default",
  analyzing: "amber",
  analyzed: "primary",
  generating: "amber",
  ready: "green",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ScorePill({ score }) {
  if (score == null) return <span className="text-xs text-[var(--color-muted-foreground)]">—</span>;
  const color =
    score >= 70 ? "text-[var(--color-success)]" :
    score >= 40 ? "text-[var(--color-warning)]" :
    "text-[var(--color-destructive)]";
  return <span className={cn("text-sm font-bold font-mono", color)}>{score}</span>;
}

export function HistoryPage() {
  const [, navigate] = useLocation();
  const { setSessionId } = useSession();

  const { data: sessions = [], isLoading, refetch } = useListSessions();
  const deleteSession = useDeleteSession();

  const handleOpen = (session) => {
    setSessionId(session.id);
    if (session.status === "ready" || session.status === "generating") {
      navigate("/interview-prep");
    } else if (session.status === "analyzed" || session.status === "analyzing") {
      navigate("/analysis");
    } else {
      navigate("/");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteSession.mutateAsync(id);
    refetch();
  };

  return (
    <PageLayout>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6">
          <div>
            <p className="text-xs font-mono text-[var(--color-primary)] tracking-widest uppercase mb-1">
              Session History
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">
              Past Sessions
            </h1>
          </div>
          <Button onClick={() => navigate("/")}>
            New Session
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner className="h-8 w-8" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
                <Clock className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              </div>
              <p className="text-[var(--color-muted-foreground)]">No sessions yet</p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Start your first analysis
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="px-5 py-4 cursor-pointer hover:border-[var(--color-primary)]/30 transition-all"
                    onClick={() => handleOpen(session)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-muted)] flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                            {session.targetRole}
                          </span>
                          {session.seniority && (
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              · {session.seniority}
                            </span>
                          )}
                          {session.experienceYears && (
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              · {session.experienceYears}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {formatDate(session.createdAt)}
                          </span>
                          {session.resumeFileName && (
                            <span className="text-xs text-[var(--color-muted-foreground)] truncate max-w-[180px]">
                              {session.resumeFileName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ATS score */}
                      <div className="flex flex-col items-center gap-0.5 w-14 shrink-0">
                        <ScorePill score={session.atsScore} />
                        <span className="text-[10px] text-[var(--color-muted-foreground)] font-mono">ATS</span>
                      </div>

                      {/* Status */}
                      <Badge variant={STATUS_VARIANT[session.status] ?? "default"} className="shrink-0 capitalize">
                        {session.status}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {(session.status === "analyzed" || session.status === "ready") && (
                          <button
                            title="View Analysis"
                            onClick={() => { setSessionId(session.id); navigate("/analysis"); }}
                            className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
                          >
                            <BarChart2 className="h-4 w-4" />
                          </button>
                        )}
                        {session.status === "ready" && (
                          <button
                            title="View Questions"
                            onClick={() => { setSessionId(session.id); navigate("/interview-prep"); }}
                            className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={(e) => handleDelete(e, session.id)}
                          className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
