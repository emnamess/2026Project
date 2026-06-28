import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return { title: `Commande ${orderNumber} — Artisan.TN` };
}

export default async function ConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const shippingInfo = (() => {
    try { return JSON.parse(order.notes ?? "{}"); } catch { return {}; }
  })();

  const isCOD = order.paymentMethod === "cash_on_delivery";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-2xl font-light tracking-tight text-neutral-900">Commande confirmée !</h1>
      <p className="mt-2 text-neutral-500 text-sm">
        Merci{shippingInfo.firstName ? `, ${shippingInfo.firstName}` : ""}. Votre commande a bien été reçue.
      </p>

      {/* Order number */}
      <div className="mt-6 inline-block bg-neutral-50 border border-neutral-200 rounded-lg px-6 py-4">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">Numéro de commande</p>
        <p className="mt-1 text-lg font-mono font-medium text-neutral-900">{orderNumber}</p>
      </div>

      {/* Payment info */}
      <div className={`mt-6 rounded-lg p-4 text-sm ${isCOD ? "bg-amber-50 border border-amber-100 text-amber-800" : "bg-blue-50 border border-blue-100 text-blue-800"}`}>
        {isCOD
          ? "💵 Vous paierez à la livraison. Préparez le montant exact si possible."
          : "💳 Votre paiement par carte sera traité séparément."}
      </div>

      {/* Order summary */}
      <div className="mt-8 text-left bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Articles commandés</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div key={item.id} className="px-5 py-3 flex justify-between text-sm">
              <span className="text-neutral-700">
                {item.productName} <span className="text-neutral-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-neutral-900">{Number(item.subtotalUsd).toFixed(2)} TND</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-neutral-200 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{Number(order.totalUsd).toFixed(2)} TND</span>
        </div>
      </div>

      {/* Delivery address */}
      {shippingInfo.street && (
        <div className="mt-4 text-left bg-white border border-neutral-200 rounded-lg px-5 py-4 text-sm text-neutral-600 space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Livraison à</p>
          <p className="font-medium text-neutral-800">{shippingInfo.firstName} {shippingInfo.lastName}</p>
          <p>{shippingInfo.street}</p>
          <p>{shippingInfo.postalCode} {shippingInfo.city}, {shippingInfo.governorate}</p>
          {shippingInfo.phone && <p>{shippingInfo.phone}</p>}
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/produits"
          className="h-11 px-8 bg-neutral-900 text-white text-sm flex items-center justify-center hover:bg-neutral-700 transition-colors"
        >
          Continuer mes achats
        </Link>
        <Link
          href="/"
          className="h-11 px-8 border border-neutral-200 text-neutral-700 text-sm flex items-center justify-center hover:bg-neutral-50 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
