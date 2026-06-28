import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions/product";
import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";

export default async function NouveauProduitPage() {
  const categories = await prisma.category.findMany({ orderBy: { nameFr: "asc" } });

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/produits" className="text-neutral-400 hover:text-neutral-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900">Nouveau produit</h1>
      </div>

      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
