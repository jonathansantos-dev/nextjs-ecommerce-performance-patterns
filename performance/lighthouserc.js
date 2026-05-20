/**
 * Lighthouse CI Configuration
 *
 * Run with: npm run lighthouse
 * (requires: npm install && npm run build && npm start)
 *
 * Reproduces the conditions used to measure the performance numbers
 * documented in the README:
 *   - Chrome DevTools
 *   - CPU: 4x slowdown (simulates mid-range Android device)
 *   - Network: Fast 3G throttling
 *   - Private browsing (no extensions, no cache)
 *
 * Results are saved to performance/reports/ as HTML and JSON.
 * The JSON can be compared across commits to detect regressions.
 */

module.exports = {
  ci: {
    collect: {
      // Start the Next.js production server before collecting.
      // Requires a prior `npm run build`.
      startServerCommand: 'npm start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 30000,

      url: [
        'http://localhost:3000',                      // Product listing (patterns 1, 2, 5)
        'http://localhost:3000/cart',                 // Cart page (pattern 4)
        'http://localhost:3000/products/product-001', // Product detail (pattern 1)
      ],

      // Number of Lighthouse runs per URL.
      // Lighthouse results have variance; 3 runs gives a representative median.
      numberOfRuns: 3,

      settings: {
        // Chrome flags to control the test environment
        chromeFlags: '--no-sandbox --headless',

        // CPU throttling: 4x slowdown
        // Simulates a Moto G4 / mid-range Android — the P75 device for most
        // Brazilian e-commerce traffic (mobile-first market)
        throttlingMethod: 'simulate',
        throttling: {
          cpuSlowdownMultiplier: 4,
          // Fast 3G: matches Chrome DevTools "Fast 3G" preset
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474,
          uploadThroughputKbps: 675,
        },

        // Only collect performance audits — skip accessibility, SEO, PWA
        // for faster CI runs. Add them back for production gates.
        onlyCategories: ['performance'],

        // Preset: desktop removes mobile emulation; we want mobile
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false,
        },
      },
    },

    assert: {
      // Fail CI if performance scores drop below these thresholds.
      // These are the post-optimization baselines from the README.
      // Tighten them over time as the application improves.
      assertions: {
        // Category-level score gates
        'categories:performance': ['error', { minScore: 0.85 }],

        // Core Web Vitals — individual metric gates
        // LCP: pattern 1 improvement (next/image + priority)
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],

        // TBT: pattern 3 improvement (script loading strategy)
        'total-blocking-time': ['error', { maxNumericValue: 200 }],

        // CLS: pattern 1 improvement (explicit image dimensions)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Speed Index: general rendering speed
        'speed-index': ['warn', { maxNumericValue: 3500 }],

        // TTI: pattern 2 improvement (code splitting)
        'interactive': ['warn', { maxNumericValue: 4000 }],
      },
    },

    upload: {
      // Store reports locally. Change to 'lhci' for a remote LHCI server.
      target: 'filesystem',
      outputDir: './performance/reports',
    },
  },
};
