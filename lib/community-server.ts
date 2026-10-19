import { db } from './server';
export type Story={id:string;name:string;title:string;body:string;created_at:number};
export async function getStories():Promise<Story[]>{
  const rows=await db().prepare("SELECT id,name,title,body,created_at FROM community_submissions WHERE kind='story' AND status='published' AND consent=1 ORDER BY updated_at DESC LIMIT 30").all<Story>();
  return rows.results;
}
export async function getStory(id:string):Promise<Story|null>{
  if(!/^[a-f0-9-]{36}$/.test(id))return null;
  return db().prepare("SELECT id,name,title,body,created_at FROM community_submissions WHERE id=? AND kind='story' AND status='published' AND consent=1").bind(id).first<Story>();
}
