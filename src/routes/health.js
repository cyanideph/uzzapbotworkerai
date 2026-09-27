import { ENGINE_NAME, SERVICE_NAME, UZZAPBOT_VERSION } from "../core/config.js";
import { json } from "../core/response.js";

export function health() {
  return json({
    ok: true,
    service: SERVICE_NAME,
    engine: ENGINE_NAME,
    version: UZZAPBOT_VERSION
  });
}
