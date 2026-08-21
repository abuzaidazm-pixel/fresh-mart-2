import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Basket',
  description: 'Review your groceries, apply a voucher and check the delivery total before you order.',
  // Private pages: keep them out of search results entirely.
  robots: { index: false, follow: false },
};

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
