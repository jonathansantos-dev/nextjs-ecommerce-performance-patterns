/**
 * PATTERN 4: React Rendering Optimization — BEFORE
 *
 * The anti-pattern: a cart where every state update re-renders the entire tree.
 *
 * Hidden costs:
 * 1. Shared cart state at the top level — every quantity change or item removal
 *    triggers a re-render of the entire ProductList, all CartItem components,
 *    and every child component in the tree.
 *
 * 2. Inline callbacks — new function references on every render cause
 *    child components with React.memo to still re-render (memo is bypassed
 *    when props change identity even if value is identical).
 *
 * 3. State at the wrong level — the "show full description" toggle for each
 *    product is stored in a parent Map, causing parent re-renders when
 *    a user expands a description in a cart item.
 *
 * Profiler measurement (React DevTools — Flamegraph):
 *   Components re-rendered on single quantity change: 47
 *   Interaction latency (click → visual update): 380ms
 *   On a device with 100 cart items: completely unusable
 */

import { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// All cart state lives at the top level.
//    Any change to any item triggers a full re-render of this component
//    and propagates down to every CartItemBefore.
export function CartBefore() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Ração Premium 15kg",
      price: 189.9,
      quantity: 1,
      imageUrl: "/img/1.jpg",
    },
    {
      id: "2",
      name: "Petisco Ossinho 500g",
      price: 34.9,
      quantity: 2,
      imageUrl: "/img/2.jpg",
    },
    {
      id: "3",
      name: "Brinquedo Kong M",
      price: 89.9,
      quantity: 1,
      imageUrl: "/img/3.jpg",
    },
  ]);

  // State at wrong level — description expansion doesn't belong in cart root
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});

  // Inline arrow functions — new reference on every render.
  //    If CartItemBefore used React.memo, it would still re-render because
  //    onQuantityChange and onRemove are new objects every time.
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
        <CartItemBefore
          key={item.id}
          item={item}
          isDescriptionExpanded={expandedDescriptions[item.id] ?? false}
          // New function reference on every render — defeats memoization
          onQuantityChange={(newQty) => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, quantity: newQty } : i,
              ),
            );
          }}
          // New function reference on every render
          onRemove={() => {
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          }}
          // New function reference on every render
          onToggleDescription={() => {
            setExpandedDescriptions((prev) => ({
              ...prev,
              [item.id]: !prev[item.id],
            }));
          }}
        />
      ))}

      {/* CartTotal is a child of CartBefore — re-renders on every state change
          even though it only needs to re-render when total changes */}
      <CartTotalBefore total={total} itemCount={items.length} />
    </div>
  );
}

interface CartItemBeforeProps {
  item: CartItem;
  isDescriptionExpanded: boolean;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  onToggleDescription: () => void;
}

// No React.memo — this component re-renders on every parent update,
//    even when this item's data hasn't changed at all.
function CartItemBefore({
  item,
  onQuantityChange,
  onRemove,
}: CartItemBeforeProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-purple-600 font-bold">
          R$ {item.price.toFixed(2).replace(".", ",")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-600 text-sm"
      >
        Remover
      </button>
    </div>
  );
}

// No React.memo — re-renders on every cart state change,
//    even when total hasn't changed (e.g., a description was toggled)
function CartTotalBefore({
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
      <button className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">
        Finalizar Compra
      </button>
    </div>
  );
}

