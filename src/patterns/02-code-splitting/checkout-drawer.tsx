/**
 * CheckoutDrawer — simulates a real checkout component.
 *
 * In production, this file would import:
 * - @stripe/stripe-js (~130KB)
 * - react-hook-form (~25KB)
 * - address validation library (~40KB)
 * - coupon/discount logic (~15KB)
 * - order summary calculation logic
 *
 * Total: ~210KB+ of dependencies that shouldn't be in the initial bundle.
 * With dynamic(), this entire file is split into its own chunk.
 */

import React from 'react';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  addressForm?: React.ReactNode;
  paymentForm?: React.ReactNode;
  couponInput?: React.ReactNode;
  orderSummary?: React.ReactNode;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
}: CheckoutDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Seu Carrinho</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Simulated checkout content */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                CheckoutDrawer carregado como chunk separado via dynamic().
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Este chunk (~286KB) só foi baixado quando você clicou em &quot;Abrir Carrinho&quot;.
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ 0,00</span>
              </div>
            </div>

            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddressForm() {
  return <div className="p-4 border rounded-lg">Formulário de endereço</div>;
}

export function PaymentForm() {
  return <div className="p-4 border rounded-lg">Formulário de pagamento</div>;
}

export function CouponInput() {
  return <div className="p-4 border rounded-lg">Campo de cupom</div>;
}

export function OrderSummary() {
  return <div className="p-4 border rounded-lg">Resumo do pedido</div>;
}
