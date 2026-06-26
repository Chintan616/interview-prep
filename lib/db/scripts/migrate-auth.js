#!/usr/bin/env node
/**
 * Run with: node lib/db/scripts/migrate-auth.js
 * Adds the users table and user_id FK to sessions.
 */
import { createRequire } from "module";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { config } = require("dotenv");

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../artifacts/api-server/.env") });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  console.log("Running auth migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id   TEXT NOT NULL UNIQUE,
      email       TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      avatar      TEXT,
      created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ users table ready");

  await sql`
    ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS user_id UUID
      REFERENCES users(id) ON DELETE CASCADE
  `;
  console.log("✓ sessions.user_id column ready");

  await sql.end();
  console.log("Migration complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
