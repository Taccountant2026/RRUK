import type { MetadataRoute } from 'next';
import { env } from 'cloudflare:workers';
import { getProducts } from '@/lib/catalogue-server';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{if(env.SITE_INDEXABLE!=='true'||!env.PUBLIC_ORIGIN)return [];return ['','shop','our-story','support','condition-guide','delivery','returns','warranty','terms','privacy','contact','accessibility',...(await getProducts()).map(p=>`product/${p.slug}`)].map(path=>({url:`${env.PUBLIC_ORIGIN}/${path}`}));}
