import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";

export const metadata = { title: "Tous les produits — Artisan.TN" };

interface Props {
  searchParams: Promise<{ categorie?: string; q?: string }>;
}

export default async function ProduitsPage({ searchParams }: Props) {
  const { categorie, q } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameFr: "asc" } }),
    prisma.product.findMany({
      where: {
        status: "published",
        ...(categorie ? { category: { slugFr: categorie } } : {}),
        ...(q
          ? {
              OR: [
                { nameFr: { contains: q, mode: "insensitive" } },
                { nameEn: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-900">
          {categorie
            ? (categories.find((c) => c.slugFr === categorie)?.nameFr ?? "Produits")
            : "Tous les produits"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{products.length} produit{products.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-48 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Catégories</p>
          <nav className="space-y-1">
            <Link
              href="/produits"
              className={`block text-sm py-1 ${!categorie ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"}`}
            >
              Tout
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/produits?categorie=${c.slugFr}`}
                className={`block text-sm py-1 ${
                  categorie === c.slugFr ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {c.nameFr}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Mobile category scroll */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 lg:hidden">
            <Link
              href="/produits"
              className={`shrink-0 px-3 py-1 rounded-full text-sm border ${
                !categorie ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"
              }`}
            >
              Tout
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/produits?categorie=${c.slugFr}`}
                className={`shrink-0 px-3 py-1 rounded-full text-sm border ${
                  categorie === c.slugFr
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                {c.nameFr}
              </Link>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 text-neutral-400">
              <p className="text-lg">Aucun produit trouvé.</p>
              <Link href="/produits" className="mt-4 inline-block text-sm underline text-neutral-600">
                Voir tous les produits
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
