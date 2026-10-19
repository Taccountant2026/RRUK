const pages={
  'about-us':'/our-story','about':'/our-story','our-story':'/our-story','contact':'/contact','contact-us':'/contact',
  'console-hunt':'/console-hunt','console-checker':'/console-checker','faq':'/support','faqs':'/support',
};
const policyPages={'refund-policy':'/returns','shipping-policy':'/delivery','privacy-policy':'/privacy','terms-of-service':'/terms','contact-information':'/contact'};
const articleAliases={
  'ps2-fat-vs-ps2-slim-which-should-you-buy':'ps2-fat-vs-slim',
  'best-pre-owned-ps2-to-buy-uk-2026':'ps2-fat-vs-slim',
};
export function legacyDestination(segments,products=[]){
  let parts=[...segments];
  if(['fr','de','es','it','en','en-gb'].includes(parts[0]))parts=parts.slice(1);
  if(!parts.length)return '/';
  const [section,slug,last]=parts;
  if(section==='pages'&&pages[slug])return pages[slug];
  if(section==='policies'&&policyPages[slug])return policyPages[slug];
  if(section==='collections'&&slug==='all')return '/shop';
  if(section==='products'&&slug){
    const aliases={'playstation-2-memory-card-8mb-official':'sony-playstation-2-official-8-mb-memory-card'};
    const match=products.find(p=>p.slug===(aliases[slug]||slug));
    if(match)return '/product/'+match.slug;
  }
  if(section==='blogs'&&articleAliases[last])return '/blog/'+articleAliases[last];
  if(section==='blogs'&&parts.length<3)return '/blog';
  if(parts.length===1&&['shop','collections','blog','community','support','console-hunt','console-checker','contact','our-story','delivery','returns','terms','privacy','warranty'].includes(section))return '/'+section;
  if(section==='collections'&&['playstation','nintendo','xbox','sega-atari','consoles','handhelds','controllers-cables','cases','gifts-essentials'].includes(slug))return '/collections/'+slug;
  return null;
}
