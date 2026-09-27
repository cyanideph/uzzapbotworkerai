import { ENGINE_NAME, MODEL, SYSTEM_PROMPT, UZZAPBOT_VERSION } from "../core/config.js";
import { authorized } from "../core/auth.js";
import { parseAiRequest } from "../core/validation.js";
import { json } from "../core/response.js";

export async function ai(request, env) {
  if (!authorized(request, env)) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  const parsed = await parseAiRequest(request);
  if (parsed.error) {
    return json({ success: false, error: parsed.error }, parsed.status);
  }

  const messages = parsed.messages;
  const suppliedSystem = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .join("\n");

  const aiMessages = [
    {
      role: "system",
      content: suppliedSystem
        ? `${SYSTEM_PROMPT}\n\nAdditional application instructions:\n${suppliedSystem}`
        : SYSTEM_PROMPT
    },
    ...messages.filter((m) => m.role !== "system")
  ];

  const latestUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";

  const identityQuestion =
    /\b(?:what(?:\s+is|\'s)?\s+your\s+(?:app\s+)?version|what\s+version|anong\s+version|unsang\s+version|version\s+mo|what\s+model|anong\s+model|unsang\s+model|what\s+ai\s+are\s+you)\b/i.test(
      latestUserMessage.trim()
    );

  if (identityQuestion) {
    const asksVersion = /\b(version|bersyon)\b/i.test(latestUserMessage);
    return json({
      success: true,
      response: asksVersion
        ? `UzzapBot v${UZZAPBOT_VERSION} — ${ENGINE_NAME}. Your AI Tambay sa Uzzap.`
        : `${ENGINE_NAME} — the intelligence engine behind UzzapBot v${UZZAPBOT_VERSION}.`
    });
  }

  try {
    const result = await env.AI.run(MODEL, {
      messages: aiMessages,
      max_completion_tokens: 96,
      chat_template_kwargs: { enable_thinking: false }
    });

    const content =
      result?.choices?.[0]?.message?.content?.trim() ||
      result?.response?.trim() ||
      result?.result?.response?.trim() ||
      "";

    if (!content) {
      return json({ success: false, error: "AI returned an empty response" }, 502);
    }

    const safeContent = content
      .replace(
        /\b(?:Gemma(?:\s+\d+(?:\.\d+)?)?|Google\s+DeepMind|Cloudflare\s+Workers?\s+AI|@cf\/google\/gemma[^\s]*)\b/gi,
        "UzzapBot"
      )
      .trim();

    return json({
      success: true,
      response: safeContent || "UzzapBot ako, ang AI tambay sa Uzzap."
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}
