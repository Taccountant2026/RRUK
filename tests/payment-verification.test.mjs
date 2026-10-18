import test from 'node:test';
import assert from 'node:assert/strict';
import { verifiedWebhookTime, verifiedRefundState } from '../lib/payment-verification.mjs';

const connection = {accountId:'acct_one',mode:'live',endpointUrl:'https://shop.example/api/stripe/webhook',secretFingerprint:'secret-hash-one'};
const receipt = {...connection,receivedAt:1792342000000};
test('webhook evidence is bound to merchant, mode, endpoint and signing secret',()=>{
  assert.equal(verifiedWebhookTime(JSON.stringify(receipt),connection),'1792342000000');
  for (const change of [{accountId:'acct_two'},{mode:'test'},{endpointUrl:'https://old.example/api/stripe/webhook'},{secretFingerprint:'rotated-secret'},{receivedAt:0}])
    assert.equal(verifiedWebhookTime(JSON.stringify({...receipt,...change}),connection),null);
  for(const raw of ['1792342000000','invalid','null','{}']) assert.equal(verifiedWebhookTime(raw,connection),null);
});

const order = {id:'order-one',session_id:'cs_test_one',mode:'test',status:'paid',restocked:0,total_pence:100};
const session = {id:'cs_test_one',metadata:{rruk_order:'order-one'},currency:'gbp',amount_total:100,livemode:false,payment_status:'paid',status:'complete',payment_intent:'pi_one'};
const refund = {id:'re_one',charge:'ch_one',payment_intent:'pi_one',currency:'gbp',amount:100,status:'succeeded'};
const intentFor = (refunds, amountRefunded=100, more=false) => ({id:'pi_one',livemode:false,currency:'gbp',amount:100,latest_charge:{id:'ch_one',payment_intent:'pi_one',livemode:false,currency:'gbp',amount:100,amount_refunded:amountRefunded,refunds:{data:refunds,has_more:more}}});
test('only successful verified full refunds close an order; partial and pending refunds need review',()=>{
  assert.equal(verifiedRefundState(order,session,intentFor([refund])),'refunded');
  assert.equal(verifiedRefundState(order,session,intentFor([{...refund,amount:40}],40)),'refund_review');
  assert.equal(verifiedRefundState(order,session,intentFor([{...refund,status:'pending'}])),'refund_review');
  assert.equal(verifiedRefundState(order,session,intentFor([{...refund,status:'failed'}],0)),null);
  assert.equal(verifiedRefundState(order,session,intentFor([],0)),null);
  assert.equal(verifiedRefundState(order,session,intentFor([],100,true)),'refund_review');
});
test('refund verification rejects wrong session, currency, mode, payment, duplicate refunds and excess totals',()=>{
  assert.throws(()=>verifiedRefundState(order,{...session,amount_total:1},intentFor([refund])));
  for(const change of [{id:'pi_other'},{currency:'usd'},{livemode:true},{amount:50}]) assert.throws(()=>verifiedRefundState(order,session,{...intentFor([refund]),...change}));
  for(const change of [{charge:'ch_other'},{payment_intent:'pi_other'},{currency:'eur'},{amount:101}]) assert.throws(()=>verifiedRefundState(order,session,intentFor([{...refund,...change}])));
  assert.throws(()=>verifiedRefundState(order,session,intentFor([refund,refund])));
});
