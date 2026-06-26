import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Play, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { useGetAnalysis, useGetSession, useGenerateQuestions } from "@workspace/api-spec";
import { useSession } from "@/lib/session-context";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function ScoreGauge({ score, potentialScore }) {
  const data = [{ value: score, fill: "#00d4a0" }];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-xs font-mono text-[var(--color-muted-foreground)] tracking-widest uppercase">
        Overall Fit Score
      </p>
      <div className="relative w-52 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            data={data}
            startAngle={220}
            endAngle={-40}
            barSize={12}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "#27272a" }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-5xl font-bold text-[var(--color-foreground)]"
          >
            {score}
          </motion.span>
          <span className="text-sm text-[var(--color-muted-foreground)]">/ 100</span>
        </div>
      </div>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Potential score after optimization:{" "}
        <span className="text-[var(--color-primary)] font-semibold">{potentialScore}</span>
      </p>
    </div>
  );
}

const SCORE_LABELS = {
  keywordMatch: "Keyword Match",
  formatting: "Formatting & Parsability",
  quantifiedImpact: "Quantified Impact",
  roleAlignment: "Role Alignment",
  senioritSignals: "Seniority Signals",
};

function getScoreColor(value) {
  if (value >= 70) return "bg-[var(--color-success)]";
  if (value >= 40) return "bg-[var(--color-warning)]";
  return "bg-[var(--color-destructive)]";
}

function BulletOptimizationCard({ optimization }) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-[var(--color-muted)] border-b border-[var(--color-border)]">
        <p className="text-xs font-mono text-[var(--color-muted-foreground)] tracking-wide uppercase">
          {optimization.context}
        </p>
      </div>
      <div className="grid grid-cols-[1fr,auto,1fr] gap-0">
        <div className="p-4 border-r border-[var(--color-border)]">
          <p className="text-[10px] font-mono text-[var(--color-destructive)] uppercase tracking-widest mb-2">Current</p>
          <p className="text-sm text-[var(--color-foreground)]/80 leading-relaxed bg-[var(--color-destructive)]/5 border border-[var(--color-destructive)]/10 rounded-lg p-3">
            {optimization.current}
          </p>
        </div>
        <div className="flex items-center justify-center px-2">
          <ChevronRight className="h-4 w-4 text-[var(--color-primary)]" />
        </div>
        <div className="p-4">
          <p className="text-[10px] font-mono text-[var(--color-success)] uppercase tracking-widest mb-2">Optimized</p>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed bg-[var(--color-success)]/5 border border-[var(--color-success)]/10 rounded-lg p-3">
            {optimization.optimized}
          </p>
        </div>
      </div>
      {(optimization.injectedSignals?.length > 0 || optimization.reason) && (
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center gap-3 flex-wrap">
          {optimization.injectedSignals?.length > 0 && (
            <>
              <span className="text-xs text-[var(--color-muted-foreground)]">Injected signals:</span>
              {optimization.injectedSignals.map((signal) => (
                <Badge key={signal} className="font-mono text-[10px]">{signal}</Badge>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function AnalysisPage() {
  const [, navigate] = useLocation();
  const { sessionId } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: session } = useGetSession(sessionId);
  const { data: analysis, isLoading } = useGetAnalysis(sessionId);
  const generateQuestions = useGenerateQuestions();

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      await generateQuestions.mutateAsync(sessionId);
      navigate("/interview-prep");
    } catch (err) {
      console.error("Generate questions error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-[var(--color-muted-foreground)]">Loading analysis...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!analysis) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-[var(--color-muted-foreground)]">No analysis found.</p>
            <Button onClick={() => navigate("/")}>Go back to Intake</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const scores = analysis.scores ?? {};
  const matchedSkills = analysis.matchedSkills ?? [];
  const partialSkills = analysis.partialSkills ?? [];
  const missingSkills = analysis.missingSkills ?? [];
  const bulletOptimizations = analysis.bulletOptimizations ?? [];

  return (
    <PageLayout>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6">
          <div>
            <p className="text-xs font-mono text-[var(--color-primary)] tracking-widest uppercase mb-1">
              Phase 02 · Audit
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">
              Alignment Audit
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={handleGenerateQuestions} disabled={isGenerating}>
              {isGenerating ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {isGenerating ? "Generating..." : "Generate Questions"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 flex flex-col gap-6">
          {/* Score row */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <ScoreGauge
                  score={analysis.atsScore ?? 0}
                  potentialScore={analysis.potentialScore ?? 0}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="w-0.5 h-4 bg-[var(--color-primary)] rounded-full" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {Object.entries(SCORE_LABELS).map(([key, label]) => {
                  const val = scores[key] ?? 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--color-foreground)]">{label}</span>
                        <span className="text-sm font-mono text-[var(--color-muted-foreground)]">
                          {val}/100
                        </span>
                      </div>
                      <Progress value={val} colorClass={getScoreColor(val)} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--color-success)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {matchedSkills.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">None found</p>
                ) : (
                  matchedSkills.map((s) => (
                    <Badge key={s} variant="green">{s}</Badge>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--color-warning)]">
                  <AlertTriangle className="h-4 w-4" />
                  Partial Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {partialSkills.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">None found</p>
                ) : (
                  partialSkills.map((s) => (
                    <Badge key={s} variant="amber">{s}</Badge>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--color-destructive)]">
                  <XCircle className="h-4 w-4" />
                  Critical Gaps
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {missingSkills.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">None found</p>
                ) : (
                  missingSkills.map((s) => (
                    <Badge key={s} variant="red">{s}</Badge>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bullet Optimizations */}
          {bulletOptimizations.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
                <span className="w-0.5 h-4 bg-[var(--color-primary)] rounded-full" />
                Bullet Point Optimization
              </h2>
              <div className="flex flex-col gap-4">
                {bulletOptimizations.map((opt, i) => (
                  <BulletOptimizationCard key={i} optimization={opt} />
                ))}
              </div>
            </div>
          )}

          {/* Strategic Direction */}
          {analysis.strategicDirection && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="w-0.5 h-4 bg-[var(--color-primary)] rounded-full" />
                  Strategic Direction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {analysis.strategicDirection}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
