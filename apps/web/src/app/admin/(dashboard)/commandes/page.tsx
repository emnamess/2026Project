import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-purple-50 text-purple-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  canceled: "bg-neutral-100 text-neutral-500",
  refunded: "bg-red-50 text-red-600",
};

export default async function CommandesPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Commandes</h1>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-4 py-3 font-medium text-neutral-600">N°</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Client</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Articles</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{o.orderNumber}</td>
                <td className="px-4 py-3 text-neutral-700">{o.user?.email ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{o.items.length}</td>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {Number(o.totalUsd).toFixed(2)} TND
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-neutral-100 text-neutral-600"}`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500 text-xs">
                  {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/commandes/${o.id}`} className="text-xs text-neutral-600 hover:text-neutral-900 underline">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
