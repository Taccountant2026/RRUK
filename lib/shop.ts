export const business = {
  name: 'RetroReplay UK', short: 'RRUK', owner: 'Leighton Hepworth',
  email: 'info@retroreplay.uk',
  address: '65 Coronation Road, Stainforth, Doncaster, South Yorkshire, DN7 5EU, United Kingdom',
  policyVersion: '2026-10-19',
};
export const categories = [
  { id: 'consoles', name: 'Consoles & handhelds', description: 'The machines that made the memories.', colour: 'blue' },
  { id: 'games', name: 'Physical games', description: 'Your next “just one more level”.', colour: 'coral' },
  { id: 'accessories', name: 'Accessories & cases', description: 'The little things that complete the setup.', colour: 'gold' },
] as const;
export type Product = {
  id: string; slug: string; title: string; category: string; description: string;
  condition: string; conditionNotes: string; pricePence: number; stock: number;
  active: boolean; images: string[]; includes: string[]; compatibility: string;
  shippingPence: number; deliveryEstimate: string; warrantyMonths: number;
  catalogueOnly?: boolean; priceOnRequest?: boolean; guidePriceMaxPence?: number;
  artKind?: string; sourceItemIds?: string[];
};
export const money = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
export const emailLink = (subject = 'Hello RetroReplay UK', body = '') => `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
