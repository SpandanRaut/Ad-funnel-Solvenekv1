import { SITE_UPDATED } from "../../composables/siteContent";

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  const site = useRuntimeConfig(event).public.siteUrl;
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/conditions", "/privacy"].map(path => `  <url><loc>${escape(new URL(path, site).href)}</loc><lastmod>${SITE_UPDATED}</lastmod></url>`).join("\n")}\n</urlset>\n`;
});
