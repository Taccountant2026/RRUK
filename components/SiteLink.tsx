import type { AnchorHTMLAttributes } from 'react';

// Shop navigation must work before hydration and with ordinary browser history.
// Document navigation also avoids the runtime's failed client transition path.
export default function SiteLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a data-navigation="document" {...props}/>;
}
