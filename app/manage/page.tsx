import {requireChatGPTUser,chatGPTSignOutPath} from '@/app/chatgpt-auth';
import {isAdmin} from '@/lib/server';
import {OperationsArea} from '@/components/OperationsArea';
import {AdminArea} from '@/components/AdminArea';
import {brands,businessBrand} from '@/lib/operations.mjs';
import '../operations.css';
export const dynamic='force-dynamic';
export const metadata={title:'Business management',robots:{index:false,follow:false}};
export default async function Page(){const user=await requireChatGPTUser('/manage');if(!await isAdmin())return <section className="ops-gate"><h1>Owner access required.</h1><p>This account cannot manage {brands[businessBrand as keyof typeof brands].name}.</p><a href={chatGPTSignOutPath('/manage')} target="_top">Sign out and choose the owner account</a></section>;return <OperationsArea owner user={{displayName:user.displayName,email:user.email}} signOut={chatGPTSignOutPath('/manage')} storeTools={<AdminArea/>}/>;}
