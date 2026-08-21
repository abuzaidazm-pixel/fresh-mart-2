import type { Metadata } from 'next';

// Page-level metadata has to live in a server component; the catalogue page
// itself is a client component, so this thin layout carries the tags.
export const metadata: Metadata = {
  title: 'Shop All Groceries',
  description:
    'Browse fresh fruit and vegetables, dairy, bakery, staples, snacks and household essentials. Delivered to your door in 30 minutes.',
  alternates: { canonical: '/products' },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
