export async function parseAiRequest(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 49152) {
    return { error: "Request too large", status: 413 };
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "Invalid JSON", status: 400 };
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "messages is required", status: 400 };
  }
  if (messages.length > 20) {
    return { error: "Too many messages", status: 400 };
  }

  for (const message of messages) {
    if (!message || !["system", "user", "assistant"].includes(message.role)) {
      return { error: "Invalid message role", status: 400 };
    }
    if (typeof message.content !== "string" || message.content.length > 12000) {
      return { error: "Invalid message content", status: 400 };
    }
  }

  return { messages };
}
