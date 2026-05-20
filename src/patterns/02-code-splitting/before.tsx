/**
 * PATTERN 2: Code Splitting & Dynamic Imports — BEFORE
 *
 * The anti-pattern: static imports for all checkout-related code.
 * Every visitor to the product listing page downloads the entire
 * checkout bundle — payment forms, address validators, coupon logic —
 * even if they never open their cart.
 *
 * Hidden costs:
 * 1. Every product page visitor downloads ~286KB of checkout JS they may never use.
 *    On 3G: that's ~1.2s of parsing + execution time before page is interactive.
 *
 * 2. JS execution is single-threaded. Parsing 286KB of checkout code blocks
 *    the main thread, increasing TBT (Total Blocking Time) and INP.
 *
 * 3. The checkout UI itself (AddressForm, PaymentForm, CouponInput) is a
 *    complex subtree that React needs to reconcile even when the cart is closed.
 *
 * Bundle analysis (ANALYZE=true npm run build):
 *   Initial JS payload: 487KB (includes checkout, payment, address validator)
 *   TTI on 3G: ~3.8s
 */

// Static imports — all of this is bundled into the initial JS payload
import { useState } from "react";

// These components are imported statically:
//    - They add to the initial bundle even when cart is closed
//    - Webpack cannot tree-shake them because they're imported at the top level
import { AddressForm } from "./address-form";
import { CheckoutDrawer } from "./checkout-drawer";
import { CouponInput } from "./coupon-input";
import { OrderSummary } from "./order-summary";
import { PaymentForm } from "./payment-form";

interface ProductPageBeforeProps {
  productName: string;
}

export function ProductPageBefore({ productName }: ProductPageBeforeProps) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold">{productName}</h1>

      <button
        onClick={() => setCartOpen(true)}
        className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
      >
        Abrir Carrinho
      </button>

      {/*
       * ❌ CheckoutDrawer is always mounted in the component tree.
       *    Even when closed (cartOpen = false), React still reconciles
       *    the full checkout subtree on every render — TBT goes up.
       *
       *    Components imported: CheckoutDrawer, AddressForm, PaymentForm,
       *    CouponInput, OrderSummary — all included in the initial bundle.
       *
       *    Compare with after.tsx: {cartOpen && <DynamicCheckoutDrawer />}
       *    mounts nothing until the user actually opens the cart.
       */}
      <CheckoutDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        addressForm={<AddressForm />}
        paymentForm={<PaymentForm />}
        couponInput={<CouponInput />}
        orderSummary={<OrderSummary />}
      />
    </div>
  );
}

