/* Consent-controlled website statistics. Google tag loads in consent-denied mode; analytics events/storage require opt-in. */
(()=>{
 const script=document.currentScript,brand=script?.dataset.brand,gaId=String(script?.dataset.gaId||({rruk:'G-4YTG0QWMW5',bytova:'G-HXLHMHPVZM',garden:'G-SBLP603J4G'}[brand]||'')).trim();
 if(!['rruk','bytova','garden'].includes(brand))return;
 const validGaId=/^G-[A-Z0-9]{6,20}$/.test(gaId)?gaId:'';
 const scriptUrl=script.src;
 import(new URL('statistics-core.mjs',scriptUrl).href).then(({readChoice,permittedEvent})=>{
  const key='business-statistics-choice-v1',preview=!['retroreplay.uk','bytova.co.uk','www.bytova.co.uk','taccountant2026.github.io','stoneandsprig.co.uk','www.stoneandsprig.co.uk'].includes(location.hostname),doNotTrack=navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
  if(brand==='rruk'&&/^\/(?:admin|api|order|chatgpt-auth)(?:\/|$)/.test(location.pathname))return;
  let choice=null,viewSent=false,panel=null,returnFocus=null;
  try{choice=readChoice(localStorage.getItem(key));}catch{}
  const privacy=brand==='garden'?new URL('privacy.html',scriptUrl).href:brand==='bytova'?new URL('privacy.html',scriptUrl).href:new URL('/privacy',scriptUrl).href;
  let gaReady=false;
  function ensureGoogleTag(){
   if(!validGaId||preview||doNotTrack||gaReady)return;
   window.dataLayer=window.dataLayer||[];
   window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
   window.gtag('js',new Date());
   window.gtag('config',validGaId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
   const g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(validGaId);document.head.append(g);
   gaReady=true;
  }
  function setGoogleConsent(allowed){if(!validGaId||preview||doNotTrack)return;ensureGoogleTag();window.gtag('consent','update',{analytics_storage:allowed?'granted':'denied'});}
  ensureGoogleTag();
  if(choice?.allowed)setGoogleConsent(true);
  function googleMeasure(event){
   if(!validGaId||preview||doNotTrack||!choice?.allowed)return;
   setGoogleConsent(true);
   window.gtag('event',event,{page_path:location.pathname});
  }
  function measure(event){const payload=permittedEvent({choice,brand,path:location.pathname,event,campaign:new URLSearchParams(location.search).get('utm_campaign'),doNotTrack,preview});if(!payload)return;if(event==='page_view'){if(viewSent)return;viewSent=true;}void fetch('https://retroreplay.uk/api/metrics',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});googleMeasure(event);}
  const style=document.createElement('style');style.textContent='.stats-choice{position:fixed;z-index:90;left:20px;right:20px;bottom:20px;margin:auto;max-width:880px;padding:23px 26px;background:#fffef9;color:#20392d;border:1px solid #839180;box-shadow:0 8px 50px #122c2633;font:14px/1.65 system-ui,sans-serif;box-sizing:border-box}.stats-choice h2{font:600 20px/1.3 system-ui,sans-serif;margin:0 0 8px;letter-spacing:0}.stats-choice p{margin:0 0 15px;color:#425345;font-size:13px}.stats-choice .stats-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.stats-choice button,.stats-preferences{font:600 12px/1.5 system-ui,sans-serif;color:#20392d;background:#fffef9;border:1px solid #69816a;padding:10px 15px;cursor:pointer;min-height:42px}.stats-choice button:focus-visible,.stats-preferences:focus-visible,.stats-choice a:focus-visible{outline:3px solid #994329;outline-offset:3px}.stats-choice button:disabled{opacity:.55;cursor:default}.stats-choice a{font-size:12px;text-decoration:underline;color:#284a37}.stats-preferences{position:fixed;bottom:12px;right:12px;z-index:50;padding:7px 11px;min-height:34px;box-shadow:0 2px 12px #122c261a}.stats-choice .stats-note{font-size:11px;margin:12px 0 0}@media(max-width:580px){.stats-choice{left:10px;right:10px;bottom:10px;padding:19px;max-height:85vh;overflow:auto}.stats-choice .stats-actions button{flex:1}.stats-preferences{font-size:10px}}@media print{.stats-choice,.stats-preferences{display:none!important}}';document.head.append(style);
  const prefs=document.createElement('button');prefs.type='button';prefs.className='stats-preferences';prefs.textContent='Privacy choices';prefs.setAttribute('aria-controls','statistics-choice');document.body.append(prefs);
  function close(){if(panel){panel.remove();panel=null;}if(returnFocus?.isConnected)returnFocus.focus();}
  function choose(allowed){choice={version:1,allowed,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(choice));}catch{}setGoogleConsent(allowed);close();if(allowed)measure('page_view');}
  function show(focus=false){if(panel)return;returnFocus=focus?document.activeElement:null;panel=document.createElement('section');panel.id='statistics-choice';panel.className='stats-choice';panel.setAttribute('aria-label','Optional website statistics');const h=document.createElement('h2');h.textContent='Help us improve this website?';const p=document.createElement('p');p.textContent='Optional statistics help us understand page visits and useful actions. If you allow them, our private statistics service and Google Analytics may be used. Form text, names and email addresses are not sent as analytics events. You can change your choice at any time.';panel.append(h,p);const actions=document.createElement('div');actions.className='stats-actions';const allow=document.createElement('button');allow.type='button';allow.textContent='Allow statistics';allow.disabled=doNotTrack;allow.onclick=()=>choose(true);const deny=document.createElement('button');deny.type='button';deny.textContent='Keep statistics off';deny.onclick=()=>choose(false);const link=document.createElement('a');link.href=privacy;link.textContent='Read the privacy notice';actions.append(allow,deny,link);if(choice){const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Close choices';cancel.onclick=close;actions.append(cancel);}panel.append(actions);const note=document.createElement('p');note.className='stats-note';note.textContent=doNotTrack?'Your browser requests no tracking, so optional statistics are off.':preview?'Preview: statistics are not sent.':choice?.allowed?'Statistics are currently allowed on this device.':'Statistics stay off unless you allow them. Essential shopping and contact features work either way.';panel.append(note);document.body.append(panel);if(focus)deny.focus();}
  prefs.onclick=()=>show(true);if(!choice&&!doNotTrack)show();else measure('page_view');
  window.addEventListener('business-metric',event=>{if(event?.detail&&typeof event.detail.event==='string')measure(event.detail.event);});
  document.addEventListener('click',event=>{const a=event.target.closest?.('a[href]');if(!a)return;try{const url=new URL(a.href);if(url.hostname==='calendly.com')measure('open_booking');}catch{}});
  window.addEventListener('storage',event=>{if(event.key===key){choice=readChoice(event.newValue);setGoogleConsent(Boolean(choice?.allowed));if(panel){close();}if(choice?.allowed)measure('page_view');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&choice)close();});
 }).catch(()=>{});
})();
