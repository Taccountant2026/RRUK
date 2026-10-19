import { env } from 'cloudflare:workers';
import { journal } from '@/lib/journal.mjs';
export const dynamic='force-dynamic';
const xml=(text:string)=>text.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET(){
  const origin=env.PUBLIC_ORIGIN||'https://retroreplay.uk';
  const body='<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Replay Journal — RetroReplay UK</title><link>'+origin+'/blog</link><description>Know-how, nostalgia and the classics back in play.</description><language>en-gb</language>'+journal.map(a=>'<item><title>'+xml(a.title)+'</title><link>'+origin+'/blog/'+a.slug+'</link><guid>'+origin+'/blog/'+a.slug+'</guid><pubDate>Mon, 19 Oct 2026 11:00:00 GMT</pubDate><category>'+xml(a.category)+'</category><description>'+xml(a.summary)+'</description></item>').join('')+'</channel></rss>';
  return new Response(body,{headers:{'Content-Type':'application/rss+xml; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}
