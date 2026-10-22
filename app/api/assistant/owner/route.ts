import {bodyJson,respond,json,sameOrigin} from '@/lib/server';
import {ownerAssistant} from '@/lib/owner-assistant-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){return respond(async()=>{sameOrigin(request);return json(await ownerAssistant(await bodyJson(request,20000)));});}
