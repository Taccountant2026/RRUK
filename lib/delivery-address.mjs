// Pure, non-deployed primitives for an owner-issued delivery-address request.
// Do not expose this module as a customer API without database, authorization,
// CSRF, atomic one-time redemption, encrypted storage, and retention controls.
const CONTROLS = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u;
const UK_POSTCODE = /^(GIR ?0AA|[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/iu;
function field(input, name, max, optional=false) {
  const value = input?.[name];
  if (value == null && optional) return '';
  if (typeof value !== 'string') throw new Error('Invalid delivery address.');
  const cleaned = value.trim().replace(/ {2,}/gu, ' ');
  if ((!cleaned && !optional) || cleaned.length > max || CONTROLS.test(cleaned)) {
    throw new Error('Invalid delivery address.');
  }
  return cleaned;
}
export function validateUkDeliveryAddress(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid delivery address.');
  }
  if (field(input,'country',2).toUpperCase() !== 'GB') {
    throw new Error('This secure form currently supports UK delivery only.');
  }
  const recipient = field(input,'recipient',100);
  const line1 = field(input,'line1',120);
  const line2 = field(input,'line2',120,true);
  const city = field(input,'city',100);
  const rawPostcode = field(input,'postcode',12).toUpperCase().replace(/\s+/gu,'');
  if (!UK_POSTCODE.test(rawPostcode)) throw new Error('Please check the UK postcode.');
  const postcode = rawPostcode.slice(0,-3)+' '+rawPostcode.slice(-3);
  return Object.freeze({recipient,line1,line2,city,postcode,country:'GB'});
}
export function createSecureDeliveryToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
export async function hashSecureDeliveryToken(token) {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/u.test(token)) {
    throw new Error('Invalid request link.');
  }
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function isActiveDeliveryRequest(row,now=Date.now()) {
  // Revoked, redeemed, failed, or otherwise non-pending requests cannot be used.
  // This is a preliminary guard only: atomically check and consume in the DB.
  return Boolean(row && Number.isSafeInteger(now) && Number.isSafeInteger(row.expiresAt)
    && row.status === 'pending' && row.expiresAt > now
    && (row.usedAt === null || row.usedAt === undefined));
}
