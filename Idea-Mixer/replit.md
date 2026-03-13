# The Idea Mixer — Replit.md

## Overview

**The Idea Mixer** is a single-page creative tool. Users add 2–6 topic "ingredients," click Mix, and Claude AI combines them into one concrete, buildable project idea — displayed as a cocktail recipe card with a name, tagline, concept description, target audience, problem statement, and 3-step build guide.

The visual metaphor: a coupe glass fills with coloured liquid layers as topics are added. Clicking Mix shakes a cocktail shaker overlay while the AI API call runs. The result is a recipe card below the input stage.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## Architecture

### Frontend
- **Pure vanilla HTML / CSS / JS** — single file at `client/index.html`
- No React, no framework, no build step for the frontend
- Served by Vite dev server in middleware mode (harmless HMR injection, no module bundling)
- Fonts: Cormorant Garamond (display) + Jost (body) from Google Fonts CDN
- All state in-memory JavaScript arrays (no persistence)

### Backend
- **Express** (`server/index.ts`) — HTTP server on port 5000
- **Single API route**: `POST /api/mix` in `server/routes.ts`
  - Accepts `{ topics: string[], context?: string }`
  - Calls Anthropic Claude (`claude-sonnet-4-6`) via AI Integration
  - Returns structured JSON recipe or `{ ok: false, error: "..." }`

### AI
- **Anthropic Claude** (`@anthropic-ai/sdk`) via Replit AI Integration
- Configured via `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`
- No user API key needed — billed to Replit credits
- Model: `claude-sonnet-4-6`, max_tokens: 1200

### No Database
- v1 has zero persistence — everything resets on page reload

---

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Anthropic Claude API key (via Replit integration) |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Anthropic API base URL (Replit proxy) |
| `DATABASE_URL` | PostgreSQL connection (present but unused by this app) |

---

## Design System

| Token | Hex | Use |
|---|---|---|
| Background | `#EDE9E0` | Page background |
| Surface | `#FAF8F3` | Cards, inputs |
| Accent | `#A8623A` | Brand, buttons, headings |
| Gold | `#B89040` | Mid-scale badge |
| Sage | `#6A8A58` | High-scale badge (green) |
| Rose | `#C47060` | Low-scale badge, errors |

Liquid layer colours (ingredient 1→6): `#C8904A`, `#90B848`, `#D4B038`, `#B06880`, `#6898C0`, `#90C0A0`

---

## Running

```
npm run dev   # starts Express + Vite dev middleware on port 5000
```

The workflow "Start application" is already configured and runs this.
