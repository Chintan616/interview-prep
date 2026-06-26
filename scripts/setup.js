#!/usr/bin/env node
// Run with: node scripts/setup.js
// Creates the .env file for the api-server if it doesn't exist

import { existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../artifacts/api-server/.env");

if (existsSync(envPath)) {
  console.log(".env already exists at", envPath);
} else {
  writeFileSync(
    envPath,
    `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interview_prep
GROQ_API_KEY=gsk_your_key_here
SESSION_SECRET=${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}
PORT=8080
`
  );
  console.log("Created .env at", envPath);
  console.log("Edit it to add your real DATABASE_URL and GROQ_API_KEY before starting the server.");
}
