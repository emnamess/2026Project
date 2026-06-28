import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: "published" },
    include: {
      images: { orderBy: { displayOrder: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

export async function BestSellers() {
  const products = await getFeaturedProducts();

  return (
    <section className="bg-neutral-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Meilleures Ventes</h2>
          <Link
            href="/produits"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
          >
            Voir tout →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-200 rounded-sm" />
                <div className="h-3 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
