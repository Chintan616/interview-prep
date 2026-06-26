import jwt from "jsonwebtoken";
import { logger } from "../lib/logger.js";

const JWT_SECRET = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Attaches req.user if a valid Bearer token is present; 401s otherwise
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch (err) {
    logger.warn({ err: err.message }, "Invalid JWT");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Same as authenticate but does not block unauthenticated requests
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = verifyToken(header.slice(7));
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
