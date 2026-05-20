/**
 * Product Detail Page
 *
 * Applies Pattern 1 (next/image) for the hero product image.
 * The product image is the LCP element on this page — optimizing it
 * directly improves the most important Core Web Vital for conversion.
 */

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById, products } from '@/data/products';

interface Props {
  params: Promise<{ id: string }>;
}

// Pre-generate the 20 most popular product pages at build time.
// The rest are generated on-demand (ISR behavior).
export async function generateStaticParams() {
  return products.slice(0, 20).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/*
         * PATTERN 1 APPLIED: next/image as the LCP element.
         *
         * - priority: preloads the image — critical for LCP
         * - sizes: correct srcset for responsive viewports
         * - AVIF/WebP negotiated automatically by next/image
         *
         * Without this: a raw <img> loading a 2MB JPEG.
         * With this: ~80KB AVIF, preloaded, no layout shift.
         */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount} avaliações)</span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <button
              className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors ${
                product.inStock
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
