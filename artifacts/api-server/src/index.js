import express from "express";
import cors from "cors";
import passport from "passport";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import { healthRouter } from "./routes/health.js";
import { resumeRouter } from "./routes/resume.js";
import { sessionsRouter } from "./routes/sessions.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = Number(process.env.PORT ?? 8080);

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(pinoHttp({ logger }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Mount all routes under /api
app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", resumeRouter);
app.use("/api", sessionsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "API server started");
});
