import { notFound, permanentRedirect } from 'next/navigation';
import { getProducts } from '@/lib/catalogue-server';
import { legacyDestination } from '@/lib/legacy.mjs';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{legacy:string[]}>}){
  const {legacy}=await params,destination=legacyDestination(legacy,await getProducts());
  if(destination)permanentRedirect(destination);
  notFound();
}
