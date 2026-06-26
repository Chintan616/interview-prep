import { Router } from "express";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { db, sessions, analyses, questions } from "@workspace/db";
import { runAnalysis, runQuestionGeneration } from "../services/ai.js";
import { authenticate } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

export const sessionsRouter = Router();

// All session routes require authentication
sessionsRouter.use(authenticate);

const createSessionSchema = z.object({
  targetRole: z.string().min(1),
  jobDescription: z.string().min(1),
  experienceYears: z.string().optional(),
  seniority: z.string().optional(),
  jobPostingUrl: z.string().url().optional().or(z.literal("")),
  resumeText: z.string().optional(),
  resumeFileName: z.string().optional(),
});

const updateSessionSchema = z.object({
  targetRole: z.string().min(1).optional(),
  jobDescription: z.string().optional(),
  experienceYears: z.string().optional(),
  seniority: z.string().optional(),
  jobPostingUrl: z.string().optional(),
  resumeText: z.string().optional(),
  resumeFileName: z.string().optional(),
  status: z.enum(["draft", "analyzing", "analyzed", "generating", "ready"]).optional(),
});

// GET /sessions — scoped to logged-in user
sessionsRouter.get("/sessions", async (req, res, next) => {
  try {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, req.user.id))
      .orderBy(desc(sessions.createdAt));

    const withScores = await Promise.all(
      userSessions.map(async (s) => {
        const [analysis] = await db
          .select({ atsScore: analyses.atsScore, potentialScore: analyses.potentialScore })
          .from(analyses)
          .where(eq(analyses.sessionId, s.id));
        return { ...s, atsScore: analysis?.atsScore ?? null, potentialScore: analysis?.potentialScore ?? null };
      })
    );

    res.json(withScores);
  } catch (err) {
    next(err);
  }
});

// POST /sessions
sessionsRouter.post("/sessions", async (req, res, next) => {
  try {
    const input = createSessionSchema.parse(req.body);
    const [session] = await db
      .insert(sessions)
      .values({
        userId: req.user.id,
        targetRole: input.targetRole,
        jobDescription: input.jobDescription,
        experienceYears: input.experienceYears,
        seniority: input.seniority,
        jobPostingUrl: input.jobPostingUrl || null,
        resumeText: input.resumeText,
        resumeFileName: input.resumeFileName,
        status: "draft",
      })
      .returning();

    logger.info({ sessionId: session.id, userId: req.user.id }, "Session created");
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// DELETE /sessions/:id
sessionsRouter.delete("/sessions/:id", async (req, res, next) => {
  try {
    const [deleted] = await db
      .delete(sessions)
      .where(and(eq(sessions.id, req.params.id), eq(sessions.userId, req.user.id)))
      .returning({ id: sessions.id });

    if (!deleted) return res.status(404).json({ error: "Session not found" });
    res.json({ id: deleted.id });
  } catch (err) {
    next(err);
  }
});

// GET /sessions/:id
sessionsRouter.get("/sessions/:id", async (req, res, next) => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, req.params.id));

    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// PATCH /sessions/:id
sessionsRouter.patch("/sessions/:id", async (req, res, next) => {
  try {
    const input = updateSessionSchema.parse(req.body);
    const [session] = await db
      .update(sessions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sessions.id, req.params.id))
      .returning();

    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// POST /sessions/:id/analyze
sessionsRouter.post("/sessions/:id/analyze", async (req, res, next) => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, req.params.id));

    if (!session) return res.status(404).json({ error: "Session not found" });
    if (!session.resumeText) return res.status(400).json({ error: "Resume text is required for analysis" });

    await db
      .update(sessions)
      .set({ status: "analyzing", updatedAt: new Date() })
      .where(eq(sessions.id, session.id));

    const analysisData = await runAnalysis({
      resumeText: session.resumeText,
      jobDescription: session.jobDescription,
      targetRole: session.targetRole,
      seniority: session.seniority,
      experienceYears: session.experienceYears,
    });

    await db.delete(analyses).where(eq(analyses.sessionId, session.id));

    const [savedAnalysis] = await db
      .insert(analyses)
      .values({
        sessionId: session.id,
        atsScore: analysisData.atsScore,
        potentialScore: analysisData.potentialScore,
        scores: analysisData.scores,
        matchedSkills: analysisData.matchedSkills,
        partialSkills: analysisData.partialSkills,
        missingSkills: analysisData.missingSkills,
        bulletOptimizations: analysisData.bulletOptimizations,
        strategicDirection: analysisData.strategicDirection,
      })
      .returning();

    await db
      .update(sessions)
      .set({ status: "analyzed", updatedAt: new Date() })
      .where(eq(sessions.id, session.id));

    logger.info({ sessionId: session.id, atsScore: savedAnalysis.atsScore }, "Analysis complete");
    res.json(savedAnalysis);
  } catch (err) {
    await db
      .update(sessions)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(sessions.id, req.params.id))
      .catch(() => {});
    next(err);
  }
});

// GET /sessions/:id/analysis
sessionsRouter.get("/sessions/:id/analysis", async (req, res, next) => {
  try {
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.sessionId, req.params.id));

    if (!analysis) return res.status(404).json({ error: "Analysis not found" });
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// POST /sessions/:id/questions
sessionsRouter.post("/sessions/:id/questions", async (req, res, next) => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, req.params.id));

    if (!session) return res.status(404).json({ error: "Session not found" });

    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.sessionId, session.id));

    if (!analysis) return res.status(400).json({ error: "Run analysis first" });

    await db
      .update(sessions)
      .set({ status: "generating", updatedAt: new Date() })
      .where(eq(sessions.id, session.id));

    const questionData = await runQuestionGeneration({
      resumeText: session.resumeText,
      jobDescription: session.jobDescription,
      targetRole: session.targetRole,
      seniority: session.seniority,
      experienceYears: session.experienceYears,
      analysis,
    });

    await db.delete(questions).where(eq(questions.sessionId, session.id));

    const toInsert = questionData.map((q, i) => ({
      sessionId: session.id,
      track: q.track,
      difficulty: q.difficulty,
      probability: q.probability,
      question: q.question,
      whyThisQuestion: q.whyThisQuestion,
      suggestedFramework: q.suggestedFramework,
      talkingPoints: q.talkingPoints ?? [],
      skillsToMention: q.skillsToMention ?? [],
      tags: q.tags ?? [],
      isPrepared: false,
      sortOrder: i,
    }));

    const savedQuestions = await db.insert(questions).values(toInsert).returning();

    await db
      .update(sessions)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(sessions.id, session.id));

    logger.info({ sessionId: session.id, count: savedQuestions.length }, "Questions generated");
    res.json(savedQuestions);
  } catch (err) {
    await db
      .update(sessions)
      .set({ status: "analyzed", updatedAt: new Date() })
      .where(eq(sessions.id, req.params.id))
      .catch(() => {});
    next(err);
  }
});

// GET /sessions/:id/questions
sessionsRouter.get("/sessions/:id/questions", async (req, res, next) => {
  try {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.sessionId, req.params.id))
      .orderBy(questions.sortOrder);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /sessions/:id/questions/:qid/mark
sessionsRouter.patch("/sessions/:id/questions/:qid/mark", async (req, res, next) => {
  try {
    const [current] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, req.params.qid));

    if (!current) return res.status(404).json({ error: "Question not found" });

    const [updated] = await db
      .update(questions)
      .set({ isPrepared: !current.isPrepared })
      .where(eq(questions.id, req.params.qid))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});
