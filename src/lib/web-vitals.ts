/**
 * Core Web Vitals reporting utility.
 *
 * Reports LCP, CLS, INP, FCP, and TTFB to the console in development
 * and to an analytics endpoint in production.
 *
 * Used in src/app/layout.tsx to instrument the entire application.
 */

export type MetricName = 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';

export interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds from https://web.dev/vitals/
const thresholds: Record<MetricName, [number, number]> = {
  LCP: [2500, 4000],   // ms
  CLS: [0.1, 0.25],    // unitless
  INP: [200, 500],     // ms
  FCP: [1800, 3000],   // ms
  TTFB: [800, 1800],   // ms
};

function getRating(name: MetricName, value: number): WebVitalMetric['rating'] {
  const [good, poor] = thresholds[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function formatValue(name: MetricName, value: number): string {
  if (name === 'CLS') return value.toFixed(4);
  return `${Math.round(value)}ms`;
}

function logToConsole(metric: WebVitalMetric): void {
  const styles: Record<WebVitalMetric['rating'], string> = {
    good: 'color: #22c55e; font-weight: bold',
    'needs-improvement': 'color: #f59e0b; font-weight: bold',
    poor: 'color: #ef4444; font-weight: bold',
  };

  console.log(
    `%c[Web Vitals] ${metric.name}: ${formatValue(metric.name, metric.value)} (${metric.rating})`,
    styles[metric.rating]
  );
}

function sendToAnalytics(metric: WebVitalMetric): void {
  // Replace with your analytics endpoint in production
  // Example: Google Analytics 4, Vercel Analytics, custom endpoint
  if (process.env.NODE_ENV === 'development') {
    logToConsole(metric);
    return;
  }

  // Production: send to analytics
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    url: window.location.href,
    timestamp: Date.now(),
  });

  // Use navigator.sendBeacon when available — non-blocking, survives page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export function reportWebVitals(metric: WebVitalMetric): void {
  const enrichedMetric: WebVitalMetric = {
    ...metric,
    rating: getRating(metric.name, metric.value),
  };
  sendToAnalytics(enrichedMetric);
}

/**
 * Initialize Web Vitals reporting.
 * Call this once in your root layout or _app.tsx.
 *
 * @example
 * // app/layout.tsx
 * 'use client';
 * import { initWebVitals } from '@/lib/web-vitals';
 * useEffect(() => { initWebVitals(); }, []);
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { onLCP, onCLS, onINP, onFCP, onTTFB } = await import('web-vitals');

    onLCP((m) => reportWebVitals({ ...m, name: 'LCP', rating: getRating('LCP', m.value) }));
    onCLS((m) => reportWebVitals({ ...m, name: 'CLS', rating: getRating('CLS', m.value) }));
    onINP((m) => reportWebVitals({ ...m, name: 'INP', rating: getRating('INP', m.value) }));
    onFCP((m) => reportWebVitals({ ...m, name: 'FCP', rating: getRating('FCP', m.value) }));
    onTTFB((m) => reportWebVitals({ ...m, name: 'TTFB', rating: getRating('TTFB', m.value) }));
  } catch {
    // web-vitals not available — graceful degradation
  }
}
