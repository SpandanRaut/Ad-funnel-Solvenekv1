import { sendRedirect } from "h3";

// Run before Nitro's static asset handler: parseURL("//confirmed") otherwise
// treats "confirmed" as a host and serves the prerendered home page.
// Access decisions remain exclusively in funnel.global.ts.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("request", (event) => {
    const raw = event.node.req.url || event.path;
    const queryAt = raw.indexOf("?");
    const path = queryAt < 0 ? raw : raw.slice(0, queryAt);
    if (!/\/{2,}/.test(path)) return;
    const query = queryAt < 0 ? "" : raw.slice(queryAt);
    return sendRedirect(event, path.replace(/\/{2,}/g, "/") + query, 301);
  });
});
