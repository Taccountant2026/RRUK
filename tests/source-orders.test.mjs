import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceOrderCatalogue,sourceOrderDefaults,parseSourceOptions} from '../lib/source-orders.mjs';
import {priceBasket,orderLimit,stockManagedLines,parseBasket} from '../lib/commerce.mjs';
import {requestReply,canInviteToPurchase} from '../lib/sale-invitation.mjs';
const base=JSON.parse(readFileSync(new URL('../lib/sourcing-catalogue.json',import.meta.url),'utf8'));
const catalogue=sourceOrderCatalogue(base);
const source=catalogue[0];

test('the eBay range has 65 active illustrated choices, with 59 orderable offers and six bounded details requests',()=>{
  assert.equal(catalogue.length,65);
  assert.equal(catalogue.filter(p=>!p.catalogueOnly).length,59);
  assert.equal(catalogue.filter(p=>p.catalogueOnly).length,6);
  for(const p of catalogue){assert.equal(p.active,true);assert.equal(p.stock,0);assert.equal(p.saleMode,'source');assert.equal(p.imageKind,'illustration');assert.match(p.images[0],/^\/assets\/catalogue\//);assert.match(p.deliveryEstimate,/30 calendar days/);assert.equal(p.shippingPence,0);}
  assert.deepEqual(source.includes,['PlayStation 2 Fat SCPH-50003 console','Console cables','Controller','Memory card']);
  for(const p of catalogue.filter(p=>p.catalogueOnly)){assert.ok(p.quoteReason);assert.throws(()=>priceBasket([{id:p.id,quantity:1}],[{...p,stock:9999}]));}
});

test('controller prices use each colour Start price and the standard GameCube offer uses the lower lot price',()=>{
  const controllers=catalogue.filter(p=>p.sourceItemIds.includes('397880505209'));
  assert.equal(controllers.length,6);
  for(const p of controllers){assert.equal(p.pricePence,p.title.endsWith('Black')?1499:2499);assert.equal(p.catalogueOnly,false);}
  const cube=catalogue.find(p=>p.sourceItemIds.includes('397885841575'));
  assert.equal(cube.pricePence,16799);assert.equal(cube.guidePriceMaxPence,undefined);
});

test('source orders have an order limit without creating or replenishing held stock; mixed orders reserve only actual stock',()=>{
  assert.equal(orderLimit(source),10);
  const stock={id:'actual',active:true,stock:1,pricePence:2000,shippingPence:450};
  const basket=priceBasket([{id:source.id,quantity:2},{id:'actual',quantity:1}],[source,stock]);
  assert.equal(basket.total,source.pricePence*2+2450);
  assert.deepEqual(stockManagedLines(basket.lines),[{product:stock,quantity:1}]);
  assert.deepEqual(stockManagedLines([{product:source,quantity:10}]),[]);
  assert.deepEqual(stockManagedLines([{product:{id:'test',category:'test'},quantity:1}]),[]);
  assert.throws(()=>priceBasket([{id:source.id,quantity:11}],[source]));
  assert.throws(()=>priceBasket([{id:source.id,quantity:1}],[{...source,active:false,stock:9999}]));
});

test('owner catalogue settings validate known identifiers, price bounds, booleans and delivery; they preserve source defaults',()=>{
  const valid={shippingPence:499,deliveryEstimate:'Delivered within 20 calendar days of order.',items:{[source.id]:{active:false,pricePence:14000}}};
  const parsed=parseSourceOptions(valid,base),changed=sourceOrderCatalogue(base,parsed)[0];
  assert.equal(changed.active,false);assert.equal(changed.pricePence,14000);assert.equal(changed.shippingPence,499);
  assert.equal(source.active,true);assert.equal(sourceOrderDefaults.shippingPence,0);
  for(const change of [{shippingPence:-1},{shippingPence:1.5},{deliveryEstimate:''},{items:{unknown:{active:true,pricePence:1000}}},{items:{[source.id]:{active:'yes',pricePence:1000}}},{items:{[source.id]:{active:true,pricePence:0}}}])assert.throws(()=>parseSourceOptions({...valid,...change},base));
});

test('a sourced purchase invitation uses the real offer and complete delivery period without a false physical-stock or photo promise',()=>{
  const enquiry={name:'Customer',product_title:source.title,quantity:2,id:'request'};
  const payments={mode:'live',enabled:true};
  assert.equal(canInviteToPurchase(enquiry,source,payments),true);
  const reply=requestReply(enquiry,source,payments,'https://retroreplay.uk');
  assert.match(reply,/sourced after your order/);assert.match(reply,/30 calendar days/);
  assert.doesNotMatch(reply,/actual photos|Normally dispatched within 1–3/);
});

test('old policy consent cannot be reused for the new sourced-to-order contract',()=>{
  for(const policyVersion of ['2026-10-18','2026-10-19'])assert.throws(()=>parseBasket({termsAccepted:true,policyVersion,requestKey:'69df1af1-7d01-4acf-b7da-c7903bd45884',items:[{id:source.id,quantity:1}]}));
});
