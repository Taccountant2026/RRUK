import {bodyJson,json,respond} from '@/lib/server';
import {parseStatistic,statisticsOrigin} from '@/lib/measurement.mjs';
import {saveStatistic} from '@/lib/measurement-server';
export const dynamic='force-dynamic';
function cors(request:Request,response:Response){const origin=request.headers.get('origin')||'';if(statisticsOrigin(origin,new URL(request.url).origin)){response.headers.set('Access-Control-Allow-Origin',origin);response.headers.set('Vary','Origin');response.headers.set('Access-Control-Allow-Methods','POST, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type');}return response;}
export async function OPTIONS(request:Request){return cors(request,new Response(null,{status:statisticsOrigin(request.headers.get('origin')||'',new URL(request.url).origin)?204:403,headers:{'Cache-Control':'no-store'}}));}
export async function POST(request:Request){const origin=request.headers.get('origin')||'',requestOrigin=new URL(request.url).origin;if(!statisticsOrigin(origin,requestOrigin))return json({error:'Origin not allowed.'},403);return cors(request,await respond(async()=>{const input=parseStatistic(await bodyJson(request,2000),origin,requestOrigin);await saveStatistic(request,input);return json({saved:true},201);}));}
