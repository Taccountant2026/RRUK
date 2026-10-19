import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { emailIdentity, notificationPayload, canNotifyOrder, orderEmailText, sendEmail, EmailProviderError, nextEmailAttempt, insertEmailSql, claimEmailSql, RETRY_WINDOW } from '../lib/notifications.mjs';

test('email connection isolates the RRUK sender and rejects header injection',()=>{
 assert.deepEqual(emailIdentity({from:'Orders@updates.retroreplay.uk',owner:'owner@example.test'}),{from:'orders@updates.retroreplay.uk',owner:'owner@example.test'});
 for(const from of ['hello@bytova.co.uk','info@retroreplay.uk.evil.test','x\r\nBcc:spam@example.test'])assert.throws(()=>emailIdentity({from,owner:'owner@example.test'}));
 assert.throws(()=>notificationPayload({from:'info@retroreplay.uk'},'buyer@example.test','Order\nBcc: other','text'));
});
test('automatic order messages require enabled live payment after activation and a verified paid state',()=>{
 const c={enabled:true,startedAt:1000},order={mode:'live',paid_at:2000,status:'paid'};
 assert.equal(canNotifyOrder(order,c),true);
 for(const [o,config] of [[{...order,mode:'test'},c],[{...order,paid_at:null},c],[{...order,paid_at:999},c],[order,{...c,enabled:false}],[order,null]])assert.equal(canNotifyOrder(o,config),false);
 for(const status of ['open','creating','processing','review','expired','failed','refunded'])assert.throws(()=>orderEmailText({...order,status},'saved contract','https://retroreplay.uk/order/ref?token=private'));
 const text=orderEmailText(order,'FULL IMMUTABLE ITEM DETAILS AND TERMS','https://retroreplay.uk/order/ref?token=private');
 assert.match(text,/FULL IMMUTABLE ITEM DETAILS AND TERMS/);assert.match(text,/Keep this link private/);assert.doesNotMatch(text,/marketing|newsletter/);
});
test('provider uses a fixed HTTPS endpoint and stable immutable idempotency payload',async()=>{
 const payload=notificationPayload({from:'info@retroreplay.uk'},'buyer@example.test','Your order','Saved terms');let calls=0;
 const mock=async(url,options)=>{calls++;assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],'rruk-order-123');assert.equal(options.body,JSON.stringify(payload));assert.equal(options.headers.Authorization,'Bearer secret-not-printed');return Response.json({id:'b93b3ce5-38c5-4a7f-bc45-401eb7b5a660'});};
 assert.equal(await sendEmail('secret-not-printed',payload,'rruk-order-123',mock),'b93b3ce5-38c5-4a7f-bc45-401eb7b5a660');assert.equal(calls,1);
});
test('ambiguous transport failures retry within the provider window; permanent and expired cases need review',async()=>{
 const cases=[[429,{},true],[503,{},true],[403,{message:'private token should never appear'},false],[409,{name:'concurrent_idempotent_requests'},true],[409,{name:'invalid_idempotent_request'},false]];
 for(const [status,body,retryable] of cases)await assert.rejects(sendEmail('secret',{},'stable',async()=>Response.json(body,{status})),e=>e instanceof EmailProviderError&&e.retryable===retryable&&!e.message.includes('private token'));
 await assert.rejects(sendEmail('secret',{},'stable',async()=>{throw Error('private network details');}),e=>e.retryable&&!e.message.includes('private network'));
 assert.equal(nextEmailAttempt(1,1000,2000,true).status,'pending');assert.equal(nextEmailAttempt(8,1000,2000,true).status,'review');assert.equal(nextEmailAttempt(1,1000,2000,false).status,'review');assert.equal(nextEmailAttempt(2,1000,1000+RETRY_WINDOW-10,true).status,'review');
});
test('actual migrated SQLite gates dispatch notifications, deduplicates, leases and retains privacy tombstones',()=>{
 const schema=readdirSync(new URL('../drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')).sort().map(f=>readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8')).join('\n');
 const script=readFileSync(new URL('./notification_scenarios.py',import.meta.url),'utf8');
 assert.equal(execFileSync('python3',['-c',script],{input:JSON.stringify({schema,insert:insertEmailSql(),guarded:insertEmailSql('dispatched'),claim:claimEmailSql()}),encoding:'utf8'}).trim(),'ok');
});


test('a complete larger order copy is preserved rather than silently truncated',()=>{
 const text='Saved item and policy detail. '.repeat(8000);
 assert.equal(notificationPayload({from:'info@retroreplay.uk'},'buyer@example.test','Order copy',text).text,text);
});
