# Full-stack Quiz App (Hono + Next.js + Tailwind)

## Overview
A small quiz application demonstrating end-to-end functionality:
- Backend: Hono running as Cloudflare Worker (mock data).
- Frontend: Next.js (App Router) + TailwindCSS hosted on Vercel.
- Features: text / radio / checkbox questions, grading endpoint, deterministic shuffling, unit tests for grading logic.

## Quick start (local)
1. Clone repo
2. Install
   - frontend: `cd frontend && npm install`
   - backend: `cd backend && npm install`
3. Dev
   - Frontend: `npm run dev` (Next.js)
   - Backend: `wrangler dev` (Cloudflare Worker)
4. Tests: `npm run test` (in root where vitest configured)

## Architecture notes
- **Backend**: runs on Cloudflare Workers (edge). Uses Hono + zod for validation. Reason: Workers give cheap global edge functions and Hono is lightweight.
- **Frontend**: Next.js App Router for modern routing and server/client components. Client actions (quiz UI) are client components.
- **Shared**: grading logic extracted into `lib/grade.ts` and unit-tested (Vitest).

## Validation approach
- `zod` validates input shape for `POST /api/grade`. Invalid payloads return `400`.
- Backend checks types and returns `500` on unexpected server errors.
- Frontend handles fetch errors and shows a friendly message.s

## Libraries used
- Backend: `hono`, `zod`
- Frontend: `next`, `react`, `tailwindcss`
Rationale: lightweight, clear validation, and fast iterations.

## Trade-offs / shortcuts
- Uses in-memory mock data (requirement).
- Simple text normalization for text answers (trim + lowercase).
- No persistence; submissions are graded statelessly.
- No user accounts or authentication (spec constraint).

## Deployment
- Frontend: Deploy Next.js app to Vercel (connect GitHub repo).
- Backend: Deploy `src/index.ts` as a Cloudflare Worker using `wrangler publish`.
  - Example `wrangler.toml` config will be in `/backend`.

## Honest time spent
- 15 hours

