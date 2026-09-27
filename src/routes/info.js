import { ENGINE_NAME, MODEL, SERVICE_NAME, UZZAPBOT_VERSION } from "../core/config.js";
import { json } from "../core/response.js";

export function info() {
  return json({
    service: SERVICE_NAME,
    engine: ENGINE_NAME,
    version: UZZAPBOT_VERSION,
    model: MODEL,
    api: {
      health: "GET /health",
      info: "GET /info",
      version: "GET /version",
      capabilities: "GET /capabilities",
      ai: "POST /ai"
    }
  });
}

export function version() {
  return json({
    service: SERVICE_NAME,
    engine: ENGINE_NAME,
    version: UZZAPBOT_VERSION
  });
}

export function capabilities() {
  return json({
    service: SERVICE_NAME,
    version: UZZAPBOT_VERSION,
    endpoints: [
      "GET /health",
      "GET /info",
      "GET /version",
      "GET /capabilities",
      "POST /ai"
    ],
    features: ["chat-generation", "request-validation", "optional-bearer-auth"]
  });
}
