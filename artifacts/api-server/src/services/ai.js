import { groq, MODEL } from "../lib/groq.js";
import { logger } from "../lib/logger.js";

// Normalize curly/smart quotes and other common LLM JSON quirks to straight ASCII
function sanitizeJson(raw) {
  return raw
    .replace(/[‘’]/g, "'")   // curly single quotes → '
    .replace(/[“”]/g, '"')   // curly double quotes → "
    .replace(/[–—]/g, "-")   // en/em dash → -
    .replace(/\r\n/g, "\n");
}

// Extract JSON robustly: strip markdown fences first, then find the outermost object/array
function extractJson(raw, type = "object") {
  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceStripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  const sanitized = sanitizeJson(fenceStripped);

  if (type === "array") {
    // Find the outermost [ ... ] non-greedy from first [ to its matching ]
    const start = sanitized.indexOf("[");
    if (start === -1) throw new Error("No JSON array found");
    let depth = 0;
    let end = -1;
    for (let i = start; i < sanitized.length; i++) {
      if (sanitized[i] === "[") depth++;
      else if (sanitized[i] === "]") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) throw new Error("Unterminated JSON array");
    return sanitized.slice(start, end + 1);
  } else {
    // Find the outermost { ... }
    const start = sanitized.indexOf("{");
    if (start === -1) throw new Error("No JSON object found");
    let depth = 0;
    let end = -1;
    let inString = false;
    let escape = false;
    for (let i = start; i < sanitized.length; i++) {
      const ch = sanitized[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) throw new Error("Unterminated JSON object");
    return sanitized.slice(start, end + 1);
  }
}

export async function runAnalysis({ resumeText, jobDescription, targetRole, seniority, experienceYears }) {
  const resumeSnippet = truncate(resumeText, 4000);
  const jdSnippet = truncate(jobDescription, 3000);

  const systemPrompt = `You are a strict ATS expert. You MUST respond with ONLY valid JSON — no markdown, no explanation, no code blocks.`;

  const userPrompt = `Analyze this resume against the job description. Return ONLY a JSON object.

RESUME:
${resumeSnippet}

JOB DESCRIPTION:
${jdSnippet}

TARGET ROLE: ${targetRole}
SENIORITY: ${seniority || "not specified"}
EXPERIENCE: ${experienceYears || "not specified"}

Return this exact JSON structure with no other text:
{
  "atsScore": <integer 0-100>,
  "potentialScore": <integer 0-100>,
  "scores": {
    "keywordMatch": <integer 0-100>,
    "formatting": <integer 0-100>,
    "quantifiedImpact": <integer 0-100>,
    "roleAlignment": <integer 0-100>,
    "senioritSignals": <integer 0-100>
  },
  "matchedSkills": ["skill1", "skill2"],
  "partialSkills": ["skill1"],
  "missingSkills": ["skill1"],
  "bulletOptimizations": [
    {
      "context": "section name",
      "current": "original bullet text",
      "optimized": "improved bullet text",
      "reason": "why this improves ATS",
      "injectedSignals": ["keyword1", "keyword2"]
    }
  ],
  "strategicDirection": "2-3 sentence strategic advice"
}

Rules:
- atsScore: strict keyword-only count, 0-100
- potentialScore: achievable score after optimizations
- 3-5 bullet optimizations for the most impactful entries
- All skill arrays: lowercase short strings
- Do NOT wrap in markdown. Output raw JSON only.`;

  logger.info({ targetRole }, "Running AI analysis");

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content.trim();
  logger.debug({ rawLength: raw.length }, "AI analysis raw response received");

  try {
    const jsonStr = extractJson(raw, "object");
    return JSON.parse(jsonStr);
  } catch (err) {
    logger.error({ err, raw: raw.slice(0, 500) }, "Failed to parse analysis JSON");
    throw new Error("AI returned invalid JSON for analysis");
  }
}

// Groq free tier: 12,000 TPM. Budget: ~2,500 input tokens + 8,000 output tokens.
// 1 token ≈ 4 chars. So cap resume at 3,500 chars (~875 tokens) and JD at 3,000 chars (~750 tokens).
function truncate(text, maxChars) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n[truncated for token budget]";
}

export async function runQuestionGeneration({ resumeText, jobDescription, targetRole, seniority, experienceYears, analysis }) {
  const resumeSnippet = truncate(resumeText, 3500);
  const jdSnippet = truncate(jobDescription, 3000);

  const systemPrompt = `You are a senior technical interview coach with 15+ years of experience preparing candidates at top tech companies. You MUST respond with ONLY a valid JSON array — no markdown, no explanation, no code blocks.`;

  const userPrompt = `Generate exactly 20 deeply personalized interview questions for the candidate below. Return ONLY a JSON array.

RESUME:
${resumeSnippet}

JOB DESCRIPTION:
${jdSnippet}

TARGET ROLE: ${targetRole}
SENIORITY: ${seniority || "not specified"}
EXPERIENCE: ${experienceYears || "not specified"}

ATS ANALYSIS:
- Matched Skills: ${(analysis.matchedSkills || []).join(", ")}
- Partial Skills: ${(analysis.partialSkills || []).join(", ")}
- Missing Skills: ${(analysis.missingSkills || []).join(", ")}

Dynamically derive 4-6 tracks based on the actual role and JD content. Distribute 20 questions across tracks.

Return this exact JSON array with no other text:
[
  {
    "track": "track name",
    "difficulty": "Easy",
    "probability": "High probability",
    "question": "A specific, detailed interview question (1-2 sentences, not generic)",
    "whyThisQuestion": "2-3 sentences explaining exactly why an interviewer would ask this — reference specific skills from the resume or requirements from the JD. Be concrete, not vague.",
    "suggestedFramework": "2-3 sentences describing the ideal answer structure. For behavioral: explain the STAR method applied to this specific question. For technical: describe the step-by-step approach, key concepts to cover, and how to demonstrate depth.",
    "talkingPoints": [
      "A specific, actionable talking point (1 full sentence, not just a keyword)",
      "Another concrete point the candidate must address in their answer",
      "A third point covering edge cases, trade-offs, or real-world nuance",
      "Optional fourth point for depth (metrics, comparisons, lessons learned)"
    ],
    "skillsToMention": ["specific skill from resume or JD"],
    "tags": ["technology or concept tag"]
  }
]

STRICT RULES:
- EXACTLY 20 questions in the array
- difficulty: Easy, Medium, or Hard only
- probability: High probability, Medium probability, or Low probability only
- "question": must be specific to the candidate's resume and JD — never generic
- "whyThisQuestion": minimum 2 sentences — explain the interviewer's intent with reference to resume/JD specifics
- "suggestedFramework": minimum 2 sentences — give a concrete answer roadmap, not just a label like "STAR" or "Technical approach"
- "talkingPoints": minimum 3 items, each a FULL SENTENCE (10+ words) describing what to say — not just topic labels
- Do NOT use vague phrases like "discuss your experience" or "explain your approach" — be specific
- Do NOT wrap in markdown. Output raw JSON array only.`;

  logger.info({ targetRole }, "Running AI question generation");

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 7500,
  });

  const raw = completion.choices[0].message.content.trim();
  logger.debug({ rawLength: raw.length }, "AI questions raw response received");

  try {
    const jsonStr = extractJson(raw, "array");
    const questions = JSON.parse(jsonStr);
    if (!Array.isArray(questions)) throw new Error("Expected JSON array");
    return questions.slice(0, 20);
  } catch (err) {
    logger.error({ err, raw: raw.slice(0, 500) }, "Failed to parse questions JSON");
    throw new Error("AI returned invalid JSON for questions");
  }
}
