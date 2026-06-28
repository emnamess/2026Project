"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";

export function CartView() {
  const { items, remove, setQty, total, count } = useCart();
  const itemCount = count();

  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="text-neutral-300 mb-6">
          <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h1 className="text-xl font-medium text-neutral-900 mb-2">Votre panier est vide</h1>
        <p className="text-sm text-neutral-500 mb-8">Découvrez nos créations artisanales tunisiennes.</p>
        <Link
          href="/produits"
          className="inline-flex h-11 px-8 items-center justify-center bg-neutral-900 text-white text-sm hover:bg-neutral-700 transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-8">
        Panier <span className="text-neutral-400 font-normal text-lg">({itemCount})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Items */}
        <div className="flex-1 divide-y divide-neutral-100">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-5">
              {/* Image */}
              <Link href={`/produits/${item.slugFr}`} className="shrink-0">
                <div className="w-20 h-20 bg-neutral-100 rounded overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.nameFr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link href={`/produits/${item.slugFr}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-600 line-clamp-2">
                  {item.nameFr}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">{item.price.toFixed(2)} TND</p>

                <div className="mt-3 flex items-center gap-4">
                  {/* Qty stepper */}
                  <div className="flex items-center border border-neutral-200 rounded">
                    <button
                      onClick={() => setQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => remove(item.id)}
                    className="text-xs text-neutral-400 hover:text-red-500 transition-colors underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Line total */}
              <p className="shrink-0 text-sm font-medium text-neutral-900">
                {(item.price * item.quantity).toFixed(2)} TND
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-neutral-50 border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700">Récapitulatif</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total</span>
                <span>{total().toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Livraison</span>
                <span className="text-neutral-400">Calculée à l&apos;étape suivante</span>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 flex justify-between font-medium text-neutral-900">
              <span>Total</span>
              <span>{total().toFixed(2)} TND</span>
            </div>

            <Link
              href="/commande"
              className="block w-full h-11 bg-neutral-900 text-white text-sm text-center leading-[44px] hover:bg-neutral-700 transition-colors"
            >
              Passer la commande
            </Link>

            <Link
              href="/produits"
              className="block text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              ← Continuer vos achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
