import {bodyJson,db,hash,json,rateLimit,respond} from '@/lib/server';
import {leadOrigin,parseFunnelLead,leadPayload} from '@/lib/funnels.mjs';
import {matchingSubmission,submissionSql} from '@/lib/community.mjs';
import {funnelMetaStatement} from '@/lib/funnel-server';
import {requestAlertStatements} from '@/lib/notification-server';
export const dynamic='force-dynamic';
function cors(request:Request,response:Response){
 const origin=request.headers.get('origin')||'';
 if(leadOrigin(origin,new URL(request.url).origin)){
  response.headers.set('Access-Control-Allow-Origin',origin);
  response.headers.set('Vary','Origin');
  response.headers.set('Access-Control-Allow-Methods','POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers','Content-Type');
 }
 return response;
}
export async function OPTIONS(request:Request){const allowed=leadOrigin(request.headers.get('origin')||'',new URL(request.url).origin);return cors(request,new Response(null,{status:allowed?204:403,headers:{'Cache-Control':'no-store'}}));}
export async function POST(request:Request){
 if(!leadOrigin(request.headers.get('origin')||'',new URL(request.url).origin))return json({error:'Please send this from Bytova or RetroReplay UK.'},403);
 const response=await respond(async()=>{
  const input=parseFunnelLead(await bodyJson(request,20000)),requestHash=await hash('lead:'+input.requestKey),payloadHash=await hash(leadPayload(input));
  let row=await db().prepare('SELECT id,payload_hash FROM community_submissions WHERE request_hash=?').bind(requestHash).first<{id:string;payload_hash:string}>();
  if(row)return json({reference:matchingSubmission(row,payloadHash)});
  await rateLimit(request,'community');
  // A stable random request UUID makes concurrent retries share one record and alert.
  const id=input.requestKey,now=Date.now(),alerts=await requestAlertStatements(input.brand==='bytova'?'bytova':'shopping',id,input.title);
  await db().batch([
   db().prepare(submissionSql()).bind(id,requestHash,payloadHash,'question',input.name,input.email,input.title,input.body,0,now,now),
   await funnelMetaStatement(id,input.brand,input.route,input.campaign),...alerts,
  ]);
  row=await db().prepare('SELECT id,payload_hash FROM community_submissions WHERE request_hash=?').bind(requestHash).first<{id:string;payload_hash:string}>();
  if(!row)throw new Error('Enquiry not saved');
  return json({reference:matchingSubmission(row,payloadHash)},201);
 });
 return cors(request,response);
}
