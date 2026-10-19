import Link from '@/components/SiteLink';
import { ArrowUpRight } from 'lucide-react';
import { collections, inCollection } from '@/lib/browse.mjs';
import { getProducts } from '@/lib/catalogue-server';
export const dynamic='force-dynamic';
export const metadata={title:'Browse all retro gaming collections',description:'Find your classic by platform, handheld, controller, connection or game case.',alternates:{canonical:'/collections'}};
export default async function Page(){
  const products=await getProducts();
  return <><div className="page-heading"><div className="container"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>Pick your player.</h1><p>Follow a familiar name. Find an old favourite. Make room for a new memory.</p></div></div><section className="section"><div className="container"><div className="collection-directory">{collections.map(c=><Link key={c.slug} href={'/collections/'+c.slug} className={'directory-card '+c.tone}><div className="directory-art"><img src={'/assets/catalogue/'+c.art+'.png'} alt="" width="640" height="640" loading="lazy"/><strong aria-hidden="true">{c.mark}</strong></div><div><span className="mini-label">{products.filter(p=>inCollection(p,c.slug)).length} catalogue choices</span><h2>{c.name}<ArrowUpRight size={22}/></h2><p>{c.description}</p></div></Link>)}</div><div className="source-explainer"><div><h2>Remember the game, but not its name?</h2><p>Start a free Console Hunt. A few details are enough to begin.</p></div><Link href="/console-hunt" className="button navy">Help me find it<ArrowUpRight size={18}/></Link></div></div></section></>;
}
