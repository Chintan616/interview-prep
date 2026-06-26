import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { eq } from "drizzle-orm";
import { db, users } from "@workspace/db";
import { signToken, authenticate } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

export const authRouter = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:8080";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        // Upsert user
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.googleId, profile.id));

        let user;
        if (existing.length > 0) {
          [user] = await db
            .update(users)
            .set({ name, avatar })
            .where(eq(users.googleId, profile.id))
            .returning();
        } else {
          [user] = await db
            .insert(users)
            .values({ googleId: profile.id, email, name, avatar })
            .returning();
          logger.info({ userId: user.id, email }, "New user registered via Google");
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// Kick off Google OAuth
authRouter.get(
  "/auth/google",
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

// Google OAuth callback — issue JWT and redirect to frontend
authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = signToken({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
    });
    // Redirect to frontend with token in URL fragment (never logged by servers)
    res.redirect(`${FRONTEND_URL}/auth/callback#token=${token}`);
  }
);

// GET /api/auth/me
authRouter.get("/auth/me", authenticate, async (req, res, next) => {
  try {
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, avatar: users.avatar, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout (client-side; just returns 200)
authRouter.post("/auth/logout", (req, res) => {
  res.json({ ok: true });
});
