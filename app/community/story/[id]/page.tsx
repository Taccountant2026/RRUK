import { notFound } from 'next/navigation';
import Link from '@/components/SiteLink';
import { getStory } from '@/lib/community-server';
import { emailLink } from '@/lib/shop';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params,s=await getStory(id);return {title:s?.title||'Story not found',description:s?.body.slice(0,150),alternates:{canonical:'/community/story/'+id}};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params,s=await getStory(id);if(!s)notFound();return <><div className="page-heading"><div className="container"><div className="eyebrow">FROM THE REPLAY ROOM</div><h1>{s.title}</h1><p>A community contribution by {s.name}</p></div></div><section className="section"><article className="container prose narrow-prose"><p className="preserve-lines community-story-text">{s.body}</p><p className="small-print">A player's personal memory, reviewed for our community guidelines. Individual experiences are not product specifications.</p><div className="button-row"><Link className="button navy" href="/community">Back to the Replay Room</Link><a className="text-link" href={emailLink('Report community contribution '+id)}>Report this story</a></div></article></section></>;}
