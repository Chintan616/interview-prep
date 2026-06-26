import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessionStatusEnum = pgEnum("session_status", [
  "draft",
  "analyzing",
  "analyzed",
  "generating",
  "ready",
]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  targetRole: text("target_role").notNull(),
  experienceYears: text("experience_years"),
  seniority: text("seniority"),
  jobDescription: text("job_description").notNull(),
  jobPostingUrl: text("job_posting_url"),
  resumeText: text("resume_text"),
  resumeFileName: text("resume_file_name"),
  status: sessionStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  atsScore: integer("ats_score"),
  potentialScore: integer("potential_score"),
  scores: jsonb("scores"),
  matchedSkills: jsonb("matched_skills"),
  partialSkills: jsonb("partial_skills"),
  missingSkills: jsonb("missing_skills"),
  bulletOptimizations: jsonb("bullet_optimizations"),
  strategicDirection: text("strategic_direction"),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  track: text("track"),
  difficulty: text("difficulty"),
  probability: text("probability"),
  question: text("question"),
  whyThisQuestion: text("why_this_question"),
  suggestedFramework: text("suggested_framework"),
  talkingPoints: jsonb("talking_points"),
  skillsToMention: jsonb("skills_to_mention"),
  tags: jsonb("tags"),
  isPrepared: boolean("is_prepared").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});
