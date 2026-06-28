"use client";

import { useCart } from "@/lib/store/cart";
import { createOrder } from "@/lib/actions/order";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine",
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
];

export function CheckoutForm() {
  const { items, total, count, clear } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "card">("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const itemCount = count();
  const subtotal = total();
  const shipping = subtotal >= 200 ? 0 : 8;
  const grandTotal = subtotal + shipping;

  if (!mounted) return null;

  if (itemCount === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500 mb-4">Votre panier est vide.</p>
        <Link href="/produits" className="underline text-sm text-neutral-700">Voir les produits</Link>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.set("cartItems", JSON.stringify(items));
    formData.set("paymentMethod", paymentMethod);
    try {
      await createOrder(formData);
      clear();
    } catch (e) {
      // redirect() throws internally — this catches real errors only
      if ((e as Error).message !== "NEXT_REDIRECT") {
        alert((e as Error).message);
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Form */}
      <form action={handleSubmit} className="flex-1 space-y-8">
        {/* Contact */}
        <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700">Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Prénom *" name="firstName" required autoComplete="given-name" />
            <Field label="Nom *" name="lastName" required autoComplete="family-name" />
            <Field label="Email *" name="email" type="email" required autoComplete="email" />
            <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" />
          </div>
        </section>

        {/* Shipping */}
        <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700">Adresse de livraison</h2>
          <Field label="Adresse *" name="street" required autoComplete="street-address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ville *" name="city" required autoComplete="address-level2" />
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Gouvernorat *</label>
              <select
                name="governorate"
                required
                className="w-full h-9 rounded border border-neutral-200 text-sm px-3 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
              >
                <option value="">— Choisir —</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <Field label="Code postal" name="postalCode" autoComplete="postal-code" />
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700">Mode de paiement</h2>
          <div className="space-y-2">
            {[
              { value: "cash_on_delivery", label: "Paiement à la livraison", desc: "Payez en espèces à la réception de votre colis." },
              { value: "card", label: "Carte bancaire", desc: "Paiement sécurisé en ligne (bientôt disponible).", disabled: true },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  paymentMethod === opt.value
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-300"
                } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  disabled={opt.disabled}
                  onChange={() => !opt.disabled && setPaymentMethod(opt.value as typeof paymentMethod)}
                  className="mt-0.5 accent-neutral-900"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{opt.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-neutral-900 text-white text-sm font-medium tracking-wider uppercase hover:bg-neutral-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? "Traitement en cours…" : "Confirmer la commande"}
        </button>
      </form>

      {/* Order summary */}
      <aside className="lg:w-80 shrink-0">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700">
            Récapitulatif ({itemCount} article{itemCount > 1 ? "s" : ""})
          </h2>

          <div className="divide-y divide-neutral-100 -mx-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 px-1">
                <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden shrink-0">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.nameFr} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-800 truncate">{item.nameFr}</p>
                  <p className="text-xs text-neutral-400">× {item.quantity}</p>
                </div>
                <p className="text-xs font-medium text-neutral-700 shrink-0">
                  {(item.price * item.quantity).toFixed(2)} TND
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm pt-2 border-t border-neutral-200">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Livraison</span>
              {shipping === 0
                ? <span className="text-green-600">Gratuite</span>
                : <span>{shipping.toFixed(2)} TND</span>
              }
            </div>
            {shipping > 0 && (
              <p className="text-xs text-neutral-400">Livraison gratuite dès 200 TND</p>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-neutral-900">
            <span>Total</span>
            <span>{grandTotal.toFixed(2)} TND</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, name, type = "text", required, autoComplete, ...rest }: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        {...rest}
      />
    </div>
  );
}
