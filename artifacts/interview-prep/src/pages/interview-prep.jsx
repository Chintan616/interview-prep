import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { RotateCcw, Video, Circle, CheckCircle2, ChevronDown, ChevronUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetQuestions, useMarkQuestion, useGenerateQuestions } from "@workspace/api-spec";
import { useSession } from "@/lib/session-context";
import { PageLayout } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function difficultyVariant(d) {
  if (!d) return "default";
  const lower = d.toLowerCase();
  if (lower === "easy") return "green";
  if (lower === "medium") return "amber";
  if (lower === "hard") return "red";
  return "default";
}

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[var(--color-border)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-mono tracking-widest uppercase text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionCard({ question, index, onMark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "border rounded-xl overflow-hidden transition-colors",
        question.isPrepared
          ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/3"
          : "border-[var(--color-border)] bg-[var(--color-card)]"
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono text-[var(--color-muted-foreground)] mt-0.5 w-6 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {(question.tags ?? []).map((tag) => (
              <Badge key={tag} variant="primary" className="text-[10px]">{tag}</Badge>
            ))}
            <Badge variant={difficultyVariant(question.difficulty)} className="text-[10px]">
              {question.difficulty}
            </Badge>
            {question.probability && (
              <span className="text-xs text-[var(--color-muted-foreground)]">{question.probability}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onMark(question.id)}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium shrink-0 ml-3 transition-colors",
            question.isPrepared
              ? "text-[var(--color-success)]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          )}
        >
          {question.isPrepared ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
          Mark Prepared
        </button>
      </div>

      {/* Question */}
      <div className="px-4 pb-4">
        <h3 className="text-base font-semibold text-[var(--color-foreground)] leading-snug">
          {question.question}
        </h3>
      </div>

      {/* Collapsible sections */}
      {question.whyThisQuestion && (
        <CollapsibleSection title="Why This Question">
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {question.whyThisQuestion}
          </p>
        </CollapsibleSection>
      )}

      {question.suggestedFramework && (
        <CollapsibleSection title="Suggested Framework">
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {question.suggestedFramework}
          </p>
        </CollapsibleSection>
      )}

      {(question.talkingPoints ?? []).length > 0 && (
        <CollapsibleSection title="Key Talking Points">
          <div className="grid grid-cols-2 gap-2">
            {(question.talkingPoints ?? []).map((point, i) => (
              <div key={i} className="flex gap-2 bg-[var(--color-muted)] rounded-lg p-2.5">
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold mt-0.5 shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-[var(--color-foreground)]">{point}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(question.skillsToMention ?? []).length > 0 && (
        <CollapsibleSection title="Skills to Mention">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-[var(--color-muted-foreground)] mr-1">Skills to mention:</span>
            {(question.skillsToMention ?? []).map((skill) => (
              <Badge key={skill} className="font-mono text-[10px]">{skill}</Badge>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </motion.div>
  );
}

export function InterviewPrepPage() {
  const [, navigate] = useLocation();
  const { sessionId } = useSession();
  const [activeTrack, setActiveTrack] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data: allQuestions = [], isLoading, refetch } = useGetQuestions(sessionId);
  const markQuestion = useMarkQuestion();
  const generateQuestions = useGenerateQuestions();

  const tracks = useMemo(() => {
    const trackMap = {};
    for (const q of allQuestions) {
      if (!trackMap[q.track]) trackMap[q.track] = [];
      trackMap[q.track].push(q);
    }
    return trackMap;
  }, [allQuestions]);

  const trackNames = Object.keys(tracks);

  const currentTrack = activeTrack ?? trackNames[0] ?? null;
  const filteredQuestions = currentTrack ? (tracks[currentTrack] ?? []) : allQuestions;

  const preparedCount = allQuestions.filter((q) => q.isPrepared).length;
  const totalCount = allQuestions.length;
  const coveragePct = totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;

  const handleMark = async (qid) => {
    await markQuestion.mutateAsync({ id: sessionId, qid });
    refetch();
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await generateQuestions.mutateAsync(sessionId);
      refetch();
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner className="h-8 w-8" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6">
          <div>
            <p className="text-xs font-mono text-[var(--color-primary)] tracking-widest uppercase mb-1">
              Phase 03 · Simulator
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">
              Interview Simulator
            </h1>
            {totalCount > 0 && (
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                {totalCount} questions across {trackNames.length} tracks — tailored to your resume and JD.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? <Spinner className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              Regenerate
            </Button>
            <Button>
              <Video className="h-4 w-4" />
              Start Mock Interview
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex gap-6 px-8 pb-8 overflow-hidden min-h-0">
          {/* Left sidebar - tracks */}
          <div className="w-52 shrink-0 flex flex-col gap-4">
            {/* Tracks */}
            <div>
              <p className="text-[10px] font-mono text-[var(--color-muted-foreground)] tracking-widest uppercase mb-2 px-2">
                Tracks
              </p>
              <div className="flex flex-col gap-1">
                {trackNames.map((track) => {
                  const count = tracks[track]?.length ?? 0;
                  const isActive = currentTrack === track;
                  return (
                    <button
                      key={track}
                      onClick={() => setActiveTrack(track)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 w-full text-left",
                        isActive
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                          : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                      )}
                    >
                      <span className="truncate">{track}</span>
                      <span
                        className={cn(
                          "text-xs font-mono ml-2 px-1.5 py-0.5 rounded",
                          isActive
                            ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                            : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coverage */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted-foreground)] tracking-widest uppercase">
                  <Target className="h-3 w-3" />
                  Coverage
                </div>
                <span className="text-lg font-bold text-[var(--color-foreground)]">{coveragePct}%</span>
              </div>
              <Progress value={coveragePct} />
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                {preparedCount} / {totalCount} Prepared
              </p>
            </Card>
          </div>

          {/* Questions list */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                <p className="text-[var(--color-muted-foreground)]">No questions yet.</p>
                <Button onClick={() => navigate("/analysis")}>Go back to Analysis</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredQuestions.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} onMark={handleMark} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
