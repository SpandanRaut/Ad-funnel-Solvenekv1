// POST /api/lead — runs on any Nitro host (Cloudflare, Netlify, Node).
// Reuses the validated lead handler and forwards to the Apps Script webhook.
import leadHandler from "../../netlify/functions/lead";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const webhook = config.leadWebhookUrl || process.env.LEAD_WEBHOOK_URL;
  return leadHandler(toWebRequest(event), webhook);
});
