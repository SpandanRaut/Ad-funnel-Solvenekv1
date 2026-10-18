export default defineEventHandler((event) => {
  setHeader(event, "content-type", "text/plain; charset=utf-8");
  const site = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, "");
  return `User-agent: *\nAllow: /\nDisallow: /confirmed\nSitemap: ${site}/sitemap.xml\n`;
});
