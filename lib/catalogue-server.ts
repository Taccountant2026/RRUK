import type { Product } from './shop';
import { db, setting } from './server';
import sourcingCatalogue from './sourcing-catalogue.json';
import { sourceOrderCatalogue, sourceOrderDefaults } from './source-orders.mjs';
export async function sourceOptions() { const raw=await setting('source-order-options');return raw?JSON.parse(raw) as typeof sourceOrderDefaults:sourceOrderDefaults; }
export async function getSourceProducts():Promise<Product[]> { return sourceOrderCatalogue(sourcingCatalogue,await sourceOptions()) as Product[]; }
export type ProductRow = { id:string; slug:string; title:string; category:string; description:string; condition:string; condition_notes:string; price_pence:number; stock:number; active:number; images_json:string; includes_json:string; compatibility:string; shipping_pence:number; delivery_estimate:string; warranty_months:number; revision:number; updated_at:number };
export function productFromRow(r: ProductRow): Product & { revision:number } { return { id:r.id,slug:r.slug,title:r.title,category:r.category,description:r.description,condition:r.condition,conditionNotes:r.condition_notes,pricePence:r.price_pence,stock:r.stock,active:Boolean(r.active),images:JSON.parse(r.images_json),includes:JSON.parse(r.includes_json),compatibility:r.compatibility,shippingPence:r.shipping_pence,deliveryEstimate:r.delivery_estimate,warrantyMonths:r.warranty_months,revision:r.revision }; }
export async function getProducts(includeDrafts=false): Promise<(Product & { revision?:number })[]> {
  const result=await db().prepare(`SELECT * FROM products${includeDrafts?'':' WHERE active=1'} ORDER BY updated_at DESC`).all<ProductRow>();
  const saleItems=result.results.map(productFromRow);
  if (includeDrafts) return saleItems;
  // A confirmed sale item replaces its sourcing entry, without inventing stock in D1.
  const saleSlugs=new Set(saleItems.map(p=>p.slug));
  return [...saleItems,...(await getSourceProducts()).filter(p=>!saleSlugs.has(p.slug))];
}
