import {db,hash} from './server';
import {ShopError} from './commerce.mjs';
import {statisticRecord,statisticSql,statisticsSummary,statisticsSince} from './measurement.mjs';
let nextStatisticsCleanup=0;
export async function saveStatistic(request:Request,event:{brand:string;page:string;event:string;campaign:string}){
 const now=Date.now(),bucket=Math.floor(now/900000),ip=request.headers.get('cf-connecting-ip')||'unknown',key=await hash('statistics:'+ip+':'+bucket);
 const rate=await db().prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+1800000).first<{count:number}>();
 if(!rate||rate.count>120)throw new ShopError('Statistics rate limit reached.',429);
 const row=statisticRecord(event,now),statements=[db().prepare(statisticSql()).bind(row.key,row.value,now)];if(now>=nextStatisticsCleanup){nextStatisticsCleanup=now+600000;statements.push(db().prepare("DELETE FROM settings WHERE key LIKE 'traffic:%' AND updated_at<?").bind(now-90*86400000),db().prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(now));}await db().batch(statements);
}
export async function getStatistics(brand='all',days=28){
 const safeBrand=['all','rruk','bytova','garden'].includes(brand)?brand:'all',safeDays=[7,28,90].includes(days)?days:28,since=statisticsSince(safeDays);
 const rows=await db().prepare("SELECT value FROM settings WHERE key LIKE 'traffic:%' AND updated_at>=? ORDER BY key DESC LIMIT 20000").bind(since).all<{value:string}>();
 const leads=await db().prepare("SELECT COALESCE(json_extract(m.value,'$.brand'),'rruk') AS brand,COUNT(*) AS count FROM community_submissions c LEFT JOIN settings m ON m.key='funnel:'||c.id WHERE c.created_at>=? AND c.kind!='story' GROUP BY brand").bind(since).all<{brand:string;count:number}>();
 const enquiries=await db().prepare('SELECT COUNT(*) AS count FROM enquiries WHERE created_at>=?').bind(since).first<{count:number}>();
 const orders=await db().prepare("SELECT COUNT(*) AS count,COALESCE(SUM(total_pence),0) AS pence FROM orders WHERE mode='live' AND status IN ('paid','dispatched') AND paid_at>=?").bind(since).first<{count:number;pence:number}>();
 const leadCounts={rruk:0,bytova:0,garden:0};for(const r of leads.results){if(r.brand in leadCounts)leadCounts[r.brand as keyof typeof leadCounts]+=r.count;}leadCounts.rruk+=enquiries?.count||0;
 return {...statisticsSummary(rows.results,safeBrand),brand:safeBrand,days:safeDays,leadCounts,savedEnquiries:safeBrand==='all'?Object.values(leadCounts).reduce((n,v)=>n+v,0):leadCounts[safeBrand as keyof typeof leadCounts],paidOrders:safeBrand==='all'||safeBrand==='rruk'?orders?.count||0:0,paidOrderPence:safeBrand==='all'||safeBrand==='rruk'?orders?.pence||0:0,truncated:rows.results.length>=20000};
}
