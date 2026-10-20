'use client';
import {useEffect,useState} from 'react';
import {useShop} from './ShopContext';
import {SubmissionForm} from './SubmissionForm';
import Link from './SiteLink';

export function PersonalShopper(){
 const {products,saved}=useShop(),[include,setInclude]=useState(false),[itemId,setItemId]=useState('');
 useEffect(()=>{setItemId(new URLSearchParams(window.location.search).get('item')||'');},[]);
 const context=products.find(p=>p.id===itemId),savedProducts=products.filter(p=>saved.includes(p.id));
 const selected=Array.from(new Map([...(context?[context]:[]),...(include?savedProducts:[])].map(p=>[p.id,p])).values());
 return <>{context&&<div className="shopper-context"><p className="mini-label">ABOUT THIS ITEM</p><p><strong>{context.title}</strong></p><Link href={'/product/'+context.slug} className="text-link">Back to the listing →</Link></div>}{savedProducts.length>0?<label className="checkbox-label shopper-saved"><input type="checkbox" checked={include} onChange={e=>setInclude(e.target.checked)}/><span>Include up to six items from my saved list in this private request ({savedProducts.length} saved).</span></label>:<p className="small-print">You can save items using the heart in the shop, then choose to include them here.</p>}<SubmissionForm kind="question" shopping selectedItems={selected} initialTitle="Help choosing my next retro setup"/></>;
}
