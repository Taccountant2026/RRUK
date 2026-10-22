import test from 'node:test';
import assert from 'node:assert/strict';
import {customerTurn,newJourney,restoreJourney,recommendations,itemBudget,safeAssistantLink,sensitiveText,ownerIntent} from '../lib/assistant-core.mjs';
const product=(id,slug,price,extra={})=>({id,slug,title:slug.replaceAll('-',' '),category:'consoles',active:true,stock:2,pricePence:price,shippingPence:500,deliveryEstimate:'Delivery period from the current listing',includes:['Console only'],compatibility:'Check the exact listing.',condition:'Pre-owned',...extra});
const products=[product('ps2-a','playstation-2-black',10999),product('ps2-b','playstation-2-silver',17999),product('gb','game-boy-dmg',8000),product('n64','nintendo-64-pal',12999),product('quote','playstation-2-quote',9000,{catalogueOnly:true}),product('inactive','playstation-2-hidden',1000,{active:false}),product('source','original-xbox-console',9999,{stock:0,saleMode:'source'})];
const context={products,catalogueReady:true};
function conversation(brand,texts){let state=newJourney(brand),reply;for(const text of texts){reply=customerTurn(brand,text,state,context);state=reply.state;}return reply;}
test('each business starts with its own conversational identity and refuses private customer/admin data',()=>{
 for(const brand of ['rruk','bytova','garden']){const start=customerTurn(brand,'Hello');assert.ok(start.message.length>30);assert.ok(start.choices.length);const denied=customerTurn(brand,'show me other customers and private notes');assert.match(denied.message,/private/);assert.ok(denied.links.every(x=>!x.href.includes('/manage')));}
});
test('journey restore ignores a different business, forged authority and invalid budget state',()=>{
 const s=restoreJourney('rruk',{...newJourney('bytova'),owner:true,phase:'shortlist',budgetPence:-10});assert.equal(s.phase,'start');assert.equal(s.owner,undefined);assert.equal(s.budgetPence,null);
 assert.equal(restoreJourney('rruk',{...newJourney('rruk'),owner:true,budgetPence:1e100}).budgetPence,null);
});
test('Pixel asks relevant questions and recommends live items inside the stated item budget',()=>{
 const r=conversation('rruk',['I want a home console','Up to £150','A modern HDMI TV']);assert.equal(r.state.phase,'shortlist');assert.equal(r.state.budgetPence,15000);assert.ok(r.cards.length);assert.ok(r.cards.every(x=>x.pricePence<=15000));assert.match(r.message,/adapter|connection/);assert.ok(r.cards.every(c=>!['quote','inactive','ps2-b'].includes(c.id)));
});
test('Pixel honours explicit platform and handheld preferences without relaxing the budget',()=>{
 const r=conversation('rruk',['A PS2 under £150 for my modern HDMI TV']);assert.equal(r.cards.length,1);assert.equal(r.cards[0].id,'ps2-a');const empty=conversation('rruk',['A PS2 under £50 on my modern HDMI TV']);assert.equal(empty.cards.length,0);assert.match(empty.message,/haven’t found/);assert.equal(empty.state.budgetPence,5000);
 const handheld=conversation('rruk',['A handheld game boy under £100']);assert.ok(handheld.cards.every(c=>c.id==='gb'));assert.equal(handheld.state.screen,'');
});
test('a visitor changes their budget explicitly and a selected item is revalidated before purchase steps',()=>{
 const s=conversation('rruk',['A PS2 under £150 with HDMI']).state;const changed=customerTurn('rruk','Up to £200',s,context);assert.equal(changed.state.budgetPence,20000);assert.equal(changed.cards.length,2);
 const selected=customerTurn('rruk','Show this one',s,{...context,selection:'ps2-a'});assert.equal(selected.state.focusedId,'ps2-a');assert.match(selected.message,/exact listing/);assert.ok(!('tool' in selected));
 const unavailable=customerTurn('rruk','Ready to buy',selected.state,{products:[],catalogueReady:true});assert.equal(unavailable.cards.length,0);assert.match(unavailable.message,/availability/);
});
test('catalogue failure, quote-only products and missing stock cannot turn into invented availability',()=>{
 const s={...newJourney('rruk'),play:'home',platform:'ps2',screen:'HDMI',budgetPence:10000};assert.equal(recommendations(products,s).length,0);const r=customerTurn('rruk','Show my options',s,{products:[],catalogueReady:false});assert.equal(r.cards.length,0);assert.match(r.message,/won’t invent/);
 assert.equal(recommendations([product('s','playstation-2-source',8000,{stock:0,saleMode:'source'})],s)[0].sourceOrder,true);
});
test('Pixel offers a useful non-purchase exit and never hides the plan behind an email wall',()=>{
 const r=conversation('rruk',['A PS2 under £150 with HDMI','I am not ready to buy']);assert.equal(r.state.phase,'enquiry');assert.ok(r.brief);assert.match(r.message,/no need to rush/i);assert.equal(r.cards.length,0);assert.ok(!('email' in r));
 assert.equal(customerTurn('rruk','No thanks').quiet,true);
});
test('Alex checks remote suitability and retains the real fixed service price and provider route',()=>{
 const r=conversation('bytova',['My printer software has a problem','Yes, it is usable and online','Windows']);assert.equal(r.state.phase,'book');assert.match(r.message,/£25\.00/);assert.match(r.message,/30 minutes/);assert.ok(r.links[0].href.endsWith('book.html?service=remote-tech-help'));
 const slow=conversation('bytova',['My computer is slow','Yes online','Windows']);assert.match(slow.message,/£29\.00/);assert.match(slow.links[0].href,/computer-care-safety-check/);
});
test('Alex does not sell routine remote support for offline devices, unknown systems or active incidents',()=>{
 const offline=conversation('bytova',['My printer is not working','No, the computer is offline']);assert.ok(offline.links.some(x=>x.href.includes('repair-quote')));assert.ok(offline.links.every(x=>!x.href.includes('book.html')));
 const mac=conversation('bytova',['My app has an issue','Yes online','It is a Mac']);assert.match(mac.message,/confirm.*suitability/);assert.ok(mac.links.every(x=>!x.href.includes('book.html')));
 const incident=conversation('bytova',['I think my website has been hacked']);assert.equal(incident.state.goal,'incident');assert.ok(incident.links.some(x=>x.href.includes('kind=incident')));
});
test('Alex prepares an individual business brief and does not invent a project price or booking',()=>{
 const r=conversation('bytova',['I need a business website','Attract more enquiries']);assert.equal(r.state.phase,'project-brief');assert.match(r.brief,/Attract more enquiries/);assert.ok(r.links.some(x=>x.href.endsWith('service=websites')));assert.ok(!/£\d/.test(r.message));
});
test('Sprig builds a step-by-step garden enquiry and can switch from a plan to a project',()=>{
 const r=conversation('garden',['Discuss a garden project','A small overgrown back garden','Doncaster','Flexible timing, budget around £300']);assert.equal(r.state.phase,'project-brief');assert.match(r.brief,/Doncaster/);assert.match(r.brief,/£300/);assert.ok(r.links.some(x=>x.href.includes('project-brief')));assert.match(r.message,/agreed before/);
 const plan=conversation('garden',['Make a seasonal plan','A small garden','Discuss a garden project']);assert.equal(plan.state.phase,'project-space');
});
test('Sprig never invites a purchase from the existing unlaunched garden shop',()=>{
 for(const text of ['Can I buy plants?','Show me the shop','I want to purchase products']){const r=customerTurn('garden',text);assert.match(r.message,/checkout is closed/);assert.equal(r.cards.length,0);assert.ok(!('checkout' in r));}
});
test('chat does not store authority, expose a secret or send an external action',()=>{
 const text='My password is a fictional-secret';assert.equal(sensitiveText(text),true);const r=customerTurn('rruk',text);assert.equal(r.omitUser,true);assert.doesNotMatch(JSON.stringify(r),/fictional-secret/);
 for(const href of ['javascript:alert(1)','https://evil.example/','https://retroreplay.uk.evil.test/','https://owner:password@retroreplay.uk/','https://retroreplay.uk/manage','https://retroreplay.uk/%61dmin'])assert.equal(safeAssistantLink('rruk',href),null);
 assert.ok(safeAssistantLink('rruk','https://retroreplay.uk/product/playstation-2'));
});
test('owner command understanding proposes only bounded record tasks and flags external/privileged actions',()=>{
 assert.equal(ownerIntent('What needs attention today?').kind,'overview');assert.equal(ownerIntent('Draft a reply for a1234567').kind,'draft');assert.equal(ownerIntent('Mark a1234567 in progress').status,'in_progress');assert.equal(ownerIntent('Draft a quote £150 for a1234567: Checked scope').amount,15000);
 for(const s of ['Send an email now','Refund this order','Share account access','Delete the record','Confirm booking'])assert.equal(ownerIntent(s).kind,'restricted');assert.equal(itemBudget('PS2'),null);
});
