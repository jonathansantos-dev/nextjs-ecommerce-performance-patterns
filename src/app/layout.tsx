/**
 * Root Layout — Pattern 3: Third-Party Script Loading
 *
 * This is where script loading strategy matters most.
 * The layout runs for every page, making it the highest-leverage
 * location for controlling when third-party scripts load.
 *
 * Strategy used here:
 * - GTM: afterInteractive — loads after hydration, doesn't block LCP
 * - Meta Pixel: lazyOnload — loads during idle time
 * - Live chat: lazyOnload — lowest priority, non-critical
 *
 * See src/patterns/03-third-party-scripts/ for the full before/after comparison.
 */

import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | PetShop',
    default: 'PetShop — Tudo para o seu pet',
  },
  description:
    'O maior petshop online do Brasil. Ração, petiscos, acessórios e muito mais com entrega rápida.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">
        {/* ─── Navigation ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="text-xl font-bold text-purple-600">
                🐾 PetShop
              </a>
              <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <a href="/" className="hover:text-purple-600 transition-colors">
                  Produtos
                </a>
                <a href="/cart" className="hover:text-purple-600 transition-colors">
                  Carrinho
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* ─── Main content ───────────────────────────────────────── */}
        <main>{children}</main>

        {/* ─── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-16 bg-gray-800 text-gray-400 text-sm py-8 text-center">
          <p>© 2024 PetShop. Todos os direitos reservados.</p>
        </footer>

        {/*
         * ─── Third-party scripts ──────────────────────────────────
         *
         * PATTERN 3 APPLIED: strategy="afterInteractive" ensures GTM loads
         * AFTER the page is interactive — not during the critical rendering path.
         *
         * Compare with src/patterns/03-third-party-scripts/before.tsx where
         * a raw <script> tag in _document blocks the main thread from the start.
         */}

        {/* Google Tag Manager — afterInteractive: loads post-hydration */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXXX');
            `,
          }}
        />

        {/* Meta Pixel — lazyOnload: fires during browser idle time */}
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'XXXXXXXXXXXXXXX');
              fbq('track', 'PageView');
            `,
          }}
        />
      </body>
    </html>
  );
}
