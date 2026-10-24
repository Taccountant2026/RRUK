export const dynamic='force-dynamic';
export function GET(){
  return new Response(null,{status:308,headers:{location:'/sitemap.xml'}});
}
