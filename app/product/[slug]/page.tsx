import { ProductDetail } from '@/components/Storefront';
import { getProducts } from '@/lib/catalogue-server';
import { notFound } from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug:string }> }) { const {slug}=await params,p=(await getProducts()).find(p=>p.slug===slug);return {title:p?.title||'Item unavailable',description:p?.description.slice(0,160),alternates:{canonical:`/product/${slug}`}}; }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if(!(await getProducts()).some(p=>p.slug===slug))notFound();return <ProductDetail slug={slug}/>; }
