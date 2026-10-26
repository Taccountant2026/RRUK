// Verified legacy static-site/Shopify CSV paths. Never derive a destination from arbitrary user input.
const flatLegacyPages={
  'about.html':'/our-story','about.htm':'/our-story','branding.html':'/our-story','branding':'/our-story',
  'checkout.html':'/basket','checkout':'/basket','delivery.html':'/delivery','delivery.t':'/delivery',
  'faq.html':'/support','privacy.html':'/privacy','privacy.h':'/privacy',
  'returns.html':'/returns','returns.h':'/returns','terms.html':'/terms','terms.htm':'/terms',
  'process.html':'/how-it-works','process.h':'/how-it-works',
  'services.html':'/how-it-works','services.h':'/how-it-works',
  'shop.html':'/shop','shop.htm':'/shop','ps2.html':'/collections/playstation',
  'sourcing-request.html':'/console-hunt','sourcing-':'/console-hunt',
  'search':'/shop','cart':'/basket',
};
const flatLegacyGroups={
  'atari':'/collections/sega-atari','sega':'/collections/sega-atari','xbox':'/collections/xbox',
};
// Only historic product slugs from the owner's Shopify URL export.
// No exact SKU equivalence is claimed: when discontinued, offer a relevant category.
// Historic non-gaming listings were explicitly forwarded to general browsing in
// the owner's Shopify export; do not pretend that matching products exist.
const retiredShopifyProductDestinations={
  'flying-squirrel-page-turning-pen-laser-pointer-teaching-business-office-presentation-pen-ppt-speech-mouse-page-turning-pen':'/shop',
  'hikvion-ds-2cd1047g0-l-4mp-colorful-imaging-bullet-survillance-camera-poe-h265':'/shop',
  'iphone-6-plus-case-brown-leather':'/shop',
};
const archivedRetroProductDestinations={
  'generic-hdmi-cable-type_cable-hdmi-video-game-accessory':'/collections/controllers-cables',
  'mega-drive-av-scart-cable-platform_megadrive-platform_sega-type_cable-region_pal-video-game-accessory':'/collections/controllers-cables',
  'nintendo-64-console-collectors-boxed-retro-console':'/shop?collection=nintendo&q=nintendo+64',
  'nintendo-gamecube-purple-lot02-platform_gamecube-platform_nintendo-type_console-cond_excellent-stock_ready-region_pal-video-game-console':'/collections/nintendo',
  'original-xbox-hdmi-adapter-platform_xbox-platform_original-xbox-type_cable-hdmi-video-game-accessory':'/collections/controllers-cables',
  'playstation-2-custom-build-platform_ps2-platform_playstation-type_console-type_custom-stock_custom-plug-and-play-video-game-console':'/collections/playstation',
  'playstation-2-fat-console-controller-cables-included-ready-to-play':'/collections/playstation',
  'ps2-slim-grade-a-boxed-platform_ps2-platform_playstation-type_console-cond_excellent-cond_boxed-stock_ready-region_pal-video-game-console':'/collections/playstation',
  'sega-dreamcast-official-controller-vmu-tested-ready-to-use':'/collections/controllers-cables',
  'sony-playstation-1-original-scph-1002-console-silver-condition':'/collections/playstation',
  'super-nintendo-snes-official-controller-tested-ready-to-use':'/collections/controllers-cables',
  'switch-lite-handheld':'/collections/handhelds',
};
const pages={
  'about-us':'/our-story','about':'/our-story','our-story':'/our-story','contact':'/contact','contact-us':'/contact',
  'console-hunt':'/console-hunt','console-checker':'/console-checker','find-my-console':'/console-finder',
  'faq':'/support','faqs':'/support','help':'/support','help-centre':'/support',
  'warranty':'/warranty','warranty-information':'/warranty','warranty-returns':'/warranty',
  'returns':'/returns','returns-policy':'/returns','refund-policy':'/returns','shipping':'/delivery',
  'shipping-policy':'/delivery','delivery':'/delivery','delivery-information':'/delivery',
  'terms':'/terms','terms-and-conditions':'/terms','privacy-policy':'/privacy',
  'how-it-works':'/how-it-works','branding':'/our-story',
  'process':'/how-it-works','services':'/how-it-works','sourcing-request':'/console-hunt',
};
const policyPages={'refund-policy':'/returns','shipping-policy':'/delivery','privacy-policy':'/privacy','terms-of-service':'/terms','contact-information':'/contact'};
const articleAliases={
  'ps2-fat-vs-ps2-slim-which-should-you-buy':'ps2-fat-vs-slim',
  'best-pre-owned-ps2-to-buy-uk-2026':'ps2-fat-vs-slim',
};
// Exact editorial migrations only. Removed products/articles keep a real 404.
const pageAliases={
  'ps2-fat-vs-ps2-slim':'/blog/ps2-fat-vs-slim',
  'why-buy-from-retroreplay-uk':'/why-rruk',
  'retro-gaming-setup-guides':'/blog',
};
const collectionAliases={
  'handheld-consoles':'/collections/handhelds',
  'playstation-2':'/collections/playstation','playstation-2-consoles':'/collections/playstation',
  'ps2':'/collections/playstation','ps2-consoles':'/collections/playstation',
  'playstation-consoles':'/collections/playstation','playstation-1':'/collections/playstation',
  'ps1':'/collections/playstation','psp':'/collections/handhelds',
  'gamecube':'/collections/nintendo','nintendo-gamecube':'/collections/nintendo',
  'nintendo-64':'/collections/nintendo','nes':'/collections/nintendo',
  'gameboy':'/collections/handhelds','game-boy':'/collections/handhelds',
  'game-boy-advance':'/collections/handhelds','nintendo-ds':'/collections/handhelds',
  'original-xbox':'/collections/xbox','xbox-360':'/collections/xbox',
  'dreamcast':'/collections/sega-atari','mega-drive':'/collections/sega-atari',
  'megadrive':'/collections/sega-atari','sega':'/collections/sega-atari',
  'atari':'/collections/sega-atari','atari-2600':'/collections/sega-atari',
  'consoles':'/collections/consoles','retro-consoles':'/collections/consoles',
  'refurbished-consoles':'/collections/consoles',
  'limited-edition-rare-collector-consoles':'/collections/consoles',
  'collector-s-vault':'/collections/consoles','collectors-vault':'/collections/consoles',
  'controllers':'/collections/controllers-cables',
  'controller-collection':'/collections/controllers-cables',
  'accessories-peripherals':'/collections/controllers-cables',
  'cables-adapters':'/collections/controllers-cables',
  'cables-and-adapters':'/collections/controllers-cables',
  'memory-cards-storage':'/collections/controllers-cables',
  'memory-cards-and-storage':'/collections/controllers-cables',
  'hdmi-upgrades':'/collections/controllers-cables',
  'home-page':'/shop', 'gold-condition':'/collections/consoles',
  'silver-condition':'/collections/consoles',
  'source-to-order':'/shop?orderable=1','under-100':'/shop?max=100',
  'n64':'/shop?collection=nintendo&q=nintendo+64',
  'japanese-imports':'/shop?q=japanese+import',
};
const sitemapAliases={
  'sitemap_products_1.xml':'/sitemap.xml',
  'sitemap_collections_1.xml':'/sitemap.xml',
  'sitemap_pages_1.xml':'/sitemap.xml',
  'sitemap_blogs_1.xml':'/sitemap.xml',
};
const own=(table,key)=>Object.hasOwn(table,key)?table[key]:null;
export function legacyDestination(segments,products=[]){
  if(!Array.isArray(segments)||segments.some(p=>typeof p!=='string'||!/^[a-z0-9][a-z0-9._-]{0,199}$/i.test(p)))return null;
  let parts=[...segments];
  if(['fr','de','es','it','en','en-gb'].includes(parts[0]))parts=parts.slice(1);
  if(!parts.length)return '/';
  const [section,slug,last]=parts;
  if(parts.length===1&&own(flatLegacyPages,section))return own(flatLegacyPages,section);
  if(parts.length===1&&section==='b')return '/';
  if(parts.length===1&&section==='collect')return '/collections';
  if(parts.length===2&&['index.html','index'].includes(slug)&&own(flatLegacyGroups,section))return own(flatLegacyGroups,section);
  if(parts.length===3&&section==='playstation'&&slug==='products'&&last==='ps2-fat.html')return '/collections/playstation';
  if(parts.length===3&&section==='playstatic'&&slug==='products'&&last==='playstation-2-fat-console-controller-cables-included-ready-to-play')return '/collections/playstation';
  if(parts.length===1&&own(sitemapAliases,section))return own(sitemapAliases,section);
  if(parts.length===2&&section==='pages')return own(pages,slug)||own(pageAliases,slug);
  if(parts.length===2&&section==='policies')return own(policyPages,slug);
  if(parts.length===2&&section==='collections'&&own(collectionAliases,slug))return own(collectionAliases,slug);
  if(parts.length===2&&section==='collections'&&slug==='all')return '/shop';
  if(parts.length===2&&section==='products'&&slug){
    if(own(retiredShopifyProductDestinations,slug))return own(retiredShopifyProductDestinations,slug);
    if(own(archivedRetroProductDestinations,slug))return own(archivedRetroProductDestinations,slug);
    const aliases={'playstation-2-memory-card-8mb-official':'sony-playstation-2-official-8-mb-memory-card'};
    const match=products.find(p=>p.slug===(own(aliases,slug)||slug));
    if(match)return '/product/'+match.slug;
  }
  if(section==='blogs'&&parts.length===3&&own(articleAliases,last))return '/blog/'+own(articleAliases,last);
  if(section==='blogs'&&parts.length<3)return '/blog';
  if(parts.length===1&&section==='search')return '/shop';
  if(parts.length===1&&section==='cart')return '/basket';
  if(parts.length===1&&['shop','collections','blog','community','support','console-hunt','console-checker','contact','our-story','delivery','returns','terms','privacy','warranty'].includes(section))return '/'+section;
  if(parts.length===2&&section==='collections'&&['playstation','nintendo','xbox','sega-atari','consoles','handhelds','controllers-cables','cases','gifts-essentials'].includes(slug))return '/collections/'+slug;
  return null;
}
