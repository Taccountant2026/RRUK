import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { collections,inCollection,browseFilters,browseProducts,browseUrl } from '../lib/browse.mjs';
import { sourceOrderCatalogue } from '../lib/source-orders.mjs';
import { readCart } from '../lib/cart.mjs';
import { parseSubmission,publicStory,canPublish,submissionPayload,submissionSql,matchingSubmission } from '../lib/community.mjs';
import { legacyDestination } from '../lib/legacy.mjs';
import { journal } from '../lib/journal.mjs';
const products=sourceOrderCatalogue(JSON.parse(fs.readFileSync(new URL('../lib/sourcing-catalogue.json',import.meta.url))));
test('every imported choice is discoverable in a nonempty collection',()=>{
  assert.equal(products.length,65);
  for(const p of products)assert.ok(collections.some(c=>inCollection(p,c.slug)),p.title);
  for(const c of collections)assert.ok(products.some(p=>inCollection(p,c.slug)),c.slug);
});
test('search understands familiar PS2, N64 and Gameboy names',()=>{
  for(const [q,expected] of [['ps2','PlayStation 2'],['n64','Nintendo 64'],['gameboy','Game Boy']]){
    const matches=browseProducts(products,browseFilters({q}));assert.ok(matches.some(p=>p.title.includes(expected)),q);
  }
});
test('price filters exclude unquoted packs and sorting does not invent a pack price',()=>{
  const matches=browseProducts(products,browseFilters({max:'50',sort:'price-low'}));
  assert.ok(matches.length>0);assert.ok(matches.every(p=>!p.catalogueOnly&&p.pricePence<=5000));
  assert.deepEqual(matches.map(p=>p.pricePence),matches.map(p=>p.pricePence).sort((a,b)=>a-b));
  assert.ok(browseProducts(products,browseFilters({sort:'price-high'})).slice(-6).every(p=>p.catalogueOnly));
});
test('browse query bounds arrays, invalid collection and page and encodes search safely',()=>{
  const f=browseFilters({q:['not a string'],page:'-4',collection:'missing',sort:'bad',max:'NaN'});
  assert.equal(f.q,'');assert.equal(f.page,1);assert.equal(f.collection,'all');assert.equal(f.sort,'featured');assert.equal(f.max,'');
  const url=browseUrl(browseFilters({q:'PS2 & white',collection:'playstation'}),{page:2});
  assert.equal(new URL(url,'https://example.com').searchParams.get('q'),'PS2 & white');
  assert.equal(new URL(url,'https://example.com').searchParams.get('page'),'2');
});
test('cart survives encoded document navigation while rejecting forged counts and duplicate lines',()=>{
  const id=products[0].id,raw=JSON.stringify([{id,quantity:2},{id,quantity:5},{id:'other',quantity:200},{id:'bad<script>',quantity:1}]);
  assert.deepEqual(readCart(encodeURIComponent(raw)),[{id,quantity:2}]);
  for(const bad of [null,'null','{}','%broken','x'.repeat(6000)])assert.deepEqual(readCart(bad),[]);
});
const base={requestKey:randomUUID(),kind:'story',name:' Player Two ',email:'PLAYER@example.test',title:'My first console',body:'An original memory of playing together after school.',publishConsent:true,privacyAccepted:true,website:''};
test('story publication needs permission and private requests cannot acquire it by forgery',()=>{
  const p=parseSubmission(base);assert.equal(p.name,'Player Two');assert.equal(p.email,'player@example.test');assert.equal(p.consent,1);
  assert.throws(()=>parseSubmission({...base,publishConsent:false}),/permission/);assert.throws(()=>parseSubmission({...base,privacyAccepted:false}),/privacy/);
  const hunt=parseSubmission({...base,kind:'hunt',publishConsent:true});assert.equal(hunt.consent,0);assert.equal(canPublish(hunt),false);
  assert.throws(()=>parseSubmission({...base,website:'spam.test'}));assert.throws(()=>parseSubmission({...base,title:'Header\ninjection'}));
});
test('public projection omits email and retry identity rejects changed content',()=>{
  const s=parseSubmission(base),row={...s,id:randomUUID(),created_at:1,status:'published',email:'private@example.test',request_hash:'private',payload_hash:'hash'};
  assert.deepEqual(Object.keys(publicStory(row)).sort(),['body','createdAt','id','name','title'].sort());
  assert.equal(publicStory({...row,kind:'hunt'}),null);assert.equal(publicStory({...row,status:'new'}),null);assert.equal(publicStory({...row,consent:0}),null);
  assert.equal(matchingSubmission(row,'hash'),row.id);assert.throws(()=>matchingSubmission(row,'different'),/changed/);
  assert.notEqual(submissionPayload(s),submissionPayload({...s,body:s.body+' changed'}));
});
test('actual migrated SQLite enforces moderation and idempotency and omits public email',()=>{
  const schema=fs.readdirSync(new URL('../drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')).sort().map(f=>fs.readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8')).join('\n');
  const py=fs.readFileSync(new URL('./community_scenarios.py',import.meta.url),'utf8');
  assert.equal(execFileSync('python3',['-c',py],{input:JSON.stringify({schema,insert:submissionSql()}),encoding:'utf8'}).trim(),'ok');
});
test('old shop routes recover exact matches and preserve real missing pages',()=>{
  const p=products.find(p=>p.title.includes('official 8 MB memory card'));
  assert.equal(legacyDestination(['products','playstation-2-memory-card-8mb-official'],products),'/product/'+p.slug);
  assert.equal(legacyDestination(['fr','pages','console-hunt']),'/console-hunt');
  assert.equal(legacyDestination(['policies','refund-policy']),'/returns');
  assert.equal(legacyDestination(['blogs','retro-console-buying-advice','ps2-fat-vs-ps2-slim-which-should-you-buy']),'/blog/ps2-fat-vs-slim');
  assert.equal(legacyDestination(['products','unknown-rare-product'],products),null);
});
test('journal articles are substantive and lead to real collections',()=>{
  assert.equal(journal.length,8);assert.equal(new Set(journal.map(a=>a.slug)).size,8);
  for(const a of journal){
    assert.ok(a.sections.length>=4);
    assert.ok(a.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length>230,a.slug);
    assert.ok(a.collection==='all'||collections.some(c=>c.slug===a.collection));
    for(const s of a.sources)assert.ok(['www.playstation.com','www.nintendo.com'].includes(new URL(s.href).hostname));
  }
});
