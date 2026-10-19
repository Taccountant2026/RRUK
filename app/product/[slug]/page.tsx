import { ProductDetail } from '@/components/Storefront';
import { getProducts } from '@/lib/catalogue-server';
import { notFound } from 'next/navigation';
import { env } from 'cloudflare:workers';
import { StructuredData } from '@/components/StructuredData';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params,p=(await getProducts()).find(p=>p.slug===slug);return {title:p?.title||'Item unavailable',description:p?.description.slice(0,160),alternates:{canonical:'/product/'+slug},openGraph:p?{title:p.title,description:p.description.slice(0,160),images:p.images}:undefined};}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,p=(await getProducts()).find(p=>p.slug===slug);if(!p)notFound();
 const origin=env.PUBLIC_ORIGIN||'https://retroreplay.uk';
 const offer=!p.catalogueOnly?{'@type':'Offer',priceCurrency:'GBP',price:(p.pricePence/100).toFixed(2),url:origin+'/product/'+p.slug,availability:!p.active?'https://schema.org/OutOfStock':p.saleMode==='source'?'https://schema.org/PreOrder':p.stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock',itemCondition:p.condition==='New'?'https://schema.org/NewCondition':'https://schema.org/UsedCondition',seller:{'@type':'Organization',name:'RetroReplay UK'}}:undefined;
 return <><StructuredData data={{'@context':'https://schema.org','@type':'Product',name:p.title,description:p.description,image:p.images.map(i=>origin+i),sku:p.id,offers:offer}}/><ProductDetail slug={slug}/></>;
}
