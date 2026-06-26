# Interview Prep Platform

This is a monorepo for the Interview Prep Platform containing the API server and the Web frontend.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development servers:**
   ```bash
   pnpm dev
   ```
   This will start both the API server and the Web application concurrently.

## Project Structure

This project uses a monorepo structure managed by `pnpm` workspaces. It includes the following packages:

- `@workspace/api-server`: Backend API server
- `@workspace/interview-prep`: Frontend Web application
- `@workspace/db`: Database schema, configuration, and migrations
- `@workspace/api-spec`: OpenAPI specifications and code generation tools

## Available Scripts (from Root)

- `pnpm dev`: Starts both API and WEB servers concurrently.
- `pnpm db:push`: Pushes database schema changes.
- `pnpm db:migrate:auth`: Runs the authentication migration script.
- `pnpm db:generate`: Generates database migrations.
- `pnpm codegen`: Generates code based on the OpenAPI specifications.
