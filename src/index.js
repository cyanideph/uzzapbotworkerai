export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, service: "uzzapbot-ai" });
    }

    if (request.method !== "POST" || url.pathname !== "/ai") {
      return Response.json({ error: "Use POST /ai" }, { status: 405 });
    }

    try {
      const body = await request.json();
      const messages = body?.messages;

      if (!Array.isArray(messages) || messages.length === 0) {
        return Response.json({ error: "messages is required" }, { status: 400 });
      }

      const result = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", { messages });

      const content =
        result?.response ??
        result?.result?.response ??
        result?.choices?.[0]?.message?.content ??
        "";

      return Response.json({ success: true, response: content });
    } catch (error) {
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }
};
