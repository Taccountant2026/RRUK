import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnquiry, enquiryPayload, assertMatchingEnquiry, insertEnquirySql } from '../lib/enquiry.mjs';
import { priceBasket, parseBasket } from '../lib/commerce.mjs';
const catalogue=JSON.parse(readFileSync(new URL('../lib/sourcing-catalogue.json',import.meta.url),'utf8'));
const valid={requestKey:'69df1af1-7d01-4acf-b7da-c7903bd45884',productId:catalogue[0].id,name:'Customer Example',email:'CUSTOMER@EXAMPLE.COM',quantity:1,notes:'Please confirm the region and controller.'};
test('all 67 source options become 65 unique enquiries, with no fabricated checkout stock',()=>{
 assert.equal(catalogue.length,65);assert.equal(new Set(catalogue.map(p=>p.id)).size,65);assert.equal(new Set(catalogue.map(p=>p.slug)).size,65);
 assert.equal(catalogue.reduce((n,p)=>n+p.sourceItemIds.length,0),67);assert.equal(new Set(catalogue.flatMap(p=>p.sourceItemIds)).size,62);
 for(const p of catalogue){assert.equal(p.catalogueOnly,true);assert.equal(p.stock,0);assert.equal(p.condition,'To be confirmed');assert.ok(existsSync(new URL(`../public${p.images[0]}`,import.meta.url)));assert.throws(()=>priceBasket([{id:p.id,quantity:1}],[{...p,stock:9999}]));}
 const variants=catalogue.filter(p=>p.sourceItemIds.includes('397880505209'));assert.equal(variants.length,6);assert.ok(variants.every(p=>p.priceOnRequest&&p.pricePence===0));
 const cases=catalogue.filter(p=>p.artKind==='cases');assert.equal(cases.length,3);assert.ok(cases.every(p=>p.priceOnRequest));
 const cube=catalogue.find(p=>p.sourceItemIds.includes('397885841575'));assert.deepEqual(cube.sourceItemIds,['397885841575','397885844900']);assert.equal(cube.pricePence,16799);assert.equal(cube.guidePriceMaxPence,28999);
});
test('request input is bounded, normalised and excludes caller prices, statuses and stock',()=>{
 const parsed=parseEnquiry({...valid,pricePence:1,stock:100,status:'paid',name:'  Customer Example  '});
 assert.equal(parsed.name,'Customer Example');assert.equal(parsed.email,'customer@example.com');assert.equal('pricePence' in parsed,false);assert.equal('status' in parsed,false);
 for(const change of [{email:'bad-address'},{name:'A\r\nB'},{name:''},{quantity:0},{quantity:11},{quantity:1.5},{notes:'x'.repeat(1501)},{notes:'x\u0000y'},{requestKey:'not-a-uuid'},{productId:'actual-sale-item'}])assert.throws(()=>parseEnquiry({...valid,...change}));
});
test('same-payload retries return their reference; changing the request key payload cannot disclose a reference',()=>{
 assert.equal(enquiryPayload(parseEnquiry(valid)),enquiryPayload(parseEnquiry({...valid,email:'customer@example.com'})));
 assert.notEqual(enquiryPayload(parseEnquiry(valid)),enquiryPayload(parseEnquiry({...valid,email:'another@example.com'})));
 assert.equal(assertMatchingEnquiry({id:'saved-reference',payload_hash:'same'},'same'),'saved-reference');
 assert.throws(()=>assertMatchingEnquiry({id:'private-reference',payload_hash:'original'},'changed'),e=>e.status===409&&!e.message.includes('private-reference'));
});
test('previous policy consent cannot silently accept the revised sale terms',()=>{assert.throws(()=>parseBasket({termsAccepted:true,policyVersion:'2026-10-18',requestKey:valid.requestKey,items:[{id:'one',quantity:1}]}));});
test('production enquiry schema and SQL deduplicate retries, preserve the original payload and enforce bounds',()=>{
 const schema=readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort().map(f=>readFileSync(new URL(`../drizzle/${f}`,import.meta.url),'utf8')).join('\n');
 const script=`import json,sqlite3,sys\np=json.load(sys.stdin)\nc=sqlite3.connect(':memory:');c.executescript(p['schema'])\nrow=('first','request-hash','payload-hash','source-1','example-slug','Example item','Customer','customer@example.com',1,'Original request',1,1)\nc.execute(p['insert'],row)\nretry=('second',)+row[1:]\nc.execute(p['insert'],retry)\nchanged=('third','request-hash','different-payload')+row[3:7]+('different@example.com',)+row[8:]\nc.execute(p['insert'],changed)\nassert c.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0]==1\nassert c.execute('SELECT id,payload_hash,email,status FROM enquiries').fetchone()==('first','payload-hash','customer@example.com','new')\nfor field,value in [('quantity',0),('quantity',11),('status','paid')]:\n try:\n  c.execute('UPDATE enquiries SET '+field+'=?',(value,));raise AssertionError('Expected constraint')\n except sqlite3.IntegrityError:pass\nc.execute(\"UPDATE enquiries SET status='closed',closed_at=2 WHERE id='first'\")\nc.execute(\"DELETE FROM enquiries WHERE status='closed' AND closed_at<?\",(3,))\nassert c.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0]==0\nassert c.execute('SELECT COUNT(*) FROM products').fetchone()[0]==0\nassert c.execute('SELECT COUNT(*) FROM orders').fetchone()[0]==0\nprint('enquiry SQL scenarios passed')`;
 const result=spawnSync('python',['-c',script],{input:JSON.stringify({schema,insert:insertEnquirySql()}),encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);assert.match(result.stdout,/enquiry SQL scenarios passed/);
});
