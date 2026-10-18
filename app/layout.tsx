import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider, Header, Footer } from '@/components/Storefront';
import { env } from 'cloudflare:workers';

export async function generateMetadata(): Promise<Metadata> { return {
  title: { default: 'RetroReplay UK — The classics. Back in play.', template: '%s | RetroReplay UK' },
  description: 'An independent UK home for pre-owned consoles, genuine physical games and retro gaming accessories. Clear condition details and personal support.',
  metadataBase: new URL(env.PUBLIC_ORIGIN || 'https://rruk.taccountant.chatgpt.site'),
  robots: { index: env.SITE_INDEXABLE === 'true', follow: env.SITE_INDEXABLE === 'true' },
  openGraph: { type: 'website', siteName: 'RetroReplay UK', locale: 'en_GB', title: 'RetroReplay UK — The classics. Back in play.', description: 'An independent UK home for retro gaming.', images: ['/assets/rruk-logo.jpg'] },
  referrer: 'no-referrer',
  icons: {
    icon: "/assets/rruk-logo.jpg",
    shortcut: "/assets/rruk-logo.jpg",
  },
}; }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body><a className="skip-link" href="#main">Skip to content</a><ShopProvider><Header/><main id="main">{children}</main><Footer/></ShopProvider></body>
    </html>
  );
}
