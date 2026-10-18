import Link from 'next/link';
export default function NotFound() { return <section className="container empty-state"><div className="eyebrow">404 / WRONG LEVEL</div><h1>This page has left the game.</h1><p>Let’s get you back to the good stuff.</p><Link href="/" className="button navy">Back to the start →</Link></section>; }
