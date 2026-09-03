# Contributing

## Setup

Use Node.js 20 and copy each package's `.env.example` to `.env`. Start PostgreSQL with `docker compose up -d postgres`, then run `npm install` in `server` and `web`, `npm --prefix server run prisma:migrate`, and `make dev`.

## Quality checks

Run `make lint test build` before opening a pull request. Keep API behavior covered with Jest/Supertest and UI behavior covered with Vitest/Testing Library. Never commit credentials, generated coverage, build output, or local `.env` files.

Commits should be focused and explain why a change exists. Husky runs lint-staged on staged TypeScript and React files after `npm install` at the repository root.
