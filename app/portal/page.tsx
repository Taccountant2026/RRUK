import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '@/app/chatgpt-auth';
import {OperationsArea} from '@/components/OperationsArea';
import {brands,businessBrand} from '@/lib/operations.mjs';
import {isAdmin} from '@/lib/server';
import '../operations.css';
export const dynamic='force-dynamic';
export const metadata={title:'Customer area',robots:{index:false,follow:false}};
export default async function Page(){const user=await getChatGPTUser(),brand=brands[businessBrand as keyof typeof brands];if(!user)return <section className="ops-gate"><img className="ops-gate-logo" src={brand.logo} alt={brand.name}/><div className="eyebrow">YOUR {brand.name.toUpperCase()} CUSTOMER AREA</div><h1>Your requests.<br/>A clearer next step.</h1><p>Keep your requests, agreed appointments and conversations together. Sign in to view your own records and send a request.</p><p><a className="ops-login-link" href={chatGPTSignInPath('/portal')} target="_top">Sign in with ChatGPT →</a></p><p>Only your authorised records appear here. Existing guest records need verification before they can be linked to an account.</p><p><a href="/portal/privacy">Privacy & account information</a> · <a href={brand.home}>Return to {brand.name}</a></p></section>;return <OperationsArea owner={false} user={{displayName:user.displayName,email:user.email}} signOut={chatGPTSignOutPath('/portal')}/>;}
