import { requestAlertStatements } from '@/lib/notification-server';
import { bodyJson, db, hash, json, rateLimit, respond, sameOrigin } from '@/lib/server';
import { ShopError } from '@/lib/commerce.mjs';
import { parseEnquiry, enquiryPayload, assertMatchingEnquiry, insertEnquirySql } from '@/lib/enquiry.mjs';
import { getProducts } from '@/lib/catalogue-server';
export const dynamic='force-dynamic';
export async function POST(request:Request) { return respond(async()=>{
  sameOrigin(request);
  await rateLimit(request,'enquiry');
  const input=parseEnquiry(await bodyJson(request,8000));
  const requestHash=await hash(`rruk-enquiry:${input.requestKey}`),payloadHash=await hash(enquiryPayload(input));
  type Existing={id:string;payload_hash:string};
  const existing=await db().prepare('SELECT id,payload_hash FROM enquiries WHERE request_hash=?').bind(requestHash).first<Existing>();
  if(existing) return json({reference:assertMatchingEnquiry(existing,payloadHash)});
  const product=(await getProducts()).find(p=>p.id===input.productId&&p.catalogueOnly&&p.active);
  if(!product) throw new ShopError('Please open the current item page before requesting availability.',409);
  const id=crypto.randomUUID(),now=Date.now();
  const messages=await requestAlertStatements('enquiry',id,product.title);
  await db().batch([db().prepare(insertEnquirySql()).bind(id,requestHash,payloadHash,product.id,product.slug,product.title,input.name,input.email,input.quantity,input.notes,now,now),...messages]);
  // A concurrent retry returns the first reference and never inserts a second request.
  const saved=await db().prepare('SELECT id,payload_hash FROM enquiries WHERE request_hash=?').bind(requestHash).first<Existing>();
  if(!saved) throw new ShopError('Your request could not be saved. Please try again.',503);
  return json({reference:assertMatchingEnquiry(saved,payloadHash)},201);
}); }
