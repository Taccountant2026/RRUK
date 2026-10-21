import type { MetadataRoute } from 'next';
import { env } from 'cloudflare:workers';
import { getProducts } from '@/lib/catalogue-server';
import { collections } from '@/lib/browse.mjs';
import { journal } from '@/lib/journal.mjs';
import { getStories } from '@/lib/community-server';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const origin=(env.PUBLIC_ORIGIN||'').replace(/\/$/,'');
  const indexable=env.SITE_INDEXABLE==='true'||origin==='https://retroreplay.uk';
  if(!indexable||!origin)return [];
  const [products,stories]=await Promise.all([getProducts(),getStories()]);
  const paths=['','start','gifts','personal-shopper','why-rruk','console-finder','shop','collections','blog','community','community/guidelines','console-hunt','console-checker','how-it-works','order-help','our-story','support','condition-guide','delivery','returns','warranty','terms','privacy','contact','accessibility',
    ...collections.map(c=>'collections/'+c.slug),...journal.map(a=>'blog/'+a.slug),...products.filter(p=>p.active).map(p=>'product/'+p.slug),...stories.map(s=>'community/story/'+s.id)];
  return paths.map(path=>({url:origin+'/'+path}));
}
