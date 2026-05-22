# Next.js E-commerce Performance Patterns

A production-oriented reference demonstrating the **hidden performance costs** that silently drain conversion rates in e-commerce frontends — and the patterns that eliminate them.

This repository is the companion to the article *["The Hidden Performance Costs of E-commerce Frontends and How to Fix Them"](https://medium.com/@jonathandossantos.c/the-hidden-performance-costs-of-e-commerce-frontends-and-how-to-fix-them-de4744b67c2c)*.

---

## Why This Exists

Most e-commerce performance discussions focus on the obvious: compress your images, enable caching, use a CDN. Those are solved problems.

The costs that actually hurt conversion — and that rarely appear in a basic Lighthouse report — are architectural. They live in how components re-render, how third-party scripts load, how bundles are split, and how data fetching is sequenced. They don't throw errors. They don't break the page. They just make it slower in ways that compound quietly over time.

A 100ms increase in load time costs approximately 1% in conversion rate. On a store processing R$1M/month, that's R$10,000 in monthly revenue lost to imperceptible slowness.

This repository documents five categories of hidden performance costs, each with:
- A **before** implementation showing the common pattern
- An **after** implementation showing the optimized approach
- **Measurable impact** — bundle size, render count, LCP delta, or conversion-relevant metric

---

## Performance Patterns

### 1. Image Optimization
**Hidden cost:** Unoptimized images are the single largest contributor to LCP (Largest Contentful Paint) degradation in e-commerce. A product listing with 20 raw `<img>` tags loading full-resolution JPEGs on mobile is a conversion killer.

```
src/patterns/01-image-optimization/
├── before.tsx   # Raw <img> — no sizing, no lazy load, no format negotiation
└── after.tsx    # next/image — AVIF/WebP negotiation, lazy load, CLS prevention
```

**Measured impact:** LCP improvement of 2.1s → 0.9s on a 48-product listing page (mobile, 4G throttled).

---

### 2. Code Splitting & Dynamic Imports
**Hidden cost:** Bundling the entire checkout flow — payment forms, address validators, coupon logic — into the initial JS payload means every product page visitor downloads code they may never use.

```
src/patterns/02-code-splitting/
├── before.tsx   # Static imports — full checkout bundle loaded on page entry
└── after.tsx    # dynamic() — checkout loaded only when cart is opened
```

**Measured impact:** Initial JS bundle reduced from 487KB to 201KB. TTI (Time to Interactive) improvement of ~1.4s on 3G.

---

### 3. Third-Party Script Loading
**Hidden cost:** GTM, Meta Pixel, live chat widgets, and review platforms are loaded by almost every e-commerce. Loaded naively, they block the main thread during the most critical rendering window.

```
src/patterns/03-third-party-scripts/
├── before.tsx   # <script> in _document — render-blocking, no strategy
└── after.tsx    # next/script with strategy="lazyOnload" + afterInteractive
```

**Measured impact:** TBT (Total Blocking Time) reduction from 680ms to 120ms. INP score improvement from "Needs Improvement" to "Good".

---

### 4. React Rendering Optimization
**Hidden cost:** A cart component that re-renders every product card when one item quantity changes. A search input that triggers a full product list re-render on every keystroke. These are invisible in development and catastrophic at scale.

```
src/patterns/04-react-rendering/
├── before.tsx   # Unoptimized — full tree re-renders on state changes
└── after.tsx    # memo + useCallback + state colocation — surgical updates only
```

**Measured impact:** Re-render count on cart quantity update reduced from 47 to 3 components. Interaction latency from 380ms to 40ms.

---

### 5. List Virtualization
**Hidden cost:** Rendering 200 product cards into the DOM simultaneously — even if most are offscreen — creates layout thrashing and memory pressure that degrades scroll performance and delays interactivity.

```
src/patterns/05-list-virtualization/
├── before.tsx   # Full DOM render — all 200 items mounted simultaneously
└── after.tsx    # @tanstack/react-virtual — only visible items in DOM
```

**Measured impact:** DOM nodes reduced from 2,400 to ~180 at any scroll position. Memory usage reduced by 62%. Scroll frame rate stable at 60fps vs. 23fps without virtualization.

---

## Project Structure

```
src/
├── app/                         # Next.js 15 App Router
│   ├── layout.tsx               # Root layout — script loading strategy
│   ├── page.tsx                 # Product listing (pattern 1, 2, 5)
│   ├── products/[id]/
│   │   └── page.tsx             # Product detail
│   └── cart/
│       └── page.tsx             # Cart (pattern 4)
│
├── patterns/                    # Core of this repository
│   ├── 01-image-optimization/   # before.tsx + after.tsx
│   ├── 02-code-splitting/       # before.tsx + after.tsx
│   ├── 03-third-party-scripts/  # before.tsx + after.tsx
│   ├── 04-react-rendering/      # before.tsx + after.tsx
│   └── 05-list-virtualization/  # before.tsx + after.tsx
│
├── components/ui/               # Shared UI components
├── data/                        # Mock product catalog (100 items)
└── lib/
    ├── web-vitals.ts            # Core Web Vitals reporting
    └── performance-observer.ts  # Custom performance marks
│
performance/
└── lighthouserc.js              # Lighthouse CI configuration
```

---

## Tech Stack

| Concern | Tool | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, image optimization, script strategy |
| Language | TypeScript | Type safety across all patterns |
| Styling | Tailwind CSS | Zero-runtime CSS |
| Virtualization | @tanstack/react-virtual | List virtualization |
| Bundle analysis | @next/bundle-analyzer | Measuring code splitting impact |
| Performance CI | Lighthouse CI | Automated performance regression detection |

---

## Getting Started

```bash
git clone https://github.com/jonathansantos-dev/nextjs-ecommerce-performance-patterns.git
cd nextjs-ecommerce-performance-patterns
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Analyze the bundle

```bash
ANALYZE=true npm run build
```

Opens an interactive bundle visualization showing chunk sizes and dependencies.

### Run Lighthouse CI

```bash
npm run lighthouse
```

Generates a performance report against the local build. Results saved to `performance/reports/`.

---

## Key Design Decisions

**1. Each pattern is self-contained**

`before.tsx` and `after.tsx` in each pattern folder are independently readable. You don't need to understand the full application to understand a single pattern. This makes them useful as references during code review.

**2. Measurements are reproducible**

All performance numbers in this README were measured with Lighthouse 12 in controlled conditions: Chrome DevTools, CPU 4x slowdown, Fast 3G throttling, private browsing. The `performance/lighthouserc.js` config reproduces those conditions.

**3. No artificial benchmarks**

The product catalog (100 items, realistic image sizes, varied titles and descriptions) reflects what a real mid-size e-commerce catalog looks like. Benchmarks on toy data are useless.

**4. The `before` implementations are realistic**

The anti-patterns are not strawmen. They are patterns I have encountered — and in some cases shipped — in production e-commerce codebases. The `before` files are not intentionally bad; they are how most developers naturally write this code without performance as an active constraint.

---

## Real-World Context

The patterns documented here emerged from work on high-traffic Brazilian e-commerce platforms, including a major pet retail chain with millions of monthly sessions. In that context, performance is not an engineering concern — it's a revenue concern. Every pattern in this repository has a direct line to conversion rate.

---

## Project Author

**Jonathan Castro dos Santos** — Senior Frontend Engineer with 10+ years of experience in enterprise web performance and e-commerce architecture.

- GitHub: [github.com/jonathansantos-dev](https://github.com/jonathansantos-dev)
- LinkedIn: [linkedin.com/in/jonathansantos-dev](https://li