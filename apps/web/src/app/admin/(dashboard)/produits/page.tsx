import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/product";

export default async function ProduitsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Produits</h1>
        <Link
          href="/admin/produits/nouveau"
          className="h-9 px-4 bg-neutral-900 text-white text-sm flex items-center gap-2 hover:bg-neutral-700 transition-colors rounded"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau produit
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Image</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Prix</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                  Aucun produit.{" "}
                  <Link href="/admin/produits/nouveau" className="underline">
                    Créer le premier
                  </Link>
                  .
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  {p.images[0] ? (
                    <div className="w-10 h-10 rounded overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-neutral-100" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">{p.nameFr}</td>
                <td className="px-4 py-3 text-neutral-600">{p.category?.nameFr ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{Number(p.priceTnd ?? p.priceUsd).toFixed(2)} TND</td>
                <td className="px-4 py-3 text-neutral-700">{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      p.status === "published"
                        ? "bg-green-50 text-green-700"
                        : p.status === "archived"
                        ? "bg-neutral-100 text-neutral-500"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {p.status === "published" ? "Publié" : p.status === "archived" ? "Archivé" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                    >
                      Modifier
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteProduct(p.id);
                      }}
                    >
                      <button type="submit" className="text-xs text-red-500 hover:text-red-700 underline">
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
