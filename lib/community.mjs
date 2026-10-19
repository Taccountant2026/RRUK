import { ShopError } from './commerce.mjs';
export function parseSubmission(input) {
  if(!input||typeof input!=='object'||Array.isArray(input)||input.privacyAccepted!==true)throw new ShopError('Please read the privacy notice before sending.');
  const text=(key,max,min=1)=>{
    const value=typeof input[key]==='string'?input[key].trim():'';
    if(value.length<min||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw new ShopError('Please check '+key+'.');
    return value;
  };
  if(input.website)throw new ShopError('Your request could not be accepted.');
  const requestKey=text('requestKey',36),kind=text('kind',10),name=text('name',50),email=text('email',254).toLowerCase(),title=text('title',120),body=text('body',3000,20);
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(requestKey)||!['story','hunt','question'].includes(kind))throw new ShopError('Refresh the form and try again.');
  if(/[\r\n]/.test(name+title)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ShopError('Check your name, email and subject.');
  if(kind==='story'&&input.publishConsent!==true)throw new ShopError('Confirm permission to publish your display name and story after review.');
  return {requestKey,kind,name,email,title,body,consent:kind==='story'?1:0};
}
export function submissionPayload(s){return JSON.stringify([s.kind,s.name,s.email,s.title,s.body,s.consent]);}
export function submissionSql(){return "INSERT INTO community_submissions(id,request_hash,payload_hash,kind,name,email,title,body,consent,status,revision,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'new',0,?,?) ON CONFLICT(request_hash) DO NOTHING";}
export function matchingSubmission(row,payloadHash){if(row.payload_hash!==payloadHash)throw new ShopError('This form changed. Refresh before sending again.',409);return row.id;}
export function publicStory(row){
  if(row.kind!=='story'||row.status!=='published'||row.consent!==1)return null;
  return {id:row.id,name:row.name,title:row.title,body:row.body,createdAt:row.created_at};
}
export function canPublish(row){return row.kind==='story'&&row.consent===1;}
