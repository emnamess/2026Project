import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function FeaturedCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    take: 4,
  });

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Nos Catégories</h2>
        <Link
          href="/produits"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
        >
          Voir tout →
        </Link>
      </div>

      {categories.length === 0 ? (
        /* Skeleton placeholders when no categories exist yet */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-neutral-100 rounded-sm" />
              <div className="h-3 bg-neutral-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produits?categorie=${cat.slugFr ?? ""}`}
              className="group block"
            >
              <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100">
                {cat.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.imageUrl}
                    alt={cat.nameFr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center group-hover:bg-neutral-300 transition-colors">
                    <span className="text-neutral-400 text-3xl font-light select-none">
                      {cat.nameFr.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                {cat.nameFr}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
