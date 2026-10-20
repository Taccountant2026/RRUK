import searchConnections from '../public/search-connections.json';
import type { Metadata } from "next";
import "./globals.css";
import "./experience.css";
import "./interactive.css";
import "./shopping.css";
import { ShopProvider, Header, Footer } from '@/components/Storefront';
import { env } from 'cloudflare:workers';
import { getProducts } from '@/lib/catalogue-server';
import { cookies } from 'next/headers';
import { readCart } from '@/lib/cart.mjs';
import {StatisticsConsent} from '@/components/StatisticsConsent';
import { StructuredData } from '@/components/StructuredData';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> { return {
  title: { default: 'RetroReplay UK — The classics. Back in play.', template: '%s | RetroReplay UK' },
  description: 'An independent UK home for pre-owned consoles, genuine physical games and retro gaming accessories. Clear condition details and personal support.',
  metadataBase: new URL(env.PUBLIC_ORIGIN || 'https://rruk.taccountant.chatgpt.site'),
  robots: { index: env.SITE_INDEXABLE === 'true', follow: env.SITE_INDEXABLE === 'true' },
  openGraph: { type: 'website', siteName: 'RetroReplay UK', locale: 'en_GB', title: 'RetroReplay UK — The classics. Back in play.', description: 'An independent UK home for retro gaming.', images: ['/assets/social-cover.png'] },
  twitter:{card:'summary_large_image',images:['/assets/social-cover.png']},
  verification:{google:searchConnections.googleVerification||undefined,yandex:searchConnections.yandexVerification||undefined,other:searchConnections.bingVerification?{'msvalidate.01':searchConnections.bingVerification}:{}},
  referrer: 'no-referrer',
  icons: {
    icon: "/assets/rruk-logo.jpg",
    shortcut: "/assets/rruk-logo.jpg",
  },
}; }

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialProducts = await getProducts();
  const cartCookie = (await cookies()).get('rruk_cart')?.value;
  const initialCart = cartCookie === undefined ? undefined : readCart(cartCookie);
  return (
    <html lang="en-GB">
      <body><StatisticsConsent/><StructuredData data={{'@context':'https://schema.org','@type':'WebSite',name:'RetroReplay UK',url:env.PUBLIC_ORIGIN||'https://retroreplay.uk',potentialAction:{'@type':'SearchAction',target:(env.PUBLIC_ORIGIN||'https://retroreplay.uk')+'/shop?q={search_term_string}','query-input':'required name=search_term_string'}}}/><a className="skip-link" href="#main">Skip to content</a><ShopProvider initialProducts={initialProducts} initialCart={initialCart}><Header/><main id="main">{children}</main><Footer/></ShopProvider></body>
    </html>
  );
}
