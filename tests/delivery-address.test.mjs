import test from 'node:test';
import assert from 'node:assert/strict';
import {validateUkDeliveryAddress,createSecureDeliveryToken,hashSecureDeliveryToken,isActiveDeliveryRequest} from '../lib/delivery-address.mjs';
const valid = {recipient:'A. Customer',line1:'10 Example Road',line2:'',city:'Exampletown',postcode:'sw1a1aa',country:'GB'};
test('normalises UK delivery fields without making them public',()=>{
  assert.deepEqual(validateUkDeliveryAddress(valid),{...valid,postcode:'SW1A 1AA'});
  assert.deepEqual(validateUkDeliveryAddress({...valid,postcode:'gir 0aa'}),{...valid,postcode:'GIR 0AA'});
});
test('rejects missing, malformed, visually deceptive, and unsupported address data',()=>{
  for(const item of [null,[],{...valid,country:'US'},{...valid,line1:''},{...valid,postcode:'invalid'},
    {...valid,recipient:'A\nB'},{...valid,line2:'x'.repeat(121)},
    {...valid,recipient:'A\u202eB'},{...valid,line1:'A\u2066B'},
    {...valid,city:42}]) {
    assert.throws(()=>validateUkDeliveryAddress(item));
  }
  assert.equal(validateUkDeliveryAddress({...valid,postcode:'SW1A 1AA\n'}).postcode,'SW1A 1AA');
});
test('tokens use 32 random bytes and store a hash rather than raw link',async()=>{
  const a=createSecureDeliveryToken(),b=createSecureDeliveryToken();
  assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,b);
  const digest=await hashSecureDeliveryToken(a);
  assert.match(digest,/^[a-f0-9]{64}$/);assert.notEqual(digest,a);
  assert.equal(digest,await hashSecureDeliveryToken(a));
  for(const invalid of ['not-a-token','A'.repeat(64),'a'.repeat(63),'a'.repeat(65),null]) {
    await assert.rejects(hashSecureDeliveryToken(invalid));
  }
});
test('only unexpired, unused, explicitly pending requests are preliminarily active',()=>{
  const now=Date.UTC(2026,9,30),future=now+48*60*60*1000;
  const request={expiresAt:future,usedAt:null,status:'pending'};
  assert.equal(isActiveDeliveryRequest(request,now),true);
  for (const row of [null,{...request,status:'revoked'},{...request,status:'redeemed'},
    {...request,status:undefined},{...request,expiresAt:now},{...request,expiresAt:'tomorrow'},
    {...request,usedAt:0},{...request,usedAt:now}]) {
    assert.equal(isActiveDeliveryRequest(row,now),false);
  }
  assert.equal(isActiveDeliveryRequest(request,NaN),false);
});
