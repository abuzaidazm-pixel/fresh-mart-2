import type { MetadataRoute } from 'next';

/**
 * Keeps the private half of the store out of search results. /admin and
 * /account are protected by auth anyway — this stops the URLs being indexed and
 * advertised in the first place.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fresh-mart-2.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/account', '/checkout', '/order-success', '/reset-password'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
