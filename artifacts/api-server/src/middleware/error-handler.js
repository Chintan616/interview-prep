import { logger } from "../lib/logger.js";

export function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path }, "Unhandled error");

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Validation error", details: err.flatten() });
  }

  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ error: message });
}
