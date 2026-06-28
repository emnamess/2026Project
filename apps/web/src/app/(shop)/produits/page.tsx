import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import type { Prisma } from "@/generated/prisma/client";

interface Props {
  searchParams: Promise<{
    categorie?: string;
    q?: string;
    tri?: string;
    prixMin?: string;
    prixMax?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  return { title: q ? `"${q}" — Artisan.TN` : "Tous les produits — Artisan.TN" };
}

function buildOrderBy(tri: string): Prisma.ProductOrderByWithRelationInput {
  switch (tri) {
    case "prix-asc":  return { priceTnd: { sort: "asc",  nulls: "last" } };
    case "prix-desc": return { priceTnd: { sort: "desc", nulls: "last" } };
    case "nom-az":    return { nameFr: "asc" };
    default:          return { createdAt: "desc" };
  }
}

function buildUrl(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return `/produits${qs ? `?${qs}` : ""}`;
}

export default async function ProduitsPage({ searchParams }: Props) {
  const { categorie, q, tri = "nouveautes", prixMin, prixMax } = await searchParams;

  const priceFilter: Prisma.ProductWhereInput = {};
  if (prixMin || prixMax) {
    priceFilter.priceTnd = {
      ...(prixMin ? { gte: Number(prixMin) } : {}),
      ...(prixMax ? { lte: Number(prixMax) } : {}),
    };
  }

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
        ...priceFilter,
      },
      include: {
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
        category: true,
      },
      orderBy: buildOrderBy(tri),
    }),
  ]);

  const activeCategory = categories.find((c) => c.slugFr === categorie);

  // base params without sort/price so links preserve search+category
  const baseParams = {
    categorie,
    q,
    tri: tri !== "nouveautes" ? tri : undefined,
    prixMin,
    prixMax,
  };

  const hasActiveFilters = !!(prixMin || prixMax);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-neutral-900">
            {q ? `Résultats pour "${q}"` : activeCategory?.nameFr ?? "Tous les produits"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} produit{products.length !== 1 ? "s" : ""}
            {q && (
              <Link
                href={buildUrl(baseParams, { q: undefined })}
                className="ml-3 text-neutral-400 hover:text-neutral-700 underline"
              >
                Effacer la recherche
              </Link>
            )}
            {hasActiveFilters && (
              <Link
                href={buildUrl(baseParams, { prixMin: undefined, prixMax: undefined })}
                className="ml-3 text-neutral-400 hover:text-neutral-700 underline"
              >
                Effacer les filtres
              </Link>
            )}
          </p>
        </div>

        {/* Sort (desktop) */}
        <div className="hidden sm:block shrink-0">
          <Suspense>
            <SortSelect current={tri} />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-48 shrink-0 space-y-6">
          {/* Search */}
          <form action="/produits" method="get">
            {categorie && <input type="hidden" name="categorie" value={categorie} />}
            {tri && tri !== "nouveautes" && <input type="hidden" name="tri" value={tri} />}
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

          {/* Price range */}
          <form action="/produits" method="get">
            {categorie && <input type="hidden" name="categorie" value={categorie} />}
            {q && <input type="hidden" name="q" value={q} />}
            {tri && tri !== "nouveautes" && <input type="hidden" name="tri" value={tri} />}
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Prix (TND)</p>
            <div className="flex items-center gap-2 mb-2">
              <input
                name="prixMin"
                type="number"
                min="0"
                defaultValue={prixMin ?? ""}
                placeholder="Min"
                className="w-full h-8 rounded border border-neutral-200 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <span className="text-neutral-300 text-sm">—</span>
              <input
                name="prixMax"
                type="number"
                min="0"
                defaultValue={prixMax ?? ""}
                placeholder="Max"
                className="w-full h-8 rounded border border-neutral-200 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <button
              type="submit"
              className="w-full h-8 bg-neutral-900 text-white text-xs rounded hover:bg-neutral-700 transition-colors"
            >
              Appliquer
            </button>
            {hasActiveFilters && (
              <Link
                href={buildUrl(baseParams, { prixMin: undefined, prixMax: undefined })}
                className="block text-center mt-1.5 text-xs text-neutral-400 hover:text-neutral-700 underline"
              >
                Réinitialiser
              </Link>
            )}
          </form>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Catégories</p>
            <nav className="space-y-1">
              <Link
                href={buildUrl(baseParams, { categorie: undefined })}
                className={`block text-sm py-1 ${!categorie ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                Tout
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildUrl(baseParams, { categorie: c.slugFr ?? undefined })}
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
          {/* Mobile controls */}
          <div className="lg:hidden space-y-3 mb-6">
            <div className="flex gap-2">
              <form action="/produits" method="get" className="flex-1">
                {categorie && <input type="hidden" name="categorie" value={categorie} />}
                {tri && tri !== "nouveautes" && <input type="hidden" name="tri" value={tri} />}
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
              <Suspense>
                <SortSelect current={tri} />
              </Suspense>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <Link
                href={buildUrl(baseParams, { categorie: undefined })}
                className={`shrink-0 px-3 py-1 rounded-full text-sm border ${!categorie ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
              >
                Tout
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildUrl(baseParams, { categorie: c.slugFr ?? undefined })}
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
