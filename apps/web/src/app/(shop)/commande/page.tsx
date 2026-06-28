import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata = { title: "Commande — Artisan.TN" };

export default function CommandePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-8">Finaliser la commande</h1>
      <CheckoutForm />
    </div>
  );
}
