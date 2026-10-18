import { OrderConfirmation } from '@/components/OrderConfirmation';
export const metadata={title:'Order record',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <OrderConfirmation id={id}/>;}
