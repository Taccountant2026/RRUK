import {db} from './server';
import {ShopError} from './commerce.mjs';
import {funnelRecord,initialFunnelMeta,parseProgress,funnelMetaSql,progressSourceSql} from './funnels.mjs';

export async function funnelMetaStatement(id:string,brand:string,route:string,campaign=''){
 return db().prepare(funnelMetaSql())
  .bind('funnel:'+id,JSON.stringify(initialFunnelMeta(brand,route,campaign)),Date.now(),id);
}
export async function getFunnelLeads(){
 const [submissions,enquiries,settings]=await Promise.all([
  db().prepare("SELECT id,'submission' AS source,kind,name,email,title,body,status,created_at,updated_at FROM community_submissions WHERE kind!='story' ORDER BY created_at DESC LIMIT 400").all(),
  db().prepare("SELECT id,'enquiry' AS source,'enquiry' AS kind,name,email,product_title AS title,notes AS body,status,created_at,updated_at FROM enquiries ORDER BY created_at DESC LIMIT 200").all(),
  db().prepare("SELECT key,value,updated_at FROM settings WHERE key LIKE 'funnel:%'").all<{key:string;value:string;updated_at:number}>(),
 ]);
 const meta=new Map(settings.results.map(s=>{try{return [s.key,{...JSON.parse(s.value),revision:s.updated_at}] as const;}catch{return [s.key,null] as const;}}));
 return [...submissions.results,...enquiries.results].map(row=>funnelRecord(row,meta.get('funnel:'+row.id))).sort((a,b)=>b.created_at-a.created_at);
}
export async function saveFunnelProgress(input:unknown){
 const value=parseProgress(input),table=value.source==='enquiry'?'enquiries':'community_submissions';
 const row=await db().prepare(`SELECT id,status FROM ${table} WHERE id=?${value.source==='submission'?" AND kind!='story'":''}`).bind(value.id).first();
 if(!row)throw new ShopError('Private enquiry not found.',404);
 const old=await db().prepare('SELECT value,updated_at FROM settings WHERE key=?').bind('funnel:'+value.id).first<{value:string;updated_at:number}>();
 if((old?.updated_at||0)!==value.revision)throw new ShopError('This enquiry changed. Refresh before saving.',409);
 const previous=old?JSON.parse(old.value):initialFunnelMeta('rruk',value.source==='enquiry'?'ready-buyer':'general');
 const now=Math.max(Date.now(),value.revision+1),{id,source,revision,...progress}=value;
 const next={...previous,...progress};
 const update=old?db().prepare('UPDATE settings SET value=?,updated_at=? WHERE key=? AND updated_at=?').bind(JSON.stringify(next),now,'funnel:'+id,revision):db().prepare('INSERT INTO settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO NOTHING').bind('funnel:'+id,JSON.stringify(next),now);
 const closed=['won','closed'].includes(value.stage);
 const status=value.source==='enquiry'?(closed?'closed':value.stage==='new'?'new':'contacted'):(closed?'closed':'new');
 // Guard the source update with the successful metadata revision in the same transaction.
 const sourceUpdate=value.source==='enquiry'
  ?db().prepare(progressSourceSql('enquiry')).bind(status,now,closed?now:null,id,'funnel:'+id,now)
  :db().prepare(progressSourceSql('submission')).bind(status,now,id,'funnel:'+id,now);
 const result=await db().batch([update,sourceUpdate]);
 if(!result[0].meta.changes)throw new ShopError('This enquiry changed. Refresh before saving.',409);
 return {saved:true};
}
