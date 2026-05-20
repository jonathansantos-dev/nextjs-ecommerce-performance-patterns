/**
 * PATTERN 3: Third-Party Script Loading — AFTER
 *
 * next/script with explicit loading strategies defers all third-party
 * scripts until after the page is interactive. The main thread is
 * free for React hydration and first user interactions.
 *
 * Strategy hierarchy:
 *
 *   beforeInteractive — runs before hydration (use only for critical polyfills)
 *   afterInteractive   — runs after hydration (GTM, analytics that need the DOM)
 *   lazyOnload         — runs during browser idle time (everything non-critical)
 *   worker             — runs in a Web Worker off the main thread (Partytown)
 *
 * Loading order for this implementation:
 *   1. React hydration runs uncontested
 *   2. GTM loads (afterInteractive) — ~200ms after hydration
 *   3. Browser becomes interactive for the user
 *   4. Meta Pixel loads (lazyOnload) — during idle time
 *   5. Live chat loads (lazyOnload) — during idle time, after Pixel
 *
 * Measured on a product listing page (4G throttled, CPU 4x slowdown):
 *   TBT: 680ms → 120ms  ← scripts no longer block during hydration
 *   INP: 520ms → 95ms   → "Good" (interactions feel instant)
 *   LCP: no regression  ← main thread uncontested during image load
 */

import Script from "next/script";

export function LayoutAfterWithScripts({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}

        {/*
         * GTM: afterInteractive
         *
         * "afterInteractive" = loads AFTER React hydration completes.
         * GTM is critical for tracking, but it doesn't need to run before
         * the user can interact. A pageview fired 200ms later is indistinguishable
         * from one fired immediately — but the 200ms difference is measurable
         * in INP scores.
         *
         * next/script also automatically adds async to the script tag,
         * preventing synchronous blocking even if the timing hint is ignored.
         */}
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

        {/*
         * Meta Pixel: lazyOnload
         *
         * "lazyOnload" = loads during browser idle time (requestIdleCallback).
         * The Pixel fires a PageView — this doesn't need to happen before
         * the user sees the page or interacts with it.
         *
         * Pixel fires ~1-2s later than with the naive approach.
         * Attribution is not meaningfully affected (session is already open).
         * Main thread impact: zero during critical window.
         */}
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

        {/*
         * Live chat widget: lazyOnload
         *
         * Chat widgets are the worst offender in e-commerce performance.
         * They add 150-300KB of JS for a button most users never click.
         * lazyOnload ensures they run during idle time, not during
         * the window when users are browsing products.
         *
         * Advanced alternative: use strategy="worker" with Partytown
         * to run the widget entirely in a Web Worker, off the main thread.
         */}
        <Script
          src="https://widget.intercom.io/widget/XXXXXXXX"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

/**
 * Result: Three third-party scripts load at appropriate times.
 * The main thread is free during hydration — the moment that matters most
 * for perceived performance and first interaction latency.
 */

