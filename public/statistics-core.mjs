export const campaigns=['bytova-remote-autumn26','bytova-repairs-autumn26','bytova-websites-autumn26','bytova-shop-autumn26','bytova-content-autumn26','bytova-automation-autumn26','rruk-start-autumn26','rruk-gifts-autumn26','rruk-collectors-autumn26','rruk-setup-autumn26','rruk-community-autumn26','rruk-shop-autumn26','outdoor-projects-autumn26','outdoor-planner-autumn26','outdoor-pots-autumn26','outdoor-wildlife-autumn26','outdoor-journal-autumn26','outdoor-range-autumn26'];
export const events=['page_view','start_tool','complete_tool','save_item','begin_checkout','open_booking','enquiry_receipt'];
export function readChoice(raw,now=Date.now()){try{const v=typeof raw==='string'?JSON.parse(raw):raw;if(v?.version!==1||typeof v.allowed!=='boolean'||!Number.isSafeInteger(v.at)||v.at>now+60000||now-v.at>180*86400000)return null;return {version:1,allowed:v.allowed,at:v.at};}catch{return null;}}
export function publicPage(brand,path){
 if(!['rruk','bytova','garden'].includes(brand)||typeof path!=='string'||path.length>180||/[?#%\\\s]/.test(path))return null;
 if(path==='/index.html'&&brand==='bytova')return '/';if(path==='/Turf-Right/index.html'&&brand==='garden')return '/Turf-Right/';
 if(brand==='rruk')return /^\/(?:admin|api|order|chatgpt-auth)(?:\/|$)/.test(path)?null:/^\/[a-z0-9/*-]*$/.test(path)?path:null;
 if(brand==='garden')return path==='/Turf-Right/'||/^\/Turf-Right\/(?:[a-z0-9-]+\/)?[a-z0-9-]+\.html$/.test(path)&&!path.endsWith('/checkout.html')&&!path.endsWith('/404.html')?path:null;
 return path==='/'||/^\/[a-z0-9-]+\.html$/.test(path)&&path!=='/404.html'?path:null;
}
export function permittedEvent({choice,brand,path,event,campaign,doNotTrack=false,preview=false},now=Date.now()){
 if(!readChoice(choice,now)?.allowed||doNotTrack||preview||!events.includes(event))return null;
 const page=publicPage(brand,path);if(!page)return null;
 return {brand,page,event,campaign:campaigns.includes(campaign)?campaign:'',consent:true};
}
