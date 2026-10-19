import { notFound, permanentRedirect } from 'next/navigation';
import { Catalogue } from '@/components/Storefront';
import { browseFilters, collections } from '@/lib/browse.mjs';
export const dynamic='force-dynamic';
const aliases:Record<string,string>={'all':'/shop','limited-edition-rare-collector-consoles-retroreplay-uk':'/collections/consoles','consoles-handhelds':'/collections/consoles','accessories':'/collections/controllers-cables','games':'/console-hunt'};
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params,c=collections.find(x=>x.slug===slug);return {title:c?c.name+' retro gaming collection':'Collection',description:c?.description,alternates:{canonical:'/collections/'+slug}};}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {slug}=await params;
  if(aliases[slug])permanentRedirect(aliases[slug]);
  if(!collections.some(c=>c.slug===slug))notFound();
  return <Catalogue collectionSlug={slug} filters={browseFilters({...await searchParams,collection:slug})}/>;
}
