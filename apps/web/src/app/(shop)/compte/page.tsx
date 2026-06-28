import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
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

export const metadata = { title: "Mon compte — Artisan.TN" };

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?redirect=/compte");

  const userId = session.user.id!;

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Mon compte</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-xs text-neutral-400 hover:text-neutral-700 underline">
            Se déconnecter
          </button>
        </form>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-medium">
            {(user?.firstName ?? session.user.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-neutral-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-neutral-500">{session.user.email}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Client depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
        Mes commandes ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center">
          <p className="text-neutral-400 text-sm mb-4">Vous n&apos;avez pas encore passé de commande.</p>
          <Link href="/produits" className="text-sm underline text-neutral-700">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-400">Commande</p>
                  <p className="font-mono text-sm font-medium text-neutral-800">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <p className="text-xs text-neutral-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 divide-y divide-neutral-50">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between text-sm">
                    <span className="text-neutral-700">
                      {item.productName} <span className="text-neutral-400">× {item.quantity}</span>
                    </span>
                    <span className="text-neutral-700">{Number(item.subtotalUsd).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-neutral-100 flex justify-between text-sm font-medium bg-neutral-50">
                <span className="text-neutral-600">Total</span>
                <span className="text-neutral-900">{Number(order.totalUsd).toFixed(2)} TND</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
