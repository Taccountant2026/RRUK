'use client';
import {useState} from 'react';
import Link from './SiteLink';
import {useShop} from './ShopContext';
import {ProductCards} from './Storefront';
import {giftBudgets,giftShortlist} from '@/lib/shopping-help.mjs';
import type {Product} from '@/lib/shop';
import {Gift,ArrowUpRight} from 'lucide-react';

export function GiftFinder(){
 const {products,failed}=useShop(),[kind,setKind]=useState('extras'),[budget,setBudget]=useState(50);
 const matches=giftShortlist(products,kind,budget) as Product[];
 return <div className="gift-picker"><div className="gift-controls"><label className="field">What kind of gift?<select value={kind} onChange={e=>setKind(e.target.value)}><option value="extras">Little gaming gifts</option><option value="handheld">A handheld console</option><option value="home">A home console</option></select></label><label className="field">Maximum item price<select value={budget} onChange={e=>setBudget(Number(e.target.value))}>{giftBudgets.map((n:number)=><option key={n} value={n}>Up to £{n}</option>)}</select></label></div><p className="small-print">Item prices before any delivery charge. Check each listing’s contents, region, condition and full delivery period; a gift date is not guaranteed by this guide.</p><p className="gift-result-status" role="status">{failed?'The latest shop data could not be verified. Refresh before choosing.':matches.length?`${matches.length} current ideas within your item budget.`:'No orderable match in this category and item budget. Try another selection or ask for help.'}</p>{!failed&&matches.length>0?<ProductCards products={matches}/>:<div className="gift-empty"><Gift size={35}/><h3>Let’s find the right direction.</h3><p>Tell Leighton who it is for, what they remember and your budget. We’ll check what could fit.</p><Link href={'/personal-shopper?route=gifts&budget='+budget+'&setup='+kind} className="button navy">Ask for gift help<ArrowUpRight size={17}/></Link></div>}<div className="shopping-next"><div><h3>Unsure what they already own?</h3><p>Ask about their console and TV setup first. A controller or cable needs the correct model; an empty case is not a game.</p></div><Link className="text-link" href={'/personal-shopper?route=gifts&budget='+budget+'&setup='+kind}>Get a personal steer<ArrowUpRight size={17}/></Link></div></div>;
}
