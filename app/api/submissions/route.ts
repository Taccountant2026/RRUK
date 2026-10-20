import {funnelRoute,campaignValue} from '@/lib/funnels.mjs';
import {funnelMetaStatement} from '@/lib/funnel-server';
import { requestAlertStatements } from '@/lib/notification-server';
import { bodyJson, db, hash, json, rateLimit, respond, sameOrigin } from '@/lib/server';
import { matchingSubmission, parseSubmission, submissionPayload, submissionSql } from '@/lib/community.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return respond(async()=>{
  sameOrigin(request);
  const raw=await bodyJson(request,20000),input=parseSubmission(raw),requestHash=await hash(input.requestKey),payloadHash=await hash(submissionPayload(input));
  let row=await db().prepare('SELECT id,payload_hash FROM community_submissions WHERE request_hash=?').bind(requestHash).first<{id:string;payload_hash:string}>();
  if(row)return json({reference:matchingSubmission(row,payloadHash)});
  await rateLimit(request,'community');
  const id=crypto.randomUUID(),now=Date.now();
  const messages=await requestAlertStatements(input.kind==='story'?'story':'shopping',id,input.title);
  const route=funnelRoute('rruk',raw.route)?.id||(input.kind==='hunt'?'collector':'general');
  const meta=input.kind==='story'?[]:[await funnelMetaStatement(id,'rruk',route,campaignValue(raw.campaign))];
  await db().batch([db().prepare(submissionSql()).bind(id,requestHash,payloadHash,input.kind,input.name,input.email,input.title,input.body,input.consent,now,now),...meta,...messages]);
  row=await db().prepare('SELECT id,payload_hash FROM community_submissions WHERE request_hash=?').bind(requestHash).first<{id:string;payload_hash:string}>();
  if(!row)throw new Error('Submission not saved');
  return json({reference:matchingSubmission(row,payloadHash)},201);
});}
