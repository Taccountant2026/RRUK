import Link from '@/components/SiteLink';
import { JournalCards } from '@/components/Editorial';
import { journal } from '@/lib/journal.mjs';
import { Rss, ArrowUpRight } from 'lucide-react';
export const metadata={title:'The Replay Journal — retro gaming guides & stories',description:'Buying guides, setup checklists, collecting stories and a shared love of classic gaming from RetroReplay UK.',alternates:{canonical:'/blog',types:{'application/rss+xml':'/feed.xml'}}};
export default async function Page({searchParams}:{searchParams:Promise<{category?:string}>}){
  const {category=''}=await searchParams,categories=Array.from(new Set(journal.map(a=>a.category))),selected=categories.includes(category)?category:'';
  return <><div className="page-heading journal-heading"><div className="container"><div className="eyebrow">KNOW-HOW. NOSTALGIA. ONE MORE GO.</div><h1>The Replay<br/><span>Journal.</span></h1><p>Useful things to know. Good things to remember.</p></div><span className="heading-mark" aria-hidden="true">READ</span></div><section className="section"><div className="container"><nav className="journal-filters" aria-label="Journal topics"><Link href="/blog" className={!selected?'current':''}>Everything</Link>{categories.map(c=><Link key={c} href={'/blog?category='+encodeURIComponent(c)} className={selected===c?'current':''}>{c}</Link>)}<Link href="/feed.xml" className="rss-link"><Rss size={15}/>RSS feed</Link></nav><JournalCards limit={20} category={selected}/><div className="source-explainer"><div><h2>What should we cover next?</h2><p>A guide you wish existed or a memory you want to share? The Replay Room is open.</p></div><Link href="/community" className="button navy">Join the conversation<ArrowUpRight size={18}/></Link></div></div></section></>;
}
