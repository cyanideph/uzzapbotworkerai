import { health } from "./routes/health.js";
import { info, version, capabilities } from "./routes/info.js";
import { ai } from "./routes/ai.js";
import { json } from "./core/response.js";

const routes = {
  "GET /health": health,
  "GET /info": info,
  "GET /version": version,
  "GET /capabilities": capabilities,
  "POST /ai": ai
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const handler = routes[`${request.method} ${url.pathname}`];

    if (!handler) {
      return json({ error: "Not Found" }, 404);
    }

    return handler(request, env);
  }
};
