const { config } = require("dotenv");
const { resolve } = require("path");

// Load DATABASE_URL from api-server .env so drizzle-kit CLI can connect
config({ path: resolve(__dirname, "../../artifacts/api-server/.env") });

/** @type {import("drizzle-kit").Config} */
module.exports = {
  schema: "./src/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
