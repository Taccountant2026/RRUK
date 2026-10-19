'use client';
import { useState } from 'react';
import { ArrowRight, Check, Circle, LockKeyhole } from 'lucide-react';
import { type Product } from '@/lib/shop';
import { orderLimit } from '@/lib/commerce.mjs';
import { guidePrice } from './SourcedProductDetail';

type Connection = {webhookConfigured:boolean;endpointUrl:string|null;webhookSeen:string|null};
type Payments = {mode:'test'|'live';enabled:boolean;live:Connection|null;test:Connection|null;brandingConfirmed:boolean;fulfilmentConfirmed:boolean};

export function SalesLaunch({products,payments,origin,onProducts,onPayments,onTest,busy}:{products:Product[];payments:Payments;origin:string;onProducts:()=>void;onPayments:()=>void;onTest:()=>void;busy:boolean}) {
  const saleCount=products.filter(p=>orderLimit(p)>0).length;
  const checks=[
    {label:'Live merchant and signed delivery',done:Boolean(payments.live?.webhookSeen&&payments.brandingConfirmed&&payments.fulfilmentConfirmed),detail:payments.live?.webhookSeen?'Live delivery is verified for this store address.':'Review the saved live connection in Payments.'},
    {label:'Final-domain test delivery',done:Boolean(payments.test?.webhookSeen),detail:payments.test?.webhookSeen?'A signed test event has reached the current store address.':'Run the final simulated checkout, then refresh to check signed delivery.'},
    {label:'Active orderable items',done:saleCount>0,detail:saleCount?`${saleCount} published ${saleCount===1?'item has':'items have'} active offers.`:'Review active offers, prices and delivery settings in Catalogue.'},
    {label:'Live customer checkout',done:payments.mode==='live'&&payments.enabled,detail:payments.mode==='live'&&payments.enabled?'Live checkout is enabled for confirmed sale listings.':'Review the remaining payment-method checks in Payments, then enable live checkout when ready.'},
  ];
  return <section className="admin-panel sales-launch"><div className="eyebrow">YOUR SHORTEST ROUTE TO A SALE</div><h2>Your sales setup.</h2><p className="admin-help">The sourced-to-order catalogue uses Active switches and the generated artwork. Review the offers and payment state here.</p><ol className="launch-checks">{checks.map(c=><li key={c.label} className={c.done?'complete':''}>{c.done?<Check size={21} aria-label="Verified"/>:<Circle size={21} aria-label="Still to do"/>}<div><strong>{c.label}</strong><p>{c.detail}</p></div></li>)}</ol><div className="button-row"><button type="button" className="button navy" onClick={onProducts}>Manage catalogue<ArrowRight size={17}/></button><button type="button" className="button outline" onClick={onPayments}>Review payments<LockKeyhole size={16}/></button></div><OwnerTestPanel status={payments} origin={origin} busy={busy} onStart={onTest} compact/></section>;
}

export function CatalogueSalePicker({catalogue,products,onPrepare}:{catalogue:Product[];products:Product[];onPrepare:(product:Product)=>void}) {
  const [selected,setSelected]=useState('');
  const options=catalogue.filter(p=>(p.saleMode==='source'||p.catalogueOnly)&&!products.some(sale=>sale.slug===p.slug));
  const product=options.find(p=>p.id===selected);
  if(!options.length)return null;
  return <div className="admin-panel sale-picker"><h2>Prepare a one-off stock item.</h2><p className="admin-help">Optionally replace a sourced offer with an individual item and its own photos. Keep its title, collection and link, then add the actual sale details.</p><div className="sale-picker-controls"><label className="field">Catalogue item<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose an item…</option>{options.map(p=><option value={p.id} key={p.id}>{p.title}</option>)}</select></label><button className="button navy" type="button" disabled={!product} onClick={()=>product&&onPrepare(product)}>Prepare sale item<ArrowRight size={16}/></button></div>{product&&<p className="admin-help">Catalogue reference: {guidePrice(product)}. Confirm your selling price and delivery charge for the actual item.</p>}</div>;
}

export function OwnerTestPanel({status,origin,busy,onStart,compact=false}:{status:Payments;origin:string;busy:boolean;onStart:()=>void;compact?:boolean}) {
  const ready=Boolean(status.test?.webhookConfigured&&status.test.endpointUrl===`${origin}/api/stripe/webhook`);
  return <div className={compact?'launch-test':'admin-panel'}><h2>Final checkout test.</h2><p className="admin-help">Open a £1 simulated purchase using your saved test connection. Your live customer checkout settings stay as they are. Use test details throughout; no real payment or parcel is created.</p><button className="button outline" type="button" disabled={busy||!ready} onClick={onStart}>Run £1 test payment<ArrowRight size={16}/></button>{!ready&&<p className="admin-help">The saved test webhook must use this store address. Update it in Payments first.</p>}<p className="admin-help" style={{marginTop:16}}>In Stripe, use card 4242 4242 4242 4242, expiry 12/34 and CVC 123. Check the returned order and signed test delivery afterward. This test checks the final-domain journey; previous refund, decline and expiry results are retained. Delayed-payment methods need their own checks before you offer them.</p></div>;
}
