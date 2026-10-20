'use client';
import {useEffect,useState,type AnchorHTMLAttributes} from 'react';
import {campaignHref,campaignValue} from '@/lib/funnels.mjs';

// Shop navigation must work before hydration and with ordinary browser history.
// Document navigation also avoids the runtime's failed client transition path.
export default function SiteLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const [campaign,setCampaign]=useState('');
  useEffect(()=>{setCampaign(campaignValue(new URLSearchParams(window.location.search).get('utm_campaign')));},[]);
  return <a data-navigation="document" {...props} href={campaignHref(props.href,campaign)}/>;
}
