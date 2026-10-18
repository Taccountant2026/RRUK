import { getProducts } from '@/lib/catalogue-server';
import { respond, json } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET() { return respond(async()=>json({products:await getProducts()})); }
