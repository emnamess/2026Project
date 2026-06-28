import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/product";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { nameFr: "asc" } }),
  ]);

  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/produits" className="text-neutral-400 hover:text-neutral-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900">Modifier : {product.nameFr}</h1>
      </div>

      <ProductForm
        action={action}
        categories={categories}
        defaultValues={{
          name_fr: product.nameFr,
          name_ar: product.nameAr,
          name_en: product.nameEn,
          description_fr: product.descriptionFr ?? "",
          description_ar: product.descriptionAr ?? "",
          description_en: product.descriptionEn ?? "",
          price: Number(product.priceTnd ?? product.priceUsd),
          stock: product.stockQuantity,
          sku: product.sku,
          categoryId: product.categoryId,
          status: product.status,
          imageUrls: product.images.map((i) => i.imageUrl),
        }}
      />
    </div>
  );
}
