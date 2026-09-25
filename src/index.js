const MODEL = "@cf/google/gemma-4-26b-a4b-it";
const ENGINE_NAME = "CY Aether Core";
const UZZAPBOT_VERSION = "4.9.4";

const SYSTEM_PROMPT = [
  "You are the AI gateway for UzzapBot.",
  "The application-supplied system instructions are authoritative for personality, language, conversation behavior, memory, and Uzzap features.",
  "Return only the natural user-facing reply.",
  "Follow the supplied application context and do not invent memories or application actions.",
  "Preserve the user's language, dialect, tone, and conversation context."
].join(" ");

function json(data, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
function authorized(request, env) { if (!env.UZZAPBOT_AI_SECRET) return true; return (request.headers.get("Authorization") || "") === `Bearer ${env.UZZAPBOT_AI_SECRET}`; }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "uzzapbot-ai", engine: ENGINE_NAME, version: UZZAPBOT_VERSION });
    if (request.method !== "POST" || url.pathname !== "/ai") return json({ error: "Use POST /ai" }, 405);
    if (!authorized(request, env)) return json({ success: false, error: "Unauthorized" }, 401);
    try {
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (contentLength > 49152) return json({ success: false, error: "Request too large" }, 413);
      const body = await request.json();
      const messages = body?.messages;
      if (!Array.isArray(messages) || messages.length === 0) return json({ success: false, error: "messages is required" }, 400);
      if (messages.length > 20) return json({ success: false, error: "Too many messages" }, 400);
      for (const message of messages) {
        if (!message || !["system", "user", "assistant"].includes(message.role)) return json({ success: false, error: "Invalid message role" }, 400);
        if (typeof message.content !== "string" || message.content.length > 12000) return json({ success: false, error: "Invalid message content" }, 400);
      }
      const suppliedSystem = messages.filter((m) => m.role === "system").map((m) => m.content.trim()).filter(Boolean).join("\n");
      const aiMessages = [{ role: "system", content: suppliedSystem ? `${SYSTEM_PROMPT}\n\nAdditional application instructions:\n${suppliedSystem}` : SYSTEM_PROMPT }, ...messages.filter((m) => m.role !== "system")];
      const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      const identityQuestion = /\b(?:what(?:\s+is|\'s)?\s+your\s+(?:app\s+)?version|what\s+version|anong\s+version|unsang\s+version|version\s+mo|what\s+model|anong\s+model|unsang\s+model|what\s+ai\s+are\s+you)\b/i.test(latestUserMessage.trim());
      if (identityQuestion) {
        const asksVersion = /\b(version|bersyon)\b/i.test(latestUserMessage);
        return json({ success: true, response: asksVersion ? "UzzapBot v4.9.4 — CY Aether Core. Your AI Tambay sa Uzzap." : "CY Aether Core — the intelligence engine behind UzzapBot v4.9.4." });
      }
      const result = await env.AI.run(MODEL, { messages: aiMessages, max_completion_tokens: 96, chat_template_kwargs: { enable_thinking: false } });
      const content = result?.choices?.[0]?.message?.content?.trim() || result?.response?.trim() || result?.result?.response?.trim() || "";
      if (!content) return json({ success: false, error: "AI returned an empty response" }, 502);
      const safeContent = content
        .replace(/\b(?:Gemma(?:\s+\d+(?:\.\d+)?)?|Google\s+DeepMind|Cloudflare\s+Workers?\s+AI|@cf\/google\/gemma[^\s]*)\b/gi, "UzzapBot")
        .trim();
      return json({ success: true, response: safeContent || "UzzapBot ako, ang AI tambay sa Uzzap." });
    } catch (error) { return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500); }
  }
};