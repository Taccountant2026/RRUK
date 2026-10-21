import { env } from 'cloudflare:workers';
import { paymentStatus, merchant, paymentMode, stripeClient } from '@/lib/payments';
import { emailStatus } from '@/lib/notification-server';

export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false},title:'System check'};

export default async function SystemCheck(){
  const origin=(env.PUBLIC_ORIGIN||'https://retroreplay.uk').replace(/\/$/,'');
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
  const indexable=env.SITE_INDEXABLE==='true'||origin==='https://retroreplay.uk';
  const checks=[
    ['Search indexable',indexable],
    ['Payments enabled',status.enabled],
    ['Payment mode live',status.mode==='live'],
    ['Merchant configured',Boolean(status.current)],
    ['Stripe key reachable',stripeReachable],
    ['Charges enabled',Boolean(status.current?.chargesEnabled)],
    ['Webhook configured',Boolean(status.current?.webhookConfigured)],
    ['Webhook seen by site',Boolean(status.webhookSeen)],
    ['Branding confirmed',Boolean(status.brandingConfirmed)],
    ['Fulfilment confirmed',Boolean(status.fulfilmentConfirmed)],
    ['Email configured',Boolean(mail.configured)],
    ['Email enabled',Boolean(mail.enabled)],
    ['Email connection tested',Boolean(mail.testedAt)],
  ] as const;
  return <section style={{maxWidth:760,margin:'40px auto',padding:24,fontFamily:'sans-serif'}}>
    <h1>RetroReplay UK system check</h1>
    <p>Safe operational status only. No keys, account identifiers or customer data are displayed.</p>
    <ul>{checks.map(([label,ok])=><li key={label}><strong>{ok?'PASS':'CHECK'}:</strong> {label}</li>)}</ul>
  </section>;
}
