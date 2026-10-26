import type { NextConfig } from "next";

// Shopify -> independent RRUK store: permanent HTTP 308 redirects.
// Keep this list explicit: removed products and articles must NOT redirect to unrelated pages.
// Add historic Search Console/Shopify export URLs with a verified matching destination.
const legacyRedirects: ReadonlyArray<readonly [string,string]> = [
  ["/search", "/shop"],
  ["/cart", "/basket"],
  ["/pages/about-us", "/our-story"],
  ["/pages/about", "/our-story"],
  ["/pages/contact-us", "/contact"],
  ["/pages/faq", "/support"],
  ["/pages/faqs", "/support"],
  ["/pages/warranty", "/warranty"],
  ["/pages/warranty-information", "/warranty"],
  ["/pages/warranty-returns", "/warranty"],
  ["/pages/refund-policy", "/returns"],
  ["/pages/returns-policy", "/returns"],
  ["/pages/returns", "/returns"],
  ["/pages/shipping-policy", "/delivery"],
  ["/pages/shipping", "/delivery"],
  ["/pages/terms-and-conditions", "/terms"],
  ["/pages/privacy-policy", "/privacy"],
  ["/pages/console-hunt", "/console-hunt"],
  ["/pages/console-checker", "/console-checker"],
  ["/pages/find-my-console", "/console-finder"],
  ["/pages/why-buy-from-retroreplay-uk", "/why-rruk"],
  ["/collections/all", "/shop"],
  ["/collections/playstation-2", "/collections/playstation"],
  ["/collections/playstation-2-consoles", "/collections/playstation"],
  ["/collections/ps2", "/collections/playstation"],
  ["/collections/playstation-1", "/collections/playstation"],
  ["/collections/psp", "/collections/handhelds"],
  ["/collections/handheld-consoles", "/collections/handhelds"],
  ["/collections/game-boy", "/collections/handhelds"],
  ["/collections/gameboy", "/collections/handhelds"],
  ["/collections/game-boy-advance", "/collections/handhelds"],
  ["/collections/nintendo-gamecube", "/collections/nintendo"],
  ["/collections/gamecube", "/collections/nintendo"],
  ["/collections/nintendo-64", "/collections/nintendo"],
  ["/collections/original-xbox", "/collections/xbox"],
  ["/collections/xbox-360", "/collections/xbox"],
  ["/collections/sega", "/collections/sega-atari"],
  ["/collections/atari", "/collections/sega-atari"],
  ["/collections/dreamcast", "/collections/sega-atari"],
  ["/collections/mega-drive", "/collections/sega-atari"],
  ["/collections/refurbished-consoles", "/collections/consoles"],
  ["/collections/limited-edition-rare-collector-consoles", "/collections/consoles"],
  ["/collections/limited-edition-rare-collector-consoles-retroreplay-uk", "/collections/consoles"],
  ["/collections/consoles-handhelds", "/collections/consoles"],
  ["/collections/collectors-vault", "/collections/consoles"],
  ["/collections/collector-s-vault", "/collections/consoles"],
  ["/collections/controller-collection", "/collections/controllers-cables"],
  ["/collections/memory-cards-storage", "/collections/controllers-cables"],
  ["/collections/accessories-peripherals", "/collections/controllers-cables"],
  ["/collections/cables-adapters", "/collections/controllers-cables"],
  ["/collections/hdmi-upgrades", "/collections/controllers-cables"],
  ["/collections/ready-to-ship", "/shop"],
  ["/collections/home-page", "/shop"],
  ["/policies/refund-policy", "/returns"],
  ["/policies/shipping-policy", "/delivery"],
  ["/policies/privacy-policy", "/privacy"],
  ["/policies/terms-of-service", "/terms"],
  ["/policies/contact-information", "/contact"],
  ["/products/playstation-2-memory-card-8mb-official", "/product/sony-playstation-2-official-8-mb-memory-card"],
  ["/blogs/retro-console-buying-advice/ps2-fat-vs-ps2-slim-which-should-you-buy", "/blog/ps2-fat-vs-slim"],
  ["/blogs/news/ps2-fat-vs-ps2-slim-which-should-you-buy", "/blog/ps2-fat-vs-slim"],
  ["/blogs/news/best-pre-owned-ps2-to-buy-uk-2026", "/blog/ps2-fat-vs-slim"],
  ["/sitemap_products_1.xml", "/sitemap.xml"],
  ["/sitemap_collections_1.xml", "/sitemap.xml"],
  ["/sitemap_pages_1.xml", "/sitemap.xml"],
  ["/sitemap_blogs_1.xml", "/sitemap.xml"],
];

// Fail builds if a rule accidentally targets itself or duplicates another rule.
const sources = new Set<string>();
for (const [source, destination] of legacyRedirects) {
  if (sources.has(source) || source === destination || !source.startsWith("/") || !destination.startsWith("/")) {
    throw new Error("Invalid RRUK legacy redirect: " + source + " -> " + destination);
  }
  sources.add(source);
}

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
