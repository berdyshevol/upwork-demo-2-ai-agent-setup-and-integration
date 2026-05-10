# AgentDesk — AI Agent Control Panel

A deployable Next.js prototype that demonstrates an end-to-end AI email
triage agent: the agent classifies incoming messages, drafts replies, and
logs every action — all wired together through the LLM, an internal API,
and a small inbox UI.

## What this demonstrates

- **Inbox** with five seeded emails covering support, sales, billing, spam,
  and scheduling.
- **Run agent** button that POSTs to `/api/agent/run`. The route iterates
  over pending emails, calls the LLM (OpenAI `gpt-4o-mini` if
  `OPENAI_API_KEY` is set, otherwise a deterministic rules-based fallback
  so the demo works offline), and writes back a category, confidence, and
  draft reply for each.
- **Email detail view** with the original message, classification badge,
  and an editable draft. Hitting **Send** flips the email to `handled` and
  surfaces a toast — no real SMTP, true to the demo scope.
- **Activity page** with run history (start time, duration, model, token
  totals) and a list of every draft the agent has produced.

## Tech

- Next.js 15 App Router + TypeScript + Tailwind
- React 19 RC
- In-memory store (module singleton on `globalThis`) — no native deps,
  Vercel-compatible. State resets on cold start, which is fine for a demo.
- LLM call goes directly to `https://api.openai.com/v1/chat/completions`
  via `fetch` — no SDK to keep the bundle slim.

## Run locally

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Optional — set a key to swap the fallback for the real LLM:

```bash
export OPENAI_API_KEY=sk-...
pnpm dev
```

## Build

```bash
pnpm build
pnpm start
```

## Deploy

Deploys cleanly to Vercel out of the box. The only env var the live demo
honors is `OPENAI_API_KEY`; without it, the deterministic fallback agent
still produces realistic classifications and drafts so the URL is
demoable on day one.

Live URL: _TBD_

## Project layout

```
app/
  page.tsx                  Inbox
  email/[id]/page.tsx       Email detail + draft editor
  activity/page.tsx         Run history & metrics
  api/agent/run/route.ts    POST — runs the agent over pending emails
  api/email/[id]/route.ts   PATCH — save draft / mark handled
components/                 Toast, EmailRow, RunAgentButton, DraftEditor
lib/
  agent.ts                  classifyAndDraft (OpenAI + rules fallback)
  store.ts                  In-memory data store
  seed.ts                   Five seeded emails
  types.ts, format.ts
```
