import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store Documentation',
  description: 'How the FreshMart Local storefront, inventory and order management work.',
  robots: { index: false, follow: true },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
