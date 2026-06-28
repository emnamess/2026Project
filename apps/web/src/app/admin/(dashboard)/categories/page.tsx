import { prisma } from "@/lib/prisma";
import { deleteCategory } from "@/lib/actions/category";
import { CategoryForm } from "@/components/admin/category-form";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nameFr: "asc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Catégories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Image</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Produits</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    Aucune catégorie.
                  </td>
                </tr>
              )}
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded overflow-hidden bg-neutral-100 shrink-0">
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.imageUrl} alt={c.nameFr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.nameFr}</td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{c.slugFr ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{c._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deleteCategory(c.id);
                      }}
                    >
                      <button
                        type="submit"
                        disabled={c._count.products > 0}
                        className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-30 disabled:cursor-not-allowed"
                        title={c._count.products > 0 ? "Catégorie utilisée par des produits" : undefined}
                      >
                        Supprimer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create form */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
            Nouvelle catégorie
          </h2>
          <CategoryForm />
        </div>
      </div>
    </div>
  );
}
