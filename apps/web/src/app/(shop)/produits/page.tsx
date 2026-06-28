import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";

interface Props {
  searchParams: Promise<{ categorie?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  return { title: q ? `"${q}" — Artisan.TN` : "Tous les produits — Artisan.TN" };
}

export default async function ProduitsPage({ searchParams }: Props) {
  const { categorie, q } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameFr: "asc" } }),
    prisma.product.findMany({
      where: {
        status: "published",
        ...(categorie ? { category: { slugFr: categorie } } : {}),
        ...(q ? {
          OR: [
            { nameFr: { contains: q, mode: "insensitive" } },
            { nameEn: { contains: q, mode: "insensitive" } },
            { descriptionFr: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeCategory = categories.find((c) => c.slugFr === categorie);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-900">
          {q
            ? `Résultats pour "${q}"`
            : activeCategory?.nameFr ?? "Tous les produits"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {products.length} produit{products.length !== 1 ? "s" : ""}
          {q && (
            <Link href={`/produits${categorie ? `?categorie=${categorie}` : ""}`} className="ml-3 text-neutral-400 hover:text-neutral-700 underline">
              Effacer la recherche
            </Link>
          )}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-48 shrink-0 space-y-6">
          {/* Search */}
          <form action="/produits" method="get">
            {categorie && <input type="hidden" name="categorie" value={categorie} />}
            <div className="relative">
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Rechercher…"
                className="w-full h-9 pl-8 pr-3 rounded border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </form>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Catégories</p>
            <nav className="space-y-1">
              <Link
                href={q ? `/produits?q=${encodeURIComponent(q)}` : "/produits"}
                className={`block text-sm py-1 ${!categorie ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                Tout
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/produits?categorie=${c.slugFr}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`block text-sm py-1 ${
                    categorie === c.slugFr ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {c.nameFr}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Mobile: search + category pills */}
          <div className="lg:hidden space-y-3 mb-6">
            <form action="/produits" method="get">
              {categorie && <input type="hidden" name="categorie" value={categorie} />}
              <div className="relative">
                <input
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Rechercher un produit…"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </form>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <Link
                href={q ? `/produits?q=${encodeURIComponent(q)}` : "/produits"}
                className={`shrink-0 px-3 py-1 rounded-full text-sm border ${!categorie ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
              >
                Tout
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/produits?categorie=${c.slugFr}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`shrink-0 px-3 py-1 rounded-full text-sm border ${
                    categorie === c.slugFr ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"
                  }`}
                >
                  {c.nameFr}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 text-neutral-400">
              <svg className="mx-auto mb-4 text-neutral-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <p className="text-base text-neutral-600">
                {q ? `Aucun résultat pour "${q}"` : "Aucun produit trouvé."}
              </p>
              <Link href="/produits" className="mt-3 inline-block text-sm underline text-neutral-500">
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
