import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { DemoBar } from '@/components/ui/DemoBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL resolve to the live site.
  // Set NEXT_PUBLIC_SITE_URL in Vercel to your real domain once you have one.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fresh-mart-2.vercel.app'),
  title: {
    default: 'FreshMart Local | Neighborhood Grocery & Farm Produce',
    // Child pages set only their own name; this appends the brand.
    template: '%s | FreshMart Local',
  },
  description:
    'Fresh organic produce, dairy, bakery and household essentials delivered to your door in 30 minutes. Order online or collect in store.',
  applicationName: 'FreshMart Local',
  keywords: [
    'grocery delivery',
    'fresh produce',
    'organic vegetables',
    'online supermarket',
    'local grocery store',
    'same-day grocery delivery',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'FreshMart Local',
    title: 'FreshMart Local | Groceries delivered in 30 minutes',
    description:
      'Fresh organic produce, dairy, bakery and household essentials delivered to your door in 30 minutes.',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreshMart Local',
    description: 'Groceries delivered to your door in 30 minutes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: true, address: false, email: false },
};

export const viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <ToastProvider>
                {/* Demo Bar at top for seamless testing */}
                <DemoBar />

                {/* Main Customer Header */}
                <Header />

                {/* Main Content Area */}
                <main className="flex-1">{children}</main>

                {/* Cart Slide-Over Drawer */}
                <CartDrawer />

                {/* Storefront Footer */}
                <Footer />
              </ToastProvider>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
