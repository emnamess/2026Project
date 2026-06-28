import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/shop/image-gallery";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductReviews } from "@/components/shop/product-reviews";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slugFr: slug, status: "published" },
  });
  if (!product) return { title: "Produit introuvable" };
  return { title: `${product.nameFr} — Artisan.TN` };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slugFr: slug, status: "published" },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      category: true,
      reviews: { where: { status: "approved" }, select: { rating: true } },
    },
  });

  if (!product) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const [price, wishlistItem] = await Promise.all([
    Promise.resolve(
      product.priceTnd != null ? Number(product.priceTnd) : Number(product.priceUsd)
    ),
    userId
      ? prisma.wishlistItem.findUnique({
          where: { userId_productId: { userId, productId: product.id } },
        })
      : null,
  ]);

  const savedInWishlist = !!wishlistItem;
  const inStock = product.stockQuantity > 0;

  const reviewCount = product.reviews.length;
  const avgRating =
    reviewCount > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8">
        <Link href="/" className="hover:text-neutral-600">Accueil</Link>
        <span>/</span>
        <Link href="/produits" className="hover:text-neutral-600">Produits</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/produits?categorie=${product.category.slugFr}`} className="hover:text-neutral-600">
              {product.category.nameFr}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-700">{product.nameFr}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <ImageGallery images={product.images.map((i) => ({ url: i.imageUrl, alt: i.altTextFr ?? product.nameFr }))} />

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link
              href={`/produits?categorie=${product.category.slugFr}`}
              className="text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-neutral-600 mb-2"
            >
              {product.category.nameFr}
            </Link>
          )}

          <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-neutral-900 leading-snug">
            {product.nameFr}
          </h1>

          <p className="mt-4 text-2xl font-medium text-neutral-900">{price.toFixed(2)} TND</p>

          {reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                  fill={s <= Math.round(avgRating) ? "currentColor" : "none"}
                  stroke="currentColor" strokeWidth="1.5"
                  className={s <= Math.round(avgRating) ? "text-amber-400" : "text-neutral-200"}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="text-xs text-neutral-500">{avgRating.toFixed(1)} ({reviewCount})</span>
            </div>
          )}

          {product.descriptionFr && (
            <div className="mt-6 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {product.descriptionFr}
            </div>
          )}

          <div className="mt-8 space-y-3">
            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-neutral-300"}`} />
              <span className={inStock ? "text-neutral-600" : "text-neutral-400"}>
                {inStock ? `${product.stockQuantity} en stock` : "Rupture de stock"}
              </span>
            </div>

            <AddToCartButton
              inStock={inStock}
              product={{
                id: product.id,
                slugFr: product.slugFr,
                nameFr: product.nameFr,
                price,
                imageUrl: product.images[0]?.imageUrl ?? null,
              }}
            />

            <WishlistButton
              productId={product.id}
              initialSaved={savedInWishlist}
              isLoggedIn={!!userId}
            />
          </div>

          {/* Trust points */}
          <div className="mt-8 pt-8 border-t border-neutral-100 space-y-3">
            {[
              { icon: "🚚", text: "Livraison en 3–5 jours ouvrables" },
              { icon: "📦", text: "Retours acceptés sous 14 jours" },
              { icon: "✋", text: "Fait main par des artisans tunisiens" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-xs text-neutral-500">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
