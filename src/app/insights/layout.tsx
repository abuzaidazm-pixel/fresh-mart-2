import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Sourcing Map',
  description:
    'Interactive choropleth of FreshMart partner countries — switch metrics, hover for values, and inspect origin details.',
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
