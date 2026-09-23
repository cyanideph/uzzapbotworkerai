# UzzapBot AI Worker

Cloudflare Workers AI endpoint for UzzapBot.

## Endpoints

- `GET /health` — deployment health check.
- `POST /ai` — accepts `{"messages":[...]}` and returns `{"success":true,"response":"..." }`.

## Cloudflare Workers Builds

Use the `main` branch and the repository root.

- Build command: leave empty
- Deploy command: `npx wrangler deploy`
- Root directory: leave empty
- Worker name: `uzzapbot-ai`

The Worker configuration is in `wrangler.jsonc`.

## AI behavior

The Worker adds the UzzapBot personality server-side so clients do not need to send the personality prompt on every request. It follows Bisaya/Cebuano, Waray, Tagalog, English, and Taglish and keeps normal chat replies concise.

Gemma 4 output is capped at 160 completion tokens to prevent unnecessarily long replies.

## Authentication

For production, create a Cloudflare Worker secret named `UZZAPBOT_AI_SECRET`.

When the secret exists, `POST /ai` requires:

`Authorization: Bearer <secret>`

The Worker intentionally remains usable before the secret is created so the Cloudflare deployment can be tested first.

## Supabase integration

Keep deterministic Uzzap game commands in the Supabase UzzapBot/game logic. Only normal AI chat should call this Worker.

Recommended flow:

`Supabase UzzapBot Edge Function → Cloudflare Worker /ai → Workers AI → response`

Do not put Cloudflare secrets, API keys, or `.dev.vars` files in this repository.
