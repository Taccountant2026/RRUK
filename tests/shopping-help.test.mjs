import test from 'node:test';
import assert from 'node:assert/strict';
import {giftShortlist,shoppingRequestBody} from '../lib/shopping-help.mjs';
import {parseSubmission,publicStory} from '../lib/community.mjs';
const item=(id,title,price,overrides={})=>({id,title,pricePence:price,active:true,catalogueOnly:false,saleMode:'source',stock:0,category:'accessories',...overrides});

test('gift ideas obey the current category, item budget and actual order eligibility',()=>{
 const products=[item('mug','Gaming mug',1500),item('costly','Gaming mug',6000),item('inactive','Gaming mug',1000,{active:false}),item('quote','Gaming mug',500,{catalogueOnly:true}),item('empty','Gaming mug',1000,{saleMode:'stock',stock:0}),item('pad','PS2 controller',2000),item('handheld','Nintendo Game Boy',7500,{category:'consoles'}),item('home','PlayStation 2',9000,{category:'consoles'})];
 assert.deepEqual(giftShortlist(products,'extras',50).map(p=>p.id),['mug']);
 assert.deepEqual(giftShortlist(products,'handheld',100).map(p=>p.id),['handheld']);
 assert.deepEqual(giftShortlist(products,'home',100).map(p=>p.id),['home']);
 assert.deepEqual(giftShortlist(products,'handheld',50),[]);
 assert.deepEqual(giftShortlist(products,'invalid',100),[]);assert.deepEqual(giftShortlist(products,'home',999),[]);
 products[0].pricePence=5100;assert.deepEqual(giftShortlist(products,'extras',50),[]);
});

test('a maximum shopping-help brief fits the real private submission schema and preserves consent rules',()=>{
 const body=shoppingRequestBody({goal:'A gift',budget:'Up to £150',setup:'A handheld',message:'a'.repeat(5000),items:Array.from({length:20},()=>({title:'b'.repeat(500)}))});
 assert(body.length<=3000);assert(body.includes('Up to £150'));assert(body.includes('not a reservation'));assert.equal((body.match(/^- /gm)||[]).length,6);
 const input={requestKey:'11111111-1111-4111-8111-111111111111',kind:'question',name:'Test visitor',email:'test@example.invalid',title:'Shopping help',body,privacyAccepted:true,publishConsent:true};
 const parsed=parseSubmission(input);assert.equal(parsed.kind,'question');assert.equal(parsed.consent,0);assert.equal(publicStory({...parsed,status:'published'}),null);
 assert.throws(()=>parseSubmission({...input,privacyAccepted:false}));
});

test('unrecognised shopping selections cannot inject a claimed budget or public-story permission',()=>{
 const body=shoppingRequestBody({goal:'publish',budget:'£1 guaranteed price',setup:'<script>',message:'A legitimate setup question.\u0000',items:[]});
 assert(!body.includes('£1'));assert(!body.includes('<script>'));assert(!body.includes('\u0000'));assert(body.includes('Not sure yet'));assert(body.includes('mailing-list subscription'));
});
