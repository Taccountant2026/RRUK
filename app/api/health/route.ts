import { env } from 'cloudflare:workers';
import { json, respond } from '@/lib/server';
import { paymentStatus, merchant, paymentMode, stripeClient } from '@/lib/payments';
import { emailStatus } from '@/lib/notification-server';

export const dynamic='force-dynamic';

export async function GET(request:Request){
  return respond(async()=>{
    const origin=new URL(request.url).origin;
    const status=await paymentStatus(origin);
    const mode=await paymentMode();
    const current=await merchant(mode);
    let stripeReachable=false;
    if(current){
      try{
        const account=await stripeClient(current.key).accounts.retrieveCurrent();
        stripeReachable=account.id===current.accountId && account.charges_enabled===true;
      }catch{}
    }
    const mail=await emailStatus();
    const publicOrigin=(env.PUBLIC_ORIGIN||'').replace(/\/$/,'');
    const indexable=env.SITE_INDEXABLE==='true'||publicOrigin==='https://retroreplay.uk';
    return json({
      ok:true,
      site:'RetroReplay UK',
      origin:publicOrigin||origin,
      search:{indexable},
      payments:{
        mode:status.mode,
        enabled:status.enabled,
        merchantConfigured:Boolean(status.current),
        chargesEnabled:Boolean(status.current?.chargesEnabled),
        stripeReachable,
        webhookConfigured:Boolean(status.current?.webhookConfigured),
        webhookSeen:Boolean(status.webhookSeen),
        brandingConfirmed:Boolean(status.brandingConfirmed),
        fulfilmentConfirmed:Boolean(status.fulfilmentConfirmed),
      },
      email:{
        configured:Boolean(mail.configured),
        enabled:Boolean(mail.enabled),
        tested:Boolean(mail.testedAt),
        started:Boolean(mail.startedAt),
      },
    });
  });
}
