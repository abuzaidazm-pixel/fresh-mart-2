import type { Metadata } from 'next';
import { INITIAL_PRODUCTS } from '@/lib/seedData';

/**
 * Per-product titles and descriptions. Without this every product page shared
 * one title, so search engines saw dozens of identical pages and social shares
 * showed the generic store name instead of the item.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = INITIAL_PRODUCTS.find(p => p.slug === params.slug);

  if (!product) {
    return { title: 'Product not found' };
  }

  const description =
    product.description?.slice(0, 155) ||
    `Buy ${product.name} (${product.unit}) from FreshMart Local with 30-minute delivery.`;

  return {
    title: `${product.name} — ${product.unit}`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | FreshMart Local`,
      description,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
      type: 'website',
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
