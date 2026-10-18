const configuredSiteUrl = process.env.NUXT_PUBLIC_SITE_URL || process.env.URL;
const siteUrl = configuredSiteUrl || "http://localhost:3000";
if (!configuredSiteUrl) console.warn("[SEO WARNING] SITE_URL is missing; canonical URLs, robots and sitemap use http://localhost:3000. Set NUXT_PUBLIC_SITE_URL before publishing.");
for (const key of ["NUXT_PUBLIC_LEGAL_NAME", "NUXT_PUBLIC_BUSINESS_ADDRESS", "NUXT_PUBLIC_LEGAL_EFFECTIVE_DATE"]) {
  if (!process.env[key]) console.warn(`[LEGAL REVIEW REQUIRED] ${key} is missing. Its business-specific line will be omitted from the privacy policy.`);
}

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  // The public landing page is static; booking access is checked per request.
  routeRules: {
    "/": { prerender: true },
    "/schedule": { redirect: { to: "/", statusCode: 301 } },
    "/schedule/**": { redirect: { to: "/", statusCode: 301 } },
    "/confirmed": { prerender: false },
    "/confirmed/**": { prerender: false },
  },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      siteUrl,
      contactEmail: process.env.NUXT_PUBLIC_CONTACT_EMAIL || "support@solvenek.com",
      legalName: process.env.NUXT_PUBLIC_LEGAL_NAME || "",
      businessAddress: process.env.NUXT_PUBLIC_BUSINESS_ADDRESS || "",
      legalEffectiveDate: process.env.NUXT_PUBLIC_LEGAL_EFFECTIVE_DATE || "",
      gaId: process.env.NUXT_PUBLIC_GA_ID || "",
      analyticsDebug: process.env.NUXT_PUBLIC_ANALYTICS_DEBUG || "",
      // Override with NUXT_PUBLIC_CALENDLY_URL.
      calendlyUrl: "https://calendly.com/bhurajxtha/30min",
      // Meta Pixel ID from NUXT_PUBLIC_META_PIXEL_ID; empty disables the pixel.
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || "",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "Booked Kitchen & Bath Estimates for Remodelers | Solvenek",
      meta: [
        {
          name: "description",
          content:
            "Exclusive homeowner inquiries, never shared. We run the ads, follow up with leads and book your kitchen & bath estimates.",
        },
        { name: "theme-color", content: "#050B1A" },
      ],
      link: [
        { rel: "stylesheet", href: "/fonts/fonts.css" },
        { rel: "preload", href: "/fonts/dm-sans-latin.woff2", as: "font", type: "font/woff2", crossorigin: "anonymous" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg", sizes: "any" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
  typescript: { strict: true },
  nitro: { prerender: { routes: ["/robots.txt", "/sitemap.xml", "/conditions", "/privacy"] } },
});
