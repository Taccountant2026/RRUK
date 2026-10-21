import type { MetadataRoute } from 'next';
import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
export default function robots(): MetadataRoute.Robots {
  const origin=(env.PUBLIC_ORIGIN||'').replace(/\/$/,'');
  const indexable=env.SITE_INDEXABLE==='true'||origin==='https://retroreplay.uk';
  return {rules:{userAgent:'*',disallow:indexable?['/admin','/basket','/saved','/order/','/api/']:'/'},...(indexable&&origin?{sitemap:`${origin}/sitemap.xml`}:{})};
}
