import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const products = sqliteTable('products', {
  id: text('id').primaryKey(), slug: text('slug').notNull().unique(), title: text('title').notNull(),
  category: text('category').notNull(), description: text('description').notNull(), condition: text('condition').notNull(),
  conditionNotes: text('condition_notes').notNull(), pricePence: integer('price_pence').notNull(), stock: integer('stock').notNull().default(0),
  active: integer('active').notNull().default(0), imagesJson: text('images_json').notNull().default('[]'), includesJson: text('includes_json').notNull().default('[]'),
  compatibility: text('compatibility').notNull(), shippingPence: integer('shipping_pence').notNull().default(0), deliveryEstimate: text('delivery_estimate').notNull(),
  warrantyMonths: integer('warranty_months').notNull().default(0), revision: integer('revision').notNull().default(0), updatedAt: integer('updated_at').notNull(),
}, t => [check('stock_nonnegative', sql`${t.stock} >= 0`), check('price_positive', sql`${t.pricePence} >= 50`), check('shipping_nonnegative', sql`${t.shippingPence} >= 0`)]);
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(), requestHash: text('request_hash').notNull().unique(), basketHash: text('basket_hash').notNull(),
  status: text('status').notNull(), mode: text('mode').notNull(), accountId: text('account_id').notNull(),
  totalPence: integer('total_pence').notNull(), shippingPence: integer('shipping_pence').notNull(), itemsJson: text('items_json').notNull(),
  policyVersion: text('policy_version').notNull(), policyText: text('policy_text').notNull(),
  sessionId: text('session_id').unique(), checkoutUrl: text('checkout_url'), expiresAt: integer('expires_at').notNull(),
  checkoutParams: text('checkout_params'),
  restocked: integer('restocked').notNull().default(0), customerJson: text('customer_json'), tracking: text('tracking'), carrier: text('carrier'),
  createdAt: integer('created_at').notNull(), paidAt: integer('paid_at'), dispatchedAt: integer('dispatched_at'),
}, t => [index('order_status_idx').on(t.status), index('order_created_idx').on(t.createdAt)]);
export const settings = sqliteTable('settings', { key: text('key').primaryKey(), value: text('value').notNull(), updatedAt: integer('updated_at').notNull() });
export const webhookEvents = sqliteTable('webhook_events', { id: text('id').primaryKey(), type: text('type').notNull(), orderId: text('order_id'), mode: text('mode').notNull(), receivedAt: integer('received_at').notNull() });
export const rateLimits = sqliteTable('rate_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expiresAt: integer('expires_at').notNull() });
export const enquiries = sqliteTable('enquiries', {
  id: text('id').primaryKey(), requestHash: text('request_hash').notNull().unique(), payloadHash: text('payload_hash').notNull(),
  productId: text('product_id').notNull(), productSlug: text('product_slug').notNull(), productTitle: text('product_title').notNull(),
  name: text('name').notNull(), email: text('email').notNull(), quantity: integer('quantity').notNull(), notes: text('notes').notNull(),
  status: text('status').notNull().default('new'), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(), closedAt: integer('closed_at'),
}, t=>[index('enquiry_created_idx').on(t.createdAt), check('enquiry_quantity_valid',sql`${t.quantity} BETWEEN 1 AND 10`), check('enquiry_status_valid',sql`${t.status} IN ('new','contacted','closed')`)]);

export const communitySubmissions = sqliteTable('community_submissions', {
  id:text('id').primaryKey(),requestHash:text('request_hash').notNull().unique(),payloadHash:text('payload_hash').notNull(),
  kind:text('kind').notNull(),name:text('name').notNull(),email:text('email').notNull(),title:text('title').notNull(),body:text('body').notNull(),
  consent:integer('consent').notNull().default(0),status:text('status').notNull().default('new'),revision:integer('revision').notNull().default(0),
  createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),
},t=>[index('community_status_idx').on(t.status,t.createdAt),
  check('community_kind_valid',sql.raw("kind IN ('story','hunt','question')")),
  check('community_status_valid',sql.raw("status IN ('new','published','closed')")),
  check('community_publish_consent',sql.raw("status != 'published' OR (kind = 'story' AND consent = 1)")),
]);
