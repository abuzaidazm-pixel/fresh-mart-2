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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FreshMart Local | Neighborhood Grocery & Farm Produce',
  description:
    'FreshMart Local delivers fresh organic produce, grass-fed dairy, artisanal baked bread, and household groceries to your doorstep in 30 minutes.',
  keywords: [
    'grocery',
    'fresh produce',
    'organic vegetables',
    'online supermarket',
    'local grocery',
    'same-day grocery delivery',
  ],
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
