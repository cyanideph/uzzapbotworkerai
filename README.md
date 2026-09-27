# UzzapBot AI Worker

Cloudflare Workers AI gateway for UzzapBot.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Lightweight deployment health check |
| GET | `/info` | Service, engine, version, model, and API metadata |
| GET | `/version` | Machine-readable version/engine identity |
| GET | `/capabilities` | Supported endpoints and gateway features |
| POST | `/ai` | AI chat generation |

Unknown routes return HTTP 404.

## Architecture

```
UzzapAndroid
    ↓
Supabase UzzapBot Edge Function
    ↓
Cloudflare Worker /ai
    ↓
Workers AI
```

The Supabase Edge Function remains responsible for Uzzap-specific orchestration such as room context, language/dialect selection, memory, games, personality, and AI admission. This Worker is the AI gateway/model execution layer.

## Repository layout

```
src/
├── index.js
├── core/
│   ├── auth.js
│   ├── config.js
│   ├── response.js
│   └── validation.js
└── routes/
    ├── ai.js
    ├── health.js
    └── info.js
```

## AI behavior

The Worker supplies a small gateway-level system prompt. Application-supplied system instructions remain authoritative for UzzapBot personality, language, conversation behavior, memory, and Uzzap features.

AI generation is capped at 96 completion tokens. Identity/version questions are answered without an AI generation request.

## Authentication

For production, create a Cloudflare Worker secret named `UZZAPBOT_AI_SECRET`.

When the secret exists, `POST /ai` requires:

`Authorization: Bearer <secret>`

If the secret is absent, the Worker remains callable so deployment testing can be performed before the secret is configured.

## Validation

`POST /ai` validates:

- JSON body
- required `messages` array
- maximum 20 messages
- allowed roles: `system`, `user`, `assistant`
- maximum 12,000 characters per message
- maximum 49,152-byte request body when Content-Length is supplied

Do not put Cloudflare secrets, API keys, or `.dev.vars` files in this repository.

## Deployment

Use the `main` branch and repository root.

- Build command: leave empty
- Deploy command: `npx wrangler deploy`
- Root directory: leave empty
- Worker name: `uzzapbot-ai`

Configuration is in `wrangler.jsonc`.
