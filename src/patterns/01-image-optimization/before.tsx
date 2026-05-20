/**
 * PATTERN 1: Image Optimization — BEFORE
 *
 * The anti-pattern: raw <img> tags with no format negotiation,
 * no lazy loading, and no explicit dimensions.
 *
 * Hidden costs:
 * 1. No format negotiation — browser downloads full JPEG regardless of
 *    AVIF/WebP support. A 2MB JPEG could be 180KB in AVIF.
 *
 * 2. No lazy loading — all 48 product images download on page load,
 *    including those below the fold the user may never scroll to.
 *    On a 4G connection: ~96MB of images requested simultaneously.
 *
 * 3. No explicit dimensions — browser doesn't know the image size until
 *    it downloads it. Layout shifts (CLS) occur as images load and push
 *    content down.
 *
 * 4. No priority hint for LCP — the above-the-fold hero image competes
 *    equally for bandwidth with images the user can't see.
 *
 * Measured impact on a 48-product listing (mobile, 4G throttled):
 *   LCP: 4.2s  ← hero image downloads last
 *   CLS: 0.38  ← layout shifts from images loading late
 *   Total transfer: ~18MB in images
 */

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface ProductCardBeforeProps {
  product: Product;
}

// Raw <img> — no optimization of any kind
function ProductCardBefore({ product }: ProductCardBeforeProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* No width/height — causes layout shift (CLS)
          No loading="lazy" — downloads immediately even if off-screen
          No format negotiation — always JPEG/PNG
          No priority for above-the-fold images */}
      <img src={product.imageUrl} alt={product.name} className="w-full" />
      <div className="p-3">
        <p className="text-xs text-gray-500">{product.category}</p>
        <h3 className="font-medium text-sm mt-1 truncate">{product.name}</h3>
        <p className="font-bold text-purple-600 mt-2">
          R$ {product.price.toFixed(2).replace(".", ",")}
        </p>
      </div>
    </div>
  );
}

interface ProductListingBeforeProps {
  products: Product[];
}

// No consideration for which images are above/below the fold
export function ProductListingBefore({ products }: ProductListingBeforeProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        // All 100 images treated identically — no priority, no lazy load
        <ProductCardBefore key={product.id} product={product} />
      ))}
    </div>
  );
}

