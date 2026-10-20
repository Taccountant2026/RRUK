import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {funnelRoutes,funnelRoute,leadOrigin,parseFunnelLead,leadPayload,parseProgress,funnelRecord,followUpDraft,funnelMetaSql,progressSourceSql,campaignHref} from '../lib/funnels.mjs';
import {publicStory,submissionSql,matchingSubmission} from '../lib/community.mjs';
import {insertEmailSql} from '../lib/notifications.mjs';
const base={requestKey:'11111111-1111-4111-8111-111111111111',brand:'bytova',route:'websites',name:'Example visitor',email:'visitor@example.invalid',title:'Bytova: Website enquiry',body:'I would like a practical website for my small business.',privacyAccepted:true,publishConsent:true,campaign:'website-post'};
test('enquiry intake fixes private permission, validates brand and route and bounds campaign labels',()=>{
 const p=parseFunnelLead(base);assert.equal(p.kind,'question');assert.equal(p.consent,0);assert.equal(p.brand,'bytova');assert.equal(publicStory({...p,status:'published'}),null);
 for(const change of[{brand:'unknown'},{brand:'__proto__'},{route:'javascript:alert(1)'},{privacyAccepted:false},{name:'A\r\nB'},{website:'bot'},{email:'bad'},{body:'short'}])assert.throws(()=>parseFunnelLead({...base,...change}));
 assert.equal(parseFunnelLead({...base,campaign:'https://example.invalid/?email=private'}).campaign,'');
 assert.notEqual(leadPayload(p),leadPayload(parseFunnelLead({...base,route:'marketing'})));
 assert.throws(()=>matchingSubmission({id:'private-reference',payload_hash:'old'},'changed'),e=>e.status===409&&!e.message.includes('private-reference'));
 for(const[brand,routes]of Object.entries(funnelRoutes))for(const route of routes)assert(funnelRoute(brand,route.id));
});
test('cross-origin intake allows only the actual site origin and exact owned storefront origins',()=>{
 for(const origin of['https://retroreplay.uk','https://bytova.co.uk','https://www.bytova.co.uk','https://taccountant2026.github.io'])assert(leadOrigin(origin,'https://retroreplay.uk'));
 for(const origin of['','null','http://bytova.co.uk','https://bytova.co.uk.evil.invalid','https://evil.invalid','https://another-user.github.io','https://taccountant2026.github.io.evil.invalid','https://retroreplay.uk.evil.invalid'])assert(!leadOrigin(origin,'https://retroreplay.uk'));
});
test('campaign labels travel in ordinary public links without storage, private-order links or external disclosure',()=>{
 assert.equal(campaignHref('/personal-shopper?route=gifts','gift-post'),'/personal-shopper?route=gifts&utm_campaign=gift-post');
 for(const href of['https://bytova.co.uk/','mailto:info@retroreplay.uk','//evil.invalid','/admin#funnels','/api/catalogue','/order/private?token=private','/basket'])assert.equal(campaignHref(href,'gift-post'),href);
 assert.equal(campaignHref('/start','visitor@example.invalid'),'/start');
});
test('pipeline dates, stages and revisions are validated; owner drafts use the correct business and public route',()=>{
 const input={id:base.requestKey,source:'submission',revision:12,stage:'contacted',due:'2026-10-22',nextAction:'Check model',note:'Private owner note'};assert.equal(parseProgress(input).stage,'contacted');
 for(const change of[{revision:-1},{revision:1.1},{stage:'paid'},{source:'orders'},{due:'2026-02-30'},{due:'2026-99-99'},{id:'invalid'}])assert.throws(()=>parseProgress({...input,...change}));
 const lead=funnelRecord({...base,id:base.requestKey,source:'submission',status:'new'},{brand:'bytova',route:'websites',stage:'proposal',revision:12});const draft=followUpDraft(lead,'follow-up');assert(draft.body.includes('https://bytova.co.uk/website-design-build.html'));assert(draft.subject.includes('Bytova'));assert(!draft.body.includes('RetroReplay UK'));
 assert.equal(funnelRecord({...lead,status:'closed'},{brand:'bytova',route:'websites',stage:'new'}).stage,'closed');
 assert.equal(funnelRecord({...lead,status:'closed'},{brand:'bytova',route:'websites',stage:'won'}).stage,'won');
});
test('actual migrated SQL keeps intake and alerts idempotent, prevents story publication and rejects stale pipeline writes',()=>{
 const schema=readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort().map(f=>readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8')).join('\n');
 const result=spawnSync('python',['tests/funnel_scenarios.py'],{input:JSON.stringify({schema,insert:submissionSql(),meta:funnelMetaSql(),progress:progressSourceSql('submission'),alert:insertEmailSql('submission')}),encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);assert.match(result.stdout,/passed/);
});

test('garden requests stay private, keep their brand and prepare the correct GitHub Pages reply link',()=>{
 const input=parseFunnelLead({...base,brand:'garden',route:'project',publishConsent:true});
 assert.equal(input.consent,0);assert.equal(input.kind,'question');assert.equal(publicStory({...input,status:'published'}),null);
 const record=funnelRecord({...input,id:base.requestKey,source:'submission',status:'new'},{brand:'garden',route:'project'});
 assert.equal(record.brand,'garden');assert.equal(record.routeLabel,'A garden project');
 const draft=followUpDraft(record);assert(draft.subject.includes('The Garden Company'));assert(draft.body.includes('https://taccountant2026.github.io/Turf-Right/garden-projects.html'));
 assert(!draft.body.includes('RetroReplay UK'));assert.throws(()=>parseFunnelLead({...base,brand:'garden',route:'ready-buyer'}));
});
