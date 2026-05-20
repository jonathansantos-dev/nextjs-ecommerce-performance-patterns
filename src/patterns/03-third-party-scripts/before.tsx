/**
 * PATTERN 3: Third-Party Script Loading — BEFORE
 *
 * The anti-pattern: raw <script> tags loaded synchronously,
 * or placed in _document.tsx without strategy consideration.
 *
 * Hidden costs:
 * 1. Render-blocking: <script> tags without async/defer block HTML parsing.
 *    The browser stops building the DOM until each script downloads and executes.
 *    GTM alone adds ~180ms to TBT on a typical connection.
 *
 * 2. Main thread competition: GTM, Meta Pixel, and live chat all run JavaScript
 *    during the critical window when React is hydrating. They compete for the
 *    main thread — the resource users need to interact with the page.
 *
 * 3. Cascading third-party loads: GTM loads other tags (GA4, Hotjar, etc.).
 *    One tag becomes five tags, each with their own network requests.
 *
 * 4. No loading prioritization: all scripts are treated equally.
 *    Analytics is not more important than rendering. Live chat is not more
 *    important than product images. But the browser doesn't know this.
 *
 * Measured on a product listing page (4G throttled, CPU 4x slowdown):
 *   TBT: 680ms  ← main thread blocked by third-party scripts during hydration
 *   INP: 520ms  → "Needs Improvement" (users notice delayed interactions)
 *   LCP: +400ms delay from main thread competition
 */

// This is the _document.tsx pattern — raw script tags with no strategy.
// In Next.js Pages Router, developers commonly add scripts here.
// App Router equivalent: raw <script> in layout.tsx without next/script.

export function DocumentBefore() {
  return (
    <html lang="pt-BR">
      <head>
        {/*
         * Synchronous script — blocks HTML parsing entirely.
         *    Every millisecond this takes to download = 1ms delayed LCP.
         */}
        <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX" />

        {/*
         * Meta Pixel loaded in <head> — runs before the page renders.
         *    Pixel initialization: ~30ms main thread.
         *    Pixel network request: ~150ms (blocks nothing, but competes for bandwidth).
         *    Total cost: fires before any product image starts loading.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              fbq('init', 'XXXXXXXXXXXXXXX');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/*
         * Live chat widget loaded in <head>.
         *    Intercom/Zendesk/etc. load their entire widget bundle (100-200KB)
         *    during page initialization. The user can't see the chat widget
         *    (it's in the corner) but their browser is busy downloading it.
         */}
        <script src="https://widget.intercom.io/widget/XXXXXXXX" />
      </head>
      <body>{/* page content */}</body>
    </html>
  );
}

/**
 * Result: Three third-party scripts competing for the main thread
 * during the most critical window — when React is hydrating and
 * users are trying to interact with the page for the first time.
 */

