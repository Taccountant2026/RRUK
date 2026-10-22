import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import * as core from '../public/statistics-core.mjs';
import {parseStatistic,statisticsPage,statisticRecord,statisticSql,statisticsSummary,statisticsOrigin,statisticsSince} from '../lib/measurement.mjs';
const now=Date.UTC(2026,9,20,13),choice={version:1,allowed:true,at:now};
const input={brand:'garden',page:'/Turf-Right/garden-planner.html',event:'complete_tool',campaign:'outdoor-planner-autumn26',consent:true};
test('statistics require a current deliberate choice and honour opt-out, browser signals and preview isolation',()=>{
 const base={choice,brand:'garden',path:input.page,event:'page_view',campaign:input.campaign};
 for(const changed of[{choice:null},{choice:{...choice,allowed:false}},{choice:{...choice,at:now-181*86400000}},{choice:{...choice,at:now+86400000}},{doNotTrack:true},{preview:true}])assert.equal(core.permittedEvent({...base,...changed},now),null);
 assert(core.permittedEvent(base,now));for(const raw of['bad','{}','null','[]'])assert.equal(core.readChoice(raw,now),null);
});
test('private pages, order identifiers, queries and arbitrary campaign labels cannot enter analytics',()=>{
 for(const path of['/admin','/admin/settings','/api/catalogue','/order/private-token','/shop?email=private','/shop#private','/product/%2e%2e','/shop\\private'])assert.equal(statisticsPage('rruk',path),null);
 const record=parseStatistic({...input,email:'private@example.invalid',body:'private text',campaign:'private@example.invalid'},'https://taccountant2026.github.io','https://retroreplay.uk');assert.deepEqual(Object.keys(record).sort(),['brand','campaign','event','page']);assert.equal(record.campaign,'');
 assert.equal(statisticsPage('rruk','/product/known-public-slug'),'/product/*');assert.equal(statisticsPage('garden','/Turf-Right/checkout.html'),null);
});
test('intake ties a brand to its exact owned origin and rejects absent consent before storage',()=>{
 for(const origin of ['https://stoneandsprig.co.uk','https://www.stoneandsprig.co.uk']){assert(statisticsOrigin(origin,'https://retroreplay.uk'));assert.equal(parseStatistic({...input,page:'/garden-planner.html'},origin,'https://retroreplay.uk').brand,'garden');}
 assert.equal(core.publicPage('garden','/garden-planner.html'),'/garden-planner.html');assert.equal(core.publicPage('garden','/checkout.html'),null);
 assert.equal(parseStatistic(input,'https://taccountant2026.github.io','https://retroreplay.uk').brand,'garden');
 for(const change of[{consent:false},{brand:'__proto__'},{event:'purchase'},{page:'/Turf-Right/admin.html'}])assert.throws(()=>parseStatistic({...input,...change},'https://taccountant2026.github.io','https://retroreplay.uk'));
 for(const origin of['https://another-user.github.io','https://taccountant2026.github.io.evil.invalid','https://bytova.co.uk'])assert.throws(()=>parseStatistic(input,origin,'https://retroreplay.uk'));
 assert(!statisticsOrigin('','https://retroreplay.uk'));assert(!statisticsOrigin('https://evil.invalid','https://retroreplay.uk'));
});
test('daily aggregates count events accurately without claiming unique visitors or paid conversions',()=>{
 const one=statisticRecord(input,now),view=statisticRecord({...input,event:'page_view'},now);assert.equal(JSON.parse(one.value).day,'2026-10-20');
 const totals=statisticsSummary([{value:JSON.stringify({...JSON.parse(view.value),count:7})},{value:JSON.stringify({...JSON.parse(one.value),count:3})},{value:'bad'}],'garden');assert.equal(totals.pageViews,7);assert.equal(totals.toolCompletions,3);assert.equal(totals.campaigns[0].count,7);assert(!('uniqueVisitors'in totals));assert(!('purchases'in totals));
});
test('actual SQLite aggregate SQL is atomic under concurrent requests and does not alter other business settings',()=>{
 const schema=readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort().map(f=>readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8')).join('\n'),record=statisticRecord(input,now);
 const py=`import sqlite3,tempfile,json,sys,concurrent.futures,os\nd=json.load(sys.stdin)\nf=tempfile.NamedTemporaryFile(delete=False);p=f.name;f.close()\nc=sqlite3.connect(p);c.executescript(d['schema']);c.execute("PRAGMA journal_mode=WAL");c.execute("INSERT INTO settings(key,value,updated_at) VALUES('payment-sentinel','unchanged',1)");c.commit();c.close()\ndef worker(_):\n c=sqlite3.connect(p,timeout=20)\n for i in range(50):c.execute(d['sql'],(d['key'],d['value'],d['now']));c.commit()\n c.close()\nwith concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(worker,range(8)))\nc=sqlite3.connect(p);v=json.loads(c.execute('SELECT value FROM settings WHERE key=?',(d['key'],)).fetchone()[0]);assert v['count']==400,v;assert c.execute(\"SELECT value FROM settings WHERE key='payment-sentinel'\").fetchone()[0]=='unchanged';c.close();os.unlink(p);print('passed')`;
 const r=spawnSync('python3',['-c',py],{input:JSON.stringify({schema,sql:statisticSql(),...record,now}),encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);assert.match(r.stdout,/passed/);
});
test('the actual browser client sends nothing before opt-in or after withdrawal; only bounded events are transmitted',async()=>{
 const calls=[],listeners={},elements=[];class Element{children=[];isConnected=true;dataset={};append(...items){this.children.push(...items);elements.push(...items);}setAttribute(){}remove(){this.isConnected=false;}focus(){}}
 const body=new Element(),head=new Element(),store=new Map();const document={currentScript:{src:'https://retroreplay.uk/measurement.js',dataset:{brand:'rruk'}},scripts:[],body,head,createElement:()=>new Element(),addEventListener:(key,f)=>{listeners['document:'+key]=f;},activeElement:null};
 const window={addEventListener:(key,f)=>{listeners[key]=f;}};const sandbox={document,window,URL,URLSearchParams,Date,Promise,navigator:{},location:{hostname:'retroreplay.uk',pathname:'/shop',search:'?utm_campaign=rruk-shop-autumn26&email=private'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},fetch:async(url,options)=>{calls.push({url,options});return {};},console,core};
 const source=readFileSync(new URL('../public/measurement.js',import.meta.url),'utf8').replace("import(new URL('statistics-core.mjs',scriptUrl).href)",'Promise.resolve(core)');vm.runInNewContext(source,sandbox);await Promise.resolve();await Promise.resolve();assert.equal(calls.length,0);
 const panel=body.children.find(e=>e.id==='statistics-choice'),actions=panel.children[2];actions.children[0].onclick();assert.equal(calls.length,1);const data=JSON.parse(calls[0].options.body);assert.equal(data.event,'page_view');assert.equal(data.campaign,'rruk-shop-autumn26');assert(!JSON.stringify(data).includes('private'));
 listeners['business-metric']({detail:{event:'save_item',email:'private'}});assert.equal(calls.length,2);body.children[0].onclick();const latest=body.children.filter(e=>e.id==='statistics-choice'&&e.isConnected).at(-1);latest.children[2].children[1].onclick();listeners['business-metric']({detail:{event:'save_item'}});assert.equal(calls.length,2);
});

test('report windows begin at the UK calendar midnight, including both clock-change days',()=>{
 assert.equal(new Date(statisticsSince(1,Date.parse('2026-03-29T12:00:00Z'))).toISOString(),'2026-03-29T00:00:00.000Z');
 assert.equal(new Date(statisticsSince(1,Date.parse('2026-10-25T12:00:00Z'))).toISOString(),'2026-10-24T23:00:00.000Z');
 assert.equal(new Date(statisticsSince(7,Date.parse('2026-10-20T13:00:00Z'))).toISOString(),'2026-10-13T23:00:00.000Z');
});
