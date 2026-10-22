import test,{beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,realpathSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const {build}=createRequire(realpathSync(fileURLToPath(import.meta.resolve('vite'))))('esbuild');
const brand=JSON.parse(readFileSync(resolve(root,'operations-brand.json'),'utf8')).id;
const H=globalThis.__portalHarness={user:null,env:{ADMIN_EMAIL:'owner@example.test',STORE_SECRET:'test-only-secret-key-'.repeat(4)},orders:{}};
const hasIntake=brand!=='rruk'&&existsSync(resolve(root,'app/api/leads/route.ts'));
const intakeImport=hasIntake?"import * as intake from './app/api/leads/route.ts';":'const intake=null;';
const compiled=await build({stdin:{contents:`${intakeImport}import * as ops from './lib/operations-server.ts';import * as route from './app/api/portal/[action]/route.ts';import * as core from './lib/operations.mjs';import * as server from './lib/server.ts';export {ops,route,core,server,intake};`,resolveDir:root,sourcefile:'operations-harness.ts'},bundle:true,format:'esm',platform:'node',write:false,tsconfig:resolve(root,'tsconfig.json'),plugins:[{name:'platform-identity-fixture',setup(b){
 b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'fixture'}));
 b.onResolve({filter:/chatgpt-auth$/},()=>({path:'identity',namespace:'fixture'}));
 b.onResolve({filter:/^\.\/payments$/},()=>({path:'payments',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},({path})=>({contents:path==='env'?'export const env=globalThis.__portalHarness.env;':path==='identity'?'export async function getChatGPTUser(){return globalThis.__portalHarness.user;}':"export async function getOrder(id){return globalThis.__portalHarness.orders[id]||null;}export async function orderDocument(o){return 'Order '+o.id;}"}));
}}]});
const {ops,route,core,server,intake}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
let raw;
class Statement{
 constructor(sql,values=[]){this.sql=sql;this.values=values;}
 bind(...values){return new Statement(this.sql,values);}
 async first(){return raw.prepare(this.sql).get(...this.values)||null;}
 async all(){return {results:raw.prepare(this.sql).all(...this.values)};}
 async run(){const r=raw.prepare(this.sql).run(...this.values);return {meta:{changes:Number(r.changes)}};}
}
beforeEach(()=>{raw?.close();raw=new DatabaseSync(':memory:');raw.exec('PRAGMA foreign_keys=ON');for(const file of readdirSync(resolve(root,'drizzle')).filter(f=>f.endsWith('.sql')).sort())raw.exec(readFileSync(resolve(root,'drizzle',file),'utf8'));H.user=null;H.orders={};H.env.DB={prepare:sql=>new Statement(sql),async batch(statements){raw.exec('BEGIN');try{const results=[];for(const stmt of statements)results.push(await stmt.run());raw.exec('COMMIT');return results;}catch(e){raw.exec('ROLLBACK');throw e;}}};});
after(()=>raw?.close());
function user(id='customer-a',email=id+'@example.test'){return {userId:id,email,displayName:id,fullName:null};}
function actor(id='customer-a'){return {user:user(id),owner:false};}
const owner=()=>({user:user('owner','owner@example.test'),owner:true});
function input(extra={}){return {brand,kind:'enquiry',title:'A useful test request',description:'Please help with this fictional customer request.',privacy:true,requestKey:crypto.randomUUID(),...extra};}
async function created(a=actor(),extra={}){return (await ops.createCase(input(extra),a)).id;}
const ctx=action=>({params:Promise.resolve({action})});
function req(action,body,origin='https://portal.example.test'){return new Request('https://portal.example.test/api/portal/'+action,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});}

test('anonymous APIs fail closed, customers cannot read the owner list, and cross-origin writes are rejected',async()=>{
 assert.equal((await route.GET(new Request('https://portal.example.test/api/portal/cases'),ctx('cases'))).status,401);
 H.user=user();assert.equal((await route.GET(new Request('https://portal.example.test/api/portal/customers'),ctx('customers'))).status,403);
 assert.equal((await route.POST(req('create',input(),'https://attacker.example'),ctx('create'))).status,403);
});
test('real migrated records are account scoped even when two accounts have the same email',async()=>{
 const a=actor(),id=await created(a),other={user:user('customer-b',a.user.email),owner:false};
 assert.equal((await ops.listCases(a)).cases.length,1);assert.equal((await ops.listCases(other)).cases.length,0);
 await assert.rejects(ops.caseDetail(id,other),e=>e.status===404);
 assert.equal((await ops.listCases(owner())).cases.length,1);
});
test('duplicate request retries preserve a single record and changed-payload retries fail',async()=>{
 const p=input(),a=actor(),one=await ops.createCase(p,a),two=await ops.createCase(p,a);assert.equal(one.id,two.id);assert.equal(two.created,false);
 await assert.rejects(ops.createCase({...p,title:'Changed request'},a),e=>e.status===409);
 assert.equal(raw.prepare('SELECT COUNT(*) n FROM ops_cases').get().n,1);
});
test('private notes and quote drafts never appear in customer records or downloads',async()=>{
 const a=actor(),id=await created(a);await ops.addMessage({id,body:'Owner-only internal note',internal:true,requestKey:crypto.randomUUID()},owner());
 await ops.addMessage({id,body:'A shared update',requestKey:crypto.randomUUID()},owner());
 await ops.saveQuote({id,revision:0,quotePence:12345,quoteTerms:'Unreleased private scope',quoteStatus:'draft'},owner());
 const customer=await ops.caseDetail(id,a),all=JSON.stringify(customer);assert.match(all,/A shared update/);assert.doesNotMatch(all,/Owner-only|Unreleased|private quote draft/i);assert.equal(customer.record.quotePence,null);
 const owned=await ops.caseDetail(id,owner());assert.equal(owned.messages.length,2);assert.equal(owned.record.quotePence,12345);
});
test('customers cannot change statuses or impersonate owners; cancellation records a request',async()=>{
 const a=actor(),id=await created(a);await assert.rejects(ops.updateCase({id,revision:0,status:'completed'},a),e=>e.status===403);
 await ops.updateCase({id,revision:0,action:'cancel'},a);assert.equal((await ops.caseDetail(id,a)).record.status,'cancel_requested');
 await assert.rejects(ops.updateCase({id,revision:1,action:'cancel'},a),e=>e.status===409);
});
test('concurrent stale edits cannot overwrite the winner or create phantom activity',async()=>{
 const id=await created(),results=await Promise.allSettled([ops.updateCase({id,revision:0,status:'in_progress'},owner()),ops.updateCase({id,revision:0,status:'closed'},owner())]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);
 assert.equal(raw.prepare("SELECT COUNT(*) n FROM ops_events WHERE action='status'").get().n,1);assert.equal(raw.prepare('SELECT revision FROM ops_cases WHERE id=?').get(id).revision,1);
});
test('quotes require owner access, explicit customer review and current revision; accepted scope is preserved',async()=>{
 const a=actor(),id=await created(a),q={id,revision:0,quotePence:22500,quoteTerms:'Fictional agreed scope; £225 total.',quoteStatus:'sent'};
 await assert.rejects(ops.saveQuote(q,a),e=>e.status===403);await ops.saveQuote(q,owner());
 await assert.rejects(ops.replyQuote({id,revision:1,answer:'accepted'},a));await ops.replyQuote({id,revision:1,answer:'accepted',confirm:true},a);
 assert.equal((await ops.caseDetail(id,a)).record.quoteStatus,'accepted');await assert.rejects(ops.saveQuote({...q,revision:2,quotePence:99999},owner()),e=>e.status===409);
 await assert.rejects(ops.replyQuote({id,revision:1,answer:'declined',confirm:true},a),e=>e.status===409);
});
test('private guest records need explicit owner verification before an existing account can access them',async()=>{
 const a=actor();await created(a);const id=await created(owner(),{manual:true,customerName:'Guest',customerEmail:a.user.email});
 await assert.rejects(ops.caseDetail(id,a),e=>e.status===404);await assert.rejects(ops.assignCustomer({id,revision:0,customerUserId:a.user.userId},owner()));
 await ops.assignCustomer({id,revision:0,customerUserId:a.user.userId,confirmShare:true},owner());assert.equal((await ops.caseDetail(id,a)).record.userId,a.user.userId);
 await assert.rejects(ops.assignCustomer({id,revision:1,customerUserId:a.user.userId,confirmShare:true},owner()),e=>e.status===409);
});
test('file permissions check ownership and file types reject executable or disguised content',async()=>{
 const id=await created();const fileId=crypto.randomUUID();raw.prepare('INSERT INTO ops_attachments VALUES(?,?,?,?,?,?,?,?)').run(fileId,id,'customer-a','private/key','evidence.pdf','application/pdf',123,Date.now());
 await assert.rejects(ops.downloadFile(fileId,actor('customer-b')),e=>e.status===404);
 assert.equal(core.attachmentType(new TextEncoder().encode('%PDF-test'),'application/pdf'),'application/pdf');assert.throws(()=>core.attachmentType(new TextEncoder().encode('<script>alert(1)</script>'),'application/pdf'));
});
test('London appointment conversion preserves summer, winter and clock-change gaps',()=>{
 assert.equal(core.londonInstant('2026-07-10T09:30'),'2026-07-10T08:30:00.000Z');assert.equal(core.londonInstant('2026-12-10T09:30'),'2026-12-10T09:30:00.000Z');
 assert.throws(()=>core.londonInstant('2026-03-29T01:30'));assert.throws(()=>core.londonInstant('2026-02-30T10:00'));assert.equal(core.londonInput('2026-07-10T08:30:00.000Z'),'2026-07-10T09:30');
});
test('business boundaries, provider links and ownership fields reject client forgery',()=>{
 assert.throws(()=>core.parseRequest(input({brand:brand==='rruk'?'garden':'rruk'})));const p=core.parseRequest(input({user_id:'other',status:'completed',owner:true}));assert.equal(p.user_id,undefined);assert.equal(p.status,undefined);
 assert.throws(()=>core.safeProviderUrl('https://calendly.com.attacker.test/'));assert.throws(()=>core.safeProviderUrl('javascript:alert(1)'));assert.equal(core.safeProviderUrl('https://calendly.com/example'),'https://calendly.com/example');
});

test('public enquiry intake allows only the owning business website and deduplicates safe retries',{skip:!hasIntake},async()=>{
 const origin=brand==='bytova'?'https://bytova.co.uk':'https://stoneandsprig.co.uk',payload={brand,requestKey:crypto.randomUUID(),name:'Fictional Visitor',email:'visitor@example.test',title:'Fictional enquiry',body:'Please discuss this fictional project.',privacyAccepted:true};
 const request=(p=payload,o=origin)=>new Request('https://portal.example.test/api/leads',{method:'POST',headers:{origin:o,'content-type':'application/json'},body:JSON.stringify(p)});
 const pre=await intake.OPTIONS(new Request('https://portal.example.test/api/leads',{method:'OPTIONS',headers:{origin}}));assert.equal(pre.status,204);assert.equal(pre.headers.get('access-control-allow-origin'),origin);
 assert.equal((await intake.POST(request(payload,'https://attacker.example'))).status,403);assert.equal((await intake.POST(request({...payload,brand:brand==='bytova'?'garden':'bytova'}))).status,400);
 assert.equal((await intake.POST(request(null))).status,400);assert.equal((await intake.POST(request({...payload,privacyAccepted:false}))).status,400);
 const one=await intake.POST(request()),body=await one.json(),two=await intake.POST(request());assert.equal(one.status,200);assert.equal((await two.json()).reference,body.reference);
 assert.equal((await intake.POST(request({...payload,title:'Changed retry'}))).status,409);
 const rows=raw.prepare('SELECT * FROM ops_cases').all();assert.equal(rows.length,1);assert.equal(rows[0].user_id,null);assert.equal(rows[0].brand,brand);assert.equal(rows[0].kind,'enquiry');assert.equal((await ops.listCases(actor())).cases.length,0);
});
