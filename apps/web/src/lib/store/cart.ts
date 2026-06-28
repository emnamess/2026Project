"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slugFr: string;
  nameFr: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add(item) {
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: 1 }] };
        });
      },

      remove(id) {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },

      setQty(id, qty) {
        if (qty <= 0) {
          get().remove(id);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        }));
      },

      clear() {
        set({ items: [] });
      },

      total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: "artisan-cart" }
  )
);
