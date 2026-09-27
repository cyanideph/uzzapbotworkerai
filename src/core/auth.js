export function authorized(request, env) {
  if (!env.UZZAPBOT_AI_SECRET) return true;
  return (request.headers.get("Authorization") || "") === `Bearer ${env.UZZAPBOT_AI_SECRET}`;
}
