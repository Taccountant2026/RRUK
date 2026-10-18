import { env } from 'cloudflare:workers';
import { requireChatGPTUser, chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { AdminArea } from '@/components/AdminArea';
export const dynamic='force-dynamic';
export const metadata={title:'Owner area',robots:{index:false,follow:false}};
export default async function Page(){const user=await requireChatGPTUser('/admin');if(!env.ADMIN_EMAIL||user.email.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase())return <section className="container empty-state"><h1>Owner access required.</h1><p>This account is not authorised to manage RetroReplay UK.</p><a href={chatGPTSignOutPath('/admin')} target="_top" className="button navy">Sign out and choose the owner account</a></section>;return <><div className="page-heading compact"><div className="container"><div className="eyebrow">RETROREPLAY UK / PRIVATE OWNER AREA</div><h1>Your shop, your way.</h1><p>Signed in as {user.email}</p></div></div><section className="section"><div className="container"><AdminArea/></div></section></>;}
