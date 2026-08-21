import type { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/seedData';

/**
 * Only public, indexable pages belong here. Checkout, account and admin are
 * excluded deliberately — see robots.ts.
 *
 * Product URLs come from the seed catalogue because the sitemap is generated at
 * build time, when there is no browser session to query Supabase with. If you
 * later want the live catalogue in here, fetch it with the service role key from
 * a server component instead.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fresh-mart-2.vercel.app';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = INITIAL_CATEGORIES.map(c => ({
    url: `${base}/products?cat=${c.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = INITIAL_PRODUCTS.filter(p => p.is_active).map(p => ({
    url: `${base}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
