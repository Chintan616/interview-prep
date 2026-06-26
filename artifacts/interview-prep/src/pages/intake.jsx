import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Save, Play, Upload, FileText, Loader2, X, AlignLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateSession, useUpdateSession, useAnalyzeSession, useParseResume } from "@workspace/api-spec";
import { useSession } from "@/lib/session-context";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Years" },
  { value: "0-1 years", label: "0–1 years" },
  { value: "1-3 years", label: "1–3 years" },
  { value: "3-5 years", label: "3–5 years" },
  { value: "5-8 years", label: "5–8 years" },
  { value: "8+ years", label: "8+ years" },
];

const SENIORITY_OPTIONS = [
  { value: "", label: "Level" },
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff" },
  { value: "principal", label: "Principal" },
];

export function IntakePage() {
  const [, navigate] = useLocation();
  const { setSessionId } = useSession();

  const [targetRole, setTargetRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [seniority, setSeniority] = useState("");
  const [jobPostingUrl, setJobPostingUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jdTab, setJdTab] = useState("text");
  const [jdFileName, setJdFileName] = useState("");
  const [jdIsDragging, setJdIsDragging] = useState(false);
  const [resumeTab, setResumeTab] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const analyzeSession = useAnalyzeSession();
  const parseResume = useParseResume();
  const parseJd = useParseResume();

  // Resume PDF handler
  const handleFileDrop = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const result = await parseResume.mutateAsync(formData);
      setResumeText(result.text);
      setResumeFileName(result.fileName);
    } catch (err) {
      console.error("PDF parse error", err);
    }
  }, [parseResume]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileDrop(file);
  }, [handleFileDrop]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFileDrop(file);
  }, [handleFileDrop]);

  // Job description PDF handler
  const handleJdFileDrop = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const result = await parseJd.mutateAsync(formData);
      setJobDescription(result.text);
      setJdFileName(result.fileName);
      setJdTab("text"); // switch to text view to show extracted content
    } catch (err) {
      console.error("JD PDF parse error", err);
    }
  }, [parseJd]);

  const handleJdDrop = useCallback((e) => {
    e.preventDefault();
    setJdIsDragging(false);
    handleJdFileDrop(e.dataTransfer.files[0]);
  }, [handleJdFileDrop]);

  const handleJdFileChange = useCallback((e) => {
    handleJdFileDrop(e.target.files[0]);
  }, [handleJdFileDrop]);

  const buildPayload = () => ({
    targetRole,
    jobDescription,
    experienceYears: experienceYears || undefined,
    seniority: seniority || undefined,
    jobPostingUrl: jobPostingUrl || undefined,
    resumeText: resumeText || undefined,
    resumeFileName: resumeFileName || undefined,
  });

  const handleSaveDraft = async () => {
    if (!targetRole || !jobDescription) return;
    setIsSaving(true);
    try {
      const session = await createSession.mutateAsync(buildPayload());
      setSessionId(session.id);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!targetRole || !jobDescription || !resumeText) return;
    setIsAnalyzing(true);
    try {
      const session = await createSession.mutateAsync(buildPayload());
      setSessionId(session.id);
      await analyzeSession.mutateAsync(session.id);
      navigate("/analysis");
    } catch (err) {
      console.error("Analysis error", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = targetRole && jobDescription && resumeText && !isAnalyzing;

  return (
    <PageLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6">
          <div>
            <p className="text-xs font-mono text-[var(--color-primary)] tracking-widest uppercase mb-1">
              Phase 01 · Intake
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">
              Analyze & Prepare
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={!targetRole || !jobDescription || isSaving}>
              {isSaving ? <Spinner className="h-3 w-3" /> : <Save className="h-4 w-4" />}
              Save Draft
            </Button>
            <Button onClick={handleRunAnalysis} disabled={!canAnalyze}>
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 pb-8 grid grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Role Context */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="w-0.5 h-4 bg-[var(--color-primary)] rounded-full" />
                  Role Context
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">
                    Target Role
                  </label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">
                      Experience
                    </label>
                    <Select value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">
                      Seniority
                    </label>
                    <Select value={seniority} onChange={(e) => setSeniority(e.target.value)}>
                      {SENIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">
                    Job Posting URL <span className="normal-case text-[var(--color-muted-foreground)]/60">(Optional)</span>
                  </label>
                  <Input
                    placeholder="https://..."
                    value={jobPostingUrl}
                    onChange={(e) => setJobPostingUrl(e.target.value)}
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resume Material */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>
                  <span className="w-0.5 h-4 bg-[var(--color-primary)] rounded-full" />
                  Resume Material
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-[var(--color-muted)] rounded-lg p-1">
                  {["upload", "paste"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setResumeTab(tab)}
                      className={cn(
                        "flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                        resumeTab === tab
                          ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm"
                          : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                      )}
                    >
                      {tab === "upload" ? "Upload File" : "Paste Text"}
                    </button>
                  ))}
                </div>

                {resumeTab === "upload" ? (
                  <>
                    {resumeFileName ? (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--color-foreground)]">{resumeFileName}</p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">
                              {resumeText.length.toLocaleString()} characters extracted
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setResumeFileName(""); setResumeText(""); }}
                          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-150 flex flex-col items-center gap-3",
                          isDragging
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-muted)]"
                        )}
                      >
                        {parseResume.isPending ? (
                          <Spinner className="h-8 w-8" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-[var(--color-primary)]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[var(--color-foreground)]">
                            {parseResume.isPending ? "Parsing PDF..." : "Drop your resume here"}
                          </p>
                          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                            PDF, DOCX, TXT up to 5MB
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Textarea
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[200px] font-mono text-xs"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Job Description */}
          <div className="flex flex-col bg-[#0d0d0f] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-primary)]/20 transition-colors">
            {/* Terminal chrome bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[#111113]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <p className="text-[11px] font-mono text-[var(--color-muted-foreground)] tracking-widest uppercase">
                Job Description
              </p>
              {/* Mode toggle */}
              <div className="flex items-center gap-0.5 bg-[var(--color-muted)] rounded-md p-0.5">
                <button
                  onClick={() => setJdTab("text")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                    jdTab === "text"
                      ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  )}
                >
                  <AlignLeft className="h-3 w-3" />
                  Text
                </button>
                <button
                  onClick={() => setJdTab("pdf")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                    jdTab === "pdf"
                      ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  )}
                >
                  <FileText className="h-3 w-3" />
                  PDF
                </button>
              </div>
            </div>

            {jdTab === "text" ? (
              <>
                {/* Editor body */}
                <div className="flex-1 flex p-4 gap-3 min-h-0">
                  {/* Line numbers */}
                  <div className="flex flex-col items-end gap-[1px] select-none pt-0.5 min-w-[2rem]">
                    {Array.from({ length: Math.max(20, (jobDescription.match(/\n/g) ?? []).length + 2) }, (_, i) => (
                      <span key={i} className="text-[11px] font-mono text-[var(--color-border)] leading-5">
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  {/* Textarea */}
                  <textarea
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="flex-1 bg-transparent border-0 outline-none resize-none font-mono text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-border)] leading-5 min-h-[400px]"
                    spellCheck={false}
                  />
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[#111113]">
                  <span className="text-[10px] font-mono text-[var(--color-muted-foreground)]">
                    {jdFileName ? (
                      <span className="text-[var(--color-primary)]">Extracted from: {jdFileName}</span>
                    ) : (
                      jobDescription ? `${jobDescription.split("\n").length} lines` : "No content"
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-muted-foreground)]">
                    {jobDescription.length > 0 ? `${jobDescription.length} chars` : "Plain Text"}
                  </span>
                </div>
              </>
            ) : (
              /* PDF upload panel */
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                {jdFileName ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 rounded-xl p-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-foreground)]">{jdFileName}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                          {jobDescription.length.toLocaleString()} characters extracted
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setJdFileName(""); setJobDescription(""); }}
                      className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setJdIsDragging(true); }}
                    onDragLeave={() => setJdIsDragging(false)}
                    onDrop={handleJdDrop}
                    onClick={() => jdFileInputRef.current?.click()}
                    className={cn(
                      "w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-150 flex flex-col items-center gap-4",
                      jdIsDragging
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-white/2"
                    )}
                  >
                    {parseJd.isPending ? (
                      <Spinner className="h-10 w-10" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {parseJd.isPending ? "Parsing PDF..." : "Drop job description PDF here"}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                        PDF up to 5MB · Text is extracted automatically
                      </p>
                    </div>
                    <input
                      ref={jdFileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleJdFileChange}
                    />
                  </div>
                )}

                {!jdFileName && (
                  <p className="text-xs text-[var(--color-muted-foreground)] text-center">
                    After extraction, switch to{" "}
                    <button onClick={() => setJdTab("text")} className="text-[var(--color-primary)] hover:underline">
                      Text view
                    </button>{" "}
                    to review and edit the content.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span>System Ready · Avg Analysis: ~14s</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Signals: 120+</span>
            <span>Questions: 25</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
