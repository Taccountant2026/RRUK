import type { MetadataRoute } from 'next';
import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
export default function robots(): MetadataRoute.Robots { const indexable=env.SITE_INDEXABLE==='true';return {rules:{userAgent:'*',disallow:indexable?['/admin','/basket','/saved','/order/','/api/']:'/'},...(indexable&&env.PUBLIC_ORIGIN?{sitemap:`${env.PUBLIC_ORIGIN}/sitemap.xml`}:{})}; }
