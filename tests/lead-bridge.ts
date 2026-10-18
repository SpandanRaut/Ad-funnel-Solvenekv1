import http from "node:http";
import type { Page } from "@playwright/test";
import handler from "../netlify/functions/lead";

/**
 * Netlify Functions don't run under `nuxt dev`, so tests route
 * /.netlify/functions/lead to the real handler, which forwards to a local
 * receiver standing in for LEAD_WEBHOOK_URL. Nothing leaves this machine.
 */
export async function startWebhook() {
  const received: Record<string, string>[] = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push(JSON.parse(body));
      res.end("ok");
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };
  process.env.LEAD_WEBHOOK_URL = `http://127.0.0.1:${port}/hook`;
  return { received, close: () => server.close() };
}

export async function bridgeLeadFunction(page: Page) {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/.netlify/functions/lead", async (route) => {
    const request = route.request();
    requests.push(request.postDataJSON());
    const response = await handler(
      new Request(request.url(), {
        method: request.method(),
        headers: request.headers(),
        body: request.postData(),
      }),
    );
    await route.fulfill({
      status: response.status,
      contentType: "application/json",
      body: await response.text(),
    });
  });
  return requests;
}

/** Opens the form and waits for hydration (the hero background is sized on mount). */
export async function openForm(page: Page, url = "/") {
  await page.goto(url);
  await page.locator(".hero-background[style*=height]").waitFor({ state: "attached" });
}
