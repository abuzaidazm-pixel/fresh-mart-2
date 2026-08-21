import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Content Security Policy.
 *
 * This is the header that turns a stray script injection into a blocked request
 * instead of a stolen session. Each allowance below is deliberate:
 *
 *  - 'unsafe-inline' on script-src is required by Next.js's App Router, which
 *    inlines hydration data and the runtime bootstrap. 'unsafe-eval' is dev-only
 *    (React Refresh needs it); production drops it.
 *  - style-src needs 'unsafe-inline' because Tailwind and React set style
 *    attributes directly.
 *  - img-src lists exactly the hosts the app loads from: Unsplash for product
 *    photography, api.qrserver.com for UPI QR codes, and Supabase storage.
 *  - connect-src is what stops data being posted to an attacker's server: only
 *    Supabase and same-origin are permitted.
 *  - frame-ancestors 'none' blocks clickjacking — nobody can iframe the store
 *    and trick a customer into clicking a hidden checkout button.
 */
const isDev = process.env.NODE_ENV === 'development';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://api.qrserver.com https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Force HTTPS for two years, including subdomains.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Belt-and-braces alongside frame-ancestors, for older browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop the browser guessing a file is JavaScript when it isn't.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak the customer's full URL (which can contain order ids) offsite.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The store needs none of these; denying them shrinks the attack surface.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise the framework version
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
