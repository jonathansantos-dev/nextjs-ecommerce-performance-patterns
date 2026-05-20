/**
 * Custom Performance Marks & Measures.
 *
 * Wraps the Performance API to create named timing markers for
 * business-critical user interactions. Measures appear in:
 * - Chrome DevTools → Performance tab → Timings track
 * - window.performance.getEntriesByType('measure')
 *
 * Usage in components:
 *   mark('cart:open')
 *   // ... render cart
 *   measure('cart:open', 'cart:ready')
 */

type MarkName =
  | 'cart:open'
  | 'cart:ready'
  | 'search:start'
  | 'search:results'
  | 'checkout:start'
  | 'checkout:ready'
  | 'product:hover'
  | 'product:loaded'
  | 'list:scroll-start'
  | 'list:scroll-end';

/**
 * Place a named mark at the current point in time.
 */
export function mark(name: MarkName): void {
  if (typeof performance === 'undefined') return;

  try {
    performance.mark(name);
  } catch {
    // Some environments don't support the Performance API
  }
}

/**
 * Measure the duration between two marks.
 * The measure appears in DevTools as a named duration.
 */
export function measure(startMark: MarkName, endMark: MarkName): number | null {
  if (typeof performance === 'undefined') return null;

  const measureName = `${startMark} → ${endMark}`;

  try {
    performance.measure(measureName, startMark, endMark);
    const entries = performance.getEntriesByName(measureName, 'measure');
    const last = entries[entries.length - 1];
    return last ? last.duration : null;
  } catch {
    return null;
  }
}

/**
 * Observe Long Tasks (> 50ms on the main thread).
 * Long tasks block user interaction and increase INP.
 *
 * @param onLongTask Callback invoked with the task duration in ms
 */
export function observeLongTasks(onLongTask: (duration: number) => void): () => void {
  if (typeof PerformanceObserver === 'undefined') return () => {};

  let observer: PerformanceObserver;

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        onLongTask(entry.duration);

        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[Long Task] ${Math.round(entry.duration)}ms — blocks main thread`,
            entry
          );
        }
      }
    });

    observer.observe({ type: 'longtask', buffered: true });
  } catch {
    return () => {};
  }

  return () => observer.disconnect();
}

/**
 * Observe Layout Shifts (CLS contributors).
 * Each entry shows which elements shifted and by how much.
 */
export function observeLayoutShifts(
  onShift: (value: number, sources: string[]) => void
): () => void {
  if (typeof PerformanceObserver === 'undefined') return () => {};

  let observer: PerformanceObserver;

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
          sources?: Array<{ node?: Element }>;
        };

        // Ignore shifts triggered by user input (not counted in CLS)
        if (shift.hadRecentInput) continue;

        const sources = (shift.sources ?? [])
          .map((s) => s.node?.nodeName ?? 'unknown')
          .filter(Boolean);

        onShift(shift.value, sources);
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    return () => {};
  }

  return () => observer.disconnect();
}

/**
 * Convenience: clear all marks and measures.
 * Useful between route navigations in SPAs.
 */
export function clearMarks(): void {
  if (typeof performance === 'undefined') return;
  performance.clearMarks();
  performance.clearMeasures();
}
