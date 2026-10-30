import test from 'node:test';
import assert from 'node:assert/strict';
import {validateUkDeliveryAddress,createSecureDeliveryToken,hashSecureDeliveryToken,isActiveDeliveryRequest} from '../lib/delivery-address.mjs';
const valid = {recipient:'A. Customer',line1:'10 Example Road',line2:'',city:'Doncaster',postcode:'dn76aa',country:'GB'};
test('normalises UK delivery fields without making them public',()=>{
  assert.deepEqual(validateUkDeliveryAddress(valid),{...valid,postcode:'DN7 6AA'});
});
test('rejects missing and unsupported address data',()=>{
  for(const item of [null,[],{...valid,country:'US'},{...valid,line1:''},{...valid,postcode:'invalid'},{...valid,recipient:'A\nB'},{...valid,line2:'x'.repeat(121)}]) {
    assert.throws(()=>validateUkDeliveryAddress(item));
  }
});
test('tokens use 32 random bytes and store a hash rather than raw link',async()=>{
  const a=createSecureDeliveryToken(),b=createSecureDeliveryToken();
  assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,b);
  const digest=await hashSecureDeliveryToken(a);
  assert.match(digest,/^[a-f0-9]{64}$/);assert.notEqual(digest,a);
  assert.equal(digest,await hashSecureDeliveryToken(a));
  await assert.rejects(hashSecureDeliveryToken('not-a-token'));
});
test('expired and already redeemed requests are inactive',()=>{
  const now=Date.UTC(2026,9,30),future=now+48*60*60*1000;
  assert.equal(isActiveDeliveryRequest({expiresAt:future,usedAt:null},now),true);
  assert.equal(isActiveDeliveryRequest({expiresAt:now,usedAt:null},now),false);
  assert.equal(isActiveDeliveryRequest({expiresAt:future,usedAt:now},now),false);
  assert.equal(isActiveDeliveryRequest(null,now),false);
});
