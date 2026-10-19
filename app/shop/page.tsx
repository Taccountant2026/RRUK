import { Catalogue } from '@/components/Storefront';
import { browseFilters } from '@/lib/browse.mjs';
export const dynamic='force-dynamic';
export const metadata={title:'Shop retro consoles, handhelds & accessories',description:'Browse RetroReplay UK by platform, price and product. Classic consoles and accessories sourced to order with tracked UK delivery.',alternates:{canonical:'/shop'}};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <Catalogue filters={browseFilters(await searchParams)}/>;}
