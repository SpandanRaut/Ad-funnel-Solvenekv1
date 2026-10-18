import { siteSeo } from "./siteContent";

export function useSiteSeo(page: keyof typeof siteSeo) {
  const config = useRuntimeConfig().public;
  const meta = siteSeo[page];
  const path = page === "error" ? (import.meta.server ? useRequestURL().pathname : window.location.pathname) : page;
  const canonical = new URL(path, config.siteUrl).href;
  const image = new URL("/og-image.png", config.siteUrl).href;
  const robots = page === "/confirmed" || page === "error" ? "noindex,nofollow" : "index,follow";
  useSeoMeta({
    title: meta.title, description: meta.description, robots,
    ogTitle: meta.title, ogDescription: meta.description, ogType: "website",
    ogUrl: canonical, ogSiteName: "Solvenek", ogImage: image,
    ogImageWidth: 1200, ogImageHeight: 630,
    ogImageAlt: "Booked kitchen & bath estimates for remodelers",
    twitterCard: "summary_large_image", twitterTitle: meta.title,
    twitterDescription: meta.description, twitterImage: image,
    twitterImageAlt: "Booked kitchen & bath estimates for remodelers",
  });
  useHead({ htmlAttrs: { lang: "en" }, link: [{ rel: "canonical", href: canonical }] });
}
