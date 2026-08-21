import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Account',
  description: 'Your order history, saved addresses, payment options and account security.',
  // Private pages: keep them out of search results entirely.
  robots: { index: false, follow: false },
};

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
