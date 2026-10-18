'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="container empty-state"><h1>A little pause in the game.</h1><p>We couldn’t load this page. Please try again, or email info@retroreplay.uk for help.</p><button className="button navy" onClick={reset}>Try again</button></section>;}
