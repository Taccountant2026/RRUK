import Link from '@/components/SiteLink';
import { notFound, permanentRedirect } from 'next/navigation';
import { legacyDestination } from '@/lib/legacy.mjs';
import { policies, policyLinks } from '@/lib/policies';
import { business } from '@/lib/shop';
export function generateStaticParams() { return Object.keys(policies).map(page => ({ page })); }
export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) { const { page } = await params; return { title: policies[page]?.title || 'Page not found', alternates: { canonical: `/${page}` }, description: policies[page]?.intro }; }
export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const redirect=legacyDestination([page]);
  if(redirect && redirect!==`/${page}`)permanentRedirect(redirect);
  const policy=Object.hasOwn(policies,page)?policies[page]:null; if (!policy) notFound();
  return <><div className="page-heading"><div className="container"><div className="eyebrow">{policy.kicker}</div><h1>{policy.title}</h1><p>{policy.intro}</p></div></div><section className="section"><div className="container policy-wrap"><nav className="policy-nav" aria-label="Information pages"><h2>Good to know</h2>{policyLinks.map(([slug, title]) => <Link className={page === slug ? 'current' : ''} href={`/${slug}`} key={slug}>{title}</Link>)}</nav><article className="prose">{policy.sections.map(s => <section id={s.id} key={s.id} className={s.id === 'cancellation-form' ? 'cancellation-form' : ''}><h2>{s.title}</h2>{s.paragraphs.map((p, i) => <p key={i} className="preserve-lines">{p === 'info@retroreplay.uk' ? <a href="mailto:info@retroreplay.uk">{p}</a> : p}</p>)}</section>)}<p className="policy-date">Last updated {page==='privacy'?'22':'19'} October 2026 · Policy version {business.policyVersion}</p></article></div></section></>;
}
