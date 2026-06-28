"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/store/cart";

interface Props {
  product: Omit<CartItem, "quantity">;
  inStock: boolean;
}

export function AddToCartButton({ product, inStock }: Props) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={!inStock}
      className="w-full h-12 bg-neutral-900 text-white text-sm font-medium tracking-wider uppercase hover:bg-neutral-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
    >
      {!inStock ? "Indisponible" : added ? "✓ Ajouté au panier" : "Ajouter au panier"}
    </button>
  );
}
