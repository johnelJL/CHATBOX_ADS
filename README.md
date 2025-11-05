# ClassifAI Cars

Production-ready MVP for AI-assisted car classifieds inspired by xe.gr. Built with Next.js 14, Prisma, and OpenAI vision workflows.

## Features

- Email/Google authentication via Auth.js
- 3-step listing wizard with AI chat powered field extraction and copywriting
- PostgreSQL search with filters and trigram text search scaffolding
- Listing detail pages with contact relay and safety tips
- Admin moderation queue with AI safety flags
- Prisma schema + seed script for 20 demo cars
- Tailwind CSS UI with responsive layouts and i18n scaffolding
- Rate limiting, structured logging, and storage abstraction
- Vitest unit tests and Playwright smoke test

## Getting started

### Requirements

- Node.js 18+
- pnpm
- Docker

### Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL via Docker Compose:

   ```bash
   docker compose up -d
   ```

   > **Tip:** On older Docker Desktop installs that still ship the legacy
   > `docker-compose` binary, run `docker-compose up -d` instead. The error
   > `unknown shorthand flag: 'd'` means your CLI has not enabled the
   > `docker compose` subcommand yet.

3. Install dependencies and run migrations:

   ```bash
   pnpm install
   pnpm prisma migrate dev
   pnpm seed
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

5. Visit `http://localhost:3000` to explore the app.

### Tests

- Unit tests: `pnpm test`
- E2E smoke test: `pnpm test:e2e`
- Install dependencies first with `pnpm install`. If you are behind a proxy that blocks access to `registry.npmjs.org`, configure your npm proxy credentials or mirror before running the test commands.

### AI configuration

Set `OPENAI_API_KEY` in your `.env`. The AI service layer wraps OpenAI function-calling for field extraction and ad copy. Swap providers by implementing the same interface in `ai/`.

### Storage & email

The default storage adapter writes to `storage/uploads`. For production, supply S3-compatible credentials (`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`). Email relay uses SMTP credentials provided via env vars.

### Rate limiting

Ratelimits rely on Upstash Redis env variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Without them, rate limiting gracefully no-ops.

### Analytics

`lib/analytics.ts` contains a console-based adapter. Replace with your analytics provider as needed.
