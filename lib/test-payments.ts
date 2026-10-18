import { assertOwnerTestMode, testCheckoutPlan } from './test-checkout.mjs';
import { db, hash, requireAdmin, setting, viewToken } from './server';
import { merchant, paymentMode, checkoutOrigin, ensureCheckout, type OrderRow } from './payments';
import { business } from './shop';
import { ShopError } from './commerce.mjs';
export async function ownerTestCheckout(request:Request,input:{requestKey?:unknown}){
  await requireAdmin(request);
  const mode=await paymentMode(), m=await merchant('test');
  assertOwnerTestMode({mode,enabled:await setting('payments-enabled')==='1',merchantMode:m?.mode,key:m?.key,signingSecret:m?.webhookSecret});
  if(!m)throw new ShopError('Test merchant unavailable.',503);
  if(typeof input.requestKey!=='string'||!/^[a-f0-9-]{36}$/.test(input.requestKey))throw new ShopError('Please start a new test payment.');
  const requestHash=await hash(`rruk-owner-test:${input.requestKey}`);
  let order=await db().prepare('SELECT * FROM orders WHERE request_hash=?').bind(requestHash).first<OrderRow>();
  if(!order){
    const id=crypto.randomUUID(),now=Date.now(),expiresAt=(Math.floor(now/1000)+1860)*1000;
    const plan=testCheckoutPlan({origin:checkoutOrigin(request),id,token:await viewToken(id),expiresAt,policyVersion:business.policyVersion});
    await db().prepare("INSERT INTO orders(id,request_hash,basket_hash,status,mode,account_id,total_pence,shipping_pence,items_json,policy_version,policy_text,expires_at,created_at,checkout_params) VALUES(?,?,?,'creating','test',?,100,0,?,?,?,?,?,?) ON CONFLICT(request_hash) DO NOTHING").bind(id,requestHash,await hash('rruk-owner-test'),m.accountId,JSON.stringify([{product:plan.product,quantity:1}]),business.policyVersion,'TEST ONLY. No real purchase, no funds moved and no parcel dispatched.',expiresAt,now,JSON.stringify(plan.params)).run();
    order=await db().prepare('SELECT * FROM orders WHERE request_hash=?').bind(requestHash).first<OrderRow>();
  }
  if(!order)throw new ShopError('Test order could not be saved.',503);
  return {url:await ensureCheckout(order,m)};
}
