import Link from './SiteLink';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { journal } from '@/lib/journal.mjs';
export function JournalCards({limit=3,exclude='',category=''}:{limit?:number;exclude?:string;category?:string}){
  return <div className="journal-grid">{journal.filter(a=>a.slug!==exclude&&(!category||a.category===category)).slice(0,limit).map(a=><article className="journal-card" key={a.slug}><Link href={'/blog/'+a.slug} className={'editorial-art '+a.tone} aria-label={a.title}><span className="mini-label">THE REPLAY JOURNAL</span><strong aria-hidden="true">{a.mark}</strong><span className="editorial-dots" aria-hidden="true">● ● ●</span><ArrowUpRight/></Link><div className="journal-card-copy"><p className="mini-label">{a.category} <span><Clock3 size={12}/>{a.minutes} min read</span></p><h3><Link href={'/blog/'+a.slug}>{a.title}</Link></h3><p>{a.summary}</p><Link className="text-link" href={'/blog/'+a.slug}>Read the story<ArrowUpRight size={16}/></Link></div></article>)}</div>;
}
