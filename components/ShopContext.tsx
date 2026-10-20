'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/shop';
import { orderLimit } from '@/lib/commerce.mjs';
import { readCart } from '@/lib/cart.mjs';
export type Line = {id:string;quantity:number};
type Shop = {
  products:Product[]; loading:boolean; failed:boolean; lines:Line[]; ready:boolean; saved:string[];
  setQuantity:(id:string,quantity:number)=>boolean; toggleSaved:(id:string)=>void;
  refresh:()=>Promise<void>; completeOrder:(items:{product:Product;quantity:number}[],requestHash:string)=>Promise<void>;
};
const Context=createContext<Shop|null>(null);
export function useShop(){const value=useContext(Context);if(!value)throw new Error('Shop provider missing');return value;}
export function ShopProvider({children,initialProducts=[],initialCart}:{children:ReactNode;initialProducts?:Product[];initialCart?:Line[]}){
  const [products,setProducts]=useState(initialProducts),[loading,setLoading]=useState(!initialProducts.length),[failed,setFailed]=useState(false);
  const [lines,setLines]=useState<Line[]>(initialCart||[]),[ready,setReady]=useState(false),[saved,setSaved]=useState<string[]>([]);
  const linesRef=useRef(lines);
  function persist(next:Line[]){
    linesRef.current=next;setLines(next);
    try{localStorage.setItem('rruk-basket-v1',JSON.stringify(next));}catch{}
    document.cookie='rruk_cart='+encodeURIComponent(JSON.stringify(next))+'; Path=/; Max-Age=2592000; SameSite=Lax; Secure';
  }
  async function refresh(){
    try{const response=await fetch('/api/catalogue',{cache:'no-store'});if(!response.ok)throw new Error();const data=await response.json() as {products:Product[]};if(!Array.isArray(data.products))throw new Error();setProducts(data.products);setFailed(false);}
    catch{setFailed(true);}finally{setLoading(false);}
  }
  useEffect(()=>{
    if(initialCart===undefined){try{persist(readCart(localStorage.getItem('rruk-basket-v1')));}catch{}}
    try{const ids=JSON.parse(localStorage.getItem('rruk-saved-v1')||'[]');if(Array.isArray(ids))setSaved(ids.filter(id=>typeof id==='string'&&/^[a-zA-Z0-9-]{1,60}$/.test(id)).slice(0,100));}catch{}
    setReady(true);void refresh();
  },[]);
  function setQuantity(id:string,quantity:number){
    if(!ready||!Number.isInteger(quantity))return false;
    const product=products.find(p=>p.id===id);
    if(quantity>0&&(!product||quantity>orderLimit(product)))return false;
    const next=[...linesRef.current.filter(l=>l.id!==id),...(quantity>0?[{id,quantity}]:[])];
    if(next.length>20)return false;
    if(quantity>(linesRef.current.find(l=>l.id===id)?.quantity||0))window.dispatchEvent(new CustomEvent('business-metric',{detail:{event:'save_item'}}));
    persist(next);try{sessionStorage.removeItem('rruk-checkout-key');}catch{}return true;
  }
  function toggleSaved(id:string){setSaved(old=>{const next=old.includes(id)?old.filter(x=>x!==id):[...old,id].slice(-100);try{localStorage.setItem('rruk-saved-v1',JSON.stringify(next));}catch{}return next;});}
  async function completeOrder(items:{product:Product;quantity:number}[],requestHash:string){
    try{
      const key=sessionStorage.getItem('rruk-checkout-key');if(!key)return;
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));
      if(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')!==requestHash||sessionStorage.getItem('rruk-checkout-key')!==key)return;
      sessionStorage.removeItem('rruk-checkout-key');
      persist(linesRef.current.map(l=>({...l,quantity:Math.max(0,l.quantity-(items.find(i=>i.product.id===l.id)?.quantity||0))})).filter(l=>l.quantity>0));
      await refresh();
    }catch{}
  }
  return <Context.Provider value={{products,loading,failed,lines,ready,saved,setQuantity,toggleSaved,refresh,completeOrder}}>{children}</Context.Provider>;
}
