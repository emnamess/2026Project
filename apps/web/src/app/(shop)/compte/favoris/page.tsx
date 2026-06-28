import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistButton } from "@/components/shop/wishlist-button";

export const metadata = { title: "Mes favoris — Artisan.TN" };

export default async function FavorisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const userId = session.user.id;

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { displayOrder: "asc" }, take: 1 },
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/compte" className="text-neutral-400 hover:text-neutral-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900">Mes favoris</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{items.length} produit{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <svg className="mx-auto mb-4 text-neutral-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-neutral-500">Vous n'avez pas encore de produits favoris.</p>
          <Link href="/produits" className="mt-4 inline-block text-sm underline text-neutral-600 hover:text-neutral-900">
            Parcourir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
          {items.map(({ product }) => {
            const price = product.priceTnd != null
              ? Number(product.priceTnd)
              : Number(product.priceUsd);
            const imageUrl = product.images[0]?.imageUrl ?? null;

            return (
              <div key={product.id} className="group">
                <Link href={`/produits/${product.slugFr}`} className="block">
                  <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-3">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.nameFr}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-4xl">
                        {product.nameFr.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mb-0.5">{product.category?.nameFr}</p>
                  <p className="text-sm font-medium text-neutral-800 leading-snug line-clamp-2">{product.nameFr}</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{price.toFixed(2)} TND</p>
                </Link>

                <div className="mt-2">
                  <WishlistButton
                    productId={product.id}
                    initialSaved={true}
                    isLoggedIn={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
