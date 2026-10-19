import { ShopError } from './commerce.mjs';
export function parseEnquiry(input) {
  if (!input || typeof input!=='object' || Array.isArray(input)) throw new ShopError('Please check your request.');
  const text=(key,max,required=true)=>{const value=typeof input[key]==='string'?input[key].trim():'';if((required&&!value)||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw new ShopError(`Please check ${key}.`);return value;};
  const requestKey=text('requestKey',36),productId=text('productId',60),name=text('name',100),email=text('email',254).toLowerCase(),notes=text('notes',1500,false);
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(requestKey))throw new ShopError('Please refresh the page and try again.');
  if(!/^source-[a-z0-9-]+$/.test(productId)||/[\r\n]/.test(name)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ShopError('Please check your name, email and selected item.');
  if(!Number.isInteger(input.quantity)||input.quantity<1||input.quantity>10)throw new ShopError('Choose a quantity from 1 to 10.');
  return {requestKey,productId,name,email,quantity:input.quantity,notes};
}
export function enquiryPayload(input) { return JSON.stringify([input.productId,input.name,input.email,input.quantity,input.notes]); }
export function assertMatchingEnquiry(existing,payloadHash) { if(existing.payload_hash!==payloadHash)throw new ShopError('This request has changed. Please refresh the page before sending it.',409);return existing.id; }
export function insertEnquirySql() { return "INSERT INTO enquiries(id,request_hash,payload_hash,product_id,product_slug,product_title,name,email,quantity,notes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,'new',?,?) ON CONFLICT(request_hash) DO NOTHING"; }
