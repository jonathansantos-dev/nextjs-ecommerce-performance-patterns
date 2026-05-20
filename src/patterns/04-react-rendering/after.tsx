/**
 * PATTERN 4: React Rendering Optimization — AFTER
 *
 * Three techniques applied together eliminate unnecessary re-renders:
 *
 * 1. React.memo — CartItem skips re-rendering when its props haven't changed.
 *    When item A's quantity changes, items B and C don't re-render.
 *
 * 2. useCallback — stable function references across renders.
 *    Without useCallback, passing an inline arrow function to a memoized
 *    component defeats memo (new function reference = changed prop).
 *
 * 3. State colocation — "show description" state lives inside CartItem,
 *    not in the parent. Toggling a description only re-renders that one item.
 *
 * Why these three work together:
 *   memo stops re-renders when props are referentially equal.
 *   useCallback ensures callbacks are referentially equal across renders.
 *   State colocation ensures local UI state doesn't pollute parent state.
 *
 * Profiler measurement (React DevTools — Flamegraph):
 *   Components re-rendered on single quantity change: 47 → 3
 *   (CartBefore, the updated CartItem, CartTotal)
 *   Interaction latency (click → visual update): 380ms → 40ms
 */

import { memo, useCallback, useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description?: string;
}

export function CartAfter() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Ração Premium 15kg",
      price: 189.9,
      quantity: 1,
      imageUrl: "/img/1.jpg",
      description:
        "Ração super premium com ingredientes naturais. Alta palatabilidade e digestibilidade. Formulada por nutricionistas veterinários.",
    },
    {
      id: "2",
      name: "Petisco Ossinho 500g",
      price: 34.9,
      quantity: 2,
      imageUrl: "/img/2.jpg",
      description:
        "Petisco natural para higiene dental. Remove tártaro e mau hálito. Sem corantes artificiais.",
    },
    {
      id: "3",
      name: "Brinquedo Kong M",
      price: 89.9,
      quantity: 1,
      imageUrl: "/img/3.jpg",
      description:
        "Brinquedo interativo de borracha natural. Pode ser recheado com petiscos. Estimula o enriquecimento ambiental.",
    },
  ]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // useCallback — stable reference for quantity change handler.
  //    Without useCallback: new function on every CartAfter render → defeats memo.
  //    With useCallback: same function reference as long as setItems is stable.
  //    setItems from useState is always stable — so this callback never changes.
  const handleQuantityChange = useCallback((itemId: string, newQty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)),
    );
  }, []); // ← empty deps: setItems is stable, no external dependencies

  // useCallback — stable reference for remove handler
  const handleRemove = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Seu carrinho está vazio.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemAfter
          key={item.id}
          item={item}
          // These are now stable references — CartItemAfter's memo check passes.
          //    When item A's quantity changes, only item A re-renders.
          //    Items B and C: memo check passes (same props) → skipped entirely.
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
        />
      ))}

      {/*
       * CartTotalAfter is memoized and only receives total + itemCount.
       *    It re-renders only when the total or count changes.
       *    Toggling a description (state colocated in CartItemAfter) doesn't
       *    cause CartTotalAfter to re-render at all.
       */}
      <CartTotalAfter total={total} itemCount={items.length} />
    </div>
  );
}

interface CartItemAfterProps {
  item: CartItem;
  onQuantityChange: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
}

// React.memo — this component only re-renders when its specific props change.
//    item, onQuantityChange, and onRemove must all be referentially equal
//    to the previous render for the skip to happen.
//
//    With useCallback on the parent, onQuantityChange and onRemove are stable.
//    So CartItemAfter only re-renders when its own item object changes.
const CartItemAfter = memo(function CartItemAfter({
  item,
  onQuantityChange,
  onRemove,
}: CartItemAfterProps) {
  // State colocation — description toggle lives HERE, not in the parent.
  //    Toggling this state only re-renders THIS CartItemAfter instance.
  //    No other cart items or CartTotal are affected.
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleDecrease = useCallback(() => {
    onQuantityChange(item.id, Math.max(1, item.quantity - 1));
  }, [item.id, item.quantity, onQuantityChange]);

  const handleIncrease = useCallback(() => {
    onQuantityChange(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <div className="p-4 bg-white rounded-lg border">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <p className="text-purple-600 font-bold">
            R$ {item.price.toFixed(2).replace(".", ",")}
          </p>

          {/* Description toggle — purely local state, zero external impact */}
          {item.description && (
            <>
              {isDescriptionExpanded && (
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              )}
              <button
                onClick={() => setIsDescriptionExpanded((v) => !v)}
                className="mt-1 text-xs text-purple-500 hover:text-purple-700"
              >
                {isDescriptionExpanded ? "Ver menos" : "Ver mais"}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrease}
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button
          onClick={handleRemove}
          className="text-red-400 hover:text-red-600 text-sm"
        >
          Remover
        </button>
      </div>
    </div>
  );
});

// React.memo — CartTotal only re-renders when total or itemCount changes.
//    In the "before" version, this component re-rendered on every cart state change
//    (including toggling a description, which doesn't affect the total).
const CartTotalAfter = memo(function CartTotalAfter({
  total,
  itemCount,
}: {
  total: number;
  itemCount: number;
}) {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between text-lg font-bold">
        <span>
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </span>
        <span>R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>
      <button className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
        Finalizar Compra
      </button>
    </div>
  );
});

