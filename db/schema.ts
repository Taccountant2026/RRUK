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

export const emailOutbox = sqliteTable('email_outbox', {
  id:text('id').primaryKey(),dedupeKey:text('dedupe_key').notNull().unique(),kind:text('kind').notNull(),referenceId:text('reference_id').notNull(),
  recipient:text('recipient').notNull(),payloadJson:text('payload_json').notNull(),status:text('status').notNull().default('pending'),attempts:integer('attempts').notNull().default(0),
  createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),nextAttemptAt:integer('next_attempt_at').notNull(),
  firstAttemptAt:integer('first_attempt_at'),providerId:text('provider_id'),lastError:text('last_error'),leaseToken:text('lease_token'),leaseExpiresAt:integer('lease_expires_at'),
},t=>[index('email_outbox_due_idx').on(t.status,t.nextAttemptAt),check('email_outbox_status_valid',sql.raw("status IN ('pending','sending','accepted','review')")),check('email_outbox_attempts_valid',sql.raw('attempts >= 0'))]);

export const opsCustomers=sqliteTable('ops_customers',{
 userId:text('user_id').primaryKey(),name:text('name').notNull(),email:text('email').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),
});
export const opsCases=sqliteTable('ops_cases',{
 id:text('id').primaryKey(),brand:text('brand').notNull(),kind:text('kind').notNull(),userId:text('user_id'),
 customerName:text('customer_name').notNull(),customerEmail:text('customer_email').notNull(),title:text('title').notNull(),description:text('description').notNull(),
 status:text('status').notNull().default('new'),revision:integer('revision').notNull().default(0),requestKey:text('request_key').notNull().unique(),payloadHash:text('payload_hash').notNull(),
 preferredAt:text('preferred_at').notNull().default(''),scheduledAt:text('scheduled_at').notNull().default(''),serviceId:text('service_id').notNull().default(''),providerRef:text('provider_ref').notNull().default(''),providerUrl:text('provider_url').notNull().default(''),
 quotePence:integer('quote_pence'),quoteStatus:text('quote_status').notNull().default('none'),quoteTerms:text('quote_terms').notNull().default(''),quoteReplyAt:integer('quote_reply_at'),
 createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),
},t=>[index('ops_case_customer_idx').on(t.userId,t.brand,t.updatedAt),index('ops_case_work_idx').on(t.brand,t.kind,t.status),check('ops_case_brand',sql.raw("brand IN ('rruk','bytova','garden')")),check('ops_case_kind',sql.raw("kind IN ('enquiry','booking','job','incident','quote','repair')")),check('ops_case_status',sql.raw("status IN ('new','awaiting_customer','in_progress','scheduled','completed','cancel_requested','cancelled','closed')"))]);
export const opsMessages=sqliteTable('ops_messages',{
 id:text('id').primaryKey(),caseId:text('case_id').notNull().references(()=>opsCases.id),senderId:text('sender_id').notNull(),senderRole:text('sender_role').notNull(),visibility:text('visibility').notNull(),body:text('body').notNull(),requestKey:text('request_key').notNull().unique(),payloadHash:text('payload_hash').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('ops_message_case_idx').on(t.caseId,t.createdAt),check('ops_message_visibility',sql.raw("visibility IN ('shared','internal')")),check('ops_message_sender',sql.raw("sender_role IN ('customer','owner')")),check('ops_message_internal',sql.raw("visibility != 'internal' OR sender_role = 'owner'"))]);
export const opsEvents=sqliteTable('ops_events',{
 id:text('id').primaryKey(),caseId:text('case_id').notNull().references(()=>opsCases.id),actorId:text('actor_id').notNull(),action:text('action').notNull(),detail:text('detail').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('ops_event_case_idx').on(t.caseId,t.createdAt)]);
export const opsOrderLinks=sqliteTable('ops_order_links',{
 orderId:text('order_id').primaryKey().references(()=>orders.id),userId:text('user_id').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('ops_order_customer_idx').on(t.userId)]);
export const opsAttachments=sqliteTable('ops_attachments',{
 id:text('id').primaryKey(),caseId:text('case_id').notNull().references(()=>opsCases.id),uploaderId:text('uploader_id').notNull(),objectKey:text('object_key').notNull().unique(),filename:text('filename').notNull(),contentType:text('content_type').notNull(),size:integer('size').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('ops_attachment_case_idx').on(t.caseId)]);
