/**
 * Product Listing Page
 *
 * Combines three performance patterns:
 *   - Pattern 1: next/image for LCP optimization
 *   - Pattern 2: dynamic() for lazy-loading the checkout drawer
 *   - Pattern 5: @tanstack/react-virtual for list virtualization
 *
 * This page demonstrates the "after" state.
 * See src/patterns/ for explicit before/after comparisons.
 */

import { Suspense } from 'react';
import { products } from '@/data/products';
import { ProductListingAfter } from '@/patterns/05-list-virtualization/after';

export const metadata = {
  title: 'Produtos',
  description: 'Encontre tudo para o seu pet com os melhores preços.',
};

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <p className="mt-1 text-sm text-gray-500">
          {products.length} produtos encontrados
        </p>
      </div>

      {/*
       * PATTERN 5 APPLIED: VirtualizedProductList renders only visible items.
       *
       * All 100 products are passed as data, but only ~10-15 are in the DOM
       * at any scroll position. DOM node count stays around 180 regardless
       * of catalog size.
       *
       * Without virtualization: 100 products × ~24 DOM nodes each = 2,400 nodes.
       * With virtualization: ~15 visible × ~12 nodes = ~180 nodes.
       */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg animate-pulse h-72"
              />
            ))}
          </div>
        }
      >
        <ProductListingAfter products={products} />
      </Suspense>
    </div>
  );
}
