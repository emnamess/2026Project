import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/actions/order";
import { OrderStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  canceled: "Annulée",
  refunded: "Remboursée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  canceled: "bg-neutral-100 text-neutral-500 border-neutral-200",
  refunded: "bg-red-50 text-red-600 border-red-200",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
  card: "Carte bancaire",
};

const STATUS_FLOW: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered",
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });

  if (!order) notFound();

  const shipping = (() => {
    try { return JSON.parse(order.notes ?? "{}"); } catch { return {}; }
  })();

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/commandes" className="text-neutral-400 hover:text-neutral-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 font-mono">{order.orderNumber}</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </p>
        </div>
        <span className={`ml-auto inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${STATUS_COLORS[order.status] ?? ""}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + status update */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Articles</p>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{item.productName}</p>
                    <p className="text-xs text-neutral-400">
                      {Number(item.unitPriceUsd).toFixed(2)} TND × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-neutral-900">
                    {Number(item.subtotalUsd).toFixed(2)} TND
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-500">
                <span>Sous-total</span>
                <span>{Number(order.subtotalUsd).toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Livraison</span>
                <span>{Number(order.shippingCostUsd).toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-900 pt-1 border-t border-neutral-200">
                <span>Total</span>
                <span>{Number(order.totalUsd).toFixed(2)} TND</span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {!["canceled", "refunded"].includes(order.status) && (
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Progression</p>
              <div className="flex items-center gap-0">
                {STATUS_FLOW.map((s, i) => {
                  const done = i <= currentStatusIndex;
                  const isLast = i === STATUS_FLOW.length - 1;
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${done ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] text-center leading-tight ${done ? "text-neutral-700" : "text-neutral-400"}`}>
                          {STATUS_LABELS[s]}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentStatusIndex ? "bg-neutral-900" : "bg-neutral-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status update form */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
              Mettre à jour le statut
            </p>
            <form
              action={async (fd: FormData) => {
                "use server";
                const status = fd.get("status") as string;
                const tracking = fd.get("trackingNumber") as string;
                await updateOrderStatus(id, status, tracking || undefined);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      defaultChecked={order.status === s}
                      className="accent-neutral-900"
                    />
                    <span className={order.status === s ? "font-medium text-neutral-900" : "text-neutral-600"}>
                      {STATUS_LABELS[s]}
                    </span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Numéro de suivi <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <input
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  placeholder="TN123456789"
                  className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <button
                type="submit"
                className="h-9 px-5 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-700 transition-colors"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>

        {/* Right: customer + shipping */}
        <div className="space-y-4">
          {/* Payment */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Paiement</p>
            <p className="text-sm text-neutral-700">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            <p className={`text-xs mt-1 font-medium ${order.paymentStatus === "completed" ? "text-green-600" : "text-amber-600"}`}>
              {order.paymentStatus === "completed" ? "Payé" : "En attente"}
            </p>
          </div>

          {/* Customer */}
          {(shipping.email || order.user?.email) && (
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Client</p>
              <p className="text-sm font-medium text-neutral-800">
                {shipping.firstName} {shipping.lastName}
              </p>
              <p className="text-sm text-neutral-500">{shipping.email ?? order.user?.email}</p>
              {shipping.phone && <p className="text-sm text-neutral-500">{shipping.phone}</p>}
            </div>
          )}

          {/* Shipping address */}
          {shipping.street && (
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Adresse de livraison
              </p>
              <address className="not-italic text-sm text-neutral-600 space-y-0.5">
                <p>{shipping.street}</p>
                <p>{shipping.postalCode} {shipping.city}</p>
                <p>{shipping.governorate}</p>
                <p>Tunisie</p>
              </address>
              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400">Suivi</p>
                  <p className="text-sm font-mono text-neutral-700">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-2 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Commandé</span>
              <span>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
            {order.shippedAt && (
              <div className="flex justify-between">
                <span>Expédié</span>
                <span>{new Date(order.shippedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span>Livré</span>
                <span>{new Date(order.deliveredAt).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
