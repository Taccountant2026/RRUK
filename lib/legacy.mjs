const pages={
  'about-us':'/our-story','about':'/our-story','our-story':'/our-story','contact':'/contact','contact-us':'/contact',
  'console-hunt':'/console-hunt','console-checker':'/console-checker','faq':'/support','faqs':'/support',
};
const policyPages={'refund-policy':'/returns','shipping-policy':'/delivery','privacy-policy':'/privacy','terms-of-service':'/terms','contact-information':'/contact'};
const articleAliases={
  'ps2-fat-vs-ps2-slim-which-should-you-buy':'ps2-fat-vs-slim',
  'best-pre-owned-ps2-to-buy-uk-2026':'ps2-fat-vs-slim',
};
// Exact editorial migrations only. Removed products/articles keep a real 404.
const pageAliases={
  'find-my-console':'/console-finder',
  'ps2-fat-vs-ps2-slim':'/blog/ps2-fat-vs-slim',
  'why-buy-from-retroreplay-uk':'/why-rruk',
  'retro-gaming-setup-guides':'/blog',
};
const collectionAliases={
  'handheld-consoles':'/collections/handhelds',
  'n64':'/shop?collection=nintendo&q=nintendo+64',
  'japanese-imports':'/shop?q=japanese+import',
};
const sitemapAliases={
  'sitemap_products_1.xml':'/sitemap.xml',
  'sitemap_collections_1.xml':'/sitemap.xml',
};
const own=(table,key)=>Object.hasOwn(table,key)?table[key]:null;
export function legacyDestination(segments,products=[]){
  if(!Array.isArray(segments)||segments.some(p=>typeof p!=='string'||!/^[a-z0-9][a-z0-9._-]{0,199}$/i.test(p)))return null;
  let parts=[...segments];
  if(['fr','de','es','it','en','en-gb'].includes(parts[0]))parts=parts.slice(1);
  if(!parts.length)return '/';
  const [section,slug,last]=parts;
  if(parts.length===1&&own(sitemapAliases,section))return own(sitemapAliases,section);
  if(parts.length===2&&section==='pages')return own(pages,slug)||own(pageAliases,slug);
  if(parts.length===2&&section==='policies')return own(policyPages,slug);
  if(parts.length===2&&section==='collections'&&own(collectionAliases,slug))return own(collectionAliases,slug);
  if(parts.length===2&&section==='collections'&&slug==='all')return '/shop';
  if(parts.length===2&&section==='products'&&slug){
    const aliases={'playstation-2-memory-card-8mb-official':'sony-playstation-2-official-8-mb-memory-card'};
    const match=products.find(p=>p.slug===(own(aliases,slug)||slug));
    if(match)return '/product/'+match.slug;
  }
  if(section==='blogs'&&parts.length===3&&own(articleAliases,last))return '/blog/'+own(articleAliases,last);
  if(section==='blogs'&&parts.length<3)return '/blog';
  if(parts.length===1&&['shop','collections','blog','community','support','console-hunt','console-checker','contact','our-story','delivery','returns','terms','privacy','warranty'].includes(section))return '/'+section;
  if(parts.length===2&&section==='collections'&&['playstation','nintendo','xbox','sega-atari','consoles','handhelds','controllers-cables','cases','gifts-essentials'].includes(slug))return '/collections/'+slug;
  return null;
}
