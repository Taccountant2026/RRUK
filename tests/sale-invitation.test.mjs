import test from 'node:test';
import assert from 'node:assert/strict';
import {canInviteToPurchase,requestReply} from '../lib/sale-invitation.mjs';

const enquiry={name:'Test customer',product_title:'Source item',quantity:2,id:'request-example'};
const sale={title:'Confirmed item',slug:'confirmed-item',active:true,stock:2,pricePence:2500,shippingPence:450,deliveryEstimate:'2–4 working days after dispatch'};
const payments={mode:'live',enabled:true};

test('purchase invitations require published sufficient sale stock and enabled live checkout',()=>{
  assert.equal(canInviteToPurchase(enquiry,sale,payments),true);
  for(const item of [null,{...sale,catalogueOnly:true},{...sale,active:false},{...sale,stock:1}])assert.equal(canInviteToPurchase(enquiry,item,payments),false);
  for(const state of [null,{...payments,mode:'test'},{...payments,enabled:false}])assert.equal(canInviteToPurchase(enquiry,sale,state),false);
  for(const quantity of [0,11,1.5])assert.equal(canInviteToPurchase({...enquiry,quantity},sale,payments),false);
});

test('a ready invitation uses actual sale prices, one delivery charge and the correct public item URL',()=>{
  const reply=requestReply(enquiry,sale,payments,'https://retroreplay.uk');
  assert.match(reply,/Items: £50\.00/);
  assert.match(reply,/Tracked UK delivery: £4\.50/);
  assert.match(reply,/Total for this item and quantity: £54\.50/);
  assert.match(reply,/https:\/\/retroreplay\.uk\/product\/confirmed-item/);
  assert.match(reply,/do not reserve the item or take payment/);
  assert.doesNotMatch(reply,/\[Confirm/);
});

test('unready replies retain the confirmation step and never invite payment',()=>{
  const reply=requestReply(enquiry,sale,{...payments,enabled:false},'https://retroreplay.uk');
  assert.match(reply,/\[Confirm availability/);
  assert.doesNotMatch(reply,/pay securely|https:\/\/retroreplay\.uk\/product/);
});
