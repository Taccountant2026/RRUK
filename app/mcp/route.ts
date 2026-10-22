import {agentRpc} from '@/lib/agent-server';
export const dynamic='force-dynamic';
export const POST=agentRpc;
export async function GET(){return new Response('Use an authenticated MCP connection.',{status:405,headers:{Allow:'POST','Cache-Control':'no-store'}});}
