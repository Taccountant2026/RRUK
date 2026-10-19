'use client';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
export function SharePage({title}:{title:string}){
 const [notice,setNotice]=useState(''),[manual,setManual]=useState('');
 async function share(){const url=new URL(window.location.pathname,'https://retroreplay.uk').href;setNotice('');setManual('');try{if(navigator.share){await navigator.share({title,url});return;}if(navigator.clipboard){await navigator.clipboard.writeText(url);setNotice('Link copied. Share it with your player two.');return;}setManual(url);}catch(e){if(e instanceof Error&&e.name==='AbortError')return;setManual(url);}}
 return <div className="share-page"><button className="button outline" onClick={share}><Share2 size={17}/>Share with player two</button><span className="small-print" role="status">{notice}</span>{manual&&<label className="field">Copy this link<input value={manual} readOnly onFocus={e=>e.currentTarget.select()}/></label>}</div>;
}
