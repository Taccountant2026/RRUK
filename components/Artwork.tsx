export function RetroArt({ small = false }: { small?: boolean }) {
  return <svg viewBox="0 0 560 460" role="img" aria-label="Illustration of a retro television and game controller" className={small ? 'retro-art small' : 'retro-art'}>
    <defs><pattern id="scan" width="4" height="7" patternUnits="userSpaceOnUse"><path d="M0 6h4" stroke="#000c32" strokeOpacity=".16" /></pattern><linearGradient id="screen" x2="1" y2="1"><stop stopColor="#3bdbc4"/><stop offset="1" stopColor="#1ba895"/></linearGradient></defs>
    <ellipse cx="293" cy="408" rx="224" ry="25" fill="#000721" opacity=".45"/>
    <g className="floating-spark" fill="#ffd741"><path d="M96 53h10v20H96zM91 58h20v10H91z"/><path d="M474 132h8v22h-8zM467 139h22v8h-22z"/></g>
    <path d="M258 80l-33-40m42 38 34-48" fill="none" stroke="#9da9c0" strokeWidth="9" strokeLinecap="round"/>
    <path d="M133 92h294v13h14v244h-14v13H133v-13h-15V106h15z" fill="#00051b" stroke="#070821" strokeWidth="8"/>
    <path d="M129 103h295v235H129z" fill="#425576"/>
    <path d="M141 113h267v207H141z" fill="#8197b0"/>
    <path d="M157 128h205v178H157z" fill="#091b39"/>
    <rect x="167" y="139" width="185" height="155" rx="17" fill="url(#screen)"/>
    <rect x="167" y="139" width="185" height="155" rx="17" fill="url(#scan)"/>
    <path d="M276 175h-32v10h-15v12h-11v38h11v13h39v-12h-26v-10h-11v-25h11v-10h34v14l26-26-26-24z" fill="#ffe257" stroke="#ffe257" strokeLinejoin="miter" strokeWidth="3"/>
    <path d="M374 145h19v18h-19zm0 34h19v18h-19z" fill="#07142f"/>
    <g stroke="#07142f" strokeWidth="5"><path d="M371 231h25m-25 12h25m-25 12h25m-25 12h25"/></g>
    <path d="M165 342h37v27h-37zm192 0h37v27h-37z" fill="#07102b"/>
    <path d="M262 360c-27 47-97 33-109 12-13-22 13-30 37-20" fill="none" stroke="#c0c7d1" strokeWidth="6"/>
    <g transform="translate(268 308) rotate(-9)">
      <path d="M0 12h150l26 26 16 57-13 16h-33l-21-25H34l-21 25h-34l-13-16 13-57z" fill="#00051b" stroke="#00051b" strokeWidth="8"/>
      <path d="M1 10h147l24 25 16 57-12 12h-28l-21-25H31L10 104h-28l-12-12 16-57z" fill="#e8e8da"/>
      <path d="M13 29h20v17h17v20H33v17H13V66H-4V46h17z" fill="#0b1b38"/>
      <path d="M72 58h19v7H72zm26 0h19v7H98z" fill="#64758d"/>
      <circle cx="139" cy="42" r="10" fill="#ff635d"/><circle cx="159" cy="65" r="10" fill="#2574f2"/>
    </g>
    <path d="M58 301h13v13H58zm428-45h12v12h-12z" fill="#ff6b63"/>
    <path d="M83 347h8v8h-8zm354-295h9v9h-9z" fill="#4e8eff"/>
  </svg>;
}
export function CategoryArt({ kind }: { kind: string }) {
  return <svg viewBox="0 0 360 220" aria-hidden="true" className="category-art">
    {kind === 'consoles' ? <g transform="translate(67 25) rotate(-8 120 90)"><path d="M15 68h219l21 26v72H0V94z" fill="#dce2e9" stroke="#16264a" strokeWidth="5"/><path d="M65 52h126v56H65z" fill="#aab8cb" stroke="#16264a" strokeWidth="5"/><path d="M76 62h105v20H76z" fill="#16264a"/><path d="M0 119h255v16H0z" fill="#788da9"/><path d="M17 146h32v10H17z" fill="#ff6b63"/><path d="M204 146h31v10h-31z" fill="#16264a"/><path d="M93 136h72v30H93z" fill="#16264a"/><path d="M103 143h22v10h-22zm31 0h22v10h-22z" fill="#6c80a0"/></g> : kind === 'games' ? <g stroke="#16264a" strokeWidth="5"><g transform="translate(70 32) rotate(-14 60 75)"><path d="M0 0h105v160H0z" fill="#ffe6d2"/><path d="M0 0h14v160H0z" fill="#ff635d"/><path d="M29 31h60v60H29z" fill="#1e57ce"/><path d="M39 65h39V53H59V42H48v11h-9z" fill="#ffd741"/><path d="M29 116h59m-59 15h43"/></g><g transform="translate(190 23) rotate(11 50 80)"><path d="M0 0h105v160H0z" fill="#f8eed5"/><path d="M0 0h14v160H0z" fill="#1467ee"/><path d="M29 31h60v60H29z" fill="#44bda6"/><path d="M47 48h25v27H47z" fill="#ffd741"/><path d="M29 116h59m-59 15h43"/></g></g> : <g transform="translate(74 76) rotate(-10 105 55)"><path d="M29 0h153l25 24 15 71-17 13h-31l-27-34H66l-27 34H9L-8 95 7 24z" fill="#ecece2" stroke="#16264a" strokeWidth="6"/><path d="M37 17h19v17h17v19H56v17H37V53H20V34h17z" fill="#16264a"/><circle cx="166" cy="26" r="10" fill="#ff635d"/><circle cx="187" cy="50" r="10" fill="#246fea"/><path d="M96 47h18m8 0h18" stroke="#687c99" strokeWidth="8"/><path d="M110 0c-9-56 85-32 91-61" fill="none" stroke="#16264a" strokeWidth="5"/></g>}
  </svg>;
}
